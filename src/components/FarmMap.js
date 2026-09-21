import { t } from '../i18n/index.js';

export function renderFarmMap(container, { farm, zoom = 1, layer = 'satellite' }) {
  let currentZoom = zoom;
  let activeLayer = layer; // 'satellite' | 'ndvi'

  function update() {
    const lat = farm.coordinates ? farm.coordinates.lat : 15.8281;
    const lng = farm.coordinates ? farm.coordinates.lng : 78.0373;
    const scale = currentZoom;

    // Viewbox transformation based on zoom
    const vbWidth = 600 / scale;
    const vbHeight = 360 / scale;
    const vbX = (600 - vbWidth) / 2;
    const vbY = (360 - vbHeight) / 2;

    container.innerHTML = `
      <div class="card" style="padding: var(--space-4); overflow: hidden; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
          <div>
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--color-primary-900); display: flex; align-items: center; gap: 6px;">
              <span>🗺️</span>
              <span>${t('farm.mapTitle')}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              ${t('farm.mapCoords')}: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E • Kurnool Block 4B
            </div>
          </div>

          <!-- Layer Switcher -->
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <div class="chart-filters">
              <button id="layer-sat-btn" class="chart-filter-btn ${activeLayer === 'satellite' ? 'active' : ''}">
                🛰️ ${t('farm.layerSatellite')}
              </button>
              <button id="layer-ndvi-btn" class="chart-filter-btn ${activeLayer === 'ndvi' ? 'active' : ''}">
                🟢 ${t('farm.layerNdvi')}
              </button>
            </div>

            <!-- Zoom Controls -->
            <div style="display: flex; gap: 2px;">
              <button id="btn-zoom-in" class="btn btn-secondary btn-sm" title="${t('farm.zoomIn')}" aria-label="Zoom In">
                +
              </button>
              <button id="btn-zoom-out" class="btn btn-secondary btn-sm" title="${t('farm.zoomOut')}" aria-label="Zoom Out">
                −
              </button>
            </div>
          </div>
        </div>

        <!-- SVG Map Viewport -->
        <div style="position: relative; width: 100%; height: 320px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-medium); background: #1c2e24;">
          <svg viewBox="${vbX} ${vbY} ${vbWidth} ${vbHeight}" style="width: 100%; height: 100%; display: block; transition: all 0.3s ease;">
            <defs>
              <!-- Satellite Terrain Pattern -->
              <linearGradient id="satGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2d4a34" />
                <stop offset="50%" stop-color="#3d5a42" />
                <stop offset="100%" stop-color="#243828" />
              </linearGradient>

              <!-- NDVI Infrared Heatmap Gradient -->
              <linearGradient id="ndviGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4ade80" />
                <stop offset="60%" stop-color="#22c55e" />
                <stop offset="100%" stop-color="#15803d" />
              </linearGradient>

              <!-- Surrounding Agricultural Parcels -->
              <pattern id="fieldLines" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
              </pattern>
            </defs>

            <!-- Base Canvas / Terrain Background -->
            <rect width="600" height="360" fill="url(#satGrad)" />
            <rect width="600" height="360" fill="url(#fieldLines)" />

            <!-- Rural Road / Canal Waterway -->
            <path d="M 0 120 Q 200 150 400 90 T 600 130" fill="none" stroke="#6c584c" stroke-width="8" opacity="0.6" />
            <path d="M 0 120 Q 200 150 400 90 T 600 130" fill="none" stroke="#a68a68" stroke-width="4" stroke-dasharray="8 4" opacity="0.8" />
            
            <!-- Irrigation Canal -->
            <path d="M 120 0 Q 150 200 130 360" fill="none" stroke="#0077b6" stroke-width="5" opacity="0.7" />

            <!-- Adjacent Farmer Fields -->
            <polygon points="40,160 120,150 110,290 30,280" fill="#3b4d3f" stroke="#253528" stroke-width="2" opacity="0.7"/>
            <polygon points="380,140 560,150 550,310 370,290" fill="#465842" stroke="#253528" stroke-width="2" opacity="0.7"/>
            <polygon points="180,20 360,30 350,110 170,100" fill="#384f3c" stroke="#253528" stroke-width="2" opacity="0.7"/>

            <!-- Sathyala Farm Boundary Polygon (Target Plot - 2.5 Acres) -->
            <polygon 
              points="180,140 340,130 330,300 170,290" 
              fill="${activeLayer === 'ndvi' ? 'url(#ndviGrad)' : 'rgba(82, 183, 136, 0.45)'}" 
              stroke="#52b788" 
              stroke-width="3.5" 
              stroke-dasharray="6 3"
            />

            <!-- Crop Rows within plot -->
            <line x1="190" y1="160" x2="330" y2="150" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
            <line x1="188" y1="185" x2="328" y2="175" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
            <line x1="185" y1="210" x2="325" y2="200" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
            <line x1="182" y1="235" x2="322" y2="225" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
            <line x1="180" y1="260" x2="320" y2="250" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />

            <!-- Farm Center Pin & Tag -->
            <g transform="translate(255, 210)">
              <circle cx="0" cy="0" r="14" fill="rgba(220, 38, 38, 0.2)" class="pulse-circle" />
              <circle cx="0" cy="0" r="7" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
              <path d="M 0 0 L 0 -12" stroke="#dc2626" stroke-width="2" />
              <rect x="-42" y="-36" width="84" height="20" rx="4" fill="rgba(0,0,0,0.8)" />
              <text x="0" y="-22" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">
                ${farm.farmName || 'Sathyala Farm'}
              </text>
            </g>

            <!-- IoT Sensor Node Marker -->
            <g transform="translate(215, 175)">
              <circle cx="0" cy="0" r="10" fill="rgba(0, 119, 182, 0.3)" class="pulse-circle" />
              <circle cx="0" cy="0" r="5" fill="#0077b6" stroke="#ffffff" stroke-width="1.5" />
              <text x="8" y="4" fill="#ffffff" font-size="8" font-weight="bold" filter="drop-shadow(0 1px 1px black)">
                ESP32 Node
              </text>
            </g>
          </svg>

          <!-- Floating Map Overlay Card / Legend -->
          <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 8px 12px; border-radius: var(--radius-md); font-size: 0.72rem; box-shadow: var(--shadow-md); display: flex; flex-direction: column; gap: 4px;">
            <div style="font-weight: 700; color: var(--color-primary-900);">
              ${farm.areaAcres || 2.5} Acres Groundnut (Kadiri-6)
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 10px; height: 10px; background: #52b788; border: 1px dashed #2d6a4f; display: inline-block;"></span>
                ${t('farm.mapLegendField')}
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #0077b6; display: inline-block;"></span>
                ${t('farm.mapLegendSensor')}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach map control listeners
    container.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
      if (currentZoom < 1.8) {
        currentZoom += 0.25;
        update();
      }
    });

    container.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
      if (currentZoom > 0.8) {
        currentZoom -= 0.25;
        update();
      }
    });

    container.querySelector('#layer-sat-btn')?.addEventListener('click', () => {
      activeLayer = 'satellite';
      update();
    });

    container.querySelector('#layer-ndvi-btn')?.addEventListener('click', () => {
      activeLayer = 'ndvi';
      update();
    });
  }

  update();
}
