import { t, getLocale, setLocale } from '../i18n/index.js';
import { showToast } from './Toast.js';

export function renderHeader(container, { farm, onMenuToggle, onNavigate }) {
  const currentLocale = getLocale();
  const cropLabel = farm.crop ? `${farm.crop}${farm.cropVariety ? ` (${farm.cropVariety})` : ''}` : 'Groundnut (K6)';
  const locLabel = farm.location || 'Kadapa, Andhra Pradesh';

  container.innerHTML = `
    <header class="app-header">
      <div class="header-left">
        <button id="btn-mobile-menu" class="menu-toggle-btn" aria-label="Toggle Navigation Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="farm-badge-chip" title="Active plot location">
          <span class="location-icon">📍</span>
          <span style="font-weight: 700; color: var(--color-primary-900); font-size: 0.85rem;">${locLabel}</span>
        </div>

        <div class="crop-badge-chip" title="Selected crop">
          <span>🌱</span>
          <span>${cropLabel}</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Language Switcher -->
        <div class="lang-selector" role="group" aria-label="Language selection">
          <button id="lang-btn-en" class="lang-btn ${currentLocale === 'en' ? 'active' : ''}">
            English
          </button>
          <button id="lang-btn-hi" class="lang-btn ${currentLocale === 'hi' ? 'active' : ''}">
            हिन्दी
          </button>
          <button id="lang-btn-te" class="lang-btn ${currentLocale === 'te' ? 'active' : ''}">
            తెలుగు
          </button>
        </div>

        <!-- Notification Bell -->
        <button id="btn-notifications" class="header-action-btn" title="Recent alerts" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="badge-dot" aria-hidden="true"></span>
        </button>

        <!-- User Profile Chip -->
        <div class="user-profile-chip" title="Authenticated Farmer Account">
          <div class="user-avatar">SF</div>
          <span class="user-name-text">${farm.farmerName || 'Sathyala Farmer'}</span>
        </div>
      </div>
    </header>
  `;

  // Attach event handlers
  const menuBtn = container.querySelector('#btn-mobile-menu');
  if (menuBtn) {
    menuBtn.addEventListener('click', onMenuToggle);
  }

  const enBtn = container.querySelector('#lang-btn-en');
  const hiBtn = container.querySelector('#lang-btn-hi');
  const teBtn = container.querySelector('#lang-btn-te');
  
  if (enBtn) {
    enBtn.addEventListener('click', () => {
      setLocale('en');
      showToast("Language changed to English", "info");
    });
  }

  if (hiBtn) {
    hiBtn.addEventListener('click', () => {
      setLocale('hi');
      showToast("भाषा बदलकर हिन्दी कर दी गई (Switched to Hindi)", "success");
    });
  }

  if (teBtn) {
    teBtn.addEventListener('click', () => {
      setLocale('te');
      showToast("భాష తెలుగుకి మార్చబడింది (Switched to Telugu)", "success");
    });
  }

  const notifBtn = container.querySelector('#btn-notifications');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      let msg = "Weather Alert: 18mm rainfall expected on Sunday. Delay irrigation.";
      if (currentLocale === 'te') {
        msg = "వర్ష సూచన: ఆదివారం నాడు 18 మి.మీ వర్షం కురిసే అవకాశం ఉంది. నీరు పెట్టవద్దు.";
      } else if (currentLocale === 'hi') {
        msg = "मौसम चेतावनी: रविवार को 18 मिमी वर्षा की संभावना है। सिंचाई स्थगित करें।";
      }
      showToast(msg, "warning", 5000);
    });
  }
}
