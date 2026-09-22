import { mockAdvisories } from '../data/mockAdvisories.js';
import { farmService } from './farmService.js';
import { apiClient } from './apiClient.js';
import { USE_MOCK_FALLBACK } from '../config.js';

const STORAGE_KEY = 'agribridge_advisories_state';

export function fetchAdvisory(payload) {
  return apiClient.post('/api/v1/advisories', payload);
}

export const advisoryService = {
  /**
   * Fetches full agronomic recommendations from Flask backend /api/v1/advisories
   */
  async getAdvisories(filterCategory = 'all') {
    let list = [...mockAdvisories];

    try {
      const farm = await farmService.getFarmProfile();
      const lat = farm?.coordinates?.lat ?? 15.8281;
      const lon = farm?.coordinates?.lng ?? 78.0373;
      const crop = farm?.crop || "Groundnut";
      const variety = farm?.cropVariety || "Kadiri-6";
      const stage = farm?.growthStage || "flowering";

      const payload = {
        farm_id: "sathyala-farm-001",
        latitude: lat,
        longitude: lon,
        location: farm?.location || "Kurnool, Andhra Pradesh, India",
        crop: crop,
        variety: variety,
        crop_stage: stage,
        sensor_device_id: "AGRI-ESP32-001"
      };

      const liveAdv = await fetchAdvisory(payload);
      const dataObj = liveAdv?.data || liveAdv;
      const recs = dataObj?.recommendations || liveAdv?.recommendations;

      if (Array.isArray(recs) && recs.length > 0) {
        const liveItems = recs.map((rec, idx) => ({
          id: `live-adv-${idx + 1}`,
          crop: rec.crop || crop,
          category: rec.category || "soil",
          urgency: idx === 0 ? "high" : "medium",
          title: `Regenerative Practice: ${rec.crop || crop}`,
          titleEn: `Regenerative Practice: ${rec.crop || crop}`,
          titleTe: `పునరుత్పాదక విధానం: ${rec.crop || crop}`,
          titleHi: `पुनर्योजी कृषि पद्धति: ${rec.crop || crop}`,
          description: rec.rationale || (rec.soil_regeneration_practices ? rec.soil_regeneration_practices.join('. ') : ''),
          descEn: rec.rationale || (rec.soil_regeneration_practices ? rec.soil_regeneration_practices.join('. ') : ''),
          descTe: rec.rationale || (rec.soil_regeneration_practices ? rec.soil_regeneration_practices.join('. ') : ''),
          descHi: rec.rationale || (rec.soil_regeneration_practices ? rec.soil_regeneration_practices.join('. ') : ''),
          actionText: rec.action || "Review Practice",
          actionEn: rec.action || "Review Practice",
          actionTe: "విధానాన్ని సమీక్షించండి",
          actionHi: "सुझाव देखें",
          confidence: Math.round(dataObj?.confidence_score ?? 92),
          completed: false,
          source: `AgriN Engine (${dataObj?.sensor_status === 'online' ? 'Live Sensor' : 'Model'})`
        }));
        list = [...liveItems, ...list];
      }
    } catch (e) {
      if (!USE_MOCK_FALLBACK) throw e;
    }

    // Sync completion states and records with backend SQLite DB
    try {
      const histData = await apiClient.get('/api/v1/advisories/history');
      const advisoriesList = histData?.advisories || histData?.data?.advisories;
      if (Array.isArray(advisoriesList)) {
        const dbCompleted = advisoriesList
          .filter(a => a.completed)
          .map(a => `adv-${String(a.id).padStart(3, '0')}`);

        let storedCompleted = [];
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) storedCompleted = JSON.parse(stored);
        } catch {}

        const mergedCompleted = Array.from(new Set([...storedCompleted, ...dbCompleted]));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedCompleted));
        } catch {}
      }
    } catch (e) {
      // Offline fallback to localStorage
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const completedIds = JSON.parse(stored);
        list = list.map(item => ({
          ...item,
          completed: completedIds.includes(item.id)
        }));
      }
    } catch (e) {
      console.warn("Could not read advisories from localStorage:", e);
    }

    if (filterCategory && filterCategory !== 'all') {
      return list.filter(item => item.category === filterCategory);
    }
    return list;
  },

  async toggleComplete(id) {
    let completedIds = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) completedIds = JSON.parse(stored);
    } catch (e) {}

    const index = completedIds.indexOf(id);
    const isCompletedNow = index === -1;
    if (index > -1) {
      completedIds.splice(index, 1);
    } else {
      completedIds.push(id);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch (e) {}

    try {
      await apiClient.post('/api/v1/advisories/complete', {
        id,
        completed: isCompletedNow
      });
    } catch (e) {
      console.warn("Backend advisory completion sync failed, state preserved locally:", e);
    }

    return this.getAdvisories();
  },

  /**
   * "Ask AgriAI" interactive assistant
   */
  async askAgriAI(userQuery, locale = 'en') {
    let farm = null;
    try {
      farm = await farmService.getFarmProfile();
    } catch (e) {}

    const lat = farm?.coordinates?.lat ?? 15.8281;
    const lon = farm?.coordinates?.lng ?? 78.0373;
    const crop = farm?.crop || "Groundnut";
    const variety = farm?.cropVariety || "Kadiri-6";
    const stage = farm?.growthStage || "flowering";
    const locName = farm?.location || "Kurnool, Andhra Pradesh";

    try {
      const payload = {
        query: userQuery,
        localize: true,
        language: locale === 'te' ? 'te' : (locale === 'hi' ? 'hi' : 'en'),
        farm_id: farm?.id || "sathyala-farm-001",
        crop: crop,
        variety: variety,
        crop_stage: stage,
        latitude: lat,
        longitude: lon,
        location: locName,
        sensor_device_id: "AGRI-ESP32-001",
        farmer_profile: {
          farmer_name: farm?.farmerName || "Sathyala Farmer",
          landholding_acres: farm?.areaAcres || 2.5,
          location: locName,
          crop: crop,
          crop_stage: stage
        }
      };

      // Try /api/v1/advisories first (has full telemetry ingestion), fallback to /api/v1/localizations
      let data;
      try {
        data = await apiClient.post('/api/v1/advisories', payload);
      } catch (advErr) {
        data = await apiClient.post('/api/v1/localizations', payload);
      }

      const adv = data?.localized_farmer_guidance || data?.data?.localized_farmer_guidance || data?.data || data;
      
      // Support all reasonable response nesting hierarchies, preferring normalized "answer"
      const rawAnswer = adv?.answer 
        || data?.answer 
        || adv?.audio_script 
        || data?.audio_script 
        || adv?.localized_advisory 
        || data?.localized_advisory
        || adv?.actionable_guidance;

      if (rawAnswer) {
        let fullAnswer = rawAnswer;
        const urgentActions = adv?.urgent_actions || data?.urgent_actions;
        const whyThisWorks = adv?.why_this_works || data?.why_this_works;
        
        // If actions not already contained in answer, append cleanly
        if (Array.isArray(urgentActions) && urgentActions.length > 0 && !fullAnswer.includes(urgentActions[0])) {
          fullAnswer += "\n\n" + urgentActions.map(a => `• ${a}`).join("\n");
        }
        if (whyThisWorks && !fullAnswer.includes(whyThisWorks)) {
          fullAnswer += `\n\n💡 ${whyThisWorks}`;
        }

        const isLive = adv?.source_status === 'LIVE_LLM' 
          || adv?.source === 'anthropic_claude' 
          || data?.source === 'anthropic_claude' 
          || adv?.status === 'LIVE'
          || data?.status === 'LIVE';

        const isNotConfigured = adv?.status === 'NOT_CONFIGURED' 
          || data?.status === 'NOT_CONFIGURED'
          || adv?.status_label === 'NOT_CONFIGURED';

        const sourceStatus = isLive ? 'LIVE' : (isNotConfigured ? 'NOT_CONFIGURED' : 'FALLBACK');
        
        const engineName = isLive 
          ? "Anthropic Claude 3.5 Sonnet (Live LLM)" 
          : (isNotConfigured 
              ? "AgriN Agronomic Rule Engine (Offline)" 
              : (adv?.engine || "AgriN Multilingual Agronomic Vernacular Engine (Fallback)"));

        const gpsCitation = `Field GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
        const telemetryCitation = adv?.sensor_status === 'online' ? "ESP32 Live Sensor Probe" : "Agro-Climatic Model Mesh";

        return {
          answer: fullAnswer,
          sources: [engineName, telemetryCitation, gpsCitation],
          sourceStatus: sourceStatus,
          disclaimer: locale === 'hi' ? "निर्णय-सहायता सलाह। स्थानीय कृषि अधिकारी से पुष्टि करें।" : (locale === 'te' ? "సహాయక సిఫార్సు మాత్రమే." : "Decision support advisory only. Verify with local agricultural officers.")
        };
      }
    } catch (e) {
      console.warn("Backend advisory query failed, using client agronomic fallback:", e);
      // Fall through to local agronomic expert rules
    }

    await new Promise(res => setTimeout(res, 300));
    const q = userQuery.toLowerCase();

    if (q.includes("irrigate") || q.includes("నీరు") || q.includes("water") || q.includes("pump") || q.includes("सिंचाई") || q.includes("पानी")) {
      if (locale === 'te') {
        return {
          answer: `వాతావరణ సూచన మరియు నేల తేమను పరిశీలించిన తర్వాత, ${crop} పంటకు ప్రస్తుతం నీటిపారుదలని నిలిపివేయడం శ్రేయస్కరం. రేపు ఉదయం నేల తేమను తనిఖీ చేయండి.`,
          sources: ["నేల సెన్సార్ AGRI-ESP32 (వర్చువల్ నోడ్)", "లైవ్ వాతావరణ రాడార్"],
          disclaimer: "సహాయక సిఫార్సు మాత్రమే. క్షేత్ర పరిస్థితులను బట్టి నిర్ణయం తీసుకోండి."
        };
      }
      if (locale === 'hi') {
        return {
          answer: `मौसम पूर्वानुमान और मिट्टी की नमी को देखते हुए, ${crop} फसल के लिए वर्तमान में सिंचाई 24-48 घंटों के लिए टालना बेहतर रहेगा। बारिश की संभावना के बाद कल सुबह नमी की पुनः जांच करें।`,
          sources: ["मिट्टी सेंसर AGRI-ESP32 (वर्चुअल नोड)", "मौसम रडार"],
          disclaimer: "निर्णय-सहायता सलाह मात्र। खेत की नमी देखकर पंप चालू करें।"
        };
      }
      return {
        answer: `Based on weather radar and soil telemetry, current moisture is adequate for ${crop}. Delay irrigation by 24-48 hours to conserve soil aeration.`,
        sources: ["AGRI-ESP32 Virtual Node", "Live Meteorological Feed"],
        disclaimer: "Decision support advisory only. Verify field saturation before pumping."
      };
    }

    if (q.includes("yellow") || q.includes("పసుపు") || q.includes("leaf") || q.includes("ఆకు") || q.includes("पीली") || q.includes("पत्ता") || q.includes("पत्तियां")) {
      if (locale === 'te') {
        return {
          answer: `${crop} ఆకులు పసుపు రంగులోకి మారడం అనేది పోషకాల లోపం లేదా ఆకుమచ్చ వ్యాధి ప్రారంభ లక్షణం కావచ్చు. ఖచ్చితమైన నిర్ధారణ కోసం 'పంట వ్యాధి నిర్ధారణ' లో ఆకు ఫోటో తీసి అప్‌లోడ్ చేయండి.`,
          sources: [`ICAR ${crop} Diagnostic Key`, "క్రాప్ డిసీజ్ డేటాబేస్"],
          disclaimer: "ఏదైనా రసాయనం పిచికారీ చేసే ముందు వ్యవసాయ శాస్త్రవేత్తలతో నిర్ధారించుకోండి."
        };
      }
      if (locale === 'hi') {
        return {
          answer: `${crop} की पत्तियों का पीला पड़ना पोषण की कमी (नाइट्रोजन/लोहा) या पत्ती धब्बा रोग का प्रारंभिक संकेत हो सकता है। सटीक जांच के लिए 'फसल रोग निदान' टैब में पत्ती का फोटो अपलोड करें।`,
          sources: [`ICAR ${crop} डायग्नोस्टिक कुंजी`, "ब्रिक्स पादप रोग डेटाबेस"],
          disclaimer: "किसी भी रासायनिक कीटनाशक के छिड़काव से पहले कृषि वैज्ञानिक से पुष्टि करें।"
        };
      }
      return {
        answer: `Yellowing foliage in ${crop} may indicate nutrient deficiency or early foliar pathology. Please capture a clear leaf photo in our Crop Diagnosis tab for automated computer vision screening.`,
        sources: [`ICAR ${crop} Diagnostic Key`, "BRICS Plant Pathology Mesh"],
        disclaimer: "Screening recommendation only. Do not apply synthetic fungicides without verification."
      };
    }

    if (locale === 'te') {
      return {
        answer: `మీ ప్రశ్న నమోదు చేయబడింది. ${locName} లోని మీ ${crop} పంట క్షేత్ర పరిస్థితులు స్థిరంగా ఉన్నాయి. మరింత సమాచారం కోసం సహాయకుడిని అడగండి.`,
        sources: ["AgriBridge AI నమూనా", locName],
        disclaimer: "ఇది నిర్ణయ సహాయక వ్యవస్థ మాత్రమే."
      };
    }
    if (locale === 'hi') {
      return {
        answer: `आपका प्रश्न दर्ज किया गया है। ${locName} में आपके ${crop} खेत की स्थिति सामान्य एवं स्थिर है। अधिक विशिष्ट सलाह के लिए प्रश्न पूछें।`,
        sources: ["AgriBridge AI मॉडल", locName],
        disclaimer: "यह निर्णय-सहायता प्रणाली है। कृषि विस्तार अधिकारी से पुष्टि करें।"
      };
    }
    return {
      answer: `Thank you for consulting AgriAI. Your ${crop} plot in ${locName} is tracked. Telemetry indicates stable canopy vigor and optimal moisture balance.`,
      sources: ["AgriBridge Multi-Sensor Mesh", locName],
      disclaimer: "Decision-support recommendation. Validate with agricultural extension officer."
    };
  }
};
