import { t, getLocale } from '../i18n/index.js';
import { advisoryService } from '../services/advisoryService.js';
import { renderAdvisoryCard } from '../components/AdvisoryCard.js';
import { renderChatBot } from '../components/ChatBot.js';
import { showToast } from '../components/Toast.js';

export function renderAdvisoryPage(container) {
  let activeFilter = 'all';
  let advisories = [];
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
      advisories = await advisoryService.getAdvisories(activeFilter);
      if (!advisories || advisories.length === 0) {
        // Fetch unfiltered if filtered empty
        advisories = await advisoryService.getAdvisories('all');
      }
    } catch (err) {
      console.warn("Advisories fetch error:", err);
      loadError = "Couldn't reach live advisory recommendations — showing cached agronomic guidelines";
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
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header Skeleton -->
        <div>
          <div class="skeleton skeleton-title" style="width: 240px; height: 1.8rem;"></div>
          <div class="skeleton skeleton-text" style="width: 340px;"></div>
        </div>

        <div class="dashboard-columns">
          <!-- Left Column: Skeleton Filter Chips & Cards -->
          <div>
            <div class="advisory-filters" style="margin-bottom: var(--space-4);">
              <div class="skeleton" style="width: 70px; height: 32px; border-radius: var(--radius-full);"></div>
              <div class="skeleton" style="width: 85px; height: 32px; border-radius: var(--radius-full);"></div>
              <div class="skeleton" style="width: 95px; height: 32px; border-radius: var(--radius-full);"></div>
              <div class="skeleton" style="width: 80px; height: 32px; border-radius: var(--radius-full);"></div>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div class="card card--default" style="min-height: 140px;">
                <div class="skeleton skeleton-title" style="width: 50%;"></div>
                <div class="skeleton skeleton-text" style="width: 90%;"></div>
                <div class="skeleton skeleton-text" style="width: 75%;"></div>
              </div>
              <div class="card card--default" style="min-height: 140px;">
                <div class="skeleton skeleton-title" style="width: 60%;"></div>
                <div class="skeleton skeleton-text" style="width: 85%;"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
              </div>
              <div class="card card--default" style="min-height: 140px;">
                <div class="skeleton skeleton-title" style="width: 45%;"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 65%;"></div>
              </div>
            </div>
          </div>

          <!-- Right Column: Chatbot container placeholder -->
          <div id="chatbot-container"></div>
        </div>
      </div>
    `;
    const chatContainer = container.querySelector('#chatbot-container');
    if (chatContainer) {
      renderChatBot(chatContainer);
    }
  }

  function render() {
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('advisory.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('advisory.subtitle')}</p>
        </div>

        <!-- Error State Banner (Task 3) -->
        ${loadError ? `
          <div class="error-state-card" role="alert">
            <div class="error-state-msg">
              <span style="font-size: 1.2rem;">💡</span>
              <span><strong>Notice:</strong> ${loadError}</span>
            </div>
            <button id="btn-advisory-retry" class="btn-retry" aria-label="Retry loading advisories">
              🔄 ${isTe ? 'మళ్ళీ ప్రయత్నించండి' : (isHi ? 'पुनः प्रयास करें' : 'Retry')}
            </button>
          </div>
        ` : ''}

        <div class="dashboard-columns">
          <!-- Left Column: Advisory Cards & Filters -->
          <div>
            <!-- Category Filter Pills -->
            <div class="advisory-filters">
              ${categories.map(c => `
                <button class="filter-chip ${activeFilter === c.key ? 'active' : ''}" data-cat="${c.key}">
                  ${t(c.labelKey)}
                </button>
              `).join('')}
            </div>

            <!-- Advisories List -->
            <div id="advisory-list-container">
              ${advisories.map(adv => renderAdvisoryCard(adv, {
                onToggleComplete: () => {}
              })).join('')}
            </div>
          </div>

          <!-- Right Column: Ask AgriAI Assistant -->
          <div id="chatbot-container"></div>
        </div>
      </div>
    `;

    // Render chatbot into right column
    const chatContainer = container.querySelector('#chatbot-container');
    if (chatContainer) {
      renderChatBot(chatContainer);
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
        showToast("Advisory status updated!", "success");
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
