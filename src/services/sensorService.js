import { defaultFarmData } from '../data/mockFarm.js';

export const sensorService = {
  async getTelemetry() {
    return { ...defaultFarmData.sensorNode };
  },

  async syncTelemetry() {
    // Simulate real hardware network ping delay
    await new Promise(res => setTimeout(res, 900));
    const randomVariation = (Math.random() * 0.8 - 0.4).toFixed(1);
    return {
      id: "AGRI-ESP32-001",
      status: "online",
      batteryPercent: 86,
      lastSync: "Just now",
      soilMoisture: 34,
      soilTemp: (29.4 + parseFloat(randomVariation)).toFixed(1),
      ambientTemp: 32.1,
      humidity: 68,
      signalStrength: "-65 dBm"
    };
  }
};
