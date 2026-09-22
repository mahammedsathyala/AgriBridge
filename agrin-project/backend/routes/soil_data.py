"""
AgriN Soil & Satellite Data Route (v1 Standardized API)
-------------------------------------------------------
Queries ISRIC SoilGrids REST API / Sentinel-2 multispectral NDVI by coordinates.
Endpoints:
  GET /api/v1/soil?lat=...&lon=...
  GET /api/v1/satellite?lat=...&lon=...
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from data_sources.soil import fetch_soilgrids_profile
from data_sources.satellite import fetch_satellite_ndvi

soil_data_bp = Blueprint("soil_data", __name__)


@soil_data_bp.route("/api/v1/soil", methods=["GET"])
@soil_data_bp.route("/soil-data", methods=["GET"])
@soil_data_bp.route("/api/soil-data", methods=["GET"])
def get_soil_data():
    """
    Returns soil physical and chemical parameters for given GPS coordinates.
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
            "example": "/api/v1/soil?lat=15.8281&lon=78.0373"
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

    data = fetch_soilgrids_profile(lat, lon)
    response = {
        "status": "success",
        "schema_version": "1.0.0",
        "request_id": f"req-soil-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": ["ISRIC SoilGrids 250m Global Matrix"],
        "warnings": [],
        "data": data,
        **data,
        "status": "success"
    }
    return jsonify(response), 200


@soil_data_bp.route("/api/v1/satellite", methods=["GET"])
@soil_data_bp.route("/api/satellite", methods=["GET"])
def get_satellite_data():
    """
    Returns Sentinel-2 / Landsat-9 satellite NDVI and canopy indicators.
    Query params: ?lat=15.8281&lon=78.0373
    """
    lat_str = request.args.get("lat") or request.args.get("latitude") or "15.8281"
    lon_str = request.args.get("lon") or request.args.get("longitude") or request.args.get("lng") or "78.0373"

    try:
        lat = float(lat_str)
        lon = float(lon_str)
    except ValueError:
        lat, lon = 15.8281, 78.0373

    data = fetch_satellite_ndvi(lat, lon)
    response = {
        "status": "success",
        "schema_version": "1.0.0",
        "request_id": f"req-sat-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": ["Sentinel-2 L2A & Landsat-9 Satellite Mesh"],
        "warnings": [],
        "data": data,
        **data
    }
    return jsonify(response), 200
