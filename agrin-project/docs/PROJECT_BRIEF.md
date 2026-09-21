# AgriN: Project Brief

## Hackathon Context
- **Track**: Track 4: AgriN & Regenerative Agricultural Intelligence
- **Theme**: BRICS Cooperation & Open Digital Agricultural Infrastructure

## Problem Statement
Smallholder and marginal farmers in emerging economies face severe climate vulnerability and low yields due to:
- Lack of data-driven guidance on weather, soil organic carbon, and localized crop adaptation.
- Heavy reliance on synthetic fertilizers that degrade soil microbiology over time.
- Absence of interoperable digital public infrastructure that allows cross-border sharing of regenerative practices and pest/disease intelligence.

## Solution Vision
**AgriN** is an open, interoperable agricultural advisory network delivering real-time, localized agro-advisories powered by AI:
1. **Regenerative Crop Recommender**: Multi-source data synthesis (satellite NDVI + SoilGrids + Open-Meteo weather) producing site-specific regenerative practices.
2. **Vision Disease Diagnostic Tool**: Edge/cloud visual diagnosis using YOLOv8 to identify crop diseases and recommend organic remedies.
3. **Multilingual Localized Advisories**: LLM/RAG pipeline converting complex agro-ecological data into actionable, voice-ready vernacular messages.
4. **Interoperable Data Standard**: Standardized JSON schema facilitating cross-border data exchange across BRICS member agricultural institutes.

## Architectural Phasing (5 MVPs)
- **MVP 1 (Current)**: Static Rules Advisory Engine taking manual soil, weather, and seasonal inputs and returning structured JSON recommendations.
- **MVP 2**: Live data ingestion (Open-Meteo API, SoilGrids 250m REST API, Sentinel-2 / ISRO Bhuvan satellite NDVI).
- **MVP 3**: Computer vision crop disease diagnosis using YOLOv8.
- **MVP 4**: Anthropic Claude LLM layer translating technical data into plain-language farmer advisories.
- **MVP 5**: BRICS-standard open JSON schema and mobile-first farmer dashboard.
