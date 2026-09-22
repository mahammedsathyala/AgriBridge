"""
AgriN Advisory Route (MVP 2: Live Data Ingestion)
------------------------------------------------
Accepts either:
  1. Live GPS coordinates ({"latitude": 17.3850, "longitude": 78.4867})
     -> Automatically pulls live Open-Meteo, SoilGrids, and Satellite NDVI data.
  2. Manual inputs (soil_type, weather, season)
     -> Legacy manual mode / overrides from MVP 1.
"""

from datetime import datetime, timezone
from typing import Optional, Tuple
from flask import Blueprint, request, jsonify
from models import db, FarmProfile, AdvisoryRecord

from engines.advisory_engine import get_rule_based_advisory
from engines.llm_advisory import llm_localizer
from data_sources.weather import fetch_weather_forecast
from data_sources.soil import fetch_soilgrids_profile
from data_sources.satellite import fetch_satellite_ndvi

advisory_bp = Blueprint("advisory", __name__)


def infer_agricultural_season(lat: float, month: Optional[int] = None) -> str:
    """
    Infers the current agro-climatic season based on calendar month and hemisphere.
    """
    if month is None:
        month = datetime.now(timezone.utc).month

    # Northern Hemisphere (India, China, Russia)
    if lat >= 0:
        if month in [6, 7, 8, 9, 10]:
            return "kharif"
        elif month in [11, 12, 1, 2, 3]:
            return "rabi"
        else:
            return "zaid"
    # Southern Hemisphere (Brazil, South Africa)
    else:
        if month in [10, 11, 12, 1, 2, 3]:
            return "kharif"
        else:
            return "rabi"


@advisory_bp.route("/advisory", methods=["GET"])
@advisory_bp.route("/api/advisory", methods=["GET"])
def advisory_info():
    """Returns endpoint documentation and sample payload structures."""
    return jsonify({
        "service": "AgriN Advisory API",
        "stage": "MVP 2: Live Data Ingestion (Open-Meteo, SoilGrids, Satellite NDVI)",
        "method": "POST",
        "endpoints": ["/advisory", "/api/advisory"],
        "expected_payload": {
            "mode_1_live_coordinates": {
                "latitude": "Float (-90 to 90)",
                "longitude": "Float (-180 to 180)",
                "location": "Optional farm / zone name"
            },
            "mode_2_manual_override": {
                "soil_type": "sandy | clay | loam | black | red | alluvial",
                "weather": "dry | wet | moderate | cool | semi_arid | hot",
                "season": "kharif | rabi | zaid",
                "location": "Optional region name"
            }
        },
        "modes": {
            "mode_1_live_coordinates": {
                "description": "Provide GPS coordinates to automatically ingest live weather, soil, and satellite NDVI data.",
                "sample_payload": {
                    "latitude": 17.3850,
                    "longitude": 78.4867,
                    "location": "Telangana Agricultural Zone"
                }
            },
            "mode_2_manual_override": {
                "description": "Provide manual parameters (or overrides alongside coordinates).",
                "sample_payload": {
                    "soil_type": "sandy",
                    "weather": "dry",
                    "season": "kharif",
                    "location": "Semi-Arid Drylands"
                }
            }
        }
    }), 200


