# 🌱 AgriN — AI-Powered Regenerative Agricultural Advisory Platform

> **Hackathon**: Track 4: AgriN & Regenerative Agricultural Intelligence (BRICS Cooperation Theme)

AgriN is an interoperable digital agriculture platform delivering localized, climate-resilient agro-advisories for smallholder farmers across emerging economies.

---

## 📁 Project Structure

```text
agrin-project/
├── backend/
│   ├── app.py                         # Flask server entrypoint
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment configuration template
│   ├── config.py                      # App configuration
│   ├── routes/
│   │   ├── advisory.py                # [MVP 1: Active] POST /advisory endpoint
│   │   ├── diagnose.py                # [MVP 3: Stub] Crop disease diagnosis
│   │   └── soil_data.py               # [MVP 2: Stub] SoilGrids data route
│   ├── engines/
│   │   ├── advisory_engine.py         # [MVP 1: Active] Static rules engine
│   │   ├── disease_diagnosis.py       # [MVP 3: Stub] YOLOv8 vision engine
│   │   └── llm_advisory.py            # [MVP 4: Stub] Anthropic Claude localizer
│   ├── data_sources/
│   │   ├── satellite.py               # [MVP 2: Stub] Sentinel Hub / Bhuvan NDVI
│   │   ├── weather.py                 # [MVP 2: Stub] Open-Meteo weather API
│   │   └── soil.py                    # [MVP 2: Stub] ISRIC SoilGrids REST API
│   ├── schema/
│   │   └── advisory_schema.json       # Interoperable BRICS JSON schema
│   ├── models/
│   │   └── yolov8_crop_disease.pt     # Placeholder for AgriGuard YOLOv8 weights
│   └── mqtt/
│       └── sensor_listener.py         # Optional live ESP32 soil sensor subscriber
├── frontend/
│   ├── index.html                     # Mobile-first dashboard HTML
│   ├── css/style.css                  # Mobile-first styling
│   └── js/app.js                      # Client logic
├── knowledge_base/
│   └── agronomy_notes/                # Agronomic and regenerative guidelines
├── docs/
│   └── PROJECT_BRIEF.md               # Track 4 problem statement & architecture
└── README.md
```

---

## 🚀 Quickstart: Running the AgriN API

AgriN provides automated live data ingestion (Open-Meteo, ISRIC SoilGrids, Satellite NDVI) alongside static rules evaluation.

### 1. Setup & Install Dependencies
```bash
cd agrin-project/backend
pip install -r requirements.txt
```

### 2. Start the Flask Server
```bash
python app.py
```
The server starts at `http://localhost:5000`.

---

## 📡 Live Endpoints & API Usage

### 1. Automated Advisory by GPS Coordinates (`POST /advisory`)
Automatically pulls live weather from Open-Meteo, soil texture and SOC from SoilGrids, and vegetation health from Sentinel NDVI.

```bash
curl -X POST http://localhost:5000/advisory \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 17.3850,
    "longitude": 78.4867,
    "location": "Telangana Deccan Zone"
  }'
```

### 2. Crop Disease Diagnosis (`POST /diagnose` or `POST /api/diagnose`)
Upload a plant leaf photo (multipart/form-data or JSON Base64) for YOLOv8 disease detection and organic remedies.

```bash
curl -X POST http://localhost:5000/diagnose \
  -F "image=@leaf_sample.jpg" \
  -F "crop_name=Groundnut"
```

Or using JSON Base64:
```bash
curl -X POST http://localhost:5000/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "<base64_encoded_string>",
    "crop_name": "Tomato"
  }'
```

**Supported Pathologies & Treatments:**
- **Tikka Leaf Spot (Cercospora)**: 5% Neem Seed Kernel Extract (NSKE) + Trichoderma viride biocontrol.
- **Leaf Rust (Puccinia)**: Elemental sulfur dusting (20-25 kg/ha) + fermented cow urine foliar spray.
- **Bacterial Blight (Xanthomonas)**: Fresh cow dung filtrate (20% natural antagonistic phages) + copper barrier.
- **Powdery Mildew**: Dilute cow milk spray (1:9 ratio, lactoferrin photo-inactivation).
- **Healthy Plant**: Prophylactic vermiwash (10%) & soil armor maintenance.

