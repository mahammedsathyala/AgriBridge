import { t, getLocale } from '../i18n/index.js';
import { renderFarmMap } from '../components/FarmMap.js';
import { farmService } from '../services/farmService.js';
import { sensorService } from '../services/sensorService.js';
import { showToast } from '../components/Toast.js';

// Mirror agrin-project/backend/engines/advisory_engine.py CROPS_DATABASE keys
export const CROPS_CATALOG = [
  { key: "groundnut", name: "Groundnut", variety: "K6 (Kadiri-6)", label: "Groundnut (Kadiri-6 / Arachis hypogaea)", te: "వేరుశనగ (Kadiri-6)", hi: "मूंगफली (Kadiri-6)" },
  { key: "pearl_millet", name: "Pearl Millet", variety: "Bajra (GHB-538)", label: "Pearl Millet (Bajra / Pennisetum glaucum)", te: "సజ్జలు (బాజ్రా)", hi: "बाजरा (GHB-538)" },
  { key: "pigeon_pea", name: "Pigeon Pea", variety: "Arhar (Asha ICPL 87119)", label: "Pigeon Pea (Arhar / Red Gram / Cajanus cajan)", te: "కందులు (అర్హర్)", hi: "अरहर / तुअर (Asha ICPL 87119)" },
  { key: "sorghum", name: "Sorghum", variety: "Jowar (CSH-16)", label: "Sorghum (Jowar / Sorghum bicolor)", te: "జొన్నలు (జోవర్)", hi: "ज्वार (CSH-16)" },
  { key: "chickpea", name: "Chickpea", variety: "Bengal Gram (JG-11)", label: "Chickpea (Bengal Gram / Cicer arietinum)", te: "శనగలు (బెంగాల్ గ్రామ్)", hi: "चना (JG-11 / Bengal Gram)" },
  { key: "green_gram", name: "Green Gram", variety: "Moong Bean (IPM-205-7)", label: "Green Gram (Moong Bean / Vigna radiata)", te: "పెసలు (మూంగ్)", hi: "मूंग दाल (IPM-205-7)" },
  { key: "finger_millet", name: "Finger Millet", variety: "Ragi (GPU-28)", label: "Finger Millet (Ragi / Eleusine coracana)", te: "రాగులు (తైదలు)", hi: "रागी / मडुआ (GPU-28)" },
  { key: "mustard_cover", name: "Indian Mustard", variety: "Pusa Bold (Brassica juncea)", label: "Indian Mustard (Bio-fumigant / Brassica)", te: "ఆవాలు (మస్టర్డ్)", hi: "सरसों (Pusa Bold)" },
  { key: "sesbania_dhaincha", name: "Dhaincha", variety: "Green Manure (Sesbania aculeata)", label: "Dhaincha (Green Manure / Sesbania)", te: "జీలుగు (దైంచా)", hi: "ढैंचा / हरी खाद (Sesbania)" }
];

