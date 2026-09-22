"""
AgriN: AI-Powered Interoperable Agricultural Advisory Platform
-------------------------------------------------------------
Flask backend server - AgriBridge Integrated Backend API (v1.0.0)
"""

import sys
import os
from datetime import datetime, timezone

# Ensure backend directory is in Python path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models import db, FarmProfile, SensorTelemetry
from routes import (
    farm_bp,
    advisory_bp,
    diagnose_bp,
    soil_data_bp,
    weather_data_bp,
    localize_bp,
    exchange_bp,
    sensor_bp,
    regenerative_bp
)


def create_app(config_class=Config) -> Flask:
    """Application factory for AgriN backend."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize SQLite Database
    db.init_app(app)

    # Configure CORS for development and production domains
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://mahammedsathyala.github.io"
    ]
    env_origins = os.getenv("CORS_ORIGINS", "")
    if env_origins:
        for origin in env_origins.split(","):
            cleaned = origin.strip().rstrip("/")
            if cleaned and cleaned not in allowed_origins:
                allowed_origins.append(cleaned)

    CORS(
        app,
        resources={
            r"/api/*": {"origins": allowed_origins},
            r"/*": {"origins": allowed_origins}
        },
        supports_credentials=True
    )

    # Initialize tables and seed default farm profile and ESP32 telemetry on first run
    with app.app_context():
        db.create_all()
        if not FarmProfile.query.first():
            default_farm = FarmProfile(
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
            db.session.add(default_farm)
            db.session.commit()

        if not SensorTelemetry.query.first():
            default_sensor = SensorTelemetry(
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
            db.session.add(default_sensor)
            db.session.commit()

    # Register blueprints
    app.register_blueprint(farm_bp)
    app.register_blueprint(advisory_bp)
    app.register_blueprint(weather_data_bp)
    app.register_blueprint(soil_data_bp)
    app.register_blueprint(diagnose_bp)
    app.register_blueprint(localize_bp)
    app.register_blueprint(exchange_bp)
    app.register_blueprint(sensor_bp)
    app.register_blueprint(regenerative_bp)

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "name": "AgriN Agricultural Advisory API",
            "version": "1.0.0",
            "status": "online",
            "pilot_farm": {
                "name": "Sathyala Farm",
                "location": "Kurnool, Andhra Pradesh",
                "crop": "Groundnut Kadiri-6",
                "coordinates": {"lat": 15.8281, "lng": 78.0373}
            },
            "active_v1_endpoints": {
                "health": "/api/v1/health (GET)",
                "advisories": "/api/v1/advisories (POST)",
                "diagnoses": "/api/v1/diagnoses (POST - leaf image upload)",
                "localizations": "/api/v1/localizations (POST - vernacular synthesis)",
                "sensor_telemetry": "/api/v1/sensors/telemetry (POST)",
                "sensor_latest": "/api/v1/farms/sathyala-farm-001/sensors/latest (GET)",
                "sensor_history": "/api/v1/farms/sathyala-farm-001/sensors/history (GET)",
                "weather": "/api/v1/weather?lat=...&lon=... (GET)",
                "soil": "/api/v1/soil?lat=...&lon=... (GET)",
                "satellite": "/api/v1/satellite?lat=...&lon=... (GET)",
                "regenerative": "/api/v1/regenerative/assessment (GET)",
                "farm": "/api/v1/farm (GET, POST)"
            }
        }), 200

    @app.route("/api/v1/health", methods=["GET"])
    def v1_health():
        """Backend health check endpoint with ISO-8601 UTC timestamp."""
        return jsonify({
            "status": "success",
            "service": "AgriN backend",
            "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 200

    @app.route("/health", methods=["GET"])
    def legacy_health():
        """Legacy health check endpoint."""
        return jsonify({
            "status": "healthy",
            "service": "AgriN backend",
            "stage": "MVP 4",
            "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }), 200

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({
            "status": "error",
            "code": "BAD_REQUEST",
            "message": getattr(e, 'description', "Bad request payload."),
            "request_id": f"req-err-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
            "details": {}
        }), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "status": "error",
            "code": "NOT_FOUND",
            "error_code": "NOT_FOUND",
            "message": "The requested endpoint was not found on AgriN API server.",
            "request_id": f"req-err-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
            "details": {"path": request.path}
        }), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({
            "status": "error",
            "code": "INTERNAL_SERVER_ERROR",
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected internal server error occurred.",
            "request_id": f"req-err-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
            "details": {}
        }), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    reloader = os.getenv("RELOADER", "False").lower() in ("true", "1", "yes")
    print(f"Starting AgriN Backend on http://127.0.0.1:{port} (Debug: {debug}, Reloader: {reloader})...")
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=reloader)
