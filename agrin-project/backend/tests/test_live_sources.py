"""
Integration & Unit Tests for AgriN MVP 2 (Live Data Ingestion)
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
from data_sources.weather import fetch_weather_forecast, classify_weather_category
from data_sources.soil import fetch_soilgrids_profile, classify_usda_texture
from data_sources.satellite import fetch_satellite_ndvi


class TestDataSources(unittest.TestCase):
    """Direct tests for MVP 2 data sources."""

    def test_open_meteo_weather(self):
        res = fetch_weather_forecast(17.3850, 78.4867)
        self.assertIn("status", res)
        self.assertIn("current", res)
        self.assertIn("temperature_c", res["current"])
        self.assertIn("forecast", res)
        self.assertIn("derived_agro_weather", res)

    def test_weather_classification_logic(self):
        # Wet
        self.assertEqual(classify_weather_category(25.0, 50.0, 80.0), "wet")
        # Dry / hot
        self.assertEqual(classify_weather_category(34.0, 2.0, 30.0), "dry")
        # Cool
        self.assertEqual(classify_weather_category(12.0, 10.0, 60.0), "cool")

    def test_soilgrids_profile(self):
        res = fetch_soilgrids_profile(17.3850, 78.4867, timeout_seconds=4)
        self.assertIn("physical_properties", res)
        self.assertIn("sand_percentage", res["physical_properties"])
        self.assertIn("chemical_properties", res)
        self.assertIn("ph_h2o", res["chemical_properties"])

    def test_usda_texture_classification(self):
        # High sand
        self.assertEqual(classify_usda_texture(88.0, 6.0, 6.0), "sandy")
        # High clay
        self.assertEqual(classify_usda_texture(20.0, 45.0, 35.0), "clay")

    def test_satellite_ndvi(self):
        res = fetch_satellite_ndvi(17.3850, 78.4867)
        self.assertEqual(res["status"], "success")
        self.assertIn("spectral_indices", res)
        indices = res["spectral_indices"]
        self.assertIn("ndvi", indices)
        self.assertGreaterEqual(indices["ndvi"], -1.0)
        self.assertLessEqual(indices["ndvi"], 1.0)
        self.assertIn("canopy_cover_class", indices)


class TestMVP2Endpoints(unittest.TestCase):
    """API endpoint tests for MVP 2."""

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_get_weather_endpoint(self):
        res = self.client.get("/api/weather-data?lat=17.3850&lon=78.4867")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("current", data)

    def test_get_soil_endpoint(self):
        res = self.client.get("/api/soil-data?lat=17.3850&lon=78.4867")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("physical_properties", data)

    def test_post_advisory_with_live_coordinates(self):
        payload = {
            "latitude": 17.3850,
            "longitude": 78.4867,
            "location": "Telangana Deccan Plateau"
        }
        res = self.client.post("/advisory", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["mode"], "live_data_ingestion")
        self.assertIn("live_telemetry", data)
        self.assertIn("weather", data["live_telemetry"])
        self.assertIn("soil", data["live_telemetry"])
        self.assertIn("satellite_ndvi", data["live_telemetry"])
        self.assertGreaterEqual(data["recommendation_count"], 2)

    def test_post_advisory_backwards_compatibility(self):
        payload = {
            "soil_type": "clay",
            "weather": "wet",
            "season": "kharif"
        }
        res = self.client.post("/advisory", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["mode"], "manual")
        self.assertIsNone(data["live_telemetry"])

    def test_invalid_coordinates(self):
        payload = {
            "latitude": 999.0,
            "longitude": 78.4867
        }
        res = self.client.post("/advisory", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()["error_code"], "INVALID_COORDINATES")


if __name__ == "__main__":
    unittest.main()
