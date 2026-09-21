import { defaultFarmData } from '../data/mockFarm.js';

const STORAGE_KEY = 'agribridge_farm_profile';

export const farmService = {
  /**
   * Returns current farm profile, checking localStorage first
   */
  async getFarmProfile() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to write farm profile to localStorage:", e);
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
