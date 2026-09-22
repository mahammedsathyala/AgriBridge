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
  <img src="https://img.shields.io/badge/Model-MobileNetV2%20Deep%20Learning-386641?style=for-the-badge" alt="Deep Learning">
  <img src="https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A4%80-40916c?style=for-the-badge" alt="Multilingual">
  <img src="https://img.shields.io/badge/Tests-68%2F68%20Passing-52b788?style=for-the-badge" alt="Tests Passing">
  <img src="https://img.shields.io/badge/License-MIT-74c69d?style=for-the-badge" alt="License">
</p>

---

## 📌 Executive Summary

**AgriBridge** is a digital public good and agricultural intelligence platform engineered for smallholder and marginal farmers across emerging economies. Anchored in the **BRICS Cooperation Theme** (inspired by the BRICS AgriN initiative), AgriBridge combines **hyperlocal on-farm decision support** with **cross-border agricultural data interoperability** across Brazil, Russia, India, China, and South Africa.

Initially piloted for smallholder groundnut farming in **Kurnool, Andhra Pradesh, India**, AgriBridge tackles critical agricultural vulnerabilities:
- 🌦️ **Erratic weather patterns & dry spells** driven by climate volatility.
- 📉 **Soil degradation & microbial depletion** from intensive synthetic monoculture.
- 🔍 **Delayed crop disease detection** causing devastating yield losses (up to 40-70% in Groundnut).
- 🗣️ **Language and digital literacy barriers** that exclude rural farmers from modern digital tools.
- 🌐 **Siloed agricultural research** between emerging economies facing identical climate challenges.

AgriBridge delivers a zero-build-step, mobile-first Web application connected to the **AgriN Python Flask intelligent backend**—integrating satellite remote sensing, SoilGrids 250m soil chemistry, live IoT sensor telemetry, **trained MobileNetV2 deep learning Groundnut disease diagnosis**, **interactive agronomic predictive trend charts**, **dedicated multi-crop "Ask Me" AI advisory**, and **vernacular generative AI (Anthropic Claude 3.5 Sonnet)**.

---

## 🏛️ System Architecture

AgriBridge operates on a dual-tier modular architecture designed for offline resilience, high accessibility, and decentralized cross-border interoperability:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             EDGE / FARMER TIER (Web SPA)                         │
│  - Vanilla ES6+ Browser Native (Zero Build Step)    - Responsive Layout & PWA    │
│  - Trilingual i18n (English, Telugu తెలుగు, Hindi हिंदी)  - Low-Bandwidth Mode (2G/3G) │
│  - "Ask Me" Multi-Crop AI Section (Voice & Audio)  - Interactive SVG Chart Box   │
│  - Deep Learning Model Badge & Confidence Warnings - Dynamic Regenerative Gauge │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST / JSON (or Mock Fallback)
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                           AGRIN INTELLIGENCE BACKEND                              │
│                               (Python / Flask API)                               │
├───────────────────────┬──────────────────────────┬───────────────────────────────┤
│    ADVISORY ENGINE    │  DEEP LEARNING CV ENGINE │     VERNACULAR LLM ENGINE     │
│  - Static Rules & CADS│  - MobileNetV2 (5 Class) │  - Anthropic Claude 3.5       │
│  - Dynamic Agro Logic │  - Safety Threshold (<60%)│ - Structured ML Context Pass  │
│  - Regenerative Score │  - Organic Treatment DB  │  - Vernacular Voice/Text      │
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

## 🔬 Deep Learning Groundnut Disease Classification

AgriBridge includes a **trained Deep Convolutional Neural Network** model utilizing **MobileNetV2 Transfer Learning** trained on authentic groundnut leaf images (`datasets/groundnut/Raw_Data/`).

### 1. Dataset Characteristics & Stratified Split
- **Total Validated Images:** 3,058 high-resolution 1200×800 JPEG images.
- **Corrupt / Duplicate Images:** 0 corrupt, 0 SHA-256 hash collisions.
- **Split Ratio:** Reproducible 70% train / 15% validation / 15% untouched test set (Random Seed 42).

| Class Name | Pathology / Condition | Train (70%) | Validation (15%) | Test (15%) | Total |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`healthy leaf`** | Healthy Groundnut Foliage | 650 | 140 | 139 | **929** |
| **`early_leaf_spot`** | Tikka Early Leaf Spot (*Cercospora arachidicola*) | 619 | 133 | 133 | **885** |
| **`late leaf spot`** | Tikka Late Leaf Spot (*Phaeoisariopsis personata*) | 482 | 103 | 104 | **689** |
| **`nutrition deficiency`**| Nutritional Chlorosis (Fe / Zn / N Deficiency) | 230 | 50 | 49 | **329** |
| **`rust`** | Groundnut Leaf Rust (*Puccinia arachidis*) | 159 | 33 | 34 | **226** |
| **`Total`** | | **2,140** | **459** | **459** | **3,058** |

