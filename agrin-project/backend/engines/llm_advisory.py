"""
AgriN LLM Advisory Localizer (MVP 4: Anthropic Claude Integration)
------------------------------------------------------------------
Converts structured agro-ecological telemetry (MVP 2: soil, weather, satellite NDVI)
and computer vision diagnostics (MVP 3: YOLOv8) into concise, respectful,
vernacular voice/text briefings for smallholder farmers across BRICS languages.
"""

from typing import Dict, Any, List, Optional
import os
import json


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
        """Initializes Anthropic client if valid key is found."""
        if self.api_key and self.api_key.startswith("sk-ant-"):
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except Exception as err:
                print(f"[AgriN LLM] Failed to initialize Anthropic client: {err}")
                self.client = None

    def _synthesize_local_vernacular(
        self,
        crop_name: str,
        companion_crop: str,
        primary_practice: str,
        weather_desc: str,
        disease_name: Optional[str] = None,
        disease_remedy: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Calibrated offline synthesis engine delivering high-quality,
        culturally grounded vernacular farm guidance across BRICS languages.
        """
        lang = language.lower()[:2]

        if lang == "te":  # Telugu
            if disease_name and disease_name != "Healthy Plant Foliage (No Active Pathogen Detected)":
                audio = (
                    f"రైతు సోదరులకు నమస్కారం. మీ పంట ఆకులను పరిశీలించగా '{disease_name}' లక్షణాలు కనిపించాయి. "
                    f"వెంటనే {disease_remedy or '5% వేప గింజల కషాయం (NSKE)'} పిచికారీ చేయండి. "
                    f"వాతావరణం {weather_desc}గా ఉంది కాబట్టి తేమ ఆరిపోయేలా చూడండి."
                )
                actions = [
                    f"వెంటనే నివారణ చర్య: {disease_remedy or 'వేప నూనె లేదా ట్రైకోడెర్మా పిచికారీ'}.",
                    "తెగులు సోకిన ఆకులను ఏరివేసి భూమిలో పూడ్చిపెట్టండి.",
                    f"నేల బలానికి {companion_crop} అంతర పంటగా వేయండి."
                ]
            else:
                audio = (
                    f"రైతు సోదరులకు నమస్కారం. ప్రస్తుత వాతావరణం మరియు మీ నేల ప్రకారం '{crop_name}' సాగు చేయడం అత్యంత లాభదాయకం. "
                    f"దీనితో పాటు '{companion_crop}'ను అంతర పంటగా వేస్తే భూసారం పెరుగుతుంది. "
                    f"నీటి ఆవిరిని అరికట్టడానికి నేలపై ఆకుల రక్షణ కవచం (మల్చింగ్) వేయండి."
                )
                actions = [
                    f"ప్రధాన పంటగా {crop_name} మరియు అంతర పంటగా {companion_crop}ను ఎంచుకోండి.",
                    f"భూసార పద్ధతి: {primary_practice}.",
                    "రసాయన ఎరువుల ఖర్చు తగ్గించడానికి జీవామృతం ఉపయోగించండి."
                ]

            return {
                "language": "Telugu (తెలుగు)",
                "audio_script": audio,
                "urgent_actions": actions,
                "risk_bulletin": f"వాతావరణ స్థితి: {weather_desc}. నీటి ఎద్దడి రాకుండా జాగ్రత్త పడండి.",
                "why_this_works": "ఈ పద్ధతి వల్ల నేలలో నత్రజని పెరిగి, ఎరువుల ఖర్చు 30% వరకు ఆదా అవుతుంది."
            }

        elif lang == "hi":  # Hindi
            if disease_name and disease_name != "Healthy Plant Foliage (No Active Pathogen Detected)":
                audio = (
                    f"किसान भाइयों को सादर प्रणाम। आपकी फसल में '{disease_name}' के लक्षण पाए गए हैं। "
                    f"इसके तुरंत समाधान के लिए {disease_remedy or '5% नीम के बीज का काढ़ा (NSKE)'} का छिड़काव करें। "
                    f"वर्तमान मौसम {weather_desc} है, जल निकासी का उचित प्रबंध रखें।"
                )
                actions = [
                    f"तत्काल जैविक उपचार: {disease_remedy or 'नीम तेल अथवा ट्राइकोडर्मा का छिड़काव'}.",
                    "संक्रमित पत्तियों को खेत से हटाकर नष्ट करें।",
                    f"खेत में {companion_crop} को अंतःफसल (intercrop) के रूप में लगाएं।"
                ]
            else:
                audio = (
                    f"किसान भाइयों को सादर प्रणाम। आपकी मिट्टी और मौसम को देखते हुए '{crop_name}' की बुवाई सबसे उपयुक्त है। "
                    f"इसके साथ '{companion_crop}' को सह-फसल बनाकर लगाएं जिससे जमीन की उर्वरक शक्ति बढ़ेगी। "
                    f"मिट्टी की नमी बचाने के लिए जैविक मल्चिंग अवश्य करें।"
                )
                actions = [
                    f"मुख्य फसल {crop_name} के साथ {companion_crop} की अंतःफसल बुवाई करें।",
                    f"मृदा संरक्षण: {primary_practice} अपनाएं।",
                    "जीवामृत या वर्मीवाश का उपयोग कर यूरिया पर निर्भरता घटाएं।"
                ]

            return {
                "language": "Hindi (हिन्दी)",
                "audio_script": audio,
                "urgent_actions": actions,
                "risk_bulletin": f"मौसम की स्थिति: {weather_desc}. वर्षा और नमी पर निगरानी रखें।",
                "why_this_works": "दलहनी सह-फसलें हवा से नाइट्रोजन खींचकर जमीन को उपजाऊ बनाती हैं।"
            }

        elif lang == "pt":  # Portuguese (Brazil)
            return {
                "language": "Portuguese (Português)",
                "audio_script": (
                    f"Prezado produtor rural. Para as condições atuais de solo e clima ({weather_desc}), "
                    f"recomendamos o plantio regenerativo de {crop_name} consorciado com {companion_crop}. "
                    f"Mantenha a cobertura vegetal do solo para reter umidade e fertilidade."
                ),
                "urgent_actions": [
                    f"Semeadura de {crop_name} com consórcio de {companion_crop}.",
                    f"Prática de regeneração: {primary_practice}.",
                    "Reduzir o revolvimento do solo através do plantio direto."
                ],
                "risk_bulletin": f"Condição agroclimática: {weather_desc}. Monitorar índice de estresse hídrico.",
                "why_this_works": "Aumenta a matéria orgânica do solo e reduz os custos com adubação sintética."
            }

        elif lang == "ru":  # Russian
            return {
                "language": "Russian (Русский)",
                "audio_script": (
                    f"Здравствуйте, уважаемый фермер. Учитывая текущую погоду ({weather_desc}) и структуру почвы, "
                    f"рекомендуем культивацию {crop_name} в комбинации с {companion_crop}. "
                    f"Применяйте мульчирование для сохранения влаги и микробиома почвы."
                ),
                "urgent_actions": [
                    f"Посев культуры {crop_name} с культурой-спутником {companion_crop}.",
                    f"Агрономическая мера: {primary_practice}.",
                    "Минимальная обработка почвы (No-Till)."
                ],
                "risk_bulletin": f"Погодные условия: {weather_desc}.",
                "why_this_works": "Повышает биологическую фиксацию азота и устойчивость к климатическим рискам."
            }

        elif lang == "zh":  # Mandarin
            return {
                "language": "Mandarin Chinese (中文)",
                "audio_script": (
                    f"农户朋友你好。根据当前的气候条件（{weather_desc}）与土壤状况，"
                    f"推荐种植再生作物 {crop_name}，并搭配伴生作物 {companion_crop}。"
                    f"请保持地表秸秆覆盖，以保护土壤微生物与水分。"
                ),
                "urgent_actions": [
                    f"种植主作物 {crop_name} 并间作 {companion_crop}。",
                    f"土壤修复措施：{primary_practice}。",
                    "采用免耕或少耕技术减少水土流失。"
                ],
                "risk_bulletin": f"天气状况：{weather_desc}。注意田间水分调控。",
                "why_this_works": "伴生豆科作物能固定空气中的氮素，显著降低化肥投入成本。"
            }

        else:  # English default
            if disease_name and disease_name != "Healthy Plant Foliage (No Active Pathogen Detected)":
                audio = (
                    f"Hello farmer friend. Visual scan detected symptoms of '{disease_name}'. "
                    f"Apply {disease_remedy or '5% Neem Seed Kernel Extract (NSKE)'} immediately to halt spore spread. "
                    f"Current weather is {weather_desc}, so ensure good inter-row drainage."
                )
                actions = [
                    f"Immediate remedy: Apply {disease_remedy or 'neem oil / Trichoderma biocontrol'}.",
                    "Prune and deeply compost heavily infected lower leaves.",
                    f"Intercrop with {companion_crop} to break future pathogen cycles."
                ]
            else:
                audio = (
                    f"Hello farmer friend. For your current soil and {weather_desc} weather conditions, "
                    f"growing '{crop_name}' intercropped with '{companion_crop}' will maximize your yield. "
                    f"Keep your topsoil covered with residue mulch to lock in moisture."
                )
                actions = [
                    f"Sow primary crop {crop_name} intercropped with {companion_crop}.",
                    f"Soil regeneration action: {primary_practice}.",
                    "Apply fermented organic compost or Jeevamrutha to minimize chemical fertilizer dependency."
                ]

            return {
                "language": "English",
                "audio_script": audio,
                "urgent_actions": actions,
                "risk_bulletin": f"Weather profile is {weather_desc}. Maintain in-situ moisture retention.",
                "why_this_works": "Biological nitrogen fixation from companion legumes adds natural fertility while cutting input costs."
            }

    def generate_plain_advisory(
        self,
        advisory_data: Optional[Dict[str, Any]] = None,
        diagnosis_data: Optional[Dict[str, Any]] = None,
        language: str = "en",
        farmer_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate plain-language farmer guidance using Anthropic Claude
        (or calibrated vernacular engine if API key is not configured).
        """
        # Extract key variables from advisory data
        rec_list = (advisory_data or {}).get("recommendations", [])
        top_rec = rec_list[0] if rec_list else {}
        crop_name = top_rec.get("crop", "Climate-Resilient Pearl Millet / Pulses")
        companion = top_rec.get("companion_crop", "Cowpea / Legumes")
        practices = top_rec.get("soil_regeneration_practices", ["Residue retention mulching", "Minimum tillage"])
        primary_practice = practices[0] if practices else "Residue retention mulching"

        # Safely extract weather description (handles manual and live telemetry modes)
        live_telem = (advisory_data or {}).get("live_telemetry") or {}
        weather_obj = live_telem.get("weather") or {}
        current_weather = weather_obj.get("current") or {}
        weather_desc = (
            current_weather.get("condition")
            or (advisory_data or {}).get("inputs_received", {}).get("weather")
            or "Moderate seasonal climate"
        )

        # Extract key variables from diagnosis data
        diag_primary = (diagnosis_data or {}).get("primary_diagnosis", {})
        disease_name = diag_primary.get("condition")
        remedy_list = (diagnosis_data or {}).get("organic_treatment_plan", [])
        disease_remedy = remedy_list[0] if remedy_list else None

        lang_name = SUPPORTED_LANGUAGES.get(language.lower(), "English")

        # 1. Attempt Anthropic Claude API Call if client is configured
        if self.client is not None:
            try:
                system_prompt = (
                    "You are AgriN, an empathetic, expert agricultural advisor speaking directly to a smallholder "
                    f"farmer in their native language: {lang_name}. "
                    "Convert the technical agronomic and disease data into a simple, encouraging, respectful briefing. "
                    "Avoid academic jargon. Structure your output STRICTLY as valid JSON with keys: "
                    "'audio_script' (a 2-3 sentence conversational message ready for voice audio), "
                    "'urgent_actions' (list of 2-3 short bullet tasks for this week), "
                    "'risk_bulletin' (one sentence on weather or disease risks), "
                    "'why_this_works' (one sentence explaining how this rebuilds soil and saves fertilizer money)."
                )

                user_prompt = f"""
Farmer Profile: {json.dumps(farmer_profile or {'scale': 'smallholder', 'system': 'rainfed'}, indent=2)}
Language Requested: {lang_name}
Advisory Data:
- Recommended Crop: {crop_name}
- Companion Crop: {companion}
- Soil Practice: {primary_practice}
- Weather: {weather_desc}
Disease Detection:
- Detected Condition: {disease_name or 'None (Healthy)'}
- Organic Remedy: {disease_remedy or 'Preventive bio-stimulant'}
"""
                response = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=600,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )

                content_text = response.content[0].text.strip()
                # Parse JSON if possible
                if "{" in content_text and "}" in content_text:
                    json_str = content_text[content_text.find("{"):content_text.rfind("}") + 1]
                    parsed = json.loads(json_str)
                    return {
                        "status": "success",
                        "source_status": "LIVE_LLM",
                        "engine": "Anthropic Claude 3.5 Sonnet (Live LLM)",
                        "language": lang_name,
                        **parsed
                    }
            except Exception as exc:
                print(f"[AgriN LLM] Claude API query failed: {exc}. Using calibrated vernacular synthesis.")

        # 2. Calibrated Localized Vernacular Engine
        local_result = self._synthesize_local_vernacular(
            crop_name=crop_name,
            companion_crop=companion,
            primary_practice=primary_practice,
            weather_desc=weather_desc,
            disease_name=disease_name,
            disease_remedy=disease_remedy,
            language=language
        )

        return {
            "status": "success",
            "source_status": "LOCAL_SYNTHESIS",
            "engine": "AgriN Multilingual Agronomic Vernacular Engine (Offline/Calibrated Mode)",
            "provider": "Ready for live Anthropic API Key (ANTHROPIC_API_KEY in .env)",
            **local_result
        }


# Global singleton instance
llm_localizer = LLMAdvisoryLocalizer()
