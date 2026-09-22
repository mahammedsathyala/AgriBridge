import { defaultFarmData } from '../data/mockFarm.js';
import { apiClient } from './apiClient.js';
import { USE_MOCK_FALLBACK } from '../config.js';

const STORAGE_KEY = 'agribridge_farm_profile';

export const farmService = {
  /**
   * Returns current farm profile, checking backend first with localStorage / mock fallback
   */
  async getFarmProfile() {
    try {
      const data = await apiClient.get('/api/v1/farm');
      const f = data?.farm || data?.data?.farm;
      if (f) {
        const merged = {
          ...defaultFarmData,
          ...f,
          farmerName: f.farmerName || f.farmer_name || defaultFarmData.farmerName,
          farmName: f.farmName || f.farm_name || defaultFarmData.farmName,
          areaAcres: f.areaAcres || f.area_acres || defaultFarmData.areaAcres,
          cropVariety: f.cropVariety || f.crop_variety || defaultFarmData.cropVariety,
          sowingDate: f.sowingDate || f.sowing_date || defaultFarmData.sowingDate,
          soilType: f.soilType || f.soil_type || defaultFarmData.soilType,
          irrigationType: f.irrigationType || f.irrigation_type || defaultFarmData.irrigationType,
          coordinates: (f.coordinates && f.coordinates.lat)
            ? f.coordinates
            : ((f.lat && f.lng) ? { lat: f.lat, lng: f.lng } : defaultFarmData.coordinates),
          boundaryPolygon: defaultFarmData.boundaryPolygon,
          geoJson: defaultFarmData.geoJson,
          location: f.location || defaultFarmData.location
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    } catch (e) {
      if (!USE_MOCK_FALLBACK) {
        throw e;
      }
      // Fall through to localStorage or default demo data
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultFarmData,
          ...parsed,
          coordinates: parsed.coordinates || defaultFarmData.coordinates,
          boundaryPolygon: defaultFarmData.boundaryPolygon,
          geoJson: defaultFarmData.geoJson,
          location: parsed.location || defaultFarmData.location
        };
      }
    } catch (e) {
      console.warn("Failed to read farm profile from localStorage:", e);
    }
    return { ...defaultFarmData };
  },

  /**
   * Updates farm details with user-entered values
   */
  async updateFarmProfile(updates) {
    const current = await this.getFarmProfile();
    const updated = {
      ...current,
      ...updates,
      lastUpdated: "Just now"
    };

    // 1. Immediately cache in localStorage for fast UX & offline safety
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to write farm profile to localStorage:", e);
    }

    // 2. Persist to backend SQLite DB via apiClient
    try {
      const data = await apiClient.post('/api/v1/farm', updated);
      const f = data?.farm || data?.data?.farm;
      if (f) {
        const merged = {
          ...updated,
          ...f,
          coordinates: (f.coordinates && f.coordinates.lat)
            ? f.coordinates
            : ((f.lat && f.lng) ? { lat: f.lat, lng: f.lng } : updated.coordinates)
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    } catch (e) {
      console.warn("Backend farm update failed, persisted in localStorage:", e);
    }

    return updated;
  },

  /**
   * Resets farm profile back to original demo values
   */
  async resetToDemo() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    return { ...defaultFarmData };
  }
};
