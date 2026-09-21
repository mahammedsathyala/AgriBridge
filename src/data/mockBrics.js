export const bricsCountries = [
  {
    code: "IN",
    name: "India",
    nameTe: "భారతదేశం",
    institution: "ICAR & AP Agtech Digital Public Mesh",
    flag: "🇮🇳",
    crops: ["Rice", "Groundnut", "Cotton", "Millets"],
    cropsTe: ["వరి", "వేరుశనగ", "ప్రత్తి", "చిరుధాన్యాలు"],
    status: "Connected",
    statusType: "active",
    contributedData: "Localized IMD Weather models, ICAR crop growth calendars, Soil health indicators, Sentinel-2 vegetation indices",
    contributedDataTe: "స్థానిక వాతావరణ నమూనాలు, పంట ఎదుగుదల క్యాలెండర్లు, నేల ఆరోగ్య సూచికలు",
    languages: ["English", "Telugu (తెలుగు)", "Hindi (हिन्दी)"]
  },
  {
    code: "BR",
    name: "Brazil",
    nameTe: "బ్రెజిల్",
    institution: "Embrapa (Empresa Brasileira de Pesquisa Agropecuária)",
    flag: "🇧🇷",
    crops: ["Soybean", "Maize", "Coffee", "Sugarcane"],
    cropsTe: ["సోయాబీన్", "మొక్కజొన్న", "కాఫీ", "చెరకు"],
    status: "Demo Adapter",
    statusType: "adapter",
    contributedData: "Tropical rainfall forecasting algorithms, Agro-forestry canopy models, Soil moisture satellite telemetry",
    contributedDataTe: "వర్షపాత అంచనా అల్గారిథమ్‌లు, నేల తేమ ఉపగ్రహ సమాచారం",
    languages: ["Portuguese (Português)"]
  },
  {
    code: "RU",
    name: "Russia",
    nameTe: "రష్యా",
    institution: "Vavilov All-Russian Institute of Plant Genetic Resources",
    flag: "🇷🇺",
    crops: ["Wheat", "Barley", "Sunflower", "Oats"],
    cropsTe: ["గోధుమ", "బార్లీ", "పొద్దుతిరుగుడు"],
    status: "Demo Adapter",
    statusType: "adapter",
    contributedData: "Cold resilience indices, High-latitude drought forecasting, Continental agro-meteorological models",
    contributedDataTe: "శీతల వాతావరణ పంట నమూనాలు, కరువు సూచికలు",
    languages: ["Russian (Русский)"]
  },
  {
    code: "CN",
    name: "China",
    nameTe: "చైనా",
    institution: "CAAS (Chinese Academy of Agricultural Sciences)",
    flag: "🇨🇳",
    crops: ["Rice", "Wheat", "Maize", "Tea"],
    cropsTe: ["వరి", "గోధుమ", "మొక్కజొన్న", "తేయాకు"],
    status: "Demo Adapter",
    statusType: "adapter",
    contributedData: "Multi-band hyperspectral crop-health indices, Subsurface drainage AI models, Automated pest radar diagnostics",
    contributedDataTe: "హైపర్‌స్పెక్ట్రల్ పంట ఆరోగ్య సూచికలు, చీడపీడల రాడార్ నమూనాలు",
    languages: ["Chinese (中文)"]
  },
  {
    code: "ZA",
    name: "South Africa",
    nameTe: "దక్షిణాఫ్రికా",
    institution: "ARC (Agricultural Research Council)",
    flag: "🇿🇦",
    crops: ["Maize", "Wheat", "Vegetables", "Citrus"],
    cropsTe: ["మొక్కజొన్న", "గోధుమ", "కూరగాయలు"],
    status: "Demo Adapter",
    statusType: "adapter",
    contributedData: "Semi-arid drought-risk indicators, Borewell recharge predictive models, Smallholder cooperative telemetry",
    contributedDataTe: "వర్షాభావ ప్రాంతాల కరువు సూచికలు, బోరుబావుల పునరుజ్జీవన నమూనాలు",
    languages: ["English", "isiZulu", "Afrikaans"]
  }
];

export const bricsNetworkGraph = {
  nodes: [
    { id: "IN", label: "India (ICAR / AP)", x: 260, y: 190, color: "#e76f51", pulse: true, type: "country" },
    { id: "BR", label: "Brazil (Embrapa)", x: 70, y: 250, color: "#2a9d8f", pulse: false, type: "country" },
    { id: "RU", label: "Russia (Vavilov)", x: 280, y: 60, color: "#457b9d", pulse: false, type: "country" },
    { id: "CN", label: "China (CAAS)", x: 370, y: 130, color: "#e63946", pulse: false, type: "country" },
    { id: "ZA", label: "South Africa (ARC)", x: 190, y: 290, color: "#f4a261", pulse: false, type: "country" },
    { id: "UNIV", label: "Partner Universities", x: 140, y: 110, color: "#a8dadc", pulse: false, type: "partner" },
    { id: "COOP", label: "Farmer Collectives", x: 350, y: 260, color: "#52b788", pulse: false, type: "partner" },
    { id: "EXT", label: "Agri-Extension Mesh", x: 210, y: 140, color: "#e9c46a", pulse: true, type: "partner" },
  ],
  links: [
    { source: "IN", target: "BR", active: true },
    { source: "IN", target: "RU", active: true },
    { source: "IN", target: "CN", active: true },
    { source: "IN", target: "ZA", active: true },
    { source: "BR", target: "ZA", active: false },
    { source: "RU", target: "CN", active: false },
    { source: "IN", target: "UNIV", active: true },
    { source: "IN", target: "COOP", active: true },
    { source: "IN", target: "EXT", active: true },
    { source: "UNIV", target: "EXT", active: false },
  ]
};

export const sampleDataExchangePayload = (source, target, indicator) => ({
  $schema: "https://agribridge.brics-agrin.org/schemas/v1/interop.json",
  exchange_id: "XCHG-BRICS-" + Math.floor(100000 + Math.random() * 900000),
  timestamp: new Date().toISOString(),
  protocol_version: "AgriBridge-CADS-v1.4",
  sender: {
    country: source.code,
    organization: source.institution,
    adapter_id: `cad-adapter-${source.code.toLowerCase()}-v1`
  },
  recipient: {
    country: target.code,
    organization: target.institution,
    adapter_id: `cad-adapter-${target.code.toLowerCase()}-v1`
  },
  privacy_compliance: {
    anonymization_method: "Differential-Privacy-Epsilon-0.5",
    pii_stripped: true,
    farmer_consent_verified: true,
    geo_fuzzing_radius_km: 2.5
  },
  payload: {
    data_indicator: indicator,
    crop: "groundnut",
    growth_stage: "flowering",
    soil_moisture_percent: 34,
    rainfall_forecast_mm: 18,
    crop_health_index: 0.78,
    drought_stress_risk: "low-medium",
    language: "te",
    region_code: "IN-AP-KURNOOL",
    spectral_ndvi_mean: 0.68
  },
  signature: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
});
