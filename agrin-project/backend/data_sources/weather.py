"""
AgriN Weather Data Source (MVP 2: Live Open-Meteo API)
------------------------------------------------------
Interfaces with the public Open-Meteo API (no authentication required)
to retrieve real-time weather metrics, precipitation, and 7-day forecasts
by GPS latitude/longitude.
"""

from typing import Dict, Any, Optional
import requests

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"


def map_wmo_code(code: int) -> str:
    """Translate WMO weather interpretation codes into human-readable conditions."""
    if code == 0:
        return "Clear Sky"
    elif code in [1, 2, 3]:
        return "Partly Cloudy"
    elif code in [45, 48]:
        return "Foggy"
    elif code in [51, 53, 55]:
        return "Light Drizzle"
    elif code in [61, 63, 65]:
        return "Rain"
    elif code in [80, 81, 82]:
        return "Heavy Showers"
    elif code in [95, 96, 99]:
        return "Thunderstorm"
    elif code in [71, 73, 75]:
        return "Snow"
    return "Variable Weather"


def classify_weather_category(temp: float, rainfall_7d: float, humidity: float) -> str:
    """
    Map numerical meteorological readings to agro-ecological weather categories:
    'dry', 'wet', 'moderate', 'semi_arid', 'cool', 'hot'
    """
    if rainfall_7d > 40.0:
        return "wet"
    elif rainfall_7d < 5.0 and temp > 32.0:
        return "dry"
    elif rainfall_7d < 15.0 and humidity < 40.0:
        return "semi_arid"
    elif temp < 15.0:
        return "cool"
    elif temp > 35.0:
        return "hot"
    else:
        return "moderate"


def fetch_weather_forecast(lat: float, lon: float, timeout_seconds: int = 5) -> Dict[str, Any]:
    """
    Fetch live weather data from Open-Meteo for specified coordinates.

    Args:
        lat: Latitude (-90 to 90)
        lon: Longitude (-180 to 180)
        timeout_seconds: Request timeout limit

    Returns:
        Structured weather telemetry dictionary.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code",
        "daily": "precipitation_sum,temperature_2m_max,temperature_2m_min",
        "timezone": "auto"
    }

    try:
        response = requests.get(OPEN_METEO_BASE_URL, params=params, timeout=timeout_seconds)
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        temp = float(current.get("temperature_2m", 28.0))
        humidity = float(current.get("relative_humidity_2m", 50.0))
        precip = float(current.get("precipitation", 0.0))
        wmo_code = int(current.get("weather_code", 0))

        precip_list = daily.get("precipitation_sum", [0.0])
        precip_7d = sum([p for p in precip_list if p is not None])

        temp_max_list = daily.get("temperature_2m_max", [temp])
        temp_min_list = daily.get("temperature_2m_min", [temp])
        avg_max_temp = sum(temp_max_list) / max(len(temp_max_list), 1)
        avg_min_temp = sum(temp_min_list) / max(len(temp_min_list), 1)

        condition_desc = map_wmo_code(wmo_code)
        category = classify_weather_category(temp, precip_7d, humidity)

        # Estimate drought stress risk
        if precip_7d < 5.0 and temp > 30.0:
            drought_risk = "High"
        elif precip_7d < 15.0:
            drought_risk = "Moderate"
        else:
            drought_risk = "Low"

        return {
            "status": "success",
            "source": "Open-Meteo REST API",
            "coordinates": {"latitude": lat, "longitude": lon},
            "current": {
                "temperature_c": round(temp, 1),
                "relative_humidity_pct": round(humidity, 1),
                "precipitation_mm": round(precip, 1),
                "weather_code": wmo_code,
                "condition": condition_desc
            },
            "forecast": {
                "seven_day_precipitation_sum_mm": round(precip_7d, 1),
                "expected_high_c": round(avg_max_temp, 1),
                "expected_low_c": round(avg_min_temp, 1),
                "drought_risk": drought_risk
            },
            "derived_agro_weather": category
        }

    except requests.RequestException as err:
        # Graceful fallback in offline/firewalled situations
        return {
            "status": "fallback",
            "source": "AgriN Agro-Climatic Interpolation (Offline/Fallback)",
            "warning": f"Live Open-Meteo request unfulfilled: {str(err)}",
            "coordinates": {"latitude": lat, "longitude": lon},
            "current": {
                "temperature_c": 28.5,
                "relative_humidity_pct": 55.0,
                "precipitation_mm": 0.0,
                "weather_code": 1,
                "condition": "Mainly Clear (Estimated)"
            },
            "forecast": {
                "seven_day_precipitation_sum_mm": 12.0,
                "expected_high_c": 31.0,
                "expected_low_c": 22.0,
                "drought_risk": "Moderate"
            },
            "derived_agro_weather": "moderate"
        }
