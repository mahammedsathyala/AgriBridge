"""
AgriN Advisory Engine (MVP 1: Static Rules Engine)
--------------------------------------------------
Delivers localized, regenerative crop and agricultural practice recommendations
based on manual soil type, weather condition, and seasonal inputs.

Designed for smallholder and marginal farmers in emerging economies (BRICS / Global South).
"""

from typing import Dict, Any, List


# Regenerative crop knowledge base indexed by agro-ecological suitability
CROPS_DATABASE: Dict[str, Dict[str, Any]] = {
    "pearl_millet": {
        "crop": "Pearl Millet (Bajra / Pennisetum glaucum)",
        "category": "Climate-Resilient C4 Cereal",
        "suitable_soils": ["sandy", "sandy_loam", "arid", "red", "shallow"],
        "suitable_weather": ["dry", "semi_arid", "drought", "hot", "moderate"],
        "suitable_seasons": ["kharif", "monsoon", "summer", "zaid"],
        "companion_crop": "Cowpea (Vigna unguiculata) or Moth Bean",
        "soil_regeneration_practices": [
            "Residue retention mulching to prevent wind erosion",
            "Broad-bed and furrow (BBF) planting for in-situ moisture conservation",
            "Minimum tillage to preserve soil aggregate stability"
        ],
        "water_management": "Tolerates dry spells up to 3-4 weeks; supplemental light irrigation at flowering if rainfall drops below 150mm.",
        "expected_soil_benefits": "High root biomass adds 1.5-2.0 tons/ha organic matter, preventing topsoil erosion in light soils.",
        "rationale": "Pearl millet thrives in moisture-deficit, high-heat conditions with poor sandy soils where conventional cereals fail."
    },
    "pigeon_pea": {
        "crop": "Pigeon Pea (Arhar / Red Gram / Cajanus cajan)",
        "category": "Deep-Rooted Nitrogen Fixer",
        "suitable_soils": ["loam", "clay_loam", "black", "red", "alluvial"],
        "suitable_weather": ["moderate", "semi_arid", "dry", "wet"],
        "suitable_seasons": ["kharif", "monsoon"],
        "companion_crop": "Sorghum or Finger Millet (Intercropping ratio 1:2)",
        "soil_regeneration_practices": [
            "Inoculation with Rhizobium culture prior to sowing",
            "Sub-surface biological ploughing via deep taproots",
            "Leaf fall biomass incorporation (adds ~30-40 kg N/ha equivalent organic matter)"
        ],
        "water_management": "Deep taproot system (up to 2m) accesses subsoil moisture; requires good surface drainage to prevent waterlogging.",
        "expected_soil_benefits": "Fixes up to 40 kg atmospheric N/ha; root channels break hardpans and improve water infiltration.",
        "rationale": "Pigeon pea acts as a biological subsoiler and natural nitrogen factory, ideal for rejuvenating depleted soils."
    },
    "sorghum": {
        "crop": "Sorghum (Jowar / Sorghum bicolor)",
        "category": "Drought-Tolerant Biomass Cereal",
        "suitable_soils": ["black", "clay", "clay_loam", "loam", "alluvial"],
        "suitable_weather": ["dry", "moderate", "semi_arid"],
        "suitable_seasons": ["kharif", "rabi", "monsoon"],
        "companion_crop": "Soybean or Green Gram (Moong)",
        "soil_regeneration_practices": [
            "Strip cropping with leguminous green gram",
            "Mulching with chopped crop stalks post-harvest",
            "Conservation tillage to retain black soil moisture"
        ],
        "water_management": "Requires 350-450mm water; highly efficient water-use index compared to maize or paddy.",
        "expected_soil_benefits": "Extensive fibrous root network binds soil particles, reducing run-off and sediment loss on slopes.",
        "rationale": "Sorghum is highly adapted to heavy black and clay soils that crack during dry spells, maintaining canopy cover."
    },
    "chickpea": {
        "crop": "Chickpea (Bengal Gram / Cicer arietinum)",
        "category": "Cool-Season Pulse & Nitrogen Fixer",
        "suitable_soils": ["loam", "clay_loam", "black", "alluvial", "silt"],
        "suitable_weather": ["dry", "moderate", "cool", "cold"],
        "suitable_seasons": ["rabi", "winter"],
        "companion_crop": "Mustard (Brassica juncea) as trap crop (ratio 4:1) or Linseed",
        "soil_regeneration_practices": [
            "Zero-till sowing into standing paddy or cereal stubble",
            "Bio-fertilizer seed coating (Mesorhizobium + PSB)",
            "Application of farmyard manure or vermicompost (2 t/ha)"
        ],
        "water_management": "Relies primarily on residual soil moisture; requires 1-2 critical life-saving irrigations if winter rains fail.",
        "expected_soil_benefits": "Enhances soil phosphorus solubilization via root exudates (citric and malic acids).",
        "rationale": "Chickpea excels in rabi post-monsoon residual moisture conditions, rebuilding soil fertility between major cycles."
    },
    "green_gram": {
        "crop": "Green Gram (Moong Bean / Vigna radiata)",
        "category": "Short-Duration Catch & Cover Crop",
        "suitable_soils": ["loam", "sandy_loam", "alluvial", "red"],
        "suitable_weather": ["moderate", "dry", "warm", "hot"],
        "suitable_seasons": ["zaid", "summer", "kharif"],
        "companion_crop": "Sesame (Til) or Maize as border shield",
        "soil_regeneration_practices": [
            "Green manuring: incorporation of crop residue directly into soil after pod harvest",
            "Light straw mulching to control soil temperature",
            "Minimum tillage with seed drill"
        ],
        "water_management": "Matures quickly (55-65 days); requires only 2-3 light irrigations during summer heat.",
        "expected_soil_benefits": "Rapid ground cover halts weed germination and fixes 30-35 kg N/ha in 60 days.",
        "rationale": "Ideal short-cycle summer crop that turns barren fallow land into a living mulch and nitrogen reservoir."
    },
    "finger_millet": {
        "crop": "Finger Millet (Ragi / Eleusine coracana)",
        "category": "Nutri-Cereal & Heavy Soil Cover",
        "suitable_soils": ["red", "laterite", "sandy_loam", "loam"],
        "suitable_weather": ["moderate", "wet", "humid", "semi_arid"],
        "suitable_seasons": ["kharif", "monsoon"],
        "companion_crop": "Field Bean (Lablab purpureus) or Groundnut",
        "soil_regeneration_practices": [
            "System of Ragi Intensification (SRI) spacing (25cm x 25cm)",
            "Inter-cultivation using rotary weeder to aerate topsoil",
            "Compost tea or Jeevamrutha microbial spray"
        ],
        "water_management": "High drought endurance once established; tolerates moderate temporary waterlogging.",
        "expected_soil_benefits": "High root density improves soil structure, aeration, and carbon sequestration in acidic red soils.",
        "rationale": "Ragi is exceptionally tolerant to marginal fertility and acidic soils common in tropical red soil belts."
    },
    "mustard_cover": {
        "crop": "Indian Mustard / Brown Mustard (Brassica juncea)",
        "category": "Bio-fumigant & Cool Season Cash Crop",
        "suitable_soils": ["loam", "alluvial", "sandy_loam", "clay_loam"],
        "suitable_weather": ["moderate", "dry", "cool", "cold"],
        "suitable_seasons": ["rabi", "winter"],
        "companion_crop": "Wheat or Chickpea (strip intercropping)",
        "soil_regeneration_practices": [
            "Incorporation of green biomass prior to seed set for bio-fumigation",
            "Conservation tillage to retain dew and light winter rain",
            "Sulfur-enriched organic compost application"
        ],
        "water_management": "Low water requirement (200-250mm); 2 irrigations (flowering and siliqua development).",
        "expected_soil_benefits": "Glucosinolates in root exudates naturally suppress soil-borne fungal pathogens and nematodes.",
        "rationale": "Natural bio-fumigation properties cleanse the soil microbiome while yielding cold-season oilseed output."
    },
    "sesbania_dhaincha": {
        "crop": "Dhaincha / Green Manure (Sesbania aculeata)",
        "category": "Soil Reclaiming Green Manure",
        "suitable_soils": ["clay", "saline", "waterlogged", "alkaline", "black"],
        "suitable_weather": ["wet", "humid", "high_rainfall", "moderate"],
        "suitable_seasons": ["kharif", "zaid", "summer"],
        "companion_crop": "Direct incorporation (monoculture green manure before main cereal)",
        "soil_regeneration_practices": [
            "Ploughing into soil at 45-50 days (before woody stem development)",
            "Flooding field for rapid decomposition and soil softening",
            "Integration with gypsum for sodic/alkali soil remediation"
        ],
        "water_management": "Thrives in standing water or flooded basins; high salt tolerance.",
        "expected_soil_benefits": "Fixes 80-120 kg N/ha and adds 20-25 tonnes of wet biomass per hectare; lowers soil pH in alkaline soils.",
        "rationale": "Powerhouse green manure engineered by nature to remediate hard, saline, or waterlogged clay soils."
    }
}


