export const mockSampleDiagnosis = {
  conditionEn: "Groundnut Leaf Spot (Early Tikka Disease)",
  conditionTe: "వేరుశనగ తొలి ఆకు మచ్చ వ్యాధి (తిక్క తెగులు)",
  pathogen: "Cercospora arachidicola",
  confidencePercent: 87,
  severityLevel: "Early Stage (Grade 2/9)",
  severityLevelTe: "ప్రారంభ దశ (గ్రేడ్ 2/9)",
  affectedCanopy: "Lower canopy foliage (approx. 6-8% leaf area)",
  affectedCanopyTe: "క్రింది ఆకులు (సుమారు 6-8% ఆకుల విస్తీర్ణం)",
  
  symptomsEn: [
    "Sub-circular reddish-brown to dark brown necrotic lesions on adaxial leaf surface",
    "Conspicuous bright yellow chlorotic halos surrounding lesions",
    "Symptoms confined predominantly to older basal leaves",
    "Absence of stem lesion coalescence at present stage"
  ],
  symptomsTe: [
    "ఆకుల పైభాగంలో ముదురు గోధుమ లేదా ఎరుపు రంగు వలయాకార మచ్చలు",
    "మచ్చల చుట్టూ స్పష్టమైన పసుపు రంగు వలయం (Yellow Halo)",
    "ప్రధానంగా క్రింది మరియు ముదిరిన ఆకులపై మాత్రమే లక్షణాలు కనిపిస్తున్నాయి",
    "కొమ్మలు మరియు కాండంపై ఇంకా వ్యాధి వ్యాపించలేదు"
  ],

  immediateActionEn: "Prune heavily spotted bottom leaves that touch the wet soil surface. Prepare a botanical biological spray of 5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride bio-fungicide (5g per liter of water) during early morning or late afternoon.",
  immediateActionTe: "నేలను తాకుతున్న వ్యాధి సోకిన క్రింది ఆకులను తుంచి నాశనం చేయండి. ఉదయం లేదా సాయంత్రం వేళల్లో 5% వేప గింజల కషాయం లేదా ట్రైకోడెర్మా విరిడి (లీటరు నీటికి 5 గ్రాములు) పిచికారీ చేయండి.",

  preventionPracticesEn: [
    "Avoid overhead sprinkler irrigation which creates continuous leaf wetness.",
    "Ensure balanced potassium and phosphorus nutrition; avoid excess nitrogen.",
    "Adopt intercropping with pigeon pea or pearl millet to create physical barrier against airborne conidiospores."
  ],
  preventionPracticesTe: [
    "ఆకులపై ఎక్కువసేపు నీరు నిలిచేలా పైనుండి నీరు చిమ్మే పద్ధతులను నివారించండి.",
    "నత్రజని అధికంగా వేయకుండా పొటాష్ మరియు భాస్వరం సమపాళ్లలో అందించండి.",
    "గాలి ద్వారా వ్యాపించే శిలీంధ్రాలను అడ్డుకోవడానికి కంది లేదా సజ్జ వంటి పంటలతో అంతర పంటలు వేయండి."
  ],

  whenToConsultEn: "If spots spread to the middle and upper third of the crop canopy within 5 days, or if premature defoliation is observed, bring a fresh leaf sample to your nearest Mandal Agricultural Officer or KVK Kurnool.",
  whenToConsultTe: "రాబోయే 5 రోజుల్లో మచ్చలు పై ఆకులకు కూడా వ్యాపిస్తే లేదా ఆకులు రాలిపోతుంటే, వెంటనే ఆకు నమూనాను మండల వ్యవసాయ అధికారికి లేదా కర్నూలు కేవీకేకు చూపించండి."
};

export const mockDiagnosisHistory = [
  {
    id: "diag-hist-001",
    date: "2026-09-18",
    crop: "Groundnut",
    cropTe: "వేరుశనగ",
    diagnosis: "Early Leaf Spot (Tikka)",
    diagnosisTe: "ఆకు మచ్చ వ్యాధి (తిక్క)",
    confidence: "87%",
    status: "Treatment Advised",
    statusTe: "చికిత్స సూచించబడింది",
    imageUrl: "./src/assets/sample_leaf.jpg"
  },
  {
    id: "diag-hist-002",
    date: "2026-09-02",
    crop: "Groundnut",
    cropTe: "వేరుశనగ",
    diagnosis: "Healthy Foliage (Mild Nitrogen Deficiency)",
    diagnosisTe: "ఆరోగ్యకరమైన ఆకులు (స్వల్ప నత్రజని లోపం)",
    confidence: "94%",
    status: "Resolved",
    statusTe: "పరిష్కరించబడింది",
    imageUrl: null
  },
  {
    id: "diag-hist-003",
    date: "2026-08-20",
    crop: "Groundnut",
    cropTe: "వేరుశనగ",
    diagnosis: "Collar Rot Screening (Negative)",
    diagnosisTe: "మొక్క మొదలు కుళ్లు పరిశీలన (నెగటివ్)",
    confidence: "91%",
    status: "Normal",
    statusTe: "సాధారణం",
    imageUrl: null
  }
];
