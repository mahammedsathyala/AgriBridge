import { defaultFarmData } from '../data/mockFarm.js';

const STORAGE_KEY = 'agribridge_farm_profile';
const API_BASE = 'http://localhost:5000';

export const farmService = {
  /**
   * Returns current farm profile, checking backend first with localStorage fallback
   */
  async getFarmProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/farm`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.farm) {
          const f = json.farm;
          const merged = {
            ...defaultFarmData,
            ...f,
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
      }
    } catch (e) {
      // Backend unavailable or network timeout; fall through to localStorage
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

    // 2. Persist to backend SQLite DB
    try {
      const res = await fetch(`${API_BASE}/api/farm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.farm) {
          const f = json.farm;
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
