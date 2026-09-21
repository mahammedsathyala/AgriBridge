"""
Integration & Unit Tests for AgriN MVP 4 (LLM Multilingual Advisory Localization)
"""

import sys
import os
import unittest
import json

# Add backend root to path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from engines.llm_advisory import llm_localizer


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


if __name__ == "__main__":
    unittest.main()
