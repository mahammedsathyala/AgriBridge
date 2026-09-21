import { t, getLocale } from '../i18n/index.js';
import { weatherService } from '../services/weatherService.js';

export function renderWeatherPage(container) {
  let currentWeather = null;
  let forecast = [];
  let climateAlert = null;
  let history14 = [];

  async function loadData() {
    currentWeather = await weatherService.getCurrentWeather();
    forecast = await weatherService.get5DayForecast();
    climateAlert = await weatherService.getClimateAlert();
    history14 = await weatherService.get14DayTelemetry();
    render();
  }

  function render() {
    if (!currentWeather) return;
    const isTe = getLocale() === 'te';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('weather.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('weather.subtitle')}</p>
        </div>

        <!-- Current Conditions Banner -->
        <div class="card" style="background: linear-gradient(135deg, #023e8a 0%, #0077b6 100%); color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <div style="font-size: 0.82rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em;">
                ${t('weather.currentConditions')}
              </div>
              <div style="display: flex; align-items: baseline; gap: var(--space-3); margin: var(--space-2) 0;">
                <span style="font-size: 3rem; font-weight: 900;">${currentWeather.temp}°C</span>
                <span style="font-size: 1.2rem; opacity: 0.9;">
                  ${currentWeather.icon} ${isTe ? currentWeather.conditionTe : currentWeather.condition}
                </span>
              </div>
              <div style="font-size: 0.82rem; opacity: 0.85;">
                ${t('weather.feelsLike')}: ${currentWeather.feelsLike}°C • Barometer: ${currentWeather.pressureHpa} hPa
              </div>
            </div>

            <!-- Meteorological Metric Badges -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); font-size: 0.85rem;">
              <div style="background: rgba(255,255,255,0.15); padding: 8px 14px; border-radius: var(--radius-md); backdrop-filter: blur(4px);">
                <div style="font-size: 0.72rem; opacity: 0.8;">💧 ${t('weather.humidity')}</div>
                <div style="font-weight: 700; font-size: 1.1rem;">${currentWeather.humidity}%</div>
              </div>

              <div style="background: rgba(255,255,255,0.15); padding: 8px 14px; border-radius: var(--radius-md); backdrop-filter: blur(4px);">
                <div style="font-size: 0.72rem; opacity: 0.8;">💨 ${t('weather.windSpeed')}</div>
                <div style="font-weight: 700; font-size: 1.1rem;">${currentWeather.windSpeedKmH} km/h</div>
              </div>

              <div style="background: rgba(255,255,255,0.15); padding: 8px 14px; border-radius: var(--radius-md); backdrop-filter: blur(4px);">
                <div style="font-size: 0.72rem; opacity: 0.8;">☀️ ${t('weather.uvIndex')}</div>
                <div style="font-weight: 700; font-size: 1.1rem;">${currentWeather.uvIndex} (High)</div>
              </div>

              <div style="background: rgba(255,255,255,0.15); padding: 8px 14px; border-radius: var(--radius-md); backdrop-filter: blur(4px);">
                <div style="font-size: 0.72rem; opacity: 0.8;">⚠️ ${t('weather.droughtRisk')}</div>
                <div style="font-weight: 700; font-size: 1.1rem;">${currentWeather.droughtRisk}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Climate Risk Alert Card -->
        <div class="card" style="background: #fffbeb; border-left: 5px solid #d97706; border-color: #fde68a;">
          <div class="card-header" style="margin-bottom: var(--space-2);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">⚠️</span>
              <div style="font-weight: 800; color: #92400e; font-size: 1.05rem;">
                ${isTe ? climateAlert.titleTe : climateAlert.titleEn}
              </div>
            </div>
            <span class="badge badge-warning">Next 10 Days</span>
          </div>

          <p style="font-size: 0.88rem; color: #78350f; line-height: 1.45; margin-bottom: var(--space-3);">
            ${isTe ? climateAlert.descTe : climateAlert.descEn}
          </p>

          <div>
            <div style="font-weight: 700; font-size: 0.85rem; color: #92400e; margin-bottom: 6px;">
              🛡️ Recommended Climate Resilience Actions:
            </div>
            <ul style="padding-left: 20px; font-size: 0.82rem; color: #78350f; line-height: 1.5;">
              ${(isTe ? climateAlert.recommendedActionsTe : climateAlert.recommendedActionsEn).map(a => `
                <li>${a}</li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- 7-Day Forecast Grid -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>📅</span>
              <span>7-Day Meteorological Outlook (IMD Kurnool Doppler)</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-3);">
            ${forecast.map(d => `
              <div class="weather-day-card ${d.highlight ? 'highlight' : ''}">
                <div class="weather-day-title">
                  ${isTe ? (d.dayNameTe || d.dayName) : d.dayName}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${isTe ? (d.dateTe || d.date) : d.date}</div>
                <div class="weather-icon-lg">${d.icon}</div>
                <div class="weather-temp-range">
                  <span>${d.maxTemp}°</span> / <span style="color: var(--text-muted);">${d.minTemp}°</span>
                </div>
                <div class="weather-rain-info">
                  <span>💧</span>
                  <span>${d.rainProbPercent}% (${d.rainMm}mm)</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Multi-Metric Weather & Soil Moisture Trends Chart -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>📊</span>
              <span>${t('weather.chartRainTemp')}</span>
            </div>
            <span class="badge badge-soil">Hydro-Thermal Model</span>
          </div>

          <!-- SVG Visual Bar & Line Chart -->
          <div style="width: 100%; height: 220px; position: relative;">
            <svg viewBox="0 0 650 200" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
              <!-- Rain Bars for forecast days -->
              ${forecast.map((d, i) => {
                const x = 50 + (i * 85);
                const barHeight = Math.min(120, d.rainMm * 6);
                const y = 160 - barHeight;
                return `
                  <rect x="${x}" y="${y}" width="34" height="${barHeight}" rx="4" fill="${d.rainMm > 10 ? '#0077b6' : '#90e0ef'}" opacity="0.85">
                    <title>${d.dayName}: ${d.rainMm}mm rainfall expected</title>
                  </rect>
                  <text x="${x + 17}" y="178" text-anchor="middle" font-size="11" fill="var(--text-secondary)">
                    ${d.dayName}
                  </text>
                  ${d.rainMm > 0 ? `
                    <text x="${x + 17}" y="${y - 4}" text-anchor="middle" font-size="9" font-weight="bold" fill="#0077b6">
                      ${d.rainMm}mm
                    </text>
                  ` : ''}
                `;
              }).join('')}
              <!-- Baseline Axis -->
              <line x1="30" y1="160" x2="620" y2="160" stroke="var(--border-medium)" stroke-width="1.5" />
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  loadData();
}
