import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    # Search backend .env first, then root .env
    backend_env = Path(__file__).resolve().parent / ".env"
    root_env = Path(__file__).resolve().parents[2] / ".env"
    if backend_env.exists():
        load_dotenv(dotenv_path=backend_env)
    elif root_env.exists():
        load_dotenv(dotenv_path=root_env)
    else:
        load_dotenv()
except ImportError:
    pass

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
    
    # Weather (OpenWeatherMap)
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
    
    # IoT MQTT & HiveMQ Cloud
    HIVEMQ_API_KEY = os.getenv("HIVEMQ_API_KEY", "")
    MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
    MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
    MQTT_TOPIC = os.getenv("MQTT_TOPIC", "agrin/sensors/soil")
