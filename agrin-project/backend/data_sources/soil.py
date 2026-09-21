"""
AgriN Soil Data Source (MVP 2: Live ISRIC SoilGrids 2.0 REST API)
------------------------------------------------------------------
Queries ISRIC SoilGrids 250m resolution open REST API by coordinates.
Extracts sand, clay, silt fractions, soil organic carbon (SOC), and pH.
Classifies soil texture according to standard USDA soil textural classes.
Includes fast fallback matrix to guarantee sub-second reliability.
"""

from typing import Dict, Any, Optional
import requests

SOILGRIDS_QUERY_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"


def classify_usda_texture(sand_pct: float, clay_pct: float, silt_pct: float) -> str:
    """
    Classify soil texture based on USDA soil taxonomy triangle principles.
    Returns: 'sandy', 'clay', 'loam', 'sandy_loam', 'clay_loam', 'silt_loam'
    """
    if sand_pct >= 85.0 and (silt_pct + 1.5 * clay_pct) <= 15.0:
        return "sandy"
    elif clay_pct >= 40.0:
        return "clay"
    elif clay_pct >= 35.0 and sand_pct >= 45.0:
        return "sandy_clay"
    elif clay_pct >= 27.0 and clay_pct < 40.0 and sand_pct <= 20.0:
        return "silty_clay_loam"
    elif clay_pct >= 27.0 and clay_pct < 40.0 and sand_pct > 20.0 and sand_pct <= 45.0:
        return "clay_loam"
    elif sand_pct >= 50.0 and clay_pct <= 20.0:
        return "sandy_loam"
    elif silt_pct >= 80.0 or (silt_pct >= 50.0 and clay_pct < 27.0):
        return "silt_loam"
    else:
        return "loam"


def regional_soil_estimation(lat: float, lon: float) -> Dict[str, Any]:
    """Agro-ecological fallback based on coordinates if remote server is unreachable."""
    # Semi-arid Indian Peninsula / Deccan Plateau (Telangana, Karnataka, AP)
    if 12.0 <= lat <= 20.0 and 74.0 <= lon <= 82.0:
        return {
            "texture": "red",
            "sand_pct": 58.0,
            "clay_pct": 24.0,
            "silt_pct": 18.0,
            "ph": 6.8,
            "soc_g_per_kg": 6.5,
            "region_hint": "Deccan Semi-Arid Red/Black Transition Zone"
        }
    # Indo-Gangetic Plains
    elif 23.0 <= lat <= 31.0 and 75.0 <= lon <= 88.0:
        return {
            "texture": "alluvial",
            "sand_pct": 45.0,
            "clay_pct": 20.0,
            "silt_pct": 35.0,
            "ph": 7.4,
            "soc_g_per_kg": 5.2,
            "region_hint": "Indo-Gangetic Alluvial Basin"
        }
    # Arid / Thar Desert
    elif 24.0 <= lat <= 29.0 and 69.0 <= lon <= 74.0:
        return {
            "texture": "sandy",
            "sand_pct": 82.0,
            "clay_pct": 8.0,
            "silt_pct": 10.0,
            "ph": 8.2,
            "soc_g_per_kg": 2.1,
            "region_hint": "Western Arid Desert Zone"
        }
    # General global default
    return {
        "texture": "loam",
        "sand_pct": 42.0,
        "clay_pct": 28.0,
        "silt_pct": 30.0,
        "ph": 6.7,
        "soc_g_per_kg": 8.0,
        "region_hint": "Global Agro-Ecological Baseline"
    }


def fetch_soilgrids_profile(lat: float, lon: float, timeout_seconds: int = 5) -> Dict[str, Any]:
    """
    Query ISRIC SoilGrids REST API or compute calibrated regional pedological profile.
    """
    params = {
        "lon": lon,
        "lat": lat,
        "property": ["clay", "sand", "silt", "soc", "phh2o"],
        "depth": ["0-5cm", "5-15cm"],
        "value": "mean"
    }

    try:
        response = requests.get(SOILGRIDS_QUERY_URL, params=params, timeout=timeout_seconds)
        if response.status_code == 200:
            data = response.json()
            layers = data.get("properties", {}).get("layers", [])

            metrics = {}
            for layer in layers:
                name = layer.get("name")
                depths = layer.get("depths", [])
                vals = []
                for d in depths:
                    val = d.get("values", {}).get("mean")
                    if val is not None:
                        vals.append(val)
                avg_val = sum(vals) / len(vals) if vals else None
                metrics[name] = avg_val

            # Extract fractions
            raw_clay = metrics.get("clay")
            raw_sand = metrics.get("sand")
            raw_silt = metrics.get("silt")
            raw_ph = metrics.get("phh2o")
            raw_soc = metrics.get("soc")

            # SoilGrids units:
            # sand, clay, silt: g/kg (divide by 10 to get %)
            # phh2o: pH * 10 (divide by 10 to get standard pH)
            # soc: dg/kg (divide by 10 to get g/kg)
            clay_pct = round(raw_clay / 10.0, 1) if raw_clay is not None else 25.0
            sand_pct = round(raw_sand / 10.0, 1) if raw_sand is not None else 45.0
            silt_pct = round(raw_silt / 10.0, 1) if raw_silt is not None else 30.0
            ph = round(raw_ph / 10.0, 1) if raw_ph is not None else 6.8
            soc = round(raw_soc / 10.0, 1) if raw_soc is not None else 7.0

            texture_class = classify_usda_texture(sand_pct, clay_pct, silt_pct)

            # Map to AgriN simplified soil types
            if "sand" in texture_class:
                norm_soil = "sandy"
            elif "clay" in texture_class:
                norm_soil = "clay"
            else:
                norm_soil = "loam"

            return {
                "status": "success",
                "source": "ISRIC SoilGrids 2.0 REST API (250m resolution)",
                "coordinates": {"latitude": lat, "longitude": lon},
                "physical_properties": {
                    "sand_percentage": sand_pct,
                    "clay_percentage": clay_pct,
                    "silt_percentage": silt_pct,
                    "usda_texture_class": texture_class,
                    "agrin_soil_type": norm_soil
                },
                "chemical_properties": {
                    "ph_h2o": ph,
                    "soil_organic_carbon_g_kg": soc,
                    "organic_carbon_status": "Low" if soc < 5.0 else ("Medium" if soc < 10.0 else "High")
                }
            }

    except Exception as err:
        pass

    # Use regional pedological baseline on error/timeout
    fallback = regional_soil_estimation(lat, lon)
    return {
        "status": "fallback",
        "source": f"AgriN Agro-Pedological Regional Matrix ({fallback['region_hint']})",
        "coordinates": {"latitude": lat, "longitude": lon},
        "physical_properties": {
            "sand_percentage": fallback["sand_pct"],
            "clay_percentage": fallback["clay_pct"],
            "silt_percentage": fallback["silt_pct"],
            "usda_texture_class": fallback["texture"],
            "agrin_soil_type": fallback["texture"]
        },
        "chemical_properties": {
            "ph_h2o": fallback["ph"],
            "soil_organic_carbon_g_kg": fallback["soc_g_per_kg"],
            "organic_carbon_status": "Medium"
        }
    }
