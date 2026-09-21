import { t, getLocale } from '../i18n/index.js';
import { bricsService } from '../services/bricsService.js';
import { showToast } from './Toast.js';

export function renderDataCooperationView(container) {
  let countries = [];
  let graph = null;
  let statusList = [];
  let exchangeResult = null;
  let isSimulating = false;

  let selectedSource = 'IN';
  let selectedTarget = 'BR';
  let selectedIndicator = 'Crop Health & Soil Moisture Telemetry';

  async function loadData() {
    countries = await bricsService.getCountries();
    graph = await bricsService.getNetworkGraph();
    statusList = await bricsService.getStatus();
    render();
  }

  function render() {
    const isTe = getLocale() === 'te';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Title & Explainer Banner -->
        <div style="background: linear-gradient(135deg, #081c15 0%, #1b4332 100%); color: white; padding: var(--space-6); border-radius: var(--radius-xl); box-shadow: var(--shadow-md);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 1.5rem;">🌐</span>
            <span class="badge badge-primary" style="background: rgba(255,255,255,0.2); color: white;">
              BRICS AgriN Architecture
            </span>
          </div>
          <h2 style="color: white; font-size: 1.6rem; margin-bottom: var(--space-2);">
            ${t('brics.title')}
          </h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 0.95rem; max-width: 850px; line-height: 1.5;">
            ${t('brics.intro')}
          </p>
        </div>

        <!-- Interactive Topology Diagram Canvas -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
            <div>
              <div class="card-title">
                <span>🛰️</span>
                <span>${t('brics.networkTitle')}</span>
              </div>
              <div class="card-subtitle">${t('brics.networkDesc')}</div>
            </div>

            <div style="display: flex; gap: var(--space-3); font-size: 0.75rem; align-items: center;">
              <span style="display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #2a9d8f;"></span>
                ${t('brics.legendActive')}
              </span>
              <span style="display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #e9c46a;"></span>
                ${t('brics.legendPartner')}
              </span>
            </div>
          </div>

          <!-- SVG Topology Graph -->
          <div class="network-canvas-wrapper">
            <svg viewBox="0 0 460 340" class="network-svg">
              <defs>
                <!-- Line glow filter -->
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <!-- Network Links -->
              ${graph ? graph.links.map(l => {
                const s = graph.nodes.find(n => n.id === l.source);
                const tgt = graph.nodes.find(n => n.id === l.target);
                if (!s || !tgt) return '';
                return `
                  <line 
                    x1="${s.x}" y1="${s.y}" x2="${tgt.x}" y2="${tgt.y}" 
                    stroke="${l.active ? '#52b788' : '#3d5a45'}" 
                    stroke-width="${l.active ? '2' : '1.2'}" 
                    stroke-dasharray="${l.active ? '4 3' : '2 2'}" 
                    opacity="${l.active ? '0.85' : '0.4'}"
                  />
                  ${l.active ? `
                    <!-- Animated data packet pulse traveling along link -->
                    <circle r="2.5" fill="#e9c46a">
                      <animateMotion path="M ${s.x} ${s.y} L ${tgt.x} ${tgt.y}" dur="${2 + Math.random()}s" repeatCount="indefinite" />
                    </circle>
                  ` : ''}
                `;
              }).join('') : ''}

              <!-- Network Nodes -->
              ${graph ? graph.nodes.map(n => `
                <g transform="translate(${n.x}, ${n.y})">
                  ${n.pulse ? `
                    <circle cx="0" cy="0" r="18" fill="${n.color}" opacity="0.25" class="pulse-circle" />
                  ` : ''}
                  <circle 
                    cx="0" cy="0" r="${n.type === 'country' ? '12' : '9'}" 
                    fill="${n.color}" 
                    stroke="#ffffff" 
                    stroke-width="2" 
                    filter="url(#glow)"
                  />
                  <rect x="-48" y="14" width="96" height="18" rx="4" fill="rgba(8, 28, 21, 0.85)" />
                  <text x="0" y="26" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">
                    ${n.label}
                  </text>
                </g>
              `).join('') : ''}
            </svg>
          </div>
        </div>

        <!-- 5 Country Adapter Data Cards -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <h3 style="color: var(--color-primary-900);">
              🌍 BRICS National Adapter Registry
            </h3>
            <span class="badge badge-soil">5 Nations Active</span>
          </div>

          <div class="country-cards-grid">
            ${countries.map(c => `
              <div class="card country-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.4rem;">${c.flag}</span>
                    <div>
                      <div style="font-weight: 800; color: var(--color-primary-900); font-size: 1rem;">
                        ${isTe ? c.nameTe : c.name}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.1;">
                        ${c.institution}
                      </div>
                    </div>
                  </div>
                  <span class="badge ${c.statusType === 'active' ? 'badge-success' : 'badge-primary'}">
                    ${c.status}
                  </span>
                </div>

                <div style="font-size: 0.82rem; margin: var(--space-2) 0;">
                  <strong>🌾 Priority Crops:</strong> 
                  <span style="color: var(--color-primary-800);">
                    ${(isTe ? c.cropsTe : c.crops).join(', ')}
                  </span>
                </div>

                <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35; margin-bottom: var(--space-2);">
                  <strong>📡 Data Contributed:</strong> ${isTe ? c.contributedDataTe : c.contributedData}
                </div>

                <div style="font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 6px;">
                  🗣️ <strong>Languages:</strong> ${c.languages.join(', ')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Protocol & Interoperability Status Panel -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>🛡️</span>
              <span>${t('brics.statusTitle')}</span>
            </div>
            <span class="badge badge-success">Protocol v1.4 Active</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3);">
            ${statusList.map(s => `
              <div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-primary-900);">
                    ${t(s.nameKey)}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">
                    ${s.version || s.latency || s.models || s.langs || s.standard || s.ledger}
                  </div>
                </div>
                <span class="badge badge-success">
                  ● ${isTe ? s.statusTe : s.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Live Sample Data-Exchange Simulator -->
        <div class="card" id="exchange-simulator">
          <div class="card-header">
            <div>
              <div class="card-title">
                <span>⚡</span>
                <span>${t('brics.simulatorTitle')}</span>
              </div>
              <div class="card-subtitle">${t('brics.simulatorDesc')}</div>
            </div>
            <span class="badge badge-soil">Interactive Sandbox</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
            <!-- Source Selector -->
            <div>
              <label class="form-label">${t('brics.sourceLabel')}</label>
              <select id="sim-source" class="form-select">
                ${countries.map(c => `
                  <option value="${c.code}" ${c.code === selectedSource ? 'selected' : ''}>
                    ${c.flag} ${isTe ? c.nameTe : c.name} (${c.code})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Indicator Selector -->
            <div>
              <label class="form-label">${t('brics.dataTypeLabel')}</label>
              <select id="sim-indicator" class="form-select">
                <option value="Crop Health Index (NDVI)" selected>Crop Health Index (NDVI)</option>
                <option value="Soil Moisture Telemetry">Soil Moisture Telemetry</option>
                <option value="Rainfall Convective Forecast">Rainfall Convective Forecast</option>
                <option value="Tikka Early Spot Risk Model">Tikka Early Spot Risk Model</option>
                <option value="Semi-Arid Drought Resilience Metric">Semi-Arid Drought Resilience Metric</option>
              </select>
            </div>

            <!-- Destination Selector -->
            <div>
              <label class="form-label">${t('brics.destLabel')}</label>
              <select id="sim-target" class="form-select">
                ${countries.map(c => `
                  <option value="${c.code}" ${c.code === selectedTarget ? 'selected' : ''}>
                    ${c.flag} ${isTe ? c.nameTe : c.name} (${c.code})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-4);">
            <button id="btn-simulate-exchange" class="btn btn-primary" ${isSimulating ? 'disabled' : ''}>
              ${isSimulating ? `⏳ ${t('brics.simulatingBtn')}` : `🚀 ${t('brics.simulateBtn')}`}
            </button>
          </div>

          <!-- Exchange Results Payload Container -->
          ${exchangeResult ? `
            <div style="background: #081c15; color: #74c69d; border-radius: var(--radius-md); padding: var(--space-4); font-family: monospace; font-size: 0.8rem; overflow-x: auto; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
                <span style="color: #52b788; font-weight: bold;">✓ ${t('brics.exchangeSuccess')}</span>
                <span style="color: #95d5b2; font-size: 0.72rem;">${t('brics.schemaNote')}</span>
              </div>
              <pre style="margin: 0; line-height: 1.4;">${JSON.stringify(exchangeResult.payload, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Attach simulation listeners
    const sourceEl = container.querySelector('#sim-source');
    const targetEl = container.querySelector('#sim-target');
    const indicatorEl = container.querySelector('#sim-indicator');
    const simBtn = container.querySelector('#btn-simulate-exchange');

    if (sourceEl) sourceEl.addEventListener('change', (e) => { selectedSource = e.target.value; });
    if (targetEl) targetEl.addEventListener('change', (e) => { selectedTarget = e.target.value; });
    if (indicatorEl) indicatorEl.addEventListener('change', (e) => { selectedIndicator = e.target.value; });

    if (simBtn) {
      simBtn.addEventListener('click', async () => {
        isSimulating = true;
        render();
        try {
          const res = await bricsService.simulateDataExchange(selectedSource, selectedTarget, selectedIndicator);
          exchangeResult = res;
          isSimulating = false;
          render();
          showToast(t('brics.exchangeSuccess'), 'success');
        } catch (err) {
          isSimulating = false;
          render();
          showToast('Data exchange simulation failed', 'error');
        }
      });
    }
  }

  loadData();
}
