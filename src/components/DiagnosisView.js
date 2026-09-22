import { t, getLocale } from '../i18n/index.js';
import { diagnosisService } from '../services/diagnosisService.js';
import { showToast } from './Toast.js';

export function renderDiagnosisView(container) {
  let selectedImage = null; // base64 or url
  let isAnalyzing = false;
  let diagnosisResult = null;
  let historyList = [];

  async function loadHistory() {
    historyList = await diagnosisService.getHistory();
    render();
  }

  function handleFileSelect(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast("Unsupported file type. Please upload a JPG, PNG, or WEBP image.", "warning");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size too large. Maximum supported size is 10MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage = e.target.result;
      diagnosisResult = null;
      render();
    };
    reader.readAsDataURL(file);
  }

  function render() {
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';

    const HI_CROPS = { 'Groundnut': 'मूंगफली', 'Pearl Millet': 'बाजरा', 'Pigeon Pea': 'अरहर', 'Sorghum': 'ज्वार', 'Chickpea': 'चना' };
    const HI_STATUS = { 'Treatment Advised': 'उपचार की सलाह दी गई', 'Resolved': 'समाधान हो गया', 'Monitoring': 'निगरानी जारी' };

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Page Header -->
        <div>
          <h2 style="color: var(--color-primary-900);">${t('diagnosis.title')}</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${t('diagnosis.subtitle')}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">
          <!-- Left Column: Image Upload & Preview -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span>📸</span>
                <span>${t('diagnosis.uploadTitle')}</span>
              </div>
              
              <button id="btn-sample-leaf" class="btn btn-secondary btn-sm" style="font-size: 0.78rem;">
                🍃 ${t('diagnosis.useSampleBtn')}
              </button>
            </div>

            ${!selectedImage ? `
              <!-- Dropzone -->
              <div id="dropzone" class="upload-dropzone">
                <div class="upload-icon">📷</div>
                <div style="font-weight: 700; color: var(--color-primary-900); margin-bottom: 4px;">
                  ${t('diagnosis.uploadPrompt')}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: var(--space-4);">
                  ${t('diagnosis.uploadFormats')}
                </div>

                <div style="display: flex; justify-content: center; gap: var(--space-2); flex-wrap: wrap;">
                  <label class="btn btn-primary btn-sm" style="cursor: pointer;">
                    📁 ${t('diagnosis.uploadCamera')}
                    <input type="file" id="file-input" accept="image/*" style="display: none;" />
                  </label>
                </div>
              </div>
            ` : `
              <!-- Image Preview & Controls -->
              <div class="preview-container">
                <img src="${selectedImage}" alt="Crop Leaf Scan" style="width: 100%; max-height: 280px; object-fit: cover;" />
                ${isAnalyzing ? `<div class="scan-animation-overlay"></div>` : ''}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4);">
                <button id="btn-remove-image" class="btn btn-secondary btn-sm" ${isAnalyzing ? 'disabled' : ''}>
                  ✕ ${t('diagnosis.removeBtn')}
                </button>

                <button id="btn-analyze" class="btn btn-primary" ${isAnalyzing ? 'disabled' : ''}>
                  ${isAnalyzing ? `⏳ ${t('diagnosis.analyzingText')}` : `🔍 ${t('diagnosis.analyzeBtn')}`}
                </button>
              </div>
            `}
          </div>

          <!-- Right Column: Diagnostic Result / Initial Guidance -->
          <div class="card" id="result-column">
            ${isAnalyzing ? `
              <!-- Loading Analysis State -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; text-align: center; padding: var(--space-6);">
                <div style="font-size: 2.5rem; margin-bottom: var(--space-3);" class="pulse-circle">🔬</div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-primary-800); margin-bottom: 6px;">
                  ${t('diagnosis.analyzingText')}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 320px;">
                  Running MobileNetV2 deep neural inference, spectral chlorosis analysis, and ICAR pathology matching...
                </div>
              </div>
            ` : diagnosisResult ? `
              <!-- Diagnostic Result Assessment -->
              <div class="diagnosis-result-card">
                <div class="diagnosis-header-row">
                  <div>
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom: 4px;">
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-amber-600); text-transform: uppercase;">
                        ${t('diagnosis.resultTitle')}
                      </div>
                      ${diagnosisResult.diagnosisSource === 'groundnut_trained_model' ? `
                        <span style="font-size: 0.68rem; background: #d8f3dc; color: #1b4332; border: 1px solid #b7e4c7; padding: 1px 6px; border-radius: 10px; font-weight: 600;">⚡ Groundnut Deep Learning (MobileNetV2)</span>
                      ` : (diagnosisResult.diagnosisSource === 'YOLOv8' ? `
                        <span style="font-size: 0.68rem; background: #d8f3dc; color: #1b4332; border: 1px solid #b7e4c7; padding: 1px 6px; border-radius: 10px; font-weight: 600;">⚡ YOLOv8 Neural Inference</span>
                      ` : (diagnosisResult.diagnosisSource === 'HEURISTIC' ? `
                        <span style="font-size: 0.68rem; background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 1px 6px; border-radius: 10px; font-weight: 600;">🔬 Agronomic Heuristic (RGB Spectrum)</span>
                      ` : `
                        <span style="font-size: 0.68rem; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 6px; border-radius: 10px; font-weight: 600;">⚠️ Offline Fallback</span>
                      `))}
                    </div>
                    <div class="diagnosis-condition-name">
                      ${isTe ? diagnosisResult.conditionTe : (isHi ? (diagnosisResult.conditionHi || diagnosisResult.conditionEn) : diagnosisResult.conditionEn)}
                    </div>
                    <div style="font-size: 0.78rem; font-style: italic; color: var(--text-muted);">
                      Crop: ${diagnosisResult.cropName || 'Groundnut'} | Class: ${diagnosisResult.diseaseName || diagnosisResult.disease}
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <div class="badge ${diagnosisResult.confidencePercent < 60 ? 'badge-danger' : 'badge-warning'}" style="font-size: 0.9rem; padding: 4px 10px;">
                      ${diagnosisResult.confidencePercent}% ${t('diagnosis.confidenceLabel')}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                      ${isTe ? diagnosisResult.severityLevelTe : (isHi ? (diagnosisResult.severityLevelHi || 'मध्यम गंभीरता') : diagnosisResult.severityLevel)}
                    </div>
                  </div>
                </div>

                <!-- Safety Warning if Low Confidence -->
                ${(diagnosisResult.warning || diagnosisResult.confidencePercent < 60) ? `
                  <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px 14px; border-radius: var(--radius-md); margin: var(--space-3) 0; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <span>⚠️</span>
                    <span>${diagnosisResult.warning || "The model is not sufficiently confident. Please upload a clearer leaf image or consult an agricultural expert."}</span>
                  </div>
                ` : ''}

                <!-- Confidence visualization bar -->
                <div class="confidence-bar">
                  <div style="height: 100%; width: ${diagnosisResult.confidencePercent}%; background: ${diagnosisResult.confidencePercent < 60 ? '#ef4444' : '#f59e0b'}; border-radius: var(--radius-full);"></div>
                </div>

                <!-- Affected Canopy Area -->
                <div style="font-size: 0.85rem; color: var(--text-primary); margin: var(--space-3) 0;">
                  <strong>🌱 ${t('diagnosis.affectedLabel')}:</strong> ${isTe ? diagnosisResult.affectedCanopyTe : (isHi ? (diagnosisResult.affectedCanopyHi || 'निचली पत्तियों का 8-12% हिस्सा प्रभावित') : diagnosisResult.affectedCanopy)}
                </div>

                <!-- Symptoms Detected -->
                <div style="margin-bottom: var(--space-3);">
                  <div style="font-weight: 700; font-size: 0.88rem; color: var(--color-primary-900); margin-bottom: 4px;">
                    📋 ${t('diagnosis.symptomsTitle')}
                  </div>
                  <ul class="symptoms-checklist">
                    ${(isTe ? diagnosisResult.symptomsTe : (isHi ? (diagnosisResult.symptomsHi || [
                      'निचली पत्तियों पर गोल, गहरे भूरे से काले धब्बे',
                      'धब्बों के चारों ओर स्पष्ट पीला घेरा (हेलो) दिखाई देना',
                      'समय से पहले पत्तियों का पीला पड़ना और गिरना'
                    ]) : diagnosisResult.symptomsEn)).map(s => `
                      <li class="symptom-item">
                        <span style="color: var(--color-amber-600); font-weight: bold;">•</span>
                        <span>${s}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>

                <!-- Immediate Action -->
                <div class="action-pill-box">
                  <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-success-700); margin-bottom: 4px;">
                    ⚡ ${t('diagnosis.immediateActionTitle')}
                  </div>
                  <div style="font-size: 0.82rem; line-height: 1.4; color: var(--color-primary-900);">
                    ${isTe ? diagnosisResult.immediateActionTe : (isHi ? (diagnosisResult.immediateActionHi || diagnosisResult.immediateActionEn) : diagnosisResult.immediateActionEn)}
                  </div>
                </div>

                <!-- Prevention -->
                <div style="margin-bottom: var(--space-3);">
                  <div style="font-weight: 700; font-size: 0.88rem; color: var(--color-primary-900); margin-bottom: 4px;">
                    🛡️ ${t('diagnosis.preventionTitle')}
                  </div>
                  <ul style="font-size: 0.8rem; padding-left: 18px; color: var(--text-secondary); line-height: 1.4;">
                    ${(isTe ? diagnosisResult.preventionPracticesTe : (isHi ? (diagnosisResult.preventionPracticesHi || diagnosisResult.preventionPracticesEn) : diagnosisResult.preventionPracticesEn)).map(p => `
                      <li>${p}</li>
                    `).join('')}
                  </ul>
                </div>

                <!-- Expert Consultation Alert -->
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: var(--space-3); font-size: 0.78rem; color: #92400e; margin-bottom: var(--space-3);">
                  <strong>👨‍🌾 ${t('diagnosis.expertConsultTitle')}:</strong> ${isTe ? diagnosisResult.whenToConsultTe : diagnosisResult.whenToConsultDesc}
                </div>

                <!-- Disclaimer -->
                <div style="font-size: 0.7rem; color: var(--text-muted); background: var(--bg-subtle); padding: 6px 10px; border-radius: var(--radius-sm);">
                  ⚠️ ${t('diagnosis.disclaimer')}
                </div>
              </div>
            ` : `
              <!-- Initial Idle Guidance -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; text-align: center; padding: var(--space-4);">
                <div style="font-size: 3rem; margin-bottom: var(--space-2); opacity: 0.6;">🌿</div>
                <div style="font-weight: 700; color: var(--color-primary-900); margin-bottom: 4px;">
                  No leaf image selected yet
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 320px; line-height: 1.4;">
                  Upload a photo of suspected crop leaves or click <strong>"${t('diagnosis.useSampleBtn')}"</strong> to test the AI diagnostic screening tool with groundnut leaf spot.
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Historical Diagnostic Scans Table -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>🕒</span>
              <span>${t('diagnosis.historyTitle')}</span>
            </div>
            <span class="badge badge-soil">${historyList.length} Records</span>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-medium); color: var(--text-muted);">
                  <th style="padding: 10px;">${t('diagnosis.scanDate')}</th>
                  <th style="padding: 10px;">${t('diagnosis.scanCrop')}</th>
                  <th style="padding: 10px;">${t('diagnosis.scanDiagnosis')}</th>
                  <th style="padding: 10px;">${t('diagnosis.scanConfidence')}</th>
                  <th style="padding: 10px;">${t('diagnosis.scanStatus')}</th>
                </tr>
              </thead>
              <tbody>
                ${historyList.map(h => `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 10px; font-weight: 600;">${h.date}</td>
                    <td style="padding: 10px;">${isTe ? (h.cropTe || h.crop) : (isHi ? (HI_CROPS[h.crop] || h.crop) : h.crop)}</td>
                    <td style="padding: 10px; font-weight: 700; color: var(--color-primary-900);">
                      ${isTe ? (h.diagnosisTe || h.diagnosis) : (isHi ? (h.diagnosisHi || h.diagnosis) : h.diagnosis)}
                    </td>
                    <td style="padding: 10px;">
                      <span class="badge badge-warning">${h.confidence}</span>
                    </td>
                    <td style="padding: 10px;">
                      <span class="badge badge-primary">${isTe ? (h.statusTe || h.status) : (isHi ? (HI_STATUS[h.status] || h.status) : h.status)}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Dropzone & File Input listeners
    const dropzone = container.querySelector('#dropzone');
    const fileInput = container.querySelector('#file-input');

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
        }
      });
    }

    // Sample leaf button
    container.querySelector('#btn-sample-leaf')?.addEventListener('click', () => {
      selectedImage = "./src/assets/sample_leaf.jpg";
      diagnosisResult = null;
      render();
      showToast("Sample groundnut leaf loaded. Click 'Analyze Leaf' to run AgriAI diagnosis.", "info");
    });

    // Remove image button
    container.querySelector('#btn-remove-image')?.addEventListener('click', () => {
      selectedImage = null;
      diagnosisResult = null;
      render();
    });

    // Analyze button
    container.querySelector('#btn-analyze')?.addEventListener('click', async () => {
      isAnalyzing = true;
      render();
      try {
        const result = await diagnosisService.analyzeLeaf(selectedImage, true);
        diagnosisResult = result;
        isAnalyzing = false;
        await loadHistory();
        showToast(
          isTe ? "వ్యాధి విశ్లేషణ పూర్తయింది: వేరుశనగ ఆకు వ్యాధి గుర్తించబడింది." : `Diagnostic analysis complete: ${result.diseaseName || 'Condition identified'}`,
          result.confidencePercent < 60 ? "warning" : "success"
        );
      } catch (err) {
        isAnalyzing = false;
        render();
        showToast("Diagnosis failed. Please check network or try again.", "error");
      }
    });
  }

  loadHistory();
}
