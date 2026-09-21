import { t, getLocale } from '../i18n/index.js';
import { showToast } from './Toast.js';

export function renderAdvisoryCard(advisory, { onToggleComplete }) {
  const isTe = getLocale() === 'te';
  const title = isTe ? (advisory.titleTe || advisory.titleEn) : advisory.titleEn;
  const reason = isTe ? (advisory.reasonTe || advisory.reasonEn) : advisory.reasonEn;
  const action = isTe ? (advisory.actionTe || advisory.actionEn) : advisory.actionEn;
  const benefit = isTe ? (advisory.benefitTe || advisory.benefitEn) : advisory.benefitEn;

  const priorityClass = advisory.priority === 'high' ? 'priority-high' : advisory.priority === 'medium' ? 'priority-medium' : '';
  const priorityBadge = advisory.priority === 'high' ? 'badge-danger' : advisory.priority === 'medium' ? 'badge-warning' : 'badge-primary';

  return `
    <div class="card advisory-card ${priorityClass} ${advisory.completed ? 'completed' : ''}" id="card-${advisory.id}">
      <div class="advisory-meta-row">
        <span class="badge ${priorityBadge}">
          ${advisory.priority.toUpperCase()} PRIORITY
        </span>
        <span class="badge badge-soil">
          ${advisory.category.toUpperCase()}
        </span>
        <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">
          📅 ${advisory.date}
        </span>
      </div>

      <div class="advisory-title">
        ${title}
      </div>

      <div class="advisory-body">
        <strong>${t('advisory.actionLabel')}:</strong> ${action}
      </div>

      <div class="advisory-reason-box">
        <div><strong>💡 ${t('advisory.reasonLabel')}:</strong> ${reason}</div>
        <div style="margin-top: 4px; color: var(--color-success-700);">
          <strong>🎯 ${t('advisory.benefitLabel')}:</strong> ${benefit}
        </div>
      </div>

      <!-- Sources & Confidence -->
      <div class="advisory-sources-row">
        <span style="font-weight: 700; margin-right: 4px;">${t('advisory.sourcesLabel')}:</span>
        ${advisory.sources.map(s => `
          <span class="source-tag">${s.name}: ${s.val}</span>
        `).join('')}
        <span style="margin-left: auto; font-weight: 700; color: var(--color-primary-700);">
          ⭐ ${t('advisory.confidenceLabel')}: ${advisory.confidence}%
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="advisory-footer-actions">
        <button class="btn btn-secondary btn-sm btn-share-officer" data-id="${advisory.id}">
          📤 ${t('advisory.shareOfficer')}
        </button>

        <button class="btn ${advisory.completed ? 'btn-secondary' : 'btn-primary'} btn-sm btn-toggle-complete" data-id="${advisory.id}">
          ${advisory.completed ? '✓ ' + t('overview.completed') : t('overview.markCompleted')}
        </button>
      </div>
    </div>
  `;
}
