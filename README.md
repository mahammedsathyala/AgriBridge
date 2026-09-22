# 🌱 AgriBridge — BRICS AI Agriculture Network

<p align="center">
  <img src="src/assets/logo.svg" alt="AgriBridge Logo" width="100" height="100" />
</p>

<p align="center">
  <strong>AI-powered climate-resilient farming for a connected world</strong><br>
  <em>Local advice. Shared knowledge. Sustainable harvests.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-AgriBridge%20%7C%20AgriN-2d6a4f?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Focus-BRICS%20Cooperation-1b4332?style=for-the-badge" alt="BRICS Cooperation">
  <img src="https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A4%80-40916c?style=for-the-badge" alt="Multilingual">
  <img src="https://img.shields.io/badge/Architecture-Decentralized%20Public%20Good-52b788?style=for-the-badge" alt="Decentralized">
  <img src="https://img.shields.io/badge/License-MIT-74c69d?style=for-the-badge" alt="License">
</p>

---

## 📌 Executive Summary

**AgriBridge** is a digital public good and agricultural intelligence platform engineered for smallholder and marginal farmers across emerging economies. Anchored in the **BRICS Cooperation Theme** (inspired by the BRICS AgriN initiative), AgriBridge combines **hyperlocal on-farm decision support** with **cross-border agricultural data interoperability** across Brazil, Russia, India, China, and South Africa.

Initially piloted for smallholder groundnut farming in **Kurnool, Andhra Pradesh, India**, AgriBridge tackles critical agricultural vulnerabilities:
- 🌦️ **Erratic weather patterns & dry spells** driven by climate volatility.
- 📉 **Soil degradation & microbial depletion** from intensive synthetic monoculture.
- 🔍 **Delayed crop disease detection** causing devastating yield losses.
- 🗣️ **Language and digital literacy barriers** that exclude rural farmers from modern digital tools.
- 🌐 **Siloed agricultural research** between emerging economies facing identical climate challenges.

AgriBridge delivers a seamless, zero-build-step, mobile-first Web application connected to the **AgriN Python Flask intelligent backend**—integrating satellite remote sensing, SoilGrids 250m soil chemistry, live IoT sensor telemetry, computer vision disease diagnosis (YOLOv8), and vernacular generative AI (Anthropic Claude).

---

## 🏛️ System Architecture

AgriBridge operates on a dual-tier modular architecture designed for offline resilience, high accessibility, and decentralized cross-border interoperability:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             EDGE / FARMER TIER (Web SPA)                         │
│  - Vanilla ES6+ Browser Native (Zero Build Step)    - Responsive Layout & PWA    │
│  - Trilingual i18n (English, Telugu తెలుగు, Hindi हिंदी)  - Low-Bandwidth Mode (2G/3G) │
│  - Interactive SVG Farm Boundary Visualizer        - Dynamic Regenerative Gauge │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST / JSON (or Mock Fallback)
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                           AGRIN INTELLIGENCE BACKEND                              │
│                               (Python / Flask API)                               │
├───────────────────────┬──────────────────────────┬───────────────────────────────┤
│    ADVISORY ENGINE    │   COMPUTER VISION ENGINE │     VERNACULAR LLM ENGINE     │
│  - Static Rules & CADS│  - YOLOv8 Disease Model  │  - Anthropic Claude 3.5       │
│  - Dynamic Agro Logic │  - Biological Treatments │  - Vernacular Voice/Text      │
└───────────┬───────────┴────────────┬─────────────┴───────────────┬───────────────┘
            │                        │                             │
