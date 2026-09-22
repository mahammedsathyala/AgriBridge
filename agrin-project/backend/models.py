"""
AgriN: SQLAlchemy Database Models
---------------------------------
SQLite models for farm profiles, crop disease diagnosis logs,
advisory completions, and BRICS interoperability data exchange.
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class FarmProfile(db.Model):
    """Registered Farm profile and telemetry parameters."""
    __tablename__ = "farm_profiles"

    id = db.Column(db.Integer, primary_key=True)
    farmer_name = db.Column(db.String(120), nullable=False, default="Sathyala Farmer")
    farm_name = db.Column(db.String(120), nullable=False, default="Sathyala Farm")
    location = db.Column(db.String(255), nullable=False, default="Kurnool, Andhra Pradesh")
    lat = db.Column(db.Float, nullable=False, default=15.8281)
    lng = db.Column(db.Float, nullable=False, default=78.0373)
    area_acres = db.Column(db.Float, nullable=False, default=2.5)
    crop = db.Column(db.String(80), nullable=False, default="Groundnut")
    crop_variety = db.Column(db.String(80), nullable=True, default="K6 (Kadiri-6)")
    sowing_date = db.Column(db.String(30), nullable=True, default="2026-08-07")
    soil_type = db.Column(db.String(80), nullable=False, default="Red loamy soil")
    irrigation_type = db.Column(db.String(80), nullable=False, default="Borewell drip")
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    diagnoses = db.relationship("DiagnosisRecord", backref="farm", lazy=True, cascade="all, delete-orphan")
    advisories = db.relationship("AdvisoryRecord", backref="farm", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "farmerName": self.farmer_name,
            "farmer_name": self.farmer_name,
            "farmName": self.farm_name,
            "farm_name": self.farm_name,
            "location": self.location,
            "coordinates": {
                "lat": self.lat,
                "lng": self.lng
            },
            "lat": self.lat,
            "lng": self.lng,
            "areaAcres": self.area_acres,
            "area_acres": self.area_acres,
            "crop": self.crop,
            "cropVariety": self.crop_variety,
            "crop_variety": self.crop_variety,
            "sowingDate": self.sowing_date,
            "sowing_date": self.sowing_date,
            "soilType": self.soil_type,
            "soil_type": self.soil_type,
            "irrigationType": self.irrigation_type,
            "irrigation_type": self.irrigation_type,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class DiagnosisRecord(db.Model):
    """Computer vision crop disease diagnostic history."""
    __tablename__ = "diagnosis_records"

    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.Integer, db.ForeignKey("farm_profiles.id"), nullable=True)
    crop = db.Column(db.String(80), nullable=False, default="Groundnut")
    disease = db.Column(db.String(120), nullable=False)
    confidence = db.Column(db.Float, nullable=False, default=0.0)
    image_ref = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __init__(
        self,
        farm_id: int | None = None,
        crop: str = "Groundnut",
        disease: str = "",
        confidence: float = 0.0,
        image_ref: str | None = None,
    ) -> None:
        """Explicit constructor so static type checkers can see accepted kwargs."""
        self.farm_id = farm_id
        self.crop = crop
        self.disease = disease
        self.confidence = confidence
        self.image_ref = image_ref

    def to_dict(self):
        return {
            "id": self.id,
            "farm_id": self.farm_id,
            "crop": self.crop,
            "disease": self.disease,
            "confidence": self.confidence,
            "image_ref": self.image_ref,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class AdvisoryRecord(db.Model):
    """Agronomic recommendations and farmer completion state."""
    __tablename__ = "advisory_records"

    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.Integer, db.ForeignKey("farm_profiles.id"), nullable=True)
    recommendation_text = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(50), nullable=False, default="rule_based")  # rule_based / llm
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "farm_id": self.farm_id,
            "recommendation_text": self.recommendation_text,
            "source": self.source,
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class DataExchangeLog(db.Model):
    """Audit log for BRICS CADS decentralized data exchanges."""
    __tablename__ = "data_exchange_logs"

    id = db.Column(db.Integer, primary_key=True)
    source_node = db.Column(db.String(60), nullable=False)  # e.g., IN-ICAR-01
    target_node = db.Column(db.String(60), nullable=False)  # e.g., BR-EMBRAPA-01
    indicator = db.Column(db.String(100), nullable=False)   # e.g., soil_moisture_cadence
    payload_json = db.Column(db.Text, nullable=False)       # Anonymized CADS JSON
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "source_node": self.source_node,
            "target_node": self.target_node,
            "indicator": self.indicator,
            "payload_json": self.payload_json,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class SensorTelemetry(db.Model):
    """IoT ESP32 Sensor probe readings and battery telemetry."""
    __tablename__ = "sensor_telemetry"

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(80), nullable=False, default="AGRI-ESP32-001")
    farm_id = db.Column(db.String(80), nullable=False, default="sathyala-farm-001")
    soil_moisture_pct = db.Column(db.Float, nullable=False, default=34.0)
    soil_depth_cm = db.Column(db.Float, nullable=False, default=15.0)
    soil_temperature_c = db.Column(db.Float, nullable=False, default=29.4)
    canopy_temperature_c = db.Column(db.Float, nullable=True, default=30.8)
    ambient_temperature_c = db.Column(db.Float, nullable=False, default=32.1)
    humidity_pct = db.Column(db.Float, nullable=False, default=68.0)
    battery_pct = db.Column(db.Float, nullable=False, default=88.0)
    signal_strength_dbm = db.Column(db.String(30), nullable=False, default="-65 dBm")
    recorded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def get_status(self) -> str:
        """
        Calculates connection status based on data freshness:
        - Online: <= 5 minutes (300 seconds)
        - Stale: > 5 minutes and <= 30 minutes (1800 seconds)
        - Offline: > 30 minutes
        """
        if not self.recorded_at:
            return "offline"
        rec_time = self.recorded_at
        if rec_time.tzinfo is None:
            rec_time = rec_time.replace(tzinfo=timezone.utc)
        diff_sec = (datetime.now(timezone.utc) - rec_time).total_seconds()
        if diff_sec <= 300:
            return "online"
        elif diff_sec <= 1800:
            return "stale"
        else:
            return "offline"

    def to_dict(self):
        status = self.get_status()
        rec_iso = self.recorded_at.isoformat() if self.recorded_at else datetime.now(timezone.utc).isoformat()
        return {
            "id": self.id,
            "device_id": self.device_id,
            "farm_id": self.farm_id,
            "soil_moisture_pct": self.soil_moisture_pct,
            "soil_depth_cm": self.soil_depth_cm,
            "soil_temperature_c": self.soil_temperature_c,
            "canopy_temperature_c": self.canopy_temperature_c,
            "ambient_temperature_c": self.ambient_temperature_c,
            "humidity_pct": self.humidity_pct,
            "battery_pct": self.battery_pct,
            "signal_strength_dbm": self.signal_strength_dbm,
            "recorded_at": rec_iso,
            "online": status == "online",
            "status": status,
            "last_seen": rec_iso,
            # Frontend camelCase aliases for backward compatibility
            "batteryPercent": self.battery_pct,
            "soilMoisture": self.soil_moisture_pct,
            "soilTemp": self.soil_temperature_c,
            "ambientTemp": self.ambient_temperature_c,
            "humidity": self.humidity_pct,
            "signalStrength": self.signal_strength_dbm,
            "lastSync": "Just now" if status == "online" else (f"{int((datetime.now(timezone.utc) - (self.recorded_at.replace(tzinfo=timezone.utc) if self.recorded_at.tzinfo is None else self.recorded_at)).total_seconds() // 60)} mins ago")
        }

