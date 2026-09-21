"""
AgriN Soil Data Route (MVP 2)
------------------------------
Queries ISRIC SoilGrids REST API or regional pedological matrix to fetch
physical and chemical soil profiles (sand, silt, clay, SOC, pH) by coordinates.
"""

from flask import Blueprint, request, jsonify
from data_sources.soil import fetch_soilgrids_profile

soil_data_bp = Blueprint("soil_data", __name__)


@soil_data_bp.route("/soil-data", methods=["GET"])
@soil_data_bp.route("/api/soil-data", methods=["GET"])
def get_soil_data():
    """
    Returns soil physical and chemical parameters for given GPS coordinates.
    Query params: ?lat=17.3850&lon=78.4867
    """
    lat_str = request.args.get("lat") or request.args.get("latitude")
    lon_str = request.args.get("lon") or request.args.get("longitude")

    if not lat_str or not lon_str:
        return jsonify({
            "status": "error",
            "error_code": "MISSING_COORDINATES",
            "message": "Both 'lat' and 'lon' query parameters are required.",
            "example": "/api/soil-data?lat=17.3850&lon=78.4867"
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

    data = fetch_soilgrids_profile(lat, lon)
    return jsonify(data), 200
