"""
AgriN: Farm Profile Route Blueprint (v1 Standardized API)
---------------------------------------------------------
Provides GET /api/v1/farm and POST /api/v1/farm backed by SQLite via SQLAlchemy.
"""

from datetime import datetime, timezone
from typing import Optional
from flask import Blueprint, request, jsonify
from models import db, FarmProfile

farm_bp = Blueprint("farm", __name__)


@farm_bp.route("/api/v1/farm", methods=["GET"])
@farm_bp.route("/api/v1/farms/<farm_id>", methods=["GET"])
@farm_bp.route("/api/farm", methods=["GET"])
@farm_bp.route("/farm", methods=["GET"])
def get_farm(farm_id: Optional[str] = None):
    """Return the current active farm profile from the database."""
    profile = FarmProfile.query.order_by(FarmProfile.id.desc()).first()
    if not profile:
        profile = FarmProfile(
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
        db.session.add(profile)
        db.session.commit()

    farm_dict = profile.to_dict()
    return jsonify({
        "status": "success",
        "schema_version": "1.0.0",
        "request_id": f"req-farm-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": ["SQLite FarmProfile Database"],
        "warnings": [],
        "farm": farm_dict,
        "data": {
            "farm": farm_dict
        }
    }), 200


@farm_bp.route("/api/v1/farm", methods=["POST", "PUT"])
@farm_bp.route("/api/v1/farms/<farm_id>", methods=["POST", "PUT"])
@farm_bp.route("/api/farm", methods=["POST", "PUT"])
@farm_bp.route("/farm", methods=["POST", "PUT"])
def update_farm(farm_id: Optional[str] = None):
    """Create or update the farm profile from JSON payload."""
    data = request.get_json(silent=True) or {}

    profile = FarmProfile.query.order_by(FarmProfile.id.desc()).first()
    if not profile:
        profile = FarmProfile()
        db.session.add(profile)

    # Handle coordinates both flat or nested
    if "coordinates" in data and isinstance(data["coordinates"], dict):
        coords = data["coordinates"]
        if "lat" in coords and coords["lat"] is not None:
            profile.lat = float(coords["lat"])
        if "lng" in coords and coords["lng"] is not None:
            profile.lng = float(coords["lng"])
    if "lat" in data and data["lat"] is not None:
        profile.lat = float(data["lat"])
    if "lng" in data and data["lng"] is not None:
        profile.lng = float(data["lng"])

    # Handle camelCase or snake_case
    if "farmerName" in data or "farmer_name" in data:
        profile.farmer_name = data.get("farmerName") or data.get("farmer_name")
    if "farmName" in data or "farm_name" in data:
        profile.farm_name = data.get("farmName") or data.get("farm_name")
    if "location" in data:
        profile.location = data.get("location")
    if "areaAcres" in data or "area_acres" in data:
        val = data.get("areaAcres") if "areaAcres" in data else data.get("area_acres")
        try:
            profile.area_acres = float(val)
        except (ValueError, TypeError):
            pass
    if "crop" in data:
        profile.crop = data.get("crop")
    if "cropVariety" in data or "crop_variety" in data:
        profile.crop_variety = data.get("cropVariety") or data.get("crop_variety")
    if "sowingDate" in data or "sowing_date" in data:
        profile.sowing_date = data.get("sowingDate") or data.get("sowing_date")
    if "soilType" in data or "soil_type" in data:
        profile.soil_type = data.get("soilType") or data.get("soil_type")
    if "irrigationType" in data or "irrigation_type" in data:
        profile.irrigation_type = data.get("irrigationType") or data.get("irrigation_type")

    db.session.commit()

    farm_dict = profile.to_dict()
    return jsonify({
        "status": "success",
        "schema_version": "1.0.0",
        "request_id": f"req-farm-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": ["SQLite FarmProfile Database"],
        "warnings": [],
        "message": "Farm profile updated successfully",
        "farm": farm_dict,
        "data": {
            "farm": farm_dict
        }
    }), 200
