import { mockWeatherData } from '../data/mockWeather.js';

export const weatherService = {
  async getCurrentWeather() {
    return { ...mockWeatherData.current };
  },

  async get5DayForecast() {
    return [...mockWeatherData.forecast];
  },

  async getClimateAlert() {
    return { ...mockWeatherData.climateRiskNotice };
  },

  async get14DayTelemetry() {
    return [...mockWeatherData.history14Days];
  }
};