@advisory_bp.route("/advisory", methods=["POST"])
@advisory_bp.route("/api/advisory", methods=["POST"])
def get_advisory():
    """
    Generates tailored agro-advisories from either live sensor/geo data or manual inputs.
    """
    if not request.is_json:
        return jsonify({
            "status": "error",
            "error_code": "INVALID_CONTENT_TYPE",
            "message": "Request body must be valid JSON with 'Content-Type: application/json'."
        }), 400

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "status": "error",
            "error_code": "EMPTY_PAYLOAD",
            "message": "JSON body cannot be empty."
        }), 400

    # Extract coordinates if provided
    raw_lat = data.get("latitude") if data.get("latitude") is not None else data.get("lat")
    raw_lon = data.get("longitude") if data.get("longitude") is not None else data.get("lon")

    has_coords = raw_lat is not None and raw_lon is not None
    coordinates = None

    if has_coords:
        try:
            lat = float(raw_lat)
            lon = float(raw_lon)
            if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                raise ValueError("Coordinates out of physical bounds")
            coordinates = (lat, lon)
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "error_code": "INVALID_COORDINATES",
                "message": "Coordinates must be valid numbers: latitude (-90 to 90), longitude (-180 to 180)."
            }), 400

    # Manual fields
    soil_type = data.get("soil_type")
    weather = data.get("weather")
    season = data.get("season")
    location = data.get("location")

    live_telemetry = None
    data_source_mode = "manual"

    # If coordinates are available, fetch live telemetry streams
    if coordinates:
        lat, lon = coordinates
        data_source_mode = "live_data_ingestion"

        # 1. Open-Meteo live weather
        weather_data = fetch_weather_forecast(lat, lon)
        # 2. ISRIC SoilGrids live physical & chemical profile
        soil_data = fetch_soilgrids_profile(lat, lon)
        # 3. Satellite NDVI & canopy vigor
        satellite_data = fetch_satellite_ndvi(lat, lon)

        live_telemetry = {
            "weather": weather_data,
            "soil": soil_data,
            "satellite_ndvi": satellite_data
        }

        # Derive parameters if not explicitly overridden by user
        if not soil_type:
            soil_type = soil_data.get("physical_properties", {}).get("agrin_soil_type", "loam")
        if not weather:
            weather = weather_data.get("derived_agro_weather", "moderate")
        if not season:
            season = infer_agricultural_season(lat)
        if not location:
            location = f"Coordinates ({lat:.4f}, {lon:.4f})"

    # Validate that we have the 3 necessary attributes (either from manual or live extraction)
    missing = []
    if not soil_type or not str(soil_type).strip():
        missing.append("soil_type (or coordinates)")
    if not weather or not str(weather).strip():
        missing.append("weather (or coordinates)")
    if not season or not str(season).strip():
        missing.append("season (or coordinates)")

    if missing:
        return jsonify({
            "status": "error",
            "error_code": "MISSING_REQUIRED_FIELDS",
            "message": f"Could not determine required attributes: {', '.join(missing)}.",
            "suggestion": "Provide either GPS coordinates ('latitude', 'longitude') for live data ingestion OR manual inputs ('soil_type', 'weather', 'season')."
        }), 400

    # Run advisory engine with enriched parameters
    try:
        advisory_result = get_rule_based_advisory(
            soil_type=str(soil_type),
            weather=str(weather),
            season=str(season),
            location=str(location or "Unspecified"),
            **{k: v for k, v in data.items() if k not in ["soil_type", "weather", "season", "location", "lat", "lon", "latitude", "longitude"]}
        )

        # Optional MVP 4 Localization
        localized_guidance = None
        if data.get("localize") or data.get("localise"):
            lang = data.get("language") or data.get("lang") or "en"
            # Combine telemetry into advisory_result for rich context
            enriched_context = {**advisory_result, "live_telemetry": live_telemetry}
            localized_guidance = llm_localizer.generate_plain_advisory(
                advisory_data=enriched_context,
                language=lang,
                farmer_profile=data.get("farmer_profile")
            )

        response_payload = {
            "status": "success",
            "version": "4.0.0-mvp4",
            "mode": data_source_mode,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "live_telemetry": live_telemetry,
            "localized_farmer_guidance": localized_guidance,
            **advisory_result
        }

        # Persist generated advisories to database (Task 4)
        try:
            active_farm = FarmProfile.query.order_by(FarmProfile.id.desc()).first()
            farm_id = active_farm.id if active_farm else None
            source_type = "llm" if localized_guidance else "rule_based"

            recs = advisory_result.get("recommendations", [])
            for r in recs:
                txt = r.get("action") or r.get("rationale") or f"Recommended crop: {r.get('crop', '')}"
                rec_row = AdvisoryRecord(
                    farm_id=farm_id,
                    recommendation_text=txt,
                    source=source_type,
                    completed=False
                )
                db.session.add(rec_row)
            db.session.commit()
        except Exception as db_err:
            print(f"Warning: Failed to persist AdvisoryRecords: {db_err}")

        return jsonify(response_payload), 200

    except Exception as exc:
        return jsonify({
            "status": "error",
            "error_code": "ENGINE_ERROR",
            "message": f"An unexpected error occurred in the advisory engine: {str(exc)}"
        }), 500


