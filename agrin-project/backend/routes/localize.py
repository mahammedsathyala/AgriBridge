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

    adv_payload = advisory_data or {}
    if not isinstance(adv_payload, dict):
        adv_payload = {}
    
    # Merge top level fields
    for field in ["crop", "crop_name", "variety", "crop_variety", "crop_stage", "location", "latitude", "longitude", "lat", "lon", "soil_type", "weather", "live_telemetry"]:
        if field in data and field not in adv_payload:
            adv_payload[field] = data[field]

    query_str = data.get("query") or data.get("user_query")
    if query_str and "query" not in adv_payload:
        adv_payload["query"] = query_str

    result = llm_localizer.generate_plain_advisory(
        advisory_data=adv_payload,
        diagnosis_data=diagnosis_data,
        language=language,
        farmer_profile=farmer_profile,
        query=query_str
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
        "answer": result.get("answer"),
        "audio_script": result.get("audio_script"),
        "urgent_actions": result.get("urgent_actions", []),
        "risk_bulletin": result.get("risk_bulletin", ""),
        "why_this_works": result.get("why_this_works", ""),
        "source": result.get("source", "local_rule_engine"),
        "status_label": result.get("status_label", "FALLBACK"),
        "source_status": result.get("source_status", "LOCAL_SYNTHESIS"),
        "engine": result.get("engine", ""),
        **result
    }
    return jsonify(response), 200