### 2. Model Performance on Untouched Test Set
Evaluated strictly on the held-out 459 test images (no data leakage):
- **Overall Test Accuracy:** **72.77%**
- **Weighted Precision:** **0.7300**
- **Weighted Recall:** **0.7277**
- **Weighted F1-Score:** **0.7247**

### 3. Confidence Thresholding & Safety Guardrails
- **Safety Confidence Threshold:** Configurable (default `0.60` / 60%).
- **High Confidence ($\ge 60\%$):** Displays predicted pathology, localized name, and biological remedies.
- **Low Confidence ($< 60\%$):** Displays explicit uncertainty banner:
  > *"⚠️ The model is not sufficiently confident. Please upload a clearer leaf image or consult an agricultural expert."*
- **Agronomic Separation:** ML predictions are strictly separated from organic treatment protocols to ensure zero fabrication.

---

## 🤖 Claude 3.5 Sonnet / AgriAI Advisory Integration

AgriBridge uses a 2-stage pipeline: **Computer Vision $\rightarrow$ LLM Advisory**:

```
Groundnut Leaf Photo
       ↓
MobileNetV2 Deep Classifier
       ↓
Disease Class + Confidence (e.g., Tikka Early Leaf Spot, 91.2%)
       ↓
Farm Telemetry (Soil, Weather, Sowing Date, Stage)
       ↓
Anthropic Claude 3.5 Sonnet / AgriAI
       ↓
Farmer-Friendly Vernacular Guidance
```

### Claude Explains 5 Practical Dimensions:
1. **What the Diagnosis Means:** Crop impact, pathogen behavior, and photosynthetic loss.
2. **What to Check in the Field:** Diagnostic checkpoints (e.g. yellow halo inspection, lower canopy leaf drop).
3. **Immediate Actions:** Organic remedies (5% NSKE, *Trichoderma viride*, sour buttermilk spray).
4. **Prevention & Monitoring:** Crop rotation, row spacing, and companion intercropping.
5. **When to Consult an Expert:** Escalation criteria for Mandal Agricultural Officers / KVK scientists.

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

### 2. 📈 AI Agronomic Analytics & Predictive Trends Chart Box
- **Multi-Metric Telemetry Streams**:
  - 💧 **Soil Moisture & Irrigation Thresholds**: Displays optimal moisture bands (30-45%) and rainfall markers.
  - 🌿 **Crop Health & Stress Index**: Compares satellite NDVI vigor vs canopy thermal stress (°C).
  - 🐛 **Pest & Disease Risk Forecast**: Tracks *Cercospora* (Tikka), Leaf Miner, and Rust infection probabilities.
  - 🧪 **Nutrients & Gypsum Balance**: Tracks NPK depletion and gypsum demand windows (40-45 DAS).
- **Interactive Time Horizons**: 7 Days, 14 Days, and 30 Days trend forecasting.
- **Live Tooltip Hover Inspection**: Inspect individual telemetry points with detailed status readouts.
- **Actionable AI Insight Callouts**: Dynamic recommendations updated per selected metric.

### 3. 🌾 Dedicated "Ask Me" — Crop-Specific AI Advisor
- **Multi-Crop Regional Catalog**: Select from **Groundnut (వేరుశనగ)**, **Cotton (పత్తి)**, **Chilli (మిరప)**, **Rice/Paddy (వరి)**, **Tomato (టమాటా)**, **Maize (మొక్కజొన్న)**, **Red Gram (కంది)**, and **Mango (మామిడి)**.
- **Variety & Phenological Stage Calibration**: Tailors guidance according to crop variety (e.g., Kadiri-6, Teja, BPT-5204) and active growth stages (Sowing, Vegetative, Flowering, Pod/Boll formation).
- **1-Click Popular Questions**: Instant prompts covering disease remedies, fertilizer dosing, and irrigation timing.
- **Speech Recognition (Voice Mic 🎙️)**: Speak queries in Telugu, Hindi, or English.
- **Rich Agronomic Response Cards**:
  - 🔎 **AI Diagnostic Observations**: In-depth condition analysis.
  - 💡 **Specific Recommendations & Remedies**: Organic/chemical treatments.
  - 🧪 **Dosage Matrix Table**: Clear application quantities per liter / per acre.
  - ⚠️ **Key Risk & Weather Cautions**: Wash-off and resistance prevention.
  - 📅 **Immediate Action Checklist**: Step-by-step field tasks.
  - 🔊 **Voice Audio Player ("Listen / వినండి / सुनें")**: Speech synthesis readout.
  - 📤 **One-Click Share**: Export formatted advisories directly to WhatsApp or extension officers.