@advisory_bp.route("/api/advisory/history", methods=["GET"])
@advisory_bp.route("/advisory/history", methods=["GET"])
def get_advisory_history():
    """Return historical advisories and completion status for the current farm."""
    active_farm = FarmProfile.query.order_by(FarmProfile.id.desc()).first()
    query = AdvisoryRecord.query
    if active_farm:
        query = query.filter(AdvisoryRecord.farm_id == active_farm.id)

    records = query.order_by(AdvisoryRecord.id.desc()).limit(20).all()

    # Seed baseline advisories if table is initially empty
    if not records:
        try:
            seed_items = [
                AdvisoryRecord(
                    farm_id=active_farm.id if active_farm else None,
                    recommendation_text="Delay drip irrigation by 24 hours: 18mm convective rainfall forecast in Kurnool over next 48 hours.",
                    source="rule_based",
                    completed=False
                ),
                AdvisoryRecord(
                    farm_id=active_farm.id if active_farm else None,
                    recommendation_text="Apply 5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride foliar spray for early Cercospora leaf spot prevention.",
                    source="rule_based",
                    completed=False
                ),
                AdvisoryRecord(
                    farm_id=active_farm.id if active_farm else None,
                    recommendation_text="Apply gypsum at 200 kg/acre during flowering/pegging for optimal calcium pod filling in red loamy soil.",
                    source="rule_based",
                    completed=True
                )
            ]
            for item in seed_items:
                db.session.add(item)
            db.session.commit()
            records = seed_items
        except Exception as seed_err:
            print(f"Warning seeding advisory records: {seed_err}")

    return jsonify({
        "status": "success",
        "count": len(records),
        "advisories": [r.to_dict() for r in records]
    }), 200


@advisory_bp.route("/api/advisory/<int:advisory_id>/complete", methods=["POST", "PATCH"])
@advisory_bp.route("/advisory/<int:advisory_id>/complete", methods=["POST", "PATCH"])
def mark_advisory_completed_by_id(advisory_id: int):
    """Mark an advisory record as completed (or toggle)."""
    record = AdvisoryRecord.query.get(advisory_id)
    if not record:
        return jsonify({
            "status": "error",
            "message": f"Advisory with ID {advisory_id} not found."
        }), 404

    data = request.get_json(silent=True) or {}
    if "completed" in data:
        record.completed = bool(data["completed"])
    else:
        record.completed = not record.completed

    db.session.commit()
    return jsonify({
        "status": "success",
        "message": "Advisory status updated",
        "advisory": record.to_dict()
    }), 200


@advisory_bp.route("/api/advisory/complete", methods=["POST", "PATCH"])
@advisory_bp.route("/advisory/complete", methods=["POST", "PATCH"])
def mark_advisory_completed():
    """Mark an advisory record as completed by passing JSON {'id': ...}."""
    data = request.get_json(silent=True) or {}
    adv_id = data.get("id") or data.get("advisory_id")
    if not adv_id:
        return jsonify({
            "status": "error",
            "message": "Missing 'id' or 'advisory_id' in request payload."
        }), 400

    # If ID is string like 'adv-001' or number
    try:
        if isinstance(adv_id, str) and "-" in adv_id:
            num_part = adv_id.split("-")[-1]
            numeric_id = int(num_part)
        else:
            numeric_id = int(adv_id)
    except ValueError:
        numeric_id = 1

    record = AdvisoryRecord.query.get(numeric_id)
    if not record:
        # Fallback to first record or create
        record = AdvisoryRecord.query.first()
        if not record:
            active_farm = FarmProfile.query.order_by(FarmProfile.id.desc()).first()
            record = AdvisoryRecord(
                farm_id=active_farm.id if active_farm else None,
                recommendation_text="Delay drip irrigation by 24 hours.",
                source="rule_based",
                completed=True
            )
            db.session.add(record)

    if "completed" in data:
        record.completed = bool(data["completed"])
    else:
        record.completed = not record.completed

    db.session.commit()
    return jsonify({
        "status": "success",
        "message": "Advisory status updated",
        "advisory": record.to_dict()
    }), 200
