import { mockWeatherData } from '../data/mockWeather.js';
import { farmService } from './farmService.js';
import { apiClient } from './apiClient.js';
import { USE_MOCK_FALLBACK } from '../config.js';

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
    return { lat: 15.8281, lng: 78.0373 };
  },

  async getCurrentWeather(coords = null) {
    try {
      const { lat, lng } = coords || await this.getCoordinates();
      const data = await apiClient.get(`/api/v1/weather?lat=${lat}&lon=${lng}`);
      const live = data?.data || data;

      if (live && (live.status === 'success' || live.current || live.live_telemetry)) {
        const curr = live.current || live.live_telemetry || {};
        const sourceStatus = live.source_status || (live.status === 'success' ? 'LIVE' : 'FALLBACK');
        return {
          ...mockWeatherData.current,
          temp: curr.temperature_c ?? mockWeatherData.current.temp,
          tempC: curr.temperature_c ?? mockWeatherData.current.tempC,
          feelsLike: (curr.temperature_c ? parseFloat((curr.temperature_c + 2.5).toFixed(1)) : mockWeatherData.current.feelsLike),
          condition: curr.condition || (live.derived_agro_weather
            ? (live.derived_agro_weather.charAt(0).toUpperCase() + live.derived_agro_weather.slice(1))
            : mockWeatherData.current.condition),
          humidity: curr.relative_humidity_pct ?? curr.relative_humidity_percent ?? mockWeatherData.current.humidity,
          relativeHumidity: curr.relative_humidity_pct ?? curr.relative_humidity_percent ?? mockWeatherData.current.relativeHumidity,
          windSpeedKmH: curr.wind_speed_kmh ?? mockWeatherData.current.windSpeedKmH,
          windSpeedKmph: curr.wind_speed_kmh ?? mockWeatherData.current.windSpeedKmph,
          precipitationMm: curr.precipitation_mm ?? mockWeatherData.current.precipitationMm,
          sourceStatus: sourceStatus,
          dataSource: sourceStatus === 'LIVE' ? "Live (Open-Meteo API)" : "Agro-Climatic Fallback"
        };
      }
    } catch (err) {
      if (!USE_MOCK_FALLBACK) throw err;
    }
    return { ...mockWeatherData.current, sourceStatus: "DEMO", dataSource: "Demo Mode" };
  },

  async get5DayForecast(coords = null) {
    try {
      const { lat, lng } = coords || await this.getCoordinates();
      const data = await apiClient.get(`/api/v1/weather?lat=${lat}&lon=${lng}`);
      const live = data?.data || data;

      const daily = live?.daily_forecast || live?.forecast?.daily_forecast;
      if (Array.isArray(daily) && daily.length > 0) {
        return daily.map((d, i) => ({
          dayName: d.day_name || (i === 0 ? "Today" : (i === 1 ? "Tomorrow" : `Day ${i + 1}`)),
          dayNameTe: d.day_name_te || (i === 0 ? "ఈ రోజు" : (i === 1 ? "రేపు" : `రోజు ${i + 1}`)),
          date: d.date || "Upcoming",
          dateTe: d.date || "రాబోయే",
          icon: (d.precipitation_sum_mm || 0) > 5 ? "🌧️" : ((d.precipitation_sum_mm || 0) > 0 ? "🌦️" : (d.weather_code === 0 ? "☀️" : "⛅")),
          maxTemp: Math.round(d.temperature_max_c ?? 32),
          minTemp: Math.round(d.temperature_min_c ?? 23),
          rainProbPercent: Math.round(d.precipitation_probability_max ?? ((d.precipitation_sum_mm || 0) > 0 ? 60 : 15)),
          rainMm: parseFloat((d.precipitation_sum_mm ?? 0).toFixed(1)),
          highlight: (d.precipitation_sum_mm ?? 0) > 10,
          condition: d.condition || "Mainly Clear",
          sourceStatus: live?.source_status || "LIVE"
        }));
      }
    } catch (err) {
      if (!USE_MOCK_FALLBACK) throw err;
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