### 4. 🗺️ Interactive Farm Boundary & IoT Telemetry
- **Kurnool Farm Boundary**: Custom GeoJSON polygon rendering for **Sathyala Farm** (15.8281° N, 78.0373° E, 2.5 acres).
- **Dual Layer Visualization**: One-click toggling between **TrueColor Satellite Base** and **NDVI** canopy health overlays.
- **Live IoT Sensor Node (`AGRI-ESP32-001`)**: Real-time telemetry monitoring with simulated sync trigger.

### 5. 🔬 AI Crop Disease Diagnosis (Computer Vision)
- **Multi-Format Upload**: Drag-and-drop file upload, camera upload, or sample image loader.
- **Deep Learning Classification**: Powered by MobileNetV2 with low-confidence uncertainty guardrails.
- **Comprehensive Biological Remedies**: Organic recipes and non-chemical pest management.

### 6. 🌿 Regenerative Farming Planner
- **Dynamic Regenerative Score Gauge**: Visual SVG arc tracking the farm's ecological score from baseline **62/100** toward an **80/100+** target.
- **Targeted Practices**: Biomass mulching, companion intercropping (6:1), crop rotation, and bio-inoculation.

### 7. 🌐 BRICS Agricultural Data Interoperability Network
- **Interactive SVG Topology Graph**: Real-time mesh connecting India, Brazil, Russia, China, and South Africa.
- **Live CADS Transmission Simulator**: Exports standardized, anonymized JSON conforming to CADS v1.4 with zero farmer PII.

---

## 📂 Repository Structure

```text
AgriBridge/
├── index.html                                 # Single-page application shell & semantic HTML5
├── dev_server.py                              # Zero-dependency Python development server
├── run.py                                     # 1-Click All-in-One local launcher
├── start.bat                                  # Windows double-click quick launcher
├── schema.sql                                 # Standalone SQL schema for SQLite/PostgreSQL
├── .gitignore                                 # Git safety (protects datasets, .keras/.pt weights, .env)
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
│   ├── services/
│   │   ├── farmService.js                     # Farm profile CRUD with localStorage persistence
│   │   ├── weatherService.js                  # Open-Meteo & IMD meteorological service
│   │   ├── sensorService.js                   # ESP32 IoT telemetry and sync simulator
│   │   ├── satelliteService.js                # Remote sensing NDVI vegetation indices
│   │   ├── advisoryService.js                 # Rule evaluation engine & AgriAI chat query
│   │   ├── diagnosisService.js                # Computer vision scanning & pathology engine
│   │   └── bricsService.js                    # CADS cross-border data exchange simulator
│   └── components/
│       ├── Header.js                          # Global header with location, language, and low-BW switch
│       ├── Sidebar.js                         # Desktop navigational sidebar with active tab tracking
│       ├── MobileNav.js                       # Mobile bottom navigation bar
│       ├── AdvisoryChartBox.js                # Interactive telemetry trends (Moisture, Health, Pests, NPK)
│       ├── AskMeCropSection.js                # Dedicated Crop AI Q&A (Multi-Crop, Stage, Voice, Dosage)
│       ├── FarmMap.js                         # Interactive SVG boundary visualizer & layer toggles
│       ├── CropHealthChart.js                 # Multi-series SVG telemetry line chart
│       ├── WeatherCard.js                     # Forecast cards with rainfall & irrigation advice
│       ├── AdvisoryCard.js                    # Categorized advisory cards with WhatsApp share
│       ├── ChatBot.js                         # "Ask AgriAI" interactive assistant
│       ├── DiagnosisView.js                   # Photo dropzone, MobileNetV2 badge, remedies & warnings
│       ├── RegenerativeView.js                # Practice checklist and dynamic score gauge
│       ├── NetworkGraph.js                    # Animated BRICS topology graph & CADS exchange
│       └── Toast.js                           # Non-blocking reactive notifications
│
└── agrin-project/                             # AgriN Intelligent Backend & Knowledge Base
    ├── backend/
    │   ├── app.py                             # Flask API server entrypoint & route registration
    │   ├── config.py                          # Application configuration & environment loader
    │   ├── requirements.txt                   # Python backend dependencies
    │   ├── inspect_dataset.py                 # Dataset validation & inspection script
    │   ├── train_groundnut_model.py           # End-to-end MobileNetV2 training & test evaluation
    │   ├── model_weights/
    │   │   ├── groundnut_class_names.json     # 5-class metadata and input configuration
    │   │   └── groundnut_disease.keras        # Trained Keras model weights (local, git-ignored)
    │   ├── routes/
    │   │   ├── advisory.py                    # POST /advisory endpoint (automated & manual)
    │   │   ├── diagnose.py                    # POST /api/v1/diagnoses (Normalized ML schema)
    │   │   ├── sensor_data.py                 # POST /api/v1/sensors/telemetry
    │   │   └── soil_data.py                   # GET /api/v1/soil & GET /api/v1/weather
    │   ├── engines/
    │   │   ├── advisory_engine.py             # Static rules engine & CADS payload generator
    │   │   ├── disease_diagnosis.py           # Multi-engine CV loader (MobileNetV2 / YOLOv8 / Heuristic)
    │   │   └── llm_advisory.py                # Anthropic Claude 3.5 vernacular localizer
    │   ├── data_sources/
    │   │   ├── satellite.py                   # Sentinel Hub / Bhuvan NDVI remote sensing
    │   │   ├── weather.py                     # Open-Meteo REST API weather integration
    │   │   └── soil.py                        # ISRIC SoilGrids 250m REST API integration
    │   └── tests/
    │       ├── test_groundnut_model.py        # Real model inference, low-conf, and API tests
    │       ├── test_v1_api.py                 # Full REST API v1 test suite
    │       ├── test_advisory.py               # Advisory engine unit tests
    │       ├── test_diagnosis.py              # Vision pipeline tests
    │       ├── test_live_sources.py           # Live telemetry sources tests
    │       └── test_llm_advisory.py           # Claude localizer verification tests
    └── docs/
        ├── groundnut_dataset_inspection_report.md  # Phase 1 dataset validation report
        ├── groundnut_training_evaluation_report.md # Phase 2 & 3 model evaluation report
        ├── groundnut_evaluation_results.json       # Numeric test metrics & per-class F1
        └── groundnut_confusion_matrix.png          # Visualized confusion matrix heatmap
```

