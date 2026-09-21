import { t } from '../i18n/index.js';

export function renderMobileNav(container, { activeTab, onSelectTab }) {
  // Mobile bottom bar focuses on the 5 highest-frequency farmer tabs
  const items = [
    { key: 'overview', label: t('nav.overview'), icon: '📊' },
    { key: 'myFarm', label: t('nav.myFarm'), icon: '🏡' },
    { key: 'advisory', label: t('nav.advisory'), icon: '💡' },
    { key: 'diagnosis', label: t('nav.diagnosis'), icon: '🔬' },
    { key: 'cooperation', label: t('nav.cooperation'), icon: '🌐' },
  ];

  container.innerHTML = `
    <nav class="mobile-nav" aria-label="Mobile Navigation">
      ${items.map(item => `
        <button class="mobile-nav-btn ${activeTab === item.key ? 'active' : ''}" data-tab="${item.key}">
          <span class="mobile-nav-icon" aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;

  container.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      onSelectTab(tab);
    });
  });
}
