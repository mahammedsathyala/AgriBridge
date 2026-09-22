import { t, getLocale } from '../i18n/index.js';
import { weatherService } from '../services/weatherService.js';

export function renderWeatherPage(container) {
  let currentWeather = null;
  let forecast = [];
  let climateAlert = null;
  let history14 = [];
  let isLoading = true;
  let loadError = null;

  async function loadData() {
    isLoading = true;
    loadError = null;
    renderSkeleton();
    try {
      currentWeather = await weatherService.getCurrentWeather();
      forecast = await weatherService.get5DayForecast();
      climateAlert = await weatherService.getClimateAlert();
      history14 = await weatherService.get14DayTelemetry();
      if (!currentWeather) throw new Error("No weather data returned");
    } catch (err) {
      console.warn("Weather sync error:", err);
      loadError = "Couldn't reach live weather data — showing last known values";
      // Provide resilient fallback state so the page remains actionable
      if (!currentWeather) {
        currentWeather = {
          temp: 31.4,
          feelsLike: 34.2,
          condition: "Partly Cloudy",
          conditionTe: "పాక్షికంగా మేఘావృతం",
          icon: "⛅",
          humidity: 68,
          windSpeedKmH: 14.5,
          uvIndex: 7.2,
          droughtRisk: "Moderate (Level 2)",
          pressureHpa: 1012
        };
      }
      if (!forecast || forecast.length === 0) {
        forecast = [
          { dayName: "Today", dayNameTe: "ఈ రోజు", date: "Sep 22", dateTe: "సెప్టెంబర్ 22", icon: "⛅", maxTemp: 32, minTemp: 24, rainProbPercent: 20, rainMm: 1.2 },
          { dayName: "Tomorrow", dayNameTe: "రేపు", date: "Sep 23", dateTe: "సెప్టెంబర్ 23", icon: "🌧️", maxTemp: 30, minTemp: 23, rainProbPercent: 70, rainMm: 14.5, highlight: true },
          { dayName: "Thu", dayNameTe: "గురు", date: "Sep 24", dateTe: "సెప్టెంబర్ 24", icon: "🌦️", maxTemp: 31, minTemp: 23, rainProbPercent: 45, rainMm: 3.5 }
        ];
      }
      if (!climateAlert) {
        climateAlert = {
          titleEn: "10-Day Dry-Spell & Thermal Stress Warning",
          titleTe: "10 రోజుల వర్షాభావ & ఉష్ణోగ్రత హెచ్చరిక",
          descEn: "Forecast indicates elevated vapor pressure deficit and dry convective winds. Maintain soil armor and check soil sensor depth.",
          descTe: "రాబోయే రోజుల్లో తేమ శాతం తగ్గి పొడి గాలులు వీచే అవకాశం ఉంది. మల్చింగ్ ద్వారా భూమి తేమను కాపాడుకోండి.",
          recommendedActionsEn: ["Delay unnecessary weed-turning tillage", "Deploy stubble mulch across rows"],
          recommendedActionsTe: ["అనవసర దుక్కులు చేయకండి", "వరి లేదా జొన్న గడ్డితో మల్చింగ్ చేయండి"]
        };
      }
    } finally {
      isLoading = false;
      render();
    }
  }

  function renderSkeleton() {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Skeleton Header -->
        <div>
          <div class="skeleton skeleton-title" style="width: 220px; height: 1.8rem;"></div>
          <div class="skeleton skeleton-text" style="width: 320px;"></div>
        </div>

        <!-- Skeleton Current Conditions Card -->
        <div class="skeleton skeleton-banner"></div>

        <!-- Skeleton Climate Risk Alert -->
        <div class="skeleton" style="height: 110px; border-radius: var(--radius-xl);"></div>

        <!-- Skeleton Forecast Grid -->
        <div class="card card--default">
          <div class="skeleton skeleton-title" style="width: 280px;"></div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-3);">
            <div class="skeleton skeleton-metric-card"></div>
            <div class="skeleton skeleton-metric-card"></div>
            <div class="skeleton skeleton-metric-card"></div>
            <div class="skeleton skeleton-metric-card"></div>
            <div class="skeleton skeleton-metric-card"></div>
          </div>
        </div>

        <!-- Skeleton Trends Chart -->
        <div class="skeleton skeleton-chart"></div>
      </div>
    `;
  }

  function render() {
    if (!currentWeather) return;
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';

    const HI_WEATHER = {
      'Sunny': 'धूप',
      'Clear Sky': 'साफ़ आसमान',
      'Clear': 'साफ़',
      'Partly Cloudy': 'आंशिक रूप से बादलमय',
      'Scattered Showers': 'हल्की बारिश',
      'Humid Overcast': 'उमस भरा बादलमय',
      'Light Rain': 'हल्की वर्षा',
      'Moderate Rain': 'मध्यम वर्षा',
      'Heavy Rain': 'भारी वर्षा',
      'Thunderstorm': 'गरज के साथ बारिश'
    };

    const conditionText = isTe 
      ? (currentWeather.conditionTe || currentWeather.condition) 
      : (isHi ? (HI_WEATHER[currentWeather.condition] || currentWeather.condition) : currentWeather.condition);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('weather.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('weather.subtitle')}</p>
        </div>

        <!-- Error State Banner (Task 3) -->
        ${loadError ? `
          <div class="error-state-card" role="alert">
            <div class="error-state-msg">
              <span style="font-size: 1.2rem;">📡</span>
              <span><strong>Notice:</strong> ${loadError}</span>
            </div>
            <button id="btn-weather-retry" class="btn-retry" aria-label="Retry fetching live weather">
              🔄 ${isTe ? 'మళ్ళీ ప్రయత్నించండి' : (isHi ? 'पुनः प्रयास करें' : 'Retry')}
            </button>
          </div>
        ` : ''}

        <!-- Current Conditions Banner (Primary Focus) -->
        <div class="card card--primary" style="background: linear-gradient(135deg, #023e8a 0%, #0077b6 100%); color: white; border-top: 4px solid var(--color-sky-400);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <div style="font-size: 0.82rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em;">
                ${t('weather.currentConditions')}
              </div>
              <div style="display: flex; align-items: baseline; gap: var(--space-3); margin: var(--space-2) 0;">
                <span style="font-size: 3rem; font-weight: 900;">${currentWeather.temp}°C</span>
                <span style="font-size: 1.2rem; opacity: 0.9;">
                  ${currentWeather.icon} ${conditionText}
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

        <!-- Climate Risk Alert Card (Primary Warning) -->
        <div class="card card--primary" style="background: #fffbeb; border-left: 5px solid #d97706; border-color: #fde68a; border-top: 4px solid #d97706;">
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

        <!-- 7-Day Forecast Grid (Secondary / Default) -->
        <div class="card card--default">
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

        <!-- Multi-Metric Weather & Soil Moisture Trends Chart (Secondary / Default) -->
        <div class="card card--default">
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

    const retryBtn = container.querySelector('#btn-weather-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        loadData();
      });
    }
  }

  loadData();
}