---

### 3. Multilingual Farmer Advisory Localizer (`POST /localize` or `POST /api/localize`)
Converts technical data or disease detections into short, respectful, audio/voice-ready vernacular scripts for smallholders in BRICS languages (Telugu `te`, Hindi `hi`, English `en`, Portuguese `pt`, Russian `ru`, Mandarin `zh`).

```bash
curl -X POST http://localhost:5000/localize \
  -H "Content-Type: application/json" \
  -d '{
    "language": "te",
    "advisory_data": {
      "recommendations": [
        {
          "crop": "Pearl Millet (Bajra)",
          "companion_crop": "Cowpea",
          "soil_regeneration_practices": ["Residue retention mulching"]
        }
      ]
    },
    "farmer_profile": {
      "farmer_name": "Sathyala",
      "land_acres": 2.5
    }
  }'
```

**Unified One-Step Call:** Pass `"localize": true, "language": "te"` directly to `POST /advisory` to receive both live telemetry, recommendations, and the vernacular audio script in a single payload!

---

### 4. Direct Weather Telemetry (`GET /api/weather-data`)
```bash
curl "http://localhost:5000/api/weather-data?lat=17.3850&lon=78.4867"
```

### 3. Direct Soil Profile (`GET /api/soil-data`)
```bash
curl "http://localhost:5000/api/soil-data?lat=17.3850&lon=78.4867"
```

### 4. Manual Input / Override Mode (`POST /advisory`)
```bash
curl -X POST http://localhost:5000/advisory \
  -H "Content-Type: application/json" \
  -d '{
    "soil_type": "sandy",
    "weather": "dry",
    "season": "kharif"
  }'
```

**Sample Response:**
```json
{
  "status": "success",
  "version": "1.0.0-mvp1",
  "timestamp": "2026-09-21T18:45:00Z",
  "engine": "AgriN Static Rules Engine v1.0",
  "inputs_received": {
    "soil_type": "sandy",
    "weather": "dry",
    "season": "kharif",
    "location": "Deccan Plateau"
  },
  "recommendation_count": 3,
  "recommendations": [
    {
      "rank": 1,
      "crop": "Pearl Millet (Bajra / Pennisetum glaucum)",
      "category": "Climate-Resilient C4 Cereal",
      "suitability_score": "100%",
      "companion_crop": "Cowpea (Vigna unguiculata) or Moth Bean",
      "soil_regeneration_practices": [
        "Residue retention mulching to prevent wind erosion",
        "Broad-bed and furrow (BBF) planting for in-situ moisture conservation",
        "Minimum tillage to preserve soil aggregate stability"
      ],
      "water_management": "Tolerates dry spells up to 3-4 weeks...",
      "expected_soil_benefits": "High root biomass adds 1.5-2.0 tons/ha organic matter...",
      "rationale": "Pearl millet thrives in moisture-deficit, high-heat conditions with poor sandy soils..."
    }
  ],
  "general_regenerative_guidelines": [
    "Maintain continuous live root presence in the field...",
    "Priority Moisture Action: Implement in-situ straw mulching..."
  ]
}
```

---

## 🗺️ 5-Stage Implementation Roadmap

1. **MVP 1 (Current)**: Static rules engine — manual soil/weather/season input → 2-3 regenerative crop/practice recommendations returned as JSON.
2. **MVP 2**: Automated live data ingestion (Open-Meteo weather API, SoilGrids 250m REST API, Sentinel-2 / Bhuvan satellite NDVI).
3. **MVP 3**: Computer vision crop disease diagnosis using YOLOv8 trained model (`models/yolov8_crop_disease.pt`).
4. **MVP 4**: Multilingual Anthropic Claude LLM localization for voice/text guidance for smallholder farmers.
5. **MVP 5**: BRICS-standard open JSON schema and interactive mobile-first dashboard.
