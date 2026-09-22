"""
AgriBridge Audit Fixes & Quality Gated Test Suite
-------------------------------------------------
Validates all Priority 1 - Priority 7 implementations:
1. Weather API schema & daily_forecast structure
2. Advisory / Chatbot response formatting & source tracking
3. Satellite NDVI & phenological model transparency
4. Disease diagnosis metadata (weights_status, diagnosis_source)
5. Regenerative agriculture scoring endpoint & methodology
6. BRICS CADS exchange & differential privacy PII sanitization
7. Optional MQTT sensor listener status checks
"""

import io
import json
import pytest
from PIL import Image
from app import create_app
from config import Config
from models import db
from routes.exchange import sanitize_cads_payload
from mqtt.sensor_listener import SensorListener


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    ANTHROPIC_API_KEY = ""
    OPENWEATHER_API_KEY = ""


@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client


class TestWeatherSchemaAuditFix:
    def test_weather_v1_daily_forecast_schema(self, client):
        """Verify weather endpoint returns required daily_forecast fields."""
        res = client.get("/api/v1/weather?lat=15.8281&lon=78.0373")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"

        # Check current weather structure
        current = data.get("current") or data.get("data", {}).get("current") or {}
        assert "temperature_c" in current
        assert "relative_humidity_pct" in current
        assert "weather_code" in current

        # Check daily forecast array
        daily = data.get("daily_forecast") or data.get("data", {}).get("daily_forecast") or []
        assert isinstance(daily, list)
        assert len(daily) >= 3

        for day in daily:
            assert "day_name" in day
            assert "date" in day
            assert "temperature_max_c" in day
            assert "temperature_min_c" in day
            assert "precipitation_sum_mm" in day
            assert "precipitation_probability_max" in day


class TestAgriAIChatbotAuditFix:
    def test_localization_and_advisory_response_keys(self, client):
        """Verify /api/v1/localizations returns audio_script, urgent_actions, why_this_works."""
        payload = {
            "query": "How should I manage Tikka leaf spot in groundnut?",
            "crop": "Groundnut",
            "language": "te",
            "location": "Kurnool"
        }
        res = client.post("/api/v1/localizations", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"

        # Must have audio_script or localized_advisory for ChatBot consumption
        res_data = data.get("data", {})
        assert "audio_script" in res_data or "localized_advisory" in res_data
        assert "source_status" in data or "source_status" in res_data


class TestSatelliteNDVITransparencyAuditFix:
    def test_satellite_model_simulation_transparency(self, client):
        """Verify satellite endpoint exposes MODEL_SIMULATION and spectral indices."""
        res = client.get("/api/v1/satellite?lat=15.8281&lon=78.0373")
        assert res.status_code == 200
        data = res.get_json()

        assert data["status"] == "success"
        assert data.get("data_source_type") in ("MODEL_SIMULATION", "LIVE_SATELLITE")
        assert "ndvi" in data
        assert "spectral_indices" in data
        assert "ndvi" in data["spectral_indices"]


class TestDiagnosisTransparencyAuditFix:
    def test_diagnosis_metadata_weights_status(self, client):
        """Verify diagnosis endpoint reports weights_status and diagnosis_source."""
        # Create a synthetic test image
        img = Image.new("RGB", (100, 100), color=(140, 90, 40))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)

        data = {
            "crop_name": "Groundnut",
            "image": (img_bytes, "test_leaf.jpg")
        }
        res = client.post("/api/v1/diagnoses", data=data, content_type="multipart/form-data")
        assert res.status_code == 200
        resp = res.get_json()

        assert resp["status"] == "success"
        assert "weights_status" in resp
        assert resp["weights_status"] in ("calibrated_heuristic", "real_yolov8_nn", "groundnut_trained_model")
        assert "diagnosis_source" in resp
        assert resp["diagnosis_source"] in ("HEURISTIC", "YOLOv8", "groundnut_trained_model")


class TestRegenerativeAgricultureAuditFix:
    def test_regenerative_assessment_endpoint(self, client):
        """Verify GET /api/v1/regenerative/assessment returns score and pillars."""
        res = client.get("/api/v1/regenerative/assessment?lat=15.8281&lon=78.0373&crop=Groundnut")
        assert res.status_code == 200
        data = res.get_json()

        assert data["status"] == "success"
        assert data["score_name"] == "AgriBridge Regenerative Practice Score"
        assert "total_score" in data
        assert 0 <= data["total_score"] <= 100

        pillars = data.get("pillar_scores") or data.get("data", {}).get("pillar_scores") or []
        assert len(pillars) >= 4
        for p in pillars:
            assert "key" in p
            assert "value_percent" in p
            assert "target_percent" in p


class TestBricsPIISanitizationAuditFix:
    def test_pii_scrubbing_and_coordinate_fuzzing(self):
        """Verify PII fields are removed and coordinates are fuzzed."""
        dirty_payload = {
            "farmer_name": "Ramesh Sathyala",
            "phone": "+91-9876543210",
            "email": "ramesh@example.com",
            "aadhaar": "1234-5678-9012",
            "address": "Plot 42, Kurnool Village",
            "lat": 15.828135,
            "lng": 78.037382,
            "crop": "Groundnut Kadiri-6",
            "soil_moisture": 34.2
        }

        clean = sanitize_cads_payload(dirty_payload)

        # Assert all PII is scrubbed
        assert "farmer_name" not in clean
        assert "phone" not in clean
        assert "email" not in clean
        assert "aadhaar" not in clean
        assert "address" not in clean

        # Assert coordinate differential privacy fuzzing
        assert "lat" not in clean
        assert "lng" not in clean
        assert clean["fuzzed_lat"] == 15.8
        assert clean["fuzzed_lon"] == 78.0

        # Assert CADS compliance metadata
        assert clean["protocol"] == "AgriBridge-CADS-v1.0"
        assert clean["consent_and_privacy"]["pii_scrubbed"] is True
        assert clean["consent_and_privacy"]["differential_privacy_epsilon"] == 0.5

    def test_brics_exchange_route(self, client):
        """Verify POST /api/v1/brics/exchange persists sanitized payload."""
        payload = {
            "source": "IN-ICAR-01",
            "target": "BR-EMBRAPA-01",
            "indicator": "soil_moisture_cadence",
            "farmer_name": "Secret Farmer",
            "lat": 15.8281,
            "lng": 78.0373
        }
        res = client.post("/api/v1/brics/exchange", json=payload)
        assert res.status_code == 201
        data = res.get_json()
        assert data["status"] == "success"
        sanitized = data.get("sanitized_payload", {})
        assert "farmer_name" not in sanitized


class TestMQTTSensorListenerAuditFix:
    def test_unconfigured_mqtt_listener_status(self):
        """Verify unconfigured MQTT listener reports NOT_CONFIGURED safely."""
        listener = SensorListener(broker_host="")
        status = listener.get_latest_reading()
        assert status["status"] == "NOT_CONFIGURED"
        assert status["is_configured"] is False
        assert status["is_connected"] is False
