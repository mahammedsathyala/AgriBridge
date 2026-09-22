# AgriBridge — Technical Architecture & Data Cooperation Specification

## 1. Executive Summary

**AgriBridge** is a scalable digital public good designed in alignment with the **BRICS AgriN initiative**. It empowers small and marginal farmers across emerging economies with data-driven agronomic guidance while creating an interoperable bridge for cross-border agricultural model exchange and food security cooperation among BRICS nations (Brazil, Russia, India, China, and South Africa).

---

## 2. System Architecture

```
[ In-Situ Telemetry ]        [ Remote Sensing ]           [ Meteorological ]
  AGRI-ESP32-001               Sentinel-2 / Landsat         IMD Doppler Radar
  Soil Moisture, Temp          NDVI, EVI, Moisture          7-Day Forecast
          │                            │                           │
          ▼                            ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AgriBridge Local Edge Engine                          │
│                                                                             │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │ Farm Profile & State    │             │ Trilingual i18n System        │  │
│  │ (localStorage / SQLite) │             │ (English, Telugu, Hindi)      │  │
│  └─────────────────────────┘             └───────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │ MobileNetV2 Vision      │             │ Explainable Agro-AI Advisor   │  │
│  │ (5-Class Pathology CV)  │             │ (Multi-Source Decision Logic) │  │
│  └─────────────────────────┘             └───────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │ Agronomic Chart Box     │             │ "Ask Me" Crop AI Engine       │  │
│  │ (Multi-Metric Telemetry)│             │ (Multi-Crop Stage Calibrated) │  │
│  └─────────────────────────┘             └───────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        Common Agricultural Data Schema
                        (CADS v1.4 / Anonymized JSON)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BRICS AgriN Data Cooperation Mesh                        │
│                                                                             │
│   🇮🇳 India (ICAR)       🇧🇷 Brazil (Embrapa)      🇷🇺 Russia (Vavilov)       │
│   🇨🇳 China (CAAS)       🇿🇦 South Africa (ARC)     🎓 Partner Universities  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Component Architecture

AgriBridge uses a component-based Vanilla ES6+ modular design pattern with zero compilation overhead:

```
src/
├── app.js                          # SPA Controller, routing, reactive state store
├── pages/
│   ├── OverviewPage.js             # Live dashboard, clock, KPI cards, CropHealthChart
│   ├── MyFarmPage.js               # Boundary visualizer, IoT node sync, profile editor
│   ├── AdvisoryPage.js             # Advisory hub: Chart Box, Ask Me Crop AI, ChatBot, Cards
│   ├── WeatherPage.js              # Doppler forecast, agro-climatic alerts, rain trend chart
│   └── SettingsPage.js             # Low-bandwidth switch, language, privacy, API keys
│
└── components/
    ├── Header.js                   # Navigation bar, quick telemetry badges, language switcher
    ├── Sidebar.js                  # Desktop navigational sidebar with active tab tracking
    ├── MobileNav.js                # One-thumb mobile bottom navigation bar
    ├── AdvisoryChartBox.js         # Interactive telemetry trends (Moisture, Health, Pests, NPK)
    ├── AskMeCropSection.js         # Dedicated Crop AI Q&A (Multi-Crop, Stage, Voice, Dosage)
    ├── ChatBot.js                  # "Ask AgriAI" conversational assistant with disease progression
    ├── AdvisoryCard.js             # Categorized actionable advisory cards with WhatsApp share
    ├── CropHealthChart.js          # SVG line chart for crop vigor, soil moisture & thermal stress
    ├── DiagnosisView.js            # MobileNetV2 leaf image dropzone, neural scan & remedies
    ├── RegenerativeView.js         # Regenerative practices planner with dynamic score gauge
    ├── FarmMap.js                  # Kurnool SVG farm boundary with NDVI overlay
    ├── NetworkGraph.js             # BRICS data cooperation topology & CADS simulator
    └── Toast.js                    # Non-blocking reactive notifications
```

---

## 4. "Ask Me" & Agronomic Advisory Intelligence Pipeline

The AI Advisory architecture operates a 3-tier intelligent processing pipeline:

```
[ User Input (Text or Voice) ]
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Crop Context Resolution & Normalization                                  │
│    - Active Crop (Groundnut, Cotton, Chilli, Paddy, Tomato, Maize, etc.)   │
│    - Phenological Stage (Sowing, Vegetative, Flowering/Pegging, Pod/Fruit) │
│    - Soil & Weather Context (Moisture %, Canopy Temp °C, Rain Forecast mm) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. Dual-Engine Advisory Evaluation                                          │
│    ├─ Primary: Live Anthropic Claude 3.5 Sonnet (via Flask API /localizations)│
│    └─ Resilient Edge: Regional ICAR / ANGRAU Knowledge Base Engine          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Structured Explainable Response Card Generation                          │
│    - 🔎 Diagnostic Observation (Canopy & Soil State)                        │
│    - 💡 Specific Recommendation & Organic/Chemical Remedies                 │
│    - 🧪 Dosage Matrix Table (Product Name & Application Rate per Liter/Acre)│
│    - ⚠️ Key Risk & Weather Precautions (Wash-off, Phytotoxicity, Resistance)│
│    - 📅 Immediate Action Checklist                                          │
│    - 🔊 Web Speech API Vernacular Voice Playback (Telugu, Hindi, English)  │
│    - 📤 One-Click Share with Agricultural Extension Officer (WhatsApp)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Schemas & TypeScript Interfaces

