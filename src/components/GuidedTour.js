import { t, setLocale } from '../i18n/index.js';
import { showToast } from './Toast.js';

export function startGuidedTour({ navigateToTab }) {
  const steps = [
    {
      title: "Step 1: Welcome to AgriBridge Dashboard",
      desc: "Review your farm's real-time crop health score (78/100), soil moisture (34%), and 3-day rainfall forecast.",
      action: () => navigateToTab('overview')
    },
    {
      title: "Step 2: Inspect Priority Daily Action",
      desc: "Notice the prominent advisory: 'Delay irrigation for 24 hours and inspect lower leaves' due to upcoming rainfall.",
      action: () => {
        navigateToTab('overview');
        const card = document.querySelector('.priority-action-card');
        if (card) card.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Step 3: Open Crop Diagnosis",
      desc: "Navigate to the image-based diagnostic screening tool for leaf diseases.",
      action: () => navigateToTab('diagnosis')
    },
    {
      title: "Step 4: Load Sample Leaf Image",
      desc: "Click 'Use sample leaf image' to load a real photo of groundnut foliage showing early Cercospora leaf spot symptoms.",
      action: () => {
        navigateToTab('diagnosis');
        const btn = document.querySelector('#btn-sample-leaf');
        if (btn) btn.click();
      }
    },
    {
      title: "Step 5: Run AgriAI Neural Analysis",
      desc: "AgriAI analyzes the leaf for chlorotic halos and lesion morphology with 87% confidence, providing biological remedies.",
      action: () => {
        navigateToTab('diagnosis');
        const btn = document.querySelector('#btn-analyze');
        if (btn) btn.click();
      }
    },
    {
      title: "Step 6: Open Regenerative Farming",
      desc: "Explore sustainable agro-ecological practices designed for Groundnut in Kurnool red loamy soil.",
      action: () => navigateToTab('regenerative')
    },
    {
      title: "Step 7: Add Biomass Mulching to Farm Plan",
      desc: "Toggle 'Biomass Mulching' to watch your farm's Regenerative Score dynamically increase!",
      action: () => {
        navigateToTab('regenerative');
        const btn = document.querySelector('#practice-regen-01 .btn-toggle-practice');
        if (btn && !btn.textContent.includes('Active')) btn.click();
      }
    },
    {
      title: "Step 8: Open BRICS Data Cooperation",
      desc: "Inspect the distributed BRICS AgriN network mesh connecting agricultural research hubs across 5 nations.",
      action: () => navigateToTab('cooperation')
    },
    {
      title: "Step 9: Simulate India-to-Brazil Data Exchange",
      desc: "Execute a simulated cross-border payload transfer conforming to the AgriBridge Common Agricultural Data Schema.",
      action: () => {
        navigateToTab('cooperation');
        const simBtn = document.querySelector('#btn-simulate-exchange');
        if (simBtn) simBtn.click();
      }
    },
    {
      title: "Step 10: Switch Interface to Telugu (తెలుగు)",
      desc: "Experience native bilingual support for smallholder farmers in Andhra Pradesh and Telangana.",
      action: () => {
        setLocale('te');
        showToast("భాష తెలుగుకి మార్చబడింది! గైడెడ్ టూర్ పూర్తయింది.", "success");
      }
    }
  ];

  let currentStep = 0;

  function renderModal() {
    let overlay = document.querySelector('#guided-tour-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'guided-tour-modal';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }

    const s = steps[currentStep];

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 480px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
          <span class="badge badge-primary">Demo Tour • Step ${currentStep + 1} of ${steps.length}</span>
          <button id="tour-close-btn" class="modal-close-btn" aria-label="Close Tour">✕</button>
        </div>

        <h3 style="color: var(--color-primary-900); margin-bottom: var(--space-2);">${s.title}</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-5);">
          ${s.desc}
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="tour-prev-btn" class="btn btn-secondary btn-sm" ${currentStep === 0 ? 'disabled' : ''}>
            ← Previous
          </button>

          <div style="display: flex; gap: var(--space-2);">
            <button id="tour-action-btn" class="btn btn-primary btn-sm">
              ${currentStep === steps.length - 1 ? 'Finish Tour ✓' : 'Execute & Next →'}
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.querySelector('#tour-close-btn')?.addEventListener('click', () => overlay.remove());
    
    overlay.querySelector('#tour-prev-btn')?.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        renderModal();
      }
    });

    overlay.querySelector('#tour-action-btn')?.addEventListener('click', () => {
      s.action();
      if (currentStep < steps.length - 1) {
        currentStep++;
        setTimeout(renderModal, 400);
      } else {
        overlay.remove();
      }
    });
  }

  renderModal();
}
