import { defaultFarmData } from '../data/mockFarm.js';
import { farmService } from './farmService.js';

const API_BASE = 'http://localhost:5000';

export const sensorService = {
  async getCoordinates() {
    try {
      const farm = await farmService.getFarmProfile();
      if (farm && farm.coordinates && farm.coordinates.lat && farm.coordinates.lng) {
        return farm.coordinates;
      }
    } catch (e) {
      console.warn("Could not retrieve farm coordinates for sensorService:", e);
    }
    return { lat: 14.7384, lng: 78.9928 };
  },

  async getTelemetry() {
    try {
      const farm = await farmService.getFarmProfile();
      if (farm && farm.sensorNode) {
        return { ...farm.sensorNode };
      }
    } catch (e) {}
    return { ...defaultFarmData.sensorNode };
  },

  async syncTelemetry(coords = null) {
    // Pure software emulation of IoT sensor probe telemetry (no physical hardware required)
    await new Promise(res => setTimeout(res, 600));
    const { lat, lng } = coords || await this.getCoordinates();

    let soilMoisture = 34;
    let soilTemp = 29.4;

    try {
      const res = await fetch(`${API_BASE}/api/soil-data?lat=${lat}&lon=${lng}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.derived_soil_texture) {
          soilMoisture = data.derived_soil_texture.includes('clay') ? 38 : 31;
        }
      }
    } catch (err) {
      // Software fallback
    }

    const randomVariation = (Math.random() * 0.8 - 0.4).toFixed(1);
    return {
      id: "AGRI-ESP32-001 (Virtual Node)",
      status: "online",
      batteryPercent: 88,
      lastSync: "Just now",
      soilMoisture: soilMoisture + Math.round(parseFloat(randomVariation)),
      soilTemp: (soilTemp + parseFloat(randomVariation)).toFixed(1),
      ambientTemp: 32.1,
      humidity: 68,
      signalStrength: "-65 dBm",
      coordinates: { lat, lng }
    };
  }
};
