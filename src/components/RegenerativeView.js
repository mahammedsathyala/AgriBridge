import { t, getLocale } from '../i18n/index.js';
import { defaultRegenerativePractices, defaultRegenerativeMetrics } from '../data/mockRegenerative.js';
import { showToast } from './Toast.js';

const STORAGE_KEY = 'agribridge_regen_plan';

export function renderRegenerativeView(container) {
  let practices = [...defaultRegenerativePractices];

  // Restore stored practice states if available
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const addedIds = JSON.parse(stored);
      practices = practices.map(p => ({
        ...p,
        inPlan: addedIds.includes(p.id)
      }));
    }
  } catch (e) {}

  function calculateScore() {
    let score = defaultRegenerativeMetrics.baseScore;
    practices.forEach(p => {
      if (p.inPlan) score += p.scoreImpact;
    });
    return Math.min(100, score);
  }

  function savePlan() {
    try {
      const addedIds = practices.filter(p => p.inPlan).map(p => p.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addedIds));
    } catch (e) {}
  }

  function render() {
    const isTe = getLocale() === 'te';
    const currentScore = calculateScore();
    const targetScore = defaultRegenerativeMetrics.targetScore;
    const addedCount = practices.filter(p => p.inPlan).length;

    // Circumference for circular gauge
    const radius = 64;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (currentScore / 100) * circ;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('regen.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('regen.subtitle')}</p>
        </div>

        <!-- Top Summary Row: Score Gauge + Progress Pillars -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
          <!-- Gauge Card -->
          <div class="card score-gauge-container">
            <div style="font-weight: 700; color: var(--color-primary-900); margin-bottom: var(--space-2);">
              ${t('regen.scoreTitle')}
            </div>

            <div class="gauge-circle">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <!-- Background track -->
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--border-subtle)" stroke-width="12" />
                <!-- Active score stroke -->
                <circle 
                  cx="80" cy="80" r="${radius}" 
                  fill="none" 
                  stroke="#2d6a4f" 
                  stroke-width="12" 
                  stroke-linecap="round"
                  stroke-dasharray="${circ}" 
                  stroke-dashoffset="${offset}"
                  transform="rotate(-90 80 80)"
                  style="transition: stroke-dashoffset 0.8s ease;"
                />
              </svg>
              <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                <span class="gauge-score-text">${currentScore}</span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">
                  / 100
                </span>
              </div>
            </div>

            <div style="margin-top: var(--space-2); display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-success">🎯 ${t('regen.targetScoreLabel')}: ${targetScore}/100</span>
              <span class="badge badge-soil">${addedCount} / ${practices.length} Practices</span>
            </div>

            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: var(--space-3); line-height: 1.4;">
              ${t('regen.scoreExplain')}
            </p>
          </div>

          <!-- 5 Progress Tracker Pillars -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span>📊</span>
                <span>Pillar Progress Tracker</span>
              </div>
              <span class="badge badge-primary">Kurnool Baseline</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${defaultRegenerativeMetrics.indicators.map(ind => {
                // Boost indicator slightly if corresponding practice added
                const isBoosted = practices.some(p => p.inPlan && p.scoreImpact >= 7);
                const val = isBoosted ? Math.min(ind.targetPercent, ind.valuePercent + 8) : ind.valuePercent;

                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                      <span style="font-weight: 600;">${isTe ? ind.labelTe : ind.labelEn}</span>
                      <span style="color: var(--color-primary-700); font-weight: 700;">${val}% (Target: ${ind.targetPercent}%)</span>
                    </div>
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill" style="width: ${val}%; background-color: var(--color-primary-600);"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Regenerative Practices List -->
        <div>
          <h3 style="margin-bottom: var(--space-4); color: var(--color-primary-900);">
            🌱 Recommended Practices for Groundnut Cultivation
          </h3>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${practices.map(p => `
              <div class="practice-card ${p.inPlan ? 'added' : ''}" id="practice-${p.id}">
                <div class="practice-info">
                  <div class="practice-title">
                    <span>${p.inPlan ? '✅' : '⚪'}</span>
                    <span>${isTe ? p.titleTe : p.titleEn}</span>
                    <span class="badge badge-sky" style="margin-left: 6px;">
                      ${isTe ? p.waterSavingTe : p.waterSavingEn}
                    </span>
                    <span class="badge badge-soil">
                      Effort: ${isTe ? p.effortTe : p.effort}
                    </span>
                  </div>

                  <div class="practice-benefit">
                    ${isTe ? p.benefitTe : p.benefitEn}
                  </div>

                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                    ⏰ <strong>Best Timing:</strong> ${isTe ? p.bestTimeTe : p.bestTimeEn}
                  </div>
                </div>

                <div>
                  <button 
                    class="btn ${p.inPlan ? 'btn-secondary' : 'btn-primary'} btn-sm btn-toggle-practice" 
                    data-id="${p.id}"
                  >
                    ${p.inPlan ? '✓ ' + t('regen.inPlan') : '+ ' + t('regen.addToPlan')}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach toggle practice listeners
    container.querySelectorAll('.btn-toggle-practice').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = practices.find(item => item.id === id);
        if (p) {
          p.inPlan = !p.inPlan;
          savePlan();
          render();
          showToast(
            p.inPlan ? t('regen.addedToast') : t('regen.removedToast'),
            p.inPlan ? 'success' : 'info'
          );
        }
      });
    });
  }

  render();
}
