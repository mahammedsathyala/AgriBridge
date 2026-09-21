import { mockAdvisories } from '../data/mockAdvisories.js';

const STORAGE_KEY = 'agribridge_advisories_state';

export const advisoryService = {
  async getAdvisories(filterCategory = 'all') {
    let list = [...mockAdvisories];
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
    if (index > -1) {
      completedIds.splice(index, 1);
    } else {
      completedIds.push(id);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch (e) {}

    return this.getAdvisories();
  },

  /**
   * "Ask AgriAI" interactive assistant
   * Generates safe, explainable agronomic guidance with safety disclaimers
   */
  async askAgriAI(userQuery, locale = 'en') {
    await new Promise(res => setTimeout(res, 600));
    const q = userQuery.toLowerCase();

    if (q.includes("irrigate") || q.includes("నీరు") || q.includes("water") || q.includes("pump")) {
      if (locale === 'te') {
        return {
          answer: "ఆదివారం నాడు 18 మి.మీ వర్షం కురిసే అవకాశం (68%) ఉన్నందున, ఈ రోజు నీటిపారుదలని నిలిపివేయడం శ్రేయస్కరం. ప్రస్తుతం మీ నేల తేమ 34% వద్ద పూత దశకు అనుకూలంగా ఉంది. రేపు ఉదయం నేల పరిశీలించండి.",
          sources: ["నేల సెన్సార్ AGRI-ESP32 (34% తేమ)", "వాతావరణ రాడార్ (18mm వర్ష సూచన)"],
          disclaimer: "సహాయక సిఫార్సు మాత్రమే. క్షేత్ర పరిస్థితులను బట్టి నిర్ణయం తీసుకోండి."
        };
      }
      return {
        answer: "With an 18mm rainfall event predicted this Sunday (68% probability), it is strongly advised to delay irrigation by 24-48 hours. Your soil moisture is currently 34% VWC, which is safe for flowering groundnut. Inspect the field tomorrow before operating your pump.",
        sources: ["Soil Sensor AGRI-ESP32 (34% VWC)", "IMD Radar Forecast (18mm rainfall)"],
        disclaimer: "Decision support advisory only. Verify field saturation before pumping."
      };
    }

    if (q.includes("yellow") || q.includes("పసుపు") || q.includes("leaf") || q.includes("ఆకు")) {
      if (locale === 'te') {
        return {
          answer: "వేరుశనగ ఆకులు పసుపు రంగులోకి మారడం అనేది ప్రధానంగా రెండు కారణాల వల్ల జరగవచ్చు: 1) ఇనుము లేదా నత్రజని లోపం వల్ల వచ్చే పాలిపోయిన పసుపు రంగు, లేదా 2) ప్రారంభ తిక్క ఆకుమచ్చ వ్యాధి వల్ల మచ్చల చుట్టూ ఏర్పడే పసుపు రంగు (Chlorotic halo). ఖచ్చితమైన నిర్ధారణ కోసం 'పంట వ్యాధి నిర్ధారణ' లో ఆకు ఫోటో తీసి అప్‌లోడ్ చేయండి.",
          sources: ["ICAR గ్రౌండ్‌నట్ డయాగ్నస్టిక్ గైడ్", "క్రాప్ డిసీజ్ నమూనా"],
          disclaimer: "ఏదైనా రసాయనం పిచికారీ చేసే ముందు వ్యవసాయ శాస్త్రవేత్తలతో నిర్ధారించుకోండి."
        };
      }
      return {
        answer: "Yellowing in groundnut foliage can indicate either early-stage Cercospora leaf spot (which displays circular yellow halos around brown lesions) or mild interveinal iron chlorosis in alkaline red-loamy soil. Please capture and upload a clear leaf photo in our Crop Diagnosis tab for instant screening.",
        sources: ["ICAR Groundnut Diagnostic Key", "BRICS Plant Pathology Mesh"],
        disclaimer: "Screening recommendation only. Do not apply synthetic fungicides without visual verification."
      };
    }

    if (q.includes("regenerative") || q.includes("పునరుత్పాదక") || q.includes("mulch") || q.includes("మల్చింగ్")) {
      if (locale === 'te') {
        return {
          answer: "ఈ నెలలో మీ వేరుశనగ పొలంలో ఎండిన గడ్డి లేదా వేరుశనగ పొట్టుతో మల్చింగ్ (రక్షక పొర) వేయడం అత్యంత ఉత్తమమైన పద్ధతి. ఇది రాబోయే ఎండలకు నేల వేడిని 3-5°C తగ్గించడమే కాకుండా 15-25% నీటిని ఆదా చేస్తుంది.",
          sources: ["APCNF సహజ వ్యవసాయ మార్గదర్శకాలు", "నేల ఉష్ణోగ్రత రీడింగ్ (29.4°C)"],
          disclaimer: "స్థానిక వ్యవసాయ వాతావరణ మార్గదర్శకాల ప్రకారం పాటించండి."
        };
      }
      return {
        answer: "This month (flowering to pegging stage), biomass mulching using dry straw or crop residue is the highest-impact regenerative practice. It lowers soil temperatures by 3-5°C, protects sensitive young pegs entering the soil, and reduces irrigation demand by 15-25%.",
        sources: ["Andhra Pradesh Natural Farming (APCNF) Protocols", "Soil Thermistor (29.4°C)"],
        disclaimer: "AgriBridge regenerative practice guidance."
      };
    }

    if (q.includes("fertilizer") || q.includes("ఎరువు") || q.includes("organic") || q.includes("compost") || q.includes("సేంద్రీయ")) {
      if (locale === 'te') {
        return {
          answer: "విత్తిన 40-45 రోజుల మధ్య (ఊడలు దిగే సమయం) ఎకరాకు 200 కిలోల జిప్సం వేయడం వల్ల కాయలు గుల్ల కాకుండా గట్టిపడతాయి. సేంద్రీయంగా అయితే వర్షం పడిన తర్వాత తేలికపాటి వర్మీకంపోస్ట్ లేదా జీవామృతం అందించడం వల్ల నేలలోని సూక్ష్మజీవులు చురుగ్గా పనిచేస్తాయి.",
          sources: ["నేల ఆరోగ్య నివేదిక (కాల్షియం లోపం)", "సేంద్రీయ ఎరువుల క్యాలెండర్"],
          disclaimer: "రసాయన మోతాదులను మీ స్థానిక మట్టి పరీక్ష నివేదిక ప్రకారం సరిచూసుకోండి."
        };
      }
      return {
        answer: "At the 40-45 days after sowing (DAS) pegging window, applying 200 kg/acre Gypsum is crucial to supply calcium for pod development. For organic inputs, top-dress 500 kg/acre vermicompost or apply Jeevamrutha through drip irrigation after light rainfall.",
        sources: ["Soil Health Analysis (Exchangeable Ca)", "ICAR Organic Groundnut Package"],
        disclaimer: "General agronomic guidance. Adjust rates based on formal soil testing."
      };
    }

    // Default intelligent response
    if (locale === 'te') {
      return {
        answer: "మీ ప్రశ్న నమోదు చేయబడింది. మీ 2.5 ఎకరాల వేరుశనగ పొలం ప్రస్తుతం పూత దశలో ఉంది మరియు నేల తేమ 34% గా ఉంది. వాతావరణం, నేల మరియు ఉపగ్రహ సమాచారాన్ని సమగ్రంగా పరిశీలించి నిర్ణయాలు తీసుకోండి. అత్యవసర సలహాల కోసం సమీప వ్యవసాయ అధికారిని సంప్రదించండి.",
        sources: ["AgriBridge AI నమూనా", "కర్నూలు క్షేత్ర డేటా"],
        disclaimer: "ఇది నిర్ణయ సహాయక వ్యవస్థ మాత్రమే."
      };
    }
    return {
      answer: "Thank you for consulting AgriAI. Your 2.5-acre groundnut crop in Kurnool is currently at the flowering/pegging transition stage (Day 42). Telemetry indicates stable canopy vigor (NDVI 0.68) and adequate soil moisture (34%). Please verify critical chemical choices with your local agricultural officer.",
      sources: ["AgriBridge Multi-Sensor Mesh", "Kurnool Field Telemetry"],
      disclaimer: "Decision-support recommendation. Validate with agricultural extension officer."
    };
  }
};
