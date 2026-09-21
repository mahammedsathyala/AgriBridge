"""
Unit and Integration Tests for AgriN MVP 1
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
from engines.advisory_engine import get_rule_based_advisory


class TestAdvisoryEngine(unittest.TestCase):
    """Direct tests for the static rules advisory engine."""

    def test_sandy_dry_kharif_recommendation(self):
        result = get_rule_based_advisory(
            soil_type="sandy",
            weather="dry",
            season="kharif",
            location="Rajasthan/Telangana Border"
        )
        self.assertIn("recommendations", result)
        self.assertGreaterEqual(result["recommendation_count"], 2)
        top_crop = result["recommendations"][0]["crop"]
        # Pearl millet is optimal for sandy + dry + kharif
        self.assertIn("Pearl Millet", top_crop)
        self.assertIn("soil_regeneration_practices", result["recommendations"][0])
        self.assertIn("general_regenerative_guidelines", result)

    def test_black_clay_rabi_recommendation(self):
        result = get_rule_based_advisory(
            soil_type="black",
            weather="dry",
            season="rabi"
        )
        self.assertIn("recommendations", result)
        crops = [r["crop"] for r in result["recommendations"]]
        # Chickpea / Sorghum / Mustard should appear for rabi cool/dry
        has_expected = any("Chickpea" in c or "Mustard" in c or "Sorghum" in c for c in crops)
        self.assertTrue(has_expected)

    def test_zaid_summer_recommendation(self):
        result = get_rule_based_advisory(
            soil_type="loam",
            weather="moderate",
            season="zaid"
        )
        crops = [r["crop"] for r in result["recommendations"]]
        has_catch_crop = any("Green Gram" in c or "Pearl Millet" in c or "Dhaincha" in c for c in crops)
        self.assertTrue(has_catch_crop)


class TestFlaskEndpoints(unittest.TestCase):
    """Flask integration tests for /advisory and core routes."""

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_home_and_health(self):
        res_home = self.client.get("/")
        self.assertEqual(res_home.status_code, 200)
        data_home = res_home.get_json()
        self.assertEqual(data_home["status"], "online")

        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.get_json()["status"], "healthy")

    def test_advisory_get_docs(self):
        res = self.client.get("/advisory")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("expected_payload", data)

    def test_advisory_post_missing_fields(self):
        res = self.client.post(
            "/advisory",
            data=json.dumps({"soil_type": "sandy"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data["status"], "error")
        self.assertEqual(data["error_code"], "MISSING_REQUIRED_FIELDS")

    def test_advisory_post_valid_payload(self):
        payload = {
            "soil_type": "sandy",
            "weather": "dry",
            "season": "kharif",
            "location": "Semi-Arid Zone"
        }
        res = self.client.post(
            "/advisory",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("recommendations", data)
        self.assertGreaterEqual(len(data["recommendations"]), 2)
        # Check recommendation structure
        first_rec = data["recommendations"][0]
        self.assertIn("crop", first_rec)
        self.assertIn("category", first_rec)
        self.assertIn("suitability_score", first_rec)
        self.assertIn("companion_crop", first_rec)
        self.assertIn("soil_regeneration_practices", first_rec)
        self.assertIn("water_management", first_rec)
        self.assertIn("expected_soil_benefits", first_rec)
        self.assertIn("rationale", first_rec)

    def test_api_advisory_alias(self):
        payload = {
            "soil_type": "clay",
            "weather": "wet",
            "season": "kharif"
        }
        res = self.client.post(
            "/api/advisory",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["status"], "success")

    def test_active_routes_and_stubs(self):
        # Diagnose is now active in MVP 3 (requires image payload, so returns 400 without payload)
        res_diag = self.client.post("/api/diagnose")
        self.assertEqual(res_diag.status_code, 400)
        # Soil data is active in MVP 2 (requires lat/lon, so returns 400 without params)
        res_soil = self.client.get("/api/soil-data")
        self.assertEqual(res_soil.status_code, 400)


if __name__ == "__main__":
    unittest.main()
