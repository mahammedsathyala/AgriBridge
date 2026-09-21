import { t, getLocale, setLocale } from '../i18n/index.js';
import { showToast } from '../components/Toast.js';

export function renderSettingsPage(container) {
  let lowBandwidth = localStorage.getItem('agribridge_low_bw') === 'true';
  let consentBrics = localStorage.getItem('agribridge_consent_brics') !== 'false';
  let consentSat = localStorage.getItem('agribridge_consent_sat') !== 'false';
  let selectedUnits = localStorage.getItem('agribridge_units') || 'imperial';

  function render() {
    const currentLocale = getLocale();

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('settings.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('settings.subtitle')}</p>
        </div>

        <!-- Section 1: Regional & Units -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>🌐</span>
              <span>${t('settings.prefTitle')}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4);">
            <div class="form-group">
              <label class="form-label">${t('settings.language')}</label>
              <select id="opt-language" class="form-select">
                <option value="en" ${currentLocale === 'en' ? 'selected' : ''}>English</option>
                <option value="te" ${currentLocale === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('settings.units')}</label>
              <select id="opt-units" class="form-select">
                <option value="imperial" ${selectedUnits === 'imperial' ? 'selected' : ''}>
                  ${t('settings.imperialUnits')}
                </option>
                <option value="metric" ${selectedUnits === 'metric' ? 'selected' : ''}>
                  ${t('settings.metricUnits')}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 2: Low-Bandwidth & Offline Mode -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>📶</span>
              <span>${t('settings.networkTitle')}</span>
            </div>
            <span class="badge badge-sky">Android 2G/3G Friendly</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; color: var(--color-primary-900); font-size: 0.95rem;">
                  ${t('settings.lowBandwidthMode')}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 500px;">
                  ${t('settings.lowBandwidthDesc')}
                </div>
              </div>
              <input type="checkbox" id="chk-low-bw" ${lowBandwidth ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
              <div>
                <div style="font-weight: 700; color: var(--color-primary-900); font-size: 0.95rem;">
                  ${t('settings.offlineCache')}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  ${t('settings.offlineDesc')} (Stored: 4 advisories, 7-day weather)
                </div>
              </div>

              <button id="btn-clear-cache" class="btn btn-secondary btn-sm">
                🗑️ ${t('settings.clearCacheBtn')}
              </button>
            </div>
          </div>
        </div>

        <!-- Section 3: Privacy & Data-Sharing Consent -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>🔒</span>
              <span>${t('settings.privacyTitle')}</span>
            </div>
            <span class="badge badge-success">GDPR / DPDP Compliant</span>
          </div>

          <div style="background: var(--bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); font-size: 0.82rem; color: var(--text-secondary); margin-bottom: var(--space-4);">
            📢 <strong>${t('settings.privacyNotice')}</strong>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3); font-size: 0.88rem;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="chk-brics-consent" ${consentBrics ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <span>${t('settings.consentBrics')}</span>
            </label>

            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="chk-sat-consent" ${consentSat ? 'checked' : ''} style="width: 18px; height: 18px;" />
              <span>${t('settings.consentSatellite')}</span>
            </label>
          </div>
        </div>

        <!-- Section 4: Demo State Management -->
        <div class="card" style="border-color: #fde68a; background: #fffdf5;">
          <div class="card-header">
            <div class="card-title" style="color: #92400e;">
              <span>⚡</span>
              <span>${t('settings.resetTitle')}</span>
            </div>
          </div>

          <p style="font-size: 0.82rem; color: #78350f; margin-bottom: var(--space-4);">
            Resetting clears all custom farm edits, uploaded crop scans, completed advisories, and returns the platform to the baseline Kurnool groundnut demo dataset.
          </p>

          <div>
            <button id="btn-reset-all" class="btn btn-secondary btn-sm" style="border-color: #d97706; color: #92400e;">
              ↺ ${t('settings.resetBtn')}
            </button>
          </div>
        </div>
      </div>
    `;

    // Attach listeners
    container.querySelector('#opt-language')?.addEventListener('change', (e) => {
      setLocale(e.target.value);
      showToast(e.target.value === 'te' ? "భాష తెలుగుకి మార్చబడింది" : "Language set to English", "success");
    });

    container.querySelector('#opt-units')?.addEventListener('change', (e) => {
      localStorage.setItem('agribridge_units', e.target.value);
      showToast("Unit preferences saved", "info");
    });

    container.querySelector('#chk-low-bw')?.addEventListener('change', (e) => {
      lowBandwidth = e.target.checked;
      localStorage.setItem('agribridge_low_bw', lowBandwidth);
      if (lowBandwidth) {
        document.body.classList.add('low-bandwidth-mode');
        showToast("Low-bandwidth mode enabled (animations & heavy assets disabled)", "info");
      } else {
        document.body.classList.remove('low-bandwidth-mode');
        showToast("Standard bandwidth mode restored", "info");
      }
    });

    container.querySelector('#btn-clear-cache')?.addEventListener('click', () => {
      showToast(t('settings.cacheClearedToast'), 'info');
    });

    container.querySelector('#chk-brics-consent')?.addEventListener('change', (e) => {
      localStorage.setItem('agribridge_consent_brics', e.target.checked);
      showToast("Consent preferences updated", "info");
    });

    container.querySelector('#chk-sat-consent')?.addEventListener('change', (e) => {
      localStorage.setItem('agribridge_consent_sat', e.target.checked);
      showToast("Consent preferences updated", "info");
    });

    container.querySelector('#btn-reset-all')?.addEventListener('click', () => {
      localStorage.clear();
      showToast(t('settings.resetToast'), 'success');
      setTimeout(() => location.reload(), 600);
    });
  }

  render();
}
