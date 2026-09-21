"""AgriN Route Blueprints."""
from .advisory import advisory_bp
from .diagnose import diagnose_bp
from .soil_data import soil_data_bp
from .weather_data import weather_data_bp
from .localize import localize_bp

__all__ = [
    "advisory_bp",
    "diagnose_bp",
    "soil_data_bp",
    "weather_data_bp",
    "localize_bp"
]