┌───────────▼────────────────────────▼─────────────────────────────▼───────────────┐
│                          DATA SOURCES & INTEROPERABILITY                         │
├───────────────────────┬──────────────────────────┬───────────────────────────────┤
│    EARTH & WEATHER    │       SOIL SCIENCE       │       BRICS COOPERATION       │
│  - Open-Meteo API     │  - ISRIC SoilGrids 250m  │  - CADS Open JSON Schema      │
│  - Sentinel-2 / Bhuvan│  - Real-time ESP32 MQTT  │  - Mutual TLS Country Adapters│
│    NDVI Vegetation    │    Soil Telemetry        │  - Privacy Zero-PII Exchange  │
└───────────────────────┴──────────────────────────┴───────────────────────────────┘
```

---

## ✨ Core Features & Platform Capabilities

### 1. 📊 Farm Overview & Hyperlocal Telemetry
- **Dynamic Welcome & Agro-Greeting**: Localized greeting with current Kurnool farming advice.
- **Key Farm Telemetry Metrics**:
  - **Crop Health**: 78/100 (Flowering stage, Kadiri-6 groundnut).
  - **Soil Moisture**: 34% (Red loamy soil, optimal moisture retention window).
  - **Rainfall Forecast**: 18 mm predicted over next 3 days.
  - **Disease Risk**: Medium risk alert for *Cercospora* (Tikka leaf spot).
- **Interactive 14-Day Health Chart**: Multi-series SVG line chart tracking Crop Health score, Soil Moisture percentage, and Temperature Stress (°C) with selectable 7-day, 14-day, and 30-day timeframes.
- **Priority Action Card**: Instant recommendations (e.g., deferring drip irrigation ahead of convective rainfall).

### 2. 🗺️ Interactive Farm Boundary & IoT Telemetry
- **Kurnool Farm Boundary**: Custom GeoJSON polygon rendering for **Sathyala Farm** (15.8281° N, 78.0373° E, 2.5 acres).
- **Dual Layer Visualization**: One-click toggling between **TrueColor Satellite Base** and **NDVI (Normalized Difference Vegetation Index)** canopy health overlays.
- **Live IoT Sensor Node (`AGRI-ESP32-001`)**:
  - Real-time telemetry monitoring: Node status (Online), battery health (86%), soil moisture (34%), canopy temperature (31.4°C), and ambient humidity (68%).
  - **Simulated Sensor Sync**: Interactive "Sync Now" trigger that fetches live sensor pings and updates telemetry metrics.
- **In-Browser Farm Details Editor**: Full profile editing modal with immediate `localStorage` state persistence.

### 3. 🔬 AI Crop Disease Diagnosis (Computer Vision)
- **Multi-Format Upload**: Drag-and-drop file upload, file browser, or instant sample image loader.
- **Sample Leaf Inspection**: Pre-loaded authentic groundnut leaf exhibiting early-stage *Cercospora* (Tikka) leaf spot.
- **Neural Scanning Animation**: Real-time bounding box inspection overlay simulating YOLOv8 inference.
- **Detailed Agronomic Diagnostics**:
  - **Pathology**: Early Leaf Spot (*Cercospora arachidicola*).
  - **Confidence**: 87% model certainty.
  - **Severity & Localization**: Early stage, lower canopy distribution.
  - **Organic Biological Remedies**: 5% Neem Seed Kernel Extract (NSKE), *Trichoderma viride* foliar spray, diluted buttermilk solution.
  - **Preventive Cultural Practices**: Deleafing infected lower foliage, drip irrigation timing to minimize canopy wetness duration.
  - **KVK Escalation**: Direct protocol for reporting outbreaks to Mandal Agricultural Officers.
  - **Scan History Log**: Historical record of previous diagnostic evaluations.

### 4. 🌿 Regenerative Farming Planner
- **Dynamic Regenerative Score Gauge**: Visual SVG arc tracking the farm's ecological score from baseline **62/100** toward an **80/100+** target.
- **Targeted Groundnut Interventions**:
  - **Biomass Mulching**: Groundnut crop residue retention to reduce soil evaporative loss by 40%.
  - **Companion Intercropping**: 6:1 ratio of Groundnut to Pigeon Pea (*Cajanus cajan*) for biological nitrogen fixation.
  - **Crop Rotation**: Sorghum / Pearl Millet break-crop cycles to disrupt nematode and fungal pathogens.
  - **Soil Inoculation**: Vermicompost + *Rhizobium* seed treatment.
  - **Biological Pest Management**: Yellow sticky traps, bird perches, and border trap crops (Castor/Sunflower).
- **Interactive Action Buttons**: Farmers can dynamically toggle practices into their active farm plan, instantly recalculating the composite regenerative score.

### 5. 🤖 "Ask AgriAI" Conversational Assistant
- **Context-Aware Agro-Chat**: Interactive chat interface pre-seeded with Kurnool weather, soil, and crop telemetry.
- **Instant Quick Questions**: One-click queries for irrigation schedules, organic pesticide recipes, and fertilizer timing.
- **Safety Disclaimers**: Strict guardrails advising laboratory verification for critical synthetic chemical inputs.

### 6. 🌐 BRICS Agricultural Data Interoperability Network
- **Interactive SVG Topology Graph**: Visual mesh connecting nodes in **India (ICAR / AgriBridge)**, **Brazil (EMBRAPA)**, **Russia (VASHNIL)**, **China (CAAS)**, and **South Africa (ARC)**.
- **Animated Data Packets**: Live visual pulses illustrating bilateral data flows across the network.
- **National Adapter Cards**: Detailed profiles for all 5 partner organizations, their data infrastructure, and active research programs.
- **Live CADS Transmission Simulator**: Simulates exporting standardized, anonymized JSON payloads conforming to the **Common Agricultural Data Schema (CADS)** with complete farmer PII stripping.

### 7. 🗣️ Full Multilingual Support (i18n)
- Native language support for:
  - 🇬🇧 **English (`en`)**
  - 🇮🇳 **Telugu (`te` — తెలుగు)**: Tailored for Andhra Pradesh & Telangana groundnut farmers.
  - 🇮🇳 **Hindi (`hi` — हिंदी)**: Accessible for smallholders across northern and central agricultural belts.
- Instant, reactive language switching without page reloads.

### 8. 📶 Low-Bandwidth & Rural Device Optimization
- **Low-Bandwidth Mode Toggle**: Strips high-frequency animations, lowers canvas overhead, and minimizes payload sizes for 2G/EDGE networks.
- **Mobile-First Bottom Navigation**: Optimized for one-thumb navigation on sub-$100 Android smartphones.
- **Local Caching**: Advisories and farm records persist in `localStorage` for offline access during network blackouts.

### 9. 🧭 Built-in Interactive Guided Tour
- **10-Step Onboarding Walkthrough**: Step-by-step interactive demo walking judges, developers, and farmers through the dashboard, telemetry, disease scanning, regenerative scoring, and BRICS cooperation tools.

---

## 📂 Repository Structure

```text
AgriBridge/
├── index.html                                 # Single-page application shell & semantic HTML5
├── dev_server.py                              # Zero-dependency Python development server
├── .env.example                               # Environment credentials template
├── README.md                                  # Complete unified project documentation
├── ARCHITECTURE.md                            # Comprehensive technical architecture & CADS spec
│
├── src/                                       # Frontend Modular Client (Vanilla ES6+)
│   ├── app.js                                 # Main application controller, routing, and state
│   ├── assets/
│   │   ├── logo.svg                           # Custom AgriBridge BRICS cooperation emblem
│   │   └── sample_leaf.jpg                    # High-res groundnut leaf showing Tikka symptoms
│   ├── styles/
│   │   ├── variables.css                      # Color palette, spacing, elevations, typography tokens
│   │   ├── base.css                           # CSS resets, accessibility focus states, base elements
│   │   ├── layout.css                         # Grid shells, responsive sidebars, mobile navigation
│   │   └── components.css                     # Cards, badges, modals, charts, buttons, animations
│   ├── i18n/
│   │   ├── index.js                           # Reactive locale store and translation helper
│   │   ├── en.js                              # English dictionary
│   │   ├── te.js                              # Complete Telugu (తెలుగు) dictionary
│   │   └── hi.js                              # Complete Hindi (हिंदी) dictionary
│   ├── data/
│   │   ├── farm_boundary.geojson              # GeoJSON polygon for Kurnool pilot parcel
│   │   ├── mockFarm.js                        # Farmer profile, soil type, and IoT sensor specs
│   │   ├── mockWeather.js                     # 7-day forecast, 14-day history, and climate alerts
│   │   ├── mockAdvisories.js                  # Categorized agronomic recommendations
│   │   ├── mockDiagnosis.js                   # Disease pathology database & sample images
│   │   ├── mockRegenerative.js                # Sustainable practices and scoring matrices
│   │   └── mockBrics.js                       # BRICS 5-nation adapters and CADS specifications
│   ├── services/
│   │   ├── farmService.js                     # Farm profile CRUD with localStorage persistence
│   │   ├── weatherService.js                  # Open-Meteo & IMD meteorological service
│   │   ├── sensorService.js                   # ESP32 IoT telemetry and sync simulator
│   │   ├── satelliteService.js                # Remote sensing NDVI vegetation indices
│   │   ├── advisoryService.js                 # Rule evaluation engine & AgriAI chat query
│   │   ├── diagnosisService.js                # Computer vision scanning & pathology engine
│   │   └── bricsService.js                    # CADS cross-border data exchange simulator
│   ├── components/
│   │   ├── Header.js                          # Global header with location, language, and low-BW switch
│   │   ├── Sidebar.js                         # Desktop navigation sidebar
│   │   ├── MobileNav.js                       # Mobile bottom app navigation bar
│   │   ├── FarmMap.js                         # Interactive SVG boundary visualizer & layer toggles
│   │   ├── CropHealthChart.js                 # Multi-series SVG telemetry line chart
│   │   ├── WeatherCard.js                     # Forecast cards with rainfall & irrigation advice
│   │   ├── AdvisoryCard.js                    # Categorized advisory cards with WhatsApp share
│   │   ├── ChatBot.js                         # "Ask AgriAI" interactive assistant
│   │   ├── DiagnosisView.js                   # Photo dropzone, scanning overlay, and remedies
│   │   ├── RegenerativeView.js                # Practice checklist and dynamic score gauge
│   │   ├── NetworkGraph.js                    # Animated BRICS topology graph & CADS exchange
│   │   ├── GuidedTour.js                      # 10-step guided onboarding modal
│   │   └── Toast.js                           # Accessible notification toast system
│   └── pages/
│       ├── OverviewPage.js                    # Main farm summary, health charts, and advisories
│       ├── MyFarmPage.js                      # Farm boundary map, IoT sensor node, and editor
│       ├── AdvisoryPage.js                    # Advisory repository and AgriAI chat tab
│       ├── WeatherPage.js                     # 10-day climate risk, weather forecast, and rainfall
│       └── SettingsPage.js                    # Language, low-bandwidth, and offline cache settings
│
└── agrin-project/                             # AgriN Intelligent Backend & Knowledge Base
    ├── backend/
    │   ├── app.py                             # Flask API server entrypoint & route registration
    │   ├── config.py                          # Application configuration & environment loader
    │   ├── requirements.txt                   # Python backend dependencies
    │   ├── .env.example                       # Backend environment template
    │   ├── routes/
    │   │   ├── advisory.py                    # POST /advisory endpoint (automated & manual)
    │   │   ├── diagnose.py                    # POST /diagnose & POST /api/diagnose (YOLOv8 vision)
    │   │   └── soil_data.py                   # GET /api/soil-data & GET /api/weather-data
    │   ├── engines/
    │   │   ├── advisory_engine.py             # Static rules engine & CADS payload generator
    │   │   ├── disease_diagnosis.py           # YOLOv8 crop disease detector & remedies
    │   │   └── llm_advisory.py                # Anthropic Claude 3.5 vernacular localizer
    │   ├── data_sources/
    │   │   ├── satellite.py                   # Sentinel Hub / Bhuvan NDVI remote sensing
    │   │   ├── weather.py                     # Open-Meteo REST API weather integration
    │   │   └── soil.py                        # ISRIC SoilGrids 250m REST API integration
    │   ├── schema/
    │   │   ├── advisory_schema.json           # BRICS Common Agricultural Data Schema (CADS)
    │   │   └── farm_boundary.geojson          # Pilot farm coordinates & geometry
    │   ├── models/
    │   │   └── yolov8_crop_disease.pt         # AgriGuard YOLOv8 model weights
    │   ├── mqtt/
    │   │   └── sensor_listener.py             # ESP32 MQTT telemetry subscriber
    │   └── tests/
    │       ├── test_advisory.py               # Advisory engine unit tests
    │       ├── test_disease_diagnosis.py      # Computer vision pipeline tests
    │       └── test_llm_advisory.py           # Claude localizer verification tests
    ├── knowledge_base/
    │   └── agronomy_notes/
    │       └── principles.md                  # Core regenerative principles & regional matrices
    └── docs/
        └── PROJECT_BRIEF.md                   # Hackathon Track 4 problem statement & roadmap
