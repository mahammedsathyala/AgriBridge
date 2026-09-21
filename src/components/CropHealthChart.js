import { t } from '../i18n/index.js';

export function renderCropHealthChart(container, { telemetryData = [] }) {
  let activeFilter = '14'; // '7' | '14' | '30'

  function getSliceData() {
    let days = parseInt(activeFilter, 10);
    if (days === 7) {
      return telemetryData.slice(-7);
    }
    if (days === 14) {
      return telemetryData.slice(-14);
    }
    // For 30 days, extrapolate trend based on 14 days
    const base = [...telemetryData];
    const full = [];
    for (let i = 1; i <= 30; i++) {
      const idx = (i - 1) % base.length;
      full.push({
        day: `Day ${i}`,
        health: Math.min(95, Math.max(65, base[idx].health + (Math.sin(i / 2) * 4))),
        moisture: Math.min(60, Math.max(25, base[idx].moisture + (Math.cos(i / 2) * 5))),
        stress: Math.min(38, Math.max(24, base[idx].stress + (Math.sin(i / 3) * 3)))
      });
    }
    return full;
  }

  function update() {
    const data = getSliceData();
    const count = data.length;

    // SVG coordinates setup
    const svgWidth = 700;
    const svgHeight = 260;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 35;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    // Scale calculations
    const getX = (i) => paddingLeft + (i / (count - 1)) * plotWidth;
    const getY = (val, min, max) => paddingTop + plotHeight - ((val - min) / (max - min)) * plotHeight;

    // Data ranges
    // Crop health: 50 to 100
    // Moisture: 15 to 65%
    // Temp stress: 20 to 45°C
    const healthPoints = data.map((d, i) => `${getX(i)},${getY(d.health, 50, 100)}`).join(' ');
    const moisturePoints = data.map((d, i) => `${getX(i)},${getY(d.moisture, 15, 65)}`).join(' ');
    const stressPoints = data.map((d, i) => `${getX(i)},${getY(d.stress, 20, 45)}`).join(' ');

    container.innerHTML = `
      <div class="card chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <span>📈</span>
              <span>${t('overview.healthChartTitle')}</span>
            </div>
            <div class="card-subtitle">${t('overview.chartSubtitle')}</div>
          </div>

          <div class="chart-filters">
            <button class="chart-filter-btn ${activeFilter === '7' ? 'active' : ''}" data-filter="7">
              ${t('overview.filter7Days')}
            </button>
            <button class="chart-filter-btn ${activeFilter === '14' ? 'active' : ''}" data-filter="14">
              ${t('overview.filter14Days')}
            </button>
            <button class="chart-filter-btn ${activeFilter === '30' ? 'active' : ''}" data-filter="30">
              ${t('overview.filter30Days')}
            </button>
          </div>
        </div>

        <!-- SVG Line Chart Viewport -->
        <div class="svg-chart-container">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
            <defs>
              <!-- Health Fill Gradient -->
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#40916c" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#40916c" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <!-- Grid Lines (Horizontal) -->
            ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = paddingTop + plotHeight * pct;
              return `
                <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3 3"/>
              `;
            }).join('')}

            <!-- Health Area Fill -->
            <polygon 
              points="${getX(0)},${paddingTop + plotHeight} ${healthPoints} ${getX(count - 1)},${paddingTop + plotHeight}" 
              fill="url(#healthGrad)" 
            />

            <!-- Line 1: Crop Health (Green) -->
            <polyline 
              fill="none" 
              stroke="#2d6a4f" 
              stroke-width="3" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              points="${healthPoints}" 
            />

            <!-- Line 2: Soil Moisture (Blue) -->
            <polyline 
              fill="none" 
              stroke="#0077b6" 
              stroke-width="2.5" 
              stroke-dasharray="5 3" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              points="${moisturePoints}" 
            />

            <!-- Line 3: Temperature Stress (Orange) -->
            <polyline 
              fill="none" 
              stroke="#e76f51" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              points="${stressPoints}" 
            />

            <!-- Data Circles on Recent Points -->
            ${data.map((d, i) => {
              if (activeFilter === '30' && i % 3 !== 0) return '';
              const x = getX(i);
              const yH = getY(d.health, 50, 100);
              const yM = getY(d.moisture, 15, 65);
              return `
                <circle cx="${x}" cy="${yH}" r="4" fill="#2d6a4f" stroke="#ffffff" stroke-width="1.5">
                  <title>${d.day}: Crop Health ${Math.round(d.health)}/100</title>
                </circle>
                <circle cx="${x}" cy="${yM}" r="3.5" fill="#0077b6" stroke="#ffffff" stroke-width="1.5">
                  <title>${d.day}: Soil Moisture ${Math.round(d.moisture)}%</title>
                </circle>
              `;
            }).join('')}

            <!-- X-Axis Labels -->
            ${data.map((d, i) => {
              // Only display some labels if crowded
              if (activeFilter === '30' && i % 5 !== 0 && i !== count - 1) return '';
              if (activeFilter === '14' && i % 2 !== 0 && i !== count - 1) return '';
              const x = getX(i);
              return `
                <text x="${x}" y="${svgHeight - 10}" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-family="sans-serif">
                  ${d.day}
                </text>
              `;
            }).join('')}

            <!-- Y-Axis Ticks -->
            <text x="${paddingLeft - 8}" y="${paddingTop + 10}" text-anchor="end" font-size="10" fill="var(--text-muted)">100</text>
            <text x="${paddingLeft - 8}" y="${paddingTop + plotHeight * 0.5}" text-anchor="end" font-size="10" fill="var(--text-muted)">75</text>
            <text x="${paddingLeft - 8}" y="${paddingTop + plotHeight}" text-anchor="end" font-size="10" fill="var(--text-muted)">50</text>
          </svg>
        </div>

        <!-- Legend -->
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background-color: #2d6a4f;"></span>
            <span style="font-weight: 600;">${t('overview.legendHealth')}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background-color: #0077b6;"></span>
            <span style="font-weight: 600;">${t('overview.legendMoisture')}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background-color: #e76f51;"></span>
            <span style="font-weight: 600;">${t('overview.legendStress')}</span>
          </div>
        </div>
      </div>
    `;

    // Attach filter listeners
    container.querySelectorAll('.chart-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        update();
      });
    });
  }

  update();
}