### Farm & Sensor Model
```typescript
interface FarmProfile {
  id: string;
  farmerName: string;
  farmerId: string;
  farmName: string;
  location: string;
  coordinates: { lat: number; lng: number };
  areaAcres: number;
  crop: string;
  cropVariety: string;
  sowingDate: string;
  cropAgeDays: number;
  growthStage: string;
  soilType: string;
  irrigationType: string;
  cropHealthScore: number;       // 0-100
  soilMoisturePercent: number;   // 0-100%
  rainfallForecastMm: number;
  diseaseRisk: 'Low' | 'Medium' | 'High';
  sensorNode: SensorTelemetry;
}

interface SensorTelemetry {
  id: string;
  status: 'online' | 'offline' | 'degraded';
  batteryPercent: number;
  lastSync: string;
  soilMoisture: number;          // Volumetric Water Content %
  soilTemp: number;              // °C at 15cm
  ambientTemp: number;           // °C
  humidity: number;              // % RH
  signalStrength: string;        // dBm
}
```

### Crop-Specific Advisory Query Model (`AskMeCropSection`)
```typescript
interface CropAdvisoryQuery {
  cropId: 'groundnut' | 'cotton' | 'chilli' | 'rice' | 'tomato' | 'maize' | 'pulses' | 'mango';
  variety: string;
  growthStage: string;
  farmerQuestion: string;
  locale: 'en' | 'te' | 'hi';
  telemetryContext: {
    soilMoisturePercent: number;
    canopyTempC: number;
    rainfallOutlookMm: number;
  };
}

interface CropAdvisoryResponse {
  cropId: string;
  variety: string;
  stageName: string;
  observation: string;
  recommendation: string;
  dosageDetails: Array<{ item: string; dose: string }>;
  riskAlert: string;
  actionSteps: string[];
  knowledgeSource: string;
  timestamp: string;
}
```

### BRICS Prototype Interoperability Schema (CADS v1.4)
```json
{
  "$schema": "https://agribridge.brics-agrin.org/schemas/v1/interop.json",
  "exchange_id": "XCHG-BRICS-884192",
  "timestamp": "2026-09-18T13:30:00Z",
  "protocol_version": "AgriBridge-CADS-v1.4",
  "sender": {
    "country": "IN",
    "organization": "ICAR & AP Agtech Digital Public Mesh",
    "adapter_id": "cad-adapter-in-v1"
  },
  "recipient": {
    "country": "BR",
    "organization": "Embrapa",
    "adapter_id": "cad-adapter-br-v1"
  },
  "privacy_compliance": {
    "anonymization_method": "Differential-Privacy-Epsilon-0.5",
    "pii_stripped": true,
    "farmer_consent_verified": true,
    "geo_fuzzing_radius_km": 2.5
  },
  "payload": {
    "data_indicator": "Crop Health & Soil Moisture Telemetry",
    "crop": "groundnut",
    "variety": "Kadiri-6",
    "growth_stage": "flowering",
    "soil_moisture_percent": 34,
    "rainfall_forecast_mm": 18,
    "crop_health_index": 0.78,
    "drought_stress_risk": "low-medium",
    "language": "te",
    "region_code": "IN-AP-KURNOOL",
    "spectral_ndvi_mean": 0.68
  },
  "signature": "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
}
```

---

## 6. API Endpoints Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Backend service health check |
| `GET` | `/api/v1/farm` | Retrieve farm profile and live IoT node data |
| `PUT` | `/api/v1/farm` | Update farm details (crop, variety, area, growth stage) |
| `GET` | `/api/v1/weather` | 7-day meteorological forecast and agro-climatic alerts |
| `GET` | `/api/v1/sensors/telemetry` | Time-series ESP32 soil moisture & temperature history |
| `POST` | `/api/v1/advisories` | Generate localized rule-based and AI advisories |
| `GET` | `/api/v1/advisories/history` | Historical advisory actions & completion logs |
| `POST` | `/api/v1/advisories/complete` | Toggle advisory completion status |
| `POST` | `/api/v1/localizations` | LLM vernacular query translation & advisory generation |
| `POST` | `/api/v1/diagnoses` | Deep Learning MobileNetV2 crop disease photo screening |
| `GET` | `/api/v1/diagnoses/history` | Historical disease diagnostic evaluations |
| `GET` | `/api/v1/regenerative/assessment` | Farm regenerative score and practice impact matrix |
| `POST` | `/api/v1/interop/exchange` | Trigger cross-border BRICS CADS data exchange |

---

## 7. Security & Privacy Principles

1. **Zero Personal Identifiers in Cross-Border Mesh**: Personal names, phone numbers, and precise residential locations are stripped at the local adapter layer.
2. **Geo-Fuzzing**: Plot coordinates transmitted in data-exchange simulations are fuzzed to a 2.5 km quadrant to protect farmer land privacy.
3. **Opt-in Sharing**: All external telemetry contributions require explicit opt-in in the Settings panel.
4. **Safety Disclaimers**: All AI advisories are explicitly marked as decision-support suggestions, discouraging hazardous pesticide misuse and recommending verification with agricultural extension officers.
5. **Offline Fallback Architecture**: If backend servers or internet connections are interrupted, edge heuristic rules and stored local storage caches ensure farmers retain continuous access to critical guidance.
