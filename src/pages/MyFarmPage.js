import { t, getLocale } from '../i18n/index.js';
import { renderFarmMap } from '../components/FarmMap.js';
import { farmService } from '../services/farmService.js';
import { sensorService } from '../services/sensorService.js';
import { showToast } from '../components/Toast.js';

export function renderMyFarmPage(container, { farm, onFarmUpdated }) {
  let isEditing = false;
  let isSyncing = false;
  let currentFarm = { ...farm };
  let sensorData = { ...farm.sensorNode };

  function render() {
    const isTe = getLocale() === 'te';

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
                <div style="font-weight: 600;">${isTe ? 'కర్నూలు, ఆంధ్రప్రదేశ్' : currentFarm.location}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.area')}</div>
                <div style="font-weight: 700; color: var(--color-primary-800);">${currentFarm.areaAcres || 2.5} ${t('overview.acres')}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.crop')}</div>
                <div style="font-weight: 700;">${isTe ? 'వేరుశనగ (Kadiri-6)' : currentFarm.crop}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.growthStage')}</div>
                <div style="font-weight: 600; color: var(--color-amber-600);">${isTe ? 'పూత & ఊడలు దిగే దశ' : currentFarm.growthStage}</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.sowingDate')}</div>
                <div style="font-weight: 600;">${currentFarm.sowingDate || '2026-08-07'} (${currentFarm.cropAgeDays || 42} ${t('overview.days')})</div>
              </div>

              <div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.soilType')}</div>
                <div style="font-weight: 600;">${isTe ? 'ఎర్ర నేలలు (Red loamy)' : currentFarm.soilType}</div>
              </div>

              <div style="grid-column: span 2;">
                <div style="color: var(--text-muted); font-size: 0.75rem;">${t('farm.irrigationType')}</div>
                <div style="font-weight: 600;">${isTe ? 'బోరుబావి & డ్రిప్ పద్ధతి' : currentFarm.irrigationType}</div>
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

                <div class="form-group">
                  <label class="form-label">${t('farm.location')}</label>
                  <input type="text" id="inp-location" class="form-input" value="${currentFarm.location || ''}" required />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                  <div class="form-group">
                    <label class="form-label">${t('farm.crop')}</label>
                    <input type="text" id="inp-crop" class="form-input" value="${currentFarm.crop || ''}" required />
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
      renderFarmMap(mapContainer, { farm: currentFarm });
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

    // Attach Save Form listener
    const editForm = container.querySelector('#edit-farm-form');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = {
          farmerName: container.querySelector('#inp-farmer-name').value,
          farmName: container.querySelector('#inp-farm-name').value,
          location: container.querySelector('#inp-location').value,
          crop: container.querySelector('#inp-crop').value,
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
        showToast("Farm details updated and saved successfully!", "success");
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
