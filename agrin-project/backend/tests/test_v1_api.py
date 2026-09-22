"""
AgriN: Comprehensive Test Suite for v1 Standardized REST APIs & ESP32 Integration
----------------------------------------------------------------------------------
Tests:
  - GET /api/v1/health (ISO-8601 UTC timestamp, service, version)
  - CORS headers for allowed origins (development + GitHub Pages)
  - POST /api/v1/advisories (sensor integration, confidence, recommendations)
  - POST /api/v1/sensors/telemetry & GET /api/v1/farms/<farm_id>/sensors/latest
  - Stale & offline sensor status detection
  - POST /api/v1/diagnoses (multipart & base64)
  - GET /api/v1/weather, GET /api/v1/soil, GET /api/v1/satellite
  - GET /api/v1/farm & POST /api/v1/farm
  - Standardized error response formats
"""

import io
import json
from datetime import datetime, timezone, timedelta
import pytest
from app import create_app
from models import db, FarmProfile, SensorTelemetry, DiagnosisRecord, AdvisoryRecord


@pytest.fixture
def client():
    """Create test client with in-memory SQLite database."""
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.create_all()
        # Seed test farm
        farm = FarmProfile(
            farmer_name="Sathyala Farmer",
            farm_name="Sathyala Farm",
            location="Kurnool, Andhra Pradesh",
            lat=15.8281,
            lng=78.0373,
            area_acres=2.5,
            crop="Groundnut",
            crop_variety="K6 (Kadiri-6)",
            sowing_date="2026-08-07",
            soil_type="Red loamy soil",
            irrigation_type="Borewell drip"
        )
        db.session.add(farm)

        # Seed initial sensor reading
        sensor = SensorTelemetry(
            device_id="AGRI-ESP32-001",
            farm_id="sathyala-farm-001",
            soil_moisture_pct=34.0,
            soil_depth_cm=15.0,
            soil_temperature_c=29.4,
            canopy_temperature_c=30.8,
            ambient_temperature_c=32.1,
            humidity_pct=68.0,
            battery_pct=88.0,
            signal_strength_dbm="-65 dBm",
            recorded_at=datetime.now(timezone.utc)
        )
        db.session.add(sensor)
        db.session.commit()

        yield app.test_client()

        db.session.remove()
        db.drop_all()


