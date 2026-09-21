"""
AgriN Weather Data Route (MVP 2)
--------------------------------
Provides live Open-Meteo weather forecasts and drought indices by coordinates.
"""

from flask import Blueprint, request, jsonify
from data_sources.weather import fetch_weather_forecast

weather_data_bp = Blueprint("weather_data", __name__)


@weather_data_bp.route("/weather-data", methods=["GET"])
@weather_data_bp.route("/api/weather-data", methods=["GET"])
def get_weather_data():
    """
    Returns live Open-Meteo weather parameters for given GPS coordinates.
    Query params: ?lat=17.3850&lon=78.4867
    """
    lat_str = request.args.get("lat") or request.args.get("latitude")
    lon_str = request.args.get("lon") or request.args.get("longitude")

    if not lat_str or not lon_str:
        return jsonify({
            "status": "error",
            "error_code": "MISSING_COORDINATES",
            "message": "Both 'lat' and 'lon' query parameters are required.",
            "example": "/api/weather-data?lat=15.8192&lon=78.1526"
        }), 400

    try:
        lat = float(lat_str)
        lon = float(lon_str)
    except ValueError:
        return jsonify({
            "status": "error",
            "error_code": "INVALID_COORDINATES",
            "message": "Latitude and Longitude must be valid numerical values."
        }), 400

    data = fetch_weather_forecast(lat, lon)
    return jsonify(data), 200
