import { t, getLocale } from '../i18n/index.js';
import { showToast } from './Toast.js';

export function renderAdvisoryCard(advisory, { onToggleComplete }) {
  const locale = getLocale();
  const isTe = locale === 'te';
  const isHi = locale === 'hi';

  const HI_ADVISORIES = {
    'adv-001': {
      title: "सिंचाई 24 घंटे के लिए टालें और निचली पत्तियों की जांच करें",
      reason: "मिट्टी की नमी (34%), फूल आने की अवस्था, अगले 72 घंटों में 18 मिमी बारिश के पूर्वानुमान और स्थिर उपग्रह NDVI सूचकांक पर आधारित सिफ़ारिश।",
      action: "रविवार शाम तक निर्धारित सिंचाई चक्र को टालें। बोरवेल पंप चलाने से पहले कल सुबह खेत का निरीक्षण करें। निचली पत्तियों के नीचे गहरे भूरे धब्बों की जांच करें।",
      benefit: "लगभग 1,800 kWh पंपिंग बिजली की बचत होती है, जड़ क्षेत्र में जलभराव से बचाव होता है और बारिश के दौरान कवक के प्रसार को रोकता है।"
    },
    'adv-002': {
      title: "टिक्का पत्ती धब्बा रोग (Early Leaf Spot) के बढ़ते जोखिम की चेतावनी",
      reason: "उच्च सापेक्ष आर्द्रता (68%) और 7 घंटे से अधिक समय तक रात में पत्तियों का गीला रहना सर्कोस्पोरा कवक अंकुरण के लिए अनुकूल वातावरण बनाता है।",
      action: "संदिग्ध निचली पत्तियों की तस्वीर 'फसल रोग निदान' में अपलोड करें। यदि धब्बों की पुष्टि हो, तो शाम को ट्राइकोडर्मा या 5% नीम अर्क का छिड़काव करें।",
      benefit: "पत्तियों के समय से पहले गिरने को रोकता है, जिससे फलियों के विकास के लिए सक्रिय प्रकाश संश्लेषण क्षेत्र बना रहता है।"
    },
    'adv-003': {
      title: "सुइयां (Pegs) बनने की अवस्था (40-45 दिन) पर जिप्सम डालें",
      reason: "मूंगफली की फलियों के समुचित विकास और दानों में तेल प्रतिशत बढ़ाने के लिए इस अवस्था में कैल्शियम और सल्फर की आवश्यकता होती है।",
      action: "प्रति एकड़ 200 किग्रा जिप्सम पौधों की जड़ों के पास समान रूप से डालें और हल्की मिट्टी चढ़ाएं।",
      benefit: "खोखली फलियों (पॉप्स) की समस्या 60% तक कम होती है और दानों का वजन व गुणवत्ता बढ़ती है।"
    },
    'adv-004': {
      title: "तम्बाकू इल्ली और रस चूसक कीटों की रोकथाम के लिए फेरोमोन ट्रैप लगाएं",
      reason: "तापमान में वृद्धि और उमस से कीटों की संख्या में अचानक वृद्धि की संभावना है।",
      action: "प्रति एकड़ 4-5 फेरोमोन ट्रैप और पीली चिपचिपी पट्टियां (Yellow Sticky Traps) लगाएं।",
      benefit: "बिना किसी रासायनिक कीटनाशक के शुरुआती स्तर पर कीटों की प्रभावी निगरानी व प्राकृतिक रोकथाम।"
    }
  };

  const hiAdv = HI_ADVISORIES[advisory.id] || {};
  const title = isTe ? (advisory.titleTe || advisory.titleEn) : (isHi ? (hiAdv.title || advisory.titleHi || advisory.titleEn) : advisory.titleEn);
  const reason = isTe ? (advisory.reasonTe || advisory.reasonEn) : (isHi ? (hiAdv.reason || advisory.reasonHi || advisory.reasonEn) : advisory.reasonEn);
  const action = isTe ? (advisory.actionTe || advisory.actionEn) : (isHi ? (hiAdv.action || advisory.actionHi || advisory.actionEn) : advisory.actionEn);
  const benefit = isTe ? (advisory.benefitTe || advisory.benefitEn) : (isHi ? (hiAdv.benefit || advisory.benefitHi || advisory.benefitEn) : advisory.benefitEn);

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