---

## ⚡ Quickstart Guide

### Option 1: 1-Click All-in-One Runner (Recommended)

From the project root directory:
```bash
python run.py
```
*(On Windows, you can simply double-click `start.bat`).*

This automatically starts both the Flask Backend (`http://127.0.0.1:5000`) and Frontend Dev Server (`http://localhost:3000`).

---

### Option 2: Running the Frontend (Zero Dependencies)

AgriBridge frontend is built with native ES6+ JavaScript modules and standard CSS—**no npm, Webpack, or Node.js required**.

```bash
# Start the built-in Python dev server
python dev_server.py
```
Open your browser to: **`http://localhost:3000`**

---

### Option 3: Running Backend Independently

```bash
cd agrin-project/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # On Windows
source venv/bin/activate    # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start Flask API server
python app.py
```
The AgriN backend runs at **`http://localhost:5000`**.

---

## 📡 AgriN Backend API Reference

### 1. Crop Disease Diagnosis (`POST /api/v1/diagnoses`)
Accepts multipart image upload or JSON Base64 string. Returns normalized diagnostic response with deep learning predictions and biological remedies:

```bash
curl -X POST http://localhost:5000/api/v1/diagnoses \
  -F "image=@src/assets/sample_leaf.jpg" \
  -F "crop_name=groundnut"
```

#### Normalized JSON Response:
```json
{
  "status": "success",
  "crop": "groundnut",
  "disease": "early_leaf_spot",
  "confidence": 0.9124,
  "diagnosis_source": "groundnut_trained_model",
  "model_status": "LIVE",
  "recommendation": "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) every 10-12 days during active infection.\nApply biocontrol agent Trichoderma viride or Pseudomonas fluorescens (10g / L water) to foliage and root zone.\nSpray fermented sour buttermilk (1:10 dilution with water) mixed with garlic extract as a natural bio-fungicide.\nCollect and compost fallen diseased leaves deeply to prevent spore re-infection during dew hours.",
  "warning": "",
  "data": {
    "scan_id": "SCAN-1",
    "crop": "groundnut",
    "disease": "early_leaf_spot",
    "disease_detected": "Tikka Early Leaf Spot (Cercospora arachidicola)",
    "confidence_score": 91.2,
    "diagnosis_source": "groundnut_trained_model",
    "model_status": "LIVE",
    "condition_en": "Tikka Early Leaf Spot (Cercospora arachidicola)",
    "condition_te": "తొలి ఆకు మచ్చ వ్యాధి - టిక్కా తెగులు (Cercospora arachidicola)",
    "condition_hi": "टिक्का अगेती पत्ती धब्बा रोग (Early Leaf Spot)"
  }
}
```

