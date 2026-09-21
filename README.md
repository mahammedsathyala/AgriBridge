# AgriBridge — BRICS AI Agriculture Network

> **Tagline:** “AI-powered climate-resilient farming for a connected world”  
> **Supporting:** “Local advice. Shared knowledge. Sustainable harvests.”  
> **Theme:** BRICS Theme: Cooperation (Inspired by the BRICS AgriN initiative)

AgriBridge is a production-quality, responsive web platform and digital public good tailored for small and marginal farmers across emerging economies. Focused initially on groundnut farming in Kurnool, Andhra Pradesh, India, AgriBridge bridges local on-farm decisions with cross-border agricultural data and AI-model cooperation across the BRICS nations (Brazil, Russia, India, China, and South Africa).

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - Welcome card with localized greeting and contextual weather guidance.
   - 4 Key metric cards: **Crop Health (78/100)**, **Soil Moisture (34%)**, **Rainfall Forecast (18 mm in 3 days)**, and **Disease Risk (Medium - Leaf Spot)**.
   - **Priority Advisory Card**: One-click action advising farmers to delay irrigation by 24 hours and inspect lower leaves due to incoming convective rainfall.
   - **Interactive 14-Day Health Chart**: Multi-series SVG line chart tracking Crop Health, Soil Moisture %, and Temperature Stress °C with 7, 14, and 30-day filters.
   - **5-Day Weather Forecast**: Featuring best irrigation day and rainfall alerts.
   - **Recent Activity Feed**: Tracking satellite updates, sensor pings, and farmer actions.

2. **My Farm Profile & Telemetry**:
   - Registered farm profile for **Sathyala Farm** (Kurnool, AP: 2.5 acres Groundnut Kadiri-6, Flowering stage, Red loamy soil, Borewell drip).
   - **Interactive Map Panel**: Dynamic SVG boundary visualizer with location marker, coordinates (15.8281° N, 78.0373° E), zoom controls, and TrueColor vs NDVI vegetation layer switcher.
   - **Edit Farm Details Modal**: Full editing form with immediate `localStorage` persistence.
   - **Connected IoT Sensor Node**: Real-time telemetry for `AGRI-ESP32-001` (online status, 86% battery, soil moisture, temperature, and canopy humidity) with interactive "Sync Now" simulator.

3. **Localized AI Agro-Advisories**:
   - Categorized advisories (Irrigation, Fertilizer, Pest & Disease, Regenerative Farming) complete with rationale, recommended actions, expected benefits, and data source citations.
   - One-click "Mark as Completed" and "Share with Extension Officer" (WhatsApp-ready formatting).
   - **Ask AgriAI Assistant**: Interactive conversational AI chat with sample questions, actionable explanations, and agricultural safety disclaimers.

4. **AI Crop Disease Diagnosis**:
   - Drag-and-drop / file browser for leaf photos.
   - **"Use sample leaf image"** button loading a realistic groundnut leaf photo with Cercospora leaf spot symptoms.
   - Realistic scanning overlay and neural model analysis.
   - Detailed diagnosis breakdown: Condition, 87% confidence, early-stage severity, lower canopy localization, symptom checklist, immediate biological actions (Neem extract/Trichoderma), preventive practices, and KVK expert consultation notice.
   - Historical scan log.

5. **Regenerative Farming**:
   - Tailored practices for groundnut: Biomass mulching, Crop rotation (Sorghum), Intercropping (Pigeon pea 6:1), Vermicompost enrichment, and Integrated Pest Management.
   - **Dynamic Regenerative Score Gauge**: Visual gauge tracking farm progress (Base 62/100 -> Target 80/100).
   - Dynamic "Add to farm plan" buttons that update the farm plan and re-compute the score.

6. **Weather & Climate Intelligence**:
   - Current meteorological observations in Kurnool.
   - 10-day dry-spell climate risk advisory with mitigation steps.
   - 7-day forecast cards and hydro-thermal rainfall/temperature chart.

7. **BRICS Agricultural Data Cooperation**:
   - Explainer on decentralized public goods and country adapters.
   - **Interactive SVG Network Topology Graph**: Connecting India, Brazil, Russia, China, and South Africa with animated data pulse packets.
   - National adapter profile cards for all 5 countries.
   - Interoperability Protocol status board (CADS schema, API gateway, model registry, translation layer, privacy controls).
   - **Live Cross-Border Data-Exchange Simulator**: Simulates transmitting standardized, anonymized JSON payloads (e.g., India to Brazil) with zero personal farmer PII.

8. **Full Bilingual English & Telugu (తెలుగు) Support**:
   - Complete native translations across all navigation, cards, diagnosis results, advisories, and weather alerts.
   - One-click language switcher in the global header and settings.

9. **Mobile & Low-Bandwidth Optimization**:
   - Low-bandwidth toggle that disables non-essential animations and reduces data overhead for 2G/3G networks.
   - Mobile-first bottom navigation bar for low-cost Android smartphones.
   - Offline advisory cache management.

