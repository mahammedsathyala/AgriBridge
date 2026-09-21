import { defaultFarmData } from '../data/mockFarm.js';

export const satelliteService = {
  async getIndicators() {
    return { ...defaultFarmData.satellite };
  }
};