```

---

## ⚡ Quickstart Guide

### Option 1: Running the Frontend (Zero Dependencies)

AgriBridge is built with native ES6+ JavaScript modules and standard CSS—**no npm, Webpack, or Node.js required**.

```bash
# 1. Clone the repository
git clone https://github.com/mahammedsathyala/AgriBridge.git
cd AgriBridge

# 2. Start the built-in Python server
python dev_server.py
```

Open your browser to: **`http://localhost:3000`**

---

### Option 2: Running the Full-Stack AgriN Backend

To enable live automated satellite ingestion, YOLOv8 disease inference, and Claude LLM vernacular localization:

```bash
# 1. Navigate to the backend directory
cd agrin-project/backend

# 2. Create and activate a Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install required dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY, SENTINEL_API_KEY, etc. (optional for mock fallback)

# 5. Start the Flask API server
python app.py
```

The AgriN backend runs at **`http://localhost:5000`**.

---

## 📡 AgriN Backend API Reference

### 1. Automated Advisory by GPS Coordinates (`POST /advisory`)
Pulls real-time meteorological conditions from Open-Meteo, soil profile from ISRIC SoilGrids 250m, and canopy NDVI from Sentinel-2.

```bash
curl -X POST http://localhost:5000/advisory \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 15.8281,
    "longitude": 78.0373,
    "location": "Kurnool, Andhra Pradesh",
    "crop": "Groundnut"
  }'
```

