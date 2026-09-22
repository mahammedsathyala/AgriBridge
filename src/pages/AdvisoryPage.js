import { t, getLocale } from '../i18n/index.js';
import { advisoryService } from '../services/advisoryService.js';
import { farmService } from '../services/farmService.js';
import { weatherService } from '../services/weatherService.js';
import { renderAdvisoryCard } from '../components/AdvisoryCard.js';
import { renderChatBot } from '../components/ChatBot.js';
import { renderAdvisoryChartBox } from '../components/AdvisoryChartBox.js';
import { renderAskMeCropSection } from '../components/AskMeCropSection.js';
import { showToast } from '../components/Toast.js';

export function renderAdvisoryPage(container) {
  let activeFilter = 'all';
  let advisories = [];
  let farm = null;
  let weather = null;
  let isLoading = true;
  let loadError = null;

  const categories = [
    { key: 'all', labelKey: 'advisory.categoryAll' },
    { key: 'irrigation', labelKey: 'advisory.catIrrigation' },
    { key: 'pest', labelKey: 'advisory.catPest' },
    { key: 'fertilizer', labelKey: 'advisory.catFertilizer' },
    { key: 'regenerative', labelKey: 'advisory.catRegenerative' },
  ];

  async function loadData() {
    isLoading = true;
    loadError = null;
    renderSkeleton();

    try {
      // Parallel fetch of farm profile, weather telemetry, and advisories
      const [farmData, weatherData, advData] = await Promise.allSettled([
        farmService.getFarmProfile(),
        weatherService.get5DayForecast(),
        advisoryService.getAdvisories(activeFilter)
      ]);

      farm = farmData.status === 'fulfilled' ? farmData.value : null;
      weather = weatherData.status === 'fulfilled' ? weatherData.value : null;
      
      if (advData.status === 'fulfilled' && Array.isArray(advData.value) && advData.value.length > 0) {
        advisories = advData.value;
      } else {
        advisories = await advisoryService.getAdvisories('all');
      }
    } catch (err) {
      console.warn("Advisory page loading error:", err);
      loadError = "Couldn't reach live telemetry server — running in calibrated agronomic decision support mode";
      try {
        advisories = await advisoryService.getAdvisories('all');
      } catch (e) {
        advisories = [];
      }
    } finally {
      isLoading = false;
      render();
    }
  }

  function renderSkeleton() {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-5);">
        <!-- Header Skeleton -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="skeleton skeleton-title" style="width: 280px; height: 1.8rem; margin-bottom: 6px;"></div>
            <div class="skeleton skeleton-text" style="width: 420px; height: 1rem;"></div>
          </div>
          <div style="display: flex; gap: 8px;">
            <div class="skeleton" style="width: 210px; height: 32px; border-radius: var(--radius-full);"></div>
            <div class="skeleton" style="width: 170px; height: 32px; border-radius: var(--radius-full);"></div>
          </div>
        </div>

        <!-- Context Strip Skeleton (5 cards) -->
        <div class="farm-context-strip">
          ${[1, 2, 3, 4, 5].map(() => `
            <div class="skeleton" style="height: 60px; border-radius: 14px;"></div>
          `).join('')}
        </div>

        <!-- Chart Box Skeleton -->
        <div class="skeleton" style="height: 320px; border-radius: 18px;"></div>

        <!-- Main Chat Area Skeleton -->
        <div class="skeleton" style="height: 540px; border-radius: 18px;"></div>
      </div>
    `;
  }

  function render() {
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';

    // Dynamic Context Values
    const locName = farm?.location || (isTe ? "కర్నూలు, ఆంధ్రప్రదేశ్" : (isHi ? "कर्नूल, आंध्र प्रदेश" : "Kurnool, Andhra Pradesh"));
    const cropName = `${farm?.crop || "Groundnut"} (${farm?.cropVariety || "K6 / Kadiri-6"})`;
    const seasonText = isTe ? "ఖరీఫ్ సీజన్ • 28°C" : (isHi ? "खरीफ मौसम • 28°C" : "Kharif Season • 28°C");
    const irrigationText = isTe ? "తేమ 34% • వాయిదా 24గం" : (isHi ? "नमी 34% • टालें 24घं" : "Moisture 34% • Delay 24h");
    const growthStageText = farm?.growthStage 
      ? `${farm.growthStage} (Day 42)` 
      : (isTe ? "పూత & ఊడల దశ (42వ రోజు)" : (isHi ? "पुष्पण व पेगिंग (दिन 42)" : "Flowering & Pegging (Day 42)"));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-5);">
        
        <!-- 1. PAGE HEADER -->
        <div class="agri-page-header">
          <div class="agri-header-title-wrap">
            <div class="agri-header-icon-badge">🤖</div>
            <div class="agri-header-text">
              <h2>${t('advisory.chatTitle')}</h2>
              <p>${t('advisory.chatSub')}</p>
            </div>
          </div>

          <div class="agri-header-badges">
            <div class="knowledge-badge-pill">
              <span class="pill-dot"></span>
              <span>🏛️ ${t('advisory.knowledgeGraphPill')}</span>
            </div>
            <div class="knowledge-badge-pill">
              <span class="pill-dot"></span>
              <span>🌐 ${t('advisory.knowledgeBasePill')}</span>
            </div>
          </div>
        </div>

        <!-- 2. FARM CONTEXT STRIP (5 Compact Rounded Cards) -->
        <div class="farm-context-strip">
          <!-- Card 1: Location -->
          <div class="context-strip-card" title="Farm Location">
            <div class="context-card-icon">📍</div>
            <div class="context-card-body">
              <span class="context-card-label">${isTe ? 'ప్రాంతం' : (isHi ? 'स्थान' : 'Location')}</span>
              <span class="context-card-val">${locName}</span>
            </div>
          </div>

          <!-- Card 2: Crop & Variety -->
          <div class="context-strip-card" title="Active Crop Variety">
            <div class="context-card-icon">🌱</div>
            <div class="context-card-body">
              <span class="context-card-label">${isTe ? 'పంట & రకం' : (isHi ? 'फसल एवं किस्म' : 'Crop & Variety')}</span>
              <span class="context-card-val">${cropName}</span>
            </div>
          </div>

          <!-- Card 3: Season & Weather -->
          <div class="context-strip-card" title="Agro-Climatic Season">
            <div class="context-card-icon">🌦</div>
            <div class="context-card-body">
              <span class="context-card-label">${isTe ? 'సీజన్ & వాతావరణం' : (isHi ? 'मौसम एवं जलवायु' : 'Current Season')}</span>
              <span class="context-card-val">${seasonText}</span>
            </div>
          </div>

          <!-- Card 4: Irrigation Status -->
          <div class="context-strip-card" title="Soil Moisture & Irrigation Schedule">
            <div class="context-card-icon">💧</div>
            <div class="context-card-body">
              <span class="context-card-label">${isTe ? 'నీటిపారుదల స్థితి' : (isHi ? 'सिंचाई स्थिति' : 'Irrigation Status')}</span>
              <span class="context-card-val">${irrigationText}</span>
            </div>
          </div>

          <!-- Card 5: Crop Stage -->
          <div class="context-strip-card" title="Crop Phenological Stage">
            <div class="context-card-icon">🌿</div>
            <div class="context-card-body">
              <span class="context-card-label">${isTe ? 'ఎదుగుదల దశ' : (isHi ? 'फसल अवस्था' : 'Growth Stage')}</span>
              <span class="context-card-val">${growthStageText}</span>
            </div>
          </div>
        </div>

        <!-- 3. AI AGRONOMIC ANALYTICS & PREDICTIVE TRENDS CHART BOX -->
        <div id="agri-advisory-chart-wrapper"></div>

        <!-- 4. DEDICATED ASK ME CROP AI ADVISORY SECTION (Crop-Specific Intelligence) -->
        <div id="agri-ask-me-wrapper"></div>

        <!-- Notice Banner if offline / fallback -->
        ${loadError ? `
          <div class="error-state-card" role="alert" style="margin-top: -4px;">
            <div class="error-state-msg">
              <span style="font-size: 1.1rem;">💡</span>
              <span><strong>Notice:</strong> ${loadError}</span>
            </div>
            <button id="btn-advisory-retry" class="btn-retry" aria-label="Retry loading advisories">
              🔄 ${isTe ? 'మళ్ళీ ప్రయత్నించండి' : (isHi ? 'पुनः प्रयास करें' : 'Retry')}
            </button>
          </div>
        ` : ''}

        <!-- 5. MAIN AI CONVERSATIONAL ASSISTANT -->
        <div id="agri-ai-chatbot-wrapper"></div>

        <!-- 5. ACTIONABLE ADVISORIES REPOSITORY (Filtered agronomic advisories) -->
        <div class="card card--default" style="margin-top: var(--space-4); border: 1px solid #DCFCE7; border-radius: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: var(--space-4);">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #166534; margin: 0;">
                📋 ${t('advisory.title')}
              </h3>
              <p style="font-size: 0.8rem; color: #64748B; margin: 2px 0 0 0;">
                ${t('advisory.subtitle')}
              </p>
            </div>

            <!-- Filter Chips -->
            <div class="advisory-filters" style="margin-bottom: 0;">
              ${categories.map(c => `
                <button class="filter-chip ${activeFilter === c.key ? 'active' : ''}" data-cat="${c.key}">
                  ${t(c.labelKey)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Advisories List Grid -->
          <div id="advisory-list-container" style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${advisories.map(adv => renderAdvisoryCard(adv, {
              onToggleComplete: () => {}
            })).join('')}
          </div>
        </div>

      </div>
    `;

    // Render Advisory Chart Box
    const chartWrapper = container.querySelector('#agri-advisory-chart-wrapper');
    if (chartWrapper) {
      renderAdvisoryChartBox(chartWrapper, {
        farm,
        weather,
        initialMetric: 'moisture',
        initialDays: '7'
      });
    }

    // Render Dedicated "Ask Me" Crop AI Section
    const askMeWrapper = container.querySelector('#agri-ask-me-wrapper');
    if (askMeWrapper) {
      renderAskMeCropSection(askMeWrapper, {
        farm,
        weather
      });
    }

    // Render chatbot into designated container
    const chatContainer = container.querySelector('#agri-ai-chatbot-wrapper');
    if (chatContainer) {
      renderChatBot(chatContainer, {
        quickInsight: isTe 
          ? "కీలకమైన పూత మరియు ఊడల దశలో నేలలో తగినంత తేమను కాపాడండి. ఆకుముడత మరియు టిక్కా ఆకుమచ్చ తెగులు లక్షణాలను క్రమం తప్పకుండా పరిశీలించండి. వర్ష సూచన ఉన్నందున ముందుగానే అనవసర నీటిపారుదల చేయవద్దు."
          : (isHi 
            ? "महत्वपूर्ण पुष्पण और पेगिंग अवस्था में मिट्टी में उपयुक्त नमी बनाए रखें। लीफ माइनर और फंगल पत्ती धब्बा रोग के लक्षणों की नियमित जांच करें। बारिश के पूर्वानुमान से पहले अनावश्यक सिंचाई से बचें।"
            : "Maintain adequate soil moisture during critical growth stages. Monitor the field regularly for leaf miner and fungal disease symptoms. Avoid unnecessary irrigation before expected rainfall.")
      });
    }

    // Attach filter listeners
    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-cat');
        loadData();
      });
    });

    // Attach Toggle Complete listeners on rendered cards
    container.querySelectorAll('.btn-toggle-complete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await advisoryService.toggleComplete(id);
        await loadData();
        showToast("Advisory action updated!", "success");
      });
    });

    // Attach Share with Extension Officer listeners
    container.querySelectorAll('.btn-share-officer').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const adv = advisories.find(a => a.id === id);
        if (adv) {
          const text = `[AgriBridge Kurnool Advisory] ${adv.titleEn}\nRecommended Action: ${adv.actionEn}\nSources: Satellite & Soil Telemetry (Confidence: ${adv.confidence}%)`;
          navigator.clipboard?.writeText(text).catch(() => {});
          showToast(t('advisory.shareToast'), 'success', 4500);
        }
      });
    });

    const retryBtn = container.querySelector('#btn-advisory-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        loadData();
      });
    }
  }

  loadData();
}

