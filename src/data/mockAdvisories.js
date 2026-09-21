export const mockAdvisories = [
  {
    id: "adv-001",
    isPriority: true,
    titleEn: "Delay irrigation for 24 hours and inspect lower leaves",
    titleTe: "నీటిపారుదలని 24 గంటలు ఆలస్యం చేయండి మరియు క్రింది ఆకులను పరిశీలించండి",
    category: "irrigation",
    priority: "high",
    date: "2026-09-18 17:30",
    completed: false,
    confidence: 89,

    reasonEn: "Recommendation based on soil moisture (34%), flowering crop growth stage, upcoming 18mm rainfall forecast within 72 hours, and stable satellite NDVI vegetation trend.",
    reasonTe: "నేల తేమ (34%), పూత దశ, రాబోయే 72 గంటల్లో 18 మి.మీ వర్ష సూచన మరియు స్థిరమైన ఉపగ్రహ పచ్చదనం సూచిక ఆధారంగా ఈ సిఫార్సు చేయబడింది.",

    actionEn: "Delay scheduled irrigation cycle until Sunday evening. Inspect the field tomorrow morning before operating the borewell pump. Check underside of bottom leaves for dark brown spots.",
    actionTe: "ఆదివారం సాయంత్రం వరకు నీరు పెట్టడాన్ని వాయిదా వేయండి. బోరు బావి మోటారు ఆన్ చేసే ముందు రేపు ఉదయం పొలాన్ని పరిశీలించండి. క్రింది ఆకుల అడుగున గోధుమ రంగు మచ్చలు ఏమైనా ఉన్నాయేమో చూడండి.",

    benefitEn: "Saves ~1,800 kWh pumping power, avoids waterlogging in root zone, and prevents rapid fungal spore proliferation during rainfall.",
    benefitTe: "బోరు మోటారు విద్యుత్ ఖర్చు ఆదా అవుతుంది, వేర్ల వద్ద నీరు నిలవకుండా కాపాడుతుంది మరియు వర్షం సమయంలో శిలీంధ్రాలు పెరగకుండా నిరోధిస్తుంది.",

    sources: [
      { name: "Satellite NDVI Index", val: "0.68 (Stable)" },
      { name: "IoT Sensor Node", val: "AGRI-ESP32-001 (34% VWC)" },
      { name: "Weather Radar Forecast", val: "IMD Kurnool (68% Rain)" },
      { name: "ICAR Crop Calendar", val: "Groundnut Flowering Stage (Day 42)" }
    ]
  },
  {
    id: "adv-002",
    isPriority: false,
    titleEn: "Early Leaf Spot (Tikka) risk elevation alert",
    titleTe: "ఆకు మచ్చ వ్యాధి (తిక్క తెగులు) ముందస్తు హెచ్చరిక",
    category: "pest",
    priority: "high",
    date: "2026-09-18 11:00",
    completed: false,
    confidence: 87,

    reasonEn: "High relative humidity (68%) and nocturnal leaf wetness duration exceeding 7 hours create conducive microclimate for Cercospora arachidicola germination.",
    reasonTe: "గాలిలో అధిక తేమ (68%) మరియు రాత్రి వేళ ఆకులపై 7 గంటలకు పైగా తడి ఉండటం వల్ల తిక్క తెగులు సోకే అవకాశాలు పెరుగుతున్నాయి.",

    actionEn: "Upload a photo of suspected lower leaves to Crop Diagnosis. If spots are confirmed, spray biological Trichoderma harzianum or 5% Neem Seed Kernel Extract (NSKE) at dusk.",
    actionTe: "అనుమానం ఉన్న ఆకు ఫోటోను 'పంట వ్యాధి నిర్ధారణ' లో అప్‌లోడ్ చేయండి. మచ్చలు ఉన్నట్లు తేలితే సాయంత్రం వేళ ట్రైకోడెర్మా లేదా 5% వేప గింజల కషాయం పిచికారీ చేయండి.",

    benefitEn: "Prevents early defoliation, maintaining active photosynthetic leaf area for pod development.",
    benefitTe: "ఆకులు రాలిపోకుండా కాపాడుతుంది, తద్వారా కాయలు దృఢంగా ఎదగడానికి తోడ్పడుతుంది.",

    sources: [
      { name: "Canopy Humidity Sensor", val: "68% RH" },
      { name: "Disease Forecasting Model", val: "BRICS Agro-Epidemiology Mesh" }
    ]
  },
  {
    id: "adv-003",
    isPriority: false,
    titleEn: "Apply Gypsum at pegging stage (40-45 DAS)",
    titleTe: "ఊడలు దిగే దశలో జిప్సం వేయండి (40-45 రోజులు)",
    category: "fertilizer",
    priority: "medium",
    date: "2026-09-17 14:15",
    completed: false,
    confidence: 92,

    reasonEn: "Groundnut requires readily available calcium in the pod-forming zone (top 5cm of soil) during peg entry to prevent 'pops' (hollow pods).",
    reasonTe: "వేరుశనగ ఊడలు నేలలోకి దిగే సమయంలో కాయలు గుల్ల కాకుండా ఉండటానికి పై 5 సెం.మీ నేలలో కాల్షియం అత్యంత అవసరం.",

    actionEn: "Broadcast 200 kg/acre gypsum close to crop rows when soil is slightly moist after rainfall. Lightly hoe into the soil without damaging developing pegs.",
    actionTe: "వర్షం పడిన తర్వాత నేల కొద్దిగా తేమగా ఉన్నప్పుడు ఎకరాకు 200 కిలోల జిప్సం చల్లండి. ఊడలు తెగిపోకుండా తేలికపాటి గొర్రు లేదా చేతితో నేలలో కలపండి.",

    benefitEn: "Improves shell hardening, increases kernel test weight by 14-18%, and significantly reduces empty pods.",
    benefitTe: "కాయ గట్టిదనం పెరుగుతుంది, గింజ బరువు 14-18% పెరుగుతుంది మరియు గుల్ల కాయల సమస్య నివారించబడుతుంది.",

    sources: [
      { name: "Crop Calendar", val: "Kurnool Groundnut Pegging Phase" },
      { name: "Soil Health Card", val: "Exchangeable Ca: 4.8 meq/100g (Marginal)" }
    ]
  },
  {
    id: "adv-004",
    isPriority: false,
    titleEn: "Mulching application for soil temperature regulation",
    titleTe: "నేల ఉష్ణోగ్రత నియంత్రణ కోసం మల్చింగ్ వేయండి",
    category: "regenerative",
    priority: "medium",
    date: "2026-09-16 09:30",
    completed: true,
    confidence: 85,

    reasonEn: "Late September soil temperatures can exceed 36°C at 5cm depth, impairing symbiotic nitrogen fixation in root nodules.",
    reasonTe: "సెప్టెంబర్ చివరిలో నేల ఉష్ణోగ్రత 36°C దాటే అవకాశం ఉంది, ఇది వేరు బుడిపెలలో నత్రజని స్థిరీకరణను తగ్గిస్తుంది.",

    actionEn: "Spread groundnut haulm or dry sorghum straw mulch (2 tons/acre) along the inter-row space.",
    actionTe: "వరుసల మధ్య ఎండిన జొన్న గడ్డి లేదా ఇతర పంట వ్యర్థాలను (ఎకరాకు 2 టన్నులు) రక్షక పొరగా పరచండి.",

    benefitEn: "Reduces root-zone temperature by 3-5°C and cuts irrigation water demand by 20%.",
    benefitTe: "నేల ఉష్ణోగ్రతను 3-5°C తగ్గిస్తుంది మరియు 20% నీటి అవసరాన్ని ఆదా చేస్తుంది.",

    sources: [
      { name: "Soil Thermistor", val: "29.4°C (Rising trend)" },
      { name: "Regenerative Farm Planner", val: "AP Natural Farming (APCNF) Guidelines" }
    ]
  },
  {
    id: "adv-005",
    isPriority: false,
    titleEn: "Install pheromone traps for Spodoptera litura",
    titleTe: "లద్దె పురుగు నివారణకు లింగాకర్షక బుట్టలు అమర్చండి",
    category: "pest",
    priority: "low",
    date: "2026-09-15 16:00",
    completed: false,
    confidence: 84,

    reasonEn: "Surrounding region surveillance reported male moth emergence following recent temperature fluctuation.",
    reasonTe: "పరిసర ప్రాంతాల పరిశీలనలో ఉష్ణోగ్రత హెచ్చుతగ్గుల వల్ల లద్దె పురుగు రెక్కల పురుగులు కనిపించినట్లు నమోదైంది.",

    actionEn: "Erect 4-5 pheromone traps per acre at crop canopy height to monitor threshold population before any biological spray.",
    actionTe: "పంట ఎత్తులో ఎకరాకు 4-5 లింగాకర్షక బుట్టలను అమర్చి, పురుగుల ఉధృతిని ముందుగానే గమనించండి.",

    benefitEn: "Early warning avoids unnecessary chemical pesticide expenditure and protects natural spider predators.",
    benefitTe: "ఖరీదైన పురుగుమందుల వాడకాన్ని తగ్గిస్తుంది మరియు సహజ మిత్ర పురుగులను కాపాడుతుంది.",

    sources: [
      { name: "Regional Extension Bulletin", val: "Kurnool District Agri-Portal" }
    ]
  }
];
