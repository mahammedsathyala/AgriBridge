import { t, getLocale } from '../i18n/index.js';
import { renderCropHealthChart } from '../components/CropHealthChart.js';
import { renderWeatherPreview } from '../components/WeatherCard.js';
import { advisoryService } from '../services/advisoryService.js';
import { showToast } from '../components/Toast.js';

export function renderOverviewPage(container, { farm, weather, onNavigate }) {
  const isTe = getLocale() === 'te';

  container.innerHTML = `
    <!-- Demo Mode Information Strip -->
    <div class="demo-mode-strip" style="border-radius: var(--radius-md); margin-bottom: var(--space-4);">
      <div style="display: flex; align-items: center;">
        <span class="demo-mode-pill">${t('common.demoBadge')}</span>
        <span>${isTe ? 'కర్నూలు వేరుశనగ రైతు ప్రొఫైల్ లోడ్ చేయబడింది (సత్యాల ఫార్మ్)' : 'Demo active for Sathyala Farm, Kurnool (Groundnut, 2.5 Acres)'}</span>
      </div>
      <div style="display: flex; gap: var(--space-3); align-items: center;">
        <button id="btn-start-tour" class="demo-reset-btn" style="color: #0284c7; font-weight: 700;">
          🚀 ${t('nav.tour')}
        </button>
        <button id="btn-reset-demo" class="demo-reset-btn">
          ↺ ${t('common.resetDemo')}
        </button>
      </div>
    </div>

    <!-- Welcome Card -->
    <div class="welcome-banner">
      <div>
        <div class="welcome-title">${t('overview.greeting')}</div>
        <div class="welcome-desc">${t('overview.greetingSub')}</div>

        <div class="welcome-meta-chips">
          <div class="welcome-chip">
            <span>📍</span>
            <span>${t('overview.areaLabel')}: ${farm.areaAcres || 2.5} ${t('overview.acres')}</span>
          </div>
          <div class="welcome-chip">
            <span>🌱</span>
            <span>${t('overview.cropLabel')}: ${isTe ? 'వేరుశనగ (Kadiri-6)' : 'Groundnut (K6)'}</span>
          </div>
          <div class="welcome-chip">
            <span>⏳</span>
            <span>${t('overview.cropAgeLabel')}: ${farm.cropAgeDays || 42} ${t('overview.days')}</span>
          </div>
          <div class="welcome-chip">
            <span>🛡️</span>
            <span>${t('overview.healthStatusLabel')}: ${t('overview.moderate')}</span>
          </div>
          <div class="welcome-chip" style="opacity: 0.85;">
            <span>🕒</span>
            <span>${t('overview.lastUpdated')}: ${farm.lastUpdated || 'Today 06:15 PM'}</span>
          </div>
        </div>
      </div>

      <div class="welcome-visual">
        <div style="font-size: 4rem; text-align: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2));">🌾</div>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="metrics-grid">
      <!-- 1. Crop Health -->
      <div class="card metric-card">
        <div>
          <div class="metric-header">
            <span class="metric-label">${t('overview.cropHealthTitle')}</span>
            <div class="metric-icon-wrap" style="background: var(--color-primary-50); color: var(--color-primary-700);">
              🌿
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${farm.cropHealthScore || 78}</span>
            <span class="metric-unit">/ 100</span>
            <span class="badge badge-success" style="margin-left: auto;">${t('overview.good')}</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${farm.cropHealthScore || 78}%; background-color: var(--color-primary-600);"></div>
          </div>
        </div>
        <div class="metric-footer">
          <span>${t('overview.cropHealthDesc')}</span>
        </div>
      </div>

      <!-- 2. Soil Moisture -->
      <div class="card metric-card">
        <div>
          <div class="metric-header">
            <span class="metric-label">${t('overview.soilMoistureTitle')}</span>
            <div class="metric-icon-wrap" style="background: var(--color-sky-50); color: var(--color-sky-700);">
              💧
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${farm.soilMoisturePercent || 34}%</span>
            <span class="badge badge-warning" style="margin-left: auto;">${t('overview.attentionNeeded')}</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${farm.soilMoisturePercent || 34}%; background-color: var(--color-amber-500);"></div>
          </div>
        </div>
        <div class="metric-footer">
          <span>${t('overview.soilMoistureDesc')}</span>
        </div>
      </div>

      <!-- 3. Rainfall Forecast -->
      <div class="card metric-card">
        <div>
          <div class="metric-header">
            <span class="metric-label">${t('overview.rainfallTitle')}</span>
            <div class="metric-icon-wrap" style="background: var(--color-sky-100); color: var(--color-sky-800);">
              🌧️
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${farm.rainfallForecastMm || 18}</span>
            <span class="metric-unit">mm</span>
            <span class="badge badge-sky" style="margin-left: auto;">Next 3 Days</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: 68%; background-color: var(--color-sky-600);"></div>
          </div>
        </div>
        <div class="metric-footer">
          <span>${t('overview.rainfallDesc')}</span>
        </div>
      </div>

      <!-- 4. Disease Risk -->
      <div class="card metric-card">
        <div>
          <div class="metric-header">
            <span class="metric-label">${t('overview.diseaseRiskTitle')}</span>
            <div class="metric-icon-wrap" style="background: var(--color-amber-50); color: var(--color-amber-600);">
              🔬
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value" style="font-size: 1.4rem;">Medium</span>
            <span class="badge badge-warning" style="margin-left: auto;">Leaf Spot (Tikka)</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: 50%; background-color: var(--color-amber-500);"></div>
          </div>
        </div>
        <div class="metric-footer">
          <a href="#" id="link-open-diagnosis" style="font-weight: 700; color: var(--color-primary-700);">
            ${t('overview.viewDiagnosis')} →
          </a>
        </div>
      </div>
    </div>

    <!-- Priority Action Advisory Card -->
    <div class="priority-action-card">
      <div class="priority-action-content">
        <div class="priority-action-tag">
          <span>⚡</span>
          <span>${t('overview.priorityTag')}</span>
        </div>
        <div class="priority-action-text">
          ${t('overview.priorityTitle')}
        </div>
        <div class="priority-action-sub">
          ${t('overview.priorityDesc')}
        </div>
      </div>

      <div class="priority-action-buttons">
        <button id="btn-view-advisory" class="btn btn-secondary btn-sm">
          ${t('overview.viewFullAdvisory')}
        </button>
        <button id="btn-mark-completed" class="btn btn-primary btn-sm">
          ✓ ${t('overview.markCompleted')}
        </button>
      </div>
    </div>

    <!-- Farm Health Line Chart -->
    <div id="health-chart-wrapper"></div>

    <!-- 2-Column Row: 5-Day Weather Forecast & Recent Activity -->
    <div class="dashboard-columns">
      <!-- Weather Preview -->
      <div id="weather-preview-wrapper"></div>

      <!-- Recent Farm Activity -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>📋</span>
            <span>${t('overview.recentActivityTitle')}</span>
          </div>
        </div>

        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon-bubble" style="background: var(--color-primary-100); color: var(--color-primary-700);">🛰️</div>
            <div class="activity-text">
              <div>${t('overview.actSatellite')}</div>
              <div class="activity-time">Today, 02:15 PM</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon-bubble" style="background: var(--color-sky-100); color: var(--color-sky-700);">📶</div>
            <div class="activity-text">
              <div>${t('overview.actSensor')}</div>
              <div class="activity-time">Today, 06:10 PM</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon-bubble" style="background: var(--color-soil-100); color: var(--color-soil-700);">💡</div>
            <div class="activity-text">
              <div>${t('overview.actAdvisory')}</div>
              <div class="activity-time">Today, 05:30 PM</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon-bubble" style="background: var(--color-amber-100); color: var(--color-amber-700);">🔬</div>
            <div class="activity-text">
              <div>${t('overview.actDiagnosis')}</div>
              <div class="activity-time">Yesterday, 11:45 AM</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon-bubble" style="background: var(--color-success-100); color: var(--color-success-700);">✓</div>
            <div class="activity-text">
              <div>${t('overview.actCompleted')}</div>
              <div class="activity-time">Yesterday, 04:20 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Sub-components
  const chartWrapper = container.querySelector('#health-chart-wrapper');
  if (chartWrapper && weather.history14Days) {
    renderCropHealthChart(chartWrapper, { telemetryData: weather.history14Days });
  }

  const weatherWrapper = container.querySelector('#weather-preview-wrapper');
  if (weatherWrapper && weather.forecast) {
    renderWeatherPreview(weatherWrapper, { forecast: weather.forecast });
  }

  // Attach button events
  container.querySelector('#link-open-diagnosis')?.addEventListener('click', (e) => {
    e.preventDefault();
    onNavigate('diagnosis');
  });

  container.querySelector('#btn-view-advisory')?.addEventListener('click', () => {
    onNavigate('advisory');
  });

  const markCompBtn = container.querySelector('#btn-mark-completed');
  if (markCompBtn) {
    markCompBtn.addEventListener('click', async () => {
      await advisoryService.toggleComplete('adv-001');
      markCompBtn.textContent = '✓ ' + t('overview.completed');
      markCompBtn.classList.replace('btn-primary', 'btn-secondary');
      showToast(t('overview.completed'), 'success');
    });
  }

  container.querySelector('#btn-start-tour')?.addEventListener('click', () => {
    import('../components/GuidedTour.js').then(m => m.startGuidedTour({ navigateToTab: onNavigate }));
  });

  container.querySelector('#btn-reset-demo')?.addEventListener('click', async () => {
    localStorage.clear();
    location.reload();
  });
}