export function renderMyFarmPage(container, { farm, onFarmUpdated }) {
  let isEditing = false;
  let isSyncing = false;
  let currentFarm = { ...farm };
  let sensorData = { ...farm.sensorNode };

  function render() {
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';
    const cropKey = (currentFarm.cropKey || currentFarm.crop || 'groundnut').toLowerCase().replace(/[\s-]/g, '_');
    const activeCropMeta = CROPS_CATALOG.find(c => c.key === cropKey || c.name.toLowerCase() === (currentFarm.crop || '').toLowerCase()) || CROPS_CATALOG[0];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
          <div>
            <h2 style="color: var(--color-primary-900);">${t('farm.title')}</h2>
            <p style="font-size: 0.88rem; color: var(--text-muted);">${t('farm.subtitle')}</p>
          </div>

          <button id="btn-edit-farm" class="btn btn-primary btn-sm">
            ✏️ ${t('farm.editFarm')}
          </button>
        </div>

        <!-- Interactive Map Panel -->
        <div id="farm-map-container"></div>

        <!-- 2-Column: Plot Details & IoT Sensor Section -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">
          <!-- Plot Details Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span>📋</span>
                <span>${t('farm.detailsTitle')}</span>
              </div>
              <span class="badge badge-success">Registered Parcel</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); font-size: 0.88rem;">
              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.farmName')}</div>
                <div style="font-weight: 700; color: var(--color-primary-900);">${currentFarm.farmName || 'Sathyala Farm'}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.farmerName')}</div>
                <div style="font-weight: 700; color: var(--color-primary-900);">${currentFarm.farmerName || 'Sathyala Farmer'}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.location')}</div>
                <div style="font-weight: 600;">${currentFarm.location}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.area')}</div>
                <div style="font-weight: 700; color: var(--color-primary-800);">${currentFarm.areaAcres || 2.5} ${t('overview.acres')}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.crop')}</div>
                <div style="font-weight: 700;">${
                  isTe && activeCropMeta.te 
                    ? activeCropMeta.te 
                    : (isHi && activeCropMeta.hi ? activeCropMeta.hi : `${activeCropMeta.name} (${activeCropMeta.variety})`)
                }</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.growthStage')}</div>
                <div style="font-weight: 600; color: var(--color-amber-600);">${
                  isTe ? 'పూత & ఊడలు దిగే దశ' : (isHi ? 'फूल आने और सुइयां (Pegs) बनने की अवस्था' : currentFarm.growthStage)
                }</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.sowingDate')}</div>
                <div style="font-weight: 600;">${currentFarm.sowingDate || '2026-08-07'} (${currentFarm.cropAgeDays || 42} ${t('overview.days')})</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.soilType')}</div>
                <div style="font-weight: 600;">${
                  isTe ? 'ఎర్ర నేలలు (Red loamy)' : (isHi ? 'लाल दोमट मिट्टी (Red loamy)' : currentFarm.soilType)
                }</div>
              </div>

              <div style="grid-column: span 2;">
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.irrigationType')}</div>
                <div style="font-weight: 600;">${
                  isTe ? 'బోరుబావి & డ్రిప్ పద్ధతి' : (isHi ? 'नलकूप और ड्रिप सिंचाई विधि' : currentFarm.irrigationType)
                }</div>
              </div>
            </div>
          </div>

          <!-- Connect Sensor Section -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span>📡</span>
                <span>${t('farm.sensorTitle')}</span>
              </div>
              <span class="badge badge-success">● ${t('farm.sensorOnline')}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-subtle); padding: var(--space-3); border-radius: var(--radius-md);">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${t('farm.deviceId')}</div>
                  <div style="font-family: monospace; font-weight: 800; color: var(--color-primary-900); font-size: 1.05rem;">
                    ${sensorData.id}
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${t('farm.battery')}</div>
                  <div style="font-weight: 700; color: var(--color-success-700);">
                    🔋 ${sensorData.batteryPercent}%
                  </div>
                </div>
              </div>

              <!-- Sensor Metrics Grid -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); text-align: center;">
                <div style="background: var(--color-sky-50); border: 1px solid var(--color-sky-100); padding: var(--space-3); border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--color-sky-800); font-weight: 600;">${t('farm.sensorMoisture')}</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-sky-700); margin: 2px 0;">
                    ${sensorData.soilMoisture}%
                  </div>
                  <div style="font-size: 0.65rem; color: var(--text-muted);">Optimal: 30-45%</div>
                </div>

                <div style="background: var(--color-amber-50); border: 1px solid var(--color-amber-100); padding: var(--space-3); border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--color-amber-800); font-weight: 600;">${t('farm.sensorTemp')}</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-amber-700); margin: 2px 0;">
                    ${sensorData.soilTemp}°C
                  </div>
                  <div style="font-size: 0.65rem; color: var(--text-muted);">Root zone 15cm</div>
                </div>

                <div style="background: var(--color-primary-50); border: 1px solid var(--color-primary-100); padding: var(--space-3); border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--color-primary-800); font-weight: 600;">${t('farm.sensorHumidity')}</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-700); margin: 2px 0;">
                    ${sensorData.humidity}%
                  </div>
                  <div style="font-size: 0.65rem; color: var(--text-muted);">Canopy level</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-3);">
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  ${t('farm.lastSync')}: <strong>${sensorData.lastSync}</strong>
                </div>

                <button id="btn-sync-sensor" class="btn btn-secondary btn-sm" ${isSyncing ? 'disabled' : ''}>
                  ${isSyncing ? `⏳ ${t('farm.syncing')}` : `🔄 ${t('farm.syncNow')}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Farm Modal -->
        ${isEditing ? `
          <div class="modal-overlay" id="edit-farm-modal">
            <div class="modal-dialog">
              <button id="modal-close-x" class="modal-close-btn">✕</button>
              <h3 style="color: var(--color-primary-900); margin-bottom: var(--space-4);">
                ✏️ ${t('farm.editFarm')}
              </h3>

              <form id="edit-farm-form">
                <div class="form-group">
                  <label class="form-label">${t('farm.farmerName')}</label>
                  <input type="text" id="inp-farmer-name" class="form-input" value="${currentFarm.farmerName || ''}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">${t('farm.farmName')}</label>
                  <input type="text" id="inp-farm-name" class="form-input" value="${currentFarm.farmName || ''}" required />
                </div>

                <!-- OpenStreetMap Nominatim Location Search -->
                <div class="form-group" style="position: relative;">
                  <label class="form-label">🔍 Search Location (OpenStreetMap Nominatim)</label>
                  <div style="display: flex; gap: var(--space-2);">
                    <input
                      type="text"
                      id="inp-location-search"
                      class="form-input"
                      placeholder="Search city, town, mandal (e.g. Badvel, Kurnool, Kadapa)..."
                      autocomplete="off"
                    />
                    <button type="button" id="btn-search-location" class="btn btn-secondary btn-sm" style="white-space: nowrap;">
                      🔍 Search
                    </button>
                  </div>
                  <div id="location-search-status" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: none;"></div>
                  <ul id="location-search-results" style="display: none; list-style: none; margin: 4px 0 0; padding: 0; position: absolute; top: 100%; left: 0; right: 0; background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-md); max-height: 180px; overflow-y: auto; z-index: 1000; box-shadow: var(--shadow-lg);"></ul>
                </div>

                <div class="form-group">
                  <label class="form-label">${t('farm.location')}</label>
                  <input type="text" id="inp-location" class="form-input" value="${currentFarm.location || ''}" required />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                  <div class="form-group">
                    <label class="form-label">Latitude (°N)</label>
                    <input type="number" step="0.000001" id="inp-lat" class="form-input" value="${currentFarm.coordinates?.lat ?? 14.7384}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Longitude (°E)</label>
                    <input type="number" step="0.000001" id="inp-lng" class="form-input" value="${currentFarm.coordinates?.lng ?? 78.9928}" required />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                  <div class="form-group">
                    <label class="form-label">${t('farm.crop')}</label>
                    <select id="inp-crop" class="form-select">
                      ${CROPS_CATALOG.map(c => {
                        const isSelected = (currentFarm.cropKey === c.key) || 
                          ((currentFarm.crop || '').toLowerCase() === c.name.toLowerCase()) || 
                          ((currentFarm.crop || '').toLowerCase().replace(/[\s-]/g, '_') === c.key);
                        const optLabel = isTe && c.te ? `${c.te} — ${c.label}` : (isHi && c.hi ? `${c.hi} — ${c.label}` : c.label);
                        return `<option value="${c.key}" ${isSelected ? 'selected' : ''}>${optLabel}</option>`;
                      }).join('')}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">${t('farm.area')} (${t('overview.acres')})</label>
                    <input type="number" step="0.1" id="inp-area" class="form-input" value="${currentFarm.areaAcres || 2.5}" required />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                  <div class="form-group">
                    <label class="form-label">${t('farm.sowingDate')}</label>
                    <input type="date" id="inp-sowing" class="form-input" value="${currentFarm.sowingDate || '2026-08-07'}" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">${t('farm.soilType')}</label>
                    <select id="inp-soil" class="form-select">
                      <option value="Red loamy soil" ${currentFarm.soilType?.includes('Red') ? 'selected' : ''}>Red loamy soil</option>
                      <option value="Black cotton soil">Black cotton soil</option>
                      <option value="Alluvial soil">Alluvial soil</option>
                      <option value="Sandy loam">Sandy loam</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">${t('farm.irrigationType')}</label>
                  <select id="inp-irrigation" class="form-select">
                    <option value="Borewell with Micro-Drip" selected>Borewell with Micro-Drip</option>
                    <option value="Canal Furrow Irrigation">Canal Furrow Irrigation</option>
                    <option value="Rainfed (Dryland)">Rainfed (Dryland)</option>
                    <option value="Overhead Sprinkler">Overhead Sprinkler</option>
                  </select>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-5);">
                  <button type="button" id="btn-cancel-edit" class="btn btn-secondary">
                    ${t('farm.cancel')}
                  </button>
                  <button type="submit" class="btn btn-primary">
                    💾 ${t('farm.saveFarm')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Render interactive Farm Map
    const mapContainer = container.querySelector('#farm-map-container');
    if (mapContainer) {
      renderFarmMap(mapContainer, {
        farm: currentFarm,
        onFarmUpdated: (updated) => {
          currentFarm = updated;
          if (onFarmUpdated) onFarmUpdated(updated);
          render();
        }
      });
    }

    // Attach Edit button listener
    container.querySelector('#btn-edit-farm')?.addEventListener('click', () => {
      isEditing = true;
      render();
    });

    // Attach Modal Close / Cancel
    container.querySelector('#modal-close-x')?.addEventListener('click', () => {
      isEditing = false;
      render();
    });

    container.querySelector('#btn-cancel-edit')?.addEventListener('click', () => {
      isEditing = false;
      render();
    });

    // Wire OpenStreetMap Nominatim location search
    const searchInp = container.querySelector('#inp-location-search');
    const searchBtn = container.querySelector('#btn-search-location');
    const searchStatus = container.querySelector('#location-search-status');
    const searchList = container.querySelector('#location-search-results');

    async function executeLocationSearch() {
      if (!searchInp) return;
      const query = searchInp.value.trim();
      if (!query || query.length < 2) return;

      if (searchStatus) {
        searchStatus.style.display = 'block';
        searchStatus.textContent = 'Searching OpenStreetMap Nominatim...';
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('Nominatim search failed');
        const results = await res.json();

        if (searchStatus) searchStatus.style.display = 'none';
        if (!searchList) return;
        searchList.innerHTML = '';

        if (!results || results.length === 0) {
          searchList.innerHTML = '<li style="padding: 10px 14px; font-size: 0.8rem; color: var(--text-muted);">No locations found</li>';
          searchList.style.display = 'block';
          return;
        }

        results.forEach((item) => {
          const li = document.createElement('li');
          li.style.cssText = 'padding: 8px 12px; font-size: 0.82rem; cursor: pointer; border-bottom: 1px solid var(--border-subtle, #f1f5f9); display: flex; flex-direction: column; gap: 2px;';
          const shortName = item.display_name.split(',').slice(0, 3).join(',').trim();
          li.innerHTML = `
            <span style="font-weight: 600; color: var(--color-primary-900);">📍 ${shortName}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.display_name}</span>
          `;
          li.addEventListener('mouseenter', () => li.style.background = '#f8fafc');
          li.addEventListener('mouseleave', () => li.style.background = 'transparent');
          li.addEventListener('click', () => {
            const latVal = parseFloat(item.lat);
            const lonVal = parseFloat(item.lon);
            const locInp = container.querySelector('#inp-location');
            const latInp = container.querySelector('#inp-lat');
            const lngInp = container.querySelector('#inp-lng');
            if (locInp) locInp.value = shortName;
            if (latInp) latInp.value = latVal.toFixed(6);
            if (lngInp) lngInp.value = lonVal.toFixed(6);
            searchList.style.display = 'none';
            showToast(`📍 Selected: ${shortName} (${latVal.toFixed(4)}°, ${lonVal.toFixed(4)}°)`, 'info');
          });
          searchList.appendChild(li);
        });
        searchList.style.display = 'block';
      } catch (err) {
        console.warn("Nominatim search error:", err);
        if (searchStatus) {
          searchStatus.style.display = 'block';
          searchStatus.textContent = 'Could not reach Nominatim. You can enter location & coordinates manually.';
        }
      }
    }

    searchBtn?.addEventListener('click', executeLocationSearch);
    searchInp?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeLocationSearch();
      }
    });

    // Attach Save Form listener
    const editForm = container.querySelector('#edit-farm-form');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const latInput = parseFloat(container.querySelector('#inp-lat')?.value);
        const lngInput = parseFloat(container.querySelector('#inp-lng')?.value);

        const selectedCropKey = container.querySelector('#inp-crop').value;
        const selectedCrop = CROPS_CATALOG.find(c => c.key === selectedCropKey) || CROPS_CATALOG[0];

        const updates = {
          farmerName: container.querySelector('#inp-farmer-name').value,
          farmName: container.querySelector('#inp-farm-name').value,
          location: container.querySelector('#inp-location').value,
          coordinates: {
            lat: !isNaN(latInput) ? latInput : (currentFarm.coordinates?.lat ?? 14.7384),
            lng: !isNaN(lngInput) ? lngInput : (currentFarm.coordinates?.lng ?? 78.9928)
          },
          crop: selectedCrop.name,
          cropKey: selectedCrop.key,
          cropVariety: selectedCrop.variety,
          areaAcres: parseFloat(container.querySelector('#inp-area').value),
          sowingDate: container.querySelector('#inp-sowing').value,
          soilType: container.querySelector('#inp-soil').value,
          irrigationType: container.querySelector('#inp-irrigation').value
        };

        const updated = await farmService.updateFarmProfile(updates);
        currentFarm = updated;
        isEditing = false;
        if (onFarmUpdated) onFarmUpdated(updated);
        render();
        showToast("Farm details & coordinates saved successfully!", "success");
      });
    }

    // Attach Sensor Sync listener
    container.querySelector('#btn-sync-sensor')?.addEventListener('click', async () => {
      isSyncing = true;
      render();
      try {
        const fresh = await sensorService.syncTelemetry();
        sensorData = fresh;
        isSyncing = false;
        render();
        showToast("AGRI-ESP32-001 synchronized with field node!", "success");
      } catch (err) {
        isSyncing = false;
        render();
        showToast("Sensor sync failed", "error");
      }
    });
  }

  render();
}