<details>
<summary><b>View Sample JSON Response</b></summary>

```json
{
  "status": "success",
  "version": "1.0.0-mvp2",
  "timestamp": "2026-09-22T06:30:00Z",
  "telemetry": {
    "weather": {
      "temperature_c": 31.4,
      "humidity_pct": 68,
      "precipitation_forecast_3d_mm": 18.2
    },
    "soil": {
      "texture": "Red Loam",
      "organic_carbon_pct": 0.48,
      "ph": 6.8
    },
    "vegetation": {
      "ndvi": 0.62,
      "canopy_status": "Healthy / Flowering"
    }
  },
  "recommendations": [
    {
      "category": "Irrigation Management",
      "priority": "HIGH",
      "action": "Defer drip irrigation by 24-36 hours ahead of incoming convective rainfall",
      "rationale": "Forecast shows 18mm rainfall; deferring irrigation avoids waterlogging and prevents root asphyxiation.",
      "regenerative_benefit": "Conserves groundwater reserves and reduces nitrogen leaching."
    },
    {
      "category": "Pest & Disease Prevention",
      "priority": "MEDIUM",
      "action": "Foliar spray of 5% Neem Seed Kernel Extract (NSKE)",
      "rationale": "Moderate canopy humidity (68%) during flowering creates conditions for Cercospora spore germination.",
      "regenerative_benefit": "Safe for pollinators and maintains predatory insect populations."
    }
  ]
}
```
</details>

