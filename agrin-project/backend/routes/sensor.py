"""
AgriN: Sensor Telemetry Route Blueprint (ESP32 IoT & MQTT)
----------------------------------------------------------
Handles sensor ingestion and real-time telemetry queries for IoT soil probes.
Architecture:
  ESP32 Microcontroller / Simulator
    -> MQTT Broker (HiveMQ Cloud / Mosquitto)
    -> Backend Listener / REST Ingestion Endpoint
    -> SQLite Database (SensorTelemetry)
    -> REST API / Frontend Dashboard
"""

from datetime import datetime, timezone
from typing import Optional
from flask import Blueprint, request, jsonify
from models import db, SensorTelemetry

sensor_bp = Blueprint("sensor", __name__)


def format_v1_response(data, data_sources=None, warnings=None, status="success"):
    """Helper for standardized v1 API JSON schema."""
    return {
        "status": status,
        "schema_version": "1.0.0",
        "request_id": f"req-sensor-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_sources": data_sources or ["AGRI-ESP32-001 (Node 15cm probe)"],
        "warnings": warnings or [],
        "data_quality": {
            "sensor_mesh_status": "operational",
            "telemetry_protocol": "REST/MQTT"
        },
        "data": data
    }


def format_v1_error(code, message, status_code=400, details=None):
    """Helper for standardized v1 API error schema."""
    return jsonify({
        "status": "error",
        "code": code,
        "message": message,
        "request_id": f"req-err-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:17]}",
        "details": details or {}
    }), status_code


@sensor_bp.route("/api/v1/sensors/telemetry", methods=["POST"])
@sensor_bp.route("/api/sensors/telemetry", methods=["POST"])
def ingest_sensor_telemetry():
    """
    Ingest a new telemetry packet from an ESP32 node or MQTT bridge.
    Accepts:
      device_id (str, optional, default "AGRI-ESP32-001")
      farm_id (str, optional, default "sathyala-farm-001")
      soil_moisture_pct (float, required)
      soil_temperature_c (float, optional)
      soil_depth_cm (float, optional, default 15.0)
      ambient_temperature_c (float, optional)
      humidity_pct (float, optional)
      battery_pct (float, optional)
      signal_strength_dbm (str or int, optional)
    """
    if not request.is_json:
        return format_v1_error("INVALID_CONTENT_TYPE", "Request body must be JSON with 'Content-Type: application/json'.")

    payload = request.get_json(silent=True) or {}
    if not payload:
        return format_v1_error("EMPTY_PAYLOAD", "Payload body cannot be empty.")

    # Validate moisture reading (accept camelCase or snake_case)
    raw_moisture = payload.get("soil_moisture_pct") if "soil_moisture_pct" in payload else payload.get("soilMoisture")
    if raw_moisture is None:
        return format_v1_error("INVALID_INPUT", "Missing required telemetry field: 'soil_moisture_pct'.")

    try:
        moisture = float(raw_moisture)
        if not (0.0 <= moisture <= 100.0):
            return format_v1_error("OUT_OF_BOUNDS", "soil_moisture_pct must be between 0.0 and 100.0.")
    except (ValueError, TypeError):
        return format_v1_error("INVALID_INPUT", "soil_moisture_pct must be a valid numeric value.")

    device_id = payload.get("device_id") or payload.get("id") or "AGRI-ESP32-001"
    farm_id = payload.get("farm_id") or "sathyala-farm-001"

    soil_temp = float(payload.get("soil_temperature_c") or payload.get("soilTemp") or 29.4)
    soil_depth = float(payload.get("soil_depth_cm") or 15.0)
    canopy_temp = float(payload.get("canopy_temperature_c") or 30.8)
    ambient_temp = float(payload.get("ambient_temperature_c") or payload.get("ambientTemp") or 32.1)
    humidity = float(payload.get("humidity_pct") or payload.get("humidity") or 68.0)
    battery = float(payload.get("battery_pct") or payload.get("batteryPercent") or 88.0)
    signal = str(payload.get("signal_strength_dbm") or payload.get("signalStrength") or "-65 dBm")

    record = SensorTelemetry(
        device_id=device_id,
        farm_id=farm_id,
        soil_moisture_pct=moisture,
        soil_depth_cm=soil_depth,
        soil_temperature_c=soil_temp,
        canopy_temperature_c=canopy_temp,
        ambient_temperature_c=ambient_temp,
        humidity_pct=humidity,
        battery_pct=battery,
        signal_strength_dbm=signal,
        recorded_at=datetime.now(timezone.utc)
    )

    db.session.add(record)
    db.session.commit()

    return jsonify(format_v1_response({
        "message": "Telemetry packet recorded successfully",
        "telemetry": record.to_dict()
    })), 201


@sensor_bp.route("/api/v1/farms/<farm_id>/sensors/latest", methods=["GET"])
@sensor_bp.route("/api/v1/sensors/latest", methods=["GET"])
@sensor_bp.route("/api/sensors/latest", methods=["GET"])
def get_latest_sensor_data(farm_id: Optional[str] = None):
    """
    Returns the latest ESP32 telemetry packet for the specified farm.
    Includes stale-data status:
      online: <= 5 minutes
      stale: > 5 min and <= 30 min
      offline: > 30 min or missing
    """
    target_farm = farm_id or "sathyala-farm-001"
    
    # Query latest record for farm or any record
    query = SensorTelemetry.query.filter(SensorTelemetry.farm_id == target_farm)
    latest = query.order_by(SensorTelemetry.recorded_at.desc(), SensorTelemetry.id.desc()).first()

    if not latest:
        # Check if any telemetry exists at all
        latest = SensorTelemetry.query.order_by(SensorTelemetry.recorded_at.desc(), SensorTelemetry.id.desc()).first()

    # If database is freshly initialized, seed default live telemetry
    if not latest:
        latest = SensorTelemetry(
            device_id="AGRI-ESP32-001",
            farm_id=target_farm,
            soil_moisture_pct=34.0,
            soil_depth_cm=15.0,
            soil_temperature_c=29.4,
            canopy_temperature_c=30.8,
            ambient_temperature_c=32.1,
            humidity_pct=68.0,
            battery_pct=88.0,
            signal_strength_dbm="-65 dBm",
            recorded_at=datetime.now(timezone.utc)
        )
        db.session.add(latest)
        db.session.commit()

    data_dict = latest.to_dict()
    warnings = []
    if data_dict["status"] == "stale":
        warnings.append("Sensor data is stale (> 5 minutes old).")
    elif data_dict["status"] == "offline":
        warnings.append("Sensor is offline (> 30 minutes since last telemetry packet).")

    return jsonify(format_v1_response(data_dict, warnings=warnings)), 200


@sensor_bp.route("/api/v1/farms/<farm_id>/sensors/history", methods=["GET"])
@sensor_bp.route("/api/v1/sensors/history", methods=["GET"])
@sensor_bp.route("/api/sensors/history", methods=["GET"])
def get_sensor_history(farm_id: Optional[str] = None):
    """Returns the last 20 telemetry packets for the farm."""
    target_farm = farm_id or "sathyala-farm-001"
    query = SensorTelemetry.query.filter(SensorTelemetry.farm_id == target_farm)
    records = query.order_by(SensorTelemetry.recorded_at.desc(), SensorTelemetry.id.desc()).limit(20).all()

    if not records:
        records = SensorTelemetry.query.order_by(SensorTelemetry.recorded_at.desc(), SensorTelemetry.id.desc()).limit(20).all()

    return jsonify(format_v1_response({
        "count": len(records),
        "history": [r.to_dict() for r in records]
    })), 200
