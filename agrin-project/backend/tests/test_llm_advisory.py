"""
Integration & Unit Tests for AgriN MVP 4 (LLM Multilingual Advisory Localization & Claude Integration)
"""

import sys
import os
import unittest
import json
from unittest.mock import MagicMock, patch

# Add backend root to path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from engines.llm_advisory import LLMAdvisoryLocalizer, llm_localizer


class TestLLMLocalization(unittest.TestCase):
    """Test suite for Anthropic Claude / Vernacular LLM advisory localizer."""

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_direct_engine_telugu(self):
        sample_advisory = {
            "recommendations": [
                {
                    "crop": "Pearl Millet (Bajra)",
                    "companion_crop": "Cowpea",
                    "soil_regeneration_practices": ["Residue retention mulching"]
                }
            ]
        }
        res = llm_localizer.generate_plain_advisory(
            advisory_data=sample_advisory,
            language="te"
        )
        self.assertEqual(res["status"], "success")
        self.assertIn("audio_script", res)
        self.assertIn("urgent_actions", res)
        # Verify Telugu script presence
        self.assertIn("రైతు", res["audio_script"])

    def test_direct_engine_hindi(self):
        sample_advisory = {
            "recommendations": [
                {
                    "crop": "Chickpea",
                    "companion_crop": "Mustard",
                    "soil_regeneration_practices": ["Zero tillage"]
                }
            ]
        }
        res = llm_localizer.generate_plain_advisory(
            advisory_data=sample_advisory,
            language="hi"
        )
        self.assertEqual(res["status"], "success")
        self.assertIn("किसान", res["audio_script"])

    def test_direct_engine_with_disease(self):
        sample_diag = {
            "primary_diagnosis": {
                "condition": "Tikka Leaf Spot",
                "severity": "Moderate"
            },
            "organic_treatment_plan": [
                "5% Neem Seed Kernel Extract (NSKE) spray"
            ]
        }
        res = llm_localizer.generate_plain_advisory(
            diagnosis_data=sample_diag,
            language="en"
        )
        self.assertEqual(res["status"], "success")
        self.assertIn("Tikka Leaf Spot", res["audio_script"])
        self.assertIn("Neem", res["audio_script"])

    def test_get_localize_docs(self):
        res = self.client.get("/localize")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("supported_languages", data)
        self.assertIn("te", data["supported_languages"])

    def test_post_localize_missing_data(self):
        res = self.client.post("/localize", json={"language": "en"})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()["error_code"], "MISSING_SOURCE_DATA")

    def test_post_localize_endpoint(self):
        payload = {
            "language": "te",
            "advisory_data": {
                "recommendations": [
                    {
                        "crop": "Groundnut",
                        "companion_crop": "Pigeon Pea",
                        "soil_regeneration_practices": ["Vermicompost biochar application"]
                    }
                ]
            },
            "farmer_profile": {
                "farmer_name": "Sathyala",
                "land_acres": 3
            }
        }
        res = self.client.post("/localize", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("audio_script", data)
        self.assertIn("urgent_actions", data)

    def test_combined_advisory_with_localize_flag(self):
        payload = {
            "soil_type": "sandy",
            "weather": "dry",
            "season": "kharif",
            "localize": True,
            "language": "te"
        }
        res = self.client.post("/advisory", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("localized_farmer_guidance", data)
        guidance = data["localized_farmer_guidance"]
        self.assertIsNotNone(guidance)
        self.assertIn("audio_script", guidance)
        self.assertIn("రైతు", guidance["audio_script"])

    def test_claude_live_success_mock(self):
        """Test Claude LIVE response normalization when Anthropic API succeeds."""
        localizer = LLMAdvisoryLocalizer(api_key="sk-ant-test-mock-key-1234567890")
        
        # Mock the anthropic client messages create
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [
            MagicMock(text=json.dumps({
                "answer": "Apply 5% Neem Seed Kernel Extract immediately to treat Tikka leaf spot on your Groundnut crop.",
                "audio_script": "Farmer friend, your groundnut crop shows early leaf spot. Apply neem extract today.",
                "urgent_actions": [
                    "Spray 5% NSKE or Trichoderma viride foliar spray",
                    "Ensure adequate furrow drainage after tomorrow's forecast rain"
                ],
                "risk_bulletin": "Weather is warm and humid, creating high fungal spore pressure.",
                "why_this_works": "Neem azadirachtin halts fungal mycelial proliferation without harming soil biology."
            }))
        ]
        mock_client.messages.create.return_value = mock_response
        localizer.client = mock_client

        result = localizer.generate_plain_advisory(
            advisory_data={"crop": "Groundnut", "weather": "warm_humid"},
            language="en",
            query="My groundnut leaves are turning yellow. What should I do?"
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["source_status"], "LIVE_LLM")
        self.assertEqual(result["source"], "anthropic_claude")
        self.assertEqual(result["status_label"], "LIVE")
        self.assertIn("Neem Seed Kernel Extract", result["answer"])
        self.assertEqual(len(result["urgent_actions"]), 2)
        self.assertIn("Neem azadirachtin", result["why_this_works"])

    def test_claude_missing_api_key(self):
        """Test unconfigured API key correctly reports NOT_CONFIGURED without claiming Claude was used."""
        localizer = LLMAdvisoryLocalizer(api_key="")
        localizer.api_key = ""
        localizer.client = None

        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": ""}):
            result = localizer.generate_plain_advisory(
                advisory_data={"crop": "Groundnut"},
                language="en",
                query="What should I spray today?"
            )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["source_status"], "LOCAL_SYNTHESIS")
        self.assertEqual(result["source"], "local_rule_engine")
        self.assertEqual(result["status_label"], "NOT_CONFIGURED")
        self.assertIn("AgriN Multilingual Agronomic Vernacular Engine", result["engine"])

    def test_claude_api_failure_fallback(self):
        """Test Claude API failure gracefully falls back to local rule engine without crashing."""
        localizer = LLMAdvisoryLocalizer(api_key="sk-ant-test-mock-key")
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = Exception("Credit balance is too low")
        localizer.client = mock_client

        result = localizer.generate_plain_advisory(
            advisory_data={"crop": "Groundnut"},
            language="en",
            query="What should I spray today?"
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["source_status"], "LOCAL_SYNTHESIS")
        self.assertEqual(result["source"], "local_rule_engine")
        self.assertEqual(result["status_label"], "FALLBACK")
        self.assertIn("urgent_actions", result)

    def test_v1_advisory_post_with_query_and_telemetry(self):
        """Test POST /api/v1/advisories with full interactive question & farm coordinates."""
        payload = {
            "farm_id": "sathyala-farm-001",
            "crop": "Groundnut",
            "variety": "Kadiri-6",
            "crop_stage": "flowering",
            "latitude": 15.8281,
            "longitude": 78.0373,
            "query": "My groundnut leaves are turning yellow. Based on my current farm data, what should I check today?",
            "language": "en"
        }
        res = self.client.post("/api/v1/advisories", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("data", data)
        self.assertIn("answer", data)
        self.assertIn("source", data)
        self.assertIn("live_telemetry", data)
        self.assertIn("weather", data["live_telemetry"])
        self.assertIn("soil", data["live_telemetry"])
        self.assertIn("satellite_ndvi", data["live_telemetry"])


if __name__ == "__main__":
    unittest.main()