---

### 2. Crop Disease Diagnosis (`POST /diagnose` or `POST /api/diagnose`)
Analyzes a leaf photograph (multipart/form-data or Base64 JSON) using the YOLOv8 vision engine and pairs detected pathologies with regenerative biological remedies.

```bash
# Using multipart file upload:
curl -X POST http://localhost:5000/diagnose \
  -F "image=@src/assets/sample_leaf.jpg" \
  -F "crop_name=Groundnut"
```

Or using JSON Base64 payload:
```bash
curl -X POST http://localhost:5000/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "<base64_encoded_jpeg>",
    "crop_name": "Groundnut"
  }'
```

**Supported Pathologies & Treatments:**
- **Tikka Leaf Spot (*Cercospora arachidicola*)**: 5% Neem Seed Kernel Extract (NSKE) + *Trichoderma viride* foliar spray.
- **Leaf Rust (*Puccinia arachidis*)**: Elemental sulfur dusting (20-25 kg/ha) + fermented bio-dung wash.
- **Bacterial Blight (*Xanthomonas*)**: Fresh cow dung filtrate (20% natural phage suspension) + copper barrier.
- **Powdery Mildew**: Dilute cow milk spray (1:9 ratio for photo-activated lactoferrin bio-inhibition).
- **Healthy Canopy**: Prophylactic vermiwash (10%) and soil mulch maintenance.