---

### 2. Automated Crop Advisory (`POST /api/v1/advisories`)
Combines IoT sensor telemetry, SoilGrids 250m soil chemistry, Open-Meteo weather, Sentinel-2 NDVI, and ML disease findings:

```bash
curl -X POST http://localhost:5000/api/v1/advisories \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 15.8281,
    "longitude": 78.0373,
    "location": "Kurnool, Andhra Pradesh",
    "crop": "Groundnut",
    "variety": "Kadiri-6",
    "crop_stage": "flowering"
  }'
```

---

### 3. Vernacular Localizer & Crop Q&A (`POST /api/v1/localizations`)
Synthesizes conversational, audio-ready vernacular briefings via Anthropic Claude 3.5 in **Telugu (`te`)**, **Hindi (`hi`)**, and **English (`en`)**:

```bash
curl -X POST http://localhost:5000/api/v1/localizations \
  -H "Content-Type: application/json" \
  -d '{
    "language": "te",
    "query": "పత్తిలో గులాబీ రంగు పురుగు నివారణ ఎలా?",
    "crop": "Cotton",
    "crop_stage": "flowering"
  }'
```

---

## 🧪 Testing & Verification

Automated test suites cover all backend engines, deep learning inference, REST API endpoints, and safety thresholds:

```bash
cd agrin-project/backend
python -m pytest tests/ -v
```

**Result: 68 / 68 tests passing (100% pass rate)**

| Test Module | Coverage | Status |
| :--- | :--- | :---: |
| [`test_groundnut_model.py`](agrin-project/backend/tests/test_groundnut_model.py) | Keras model inference on real images, 5 classes, low confidence safety warning, multipart & Base64 API | ✅ PASSED (6/6) |
| [`test_v1_api.py`](agrin-project/backend/tests/test_v1_api.py) | Full REST v1 API contracts, health, CORS, telemetry, error formats | ✅ PASSED (16/16) |
| [`test_audit_fixes.py`](agrin-project/backend/tests/test_audit_fixes.py) | Transparency audit, weights status reporting, regenerative scoring | ✅ PASSED (8/8) |
| [`test_advisory.py`](agrin-project/backend/tests/test_advisory.py) | Rules engine, parameter parsing, recommendation ranking | ✅ PASSED (9/9) |
| [`test_diagnosis.py`](agrin-project/backend/tests/test_diagnosis.py) | Computer vision pipeline tests | ✅ PASSED (8/8) |
| [`test_live_sources.py`](agrin-project/backend/tests/test_live_sources.py) | Live Open-Meteo, SoilGrids, and Sentinel NDVI ingestion | ✅ PASSED (10/10) |
| [`test_llm_advisory.py`](agrin-project/backend/tests/test_llm_advisory.py) | Claude prompt formation, language fallback, ML context pass | ✅ PASSED (11/11) |

---

## 🔒 Security, Privacy & Responsible AI

- **🛡️ Zero Farmer PII**: No farmer names, national ID numbers, or financial identifiers are ever transmitted across external network boundaries.
- **📍 GPS Coordinate Fuzzing**: Farm coordinates are rounded to approximate 10 km² regional bounding boxes before cross-border CADS exchange.
- **⚠️ Safety Confidence Thresholds**: Low-confidence ML predictions trigger explicit uncertainty warnings and prompt laboratory or extension officer consultation.
- **📦 Dataset & Weight Safety**: Raw image datasets (`datasets/`) and large binary weights (`*.keras`, `*.pt`, `*.h5`) are strictly `.gitignore`d to prevent accidental repository bloat or credential leakage.

---

## 📜 License & Acknowledgments

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

### Acknowledgments & Data Sources
- **BRICS AgriN Initiative**: For inspiring the multilateral digital public good framework.
- **ICAR & KVK Kurnool**: Agronomic baseline guidelines for semi-arid Kadiri-6 groundnut management.
- **ISRIC SoilGrids**: Global high-resolution digital soil mapping data (250m REST API).
- **Open-Meteo**: Free weather forecast and historical reanalysis APIs.
- **Copernicus Sentinel-2 & ISRO Bhuvan**: Open satellite remote sensing data for vegetation indices.
