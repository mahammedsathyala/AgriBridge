import { t } from '../i18n/index.js';
import { farmService } from '../services/farmService.js';
import { showToast } from './Toast.js';

export function renderFarmMap(container, { farm, zoom = 1, layer = 'satellite', onFarmUpdated }) {
  let currentZoom = zoom;
  let activeLayer = layer; // 'satellite' | 'ndvi'
  let pinX = 255;
  let pinY = 210;

  function update() {
    const lat = farm.coordinates ? farm.coordinates.lat : 14.7384;
    const lng = farm.coordinates ? farm.coordinates.lng : 78.9928;
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
              ${t('farm.mapCoords')}: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E • ${farm.location || 'Andhra Pradesh'}
              <span style="font-size: 0.72rem; color: var(--color-primary-700); margin-left: 6px;">(Click map or drag pin to relocate)</span>
            </div>
          </div>

          <!-- Layer Switcher -->
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <div class="chart-filters">
              <button id="layer-sat-btn" class="chart-filter-btn ${activeLayer === 'satellite' ? 'active' : ''}" aria-label="${t('farm.layerSatellite')} View" aria-pressed="${activeLayer === 'satellite'}">
                🛰️ ${t('farm.layerSatellite')}
              </button>
              <button id="layer-ndvi-btn" class="chart-filter-btn ${activeLayer === 'ndvi' ? 'active' : ''}" aria-label="${t('farm.layerNdvi')} Vegetation Health View" aria-pressed="${activeLayer === 'ndvi'}">
                🟢 ${t('farm.layerNdvi')}
              </button>
            </div>

            <!-- Zoom Controls -->
            <div style="display: flex; gap: 2px;">
              <button id="btn-zoom-in" class="btn btn-secondary btn-sm" title="${t('farm.zoomIn')}" aria-label="Zoom in on map">
                +
              </button>
              <button id="btn-zoom-out" class="btn btn-secondary btn-sm" title="${t('farm.zoomOut')}" aria-label="Zoom out on map">
                −
              </button>
            </div>
          </div>
        </div>

        <!-- SVG Map Viewport -->
        <div style="position: relative; width: 100%; height: 320px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-medium); background: #081c15;">
          <svg id="farm-map-svg" viewBox="${vbX} ${vbY} ${vbWidth} ${vbHeight}" style="width: 100%; height: 100%; display: block; cursor: crosshair; user-select: none;" role="img" aria-label="Interactive Farm Boundary Map of ${farm.farmName || 'Sathyala Farm'}">
            <defs>
              <!-- Satellite Terrain Pattern -->
              <linearGradient id="satGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2d4a34" />
                <stop offset="50%" stop-color="#3d5a42" />
                <stop offset="100%" stop-color="#1b4332" />
              </linearGradient>

              <!-- Radial Depth Vignette with primary-800 (#1b4332) & primary-900 (#081c15) -->
              <radialGradient id="mapVignetteGrad" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stop-color="#2d6a4f" stop-opacity="0.1" />
                <stop offset="60%" stop-color="#1b4332" stop-opacity="0.45" />
                <stop offset="100%" stop-color="#081c15" stop-opacity="0.85" />
              </radialGradient>

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

            <!-- Radial Depth Vignette Overlay (Task 4) -->
            <rect width="600" height="360" fill="url(#mapVignetteGrad)" />

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

            <!-- Crop Rows within plot with subtle shading -->
            <line x1="190" y1="160" x2="330" y2="150" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
            <line x1="188" y1="185" x2="328" y2="175" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
            <line x1="185" y1="210" x2="325" y2="200" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
            <line x1="182" y1="235" x2="322" y2="225" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
            <line x1="180" y1="260" x2="320" y2="250" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />

            <!-- Farm Center Pin & Live Status Pulse (Task 4) -->
            <g id="farm-center-pin" transform="translate(${pinX}, ${pinY})" style="cursor: grab;" tabindex="0" role="button" aria-label="Farm marker: ${farm.farmName || 'Sathyala Farm'}. Drag or click to relocate">
              <circle cx="0" cy="0" r="14" fill="rgba(220, 38, 38, 0.35)" class="live-map-marker" />
              <circle cx="0" cy="0" r="7" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
              <path d="M 0 0 L 0 -12" stroke="#dc2626" stroke-width="2" />
              <rect x="-42" y="-36" width="84" height="20" rx="4" fill="rgba(8, 28, 21, 0.92)" stroke="rgba(255,255,255,0.18)" stroke-width="0.8" />
              <text x="0" y="-22" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">
                ${farm.farmName || 'Sathyala Farm'}
              </text>
            </g>

            <!-- IoT Sensor Node Marker -->
            <g transform="translate(215, 175)" tabindex="0" role="img" aria-label="IoT Sensor Node AGRI-ESP32-001 Location">
              <circle cx="0" cy="0" r="10" fill="rgba(0, 119, 182, 0.35)" class="pulse-circle" />
              <circle cx="0" cy="0" r="5" fill="#0077b6" stroke="#ffffff" stroke-width="1.5" />
              <text x="8" y="4" fill="#ffffff" font-size="8" font-weight="bold" filter="drop-shadow(0 1px 1px black)">
                ESP32 Node
              </text>
            </g>
          </svg>

          <!-- Floating Map Overlay Card / Legend -->
          <div id="farm-map-overlay-card" style="position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 8px 12px; border-radius: var(--radius-md); font-size: 0.72rem; box-shadow: var(--shadow-md); display: flex; flex-direction: column; gap: 4px; pointer-events: auto;">
            <div style="font-weight: 700; color: var(--color-primary-900);">
              ${farm.areaAcres || 2.5} Acres ${farm.crop || 'Groundnut'}
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

    // Map Click & Drag Handler to compute lat/lng from SVG position
    const svgEl = container.querySelector('#farm-map-svg');
    const pinEl = container.querySelector('#farm-center-pin');
    let isDraggingPin = false;

    async function applyCoordinateChange(svgX, svgY) {
      pinX = Math.round(svgX);
      pinY = Math.round(svgY);

      const baseLat = farm.coordinates?.lat ?? 14.7384;
      const baseLng = farm.coordinates?.lng ?? 78.9928;
      const degPerPx = 0.0001; // ~10m per pixel at farm scale
      const deltaX = svgX - 300;
      const deltaY = svgY - 180;

      const newLat = parseFloat((baseLat - (deltaY * degPerPx) / currentZoom).toFixed(6));
      const newLng = parseFloat((baseLng + (deltaX * degPerPx) / currentZoom).toFixed(6));

      try {
        const updated = await farmService.updateFarmProfile({
          coordinates: { lat: newLat, lng: newLng }
        });
        showToast(`📍 Marker updated: ${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E`, "info");
        if (onFarmUpdated) {
          onFarmUpdated(updated);
        } else {
          farm.coordinates = { lat: newLat, lng: newLng };
          update();
        }
      } catch (err) {
        console.error("Failed to update farm marker position:", err);
      }
    }

    if (svgEl) {
      // Click anywhere on map to relocate pin
      svgEl.addEventListener('click', (e) => {
        if (e.target.closest('#farm-map-overlay-card') || e.target.closest('button')) return;
        const rect = svgEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const currentVbWidth = 600 / currentZoom;
        const currentVbHeight = 360 / currentZoom;
        const currentVbX = (600 - currentVbWidth) / 2;
        const currentVbY = (360 - currentVbHeight) / 2;

        const svgX = currentVbX + (clickX / rect.width) * currentVbWidth;
        const svgY = currentVbY + (clickY / rect.height) * currentVbHeight;

        applyCoordinateChange(svgX, svgY);
      });

      // Drag pin support
      if (pinEl) {
        pinEl.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          isDraggingPin = true;
          pinEl.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDraggingPin) return;
          const rect = svgEl.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          const currentVbWidth = 600 / currentZoom;
          const currentVbHeight = 360 / currentZoom;
          const currentVbX = (600 - currentVbWidth) / 2;
          const currentVbY = (360 - currentVbHeight) / 2;

          const svgX = currentVbX + (clickX / rect.width) * currentVbWidth;
          const svgY = currentVbY + (clickY / rect.height) * currentVbHeight;
          pinEl.setAttribute('transform', `translate(${svgX}, ${svgY})`);
        });

        window.addEventListener('mouseup', (e) => {
          if (!isDraggingPin) return;
          isDraggingPin = false;
          pinEl.style.cursor = 'grab';

          const rect = svgEl.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          const currentVbWidth = 600 / currentZoom;
          const currentVbHeight = 360 / currentZoom;
          const currentVbX = (600 - currentVbWidth) / 2;
          const currentVbY = (360 - currentVbHeight) / 2;

          const svgX = currentVbX + (clickX / rect.width) * currentVbWidth;
          const svgY = currentVbY + (clickY / rect.height) * currentVbHeight;
          applyCoordinateChange(svgX, svgY);
        });
      }
    }

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

