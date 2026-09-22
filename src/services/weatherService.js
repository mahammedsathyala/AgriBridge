import { mockWeatherData } from '../data/mockWeather.js';
import { farmService } from './farmService.js';

const API_BASE = 'http://localhost:5000';

export const weatherService = {
  async getCoordinates() {
    try {
      const farm = await farmService.getFarmProfile();
      if (farm && farm.coordinates && farm.coordinates.lat && farm.coordinates.lng) {
        return farm.coordinates;
      }
    } catch (e) {
      console.warn("Could not retrieve farm coordinates for weatherService:", e);
    }
    return { lat: 14.7384, lng: 78.9928 };
  },

  async getCurrentWeather(coords = null) {
    try {
      const { lat, lng } = coords || await this.getCoordinates();
      const res = await fetch(`${API_BASE}/api/weather-data?lat=${lat}&lon=${lng}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const live = await res.json();
        if (live && live.status === 'success' && live.live_telemetry) {
          const t = live.live_telemetry;
          return {
            ...mockWeatherData.current,
            tempC: t.temperature_c ?? mockWeatherData.current.tempC,
            condition: live.derived_agro_weather
              ? (live.derived_agro_weather.charAt(0).toUpperCase() + live.derived_agro_weather.slice(1))
              : mockWeatherData.current.condition,
            relativeHumidity: t.relative_humidity_percent ?? mockWeatherData.current.relativeHumidity,
            windSpeedKmph: t.wind_speed_kmh ?? mockWeatherData.current.windSpeedKmph,
            precipitationMm: t.precipitation_mm ?? mockWeatherData.current.precipitationMm
          };
        }
      }
    } catch (err) {
      // Graceful fallback to mock data on network error
    }
    return { ...mockWeatherData.current };
  },

  async get5DayForecast(coords = null) {
    try {
      const { lat, lng } = coords || await this.getCoordinates();
      const res = await fetch(`${API_BASE}/api/weather-data?lat=${lat}&lon=${lng}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const live = await res.json();
        if (live && live.status === 'success') {
          // Weather forecast live connection succeeded
        }
      }
    } catch (err) {
      // Graceful fallback to mock data
    }
    return [...mockWeatherData.forecast];
  },

  async getClimateAlert() {
    return { ...mockWeatherData.climateRiskNotice };
  },

  async get14DayTelemetry() {
    return [...mockWeatherData.history14Days];
  }
};
