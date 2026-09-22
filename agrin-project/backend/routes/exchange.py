"""
AgriN: BRICS CADS Data Exchange Route Blueprint
------------------------------------------------
Provides endpoints for recording and viewing cross-border CADS data exchange logs
backed by SQLite via SQLAlchemy.
"""

import json
from flask import Blueprint, request, jsonify
from models import db, DataExchangeLog

exchange_bp = Blueprint("exchange", __name__)


@exchange_bp.route("/api/brics/exchange", methods=["POST"])
@exchange_bp.route("/brics/exchange", methods=["POST"])
def log_exchange():
    """Record a cross-border CADS exchange log in the database."""
    data = request.get_json(silent=True) or {}

    source_node = data.get("source_node") or data.get("source") or "IN-ICAR-01"
    if isinstance(source_node, dict):
        source_node = source_node.get("code") or source_node.get("name") or "IN-ICAR-01"

    target_node = data.get("target_node") or data.get("target") or "BR-EMBRAPA-01"
    if isinstance(target_node, dict):
        target_node = target_node.get("code") or target_node.get("name") or "BR-EMBRAPA-01"

    indicator = data.get("indicator") or "soil_moisture_cadence"
    raw_payload = data.get("payload") or data.get("payload_json") or {}
    if isinstance(raw_payload, dict):
        payload_str = json.dumps(raw_payload)
    else:
        payload_str = str(raw_payload)

    log_entry = DataExchangeLog(
        source_node=str(source_node),
        target_node=str(target_node),
        indicator=str(indicator),
        payload_json=payload_str
    )
    db.session.add(log_entry)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Data exchange logged successfully",
        "log": log_entry.to_dict()
    }), 201


@exchange_bp.route("/api/brics/logs", methods=["GET"])
@exchange_bp.route("/brics/logs", methods=["GET"])
def get_exchange_logs():
    """Return recent CADS cross-border data exchange audit logs."""
    logs = DataExchangeLog.query.order_by(DataExchangeLog.id.desc()).limit(20).all()

    # Seed baseline exchange logs if table is empty
    if not logs:
        sample_logs = [
            DataExchangeLog(
                source_node="IN-ICAR-01",
                target_node="BR-EMBRAPA-01",
                indicator="soil_moisture_cadence",
                payload_json=json.dumps({
                    "protocol": "AgriBridge-CADS-v1.4",
                    "region": "Andhra Pradesh Drylands",
                    "fuzzed_lat": 15.8,
                    "fuzzed_lng": 78.0,
                    "soil_moisture_avg": 24.2,
                    "differential_privacy_epsilon": 0.5
                })
            ),
            DataExchangeLog(
                source_node="IN-ICAR-01",
                target_node="ZA-ARC-01",
                indicator="drought_early_warning",
                payload_json=json.dumps({
                    "protocol": "AgriBridge-CADS-v1.4",
                    "region": "Rayalaseema Basin",
                    "drought_risk_index": "moderate",
                    "differential_privacy_epsilon": 0.5
                })
            )
        ]
        for s in sample_logs:
            db.session.add(s)
        db.session.commit()
        logs = sample_logs

    return jsonify({
        "status": "success",
        "count": len(logs),
        "logs": [l.to_dict() for l in logs]
    }), 200
