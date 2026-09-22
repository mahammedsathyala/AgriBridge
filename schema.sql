-- =====================================================================
-- AgriBridge & AgriN Database Schema (schema.sql)
-- Target RDBMS: SQLite 3 / PostgreSQL 14+ / MySQL 8+
-- Pilot Site: Sathyala Farm, Kurnool, Andhra Pradesh (Kadiri-6 Groundnut)
-- =====================================================================

-- 1. FARM PROFILES TABLE
-- Stores farm details, coordinates, crop type, soil type, and irrigation system
CREATE TABLE IF NOT EXISTS farm_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_name VARCHAR(120) NOT NULL DEFAULT 'Sathyala Farmer',
    farm_name VARCHAR(120) NOT NULL DEFAULT 'Sathyala Farm',
    location VARCHAR(255) NOT NULL DEFAULT 'Kurnool, Andhra Pradesh',
    lat REAL NOT NULL DEFAULT 15.8281,
    lng REAL NOT NULL DEFAULT 78.0373,
    area_acres REAL NOT NULL DEFAULT 2.5,
    crop VARCHAR(80) NOT NULL DEFAULT 'Groundnut',
    crop_variety VARCHAR(80) DEFAULT 'K6 (Kadiri-6)',
    sowing_date VARCHAR(30) DEFAULT '2026-08-07',
    soil_type VARCHAR(80) NOT NULL DEFAULT 'Red loamy soil',
    irrigation_type VARCHAR(80) NOT NULL DEFAULT 'Borewell drip',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SENSOR TELEMETRY TABLE (ESP32 IoT Probes)
-- Ingests real-time soil moisture, depth, soil/ambient/canopy temp, humidity, battery
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id VARCHAR(80) NOT NULL DEFAULT 'AGRI-ESP32-001',
    farm_id VARCHAR(80) NOT NULL DEFAULT 'sathyala-farm-001',
    soil_moisture_pct REAL NOT NULL DEFAULT 34.0,
    soil_depth_cm REAL NOT NULL DEFAULT 15.0,
    soil_temperature_c REAL NOT NULL DEFAULT 29.4,
    canopy_temperature_c REAL DEFAULT 30.8,
    ambient_temperature_c REAL NOT NULL DEFAULT 32.1,
    humidity_pct REAL NOT NULL DEFAULT 68.0,
    battery_pct REAL NOT NULL DEFAULT 88.0,
    signal_strength_dbm VARCHAR(30) NOT NULL DEFAULT '-65 dBm',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast sensor history and latest reading lookups
CREATE INDEX IF NOT EXISTS idx_telemetry_farm_rec ON sensor_telemetry (farm_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_device ON sensor_telemetry (device_id);

-- 3. DIAGNOSIS RECORDS TABLE (AI Leaf Disease Detection)
-- Logs computer vision crop disease detections, confidence scores, and images
CREATE TABLE IF NOT EXISTS diagnosis_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER REFERENCES farm_profiles(id) ON DELETE CASCADE,
    crop VARCHAR(80) NOT NULL DEFAULT 'Groundnut',
    disease VARCHAR(120) NOT NULL,
    confidence REAL NOT NULL DEFAULT 0.0,
    image_ref VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_farm ON diagnosis_records (farm_id, created_at DESC);

-- 4. ADVISORY RECORDS TABLE
-- Agronomic recommendations, source (rule-based / LLM), and farmer completion state
CREATE TABLE IF NOT EXISTS advisory_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER REFERENCES farm_profiles(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'rule_based',
    completed BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advisories_farm ON advisory_records (farm_id, created_at DESC);

-- 5. DATA EXCHANGE LOGS TABLE (BRICS CADS Cooperation)
-- Audit trail for decentralized data exchanges with BRICS agriculture nodes
CREATE TABLE IF NOT EXISTS data_exchange_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_node VARCHAR(60) NOT NULL,
    target_node VARCHAR(60) NOT NULL,
    indicator VARCHAR(100) NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_nodes ON data_exchange_logs (source_node, target_node, created_at DESC);

-- =====================================================================
-- SEED DATA (Default Pilot Farm & IoT Sensor Telemetry)
-- =====================================================================

INSERT INTO farm_profiles (
    farmer_name, farm_name, location, lat, lng, area_acres,
    crop, crop_variety, sowing_date, soil_type, irrigation_type
) VALUES (
    'Sathyala Farmer',
    'Sathyala Farm',
    'Kurnool, Andhra Pradesh',
    15.8281,
    78.0373,
    2.5,
    'Groundnut',
    'K6 (Kadiri-6)',
    '2026-08-07',
    'Red loamy soil',
    'Borewell drip'
);

INSERT INTO sensor_telemetry (
    device_id, farm_id, soil_moisture_pct, soil_depth_cm,
    soil_temperature_c, canopy_temperature_c, ambient_temperature_c,
    humidity_pct, battery_pct, signal_strength_dbm
) VALUES (
    'AGRI-ESP32-001',
    'sathyala-farm-001',
    34.0,
    15.0,
    29.4,
    30.8,
    32.1,
    68.0,
    88.0,
    '-65 dBm'
);