def normalize_token(text: Any) -> str:
    """Normalize input strings into standard lookup tokens."""
    if not text or not isinstance(text, str):
        return ""
    clean = text.strip().lower().replace("-", "_").replace(" ", "_")
    
    # Map common synonyms
    synonym_map = {
        # Soil mappings
        "sand": "sandy",
        "coarse": "sandy",
        "clayey": "clay",
        "heavy_clay": "clay",
        "black_cotton": "black",
        "vertisol": "black",
        "red_soil": "red",
        "loamy": "loam",
        "silty": "silt",
        "riverbed": "alluvial",
        
        # Weather mappings
        "arid": "dry",
        "rainy": "wet",
        "heavy_rain": "wet",
        "high_rainfall": "wet",
        "monsoonal": "wet",
        "normal": "moderate",
        "mild": "moderate",
        "drought_prone": "dry",
        "hot_dry": "dry",
        "chilly": "cool",
        "winter_chill": "cold",
        
        # Season mappings
        "monsoon": "kharif",
        "rainy_season": "kharif",
        "winter": "rabi",
        "post_monsoon": "rabi",
        "summer": "zaid",
        "pre_monsoon": "zaid",
        "spring": "zaid"
    }
    return synonym_map.get(clean, clean)


def score_crop(
    crop_data: Dict[str, Any],
    soil: str,
    weather: str,
    season: str
) -> int:
    """Calculate agro-ecological suitability score (0 - 100)."""
    score = 0
    
    # Soil match (40% weight)
    if soil in crop_data["suitable_soils"]:
        score += 40
    elif any(s in soil for s in crop_data["suitable_soils"]):
        score += 25
    else:
        score += 10  # Baseline adaptable penalty
        
    # Weather match (30% weight)
    if weather in crop_data["suitable_weather"]:
        score += 30
    elif any(w in weather for w in crop_data["suitable_weather"]):
        score += 20
    else:
        score += 8
        
    # Season match (30% weight)
    if season in crop_data["suitable_seasons"]:
        score += 30
    elif any(sn in season for sn in crop_data["suitable_seasons"]):
        score += 20
    else:
        score += 5
        
    return score


