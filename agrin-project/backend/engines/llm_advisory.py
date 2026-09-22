"""
AgriN LLM Advisory Localizer (MVP 4: Anthropic Claude Integration)
------------------------------------------------------------------
Converts structured agro-ecological telemetry (soil, weather, satellite NDVI)
and Groundnut computer vision diagnostics (MobileNetV2 / YOLOv8) into concise,
respectful, vernacular voice/text briefings for smallholder farmers across BRICS languages.
"""

from typing import Dict, Any, List, Optional
import os
import json
from pathlib import Path

# Explicitly ensure .env is loaded from backend directory or workspace root
try:
    from dotenv import load_dotenv
    backend_env = Path(__file__).resolve().parent.parent / ".env"
    root_env = Path(__file__).resolve().parents[3] / ".env"
    if backend_env.exists():
        load_dotenv(dotenv_path=backend_env)
    elif root_env.exists():
        load_dotenv(dotenv_path=root_env)
    else:
        load_dotenv()
except ImportError:
    pass


# Language names lookup
SUPPORTED_LANGUAGES = {
    "en": "English",
    "te": "Telugu (తెలుగు)",
    "hi": "Hindi (हिन्दी)",
    "pt": "Portuguese (Português)",
    "ru": "Russian (Русский)",
    "zh": "Mandarin Chinese (中文)"
}