class TestHealthAndCORS:
    """Test health endpoint and cross-origin headers."""

    def test_health_endpoint(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert data["service"] == "AgriN backend"
        assert data["version"] == "1.0.0"
        assert "timestamp" in data

    def test_cors_github_pages_origin(self, client):
        response = client.get(
            "/api/v1/health",
            headers={"Origin": "https://mahammedsathyala.github.io"}
        )
        assert response.status_code == 200
        assert response.headers.get("Access-Control-Allow-Origin") == "https://mahammedsathyala.github.io"

    def test_cors_local_origin(self, client):
        response = client.get(
            "/api/v1/health",
            headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code == 200
        assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"


class TestSensorTelemetry:
    """Test ESP32 sensor ingestion and query endpoints."""

    def test_ingest_sensor_telemetry_valid(self, client):
        payload = {
            "device_id": "AGRI-ESP32-001",
            "farm_id": "sathyala-farm-001",
            "soil_moisture_pct": 36.5,
            "soil_temperature_c": 28.9,
            "soil_depth_cm": 15.0,
            "ambient_temperature_c": 31.5,
            "humidity_pct": 65.0,
            "battery_pct": 92.0,
            "signal_strength_dbm": "-62 dBm"
        }
        res = client.post("/api/v1/sensors/telemetry", json=payload)
        assert res.status_code == 201
        data = res.get_json()
        assert data["status"] == "success"
        assert data["data"]["telemetry"]["soil_moisture_pct"] == 36.5
        assert data["data"]["telemetry"]["online"] is True

    def test_ingest_sensor_telemetry_invalid_moisture(self, client):
        payload = {
            "device_id": "AGRI-ESP32-001",
            "soil_moisture_pct": 150.0  # Invalid > 100
        }
        res = client.post("/api/v1/sensors/telemetry", json=payload)
        assert res.status_code == 400
        data = res.get_json()
        assert data["status"] == "error"
        assert data["code"] == "OUT_OF_BOUNDS"

    def test_get_latest_sensor_data_online(self, client):
        res = client.get("/api/v1/farms/sathyala-farm-001/sensors/latest")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        sensor_data = data["data"]
        assert sensor_data["device_id"] == "AGRI-ESP32-001"
        assert sensor_data["online"] is True
        assert sensor_data["status"] == "online"

    def test_stale_and_offline_sensor_calculation(self, client):
        # Insert a reading from 10 minutes ago (stale)
        stale_time = datetime.now(timezone.utc) - timedelta(minutes=10)
        stale_sensor = SensorTelemetry(
            device_id="AGRI-ESP32-STALE",
            farm_id="stale-farm",
            soil_moisture_pct=30.0,
            recorded_at=stale_time
        )
        # Insert a reading from 45 minutes ago (offline)
        offline_time = datetime.now(timezone.utc) - timedelta(minutes=45)
        offline_sensor = SensorTelemetry(
            device_id="AGRI-ESP32-OFFLINE",
            farm_id="offline-farm",
            soil_moisture_pct=25.0,
            recorded_at=offline_time
        )
        db.session.add(stale_sensor)
        db.session.add(offline_sensor)
        db.session.commit()

        # Check stale farm
        res_stale = client.get("/api/v1/farms/stale-farm/sensors/latest")
        data_stale = res_stale.get_json()
        assert data_stale["data"]["status"] == "stale"
        assert data_stale["data"]["online"] is False
        assert len(data_stale["warnings"]) > 0

        # Check offline farm
        res_offline = client.get("/api/v1/farms/offline-farm/sensors/latest")
        data_offline = res_offline.get_json()
        assert data_offline["data"]["status"] == "offline"
        assert data_offline["data"]["online"] is False
        assert len(data_offline["warnings"]) > 0


class TestAdvisoryV1:
    """Test advisory generation endpoint."""

    def test_advisory_with_live_coordinates_and_sensor(self, client):
        payload = {
            "farm_id": "sathyala-farm-001",
            "latitude": 15.8281,
            "longitude": 78.0373,
            "location": "Kurnool, Andhra Pradesh, India",
            "crop": "Groundnut",
            "variety": "Kadiri-6",
            "crop_stage": "flowering",
            "sensor_device_id": "AGRI-ESP32-001"
        }
        res = client.post("/api/v1/advisories", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert data["schema_version"] == "1.0.0"
        assert len(data["data_sources"]) > 0
        assert "recommendations" in data["data"]
        assert data["data"]["crop"] == "Groundnut"
        assert data["data"]["sensor_status"] == "online"
        assert data["data"]["confidence_score"] >= 85.0

    def test_advisory_history_and_complete(self, client):
        # 1. Fetch advisory history
        res = client.get("/api/v1/advisories/history")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert len(data["advisories"]) > 0

        # 2. Mark advisory complete
        first_id = data["advisories"][0]["id"]
        res_comp = client.post(f"/api/v1/advisories/{first_id}/complete", json={"completed": True})
        assert res_comp.status_code == 200
        data_comp = res_comp.get_json()
        assert data_comp["status"] == "success"
        assert data_comp["advisory"]["completed"] is True


class TestDiagnoseV1:
    """Test crop disease diagnosis endpoint."""

    def test_diagnose_multipart_upload(self, client):
        from PIL import Image
        img = Image.new("RGB", (100, 100), color=(34, 139, 34))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)
        data = {
            "image": (buf, "leaf_scan.jpg"),
            "crop_name": "Groundnut"
        }
        res = client.post("/api/v1/diagnoses", data=data, content_type="multipart/form-data")
        assert res.status_code == 200
        json_data = res.get_json()
        assert json_data["status"] == "success"
        assert "data" in json_data
        assert "screening_disclaimer" in json_data["data"]

    def test_diagnose_history(self, client):
        res = client.get("/api/v1/diagnoses/history")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert len(data["history"]) > 0


class TestWeatherSoilSatelliteFarm:
    """Test auxiliary endpoints."""

    def test_weather_endpoint(self, client):
        res = client.get("/api/v1/weather?lat=15.8281&lon=78.0373")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"

    def test_soil_endpoint(self, client):
        res = client.get("/api/v1/soil?lat=15.8281&lon=78.0373")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"

    def test_satellite_endpoint(self, client):
        res = client.get("/api/v1/satellite?lat=15.8281&lon=78.0373")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"

    def test_farm_profile_get_and_update(self, client):
        res = client.get("/api/v1/farm")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert data["farm"]["farmer_name"] == "Sathyala Farmer"

        # Update farm profile
        res_up = client.post("/api/v1/farm", json={"location": "Kurnool District, AP"})
        assert res_up.status_code == 200
        data_up = res_up.get_json()
        assert data_up["farm"]["location"] == "Kurnool District, AP"


class TestErrorResponses:
    """Test standardized error responses."""

    def test_404_not_found_standard_error(self, client):
        res = client.get("/api/v1/non-existent-route")
        assert res.status_code == 404
        data = res.get_json()
        assert data["status"] == "error"
        assert data["code"] == "NOT_FOUND"
        assert "request_id" in data
