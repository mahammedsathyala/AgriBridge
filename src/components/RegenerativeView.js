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
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';
    const currentScore = calculateScore();
    const targetScore = defaultRegenerativeMetrics.targetScore;
    const addedCount = practices.filter(p => p.inPlan).length;

    const HI_PILLARS = {
      'Soil Organic Cover & Mulch': 'मृदा आवरण एवं मल्चिंग',
      'Microbial Biomass & Carbon': 'सूक्ष्मजीव बायोमास एवं कर्बन',
      'Infiltration & Retention': 'जल संचयन एवं रिसाव क्षमता',
      'Crop Diversification Index': 'फसल विविधीकरण सूचकांक',
      'Biological Nitrogen Fixation': 'जैविक नाइट्रोजन स्थिरीकरण'
    };

    const HI_PRACTICES = {
      'regen-01': {
        title: 'बायोमास मल्चिंग (फसल अवशेष)',
        water: '15% – 25% जल संरक्षण',
        effort: 'कम',
        benefit: 'खरपतवार रोकता है, मिट्टी का तापमान 3-5°C कम करता है और ऊपरी मिट्टी को सूखने से बचाता है।',
        bestTime: 'बुवाई के 25-30 दिन बाद सुइयां (Pegs) बनने से पहले'
      },
      'regen-02': {
        title: 'दलहन-अनाज फसल चक्रण (ज्वार/बाजरा)',
        water: 'गहरे जल रिसाव में 18% सुधार',
        effort: 'मध्यम',
        benefit: 'टिक्का और कॉलर रॉट जैसे मिट्टी जनित रोगों के चक्र को तोड़ता है और जैविक पदार्थ बढ़ाता है।',
        bestTime: 'आगामी रबी सीजन के लिए योजना बनाएं'
      },
      'regen-03': {
        title: 'अरहर के साथ पट्टीदार अंतःफसल (6:1 अनुपात)',
        water: 'कुल भूमि जल उपयोग दक्षता में वृद्धि',
        effort: 'मध्यम',
        benefit: 'गहरी जड़ें उप-मृदा में वायु संचार करती हैं, आंशिक छाया देती हैं और प्राकृतिक मित्र कीटों को आकर्षित करती हैं।',
        bestTime: 'शुरुआती बुवाई के समय मूंगफली के साथ लगाएं'
      },
      'regen-04': {
        title: 'संवर्धित वर्मीकम्पोस्ट और जैव उर्वरक',
        water: 'मिट्टी की जल धारण क्षमता 22% बढ़ाए',
        effort: 'मध्यम',
        benefit: 'स्थिर मृदा जैविक कार्बन का निर्माण करता है और मायकोराइजा कवक को पोषण देता है।',
        bestTime: 'हल्की बारिश या सिंचाई से पहले प्रयोग करें'
      },
      'regen-05': {
        title: 'पंचगव्य/नीम अर्क से एकीकृत कीट प्रबंधन',
        water: 'रसायन-मुक्त भूजल संरक्षण',
        effort: 'कम',
        benefit: 'सिंथेटिक रसायनों के बिना हानिकारक कीटों को रोकता है और लाभदायक परागणकों को सुरक्षित रखता है।',
        bestTime: 'शाम के समय प्रारंभिक कीट दिखने पर छिड़कें'
      }
    };

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

                const pillarLabel = isTe ? ind.labelTe : (isHi ? (HI_PILLARS[ind.labelEn] || ind.labelEn) : ind.labelEn);

                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
                      <span style="font-weight: 600;">${pillarLabel}</span>
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
            🌱 ${isTe ? 'సిఫార్సు చేయబడిన ప్రకృతి వ్యవసాయ పద్ధతులు' : (isHi ? 'अनुशंसित प्राकृतिक एवं पुनर्योजी कृषि पद्धतियां' : 'Recommended Practices for Cultivation')}
          </h3>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${practices.map(p => {
              const hiP = HI_PRACTICES[p.id] || {};
              const pTitle = isTe ? p.titleTe : (isHi ? (hiP.title || p.titleEn) : p.titleEn);
              const pWater = isTe ? p.waterSavingTe : (isHi ? (hiP.water || p.waterSavingEn) : p.waterSavingEn);
              const pEffort = isTe ? p.effortTe : (isHi ? (hiP.effort || p.effort) : p.effort);
              const pBenefit = isTe ? p.benefitTe : (isHi ? (hiP.benefit || p.benefitEn) : p.benefitEn);
              const pBestTime = isTe ? p.bestTimeTe : (isHi ? (hiP.bestTime || p.bestTimeEn) : p.bestTimeEn);

              return `
              <div class="practice-card ${p.inPlan ? 'added' : ''}" id="practice-${p.id}">
                <div class="practice-info">
                  <div class="practice-title">
                    <span>${p.inPlan ? '✅' : '⚪'}</span>
                    <span>${pTitle}</span>
                    <span class="badge badge-sky" style="margin-left: 6px;">
                      ${pWater}
                    </span>
                    <span class="badge badge-soil">
                      ${isHi ? 'प्रयास' : (isTe ? 'శ్రమ' : 'Effort')}: ${pEffort}
                    </span>
                  </div>

                  <div class="practice-benefit">
                    ${pBenefit}
                  </div>

                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                    ⏰ <strong>${isHi ? 'अनुकूल समय' : (isTe ? 'అనుకూల సమయం' : 'Best Timing')}:</strong> ${pBestTime}
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
            `;
          }).join('')}
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
