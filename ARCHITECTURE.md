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
│  │ Farm Profile & State    │             │ Bilingual i18n System         │  │
│  │ (localStorage / IndexedDB)│           │ (English & Telugu)            │  │
│  └─────────────────────────┘             └───────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │ Computer Vision Screener│             │ Explainable Agro-AI Advisor   │  │
│  │ (Cercospora Leaf Spot)  │             │ (Multi-Source Decision Logic) │  │
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

## 3. Data Schemas & TypeScript Interfaces

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

### Advisory Model
```typescript
interface AgroAdvisory {
  id: string;
  isPriority: boolean;
  titleEn: string;
  titleTe: string;
  category: 'irrigation' | 'fertilizer' | 'pest' | 'weather' | 'soil' | 'regenerative' | 'harvest';
  priority: 'low' | 'medium' | 'high';
  date: string;
  completed: boolean;
  confidence: number;
  reasonEn: string;
  reasonTe: string;
  actionEn: string;
  actionTe: string;
  benefitEn: string;
  benefitTe: string;
  sources: Array<{ name: string; val: string }>;
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

## 4. API Endpoints Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/farms` | List registered smallholder farms |
| `GET` | `/api/farms/:id` | Get telemetry and profile for specific farm |
| `PUT` | `/api/farms/:id` | Update farm details (crop, area, irrigation) |
| `GET` | `/api/weather/:farmId` | Get 7-day Doppler forecast & climate alerts |
| `GET` | `/api/soil/:farmId` | Get real-time ESP32 soil moisture & thermistor data |
| `GET` | `/api/satellite/:farmId` | Get Sentinel-2 NDVI/EVI multispectral indices |
| `GET` | `/api/advisories/:farmId` | Get localized agro-advisories |
| `POST` | `/api/advisories/:id/complete` | Toggle advisory completion status |
| `POST` | `/api/diagnosis` | Upload leaf image for neural disease screening |
| `GET` | `/api/diagnosis/history` | Retrieve historical crop health diagnostic scans |
| `POST` | `/api/regenerative-practices` | Update farm regenerative practices & roadmap |
| `POST` | `/api/interoperability/exchange` | Trigger cross-border BRICS data transmission |

---

## 5. Security & Privacy Principles

1. **Zero Personal Identifiers in Cross-Border Mesh**: Personal names, phone numbers, and precise residential locations are stripped at the local adapter layer.
2. **Geo-Fuzzing**: Plot coordinates transmitted in data-exchange simulations are fuzzed to a 2.5 km quadrant to protect farmer land privacy.
3. **Opt-in Sharing**: All external telemetry contributions require explicit opt-in in the Settings panel.
4. **Safety Disclaimers**: All AI advisories are explicitly marked as decision-support suggestions, discouraging hazardous pesticide misuse and recommending verification with agricultural extension officers.
