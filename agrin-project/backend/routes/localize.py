"""
AgriN Advisory Localization Route (MVP 4)
-----------------------------------------
Translates complex agronomic telemetry and disease detections into
short, plain-language vernacular voice/text scripts for smallholder farmers.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from engines.llm_advisory import llm_localizer, SUPPORTED_LANGUAGES

localize_bp = Blueprint("localize", __name__)


@localize_bp.route("/localize", methods=["GET"])
@localize_bp.route("/api/localize", methods=["GET"])
def localize_info():
    """Returns endpoint documentation and supported languages."""
    return jsonify({
        "service": "AgriN LLM Localisation API",
        "stage": "MVP 4: Anthropic Claude Multilingual Localization Active",
        "method": "POST",
        "endpoints": ["/localize", "/api/localize"],
        "supported_languages": SUPPORTED_LANGUAGES,
        "sample_payload": {
            "language": "te (or hi, en, pt, ru, zh)",
            "advisory_data": {
                "recommendations": [
                    {
                        "crop": "Pearl Millet (Bajra)",
                        "companion_crop": "Cowpea",
                        "soil_regeneration_practices": ["Residue retention mulching"]
                    }
                ]
            },
            "diagnosis_data": {
                "primary_diagnosis": {
                    "condition": "Tikka Leaf Spot",
                    "confidence": "92.0%"
                },
                "organic_treatment_plan": ["5% Neem Seed Kernel Extract (NSKE) foliar spray"]
            },
            "farmer_profile": {
                "farmer_name": "Sathyala",
                "landholding_acres": 2.5,
                "irrigation": "Rainfed"
            }
        }
    }), 200


@localize_bp.route("/localize", methods=["POST"])
@localize_bp.route("/api/localize", methods=["POST"])
def localize_advisory():
    """
    Synthesize plain-language farmer advisory from technical data.
    """
    if not request.is_json:
        return jsonify({
            "status": "error",
            "error_code": "INVALID_CONTENT_TYPE",
            "message": "Request body must be valid JSON."
        }), 400

    data = request.get_json(silent=True) or {}
    advisory_data = data.get("advisory_data")
    diagnosis_data = data.get("diagnosis_data")
    language = data.get("language") or data.get("lang") or "en"
    farmer_profile = data.get("farmer_profile")

    if not advisory_data and not diagnosis_data:
        return jsonify({
            "status": "error",
            "error_code": "MISSING_SOURCE_DATA",
            "message": "Must provide either 'advisory_data' (from /advisory) or 'diagnosis_data' (from /diagnose)."
        }), 400

    result = llm_localizer.generate_plain_advisory(
        advisory_data=advisory_data,
        diagnosis_data=diagnosis_data,
        language=language,
        farmer_profile=farmer_profile
    )

    response = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "4.0.0-mvp4",
        **result
    }
    return jsonify(response), 200
