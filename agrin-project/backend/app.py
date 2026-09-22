"""
AgriN: AI-Powered Interoperable Agricultural Advisory Platform
-------------------------------------------------------------
Flask backend server - MVP 4: Multilingual Anthropic Claude Localization Active
"""

import sys
import os

# Ensure backend directory is in Python path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db, FarmProfile
from routes import farm_bp, advisory_bp, diagnose_bp, soil_data_bp, weather_data_bp, localize_bp, exchange_bp


def create_app(config_class=Config) -> Flask:
    """Application factory for AgriN backend."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize SQLite Database
    db.init_app(app)

    # Enable Cross-Origin Resource Sharing for frontend/mobile clients
    CORS(app)

    # Initialize tables and seed default farm profile on first run
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

    # Register blueprints
    app.register_blueprint(farm_bp)
    app.register_blueprint(advisory_bp)
    app.register_blueprint(weather_data_bp)
    app.register_blueprint(soil_data_bp)
    app.register_blueprint(diagnose_bp)
    app.register_blueprint(localize_bp)
    app.register_blueprint(exchange_bp)

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "name": "AgriN Agricultural Advisory API",
            "version": "4.0.0-mvp4",
            "theme": "Track 4: AgriN & Regenerative Agricultural Intelligence (BRICS Cooperation)",
            "status": "online",
            "stage": "MVP 4: Multilingual LLM Localization Active",
            "active_endpoints": {
                "advisory": "/advisory (POST - Live coordinates or manual, optional 'localize': true)",
                "diagnose": "/diagnose (POST - Leaf image upload for YOLOv8 crop disease detection)",
                "localize": "/localize (POST - Multilingual plain-language farmer voice/text synthesis)",
                "weather_data": "/api/weather-data?lat=...&lon=... (GET - Live Open-Meteo telemetry)",
                "soil_data": "/api/soil-data?lat=...&lon=... (GET - Live SoilGrids 250m profile)",
                "health": "/health (GET - System health status)"
            },
            "upcoming_endpoints": {
                "interop_schema": "/schema/advisory_schema.json (MVP 5: BRICS Open Data Schema & Mobile Dashboard)"
            }
        }), 200

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "stage": "MVP 4"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "status": "error",
            "error_code": "NOT_FOUND",
            "message": "The requested endpoint was not found on AgriN API server."
        }), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected internal server error occurred."
        }), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"Starting AgriN Backend (MVP 4) on http://0.0.0.0:{port} (Debug: {debug})...")
    app.run(host="0.0.0.0", port=port, debug=debug)
