import { t } from '../i18n/index.js';

export function renderSidebar(container, { activeTab, onSelectTab }) {
  const navItems = [
    { key: 'overview', label: t('nav.overview'), icon: '📊' },
    { key: 'myFarm', label: t('nav.myFarm'), icon: '🏡' },
    { key: 'advisory', label: t('nav.advisory'), icon: '💡' },
    { key: 'diagnosis', label: t('nav.diagnosis'), icon: '🔬' },
    { key: 'regenerative', label: t('nav.regenerative'), icon: '🌿' },
    { key: 'weather', label: t('nav.weather'), icon: '🌦️' },
    { key: 'cooperation', label: t('nav.cooperation'), icon: '🌐' },
    { key: 'settings', label: t('nav.settings'), icon: '⚙️' },
  ];

  container.innerHTML = `
    <div class="sidebar-header">
      <img src="./src/assets/logo.svg" alt="AgriBridge Logo" class="brand-logo" />
      <div class="brand-info">
        <div class="brand-title">
          <span>AgriBridge</span>
          <span class="brand-badge">BRICS</span>
        </div>
        <div class="brand-tagline">AI Agriculture Network</div>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Main Navigation">
      ${navItems.map(item => `
        <button class="nav-item ${activeTab === item.key ? 'active' : ''}" data-tab="${item.key}">
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>

    <div class="sidebar-footer">
      <div class="brics-coop-banner">
        <div class="brics-coop-title">
          <span>🤝</span>
          <span>BRICS AgriN Mesh</span>
        </div>
        <div style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.3;">
          Open standards for agricultural public goods & research
        </div>
        <div class="brics-flags">
          <span class="flag-pill">🇮🇳 IN</span>
          <span class="flag-pill">🇧🇷 BR</span>
          <span class="flag-pill">🇷🇺 RU</span>
          <span class="flag-pill">🇨🇳 CN</span>
          <span class="flag-pill">🇿🇦 ZA</span>
        </div>
      </div>
    </div>
  `;

  // Attach nav item click listeners
  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      onSelectTab(tab);
    });
  });
}