---

### 3. Multilingual Vernacular Localizer (`POST /localize`)
Leverages Anthropic Claude 3.5 to translate complex agronomic advisories into respectful, conversational, audio-ready vernacular scripts in **Telugu (`te`)**, **Hindi (`hi`)**, **English (`en`)**, **Portuguese (`pt`)**, **Russian (`ru`)**, or **Mandarin (`zh`)**.

```bash
curl -X POST http://localhost:5000/localize \
  -H "Content-Type: application/json" \
  -d '{
    "language": "te",
    "advisory_data": {
      "recommendations": [
        {
          "action": "వర్ష సూచన ఉన్నందున నేడు డ్రిప్ నీటిపారుదల నిలిపివేయండి.",
          "practice": "వేప నూనె 5% పిచికారీ చేయండి."
        }
      ]
    },
    "farmer_profile": {
      "farmer_name": "సత్యాల గారు",
      "crop": "వేరుశనగ",
      "acres": 2.5
    }
  }'
```

---

## 🌾 Regenerative Agriculture Principles

AgriBridge embeds five fundamental ecological principles into every advisory and score calculation:

1. **🌱 Continuous Living Roots**: Maintaining live root systems across Kharif, Rabi, and summer cycles builds liquid carbon pathways, fuels rhizosphere biology, and stabilizes soil aggregates.
2. **🛡️ Soil Armor (Mulching & Ground Cover)**: Keeping topsoil continuously shaded with crop residue or companion legumes prevents thermal sterilization from direct sunlight and cushions heavy rainfall impacts.
3. **🐝 Biological Diversity**: Diverse plant architectures (Groundnut + Pigeon Pea 6:1 intercrop) break monoculture pest and pathogen cycles while providing varied food sources for pollinators.
4. **🚜 Minimal Soil Disturbance**: Transitioning from deep inversion plowing to zero or shallow conservation tillage preserves mycorrhizal fungal networks (*Glomalin*) and locks soil organic carbon (SOC).
5. **🐄 Organic Integration & Soil Biology**: Application of farmyard manure, vermicompost, *Rhizobium*, and biochar accelerates humus synthesis and restores natural soil fertility.

---

## 🔒 Security, Privacy & Responsible AI

- **🛡️ Zero Personal Farmer PII**: No farmer names, national ID numbers, or financial identifiers are ever transmitted across external network boundaries.
- **📍 GPS Coordinate Fuzzing**: Farm coordinates are rounded to approximate 10 km² regional bounding boxes before cross-border CADS exchange.
- **⚠️ Human-in-the-Loop Safeguards**: AI advisories are explicitly labeled as **decision support tools**. Warnings are displayed advising consultation with local Krishi Vigyan Kendra (KVK) agronomy scientists before purchasing or applying critical treatments.

---

## 🧪 Testing

Automated unit and integration test suites are included for all backend engines:

```bash
cd agrin-project/backend
pytest tests/ -v
```

Test coverage includes:
- `test_advisory.py`: Static rules engine, parameter parsing, and recommendation ranking.
- `test_disease_diagnosis.py`: YOLOv8 image processing pipeline and pathology resolution.
- `test_llm_advisory.py`: Claude prompt formation, language fallback, and payload sanitization.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository (`https://github.com/mahammedsathyala/AgriBridge`).
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m "feat: add NewFeature"`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📜 License & Acknowledgments

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

### Acknowledgments & Data Sources
- **BRICS AgriN Initiative**: For inspiring the multilateral digital public good framework.
- **ICAR & KVK Kurnool**: Agronomic baseline guidelines for semi-arid Kadiri-6 groundnut management.
- **ISRIC SoilGrids**: Global high-resolution digital soil mapping data (250m REST API).
- **Open-Meteo**: Free weather forecast and historical reanalysis APIs.
- **Copernicus Sentinel-2 & ISRO Bhuvan**: Open satellite remote sensing data for vegetation indices.
