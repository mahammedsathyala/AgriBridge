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
