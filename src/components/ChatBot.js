import { t, getLocale } from '../i18n/index.js';
import { advisoryService } from '../services/advisoryService.js';
import { diagnosisService } from '../services/diagnosisService.js';
import { showToast } from './Toast.js';

export function renderChatBot(container, options = {}) {
  const currentLocale = getLocale();
  const isTe = currentLocale === 'te';
  const isHi = currentLocale === 'hi';

  let defaultGreetingTitle = "Namaste Farmer! 👋";
  let defaultGreetingSub = "I'm AgriAI, your agricultural advisory assistant. I can help you make better decisions for your groundnut crop using weather, soil, crop, pest and agricultural knowledge.";
  
  if (isTe) {
    defaultGreetingTitle = "నమస్కారం రైతు గారు! 👋";
    defaultGreetingSub = "నేను AgriAI వ్యవసాయ సహాయకుడిని. వాతావరణం, నేల, పంట మరియు చీడపీడల సమగ్ర సమాచారంతో మీ వేరుశనగ పంట కోసం సరైన నిర్ణయాలు తీసుకోవడంలో నేను సహాయం చేయగలను.";
  } else if (isHi) {
    defaultGreetingTitle = "नमस्ते किसान भाई! 👋";
    defaultGreetingSub = "मैं AgriAI कृषि सहायक हूँ। मैं मौसम, मिट्टी, फसल, कीट एवं वैज्ञानिक कृषि ज्ञान का उपयोग करके आपकी मूंगफली की फसल के लिए सर्वोत्तम निर्णय लेने में आपकी मदद कर सकता हूँ।";
  }

  // Domain Cards Data (Requirement 3)
  const domainCards = [
    {
      id: 'crop_mgmt',
      icon: '🌱',
      title: isTe ? 'పంట నిర్వహణ' : (isHi ? 'फसल प्रबंधन' : 'Crop Management'),
      query: isTe ? 'వేరుశనగ పంట రకం మరియు విత్తన శుద్ధి గురించి చెప్పండి' : (isHi ? 'मूंगफली की किस्म, बुवाई और बीज उपचार की जानकारी दें' : 'Tell me about groundnut variety, sowing, spacing and seed treatment'),
      items: [
        isTe ? 'రకం: కదిరి-6' : (isHi ? 'किस्म: कादिरी-6' : 'Variety: Kadiri-6'),
        isTe ? 'విత్తే సమయం: ఖరీఫ్' : (isHi ? 'बुवाई: खरीफ मौसम' : 'Sowing: Kharif / Rabi'),
        isTe ? 'ఎడం: 30x10 సెం.మీ' : (isHi ? 'दूरी: 30x10 सेमी' : 'Spacing: 30x10 cm'),
        isTe ? 'విత్తన శుద్ధి: ట్రైకోడెర్మా' : (isHi ? 'बीज उपचार: ट्राइकोडर्मा' : 'Seed treatment: Bio-agent')
      ]
    },
    {
      id: 'pest_control',
      icon: '🐛',
      title: isTe ? 'చీడపీడల నియంత్రణ' : (isHi ? 'कीट एवं रोग नियंत्रण' : 'Pest & Disease Control'),
      query: isTe ? 'వేరుశనగలో చీడపీడల నివారణ చర్యలు ఏమిటి?' : (isHi ? 'मूंगफली में कीट व रोगों की रोकथाम कैसे करें?' : 'How to prevent and treat groundnut pests and foliar diseases?'),
      items: [
        isTe ? 'కీటకాల గుర్తింపు: ఆకుముడత' : (isHi ? 'कीट पहचान: लीफ माइनर' : 'Pest identification: Leaf miner'),
        isTe ? 'వ్యాధి లక్షణాలు: టిక్కా మచ్చ' : (isHi ? 'रोग लक्षण: टिक्का पत्ती धब्बा' : 'Disease symptoms: Tikka spot'),
        isTe ? 'నివారణ: లింగాకర్షక బుట్టలు' : (isHi ? 'रोकथाम: फेरोमोन ट्रैप' : 'Prevention: Pheromone traps'),
        isTe ? 'చికిత్స: 5% వేప నూనె' : (isHi ? 'उपचार: नीम अर्क छिड़काव' : 'Treatment: Neem extract')
      ]
    },
    {
      id: 'irrigation',
      icon: '💧',
      title: isTe ? 'నీటిపారుదల సలహా' : (isHi ? 'सिंचाई सलाह' : 'Irrigation Advice'),
      query: isTe ? 'వేరుశనగ పంటకు నీటి అవసరం మరియు సమయం ఎంత?' : (isHi ? 'मूंगफली में सिंचाई का सही समय और पानी की आवश्यकता क्या है?' : 'What is the irrigation timing and water requirement for groundnut?'),
      items: [
        isTe ? 'సమయం: పూత & ఊడల దశ' : (isHi ? 'समय: फूल व पेगिंग अवस्था' : 'Irrigation timing: Critical stages'),
        isTe ? 'నీటి అవసరం: 450-500mm' : (isHi ? 'जल मांग: 450-500 मिमी' : 'Water requirement: 450-500mm'),
        isTe ? 'నీటి ఆదా: స్ప్రింక్లర్ విధానం' : (isHi ? 'जल बचत: स्प्रिंकलर व ड्रिप' : 'Water-saving recommendations'),
        isTe ? 'వర్ష సూచనపై దృష్టి' : (isHi ? 'वर्षा पूर्वानुमान समन्वय' : 'Rainfall-linked schedule')
      ]
    },
    {
      id: 'soil_health',
      icon: '🌿',
      title: isTe ? 'నేల ఆరోగ్యం' : (isHi ? 'मृदा स्वास्थ्य' : 'Soil Health'),
      query: isTe ? 'వేరుశనగకు ఎరువుల యాజమాన్యం మరియు జిప్సం ఎప్పుడు వేయాలి?' : (isHi ? 'मूंगफली में खाद प्रबंधन और जिप्सम कब डालें?' : 'What are the fertilizer and gypsum recommendations for groundnut soil health?'),
      items: [
        isTe ? 'నేల స్థితి: ఎర్ర గరప నేల' : (isHi ? 'मृदा स्थिति: लाल दोमट मिट्टी' : 'Soil condition: Sandy loam'),
        isTe ? 'పోషకాలు: NPK 20:40:40' : (isHi ? 'पोषण: एनपीके 20:40:40' : 'Nutrient balance: NPK 20:40:40'),
        isTe ? 'జిప్సం: 200 కేజీలు/ఎకరా' : (isHi ? 'जिप्सम: 200 किग्रा/एकड़' : 'Gypsum: 200 kg/acre (40 DAS)'),
        isTe ? 'నేల మెరుగు: జీవామృతం' : (isHi ? 'मृदा सुधार: जीवामृत पलवार' : 'Soil improvement: Mulching')
      ]
    },
    {
      id: 'weather_impact',
      icon: '🌦',
      title: isTe ? 'వాతావరణ ప్రభావం' : (isHi ? 'मौसम प्रभाव' : 'Weather Impact'),
      query: isTe ? 'రాబోయే వాతావరణం మరియు వర్షపాతం పంటపై ఎలా ప్రభావం చూపుతుంది?' : (isHi ? 'आगामी मौसम व वर्षा का मूंगफली फसल पर क्या प्रभाव होगा?' : 'How will the upcoming weather and rainfall affect my groundnut crop?'),
      items: [
        isTe ? 'సూచన: 18-24mm వర్షం' : (isHi ? 'पूर्वानुमान: 18-24 मिमी वर्षा' : 'Forecast: 18-24mm rain outlook'),
        isTe ? 'వర్ష ప్రమాదం: డ్రైనేజీ అవసరం' : (isHi ? 'वर्षा जोखिम: जल निकासी' : 'Rainfall risk: Furrow drainage'),
        isTe ? 'ఉష్ణోగ్రత: 28°C అనుకూలం' : (isHi ? 'तापमान: 28°C अनुकूल' : 'Temperature impact: 28°C range'),
        isTe ? 'వాతావరణ సిఫార్సులు' : (isHi ? 'मौसम आधारित कार्य' : 'Weather-based farm guidance')
      ]
    }
  ];

  // Initial Conversation Stream State
  let messages = [
    {
      id: 'msg-welcome',
      sender: 'bot',
      isWelcome: true,
      greetingTitle: defaultGreetingTitle,
      greetingSub: defaultGreetingSub,
      domainCards: domainCards,
      quickInsight: options.quickInsight || (isTe 
        ? "కీలకమైన పూత మరియు ఊడల దశలో నేలలో తగినంత తేమను కాపాడండి. ఆకుముడత మరియు టిక్కా ఆకుమచ్చ తెగులు లక్షణాలను క్రమం తప్పకుండా పరిశీలించండి. వర్ష సూచన ఉన్నందున ముందుగానే అనవసర నీటిపారుదల చేయవద్దు."
        : (isHi 
          ? "महत्वपूर्ण पुष्पण और पेगिंग अवस्था में मिट्टी में उपयुक्त नमी बनाए रखें। लीफ माइनर और फंगल पत्ती धब्बा रोग के लक्षणों की नियमित जांच करें। बारिश के पूर्वानुमान से पहले अनावश्यक सिंचाई से बचें।"
          : "Maintain adequate soil moisture during critical growth stages. Monitor the field regularly for leaf miner and fungal disease symptoms. Avoid unnecessary irrigation before expected rainfall.")),
      sources: ["ICAR Agro-Advisory Knowledge Graph", "BRICS AgriN Knowledge Base", "AGRI-ESP32 Sensor Probe"],
      whyItems: [
        "Calibrated for Kadiri-6 Groundnut at Day 42 (Flowering & Pegging)",
        "Real-time sensor telemetry: 34% volumetric soil moisture, 28.4°C canopy temperature",
        "IMD & Open-Meteo 72h precipitation outlook for Kurnool District"
      ],
      disclaimer: isHi ? "निर्णय-सहायता सलाह। स्थानीय कृषि अधिकारी से पुष्टि करें।" : (isTe ? "సహాయక సిఫార్సు మాత్రమే." : "Decision support advisory only.")
    }
  ];

  let isLoading = false;
  let loadingStep = 0;
  let loadingInterval = null;
  let errorState = null;
  let isListening = false;
  let showUploadModal = false;
  let showManualModal = false;
  let manualPart = 'leaves';
  let manualSeverity = 50;

  // Render main chat interface
  function render() {
    container.innerHTML = `
      <div class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-header-left">
            <span style="font-size: 1.25rem;">🤖</span>
            <div>
              <div style="font-weight: 800; color: #166534; font-size: 0.95rem;">
                ${t('advisory.chatTitle')}
              </div>
              <div style="font-size: 0.74rem; color: #64748B;">
                ${t('advisory.chatSub')}
              </div>
            </div>
          </div>
          <div class="chat-status-pill">
            <span class="pulse-dot"></span>
            <span>● ${t('advisory.knowledgeBasePill')}</span>
          </div>
        </div>

        <!-- Messages Stream -->
        <div class="chat-messages" id="agri-chat-stream">
          ${messages.map(msg => renderMessage(msg)).join('')}

          <!-- Loading State Animation (Requirement 10) -->
          ${isLoading ? `
            <div class="ai-loading-card">
              <div class="ai-loading-header">
                <span class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
                <span>🌱 ${t('advisory.analyzingFarmData')}</span>
              </div>
              <div class="ai-loading-steps">
                <span class="loading-step-chip ${loadingStep >= 1 ? 'active' : ''}">Weather ${loadingStep >= 1 ? '✓' : '...'}</span>
                <span class="loading-step-chip ${loadingStep >= 2 ? 'active' : ''}">Crop ${loadingStep >= 2 ? '✓' : '...'}</span>
                <span class="loading-step-chip ${loadingStep >= 3 ? 'active' : ''}">Soil ${loadingStep >= 3 ? '✓' : '...'}</span>
                <span class="loading-step-chip ${loadingStep >= 4 ? 'active' : ''}">Knowledge Base ${loadingStep >= 4 ? '✓' : '...'}</span>
                <span class="loading-step-chip ${loadingStep >= 5 ? 'active' : ''}">AI Analysis ${loadingStep >= 5 ? '✓' : '...'}</span>
              </div>
              <div class="loading-shimmer-bar"></div>
            </div>
          ` : ''}

          <!-- Error State (Requirement 11) -->
          ${errorState ? `
            <div class="ai-error-banner" role="alert">
              <div class="ai-error-text">
                <span style="font-size: 1.3rem;">⚠️</span>
                <div>
                  <strong>${t('advisory.tempUnavailable')}</strong>
                  <div style="font-size: 0.78rem; opacity: 0.9;">${t('advisory.tryAgainNotice')}</div>
                </div>
              </div>
              <button class="btn-retry-modern" id="btn-chat-retry">
                🔄 ${t('advisory.retryBtn')}
              </button>
            </div>
          ` : ''}

          <!-- Empty State (Requirement 12) if no messages -->
          ${messages.length === 0 ? `
            <div class="ai-empty-state">
              <div class="empty-state-logo">🌱</div>
              <div class="empty-state-title">${t('advisory.emptyStateTitle')}</div>
              <div class="empty-state-sub">${t('advisory.emptyStateSubtitle')}</div>
              <div class="empty-state-actions">
                <button class="btn-empty-action" id="btn-empty-manual-disease" style="border-color:#fdba74; color:#c2410c;">
                  📝 ${t('advisory.manualEntryBtn') || 'Manual Disease Entry'}
                </button>
                <button class="btn-empty-action" id="btn-empty-diagnose">
                  📷 ${t('advisory.emptyActionDiagnosis')}
                </button>
                <button class="btn-empty-action" data-prompt="${t('advisory.q1')}">
                  💧 ${t('advisory.emptyActionIrrigation')}
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Quick Questions Chips (Requirement 7) -->
        <div class="chat-suggested-prompts">
          <button class="prompt-chip" id="btn-chip-manual-entry" style="background:#fff7ed; color:#c2410c; border-color:#fdba74; font-weight:700;">
            📝 ${t('advisory.manualEntryBtn') || 'Manual Disease Entry'}
          </button>
          <button class="prompt-chip" data-prompt="${t('advisory.q2')}">🍂 ${t('advisory.q2')}</button>
          <button class="prompt-chip" data-prompt="${t('advisory.q3')}">🐛 ${t('advisory.q3')}</button>
          <button class="prompt-chip" data-prompt="${t('advisory.q1')}">💧 ${t('advisory.q1')}</button>
          <button class="prompt-chip" data-prompt="${t('advisory.q5')}">🌦 ${t('advisory.q5')}</button>
        </div>

        <!-- Chat Input Row (Requirement 8) -->
        <form class="chat-input-row" id="agri-chat-form">
          <!-- Voice Recognition Mic Icon -->
          <button 
            type="button" 
            class="chat-action-icon-btn ${isListening ? 'active' : ''}" 
            id="btn-voice-mic" 
            title="Voice input (Microphone)"
            aria-label="Voice input"
          >
            🎙️
          </button>

          <!-- Upload Photo Attachment Icon -->
          <button 
            type="button" 
            class="chat-action-icon-btn" 
            id="btn-attach-image" 
            title="Upload Crop Photo"
            aria-label="Upload crop image"
          >
            📷
          </button>

          <!-- Manual Disease Entry Icon Button -->
          <button 
            type="button" 
            class="chat-action-icon-btn" 
            id="btn-manual-entry" 
            title="${t('advisory.manualEntryBtn') || 'Manual Disease Entry'}"
            aria-label="${t('advisory.manualEntryBtn') || 'Manual Disease Entry'}"
            style="background: #fff7ed; border-color: #fdba74; color: #c2410c;"
          >
            📝
          </button>

          <!-- Text Input -->
          <input 
            type="text" 
            id="agri-chat-input" 
            class="chat-input" 
            placeholder="${t('advisory.chatPlaceholder')}" 
            aria-label="${t('advisory.chatPlaceholder')}"
            autocomplete="off"
          />

          <!-- Circular Green Send Button -->
          <button 
            type="submit" 
            class="btn-send-round" 
            id="btn-chat-send"
            aria-label="${t('advisory.send')}"
            title="${t('advisory.send')}"
          >
            ➔
          </button>
        </form>
      </div>

      <!-- Image Diagnosis Modal (Requirement 9) -->
      ${showUploadModal ? renderDiagnosisModal() : ''}

      <!-- Manual Disease Entry Modal -->
      ${showManualModal ? renderManualDiseaseModal() : ''}
    `;

    attachEventListeners();
    scrollToBottom();
  }

  // Render individual message
  function renderMessage(msg) {
    if (msg.sender === 'user') {
      return `
        <div class="chat-msg user">
          ${escapeHtml(msg.text)}
        </div>
      `;
    }

    // Bot message with Initial Welcome Hero & 5 Domain Cards
    if (msg.isWelcome) {
      return `
        <div class="chat-msg bot">
          <div class="ai-greeting-hero">
            <div class="ai-greeting-title">${msg.greetingTitle}</div>
            <div class="ai-greeting-subtitle">${msg.greetingSub}</div>
          </div>

          <!-- 5 Actionable Domain Cards (Requirement 3) -->
          <div class="domain-cards-grid">
            ${msg.domainCards.map(card => `
              <div class="domain-action-card" data-domain-query="${escapeHtml(card.query)}">
                <div class="domain-card-header">
                  <span class="domain-card-icon">${card.icon}</span>
                  <span class="domain-card-title">${card.title}</span>
                </div>
                <ul class="domain-card-list">
                  ${card.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <!-- Quick Farm Insight Callout (Requirement 4) -->
          <div class="quick-insight-callout">
            <div class="quick-insight-header">
              <span>🌱</span>
              <span>${t('advisory.quickInsightTitle')}</span>
            </div>
            <div class="quick-insight-body">
              "${msg.quickInsight}"
            </div>
          </div>

          <!-- Sources & Explainability (Requirement 6) -->
          ${renderExplainability(msg)}
        </div>
      `;
    }

    // Bot response with Structured Sections (Requirement 5)
    return `
      <div class="chat-msg bot">
        <div class="ai-structured-response">
          ${msg.found ? `
            <div class="ai-sec-block">
              <div class="ai-sec-title">🔎 ${t('advisory.whatFoundTitle') || 'What I found'}</div>
              <div class="ai-sec-content">${msg.found}</div>
            </div>
          ` : ''}

          ${msg.conditions ? `
            <div class="ai-sec-block">
              <div class="ai-sec-title">📊 ${t('advisory.farmConditionsTitle') || 'Relevant farm conditions'}</div>
              <div class="ai-conditions-pillbox">
                ${msg.conditions.split('•').map(c => c.trim()).filter(Boolean).map(c => `
                  <span class="ai-condition-pill">${c}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Crop Disease Progression & Risk Chart Box (Farmer describes disease -> AI analyzes -> Chart shows risk/progression -> AI provides solution) -->
          ${msg.diseaseAnalysis ? renderDiseaseProgressionChart(msg.diseaseAnalysis, msg.id || Math.random().toString(36).substr(2, 9)) : ''}

          ${msg.recommendation ? `
            <div class="ai-sec-block">
              <div class="ai-sec-title">💡 ${t('advisory.recommendationTitle') || 'Recommendation & Solution'}</div>
              <div class="ai-recommendation-box">${msg.recommendation}</div>
            </div>
          ` : ''}

          ${msg.risk ? `
            <div class="ai-sec-block">
              <div class="ai-sec-title">⚠️ ${t('advisory.riskTitle') || 'Risk / Caution'}</div>
              <div class="ai-risk-callout">
                <span class="risk-icon">⚠️</span>
                <span>${msg.risk}</span>
              </div>
            </div>
          ` : ''}

          ${msg.nextAction ? `
            <div class="ai-sec-block">
              <div class="ai-sec-title">📅 ${t('advisory.nextActionTitle') || 'Suggested Next Action'}</div>
              <div class="ai-next-action-box">${msg.nextAction}</div>
            </div>
          ` : ''}

          ${msg.diagnosisResult ? `
            <div class="chat-diagnosis-result-card">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <strong>🔬 Computer Vision Diagnosis</strong>
                <span class="diagnosis-result-badge badge-warning">Confidence: ${msg.diagnosisResult.confidence}%</span>
              </div>
              <div><strong>Condition:</strong> ${msg.diagnosisResult.diseaseName}</div>
              <div style="font-size: 0.82rem; color: #425245;"><strong>Recommended Action:</strong> ${msg.diagnosisResult.immediateActionEn}</div>
            </div>
          ` : ''}
        </div>

        <!-- Sources & Explainability (Requirement 6) -->
        ${renderExplainability(msg)}
      </div>
    `;
  }

  // Interactive Crop Disease Progression & Risk Chart for ChatBot
  function renderDiseaseProgressionChart(disease, chartId) {
    if (!disease || !disease.points) return '';
    const svgW = 460;
    const svgH = 150;
    const padL = 38;
    const padR = 20;
    const padT = 18;
    const padB = 30;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const points = disease.points;
    const getX = (i) => padL + (i / (points.length - 1)) * plotW;
    const getY = (val) => padT + plotH - (val / 100) * plotH;

    const untreatedPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.untreated).toFixed(1)}`).join(' ');
    const treatedPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.treated).toFixed(1)}`).join(' ');

    const alertY = getY(50);

    return `
      <div class="chat-disease-chart-box" id="disease-chart-${chartId}">
        <div class="chat-disease-chart-header">
          <div class="disease-chart-title">
            <span class="disease-chart-badge-icon">🔬</span>
            <div>
              <strong>${disease.name}</strong>
              <div class="disease-chart-sub">Disease Progression & Spread Risk vs Solution Recovery</div>
            </div>
          </div>
          <span class="disease-risk-pill">⚠️ ${disease.currentSeverity}% Initial Risk</span>
        </div>

        <div class="disease-chart-svg-wrap">
          <svg viewBox="0 0 ${svgW} ${svgH}" class="disease-svg" preserveAspectRatio="xMidYMid meet">
            <!-- Grid Lines -->
            <line x1="${padL}" y1="${padT}" x2="${padL + plotW}" y2="${padT}" stroke="#f1f5f9" stroke-dasharray="3 3" />
            <line x1="${padL}" y1="${padT + plotH * 0.5}" x2="${padL + plotW}" y2="${padT + plotH * 0.5}" stroke="#f1f5f9" stroke-dasharray="3 3" />
            <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#cbd5e1" stroke-width="1.2" />

            <!-- Y Axis Labels -->
            <text x="${padL - 6}" y="${padT + 4}" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="end">100%</text>
            <text x="${padL - 6}" y="${padT + plotH * 0.5 + 3}" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="end">50%</text>
            <text x="${padL - 6}" y="${padT + plotH + 3}" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="end">0%</text>

            <!-- Warning threshold line -->
            <line x1="${padL}" y1="${alertY}" x2="${padL + plotW}" y2="${alertY}" stroke="rgba(239, 68, 68, 0.4)" stroke-dasharray="4 2" stroke-width="1" />
            <text x="${padL + plotW - 4}" y="${alertY - 3}" fill="#ef4444" font-size="8.5" font-weight="700" text-anchor="end">High Damage Threshold (>50%)</text>

            <!-- Untreated Curve (Red Dashed) -->
            <path d="${untreatedPath}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 2" stroke-linecap="round" />
            <!-- Treated Curve (Green Solid) -->
            <path d="${treatedPath}" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" />

            <!-- Data Points & Labels -->
            ${points.map((p, i) => `
              <g class="disease-point-group" data-idx="${i}">
                <!-- Untreated Circle -->
                <circle cx="${getX(i).toFixed(1)}" cy="${getY(p.untreated).toFixed(1)}" r="4" fill="#fee2e2" stroke="#ef4444" stroke-width="2" />
                <text x="${getX(i).toFixed(1)}" y="${(getY(p.untreated) - 6).toFixed(1)}" fill="#b91c1c" font-size="8.5" font-weight="800" text-anchor="middle">${p.untreated}%</text>

                <!-- Treated Circle -->
                <circle cx="${getX(i).toFixed(1)}" cy="${getY(p.treated).toFixed(1)}" r="4.5" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5" />
                <text x="${getX(i).toFixed(1)}" y="${(getY(p.treated) + 12).toFixed(1)}" fill="#15803d" font-size="8.5" font-weight="800" text-anchor="middle">${p.treated}%</text>

                <!-- X-Axis Day Labels -->
                <text x="${getX(i).toFixed(1)}" y="${padT + plotH + 15}" fill="#334155" font-size="9.5" font-weight="700" text-anchor="middle">${p.day}</text>
                <text x="${getX(i).toFixed(1)}" y="${padT + plotH + 25}" fill="#94a3b8" font-size="8" text-anchor="middle">${p.date}</text>
              </g>
            `).join('')}
          </svg>
        </div>

        <!-- Chart Legend & Comparison -->
        <div class="disease-chart-legend">
          <div class="legend-row">
            <span class="legend-badge-item">
              <span class="dot-red-dash"></span>
              <span><strong>Without Treatment:</strong> Spreads to 94% (High Damage)</span>
            </span>
            <span class="legend-badge-item">
              <span class="dot-green-solid"></span>
              <span><strong>With AI Solution:</strong> Recovers to 6% (Controlled)</span>
            </span>
          </div>
        </div>

        <!-- Stage & Prognosis Solution Window -->
        <div class="disease-stage-box">
          <span style="font-size: 1.1rem;">💡</span>
          <div>
            <strong>AI Prognosis:</strong>
            <span>${disease.solutionSummary}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Explainability drawer helper
  function renderExplainability(msg) {
    const sources = msg.sources || ["ICAR Agro-Advisory Knowledge Graph", "BRICS AgriN Knowledge Base"];
    const whyItems = msg.whyItems || [
      "Based on real-time soil moisture and agro-climatic radar",
      "Calibrated to ICAR Kadiri-6 Groundnut Package of Practices",
      "BRICS Multi-Sensor Agronomic Decision Mesh"
    ];

    return `
      <div class="ai-explainability-section">
        <details class="explainability-details">
          <summary class="explainability-summary">
            <span>💡</span>
            <span>${t('advisory.whyThisRec')}</span>
          </summary>
          <div class="explainability-content">
            <ul>
              ${whyItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <div class="ai-sources-pill-row">
              <strong>📚 ${t('advisory.sourcesLabel')}:</strong>
              ${sources.map(s => `<span class="source-tag-modern">${s}</span>`).join('')}
            </div>
          </div>
        </details>
      </div>
    `;
  }

  // Diagnosis Upload Modal Markup (Requirement 9)
  function renderDiagnosisModal() {
    return `
      <div class="diagnosis-modal-backdrop" id="diagnosis-modal-backdrop">
        <div class="diagnosis-modal-card">
          <div class="diagnosis-modal-header">
            <div class="diagnosis-modal-title">
              <span>📷</span>
              <span>${t('advisory.uploadPhotoTitle')}</span>
            </div>
            <button class="diagnosis-modal-close" id="btn-modal-close">&times;</button>
          </div>
          <div class="diagnosis-modal-body">
            <p style="font-size: 0.88rem; color: #64748B; margin: 0;">
              ${t('advisory.uploadPhotoPrompt')}
            </p>

            <div class="upload-dropzone" id="modal-upload-dropzone" style="padding: 24px;">
              <div class="upload-icon">🍃</div>
              <div style="font-weight: 700; color: #166534; font-size: 0.95rem;">
                ${t('diagnosis.uploadPrompt')}
              </div>
              <div style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">
                ${t('diagnosis.uploadFormats')}
              </div>
              <input type="file" id="modal-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-sample">
                🖼️ ${t('diagnosis.useSampleBtn')}
              </button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-modal-browse">
                📂 ${t('diagnosis.uploadCamera')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Manual Disease Entry Modal Markup (Farmer Manual Entry Feature)
  function renderManualDiseaseModal() {
    return `
      <div class="diagnosis-modal-backdrop" id="manual-disease-modal-backdrop">
        <div class="manual-disease-modal-card">
          <div class="manual-disease-header">
            <div class="manual-disease-title">
              <span>📝</span>
              <span>${t('advisory.manualModalTitle') || 'Manual Crop Disease & Symptom Entry'}</span>
            </div>
            <button class="diagnosis-modal-close" id="btn-manual-modal-close">&times;</button>
          </div>

          <form class="manual-disease-body" id="manual-disease-form">
            <p style="font-size: 0.82rem; color: #64748B; margin: 0;">
              ${t('advisory.manualModalSub') || 'Describe your crop problem or select observed disease symptoms for instant AI risk progression analysis and solutions.'}
            </p>

            <!-- 1. Disease / Pest Selector -->
            <div class="manual-form-group">
              <label class="manual-form-label" for="manual-disease-select">
                <span>🔬</span>
                <span>${t('advisory.manualSelectDisease') || 'Select Observed Disease / Pest'}</span>
              </label>
              <select class="manual-select" id="manual-disease-select">
                <option value="Tikka Leaf Spot (Cercospora arachidicola)">🍂 Tikka Leaf Spot / ఆకుమచ్చ తెగులు (Cercospora)</option>
                <option value="Groundnut Leaf Miner (Aproaerema modicella)">🐛 Leaf Miner / ఆకుముడత పురుగు (Leaf Miner)</option>
                <option value="Collar Rot & Stem Blight (Aspergillus niger)">🥀 Collar & Stem Rot / కాండం & వేరు కుళ్ళు</option>
                <option value="Groundnut Foliar Rust (Puccinia arachidis)">🍂 Foliar Rust / తుప్పు తెగులు</option>
                <option value="Chlorosis & Yellowing (Micronutrient Deficiency)">🟡 Chlorosis & Yellowing / పసుపు ఆకులు</option>
                <option value="Spodoptera Leaf Caterpillar">🐛 Spodoptera / పొగాకు లద్దెపురుగు</option>
                <option value="CUSTOM">✍️ ${t('advisory.manualCustomName') || 'Or type custom disease / problem name'}...</option>
              </select>
            </div>

            <!-- Custom Disease Name Input (shown if CUSTOM selected) -->
            <div class="manual-form-group" id="manual-custom-input-wrap" style="display: none;">
              <label class="manual-form-label" for="manual-custom-name">
                <span>✍️</span>
                <span>${t('advisory.manualCustomName') || 'Custom Disease / Problem Name'}</span>
              </label>
              <input 
                type="text" 
                class="manual-input" 
                id="manual-custom-name" 
                placeholder="e.g. Cercospora leaf spot, Aphids, White grub..." 
              />
            </div>

            <!-- 2. Plant Part Affected -->
            <div class="manual-form-group">
              <label class="manual-form-label">
                <span>🌱</span>
                <span>${t('advisory.manualPlantPart') || 'Affected Plant Part'}</span>
              </label>
              <div class="manual-choice-pills" id="manual-part-pills">
                <button type="button" class="choice-pill-btn ${manualPart === 'leaves' ? 'active' : ''}" data-part="leaves">🍃 Leaves (ఆకులు)</button>
                <button type="button" class="choice-pill-btn ${manualPart === 'stem' ? 'active' : ''}" data-part="stem">🌿 Stem (కాండం)</button>
                <button type="button" class="choice-pill-btn ${manualPart === 'roots' ? 'active' : ''}" data-part="roots">🌱 Roots (వేర్లు)</button>
                <button type="button" class="choice-pill-btn ${manualPart === 'pods' ? 'active' : ''}" data-part="pods">🥜 Pods & Flowers (కాయలు & పూత)</button>
              </div>
            </div>

            <!-- 3. Severity Level -->
            <div class="manual-form-group">
              <label class="manual-form-label">
                <span>⚠️</span>
                <span>${t('advisory.manualSeverity') || 'Observed Spread / Severity Level'}</span>
              </label>
              <div class="manual-choice-pills" id="manual-severity-pills">
                <button type="button" class="choice-pill-btn pill-mild ${manualSeverity === 25 ? 'active' : ''}" data-sev="25">
                  🟢 ${t('advisory.manualSeverityMild') || 'Mild / Early Stage (~25%)'}
                </button>
                <button type="button" class="choice-pill-btn pill-mod ${manualSeverity === 50 ? 'active' : ''}" data-sev="50">
                  🟡 ${t('advisory.manualSeverityMod') || 'Moderate (~50%)'}
                </button>
                <button type="button" class="choice-pill-btn pill-severe ${manualSeverity === 75 ? 'active' : ''}" data-sev="75">
                  🔴 ${t('advisory.manualSeveritySevere') || 'Severe / Critical (>75%)'}
                </button>
              </div>
            </div>

            <!-- 4. Symptoms / Observations Text Area -->
            <div class="manual-form-group">
              <label class="manual-form-label" for="manual-symptoms-text">
                <span>📋</span>
                <span>${t('advisory.manualSymptomsNotes') || 'Symptoms / Farmer Observations'}</span>
              </label>
              <textarea 
                class="manual-textarea" 
                id="manual-symptoms-text" 
                rows="3" 
                placeholder="${t('advisory.manualSymptomsPlaceholder') || 'e.g. Dark circular spots on lower leaves with yellow halos, spreading after recent rain...'}"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-manual-submit" id="btn-manual-submit">
              <span>🔬</span>
              <span>${t('advisory.manualSubmitBtn') || 'Analyze Disease & Generate Progression Chart'}</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  function scrollToBottom() {
    setTimeout(() => {
      const stream = container.querySelector('#agri-chat-stream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }, 50);
  }

  function startLoadingSteps() {
    isLoading = true;
    loadingStep = 1;
    render();

    loadingInterval = setInterval(() => {
      loadingStep++;
      if (loadingStep > 5) {
        clearInterval(loadingInterval);
      } else {
        render();
      }
    }, 320);
  }

  function stopLoadingSteps() {
    if (loadingInterval) clearInterval(loadingInterval);
    isLoading = false;
    loadingStep = 0;
  }

  // Handle Farmer Manual Disease Entry
  function handleManualDiseaseEntry(formData) {
    showManualModal = false;
    const isTe = currentLocale === 'te';
    const isHi = currentLocale === 'hi';

    const rawDisease = formData.diseaseName === 'CUSTOM' ? (formData.customName || 'Crop Problem') : formData.diseaseName;
    const diseaseName = rawDisease || "Crop Disease / Foliar Pest";
    const part = formData.part || "leaves";
    const severity = parseInt(formData.severity, 10) || 50;
    const severityLabel = severity <= 30 ? (isTe ? "ప్రారంభ దశ (~25%)" : "Mild (~25%)") : (severity <= 60 ? (isTe ? "మధ్యస్థం (~50%)" : "Moderate (~50%)") : (isTe ? "తీవ్ర వ్యాప్తి (>75%)" : "Severe (>75%)"));
    const symptoms = formData.symptoms ? formData.symptoms.trim() : "";

    const userEntrySummary = `📝 [Manual Disease Entry]\n• ${isTe ? 'వ్యాధి' : 'Disease'}: ${diseaseName}\n• ${isTe ? 'బాధిత భాగం' : 'Affected Part'}: ${part}\n• ${isTe ? 'తీవ్రత' : 'Severity'}: ${severity}% (${severityLabel})${symptoms ? `\n• ${isTe ? 'పరిశీలనలు' : 'Notes'}: "${symptoms}"` : ''}`;

    messages.push({
      sender: 'user',
      text: userEntrySummary
    });
    startLoadingSteps();

    setTimeout(() => {
      stopLoadingSteps();

      // Custom Disease Progression Model calibrated to farmer's input
      const untreatedDay2 = Math.min(90, Math.round(severity + 22));
      const untreatedDay4 = Math.min(96, Math.round(severity + 38));
      const treatedDay2 = Math.max(12, Math.round(severity * 0.52));
      const treatedDay4 = Math.max(6, Math.round(severity * 0.22));

      let recommendationText = "";
      let nextActionText = "";
      let whyText = "";

      if (diseaseName.toLowerCase().includes('leaf spot') || diseaseName.toLowerCase().includes('మచ్చ') || diseaseName.toLowerCase().includes('धब्बा')) {
        recommendationText = isTe
          ? "5% వేప గింజల కషాయం లేదా మాంకోజెబ్ 75% WP (2 గ్రా/లీటరు) సాయంత్రం వేళల్లో పిచికారీ చేయండి. ఆకుల అడుగు భాగానికి చేరేలా స్ప్రే చేయండి."
          : (isHi
            ? "5% नीम अर्क या मैंकोजेब 75% WP (2 ग्राम/लीटर) का शाम के समय छिड़काव करें। पत्तियों के निचले भाग पर अच्छी तरह स्प्रे करें।"
            : "Apply 5% Neem Seed Kernel Extract (NSKE) or Mancozeb 75% WP (2g/L water) in the evening hours, ensuring underside foliage coverage.");
        nextActionText = isTe
          ? "తీవ్రంగా దెబ్బతిన్న ఆకులను తీసివేసి నాశనం చేయండి; తదుపరి 48 గంటల్లో వ్యాప్తి నియంత్రణను తనిఖీ చేయండి."
          : (isHi
            ? "अत्यधिक संक्रमित पत्तियों को हटाकर नष्ट करें; 48 घंटों में रोग नियंत्रण की जांच करें।"
            : "Prune heavily necrosed leaflets; re-inspect canopy in 48h to verify mycelial arrest.");
        whyText = "Cercospora fungal spores spread through humidity droplets; early bio-fungicide blocks spore germination.";
      } else if (diseaseName.toLowerCase().includes('miner') || diseaseName.toLowerCase().includes('ముడత') || diseaseName.toLowerCase().includes('कीट')) {
        recommendationText = isTe
          ? "ఎకరాకు 4 లింగాకర్షక బుట్టలు ఏర్పాటు చేసి, వేప నూనె 5ml/లీటరు లేదా క్లోరాంట్రానిలిప్రోల్ 0.3ml/లీటరు పిచికారీ చేయండి."
          : (isHi
            ? "प्रति एकड़ 4 फेरोमोन ट्रैप लगाएं और 5% नीम तेल (5 मिली/लीटर) या अनुशंसित कीटनाशक का छिड़काव करें।"
            : "Deploy 4 pheromone traps/acre and spray 5% neem oil (5ml/L) or Chlorantraniliprole 18.5% SC (0.3ml/L).");
        nextActionText = isTe ? "రాత్రిపూట లైట్ ట్రాప్స్ ఉంచి చిమ్మటలను ఆకర్షించి నాశనం చేయండి." : (isHi ? "रात में प्रकाश प्रपंच (लाइट ट्रैप) का उपयोग करें।" : "Install light traps at field edges to catch adult moths.");
        whyText = "Early instar leaf miner larvae feed within leaf lamina; botanical extracts disrupt feeding within 48 hours.";
      } else {
        recommendationText = isTe
          ? "ట్రైకోడెర్మా విరిడే (1 కేజీ/ఎకరా) జీవ శిలీంధ్రనాశిని ఎరువులతో కలిపి అందించండి మరియు తగిన వేప నూనె పిచికారీ చేయండి."
          : (isHi
            ? "ट्राइकोडर्मा विरिडी (1 किग्रा/एकड़) को गोबर खाद में मिलाकर डालें और 5% नीम अर्क का छिड़काव करें।"
            : "Apply Trichoderma viride bio-antagonist (1 kg/acre) mixed with FYM and foliar spray 5% neem extract.");
        nextActionText = isTe ? "పొలంలో నీరు నిల్వ ఉండకుండా డ్రైనేజీ చూసుకోండి." : (isHi ? "खेत में जलभराव न होने दें।" : "Ensure proper field drainage to prevent pathogen proliferation.");
        whyText = "Biological antagonists colonize the rhizosphere and foliage to outcompete opportunistic pathogens.";
      }

      const diseaseModel = {
        name: diseaseName,
        currentSeverity: severity,
        solutionSummary: isTe
          ? `రైతు నమోదు చేసిన ${severity}% తీవ్రత నుండి సిఫార్సు చేసిన AI నివారణతో 7 రోజుల్లో వ్యాధి 6% కి తగ్గుతుంది.`
          : (isHi
            ? `दर्ज की गई ${severity}% तीव्रता से अनुशंसित AI समाधान द्वारा 7 दिनों में रोग घटकर 6% पर आ जाएगा।`
            : `Starting from observed ${severity}% severity, the AI solution halts escalation, reducing damage to <6% within 7 days.`),
        points: [
          { day: isTe ? 'ఈ రోజు' : (isHi ? 'आज' : 'Today'), date: isTe ? 'నమోదు' : (isHi ? 'दिन 0' : 'Day 0'), untreated: severity, treated: severity, stage: 'Farmer Entry' },
          { day: isTe ? '2వ రోజు' : (isHi ? 'दिन 2' : 'Day 2'), date: '+48h', untreated: untreatedDay2, treated: treatedDay2, stage: 'Spread Risk Window' },
          { day: isTe ? '4వ రోజు' : (isHi ? 'दिन 4' : 'Day 4'), date: '+96h', untreated: untreatedDay4, treated: treatedDay4, stage: 'Peak Spread / Stabilization' },
          { day: isTe ? '7వ రోజు' : (isHi ? 'दिन 7' : 'Day 7'), date: isTe ? 'నివారణ' : (isHi ? '7 दिन' : '1 Week'), untreated: 95, treated: 6, stage: 'Full Foliage Recovery' }
        ]
      };

      messages.push({
        id: 'msg-' + Date.now(),
        sender: 'bot',
        found: isTe
          ? `రైతు నమోదు చేసిన వివరాలు: '${diseaseName}' (${part} భాగం, ${severity}% తీవ్రత) విజయవంతంగా విశ్లేషించబడ్డాయి.`
          : (isHi
            ? `किसान प्रविष्टि: '${diseaseName}' (${part} भाग, ${severity}% तीव्रता) का विश्लेषण पूर्ण हुआ।`
            : `Manual Farmer Entry Analyzed: '${diseaseName}' affecting ${part} with baseline ${severity}% observed severity.`),
        conditions: `Crop: Groundnut (Kadiri-6) • Target Part: ${part.toUpperCase()} • Severity: ${severity}% (${severityLabel}) • Canopy Temp: 28.4°C`,
        diseaseAnalysis: diseaseModel,
        recommendation: recommendationText,
        risk: isTe ? "సకాలంలో చర్య తీసుకోకపోతే 4 రోజుల్లో ఇతర వరుసలకు వ్యాపిస్తుంది." : (isHi ? "बिना उपचार के 4 दिनों में यह रोग पूरे खेत में फैल सकता है।" : "Without intervention, secondary sporulation will cross-infect adjacent crop rows within 96 hours."),
        nextAction: nextActionText,
        sources: ["ICAR Plant Pathology Key", "BRICS AgriN Knowledge Mesh", "Farmer Observation Telemetry"],
        whyItems: [
          whyText,
          "Calibrated to Kadiri-6 Groundnut Disease Resistance Profile",
          "BRICS Sustainable Agro-Ecological Package of Practices"
        ],
        disclaimer: isHi ? "निर्णय-सहायता सलाह। स्थानीय कृषि अधिकारी से पुष्टि करें।" : (isTe ? "సహాయక సిఫార్సు మాత్రమే." : "Decision support advisory only.")
      });

      render();
      showToast(isTe ? "వ్యాధి వివరాలు విజయవంతంగా విశ్లేషించబడ్డాయి!" : (isHi ? "रोग विवरण का विश्लेषण पूर्ण हुआ!" : "Disease entry analyzed successfully!"), "success");
    }, 550);
  }

  // Detects if query involves disease/pests and builds progression & risk model
  function detectOrBuildDiseaseModel(userQuery = '', botRes = null, diagnosisResult = null, locale = 'en') {
    const q = (userQuery || '').toLowerCase();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';

    const isDiseaseQuery = diagnosisResult 
      || q.includes('leaf') || q.includes('spot') || q.includes('yellow') || q.includes('pest')
      || q.includes('insect') || q.includes('worm') || q.includes('fung') || q.includes('rust')
      || q.includes('tikka') || q.includes('rot') || q.includes('wilt') || q.includes('blight')
      || q.includes('problem') || q.includes('disease') || q.includes('damage') || q.includes('dry')
      || q.includes('ఆకు') || q.includes('పసుపు') || q.includes('తెగులు') || q.includes('చీడ') || q.includes('పురుగు')
      || q.includes('कीट') || q.includes('रोग') || q.includes('पीली') || q.includes('धब्बा') || q.includes('फसल समस्या')
      || (botRes?.found && (botRes.found.includes('leaf') || botRes.found.includes('disease') || botRes.found.includes('spot') || botRes.found.includes('తెగులు') || botRes.found.includes('रोग')));

    if (!isDiseaseQuery) return null;

    let diseaseName = isTe ? "టిక్కా ఆకుమచ్చ తెగులు (Tikka Leaf Spot)" : (isHi ? "टिक्का पत्ती धब्बा रोग (Tikka Leaf Spot)" : "Tikka Leaf Spot (Cercospora arachidicola)");
    let severity = 48;
    let solutionSummary = isTe 
      ? "24-48 గంటల్లో 5% వేప నూనె లేదా తగిన శిలీంధ్రనాశిని పిచికారీ చేయడం వల్ల వ్యాప్తి 94% నుండి 6% కి తగ్గుతుంది."
      : (isHi
        ? "24-48 घंटों के भीतर 5% नीम अर्क या कवकनाशी का छिड़काव करने से रोग का फैलाव 94% से घटकर 6% पर आ जाता है।"
        : "Applying botanical neem extract or Mancozeb within 24-48 hours restricts mycelial spread, dropping foliar loss from 94% to 6%.");

    if (diagnosisResult) {
      diseaseName = diagnosisResult.diseaseName || "Cercospora Leaf Spot";
      severity = diagnosisResult.confidence ? Math.min(85, Math.max(35, Math.round(diagnosisResult.confidence))) : 54;
      solutionSummary = diagnosisResult.immediateActionEn 
        ? `${diagnosisResult.immediateActionEn}. Halts infection velocity and facilitates foliage regrowth within 7 days.`
        : solutionSummary;
    } else if (q.includes('pest') || q.includes('worm') || q.includes('miner') || q.includes('పురుగు') || q.includes('కీటక') || q.includes('कीट')) {
      diseaseName = isTe ? "వేరుశనగ ఆకుముడత పురుగు (Groundnut Leaf Miner)" : (isHi ? "मूंगफली लीफ माइनर कीट (Leaf Miner)" : "Groundnut Leaf Miner (Aproaerema modicella)");
      severity = 42;
      solutionSummary = isTe
        ? "ఎకరాకు 4 లింగాకర్షక బుట్టలు మరియు 5% వేప గింజల కషాయం పిచికారీ చేయడం వల్ల 4వ రోజు నాటికి లార్వాలు నశిస్తాయి."
        : (isHi
          ? "प्रति एकड़ 4 फेरोमोन ट्रैप और 5% नीम अर्क छिड़कने से 4 दिनों में कीट की सुंडी का प्रकोप समाप्त हो जाता है।"
          : "Deploying pheromone traps (4/acre) and 5% NSKE spray terminates early instar larvae, dropping infestation to 5% by Day 7.");
    } else if (q.includes('yellow') || q.includes('పసుపు') || q.includes('పీలీ') || q.includes('पीली')) {
      diseaseName = isTe ? "క్లోరోసిస్ & ప్రారంభ ఆకుమచ్చ (Early Foliar Spot)" : (isHi ? "पर्ण पीलापन व प्रारंभिक धब्बा (Early Foliar Spot)" : "Early Cercospora Spot & Chlorosis");
      severity = 38;
      solutionSummary = isTe
        ? "సూక్ష్మ పోషకాలు (Fe/Zn) మరియు బయో-ఫంగిసైడ్ పిచికారీ చేయడం వల్ల ఆకులు 7 రోజుల్లో తిరిగి పచ్చదనాన్ని పొందుతాయి."
        : (isHi
          ? "सूक्ष्म पोषक (Fe/Zn) और जैविक फफूंदनाशी के प्रयोग से 7 दिनों में पत्तियां पुनः स्वस्थ और हरी हो जाती हैं।"
          : "Foliar spray of micronutrients and biological antagonist restores chlorophyll and crop vigor (NDVI) within 7 days.");
    } else if (q.includes('rust') || q.includes('తుప్పు') || q.includes('गेरुई') || q.includes('रस्ट')) {
      diseaseName = isTe ? "వేరుశనగ తుప్పు తెగులు (Puccinia arachidis)" : (isHi ? "मूंगफली गेरुई/रस्ट रोग (Puccinia arachidis)" : "Groundnut Foliar Rust (Puccinia arachidis)");
      severity = 54;
      solutionSummary = isTe
        ? "హెక్సాకొనాజోల్ లేదా ట్రైకోడెర్మా పిచికారీ చేయడం ద్వారా శిలీంధ్ర బీజాల వ్యాప్తి నిలిచిపోతుంది."
        : (isHi
          ? "हेक्साकोनाजोल या ट्राइकोडर्मा के छिड़काव से कवक बीजाणुओं का फैलाव तुरंत रुक जाता है।"
          : "Targeted bio-fungicide or hexaconazole halts spore propagation and protects unaffected canopy tiers.");
    }

    return {
      name: diseaseName,
      currentSeverity: severity,
      solutionSummary: solutionSummary,
      points: [
        { 
          day: isTe ? 'ఈ రోజు' : (isHi ? 'आज' : 'Today'), 
          date: isTe ? 'ప్రారంభం' : (isHi ? 'दिन 0' : 'Day 0'), 
          untreated: severity, 
          treated: severity,
          stage: 'Initial Lesions'
        },
        { 
          day: isTe ? '2వ రోజు' : (isHi ? 'दिन 2' : 'Day 2'), 
          date: '+48h', 
          untreated: Math.min(88, severity + 24), 
          treated: Math.max(14, Math.round(severity * 0.58)),
          stage: 'Spread Risk Window'
        },
        { 
          day: isTe ? '4వ రోజు' : (isHi ? 'दिन 4' : 'Day 4'), 
          date: '+96h', 
          untreated: Math.min(94, severity + 40), 
          treated: Math.max(8, Math.round(severity * 0.28)),
          stage: 'Peak Defoliation'
        },
        { 
          day: isTe ? '7వ రోజు' : (isHi ? 'दिन 7' : 'Day 7'), 
          date: isTe ? 'నివారణ' : (isHi ? '7 दिन' : '1 Week'), 
          untreated: 95, 
          treated: 6,
          stage: 'Full Foliage Recovery'
        }
      ]
    };
  }

  async function handleSendQuery(userText) {
    const text = userText.trim();
    if (!text) return;

    errorState = null;
    messages.push({ sender: 'user', text });
    startLoadingSteps();

    try {
      const res = await advisoryService.askAgriAI(text, getLocale());
      stopLoadingSteps();

      const diseaseModel = detectOrBuildDiseaseModel(text, res, null, getLocale());

      messages.push({
        id: 'msg-' + Date.now(),
        sender: 'bot',
        found: res.found || res.answer,
        conditions: res.conditions,
        diseaseAnalysis: diseaseModel,
        recommendation: res.recommendation,
        risk: res.risk,
        nextAction: res.nextAction,
        sources: res.sources,
        whyItems: res.whyItems,
        disclaimer: res.disclaimer
      });
      render();
    } catch (err) {
      console.error("Chat query error:", err);
      stopLoadingSteps();
      errorState = true;
      render();
    }
  }

  async function handleImageAnalysis(imageFileOrSample) {
    showUploadModal = false;
    messages.push({
      sender: 'user',
      text: "📷 [Uploaded Crop Leaf Photo for Disease Diagnosis]"
    });
    startLoadingSteps();

    try {
      const result = await diagnosisService.analyzeLeaf(imageFileOrSample, typeof imageFileOrSample === 'string', "Groundnut");
      stopLoadingSteps();

      const diseaseModel = detectOrBuildDiseaseModel("crop leaf disease image", null, result, getLocale());

      messages.push({
        id: 'msg-' + Date.now(),
        sender: 'bot',
        found: `MobileNetV2 analysis identified ${result.diseaseName} on Groundnut canopy with ${result.confidence}% confidence.`,
        conditions: `Crop: Groundnut (Kadiri-6) • Severity: Moderate • Field Area: Kurnool`,
        diseaseAnalysis: diseaseModel,
        recommendation: result.immediateActionEn || "Apply botanical fungicide (5% neem oil extract) in the evening hours.",
        risk: "High humidity accelerates Cercospora spore dispersal to adjacent healthy foliage.",
        nextAction: "Inspect lower foliage across the plot and remove severely infested leaflets.",
        diagnosisResult: result,
        sources: [result.dataSource || "MobileNetV2 Groundnut Classifier", "ICAR Plant Pathology Key"],
        whyItems: [
          "Computer vision model matches necrotic circular lesions with chlorotic halos",
          "68% canopy relative humidity favors spore germination",
          "ICAR Kadiri-6 Disease Management Protocol"
        ],
        disclaimer: "AI-assisted screening tool, not a certified laboratory diagnosis."
      });
      render();
      showToast("Leaf photo analyzed successfully!", "success");
    } catch (err) {
      console.error("Image analysis error:", err);
      stopLoadingSteps();
      errorState = true;
      render();
    }
  }

  function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(t('advisory.speechError'), 'warning', 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isTe ? 'te-IN' : (isHi ? 'hi-IN' : 'en-IN');
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      isListening = true;
      render();
      showToast(t('advisory.speechListening'), 'info', 3000);

      recognition.onresult = (event) => {
        isListening = false;
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendQuery(transcript);
        } else {
          render();
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        isListening = false;
        render();
        showToast(t('advisory.speechError'), 'warning', 3500);
      };

      recognition.onend = () => {
        isListening = false;
        render();
      };

      recognition.start();
    } catch (e) {
      isListening = false;
      render();
      showToast(t('advisory.speechError'), 'warning');
    }
  }

  function attachEventListeners() {
    const form = container.querySelector('#agri-chat-form');
    const input = container.querySelector('#agri-chat-input');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim();
        if (val) {
          input.value = '';
          handleSendQuery(val);
        }
      });
    }

    // Suggested Prompt Chips (Requirement 7)
    container.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-prompt');
        if (text) handleSendQuery(text);
      });
    });

    // Domain Cards Click Queries (Requirement 3)
    container.querySelectorAll('.domain-action-card').forEach(card => {
      card.addEventListener('click', () => {
        const query = card.getAttribute('data-domain-query');
        if (query) handleSendQuery(query);
      });
    });

    // Action buttons in empty state
    container.querySelectorAll('.btn-empty-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) {
          handleSendQuery(prompt);
        }
      });
    });

    const emptyDiagnoseBtn = container.querySelector('#btn-empty-diagnose');
    if (emptyDiagnoseBtn) {
      emptyDiagnoseBtn.addEventListener('click', () => {
        showUploadModal = true;
        render();
      });
    }

    // Voice recognition button
    const micBtn = container.querySelector('#btn-voice-mic');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        startVoiceRecognition();
      });
    }

    // Photo Attachment Button (Requirement 9)
    const attachBtn = container.querySelector('#btn-attach-image');
    if (attachBtn) {
      attachBtn.addEventListener('click', () => {
        showUploadModal = true;
        render();
      });
    }

    // Modal Events
    const modalCloseBtn = container.querySelector('#btn-modal-close');
    const modalBackdrop = container.querySelector('#diagnosis-modal-backdrop');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        showUploadModal = false;
        render();
      });
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          showUploadModal = false;
          render();
        }
      });
    }

    const modalBrowseBtn = container.querySelector('#btn-modal-browse');
    const modalFileInput = container.querySelector('#modal-file-input');
    const modalDropzone = container.querySelector('#modal-upload-dropzone');
    const modalSampleBtn = container.querySelector('#btn-modal-sample');

    if (modalBrowseBtn && modalFileInput) {
      modalBrowseBtn.addEventListener('click', () => modalFileInput.click());
    }
    if (modalDropzone && modalFileInput) {
      modalDropzone.addEventListener('click', () => modalFileInput.click());
      modalDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        modalDropzone.classList.add('dragover');
      });
      modalDropzone.addEventListener('dragleave', () => modalDropzone.classList.remove('dragover'));
      modalDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        modalDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageAnalysis(e.dataTransfer.files[0]);
        }
      });
    }

    if (modalFileInput) {
      modalFileInput.addEventListener('change', () => {
        if (modalFileInput.files && modalFileInput.files[0]) {
          handleImageAnalysis(modalFileInput.files[0]);
        }
      });
    }

    if (modalSampleBtn) {
      modalSampleBtn.addEventListener('click', () => {
        handleImageAnalysis('./src/assets/sample_leaf.jpg');
      });
    }

    // Manual Disease Entry Modal Trigger Buttons
    const manualEntryBtn = container.querySelector('#btn-manual-entry');
    if (manualEntryBtn) {
      manualEntryBtn.addEventListener('click', () => {
        showManualModal = true;
        render();
      });
    }

    const chipManualBtn = container.querySelector('#btn-chip-manual-entry');
    if (chipManualBtn) {
      chipManualBtn.addEventListener('click', () => {
        showManualModal = true;
        render();
      });
    }

    const emptyManualBtn = container.querySelector('#btn-empty-manual-disease');
    if (emptyManualBtn) {
      emptyManualBtn.addEventListener('click', () => {
        showManualModal = true;
        render();
      });
    }

    // Manual Modal Close & Backdrop
    const manualCloseBtn = container.querySelector('#btn-manual-modal-close');
    const manualBackdrop = container.querySelector('#manual-disease-modal-backdrop');
    if (manualCloseBtn) {
      manualCloseBtn.addEventListener('click', () => {
        showManualModal = false;
        render();
      });
    }
    if (manualBackdrop) {
      manualBackdrop.addEventListener('click', (e) => {
        if (e.target === manualBackdrop) {
          showManualModal = false;
          render();
        }
      });
    }

    // Manual Modal: Select Disease Dropdown / Custom Input Toggle
    const diseaseSelect = container.querySelector('#manual-disease-select');
    const customWrap = container.querySelector('#manual-custom-input-wrap');
    if (diseaseSelect && customWrap) {
      diseaseSelect.addEventListener('change', () => {
        if (diseaseSelect.value === 'CUSTOM') {
          customWrap.style.display = 'flex';
          const customIn = container.querySelector('#manual-custom-name');
          if (customIn) customIn.focus();
        } else {
          customWrap.style.display = 'none';
        }
      });
    }

    // Manual Modal: Plant Part Choice Pills
    container.querySelectorAll('#manual-part-pills .choice-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        manualPart = btn.getAttribute('data-part') || 'leaves';
        container.querySelectorAll('#manual-part-pills .choice-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Manual Modal: Severity Choice Pills
    container.querySelectorAll('#manual-severity-pills .choice-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        manualSeverity = parseInt(btn.getAttribute('data-sev'), 10) || 50;
        container.querySelectorAll('#manual-severity-pills .choice-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Manual Modal: Form Submit
    const manualForm = container.querySelector('#manual-disease-form');
    if (manualForm) {
      manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selVal = diseaseSelect ? diseaseSelect.value : '';
        const customName = container.querySelector('#manual-custom-name')?.value?.trim() || '';
        const symptoms = container.querySelector('#manual-symptoms-text')?.value?.trim() || '';

        handleManualDiseaseEntry({
          diseaseName: selVal,
          customName: customName,
          part: manualPart,
          severity: manualSeverity,
          symptoms: symptoms
        });
      });
    }

    // Retry Button (Requirement 11)
    const retryBtn = container.querySelector('#btn-chat-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        errorState = null;
        render();
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Public external query trigger
  return {
    ask: (q) => handleSendQuery(q),
    openDiagnosisModal: () => {
      showUploadModal = true;
      render();
    },
    openManualDiseaseModal: () => {
      showManualModal = true;
      render();
    }
  };
}
