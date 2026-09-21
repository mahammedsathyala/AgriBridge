import os

class Config:
    """Base application configuration."""
    DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")
    SECRET_KEY = os.getenv("SECRET_KEY", "agrin-dev-secret-key-2026")
    
    # Paths
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    MODELS_DIR = os.path.join(BASE_DIR, "models")
    SCHEMA_DIR = os.path.join(BASE_DIR, "schema")
    
    # Model config
    YOLO_MODEL_PATH = os.path.join(MODELS_DIR, "yolov8_crop_disease.pt")
    
    # API endpoints (MVP 2 stubs)
    OPEN_METEO_URL = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")
    SOILGRIDS_URL = os.getenv("SOILGRIDS_BASE_URL", "https://rest.isric.org/soilgrids/v2.0")
    
    # LLM (MVP 4 stub)
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