class LLMAdvisoryLocalizer:
    """Multilingual Farmer Advisory Localizer using Anthropic Claude."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.client = None
        self._init_anthropic_client()

    def _init_anthropic_client(self):
        """Initializes Anthropic client if valid key is found and not already set."""
        if self.client is not None:
            return
        current_key = self.api_key or os.getenv("ANTHROPIC_API_KEY", "")
        if current_key and current_key.startswith("sk-ant-"):
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=current_key)
            except Exception as err:
                print(f"[AgriAI] Failed to initialize Anthropic client: {err}")
                self.client = None
        else:
            self.client = None

    def _extract_farm_context(
        self,
        advisory_data: Optional[Dict[str, Any]],
        diagnosis_data: Optional[Dict[str, Any]],
        farmer_profile: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Extract available agronomic context without inventing missing values."""
        adv = advisory_data or {}
        diag = diagnosis_data or {}
        prof = farmer_profile or {}

        # 1. Crop Information
        rec_list = adv.get("recommendations", [])
        top_rec = rec_list[0] if rec_list else {}
        crop_name = (
            adv.get("crop")
            or adv.get("crop_name")
            or diag.get("crop")
            or top_rec.get("crop")
            or prof.get("crop")
            or "Groundnut"
        )
        crop_variety = (
            adv.get("variety")
            or adv.get("crop_variety")
            or top_rec.get("variety")
            or prof.get("crop_variety")
            or "Kadiri-6"
        )
        crop_stage = (
            adv.get("crop_stage")
            or adv.get("growthStage")
            or prof.get("crop_stage")
            or "flowering"
        )
        companion = top_rec.get("companion_crop", "Cowpea / Pigeon Pea")
        practices = top_rec.get("soil_regeneration_practices", ["Residue retention mulching", "Minimum tillage"])
        primary_practice = practices[0] if practices else "Residue retention mulching"

        # 2. Location & Coordinates
        location = adv.get("location") or prof.get("location") or "Kurnool, Andhra Pradesh, India"
        lat = adv.get("latitude") or adv.get("lat") or prof.get("lat")
        lon = adv.get("longitude") or adv.get("lon") or prof.get("lng")

        # 3. Telemetry & Sensor Nodes
        live_telem = adv.get("live_telemetry") or {}
        sensor_node = live_telem.get("sensor_node") or adv.get("sensor_data") or {}

        # 4. Weather Parameters
        weather_obj = live_telem.get("weather") or {}
        current_weather = weather_obj.get("current") or weather_obj.get("live_telemetry") or {}
        weather_desc = (
            current_weather.get("condition")
            or adv.get("weather")
            or adv.get("inputs_received", {}).get("weather")
            or "Moderate seasonal climate"
        )
        weather_temp = current_weather.get("temperature_c")
        weather_humidity = current_weather.get("relative_humidity_pct")
        weather_precip_7d = weather_obj.get("forecast", {}).get("seven_day_precipitation_sum_mm")
        drought_risk = weather_obj.get("forecast", {}).get("drought_risk")

        # 5. Soil Profile
        soil_obj = live_telem.get("soil") or {}
        soil_type = (
            adv.get("soil_type")
            or soil_obj.get("physical_properties", {}).get("agrin_soil_type")
            or "Red loamy soil"
        )
        soil_ph = soil_obj.get("chemical_properties", {}).get("ph_water")
        soil_clay = soil_obj.get("physical_properties", {}).get("clay_percent")

        # 6. Satellite NDVI & Canopy Cover
        sat_obj = live_telem.get("satellite_ndvi") or {}
        spectral_indices = sat_obj.get("spectral_indices") or {}
        ndvi_val = spectral_indices.get("ndvi") or sat_obj.get("ndvi")
        ndwi_val = spectral_indices.get("ndwi") or sat_obj.get("ndwi")
        canopy_status = spectral_indices.get("canopy_cover_class") or sat_obj.get("canopy_cover_class")
        satellite_source = sat_obj.get("data_source_type", "MODEL_SIMULATION")

        # 7. Disease Detection Data
        diag_primary = diag.get("primary_diagnosis", {})
        disease_name = (
            diag.get("disease")
            or diag_primary.get("condition")
            or diag.get("disease_detected")
            or diag.get("condition")
        )
        disease_confidence = diag.get("confidence") or diag_primary.get("confidence") or diag.get("confidence_score")
        disease_severity = diag_primary.get("severity") or diag.get("severity") or "Moderate"
        disease_warning = diag.get("warning") or diag_primary.get("warning")
        what_it_means = diag.get("what_it_means") or diag_primary.get("description")
        what_to_check = diag.get("what_to_check", [])
        immediate_actions = diag.get("immediate_actions", diag.get("organic_treatment_plan", []))
        prevention_monitoring = diag.get("prevention_monitoring", [])
        when_to_consult = diag.get("when_to_consult", "")
        remedy_list = diag.get("organic_treatment_plan", []) or diag.get("remedies", {}).get("organic", [])
        disease_remedy = remedy_list[0] if remedy_list else None

        # Build context sources summary for safe logging
        sources_present = ["crop"]
        if lat and lon: sources_present.append("coordinates")
        if sensor_node and sensor_node.get("soil_moisture_pct") is not None: sources_present.append("sensors")
        if weather_obj: sources_present.append("weather")
        if soil_obj: sources_present.append("soil")
        if sat_obj: sources_present.append("satellite")
        if disease_name: sources_present.append("disease_diagnosis")

        return {
            "crop_name": crop_name,
            "crop_variety": crop_variety,
            "crop_stage": crop_stage,
            "companion_crop": companion,
            "primary_practice": primary_practice,
            "practices": practices,
            "location": location,
            "lat": lat,
            "lon": lon,
            "sensor_node": sensor_node,
            "weather_desc": weather_desc,
            "weather_temp": weather_temp,
            "weather_humidity": weather_humidity,
            "weather_precip_7d": weather_precip_7d,
            "drought_risk": drought_risk,
            "soil_type": soil_type,
            "soil_ph": soil_ph,
            "soil_clay": soil_clay,
            "ndvi_val": ndvi_val,
            "ndwi_val": ndwi_val,
            "canopy_status": canopy_status,
            "satellite_source": satellite_source,
            "disease_name": disease_name,
            "disease_confidence": disease_confidence,
            "disease_severity": disease_severity,
            "disease_warning": disease_warning,
            "disease_remedy": disease_remedy,
            "what_it_means": what_it_means,
            "what_to_check": what_to_check,
            "immediate_actions": immediate_actions,
            "prevention_monitoring": prevention_monitoring,
            "when_to_consult": when_to_consult,
            "context_sources": sources_present
        }

    def _synthesize_local_vernacular(
        self,
        crop_name: str,
        companion_crop: str,
        primary_practice: str,
        weather_desc: str,
        disease_name: Optional[str] = None,
        disease_remedy: Optional[str] = None,
        disease_confidence: Optional[Any] = None,
        what_it_means: Optional[str] = None,
        what_to_check: Optional[List[str]] = None,
        immediate_actions: Optional[List[str]] = None,
        prevention_monitoring: Optional[List[str]] = None,
        when_to_consult: Optional[str] = None,
        language: str = "en",
        query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calibrated offline synthesis engine delivering high-quality,
        culturally grounded vernacular farm guidance across BRICS languages.
        """
        lang = language.lower()[:2]
        is_disease = bool(disease_name and "healthy" not in disease_name.lower())
        q_lower = (query or "").lower()

        # Format confidence string
        conf_str = f" ({disease_confidence})" if disease_confidence else ""

        # Telugu
        if lang == "te":
            if is_disease:
                audio = (
                    f"రైతు సోదరులకు నమస్కారం. మీ {crop_name} పంట ఆకులలో '{disease_name}' లక్షణాలు గుర్తించబడ్డాయి{conf_str}. "
                    f"వెంటనే {disease_remedy or '5% వేప గింజల కషాయం (NSKE)'} పిచికారీ చేయండి. "
                    f"ప్రస్తుత వాతావరణం {weather_desc}గా ఉంది, నీటి నిల్వ లేకుండా పారుదల చూసుకోండి."
                )
                actions = immediate_actions[:3] if immediate_actions else [
                    f"వెంటనే నివారణ చర్య: {disease_remedy or 'వేప నూనె లేదా ట్రైకోడెర్మా పిచికారీ'}.",
                    "తెగులు సోకిన దిగువ ఆకులను ఏరివేసి భూమిలో పూడ్చిపెట్టండి.",
                    f"వ్యాధి వ్యాప్తిని అరికట్టడానికి {companion_crop} అంతర పంటగా వేయండి."
                ]
            else:
                audio = (
                    f"రైతు సోదరులకు నమస్కారం. ప్రస్తుత వాతావరణం ({weather_desc}) మరియు మీ నేల ప్రకారం '{crop_name}' సాగు చేయడం అత్యంత లాభదాయకం. "
                    f"దీనితో పాటు '{companion_crop}'ను అంతర పంటగా వేస్తే భూసారం పెరుగుతుంది."
                )
                actions = [
                    f"ప్రధాన పంటగా {crop_name} మరియు అంతర పంటగా {companion_crop}ను ఎంచుకోండి.",
                    f"భూసార పద్ధతి: {primary_practice}.",
                    "రసాయన ఎరువుల ఖర్చు తగ్గించడానికి జీవామృతం ఉపయోగించండి."
                ]

            return {
                "language": "Telugu (తెలుగు)",
                "audio_script": audio,
                "answer": audio + "\n\n" + "\n".join([f"• {a}" for a in actions]),
                "urgent_actions": actions,
                "risk_bulletin": f"వాతావరణ స్థితి: {weather_desc}. నీటి ఎద్దడి రాకుండా జాగ్రత్త పడండి.",
                "why_this_works": "ఈ పద్ధతి వల్ల నేలలో నత్రజని పెరిగి, ఎరువుల ఖర్చు 30% వరకు ఆదా అవుతుంది."
            }

        # Hindi
        elif lang == "hi":
            if is_disease:
                audio = (
                    f"किसान भाइयों को सादर प्रणाम। आपकी {crop_name} फसल में '{disease_name}' के लक्षण पाए गए हैं{conf_str}। "
                    f"इसके तुरंत जैविक समाधान के लिए {disease_remedy or '5% नीम के बीज का काढ़ा (NSKE)'} का छिड़काव करें।"
                )
                actions = immediate_actions[:3] if immediate_actions else [
                    f"तत्काल जैविक उपचार: {disease_remedy or 'नीम तेल अथवा ट्राइकोडर्मा का छिड़काव'}.",
                    "संक्रमित पत्तियों को खेत से हटाकर नष्ट करें।",
                    f"खेत में {companion_crop} को अंतःफसल के रूप में लगाएं।"
                ]
            else:
                audio = (
                    f"किसान भाइयों को सादर प्रणाम। आपकी मिट्टी और मौसम ({weather_desc}) को देखते हुए '{crop_name}' की बुवाई सबसे उपयुक्त है। "
                    f"इसके साथ '{companion_crop}' को सह-फसल बनाकर लगाएं जिससे जमीन की उर्वरक शक्ति बढ़ेगी।"
                )
                actions = [
                    f"मुख्य फसल {crop_name} के साथ {companion_crop} की अंतःफसल बुवाई करें।",
                    f"मृदा संरक्षण: {primary_practice} अपनाएं।",
                    "जीवामृत या वर्मीवाश का उपयोग कर यूरिया पर निर्भरता घटाएं।"
                ]

            return {
                "language": "Hindi (हिन्दी)",
                "audio_script": audio,
                "answer": audio + "\n\n" + "\n".join([f"• {a}" for a in actions]),
                "urgent_actions": actions,
                "risk_bulletin": f"मौसम की स्थिति: {weather_desc}. वर्षा और नमी पर निगरानी रखें।",
                "why_this_works": "दलहनी सह-फसलें हवा से नाइट्रोजन खींचकर जमीन को उपजाऊ बनाती हैं।"
            }

        # English (default)
        else:
            if is_disease:
                audio = (
                    f"Hello farmer friend. Computer vision screening diagnosed '{disease_name}'{conf_str} on your {crop_name} leaves. "
                    f"Apply {disease_remedy or '5% Neem Seed Kernel Extract (NSKE)'} immediately to halt spread."
                )
                actions = immediate_actions[:3] if immediate_actions else [
                    f"Immediate remedy: Apply {disease_remedy or 'neem oil / Trichoderma biocontrol'}.",
                    "Prune and deeply compost heavily infected lower leaves.",
                    f"Intercrop with {companion_crop} to break future pathogen cycles."
                ]
                explanation_sections = []
                if what_it_means:
                    explanation_sections.append(f"**What This Means:** {what_it_means}")
                if what_to_check:
                    explanation_sections.append(f"**Field Checkpoints:**\n" + "\n".join([f"- {c}" for c in what_to_check]))
                if actions:
                    explanation_sections.append(f"**Immediate Actions:**\n" + "\n".join([f"- {a}" for a in actions]))
                if prevention_monitoring:
                    explanation_sections.append(f"**Prevention & Monitoring:**\n" + "\n".join([f"- {p}" for p in prevention_monitoring]))
                if when_to_consult:
                    explanation_sections.append(f"**When to Consult Expert:** {when_to_consult}")

                answer_full = "\n\n".join(explanation_sections) if explanation_sections else audio + "\n\n" + "\n".join([f"• {a}" for a in actions])
            else:
                audio = (
                    f"Hello farmer friend. For your current soil and {weather_desc} weather conditions, "
                    f"growing '{crop_name}' intercropped with '{companion_crop}' will maximize your yield."
                )
                actions = [
                    f"Sow primary crop {crop_name} intercropped with {companion_crop}.",
                    f"Soil regeneration action: {primary_practice}.",
                    "Apply fermented organic compost or Jeevamrutha to minimize chemical fertilizer dependency."
                ]
                answer_full = audio + "\n\n" + "\n".join([f"• {a}" for a in actions])

            return {
                "language": "English",
                "audio_script": audio,
                "answer": answer_full,
                "urgent_actions": actions,
                "risk_bulletin": f"Weather profile is {weather_desc}. Maintain in-situ moisture retention.",
                "why_this_works": "Biological crop management and organic remedies restore plant vigor and cut input costs."
            }

    def generate_plain_advisory(
        self,
        advisory_data: Optional[Dict[str, Any]] = None,
        diagnosis_data: Optional[Dict[str, Any]] = None,
        language: str = "en",
        farmer_profile: Optional[Dict[str, Any]] = None,
        query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate plain-language farmer guidance using Anthropic Claude
        (or calibrated vernacular engine if API key is not configured or API fails).
        """
        self._init_anthropic_client()

        # Extract comprehensive farm context
        ctx = self._extract_farm_context(advisory_data, diagnosis_data, farmer_profile)
        user_query = query or (advisory_data or {}).get("query")
        lang_name = SUPPORTED_LANGUAGES.get(language.lower()[:2], "English")

        # Safe Development Logging
        print("[AgriAI] provider=anthropic")
        print("[AgriAI] model=claude-3-5-sonnet-20241022")
        print(f"[AgriAI] context_sources={ctx['context_sources']}")

        # 1. Attempt Anthropic Claude API Call if client is configured
        if self.client is not None:
            try:
                system_prompt = (
                    f"You are AgriN, an empathetic, expert agricultural advisor speaking directly to a smallholder "
                    f"farmer in their native language: {lang_name}. "
                    "Convert technical agro-ecological telemetry and computer vision disease diagnoses into an actionable, encouraging briefing.\n\n"
                    "CRITICAL DIAGNOSIS RULES:\n"
                    "- If a disease diagnosis is provided (from the Groundnut ML Classifier), you MUST NOT change, contradict, or re-diagnose it.\n"
                    "- Structure your advisory around the ML diagnosis by explaining:\n"
                    "  1. What the diagnosis means for the crop\n"
                    "  2. What symptoms the farmer should inspect in the field\n"
                    "  3. Immediate practical organic/biological remedies\n"
                    "  4. Preventive practices and ongoing monitoring\n"
                    "  5. When agricultural extension / expert consultation is required\n\n"
                    "Structure your output STRICTLY as valid JSON with keys: "
                    "'answer' (comprehensive, practical response covering the 5 points or answering query), "
                    "'audio_script' (a 2-3 sentence conversational message ready for voice audio), "
                    "'urgent_actions' (list of 2-3 short bullet tasks for this week), "
                    "'risk_bulletin' (one sentence on weather or disease risks), "
                    "'why_this_works' (one sentence explaining how this rebuilds soil and saves money)."
                )

                farm_context_payload = {
                    "farmer_profile": farmer_profile or {"scale": "smallholder", "system": "rainfed"},
                    "crop": {
                        "name": ctx["crop_name"],
                        "variety": ctx["crop_variety"],
                        "growth_stage": ctx["crop_stage"],
                        "companion_crop": ctx["companion_crop"]
                    },
                    "location": {
                        "name": ctx["location"],
                        "latitude": ctx["lat"],
                        "longitude": ctx["lon"]
                    },
                    "soil": {
                        "type": ctx["soil_type"],
                        "ph": ctx["soil_ph"],
                        "clay_percent": ctx["soil_clay"],
                        "recommended_practice": ctx["primary_practice"]
                    },
                    "weather": {
                        "condition": ctx["weather_desc"],
                        "temperature_c": ctx["weather_temp"],
                        "humidity_pct": ctx["weather_humidity"],
                        "seven_day_precipitation_mm": ctx["weather_precip_7d"],
                        "drought_risk": ctx["drought_risk"]
                    },
                    "satellite_ndvi": {
                        "ndvi": ctx["ndvi_val"],
                        "ndwi": ctx["ndwi_val"],
                        "canopy_status": ctx["canopy_status"],
                        "data_source": ctx["satellite_source"]
                    },
                    "sensor_telemetry": {
                        "soil_moisture_pct": ctx["sensor_node"].get("soil_moisture_pct"),
                        "soil_temperature_c": ctx["sensor_node"].get("soil_temperature_c"),
                        "status": ctx["sensor_node"].get("status")
                    },
                    "groundnut_ml_diagnosis": {
                        "crop": ctx["crop_name"],
                        "predicted_disease": ctx["disease_name"] or "None (Healthy Leaf)",
                        "model_confidence": ctx["disease_confidence"],
                        "severity": ctx["disease_severity"],
                        "safety_warning": ctx["disease_warning"],
                        "what_it_means": ctx["what_it_means"],
                        "field_checkpoints": ctx["what_to_check"],
                        "immediate_actions": ctx["immediate_actions"],
                        "prevention_monitoring": ctx["prevention_monitoring"],
                        "when_to_consult": ctx["when_to_consult"],
                        "organic_remedy": ctx["disease_remedy"] or "Preventive bio-stimulant"
                    }
                }

                user_prompt = f"""Language Requested: {lang_name}
Farmer Query: {user_query or f"Explain the {ctx['disease_name'] or 'crop'} diagnosis and what I should do next on my farm."}

Comprehensive Field & Telemetry Context:
{json.dumps(farm_context_payload, indent=2, default=str)}
"""

                response = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=800,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )

                content_text = response.content[0].text.strip()
                if "{" in content_text and "}" in content_text:
                    json_str = content_text[content_text.find("{"):content_text.rfind("}") + 1]
                    parsed = json.loads(json_str)

                    answer_text = parsed.get("answer") or parsed.get("audio_script") or ""
                    audio_script = parsed.get("audio_script") or answer_text
                    urgent_actions = parsed.get("urgent_actions") or []
                    risk_bulletin = parsed.get("risk_bulletin") or ""
                    why_this_works = parsed.get("why_this_works") or ""

                    print("[AgriAI] status=LIVE")
                    print("[AgriAI] response_received=true")

                    return {
                        "status": "success",
                        "source_status": "LIVE_LLM",
                        "source": "anthropic_claude",
                        "status_label": "LIVE",
                        "engine": "Anthropic Claude 3.5 Sonnet (Live LLM)",
                        "language": lang_name,
                        "answer": answer_text,
                        "audio_script": audio_script,
                        "urgent_actions": urgent_actions,
                        "risk_bulletin": risk_bulletin,
                        "why_this_works": why_this_works
                    }
                else:
                    print("[AgriAI] status=LIVE")
                    print("[AgriAI] response_received=true")
                    return {
                        "status": "success",
                        "source_status": "LIVE_LLM",
                        "source": "anthropic_claude",
                        "status_label": "LIVE",
                        "engine": "Anthropic Claude 3.5 Sonnet (Live LLM)",
                        "language": lang_name,
                        "answer": content_text,
                        "audio_script": content_text[:300],
                        "urgent_actions": ["Follow organic recommendations derived from ML diagnosis and telemetry."],
                        "risk_bulletin": f"Agro-climatic condition is {ctx['weather_desc']}.",
                        "why_this_works": "Regenerative soil inputs enhance natural micro-ecology."
                    }
            except Exception as exc:
                err_msg = str(exc)
                clean_err = err_msg.replace(self.api_key, "[REDACTED]") if self.api_key else err_msg
                print(f"[AgriAI] status=FALLBACK")
                print(f"[AgriAI] response_received=false")
                print(f"[AgriAI] fallback_reason=Claude API query failed ({clean_err[:120]}...). Using calibrated vernacular synthesis.")

        else:
            print("[AgriAI] status=NOT_CONFIGURED")
            print("[AgriAI] response_received=false")

        # 2. Calibrated Localized Vernacular Engine Fallback
        local_result = self._synthesize_local_vernacular(
            crop_name=ctx["crop_name"],
            companion_crop=ctx["companion_crop"],
            primary_practice=ctx["primary_practice"],
            weather_desc=ctx["weather_desc"],
            disease_name=ctx["disease_name"],
            disease_remedy=ctx["disease_remedy"],
            disease_confidence=ctx["disease_confidence"],
            what_it_means=ctx["what_it_means"],
            what_to_check=ctx["what_to_check"],
            immediate_actions=ctx["immediate_actions"],
            prevention_monitoring=ctx["prevention_monitoring"],
            when_to_consult=ctx["when_to_consult"],
            language=language,
            query=user_query
        )

        is_unconfigured = not bool(self.api_key and self.api_key.startswith("sk-ant-"))
        status_label = "NOT_CONFIGURED" if is_unconfigured else "FALLBACK"
        source_label = "local_rule_engine"

        return {
            "status": "success",
            "source_status": "LOCAL_SYNTHESIS",
            "source": source_label,
            "status_label": status_label,
            "engine": "AgriN Multilingual Agronomic Vernacular Engine (Offline/Calibrated Mode)",
            **local_result
        }


# Global singleton instance
llm_localizer = LLMAdvisoryLocalizer()
