import { defaultFarmData } from '../data/mockFarm.js';
import { farmService } from './farmService.js';
import { apiClient } from './apiClient.js';
import { USE_MOCK_FALLBACK } from '../config.js';

export const satelliteService = {
  async getIndicators(coords = null) {
    let lat = 15.8281;
    let lon = 78.0373;
    try {
      const farm = await farmService.getFarmProfile();
      if (farm?.coordinates?.lat && farm?.coordinates?.lng) {
        lat = farm.coordinates.lat;
        lon = farm.coordinates.lng;
      }
    } catch {}

    try {
      const data = await apiClient.get(`/api/v1/satellite?lat=${lat}&lon=${lon}`);
      const sat = data?.data || data;
      if (sat && sat.ndvi !== undefined) {
        return {
          provider: "Sentinel-2 L2A & Landsat-9",
          resolution: "10m Multispectral",
          ndvi: sat.ndvi,
          evi: sat.evi ?? 0.54,
          ndwi: sat.ndwi ?? 0.22,
          cloudCoverage: sat.cloud_cover_percent ? `${sat.cloud_cover_percent}%` : "8%",
          lastPassDate: sat.acquisition_date || "2026-09-17",
          dataSource: "Live Sentinel-2 Telemetry"
        };
      }
    } catch (err) {
      if (!USE_MOCK_FALLBACK) throw err;
    }

    return { ...defaultFarmData.satellite, dataSource: "Demo Fallback" };
  }
};
