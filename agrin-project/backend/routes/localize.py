"""
AgriN Advisory Localization Route (v1 Standardized API)
--------------------------------------------------------
Translates complex agronomic telemetry and disease detections into
short, plain-language vernacular voice/text scripts for smallholder farmers.
Endpoints:
  POST /api/v1/localizations
  POST /localize
  POST /api/localize
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from engines.llm_advisory import llm_localizer, SUPPORTED_LANGUAGES

localize_bp = Blueprint("localize", __name__)


@localize_bp.route("/localize", methods=["GET"])
@localize_bp.route("/api/localize", methods=["GET"])
@localize_bp.route("/api/v1/localizations", methods=["GET"])
def localize_info():
    """Returns endpoint documentation and supported languages."""
    return jsonify({
        "service": "AgriN LLM Localisation API",
        "version": "1.0.0",
        "method": "POST",
        "endpoints": ["/api/v1/localizations", "/localize", "/api/localize"],
        "supported_languages": SUPPORTED_LANGUAGES
    }), 200


@localize_bp.route("/api/v1/localizations", methods=["POST"])
@localize_bp.route("/localize", methods=["POST"])
@localize_bp.route("/api/localize", methods=["POST"])
def localize_advisory():
    """
    Synthesize plain-language farmer advisory from technical data.
    """
    if not request.is_json:
        return jsonify({
            "status": "error",
            "code": "INVALID_CONTENT_TYPE",
            "error_code": "INVALID_CONTENT_TYPE",
            "message": "Request body must be valid JSON."
        }), 400

    data = request.get_json(silent=True) or {}
    advisory_data = data.get("advisory_data")
    diagnosis_data = data.get("diagnosis_data")
    language = data.get("language") or data.get("lang") or "en"
    farmer_profile = data.get("farmer_profile")

    # Also support top-level query / prompt directly
    if not advisory_data and not diagnosis_data and not data.get("query"):
        return jsonify({
            "status": "error",
            "code": "MISSING_SOURCE_DATA",
            "error_code": "MISSING_SOURCE_DATA",
            "message": "Must provide either 'advisory_data' (from /advisory), 'diagnosis_data' (from /diagnose), or 'query'."
        }), 400

    result = llm_localizer.generate_plain_advisory(
        advisory_data=advisory_data or {"query": data.get("query"), "crop": data.get("crop_name", "Groundnut")},
        diagnosis_data=diagnosis_data,
        language=language,
        farmer_profile=farmer_profile
    )

    response = {
        "status": "success",
        "schema_version": "1.0.0",
        "request_id": f"req-loc-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": ["Anthropic Claude Multilingual Localization Engine", "ICAR Multilingual Glossaries"],
        "warnings": [],
        "data": result,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        **result
    }
    return jsonify(response), 200
