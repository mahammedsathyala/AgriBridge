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
      const ndvi = sat?.spectral_indices?.ndvi ?? sat?.ndvi;
      if (sat && ndvi !== undefined) {
        const isLive = sat.data_source_type === "LIVE_SATELLITE";
        return {
          provider: isLive ? "Sentinel-2 L2A (Copernicus)" : (sat.provider || "Calibrated Phenological Model (DOY-based)"),
          resolution: isLive ? "10m Multispectral" : "10m Equivalent (Simulated)",
          ndvi: Number(ndvi),
          evi: sat?.spectral_indices?.evi ?? sat?.evi ?? 0.54,
          ndwi: sat?.spectral_indices?.ndwi ?? sat?.ndwi ?? 0.22,
          cloudCoverage: sat.cloud_cover_percent !== undefined ? `${sat.cloud_cover_percent}%` : "0%",
          lastPassDate: sat.acquisition_date || sat.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
          dataSource: isLive ? "LIVE_SATELLITE" : (sat.data_source_type || "MODEL_SIMULATION"),
          sourceStatus: isLive ? "LIVE" : "MODEL_SIMULATION",
          rawIndicators: sat
        };
      }
    } catch (err) {
      if (!USE_MOCK_FALLBACK) throw err;
    }

    return { 
      ...defaultFarmData.satellite, 
      dataSource: "FALLBACK",
      sourceStatus: "FALLBACK" 
    };
  }
};