10. **Guided Demo Tour**:
    - Built-in 10-step interactive demo flow accessible directly from the top banner.

---

## 🚀 Quick Start & Local Development

AgriBridge uses a modern ES6+ browser-native modular architecture requiring **zero package compilation or build steps**.

### 1. Run with Python (Standard Built-in)
```bash
python dev_server.py
```
Open your browser to: **`http://localhost:3000`**

---

## 📁 Repository Structure

```
AgriBridge/
├── index.html                 # Main single-page application shell
├── dev_server.py              # Lightweight Python server with MIME & CORS support
├── .env.example               # Environment credentials specification
├── README.md                  # Project overview & documentation
├── ARCHITECTURE.md            # Technical architecture & CADS specification
└── src/
    ├── assets/
    │   ├── logo.svg           # Custom AgriBridge BRICS cooperation logo
    │   └── sample_leaf.jpg    # Sample groundnut leaf image
    ├── styles/
    │   ├── variables.css      # Nature-inspired palette, tokens, radii
    │   ├── base.css           # Resets, typography, accessibility states
    │   ├── layout.css         # Shell, sidebar, header, mobile navigation
    │   └── components.css     # Cards, badges, modals, charts, dropzone
    ├── i18n/
    │   ├── en.js              # English dictionary
    │   ├── te.js              # Full Telugu (తెలుగు) dictionary
    │   └── index.js           # Reactive locale store
    ├── data/
    │   ├── mockFarm.js        # Sathyala Farm profile & sensor telemetry
    │   ├── mockWeather.js     # Forecast, climate risks, 14-day history
    │   ├── mockAdvisories.js  # Categorized agro-advisories
    │   ├── mockDiagnosis.js   # Leaf disease database & scan history
    │   ├── mockRegenerative.js# Regenerative practices & score metrics
    │   └── mockBrics.js       # BRICS 5-nation adapters & schema generator
    ├── services/
    │   ├── farmService.js     # Farm CRUD & localStorage persistence
    │   ├── weatherService.js  # Meteorological forecast service
    │   ├── sensorService.js   # IoT sensor telemetry & sync simulator
    │   ├── satelliteService.js# Remote sensing vegetation indices
    │   ├── advisoryService.js # AI advisory query & chat engine
    │   ├── diagnosisService.js# Computer vision leaf scan pipeline
    │   └── bricsService.js    # Interoperability exchange simulator
    ├── components/
    │   ├── Header.js          # Header with location, crop, language switch
    │   ├── Sidebar.js         # Desktop sidebar navigation
    │   ├── MobileNav.js       # Bottom navigation for Android viewports
    │   ├── FarmMap.js         # Interactive farm boundary visualizer
    │   ├── CropHealthChart.js # Interactive SVG health telemetry chart
    │   ├── WeatherCard.js     # Forecast cards with risk alerts
    │   ├── AdvisoryCard.js    # Advisory card with action buttons
    │   ├── ChatBot.js         # "Ask AgriAI" conversational assistant
    │   ├── DiagnosisView.js   # Leaf photo upload, scanner, and results
    │   ├── RegenerativeView.js# Practice cards & dynamic score gauge
    │   ├── NetworkGraph.js    # Interactive BRICS topology & exchange
    │   ├── GuidedTour.js      # 10-step guided demo tour modal
    │   └── Toast.js           # Accessible notification toasts
    └── app.js                 # Application router and state controller
```

---

## 🔌 API Replacement Guide (Connecting Real Backends)

AgriBridge was engineered with a strict separation between UI components and data providers in `src/services/`. To connect real production APIs:

1. **Weather (IMD / OpenWeather)**:
   In `src/services/weatherService.js`, replace `mockWeatherData` with a fetch request to `/api/weather/:farmId` using your `IMD_WEATHER_API_KEY`.

2. **IoT Soil Sensors (ESP32 via MQTT)**:
   In `src/services/sensorService.js`, replace `syncTelemetry()` with a WebSocket or REST API call connected to your MQTT broker (`/api/soil/:farmId/live`).

3. **Crop Leaf Disease Diagnosis (Computer Vision)**:
   In `src/services/diagnosisService.js`, replace the timeout simulator in `analyzeLeaf(imageDataUrl)` with a `POST /api/diagnosis` request with `multipart/form-data` to a PyTorch / TensorFlow Serving endpoint running a fine-tuned ResNet/EfficientNet model.

4. **BRICS Data Cooperation (CADS API Gateway)**:
   In `src/services/bricsService.js`, replace `simulateDataExchange()` with a mutual TLS `POST https://cads.brics-agrin.org/api/v1/exchange` endpoint complying with the Common Agricultural Data Schema.

---

## 📜 Compliance & Disclaimers

- **Decision Support Only**: All agronomic advice provided by AgriAI is designed as decision support. Farmers are advised to consult their local Krishi Vigyan Kendra (KVK) or Mandal Agricultural Officer for critical pesticide and fertilizer decisions.
- **Privacy First**: Farm coordinates are fuzzed and personal identifiers are removed before cross-border data cooperation.