def get_rule_based_advisory(
    soil_type: str,
    weather: str,
    season: str,
    location: str = "Unspecified",
    **kwargs
) -> Dict[str, Any]:
    """
    Main rule evaluation entry point for MVP 1.
    
    Args:
        soil_type: Type of soil (e.g. 'sandy', 'clay', 'loam', 'black', 'red')
        weather: Prevailing weather/climate (e.g. 'dry', 'wet', 'moderate', 'cold')
        season: Agricultural season ('kharif', 'rabi', 'zaid', 'monsoon', 'winter')
        location: Optional location name
        **kwargs: Optional additional parameters (e.g. ph, rainfall, temperature)
    
    Returns:
        Structured dictionary adhering to AgriN advisory output format.
    """
    norm_soil = normalize_token(soil_type)
    norm_weather = normalize_token(weather)
    norm_season = normalize_token(season)
    
    scored_candidates = []
    for key, data in CROPS_DATABASE.items():
        suitability = score_crop(data, norm_soil, norm_weather, norm_season)
        scored_candidates.append({
            "key": key,
            "score": suitability,
            "data": data
        })
        
    # Sort descending by score
    scored_candidates.sort(key=lambda item: item["score"], reverse=True)
    
    # Select top 2-3 recommendations
    top_picks = scored_candidates[:3]
    
    recommendations: List[Dict[str, Any]] = []
    for rank, pick in enumerate(top_picks, start=1):
        d = pick["data"]
        recommendations.append({
            "rank": rank,
            "crop": d["crop"],
            "category": d["category"],
            "suitability_score": f"{pick['score']}%",
            "companion_crop": d["companion_crop"],
            "soil_regeneration_practices": d["soil_regeneration_practices"],
            "water_management": d["water_management"],
            "expected_soil_benefits": d["expected_soil_benefits"],
            "rationale": d["rationale"]
        })
        
    # Overarching regenerative guidance tailored to input conditions
    general_guidelines = [
        "Maintain continuous live root presence in the field using the recommended companion crop.",
        "Avoid deep inversion ploughing to preserve microbial mycorrhizal fungi networks.",
        "Apply local farmyard manure (FYM) or vermicompost combined with biochar to boost Cation Exchange Capacity (CEC)."
    ]
    
    if "dry" in norm_weather or "sandy" in norm_soil:
        general_guidelines.append(
            "Priority Moisture Action: Implement in-situ straw mulching (5-7 cm layer) to reduce soil surface evaporation by up to 35%."
        )
    elif "wet" in norm_weather or "clay" in norm_soil:
        general_guidelines.append(
            "Priority Drainage Action: Construct broad bed and furrows (BBF) to prevent root hypoxia while capturing runoff in secondary farm ponds."
        )

    return {
        "engine": "AgriN Static Rules Engine v1.0",
        "inputs_received": {
            "soil_type": soil_type,
            "weather": weather,
            "season": season,
            "location": location,
            "normalized_profile": {
                "soil": norm_soil,
                "weather": norm_weather,
                "season": norm_season
            }
        },
        "recommendation_count": len(recommendations),
        "recommendations": recommendations,
        "general_regenerative_guidelines": general_guidelines
    }
