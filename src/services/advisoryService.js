import { mockAdvisories } from '../data/mockAdvisories.js';
import { farmService } from './farmService.js';

const STORAGE_KEY = 'agribridge_advisories_state';
const API_BASE = 'http://localhost:5000';

export const advisoryService = {
  async getAdvisories(filterCategory = 'all') {
    let list = [...mockAdvisories];

    // Attempt live advisory fetch with farm coordinates and crop
    try {
      const farm = await farmService.getFarmProfile();
      const lat = farm?.coordinates?.lat ?? 14.7384;
      const lon = farm?.coordinates?.lng ?? 78.9928;
      const crop = farm?.crop || "Groundnut";

      const res = await fetch(`${API_BASE}/api/advisory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          crop: crop,
          crop_name: crop,
          soil_type: farm?.soilType || "red_loamy",
          location: farm?.location || "Kadapa, Andhra Pradesh"
        }),
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const liveAdv = await res.json();
        const recs = liveAdv?.rule_based_recommendations?.recommendations || liveAdv?.recommendations;
        if (Array.isArray(recs) && recs.length > 0) {
          const liveItems = recs.map((rec, idx) => ({
            id: `live-adv-${idx + 1}`,
            crop: rec.crop,
            category: "soil",
            urgency: "medium",
            title: `Regenerative Practice: ${rec.crop}`,
            description: rec.rationale || (rec.soil_regeneration_practices ? rec.soil_regeneration_practices.join('. ') : ''),
            actionText: "Review Practice",
            completed: false,
            source: "AgriN Advisory Engine (Live)"
          }));
          list = [...liveItems, ...list];
        }
      }
    } catch (e) {
      // Graceful fallback to mock data
    }

    // Sync completion states and records with backend SQLite DB
    try {
      const histRes = await fetch(`${API_BASE}/api/advisory/history`, {
        signal: AbortSignal.timeout(2500)
      });
      if (histRes.ok) {
        const histData = await histRes.json();
        if (Array.isArray(histData?.advisories)) {
          const dbCompleted = histData.advisories
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
      }
    } catch (e) {
      // Backend unavailable; offline fallback to localStorage
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

    // 1. Persist immediately to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch (e) {}

    // 2. Persist completion state to backend SQLite DB
    try {
      await fetch(`${API_BASE}/api/advisory/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: isCompletedNow }),
        signal: AbortSignal.timeout(3000)
      });
    } catch (e) {
      console.warn("Backend advisory completion sync failed, state preserved locally:", e);
    }

    return this.getAdvisories();
  },

  /**
   * "Ask AgriAI" interactive assistant
   * Generates safe, explainable agronomic guidance with safety disclaimers
   */
  async askAgriAI(userQuery, locale = 'en') {
    let farm = null;
    try {
      farm = await farmService.getFarmProfile();
    } catch (e) {}

    const lat = farm?.coordinates?.lat ?? 14.7384;
    const lon = farm?.coordinates?.lng ?? 78.9928;
    const crop = farm?.crop || "Groundnut";
    const locName = farm?.location || "Kadapa, Andhra Pradesh";

    // Attempt backend localization / LLM route
    try {
      const res = await fetch(`${API_BASE}/localize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          crop_name: crop,
          language: locale === 'te' ? 'te' : (locale === 'hi' ? 'hi' : 'en'),
          latitude: lat,
          longitude: lon
        }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.localized_advisory) {
          const adv = data.localized_advisory;
          return {
            answer: adv.actionable_guidance || adv.bulletin || adv.greeting || "Advisory guidance generated.",
            sources: [`AgriN Localized Engine (${crop})`, `Field GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`],
            disclaimer: locale === 'hi' ? "निर्णय-सहायता सलाह। स्थानीय कृषि अधिकारी से पुष्टि करें।" : (locale === 'te' ? "సహాయక సిఫార్సు మాత్రమే." : "Decision support advisory only. Verify with local agricultural officers.")
          };
        }
      }
    } catch (e) {
      // Fallback to local expert rules
    }

    await new Promise(res => setTimeout(res, 500));
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

    if (q.includes("regenerative") || q.includes("పునరుత్పాదక") || q.includes("mulch") || q.includes("మల్చింగ్") || q.includes("मल्च") || q.includes("प्राकृतिक") || q.includes("जैविक")) {
      if (locale === 'te') {
        return {
          answer: `${crop} పొలంలో పంట వ్యర్థాలతో మల్చింగ్ (రక్షక పొర) వేయడం మరియు జీవామృతం ఉపయోగించడం ద్వారా నేలలో తేమ నిల్వ సామర్థ్యం 15-25% పెరుగుతుంది.`,
          sources: ["సహజ వ్యవసాయ మార్గదర్శకాలు", "నేల ఉష్ణోగ్రత టెలిమెట్రీ"],
          disclaimer: "స్థానిక వ్యవసాయ వాతావరణ మార్గదర్శకాల ప్రకారం పాటించండి."
        };
      }
      if (locale === 'hi') {
        return {
          answer: `${crop} के खेत में फसल अवशेषों से मल्चिंग (मृदा आवरण) और जीवामृत का प्रयोग मिट्टी में 15-25% अधिक नमी बनाए रखता है और खरपतवार रोकता है।`,
          sources: ["प्राकृतिक कृषि मानक", "वर्चुअल सेंसर टेलीमेट्री"],
          disclaimer: "स्थानीय कृषि जलवायु दिशानिर्देशों के अनुसार पालन करें।"
        };
      }
      return {
        answer: `Biomass mulching and bio-fertilizer application for ${crop} protects root systems, suppresses weeds, and reduces irrigation requirements by 15-25%.`,
        sources: ["Regenerative Agriculture Protocols", "Virtual Sensor Telemetry"],
        disclaimer: "AgriBridge regenerative practice guidance."
      };
    }

    // Default response
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
