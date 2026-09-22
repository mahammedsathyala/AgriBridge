"""
AgriN Weather Data Route (v1 Standardized API)
----------------------------------------------
Provides live Open-Meteo weather forecasts and drought indices by coordinates.
Endpoints:
  GET /api/v1/weather?lat=...&lon=...
  GET /api/weather-data?lat=...&lon=...
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from data_sources.weather import fetch_weather_forecast

weather_data_bp = Blueprint("weather_data", __name__)


@weather_data_bp.route("/api/v1/weather", methods=["GET"])
@weather_data_bp.route("/weather-data", methods=["GET"])
@weather_data_bp.route("/api/weather-data", methods=["GET"])
def get_weather_data():
    """
    Returns live Open-Meteo weather parameters for given GPS coordinates.
    Query params: ?lat=15.8281&lon=78.0373
    """
    lat_str = request.args.get("lat") or request.args.get("latitude")
    lon_str = request.args.get("lon") or request.args.get("longitude") or request.args.get("lng")

    if not lat_str or not lon_str:
        return jsonify({
            "status": "error",
            "code": "MISSING_COORDINATES",
            "error_code": "MISSING_COORDINATES",
            "message": "Both 'lat' and 'lon' query parameters are required.",
            "example": "/api/v1/weather?lat=15.8281&lon=78.0373"
        }), 400

    try:
        lat = float(lat_str)
        lon = float(lon_str)
    except ValueError:
        return jsonify({
            "status": "error",
            "code": "INVALID_COORDINATES",
            "error_code": "INVALID_COORDINATES",
            "message": "Latitude and Longitude must be valid numerical values."
        }), 400

    data = fetch_weather_forecast(lat, lon)
    
    # Wrap in v1 schema while preserving existing fields for backwards compatibility
    response = {
        "status": "success",
        "schema_version": "1.0.0",
        "request_id": f"req-wth-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": ["Open-Meteo API (WMO Standard)"],
        "warnings": [],
        "data": data,
        **data
    }
    return jsonify(response), 200
