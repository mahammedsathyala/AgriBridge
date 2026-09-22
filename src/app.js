import { getLocale, onLocaleChange } from './i18n/index.js';
import { farmService } from './services/farmService.js';
import { weatherService } from './services/weatherService.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderMobileNav } from './components/MobileNav.js';

// Page Views
import { renderOverviewPage } from './pages/OverviewPage.js';
import { renderMyFarmPage } from './pages/MyFarmPage.js';
import { renderAdvisoryPage } from './pages/AdvisoryPage.js';
import { renderDiagnosisView } from './components/DiagnosisView.js';
import { renderRegenerativeView } from './components/RegenerativeView.js';
import { renderWeatherPage } from './pages/WeatherPage.js';
import { renderDataCooperationView } from './components/NetworkGraph.js';
import { renderSettingsPage } from './pages/SettingsPage.js';

class App {
  constructor() {
    this.activeTab = 'overview';
    this.farm = null;
    this.weather = {};
    this.sidebarOpen = false;

    // DOM containers
    this.headerEl = document.getElementById('app-header');
    this.sidebarEl = document.getElementById('app-sidebar');
    this.mobileNavEl = document.getElementById('app-mobile-nav');
    this.contentEl = document.getElementById('main-content');
    this.backdropEl = document.getElementById('sidebar-backdrop');
  }

  async init() {
    // Check low-bandwidth mode
    if (localStorage.getItem('agribridge_low_bw') === 'true') {
      document.body.classList.add('low-bandwidth-mode');
    }

    // Set initial locale class if Telugu or Hindi
    if (getLocale() === 'te') {
      document.body.classList.add('lang-te');
    } else if (getLocale() === 'hi') {
      document.body.classList.add('lang-hi');
    }

    // Load initial data
    this.farm = await farmService.getFarmProfile();
    this.weather.forecast = await weatherService.get5DayForecast();
    this.weather.history14Days = await weatherService.get14DayTelemetry();

    // Listen to locale changes
    onLocaleChange(() => {
      this.render();
    });

    // Handle mobile backdrop click
    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    this.render();
  }

  setTab(tab) {
    this.activeTab = tab;
    this.closeSidebar();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarEl) {
      this.sidebarEl.classList.toggle('open', this.sidebarOpen);
    }
    if (this.backdropEl) {
      this.backdropEl.classList.toggle('open', this.sidebarOpen);
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    if (this.sidebarEl) this.sidebarEl.classList.remove('open');
    if (this.backdropEl) this.backdropEl.classList.remove('open');
  }

  render() {
    // 1. Render Header
    renderHeader(this.headerEl, {
      farm: this.farm,
      onMenuToggle: () => this.toggleSidebar(),
      onNavigate: (tab) => this.setTab(tab)
    });

    // 2. Render Sidebar
    renderSidebar(this.sidebarEl, {
      activeTab: this.activeTab,
      onSelectTab: (tab) => this.setTab(tab)
    });

    // 3. Render Mobile Navigation
    renderMobileNav(this.mobileNavEl, {
      activeTab: this.activeTab,
      onSelectTab: (tab) => this.setTab(tab)
    });

    // 4. Render Active Content Page
    this.contentEl.innerHTML = '';
    switch (this.activeTab) {
      case 'overview':
        renderOverviewPage(this.contentEl, {
          farm: this.farm,
          weather: this.weather,
          onNavigate: (tab) => this.setTab(tab)
        });
        break;

      case 'myFarm':
        renderMyFarmPage(this.contentEl, {
          farm: this.farm,
          onFarmUpdated: (updated) => {
            this.farm = updated;
            this.render();
          }
        });
        break;

      case 'advisory':
        renderAdvisoryPage(this.contentEl);
        break;

      case 'diagnosis':
        renderDiagnosisView(this.contentEl);
        break;

      case 'regenerative':
        renderRegenerativeView(this.contentEl);
        break;

      case 'weather':
        renderWeatherPage(this.contentEl);
        break;

      case 'cooperation':
        renderDataCooperationView(this.contentEl);
        break;

      case 'settings':
        renderSettingsPage(this.contentEl);
        break;

      default:
        renderOverviewPage(this.contentEl, {
          farm: this.farm,
          weather: this.weather,
          onNavigate: (tab) => this.setTab(tab)
        });
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
