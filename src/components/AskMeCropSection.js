import { t, getLocale } from '../i18n/index.js';
import { farmService } from '../services/farmService.js';
import { advisoryService } from '../services/advisoryService.js';
import { showToast } from './Toast.js';

/**
 * AskMeCropSection Component
 * Dedicated "Ask Me" section where farmers can ask questions specifically tailored to any crop,
 * receiving crop-calibrated AI advisory, specific chemical/organic dosages, disease remedies,
 * irrigation timing, and audio voice read-out.
 */
export function renderAskMeCropSection(container, { farm = null, weather = null } = {}) {
  const locale = getLocale();
  const isTe = locale === 'te';
  const isHi = locale === 'hi';

  // Crop Catalog with regional calibration
  const CROP_CATALOG = [
    {
      id: 'groundnut',
      nameEn: 'Groundnut',
      nameTe: 'వేరుశనగ',
      nameHi: 'मूंगफली',
      icon: '🥜',
      varieties: ['Kadiri-6 (K6)', 'Kadiri-9', 'Dharani', 'TAG-24', 'JL-24', 'Narayani'],
      defaultStage: 'flowering',
      stages: [
        { id: 'sowing', labelEn: 'Sowing (0-15 DAS)', labelTe: 'విత్తే దశ (0-15 రోజులు)', labelHi: 'बुवाई (0-15 दिन)' },
        { id: 'vegetative', labelEn: 'Vegetative (15-35 DAS)', labelTe: 'ఎదుగుదల దశ (15-35 రోజులు)', labelHi: 'वानस्पतिक (15-35 दिन)' },
        { id: 'flowering', labelEn: 'Flowering & Pegging (35-60 DAS)', labelTe: 'పూత & ఊడల దశ (35-60 రోజులు)', labelHi: 'फूल व पेगिंग (35-60 दिन)' },
        { id: 'pod', labelEn: 'Pod Development (60-90 DAS)', labelTe: 'కాయ ఊరే దశ (60-90 రోజులు)', labelHi: 'फली विकास (60-90 दिन)' },
        { id: 'maturity', labelEn: 'Maturity & Harvest (90-110 DAS)', labelTe: 'పక్వ దశ & కోత (90-110 రోజులు)', labelHi: 'परिपक्वता व कटाई' }
      ],
      quickQuestions: [
        { en: "When and how much Gypsum should I apply?", te: "వేరుశనగకు జిప్సం ఎప్పుడు మరియు ఎంత వేయాలి?", hi: "मूंगफली में जिप्सम कब और कितना डालें?" },
        { en: "How to control Tikka Leaf Spot and rust diseases?", te: "టిక్కా ఆకుమచ్చ మరియు తుప్పు తెగులు నివారణ ఏమిటి?", hi: "टिक्का पत्ती धब्बा और गेरुई रोग की रोकथाम कैसे करें?" },
        { en: "Is irrigation needed during current pegging stage?", te: "ప్రస్తుత ఊడల దశలో నీటిపారుదల అవసరమా?", hi: "क्या वर्तमान पेगिंग अवस्था में सिंचाई आवश्यक है?" },
        { en: "How to prevent Leaf Miner and tobacco caterpillar?", te: "ఆకుముడత పురుగు మరియు లద్దెపురుగు నివారణ చర్యలు?", hi: "लीफ माइनर और तम्बाकू इल्ली की रोकथाम के उपाय?" }
      ]
    },
    {
      id: 'cotton',
      nameEn: 'Cotton',
      nameTe: 'పత్తి',
      nameHi: 'कपास',
      icon: '🌿',
      varieties: ['Bt Cotton Hybrid', 'RCH-659', 'Bhakthi', 'Suraj', 'Jaadoo'],
      defaultStage: 'flowering',
      stages: [
        { id: 'sowing', labelEn: 'Emergence (0-20 DAS)', labelTe: 'మొలక దశ (0-20 రోజులు)', labelHi: 'अंकुरण (0-20 दिन)' },
        { id: 'vegetative', labelEn: 'Square Formation (20-45 DAS)', labelTe: 'మొగ్గ తొడుగు దశ (20-45 రోజులు)', labelHi: 'कली अवस्था (20-45 दिन)' },
        { id: 'flowering', labelEn: 'Flowering & Boll Setting (45-90 DAS)', labelTe: 'పూత & కాయ దశ (45-90 రోజులు)', labelHi: 'पुष्पण व टिंडे (45-90 दिन)' },
        { id: 'boll_dev', labelEn: 'Boll Development & Bursting (90-140 DAS)', labelTe: 'కాయ పగులు దశ (90-140 రోజులు)', labelHi: 'टिंडा विकास व चुनाई' }
      ],
      quickQuestions: [
        { en: "How to prevent Pink Bollworm and set pheromone traps?", te: "గులాబీ రంగు కాయతొలుచు పురుగు (Pink Bollworm) నివారణ ఎలా?", hi: "गुलाबी सुंडी (Pink Bollworm) से बचाव व ट्रैप कैसे लगाएं?" },
        { en: "What to spray for sucking pests (Whitefly, Thrips, Jassids)?", te: "రసం పీల్చే పురుగులు (తెల్లదోమ, తామర పురుగులు) నివారణ మందులు?", hi: "रस चूसक कीटों (सफेद मक्खी, थ्रिप्स) के लिए क्या स्प्रे करें?" },
        { en: "Recommended fertilizer dose for 60-day old cotton?", te: "60 రోజుల పత్తికి ఎరువుల యాజమాన్యం మరియు మోతాదు?", hi: "60 दिन की कपास में खाद व यूरिया प्रबंधन?" },
        { en: "How to prevent square and young boll shedding?", te: "పత్తిలో మొగ్గలు మరియు పిందెలు రాలకుండా తీసుకోవాల్సిన జాగ్రత్తలు?", hi: "कपास में फूल और टिंडे गिरने से कैसे रोकें?" }
      ]
    },
    {
      id: 'chilli',
      nameEn: 'Chilli',
      nameTe: 'మిరప',
      nameHi: 'मिर्च',
      icon: '🌶️',
      varieties: ['Teja', 'Guntur Sannam (S4)', 'Byadagi', 'Armoor', 'US-341', 'Indam-5'],
      defaultStage: 'flowering',
      stages: [
        { id: 'nursery', labelEn: 'Nursery / Transplanting (0-30 DAT)', labelTe: 'నాట్లు వేసే దశ (0-30 రోజులు)', labelHi: 'रोपणी अवस्था (0-30 दिन)' },
        { id: 'vegetative', labelEn: 'Vegetative Growth (30-60 DAT)', labelTe: 'ఎదుగుదల దశ (30-60 రోజులు)', labelHi: 'वानस्पतिक विकास (30-60 दिन)' },
        { id: 'flowering', labelEn: 'Flowering & Fruit Set (60-90 DAT)', labelTe: 'పూత & పిందె దశ (60-90 రోజులు)', labelHi: 'फूल व फल लगना (60-90 दिन)' },
        { id: 'harvest', labelEn: 'Fruit Picking & Drying (90-150 DAT)', labelTe: 'కాయ కోత & ఎండబెట్టుట', labelHi: 'तुड़ाई व सुखाना' }
      ],
      quickQuestions: [
        { en: "How to control invasive Black Thrips and mites in chilli?", te: "మిరపలో నల్ల తామర పురుగులు (Black Thrips) మరియు నల్లి నివారణ?", hi: "मिर्च में ब्लैक थ्रिप्स और माइट्स की रोकथाम कैसे करें?" },
        { en: "How to manage Gemini virus and leaf curl problem?", te: "ఆకుముడత మరియు వైరస్ తెగులు (Gemini Virus) నివారణ ఏమిటి?", hi: "मिर्च में पत्ती मरोड़ (लीफ कर्ल) वायरस की रोकथाम?" },
        { en: "What nutrient spray stops flower and fruit dropping?", te: "పూత మరియు పిందె రాలకుండా ఏ పోషకాలు పిచికారీ చేయాలి?", hi: "फूल व फल झड़ने से रोकने के लिए कौन सा टॉनिक छिड़कें?" },
        { en: "Remedy for Anthracnose fruit rot and dieback in chilli?", te: "కాయకుళ్ళు మరియు కొమ్మఎండు తెగులు (Fruit Rot/Dieback) నివారణ?", hi: "मिर्च में फल सड़न और डाई-बैक रोग का उपचार?" }
      ]
    },
    {
      id: 'rice',
      nameEn: 'Paddy / Rice',
      nameTe: 'వరి',
      nameHi: 'धान / चावल',
      icon: '🌾',
      varieties: ['BPT-5204 (Samba Mahsuri)', 'MTU-1010', 'RNR-15048 (Telangana Sona)', 'KNM-118', 'IR-64'],
      defaultStage: 'vegetative',
      stages: [
        { id: 'nursery', labelEn: 'Nursery & Tillering (0-35 DAT)', labelTe: 'పిలకల దశ (0-35 రోజులు)', labelHi: 'कल्ले निकलने की अवस्था' },
        { id: 'panicle', labelEn: 'Panicle Initiation (35-65 DAT)', labelTe: 'చిరుపొట్ట దశ (35-65 రోజులు)', labelHi: 'गाभा अवस्था (35-65 दिन)' },
        { id: 'flowering', labelEn: 'Heading & Flowering (65-85 DAT)', labelTe: 'ఈనె దశ & పూత (65-85 రోజులు)', labelHi: 'बाली निकलना व पुष्पण' },
        { id: 'grain_fill', labelEn: 'Grain Filling & Maturity (85-125 DAT)', labelTe: 'గింజ పాలుపోసుకునే & కోత దశ', labelHi: 'दाना भराव व कटाई' }
      ],
      quickQuestions: [
        { en: "How to prevent Stem Borer and Neck Blast in paddy?", te: "వరిలో కాండం తొలిచే పురుగు మరియు మెడవిరుపు అగ్గి తెగులు నివారణ?", hi: "धान में तना छेदक और गर्दन मरोड़ (ब्लास्ट) रोग की रोकथाम?" },
        { en: "Correct timing and dosage for Urea and Potash top dressing?", te: "వరిలో యూరియా మరియు పొటాష్ ఎరువులు ఎప్పుడు వేయాలి?", hi: "धान में यूरिया और पोटाश टॉप ड्रेसिंग का सही समय व मात्रा?" },
        { en: "How to practice Alternate Wetting and Drying (AWD) for water saving?", te: "నీటి ఆదా కోసం ఆరుతడి నీటిపారుదల (AWD) విధానం ఎలా అమలు చేయాలి?", hi: "जल बचत के लिए रुक-रुक कर सिंचाई (AWD) कैसे करें?" },
        { en: "Remedy for Brown Plant Hopper (BPH) and sheath blight?", te: "వరిలో సుడిదోమ (BPH) మరియు పొడ తెగులు నివారణ మందులు?", hi: "भूरा माहू (BPH) और शीथ ब्लाइट रोग का नियंत्रण?" }
      ]
    },
    {
      id: 'tomato',
      nameEn: 'Tomato',
      nameTe: 'టమాటా',
      nameHi: 'टमाटर',
      icon: '🍅',
      varieties: ['Arka Rakshak', 'US-440', 'Saaho-3251', 'Abhinav', 'Shivam', 'Syngenta-6242'],
      defaultStage: 'flowering',
      stages: [
        { id: 'vegetative', labelEn: 'Vegetative (0-30 DAT)', labelTe: 'ఎదుగుదల దశ (0-30 రోజులు)', labelHi: 'वानस्पतिक अवस्था' },
        { id: 'flowering', labelEn: 'Flowering & Staking (30-55 DAT)', labelTe: 'పూత & కట్టడి దశ (30-55 రోజులు)', labelHi: 'पुष्पण व सहारा देना' },
        { id: 'fruit_set', labelEn: 'Fruiting & Ripening (55-90 DAT)', labelTe: 'కాయ కాపు & కోత దశ', labelHi: 'फल विकास व तुड़ाई' }
      ],
      quickQuestions: [
        { en: "How to prevent Early Blight and Late Blight foliar diseases?", te: "టమాటాలో ఆకుమచ్చ మరియు లేట్ బ్లైట్ తెగులు నివారణ ఏమిటి?", hi: "टमाटर में अगेती व पछेती झुलसा रोग का नियंत्रण?" },
        { en: "What prevents Fruit Borer (Helicoverpa) and Tuta absoluta?", te: "టమాటాలో కాయతొలుచు పురుగు మరియు టుటా అబ్సొల్యూటా నివారణ?", hi: "टमाटर में फल छेदक इल्ली और टुटा की रोकथाम?" },
        { en: "Remedy for Blossom End Rot and fruit cracking?", te: "కాయల అడుగుభాగం నల్లబడటం (Calcium deficiency) మరియు పగుళ్లు నివారణ?", hi: "टमाटर में फल फटने और कैल्शियम की कमी का उपाय?" },
        { en: "How to stop whitefly and leaf curl virus spread?", te: "తెల్లదోమ మరియు ఆకుముడత వైరస్ వ్యాప్తిని ఎలా అరికట్టాలి?", hi: "सफेद मक्खी और लीफ कर्ल वायरस की रोकथाम?" }
      ]
    },
    {
      id: 'maize',
      nameEn: 'Maize / Corn',
      nameTe: 'మొక్కజొన్న',
      nameHi: 'मक्का',
      icon: '🌽',
      varieties: ['NK-6240', 'DKC-9108', 'Pioneer-3396', 'Kaveri-50', 'Bio-9681'],
      defaultStage: 'vegetative',
      stages: [
        { id: 'seedling', labelEn: 'Seedling (0-20 DAS)', labelTe: 'మొలక దశ (0-20 రోజులు)', labelHi: 'अंकुरण अवस्था' },
        { id: 'knee_high', labelEn: 'Knee-high Vegetative (20-40 DAS)', labelTe: 'మోకాలి ఎత్తు దశ (20-40 రోజులు)', labelHi: 'वानस्पतिक विकास' },
        { id: 'tasseling', labelEn: 'Tasseling & Silking (40-65 DAS)', labelTe: 'కంకి & పూత దశ (40-65 రోజులు)', labelHi: 'मंजरी व भुट्टा निकलना' },
        { id: 'grain_fill', labelEn: 'Grain Filling & Maturity (65-100 DAS)', labelTe: 'గింజ నిండుట & కోత', labelHi: 'दाना भराव व परिपक्वता' }
      ],
      quickQuestions: [
        { en: "How to manage Fall Armyworm (FAW) pest in maize whorls?", te: "మొక్కజొన్నలో కత్తెర పురుగు (Fall Armyworm) సమగ్ర నివారణ?", hi: "मक्का में फॉल आर्मीवर्म (सैनिक कीट) का नियंत्रण कैसे करें?" },
        { en: "Fertilizer and Nitrogen schedule at knee-high and tasseling stages?", te: "మోకాలి ఎత్తు మరియు కంకి దశలలో ఎరువుల యాజమాన్యం?", hi: "घुटने तक ऊंचाई और मंजरी अवस्था में खाद प्रबंधन?" },
        { en: "Remedy for Turcicum leaf blight and banded leaf disease?", te: "ఆకు ఎండు తెగులు మరియు కాండం కుళ్ళు నివారణ?", hi: "टर्सिकम पत्ती झुलसा और तना सड़न रोग का उपचार?" }
      ]
    },
    {
      id: 'pulses',
      nameEn: 'Red Gram / Pulses',
      nameTe: 'కంది / పప్పుధాన్యాలు',
      nameHi: 'अरहर / दालें',
      icon: '🫘',
      varieties: ['PRG-176', 'LRG-41', 'Asha (ICPL 87119)', 'WRG-65', 'Maruti'],
      defaultStage: 'flowering',
      stages: [
        { id: 'vegetative', labelEn: 'Vegetative & Branching (0-60 DAS)', labelTe: 'కొమ్మల దశ (0-60 రోజులు)', labelHi: 'शाखाएं निकलना' },
        { id: 'flowering', labelEn: 'Flowering & Pod Formation (60-110 DAS)', labelTe: 'పూత & కాయ దశ (60-110 రోజులు)', labelHi: 'पुष्पण व फली अवस्था' },
        { id: 'maturity', labelEn: 'Pod Maturation (110-160 DAS)', labelTe: 'కాయ పక్వ దశ & కోత', labelHi: 'परिपक्वता व कटाई' }
      ],
      quickQuestions: [
        { en: "How to control Maruca pod borer and Helicoverpa in red gram?", te: "కందిలో మరుకా మచ్చల పురుగు మరియు కాయతొలుచు పురుగు నివారణ?", hi: "अरहर में मारुका फली छेदक और इल्ली की रोकथाम?" },
        { en: "Remedy for Fusarium wilt and Phytophthora stem blight?", te: "కందిలో ఎండు తెగులు (Wilt) మరియు కాండం ఎండు నివారణ?", hi: "अरहर में उकठा (विल्ट) और फाइटोफ्थोरा झुलसा का उपचार?" },
        { en: "Foliar nutrient spray to prevent flower drop and increase pod set?", te: "పూత రాలకుండా ఎక్కువ కాయలు కట్టడానికి పిచికారీ చేయాల్సిన పోషకాలు?", hi: "फूल झड़ने से रोकने और अधिक फलियों के लिए कौन सा स्प्रे करें?" }
      ]
    },
    {
      id: 'mango',
      nameEn: 'Mango',
      nameTe: 'మామిడి',
      nameHi: 'आम',
      icon: '🥭',
      varieties: ['Banganapalli (Benishan)', 'Totapuri', 'Neelam', 'Suvarnarekha', 'Kesar'],
      defaultStage: 'flowering',
      stages: [
        { id: 'dormant', labelEn: 'Pre-flowering / Rest (Oct-Nov)', labelTe: 'పూతకు ముందు దశ', labelHi: 'फूल आने से पूर्व' },
        { id: 'flowering', labelEn: 'Flowering & Fruit Set (Dec-Feb)', labelTe: 'పూత & పిందె దశ (డిసెంబర్-ఫిబ్రవరి)', labelHi: 'पुष्पण व दाना बनना' },
        { id: 'fruit_dev', labelEn: 'Fruit Development & Harvest (Mar-May)', labelTe: 'కాయ పెరుగుదల & కోత', labelHi: 'फल विकास व तुड़ाई' }
      ],
      quickQuestions: [
        { en: "How to control Mango Leaf Hopper and Powdery Mildew during flowering?", te: "మామిడిలో తేనె మంచు పురుగు (Hopper) మరియు బూడిద తెగులు నివారణ?", hi: "आम में भुनगा (हॉपर) और पाउडरी मिल्ड्यू की रोकथाम?" },
        { en: "Foliar spray to prevent fruit drop and improve fruit size?", te: "పిందె రాలకుండా సైజు పెరగడానికి జిబ్బరెల్లిక్ యాసిడ్ / పోషక పిచికారీ?", hi: "आम में फल गिरने से रोकने और आकार बढ़ाने का स्प्रे?" },
        { en: "Remedy for Anthracnose black spots and stem end rot?", te: "మామిడిలో మచ్చ తెగులు (Anthracnose) మరియు కాయ కుళ్ళు నివారణ?", hi: "आम में एन्थ्रेक्नोज काला धब्बा और सड़न रोग का उपचार?" }
      ]
    }
  ];

  // Determine initial selected crop based on current farm
  let activeCropId = 'groundnut';
  if (farm?.crop) {
    const matched = CROP_CATALOG.find(c => 
      farm.crop.toLowerCase().includes(c.id) || 
      c.nameEn.toLowerCase().includes(farm.crop.toLowerCase()) ||
      (farm.crop.toLowerCase().includes('groundnut') && c.id === 'groundnut') ||
      (farm.crop.toLowerCase().includes('cotton') && c.id === 'cotton') ||
      (farm.crop.toLowerCase().includes('chilli') && c.id === 'chilli') ||
      (farm.crop.toLowerCase().includes('rice') && c.id === 'rice') ||
      (farm.crop.toLowerCase().includes('paddy') && c.id === 'rice')
    );
    if (matched) activeCropId = matched.id;
  }

  const getActiveCrop = () => CROP_CATALOG.find(c => c.id === activeCropId) || CROP_CATALOG[0];
  let activeStageId = getActiveCrop().defaultStage;
  let activeVariety = getActiveCrop().varieties[0];
  
  let userQuery = "";
  let isAnswering = false;
  let answerLoadingStep = 0;
  let answerInterval = null;
  let currentAnswer = null;
  let isListening = false;
  let recognitionInstance = null;
  let questionHistory = [];

  // Knowledge base for instant high-quality crop responses
  function generateCropSpecificAnswer(cropObj, stageId, varietyName, queryText) {
    const q = (queryText || "").toLowerCase();
    const cropName = isTe ? cropObj.nameTe : (isHi ? cropObj.nameHi : cropObj.nameEn);
    const stageObj = cropObj.stages.find(s => s.id === stageId) || cropObj.stages[0];
    const stageName = isTe ? stageObj.labelTe : (isHi ? stageObj.labelHi : stageObj.labelEn);

    let diagnosticObservation = "";
    let recommendation = "";
    let dosageDetails = [];
    let riskAlert = "";
    let actionSteps = [];
    let knowledgeSource = `ICAR Package of Practices (${cropObj.nameEn}) & ANGRAU Agronomy Protocol`;

    // 1. PESTS & DISEASES
    if (q.includes("pest") || q.includes("పురుగు") || q.includes("కీటకం") || q.includes("కీటక") || q.includes("disease") || q.includes("తెగులు") || q.includes("మచ్చ") || q.includes("कीट") || q.includes("रोग") || q.includes("धब्बा") || q.includes("worm") || q.includes("thrips") || q.includes("miner") || q.includes("bollworm") || q.includes("blast") || q.includes("blight")) {
      if (cropObj.id === 'groundnut') {
        diagnosticObservation = isTe
          ? `కదిరి-6 వేరుశనగలో పూత మరియు ఊడల దశలో సర్కోస్పోరా టిక్కా ఆకుమచ్చ మరియు ఆకుముడత పురుగు (Leaf Miner) ఆశించే అవకాశాలు ఉన్నాయి.`
          : (isHi
            ? `मूंगफली की पुष्पण व पेगिंग अवस्था में टिक्का पत्ती धब्बा (सर्कोस्पोरा) और लीफ माइनर कीट का खतरा बढ़ जाता है।`
            : `Kadiri-6 Groundnut at flowering/pegging is vulnerable to Cercospora leaf spot (Tikka) and leaf miner larval feeding.`);
        recommendation = isTe
          ? `టిక్కా తెగులుకు మాంకోజెబ్ 75% WP (2 గ్రా/లీ) లేదా టెబుకొనజోల్ 25.9% EC (1.5 మి.లీ/లీ) పిచికారీ చేయండి. ఆకుముడత పురుగుకు 5% వేప నూనె లేదా క్లోరాంట్రానిలిప్రోల్ 18.5% SC (0.3 మి.లీ/లీ) స్ప్రే చేయండి.`
          : (isHi
            ? `टिक्का रोग हेतु मैंकोजेब 75% WP (2 ग्राम/लीटर) या टेबुकोनाजोल (1.5 मिली/लीटर) छिड़कें। लीफ माइनर हेतु 5% नीम अर्क या क्लोरेंट्रानिलीप्रोल (0.3 मिली/लीटर) का प्रयोग करें।`
            : `Spray Mancozeb 75% WP @ 2g/L or Tebuconazole 25.9% EC @ 1.5ml/L for leaf spots. For leaf miner, spray 5% Neem oil or Chlorantraniliprole 18.5% SC @ 0.3ml/L.`);
        dosageDetails = [
          { item: isTe ? 'టెబుకొనజోల్ (ఫంగిసైడ్)' : 'Tebuconazole 25.9% EC', dose: '1.5 ml / Liter water' },
          { item: isTe ? 'వేప నూనె (1500 PPM)' : 'Neem Oil (1500 PPM)', dose: '5.0 ml / Liter water' },
          { item: isTe ? 'లింగాకర్షక బుట్టలు' : 'Pheromone Traps', dose: '4-5 traps / Acre' }
        ];
        riskAlert = isTe ? "వర్షం పడిన 24 గంటల్లో గాలి తేమ పెరిగి తెగులు వేగంగా వ్యాపిస్తుంది." : "Post-rain relative humidity above 75% accelerates spore germination.";
        actionSteps = [
          isTe ? "మొదట ఆకుల అడుగుభాగం తడిసేలా పిచికారీ చేయండి" : "Ensure uniform coverage on lower canopy foliage",
          isTe ? "తీవ్రంగా దెబ్బతిన్న ఆకులను ఏరి నాశనం చేయండి" : "Prune and destroy heavily necrosed bottom leaves"
        ];
      } else if (cropObj.id === 'cotton') {
        diagnosticObservation = isTe
          ? `పత్తి పంటలో గులాబీ రంగు కాయతొలుచు పురుగు (Pink Bollworm) మరియు రసం పీల్చే పురుగులు (తెల్లదోమ, తామర పురుగులు) తీవ్ర నష్టం కలిగిస్తాయి.`
          : (isHi
            ? `कपास में गुलाबी सुंडी (Pink Bollworm) और रस चूसक कीट (सफेद मक्खी, थ्रिप्स) फूल और टिंडों को गंभीर नुकसान पहुंचाते हैं।`
            : `Cotton flowering and boll initiation is susceptible to Pink Bollworm (Pectinophora gossypiella) and sucking pests.`);
        recommendation = isTe
          ? `గులాబీ రంగు పురుగు నివారణకు ఎకరాకు 8 లింగాకర్షక బుట్టలు పెట్టండి. పూత దశలో ప్రొఫెనోఫాస్ 50% EC (2 మి.లీ/లీ) లేదా ఎమామెక్టిన్ బెంజోయేట్ 5% SG (0.4 గ్రా/లీ) పిచికారీ చేయండి.`
          : (isHi
            ? `गुलाबी सुंडी नियंत्रण हेतु प्रति एकड़ 8 फेरोमोन ट्रैप लगाएं। इमामेक्टिन बेंजोएट 5% SG (0.4 ग्राम/लीटर) या प्रोफेनोफॉस (2 मिली/लीटर) का छिड़काव करें।`
            : `Install 8 Pheromone Traps/acre with Gossyplure. Spray Emamectin Benzoate 5% SG @ 0.4g/L or Profenofos 50% EC @ 2ml/L.`);
        dosageDetails = [
          { item: 'Emamectin Benzoate 5% SG', dose: '0.4 g / Liter (80g/acre)' },
          { item: 'Flonicamid 50% WG (Sucking pests)', dose: '0.3 g / Liter (60g/acre)' },
          { item: 'Gossyplure Pheromone Traps', dose: '8 traps / Acre' }
        ];
        riskAlert = isTe ? "కాయలోకి పురుగు ప్రవేశించిన తర్వాత రసాయన మందులు పనిచేయవు, కాబట్టి గుడ్ల దశలోనే నివారించండి." : "Chemical sprays cannot penetrate internal bolls once larvae bore in; target egg hatching window.";
        actionSteps = [
          isTe ? "రోసేట్ (Rosette) పూలను గుర్తించి నలిపివేయండి" : "Scout for rosette flowers and mechanically destroy trapped larvae",
          isTe ? "పసుపు, నీలి జిగురు అట్టలను ఎకరాకు 10 చొప్పున అమర్చండి" : "Install 10 Yellow and Blue sticky traps per acre"
        ];
      } else if (cropObj.id === 'chilli') {
        diagnosticObservation = isTe
          ? `మిరపలో నల్ల తామర పురుగులు (Thrips parvispinus) మరియు ఆకుముడత వైరస్ పూత రాలిపోవడానికి మరియు కాయల నాణ్యత తగ్గడానికి ప్రధాన కారణం.`
          : (isHi
            ? `मिर्च में ब्लैक थ्रिप्स और पत्ती मरोड़ (लीफ कर्ल वायरस) से फूल झड़ते हैं और पत्तियां ऊपर की ओर मुड़ जाती हैं।`
            : `Invasive Black Thrips (Thrips parvispinus) and Gemini leaf curl virus cause severe flower drop and upward leaf curling.`);
        recommendation = isTe
          ? `నల్ల తామర పురుగులకు స్పైనటోరం 11.7% SC (1 మి.లీ/లీ) లేదా ఫిప్రోనిల్ 5% SC (2 మి.లీ/లీ) పిచికారీ చేయండి. ఆకుముడతకు వేప నూనె (10,000 ppm) 3 మి.లీ/లీ వాడండి.`
          : (isHi
            ? `ब्लैक थ्रिप्स हेतु स्पाइनटोरम 11.7% SC (1 मिली/लीटर) या फिप्रोनिल 5% SC (2 मिली/लीटर) छिड़कें। वायरस वेक्टर नियंत्रण हेतु नीम तेल का प्रयोग करें।`
            : `Spray Spinetoram 11.7% SC @ 1ml/L or Fipronil 5% SC @ 2ml/L for Black Thrips. Use Neem oil 10,000 ppm @ 3ml/L.`);
        dosageDetails = [
          { item: 'Spinetoram 11.7% SC', dose: '1.0 ml / Liter water' },
          { item: 'Diafenthiuron 50% WP (Mites/Thrips)', dose: '1.2 g / Liter water' },
          { item: 'Blue Sticky Traps (for Thrips)', dose: '15-20 traps / Acre' }
        ];
        riskAlert = isTe ? "ఒకే రసాయన మందును పదే పదే వాడకండి; పురుగులలో మందులకు తట్టుకునే శక్తి పెరుగుతుంది." : "Rotate insecticide modes of action to prevent rapid chemical resistance build-up.";
        actionSteps = [
          isTe ? "ఎకరాకు 15 నీలి రంగు జిగురు అట్టలు అమర్చండి" : "Set up 15-20 Blue Sticky Traps above plant canopy",
          isTe ? "సాయంత్రం వేళల్లో ఆకుల వెనుక భాగం తడిసేలా స్ప్రే చేయండి" : "Spray in late evenings ensuring undersurface foliar coverage"
        ];
      } else if (cropObj.id === 'rice') {
        diagnosticObservation = isTe
          ? `వరిలో కాండం తొలిచే పురుగు (Stem Borer) మరియు అగ్గి తెగులు (Blast) పిలకల మరియు ఈనె దశలో దిగుబడిని తీవ్రంగా దెబ్బతీస్తాయి.`
          : (isHi
            ? `धान में तना छेदक (Stem Borer) और ब्लास्ट (झोंका रोग) टिलरिंग व बाली निकलते समय भारी नुकसान पहुंचाते हैं।`
            : `Paddy during tillering and panicle emergence is prone to Yellow Stem Borer and Pyricularia blast fungus.`);
        recommendation = isTe
          ? `కాండం తొలిచే పురుగుకు కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు (ఎకరాకు 8 కేజీలు) లేదా క్లోరాంట్రానిలిప్రోల్ 0.4G వేయండి. అగ్గి తెగులుకు ట్రైసైక్లజోల్ 75% WP (0.6 గ్రా/లీ) పిచికారీ చేయండి.`
          : (isHi
            ? `तना छेदक हेतु कारटाप हाइड्रोक्लोराइड 4G (8 किग्रा/एकड़) डालें। ब्लास्ट रोग हेतु ट्राइसाइक्लाजोल 75% WP (0.6 ग्राम/लीटर) का छिड़काव करें।`
            : `Apply Cartap Hydrochloride 4G granules @ 8 kg/acre for stem borer. Spray Tricyclazole 75% WP @ 0.6g/L for neck/leaf blast.`);
        dosageDetails = [
          { item: 'Cartap Hydrochloride 4G', dose: '8 kg / Acre (Broadcasting)' },
          { item: 'Tricyclazole 75% WP (Blast)', dose: '0.6 g / Liter water' },
          { item: 'Hexaconazole 5% EC (Sheath blight)', dose: '2.0 ml / Liter water' }
        ];
        riskAlert = isTe ? "అధిక మోతాదులో యూరియా వేస్తే అగ్గి తెగులు మరియు సుడిదోమ తీవ్రత పెరుగుతుంది." : "Excessive single-dose Urea application triggers explosive Blast and BPH flare-ups.";
        actionSteps = [
          isTe ? "మందులు చల్లేటప్పుడు పొలంలో 2 సెం.మీ పలుచటి నీరు ఉండేలా చూడండి" : "Maintain thin 2cm standing water while broadcasting granules",
          isTe ? "వరి దుబ్బుల మొదళ్ళను తెరిచి సుడిదోమ ఉనికిని గమనించండి" : "Scout hill bases for Brown Plant Hopper colonies"
        ];
      } else {
        diagnosticObservation = isTe
          ? `${cropName} పంటలో ప్రస్తుత ${stageName} దశలో తెగుళ్లు మరియు కీటకాల సమగ్ర సస్యరక్షణ చర్యలు అవసరం.`
          : `Integrated pest & disease management protocol calibrated for ${cropObj.nameEn} during ${stageName}.`;
        recommendation = isTe
          ? `జీవ నియంత్రణ కోసం 5% వేప నూనె పిచికారీ చేసి, ఎకరాకు తగిన లింగాకర్షక బుట్టలు అమర్చండి. శిలీంధ్ర తెగుళ్లకు కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా/లీ) వాడండి.`
          : `Deploy botanical 5% neem extract spray combined with species-specific pheromone monitoring traps. Apply Copper Oxychloride @ 3g/L for fungal blights.`;
        dosageDetails = [
          { item: 'Neem Oil Extract (Botanical)', dose: '5.0 ml / Liter water' },
          { item: 'Copper Oxychloride 50% WP', dose: '3.0 g / Liter water' }
        ];
        riskAlert = isTe ? "వాతావరణంలో తేమ పెరిగినప్పుడు తెగుళ్లు త్వరగా వ్యాపిస్తాయి." : "Humid micro-climates encourage rapid foliar disease progression.";
        actionSteps = [
          isTe ? "పొలంలో కలుపు మొక్కలను తొలగించి శుభ్రంగా ఉంచండి" : "Keep bunds weed-free to eliminate alternate insect hosts"
        ];
      }
    }
    // 2. FERTILIZER / NUTRIENTS / GYPSUM
    else if (q.includes("fertilizer") || q.includes("nutrient") || q.includes("gypsum") || q.includes("ఎరువు") || q.includes("జిప్సం") || q.includes("పోషక") || q.includes("ఉర్వరక") || q.includes("खाद") || q.includes("उर्वरक") || q.includes("జింక్") || q.includes("యూరియా") || q.includes("urea") || q.includes("npk")) {
      if (cropObj.id === 'groundnut') {
        diagnosticObservation = isTe
          ? `కదిరి-6 వేరుశనగకు 40-45 రోజుల పూత మరియు ఊడల దిగే దశలో క్యాల్షియం & సల్ఫర్ అత్యంత ప్రాధాన్యత కలిగిన పోషకాలు.`
          : (isHi
            ? `मूंगफली में 40-45 दिनों की पेगिंग अवस्था में कैल्शियम और सल्फर की उपलब्धता दानों के भराव के लिए अनिवार्य है।`
            : `Kadiri-6 Groundnut at Day 40-45 pegging requires high soil-available Calcium and Sulphur in the top 5cm pod zone.`);
        recommendation = isTe
          ? `ఎకరాకు 200 కిలోల జిప్సం వేసి మొక్కల మొదళ్ళ చుట్టూ మట్టిని ఎగదోయండి (Earthing up). తేలికపాటి తేమ ఉన్నప్పుడు వేయడం వల్ల కాయలు బరువుగా, నూనె శాతంతో నిండుగా వస్తాయి.`
          : (isHi
            ? `प्रति एकड़ 200 किग्रा जिप्सम पौधों की जड़ों के पास समान रूप से बुरकें और हल्की मिट्टी चढ़ाएं (Earthing up)। इससे खोखली फलियां नहीं बनतीं।`
            : `Broadcast 200 kg Gypsum per acre uniformly around plant base followed by earthing up. This eliminates pops and boosts kernel oil content.`);
        dosageDetails = [
          { item: isTe ? 'వ్యవసాయ జిప్సం (కాల్షియం & సల్ఫర్)' : 'Agriculture Gypsum (Ca + S)', dose: '200 kg / Acre (at 40-45 DAS)' },
          { item: isTe ? '19-19-19 కరిగే ఎరువు (స్ప్రే)' : '19-19-19 Water Soluble NPK', dose: '5.0 g / Liter (Foliar)' },
          { item: isTe ? 'ఫెర్రస్ సల్ఫేట్ + నిమ్మ ఉప్పు' : 'Ferrous Sulphate (for yellowing)', dose: '5.0 g + 1g citric acid / Liter' }
        ];
        riskAlert = isTe ? "జిప్సం వేయకపోతే గుల్ల కాయలు (Pops) ఏర్పడి 40% వరకు దిగుబడి నష్టం జరుగుతుంది." : "Calcium starvation results in hollow unfilled shells ('pops') reducing yield by up to 40%.";
        actionSteps = [
          isTe ? "జిప్సం వేసే సమయంలో నేలలో తగినంత తేమ ఉండేలా చూసుకోండి" : "Ensure adequate root zone moisture when applying gypsum",
          isTe ? "మొక్కల మొదళ్ళ వద్ద మట్టిని కదిలించి ఊడలు సులభంగా దిగేలా చేయండి" : "Perform gentle inter-cultivation earthing up around pegs"
        ];
      } else if (cropObj.id === 'cotton') {
        diagnosticObservation = isTe
          ? `పత్తి 60-75 రోజుల దశలో కాయల సైజు పెరగడానికి నత్రజని మరియు పొటాషియం ఎరువులు అవసరం.`
          : `Cotton at 60-75 days requires split Nitrogen and Potassium top dressing for boll expansion.`;
        recommendation = isTe
          ? `ఎకరాకు 30 కేజీల యూరియా + 15 కేజీల మ్యూరేట్ ఆఫ్ పొటాష్ (MOP) మొక్కల మొదళ్ళకు 10 సెం.మీ దూరంలో వేసి మట్టి కప్పండి. 13-0-45 (10 గ్రా/లీ) స్ప్రే చేయండి.`
          : `Apply 30 kg Urea + 15 kg MOP per acre 10cm away from plant stem. Foliar spray Potassium Nitrate (13-0-45) @ 10g/L.`;
        dosageDetails = [
          { item: 'Urea (Nitrogen Top-dress)', dose: '30 kg / Acre (Split 2)' },
          { item: 'Muriate of Potash (MOP)', dose: '15 kg / Acre' },
          { item: 'Potassium Nitrate (13-0-45 Spray)', dose: '10.0 g / Liter water' },
          { item: 'Boron 20% (for boll retention)', dose: '1.0 g / Liter water' }
        ];
        riskAlert = isTe ? "ఎరువులను కాండం మొదట్లో నేరుగా వేయకండి, వేర్లు దెబ్బతింటాయి." : "Do not place fertilizer directly adjacent to stem to prevent chemical scorching.";
        actionSteps = [
          isTe ? "తేమ ఉన్నప్పుడే ఎరువులు వేయండి" : "Apply fertilizers under optimum soil moisture conditions"
        ];
      } else {
        diagnosticObservation = isTe
          ? `${cropName} పంటకు సమతుల్య NPK మరియు సూక్ష్మ పోషకాల నిర్వహణ అవసరం.`
          : `Balanced NPK macro-nutrients and secondary micronutrients schedule for ${cropObj.nameEn}.`;
        recommendation = isTe
          ? `ప్రస్తుత దశకు తగిన నత్రజని మరియు పొటాష్ ఎరువులను సిఫార్సు చేసిన మోతాదులో అందించండి. 19-19-19 ఎరువును 5 గ్రా/లీ చొప్పున పిచికారీ చేయండి.`
          : `Provide split dosage of Nitrogen and Potassium. Spray 19-19-19 @ 5g/L for vegetative vigor.`;
        dosageDetails = [
          { item: 'Water Soluble 19-19-19 NPK', dose: '5.0 g / Liter water' },
          { item: 'Micronutrient Mixture (Zinc + Boron)', dose: '2.5 g / Liter water' }
        ];
        riskAlert = isTe ? "అధిక మోతాదులో రసాయన ఎరువులు వేస్తే నేల ఆరోగ్యం క్షీణిస్తుంది." : "Avoid over-application of synthetic nitrogen without organic carbon.";
        actionSteps = [
          isTe ? "జీవామృతం లేదా పశువుల ఎరువుతో కలపండి" : "Incorporate organic matter / Jeevamrutha to boost microbial uptake"
        ];
      }
    }
    // 3. IRRIGATION & WATER MANAGEMENT
    else if (q.includes("irrigat") || q.includes("water") || q.includes("నీరు") || q.includes("నీటి") || q.includes("सिंचाई") || q.includes("पानी") || q.includes("pump") || q.includes("rain") || q.includes("వర్షం") || q.includes("వాతావరణం")) {
      diagnosticObservation = isTe
        ? `${cropName} పంటకు ప్రస్తుత ${stageName} దశలో నేల తేమ 30-40% మధ్య స్థిరంగా ఉండటం అత్యంత ముఖ్యం.`
        : (isHi
          ? `${cropName} फसल के लिए ${stageName} अवस्था में 30-40% मिट्टी की नमी आदर्श है।`
          : `Optimal volumetric soil moisture threshold for ${cropObj.nameEn} during ${stageName} is 30–40%.`);
      recommendation = isTe
        ? `వాతావరణ రాడార్ సూచన ప్రకారం రాబోయే 48-72 గంటల్లో వర్షం కురిసే అవకాశం ఉన్నందున నేటి నీటిపారుదలని వాయిదా వేయండి. స్ప్రింక్లర్ లేదా డ్రిప్ పద్ధతి ద్వారా 35% నీటిని ఆదా చేయవచ్చు.`
        : (isHi
          ? `अगले 48-72 घंटों में वर्षा की संभावना को देखते हुए आज सिंचाई टालें। स्प्रिंकलर या ड्रिप से सिंचाई करके 35% जल बचाएं।`
          : `Hold off irrigation for the next 24-48 hours given convective rainfall outlook. Utilize sprinkler or furrow irrigation to prevent root hypoxia.`);
      dosageDetails = [
        { item: isTe ? 'కనీస నేల తేమ పరిమితి' : 'Critical Moisture Trigger', dose: '30% Volumetric' },
        { item: isTe ? 'స్ప్రింక్లర్ రన్ సమయం' : 'Sprinkler Run Duration', dose: '2.5 Hours / Set' }
      ];
      riskAlert = isTe ? "అదనపు నీరు నిలిస్తే వేరు కుళ్ళు మరియు ఆక్సిజన్ లోపం ఏర్పడుతుంది." : "Standing water triggers root hypoxia and secondary collar rot pathogens.";
      actionSteps = [
        isTe ? "పొలంలో నీరు నిల్వ ఉండకుండా డ్రైనేజీ కాలువలు సరిచూడండి" : "Clear field furrows to facilitate gravity runoff discharge",
        isTe ? "వర్షం తగ్గిన తర్వాత నేల తేమను సెన్సార్ ద్వారా గమనించండి" : "Verify soil moisture telemetry 12h post-rainfall"
      ];
    }
    // 4. GENERAL ADVISORY
    else {
      diagnosticObservation = isTe
        ? `${cropName} (${varietyName}) పంట ప్రస్తుత ${stageName} దశలో పూర్తి సామర్థ్యంతో పురోగతిలో ఉంది.`
        : (isHi
          ? `${cropName} (${varietyName}) फसल ${stageName} अवस्था में उत्तम स्थिति में है।`
          : `${cropObj.nameEn} (${varietyName}) at ${stageName} is in steady development under regional agro-climatic conditions.`);
      recommendation = isTe
        ? `పంట ఎదుగుదల దశకు తగినట్లుగా క్రమం తప్పకుండా క్షేత్ర పరిశీలన చేయండి. కలుపు లేకుండా చూసుకోవడం మరియు తగిన తేమను కాపాడటం ద్వారా అధిక దిగుబడి సాధించవచ్చు.`
        : (isHi
          ? `फसल की अवस्था अनुसार नियमित निगरानी करें। खरपतवार नियंत्रण और संतुलित पोषण से अधिकतम पैदावार सुनिश्चित करें।`
          : `Conduct regular morning crop scouting. Maintain weed-free root zones and balanced nutritional support calibrated for this stage.`);
      dosageDetails = [
        { item: isTe ? 'సేంద్రీయ జీవామృతం' : 'Jeevamrutha Bio-tonic', dose: '200 Liters / Acre with irrigation' },
        { item: isTe ? 'సూక్ష్మ పోషక పిచికారీ' : 'Foliar Nutrient Tonic', dose: '2.5 g / Liter water' }
      ];
      riskAlert = isTe ? "వాతావరణ మార్పులను ఎప్పటికప్పుడు గమనిస్తూ సస్యరక్షణ చర్యలు చేపట్టండి." : "Monitor sudden temperature spikes and humidity changes.";
      actionSteps = [
        isTe ? "పై ప్రశ్నలలో నిర్దిష్ట ప్రశ్నను ఎంచుకోండి లేదా మీ సమస్యను టైప్ చేయండి" : "Select any quick question above or enter specific crop queries"
      ];
    }

    return {
      cropId: cropObj.id,
      cropNameEn: cropObj.nameEn,
      cropNameTe: cropObj.nameTe,
      cropNameHi: cropObj.nameHi,
      cropIcon: cropObj.icon,
      variety: varietyName,
      stageId: stageId,
      stageName: stageName,
      query: queryText,
      observation: diagnosticObservation,
      recommendation: recommendation,
      dosageDetails: dosageDetails,
      riskAlert: riskAlert,
      actionSteps: actionSteps,
      knowledgeSource: knowledgeSource,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Handle Question Submission
  async function handleAskQuestion(queryText) {
    if (!queryText || !queryText.trim()) {
      showToast(isTe ? "దయచేసి మీ ప్రశ్నను నమోదు చేయండి" : (isHi ? "कृपया अपना प्रश्न लिखें" : "Please enter your crop question"), "warning");
      return;
    }

    userQuery = queryText.trim();
    isAnswering = true;
    answerLoadingStep = 1;
    render();

    // Try querying backend live AI advisory first
    const activeCrop = getActiveCrop();
    let answerObj = null;

    answerInterval = setInterval(() => {
      answerLoadingStep++;
      if (answerLoadingStep > 3) clearInterval(answerInterval);
      render();
    }, 280);

    try {
      const backendRes = await advisoryService.askAgriAI(
        `[Crop: ${activeCrop.nameEn} (${activeVariety}), Stage: ${activeStageId}] ${userQuery}`,
        locale
      );

      if (backendRes && backendRes.found) {
        answerObj = {
          cropId: activeCrop.id,
          cropNameEn: activeCrop.nameEn,
          cropNameTe: activeCrop.nameTe,
          cropNameHi: activeCrop.nameHi,
          cropIcon: activeCrop.icon,
          variety: activeVariety,
          stageId: activeStageId,
          stageName: activeCrop.stages.find(s => s.id === activeStageId)?.labelEn || activeStageId,
          query: userQuery,
          observation: backendRes.found,
          recommendation: backendRes.recommendation || backendRes.found,
          dosageDetails: [
            { item: 'Recommended Farm Practice', dose: backendRes.recommendation?.slice(0, 80) || 'As advised' },
            { item: 'Decision Confidence', dose: `${backendRes.sources?.[0] || 'ICAR AgriN AI Engine'}` }
          ],
          riskAlert: backendRes.risk || "Review field conditions before chemical spraying.",
          actionSteps: [
            backendRes.nextAction || "Inspect crop foliage in the early morning hours",
            "Consult local agricultural extension officer if symptoms persist"
          ],
          knowledgeSource: backendRes.sources?.join(' • ') || "ICAR & BRICS AgriN Knowledge Graph",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    } catch (err) {
      console.warn("Backend crop query failed, using agronomic rules:", err);
    }

    if (!answerObj) {
      answerObj = generateCropSpecificAnswer(activeCrop, activeStageId, activeVariety, userQuery);
    }

    clearInterval(answerInterval);
    isAnswering = false;
    currentAnswer = answerObj;
    
    // Add to history
    questionHistory.unshift({
      query: userQuery,
      cropName: isTe ? activeCrop.nameTe : (isHi ? activeCrop.nameHi : activeCrop.nameEn),
      cropIcon: activeCrop.icon,
      timestamp: answerObj.timestamp
    });
    if (questionHistory.length > 5) questionHistory.pop();

    render();
    scrollToAnswer();
  }

  function scrollToAnswer() {
    setTimeout(() => {
      const ansEl = container.querySelector('#ask-me-answer-card');
      if (ansEl) ansEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  }

  // Voice speech synthesis
  function speakAnswer(text) {
    if (!('speechSynthesis' in window)) {
      showToast("Voice playback not supported on this browser", "info");
      return;
    }
    window.speechSynthesis.cancel(); // stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    if (isTe) utterance.lang = 'te-IN';
    else if (isHi) utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    showToast(isTe ? "వినడం ప్రారంభమైంది..." : (isHi ? "ऑडियो शुरू हुआ..." : "Reading out answer..."), "info");
  }

  // Speech Recognition (Mic)
  function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition not supported in this browser. Please type your query.", "warning");
      return;
    }

    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      isListening = false;
      render();
      return;
    }

    try {
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = isTe ? 'te-IN' : (isHi ? 'hi-IN' : 'en-IN');
      recognitionInstance.interimResults = false;

      recognitionInstance.onstart = () => {
        isListening = true;
        render();
        showToast(isTe ? "మాట్లాడండి... మీ స్వరాన్ని వింటున్నాను" : (isHi ? "बोलें... आवाज रिकॉर्ड हो रही है" : "Listening... Speak your crop question"), "info");
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputEl = container.querySelector('#ask-me-input');
        if (inputEl) inputEl.value = transcript;
        userQuery = transcript;
        isListening = false;
        render();
        handleAskQuestion(transcript);
      };

      recognitionInstance.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        isListening = false;
        render();
        showToast("Could not recognize voice. Please try typing.", "warning");
      };

      recognitionInstance.onend = () => {
        isListening = false;
        render();
      };

      recognitionInstance.start();
    } catch (e) {
      console.warn("Speech recognition init failed:", e);
      isListening = false;
      render();
    }
  }

  function render() {
    const activeCrop = getActiveCrop();
    const cropName = isTe ? activeCrop.nameTe : (isHi ? activeCrop.nameHi : activeCrop.nameEn);

    container.innerHTML = `
      <div class="ask-me-crop-section" id="ask-me-main-wrapper">
        
        <!-- 1. SECTION HEADER -->
        <div class="ask-me-header">
          <div class="ask-me-title-wrap">
            <div class="ask-me-icon-glow">🌾</div>
            <div>
              <div class="ask-me-heading-row">
                <h3 class="ask-me-title">${isTe ? 'Ask Me — పంట ఆధారిత AI సలహాలు' : (isHi ? 'Ask Me — फसल अनुसार एआई सलाह' : 'Ask Me — Crop-Specific AI Advisor')}</h3>
                <span class="ask-me-sparkle-pill">✨ ${isTe ? 'పంటను ఎంచుకోండి & అడగండి' : (isHi ? 'फसल चुनें व पूछें' : 'Select Crop & Ask')}</span>
              </div>
              <p class="ask-me-sub">
                ${isTe 
                  ? 'మీరు సాగు చేస్తున్న పంటను ఎంచుకుని ఎరువులు, చీడపీడలు, నీటిపారుదల లేదా రక్షణ చర్యల గురించి ఏదైనా ప్రశ్న అడగండి.'
                  : (isHi 
                    ? 'अपनी फसल चुनें और खाद, कीट नियंत्रण, सिंचाई या उपचार के बारे में कोई भी प्रश्न पूछें।'
                    : 'Select your crop and growth stage to receive precise agronomic advice, specific chemical/organic dosages, and disease solutions.')}
              </p>
            </div>
          </div>
        </div>

        <!-- 2. CROP SELECTOR CHIPS CAROUSEL -->
        <div class="ask-me-crop-selector-wrap">
          <div class="ask-me-selector-label">
            <span>🌱</span>
            <span>${isTe ? 'పంటను ఎంచుకోండి:' : (isHi ? 'फसल चुनें:' : 'Select Crop:')}</span>
          </div>

          <div class="ask-me-crop-pills-row">
            ${CROP_CATALOG.map(c => `
              <button 
                class="crop-pill-btn ${c.id === activeCropId ? 'active' : ''}" 
                data-crop-id="${c.id}"
                title="${c.nameEn}"
              >
                <span class="crop-pill-icon">${c.icon}</span>
                <span class="crop-pill-name">${isTe ? c.nameTe : (isHi ? c.nameHi : c.nameEn)}</span>
                ${c.id === activeCropId ? '<span class="crop-active-dot">●</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 3. CROP STAGE & VARIETY CONFIG STRIP -->
        <div class="ask-me-config-strip">
          <!-- Crop Variety Selector -->
          <div class="ask-me-config-item">
            <label class="ask-me-config-label">
              <span>🏷️</span>
              <span>${isTe ? 'పంట రకం (Variety):' : (isHi ? 'किस्म (Variety):' : 'Crop Variety:')}</span>
            </label>
            <select class="ask-me-select" id="ask-me-variety-select">
              ${activeCrop.varieties.map(v => `
                <option value="${v}" ${v === activeVariety ? 'selected' : ''}>${v}</option>
              `).join('')}
            </select>
          </div>

          <!-- Growth Stage Selector -->
          <div class="ask-me-config-item" style="flex: 1.5;">
            <label class="ask-me-config-label">
              <span>🌿</span>
              <span>${isTe ? 'ఎదుగుదల దశ (Growth Stage):' : (isHi ? 'फसल अवस्था (Growth Stage):' : 'Crop Growth Stage:')}</span>
            </label>
            <select class="ask-me-select" id="ask-me-stage-select">
              ${activeCrop.stages.map(s => `
                <option value="${s.id}" ${s.id === activeStageId ? 'selected' : ''}>
                  ${isTe ? s.labelTe : (isHi ? s.labelHi : s.labelEn)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 4. QUICK 1-CLICK QUESTIONS FOR SELECTED CROP -->
        <div class="ask-me-quick-questions">
          <div class="quick-questions-label">
            <span>💡</span>
            <span>${isTe ? `${cropName} కోసం తరచుగా అడిగే ప్రశ్నలు:` : (isHi ? `${cropName} के मुख्य प्रश्न:` : `Popular questions for ${cropName}:`)}</span>
          </div>

          <div class="quick-questions-chips">
            ${activeCrop.quickQuestions.map(q => {
              const qText = isTe ? q.te : (isHi ? q.hi : q.en);
              return `
                <button class="quick-q-chip" data-query="${escapeHtml(qText)}">
                  <span>❓</span>
                  <span>${qText}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 5. ASK ME INPUT FORM -->
        <form class="ask-me-input-form" id="ask-me-form">
          <div class="ask-me-input-wrap">
            <span class="ask-me-input-icon">${activeCrop.icon}</span>
            <input 
              type="text" 
              class="ask-me-input" 
              id="ask-me-input"
              placeholder="${isTe ? `${cropName} గురించి ఏదైనా ప్రశ్న అడగండి (ఉదా: తెగులు నివారణ, ఎరువులు)...` : (isHi ? `${cropName} के बारे में कुछ भी पूछें (उदा: कीट नियंत्रण, खाद)...` : `Ask any question about ${cropName} (e.g. disease cure, fertilizer dose, irrigation)...`)}"
              value="${escapeHtml(userQuery)}"
              autocomplete="off"
            />
            
            <!-- Voice Mic Button -->
            <button 
              type="button" 
              class="ask-me-mic-btn ${isListening ? 'listening' : ''}" 
              id="btn-ask-me-mic"
              title="${isTe ? 'మైక్రోఫోన్ ద్వారా మాట్లాడండి' : (isHi ? 'माइक से बोलें' : 'Voice Input')}"
            >
              🎙️
            </button>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="ask-me-submit-btn" id="btn-ask-me-submit" ${isAnswering ? 'disabled' : ''}>
            ${isAnswering ? `
              <span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
              <span>${isTe ? 'విశ్లేషిస్తోంది...' : (isHi ? 'विश्लेषण जारी...' : 'Analyzing...')}</span>
            ` : `
              <span>Ask AI</span>
              <span>➔</span>
            `}
          </button>
        </form>

        <!-- 6. LOADING STATE ANIMATION -->
        ${isAnswering ? `
          <div class="ask-me-loading-box">
            <div class="loading-spinner-row">
              <span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span>
              <strong>${isTe ? `${cropName} వ్యవసాయ నాలెడ్జ్ బేస్ పరిశీలిస్తోంది...` : (isHi ? `${cropName} ज्ञानकोश का विश्लेषण जारी...` : `Consulting Agronomic Intelligence for ${cropName}...`)}</strong>
            </div>
            <div class="ask-me-loading-steps">
              <span class="loading-step-badge ${answerLoadingStep >= 1 ? 'done' : ''}">
                ${answerLoadingStep >= 1 ? '✓' : '1.'} ${isTe ? 'పంట & రకం డేటా' : 'Crop & Variety'}
              </span>
              <span class="loading-step-badge ${answerLoadingStep >= 2 ? 'done' : ''}">
                ${answerLoadingStep >= 2 ? '✓' : '2.'} ${isTe ? 'ICAR నాలెడ్జ్ గ్రాఫ్' : 'ICAR Knowledge Graph'}
              </span>
              <span class="loading-step-badge ${answerLoadingStep >= 3 ? 'done' : ''}">
                ${answerLoadingStep >= 3 ? '✓' : '3.'} ${isTe ? 'AI సిఫార్సు తయారీ' : 'Generating Solution'}
              </span>
            </div>
          </div>
        ` : ''}

        <!-- 7. DETAILED AI ANSWER CARD -->
        ${currentAnswer ? renderAnswerCard(currentAnswer) : ''}

        <!-- 8. RECENT QUESTIONS HISTORY (if any) -->
        ${questionHistory.length > 0 && !isAnswering ? `
          <div class="ask-me-history-strip">
            <span style="font-size: 0.78rem; font-weight: 700; color: #64748b;">🕒 ${isTe ? 'ఇటీవలి ప్రశ్నలు:' : (isHi ? 'हाल के प्रश्न:' : 'Recent Queries:')}</span>
            <div class="ask-me-history-pills">
              ${questionHistory.map(h => `
                <button class="history-pill-btn" data-query="${escapeHtml(h.query)}">
                  <span>${h.cropIcon}</span>
                  <span>${h.query.slice(0, 35)}${h.query.length > 35 ? '...' : ''}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    attachEvents();
  }

  function renderAnswerCard(ans) {
    const textToSpeak = `${ans.cropNameEn} Advisory. Observation: ${ans.observation}. Recommendation: ${ans.recommendation}. Risk: ${ans.riskAlert}.`;

    return `
      <div class="ask-me-answer-card" id="ask-me-answer-card">
        <!-- Answer Card Top Header -->
        <div class="answer-card-header">
          <div class="answer-crop-badge">
            <span class="badge-icon">${ans.cropIcon}</span>
            <div>
              <div class="answer-crop-title">${isTe ? ans.cropNameTe : (isHi ? ans.cropNameHi : ans.cropNameEn)} (${ans.variety})</div>
              <div class="answer-crop-stage">🌿 ${ans.stageName} • 🕒 ${ans.timestamp}</div>
            </div>
          </div>

          <!-- Actions: Listen Audio & Share -->
          <div class="answer-action-buttons">
            <button class="btn-listen-speech" id="btn-answer-listen" title="Listen Audio">
              <span>🔊</span>
              <span>${isTe ? 'వినండి' : (isHi ? 'सुनें' : 'Listen')}</span>
            </button>
            <button class="btn-share-answer" id="btn-answer-share" title="Share with Agri Officer">
              <span>📤</span>
              <span>${isTe ? 'షేర్' : (isHi ? 'शेयर' : 'Share')}</span>
            </button>
          </div>
        </div>

        <!-- Question Echo -->
        <div class="answer-question-echo">
          <span class="q-icon">❓</span>
          <strong>${ans.query}</strong>
        </div>

        <!-- 1. AI Diagnostic Observation -->
        <div class="answer-section-block">
          <div class="answer-sec-title">
            <span>🔎</span>
            <span>${isTe ? 'AI రోగనిర్ధారణ & క్షేత్ర పరిశీలన (Diagnostic Finding)' : (isHi ? 'एआई अवलोकन (Diagnostic Observation)' : 'AI Diagnostic Finding')}</span>
          </div>
          <div class="answer-sec-body">
            ${ans.observation}
          </div>
        </div>

        <!-- 2. Specific Recommendation & Solution -->
        <div class="answer-section-block highlight-recom">
          <div class="answer-sec-title" style="color: #166534;">
            <span>💡</span>
            <span>${isTe ? 'సిఫార్సు & నివారణ పరిష్కారం (Recommendation & Remedy)' : (isHi ? 'अनुशंसित समाधान (Recommendation & Solution)' : 'Recommended Agronomic Solution')}</span>
          </div>
          <div class="answer-recom-text">
            ${ans.recommendation}
          </div>

          <!-- Specific Chemical / Organic Dosage Matrix -->
          ${ans.dosageDetails && ans.dosageDetails.length > 0 ? `
            <div class="answer-dosage-table">
              <div class="dosage-table-heading">
                <span>🧪</span>
                <span>${isTe ? 'మోతాదు మరియు వాడకం వివరాలు:' : (isHi ? 'अनुशंसित मात्रा व खुराक:' : 'Dosage & Application Protocol:')}</span>
              </div>
              <div class="dosage-grid">
                ${ans.dosageDetails.map(d => `
                  <div class="dosage-item">
                    <span class="dosage-name">${d.item}</span>
                    <span class="dosage-badge">${d.dose}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 3. Risk & Precaution Alert -->
        ${ans.riskAlert ? `
          <div class="answer-risk-alert">
            <span class="risk-icon">⚠️</span>
            <div>
              <strong>${isTe ? 'జాగ్రత్త / హెచ్చరిక:' : (isHi ? 'सावधानी व जोखिम:' : 'Key Risk & Caution:')}</strong>
              <span>${ans.riskAlert}</span>
            </div>
          </div>
        ` : ''}

        <!-- 4. Immediate Action Steps -->
        ${ans.actionSteps && ans.actionSteps.length > 0 ? `
          <div class="answer-action-checklist">
            <div class="checklist-title">
              <span>📅</span>
              <span>${isTe ? 'వెంటనే చేయవలసిన పనులు:' : (isHi ? 'तत्काल करने योग्य कार्य:' : 'Immediate Action Checklist:')}</span>
            </div>
            <ul class="checklist-items">
              ${ans.actionSteps.map(step => `
                <li><span class="check-icon">✓</span> <span>${step}</span></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 5. Knowledge Verification Strip -->
        <div class="answer-footer-sources">
          <div class="source-info">
            <span>📚 ${isTe ? 'ఆధారం:' : (isHi ? 'स्रोत:' : 'Validated Source:')}</span>
            <span class="source-pill">${ans.knowledgeSource}</span>
          </div>
          <div class="disclaimer-note">
            <span>ℹ️ ${isTe ? 'సహాయక సలహా మాత్రమే. వ్యవసాయ అధికారితో నిర్ధారించుకోండి.' : (isHi ? 'निर्णय-सहायता सलाह। कृषि अधिकारी से पुष्टि करें।' : 'Decision support advisory. Calibrated for local agro-climatic conditions.')}</span>
          </div>
        </div>

      </div>
    `;
  }

  function attachEvents() {
    // Crop Selector Buttons
    container.querySelectorAll('.crop-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCropId = btn.getAttribute('data-crop-id');
        const c = getActiveCrop();
        activeStageId = c.defaultStage;
        activeVariety = c.varieties[0];
        render();
      });
    });

    // Crop Variety Dropdown
    const varietySelect = container.querySelector('#ask-me-variety-select');
    if (varietySelect) {
      varietySelect.addEventListener('change', (e) => {
        activeVariety = e.target.value;
      });
    }

    // Growth Stage Dropdown
    const stageSelect = container.querySelector('#ask-me-stage-select');
    if (stageSelect) {
      stageSelect.addEventListener('change', (e) => {
        activeStageId = e.target.value;
      });
    }

    // Quick Question Chips
    container.querySelectorAll('.quick-q-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        const inputEl = container.querySelector('#ask-me-input');
        if (inputEl) inputEl.value = query;
        handleAskQuestion(query);
      });
    });

    // History Pills
    container.querySelectorAll('.history-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        const inputEl = container.querySelector('#ask-me-input');
        if (inputEl) inputEl.value = query;
        handleAskQuestion(query);
      });
    });

    // Form Submit
    const form = container.querySelector('#ask-me-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputEl = container.querySelector('#ask-me-input');
        const query = inputEl ? inputEl.value : userQuery;
        handleAskQuestion(query);
      });
    }

    // Mic Voice Button
    const micBtn = container.querySelector('#btn-ask-me-mic');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        toggleSpeechRecognition();
      });
    }

    // Listen Speech Audio Button
    const listenBtn = container.querySelector('#btn-answer-listen');
    if (listenBtn && currentAnswer) {
      listenBtn.addEventListener('click', () => {
        const speakText = `${currentAnswer.query}. ${currentAnswer.observation}. ${currentAnswer.recommendation}. ${currentAnswer.riskAlert}`;
        speakAnswer(speakText);
      });
    }

    // Share Button
    const shareBtn = container.querySelector('#btn-answer-share');
    if (shareBtn && currentAnswer) {
      shareBtn.addEventListener('click', () => {
        const shareText = `[AgriBridge ${currentAnswer.cropNameEn} Advisory]\nQ: ${currentAnswer.query}\nObservation: ${currentAnswer.observation}\nRecommendation: ${currentAnswer.recommendation}\nSource: ${currentAnswer.knowledgeSource}`;
        navigator.clipboard?.writeText(shareText).catch(() => {});
        showToast(isTe ? "సలహా వివరాలు కాపీ చేయబడ్డాయి!" : (isHi ? "सलाह कॉपी कर ली गई!" : "Advisory copied to clipboard! Ready to share."), "success", 4000);
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  render();
}
