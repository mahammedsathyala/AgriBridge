import { t, getLocale } from '../i18n/index.js';

export function renderWeatherPreview(container, { forecast = [] }) {
  const isTe = getLocale() === 'te';
  const fiveDay = forecast.slice(0, 5);

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>🌦️</span>
          <span>${t('overview.weatherPreviewTitle')}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--color-primary-700); font-weight: 600;">
          Kurnool Radar Live
        </div>
      </div>

      <div class="weather-forecast-grid">
        ${fiveDay.map(day => {
          let badgeHtml = '';
          if (day.badge === 'rainWarning') {
            badgeHtml = `<span class="weather-badge-pill badge-sky">🌧️ ${t('overview.rainfallWarning')}</span>`;
          } else if (day.badge === 'bestIrrigation') {
            badgeHtml = `<span class="weather-badge-pill badge-success">💧 ${t('overview.bestIrrigationDay')}</span>`;
          } else if (day.badge === 'heatWarning') {
            badgeHtml = `<span class="weather-badge-pill badge-warning">🔥 ${t('overview.heatStressWarning')}</span>`;
          }

          return `
            <div class="weather-day-card ${day.highlight ? 'highlight' : ''}">
              <div class="weather-day-title">
                ${isTe ? (day.dayNameTe || day.dayName) : day.dayName}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">
                ${isTe ? (day.dateTe || day.date) : day.date}
              </div>
              
              <div class="weather-icon-lg">${day.icon}</div>

              <div class="weather-temp-range">
                <span>${day.maxTemp}°C</span>
                <span style="color: var(--text-muted); font-weight: normal; margin-left: 2px;">/ ${day.minTemp}°</span>
              </div>

              <div class="weather-rain-info">
                <span>💧</span>
                <span>${day.rainProbPercent}% (${day.rainMm}mm)</span>
              </div>

              ${badgeHtml}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
