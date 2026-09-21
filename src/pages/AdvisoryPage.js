import { t, getLocale } from '../i18n/index.js';
import { advisoryService } from '../services/advisoryService.js';
import { renderAdvisoryCard } from '../components/AdvisoryCard.js';
import { renderChatBot } from '../components/ChatBot.js';
import { showToast } from '../components/Toast.js';

export function renderAdvisoryPage(container) {
  let activeFilter = 'all';
  let advisories = [];

  const categories = [
    { key: 'all', labelKey: 'advisory.categoryAll' },
    { key: 'irrigation', labelKey: 'advisory.catIrrigation' },
    { key: 'pest', labelKey: 'advisory.catPest' },
    { key: 'fertilizer', labelKey: 'advisory.catFertilizer' },
    { key: 'regenerative', labelKey: 'advisory.catRegenerative' },
  ];

  async function loadData() {
    advisories = await advisoryService.getAdvisories(activeFilter);
    render();
  }

  function render() {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('advisory.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('advisory.subtitle')}</p>
        </div>

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
  }

  loadData();
}
