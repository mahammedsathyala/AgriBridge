import { t, getLocale } from '../i18n/index.js';

/**
 * AdvisoryChartBox Component
 * Provides an interactive AI-powered agronomic analytics chart box for the AI Advisory page.
 * Includes interactive metric toggles (Soil Moisture & Irrigation, Crop Health & Stress,
 * Disease Risk Forecast, Nutrient Balance), multi-day trend windows (7, 14, 30 days),
 * gradient SVG trend visualization, interactive data point inspection, and real-time AI insights.
 */
export function renderAdvisoryChartBox(container, { farm = null, weather = null, initialMetric = 'moisture', initialDays = '7' } = {}) {
  let activeMetric = initialMetric; // 'moisture' | 'health' | 'disease' | 'nutrients'
  let activeDays = initialDays;      // '7' | '14' | '30'
  let hoveredPoint = null;

  // Generate realistic agronomic telemetry data calibrated for Kurnool Groundnut (Kadiri-6)
  function generateTelemetrySeries(numDays) {
    const series = [];
    const baseDate = new Date();

    const moistureBase = [34, 32, 29, 48, 44, 40, 36, 33, 31, 28, 45, 41, 37, 34];
    const rainEvents = { 3: 14.5, 10: 18.2 }; // Day index with rainfall (mm)

    for (let i = 0; i < numDays; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }));

      // Soil Moisture & Rain
      const mIdx = i % moistureBase.length;
      let moisture = moistureBase[mIdx];
      const rainMm = rainEvents[i] || 0;

      // Crop Health Index (NDVI equivalent scaled to 0-100)
      const health = Math.min(94, Math.max(72, Math.round(82 + Math.sin(i / 2.5) * 6 + (rainMm > 0 ? 3 : 0))));

      // Canopy Stress (°C)
      const canopyStress = parseFloat((27.5 + Math.cos(i / 2) * 2.8 + (moisture < 30 ? 2.5 : 0)).toFixed(1));

      // Pest & Disease Risks (%)
      let tikkaRisk = Math.min(85, Math.max(15, Math.round(22 + (rainMm > 0 ? 35 : (moisture > 40 ? 20 : 0)) + Math.sin(i / 1.8) * 8)));
      let leafMinerRisk = Math.min(60, Math.max(10, Math.round(18 + Math.cos(i / 3) * 12)));
      let rustRisk = Math.min(55, Math.max(8, Math.round(14 + (rainMm > 0 ? 22 : 0) + Math.sin(i / 2) * 6)));

      // Nutrients Status (%)
      const nitrogen = Math.min(90, Math.max(50, Math.round(72 - (i * 0.4))));
      const phosphorus = Math.min(85, Math.max(45, Math.round(65 - (i * 0.3))));
      const potassium = Math.min(92, Math.max(55, Math.round(78 - (i * 0.2))));
      const gypsumRequirement = Math.min(95, Math.max(40, Math.round(55 + (i * 1.2))));

      series.push({
        dayIndex: i,
        dayName,
        dateStr,
        rainMm,
        moisture,
        health,
        canopyStress,
        tikkaRisk,
        leafMinerRisk,
        rustRisk,
        nitrogen,
        phosphorus,
        potassium,
        gypsumRequirement
      });
    }

    return series;
  }

  function renderChart() {
    const locale = getLocale();
    const isTe = locale === 'te';
    const isHi = locale === 'hi';

    const daysCount = parseInt(activeDays, 10);
    const data = generateTelemetrySeries(daysCount);

    // Dynamic AI Insight text based on metric & telemetry
    let insightTitle = "";
    let insightBody = "";
    let insightBadge = "";

    if (activeMetric === 'moisture') {
      insightBadge = "💧 " + (isTe ? "నీటిపారుదల అంచనా" : (isHi ? "सिंचाई पूर्वानुमान" : "Irrigation Telemetry"));
      insightTitle = isTe ? "3వ రోజు వర్ష సూచన — నేటి నీటిపారుదల వాయిదా వేయండి" : (isHi ? "दिन 3 पर 14.5 मिमी वर्षा अनुमानित — आज सिंचाई टालें" : "Day 3 Rain Expected (14.5mm) — Hold Off Irrigation Today");
      insightBody = isTe
        ? "ప్రస్తుత నేల తేమ 34% వద్ద ఉంది. రాబోయే 48 గంటల్లో వర్షపాతం కారణంగా తేమ 48% వరకు చేరుతుంది. 30% కనీస పరిమితి కంటే పైన ఉన్నందున విద్యుత్ మరియు నీటి వృధాను నివారించండి."
        : (isHi
          ? "वर्तमान मिट्टी की नमी 34% है। अगले 48 घंटों में होने वाली बारिश से नमी 48% तक पहुंचेगी। महत्वपूर्ण 30% सीमा से ऊपर होने के कारण आज पंप न चलाएं।"
          : "Current volumetric soil moisture is at 34%. Projected rainfall on Day 3 will recharge the root zone to 48%. Holding irrigation saves 4,200 liters of water and preserves soil aeration.");
    } else if (activeMetric === 'health') {
      insightBadge = "🌿 " + (isTe ? "పంట ఎదుగుదల & ఆరోగ్యం" : (isHi ? "फसल स्वास्थ्य सूचकांक" : "Crop Health & Vigor"));
      insightTitle = isTe ? "కదిరి-6 పంట ఆరోగ్యం 84-88% స్థిరమైన పురోగతిలో ఉంది" : (isHi ? "कादिरी-6 फसल स्वास्थ्य 84-88% स्थिर प्रगति पर है" : "Kadiri-6 Groundnut Vigor is High (84-88% Health Index)");
      insightBody = isTe
        ? "ఉపగ్రహ NDVI మరియు పందిరి ఉష్ణోగ్రత డేటా పూత దశకు అత్యంత అనుకూలంగా ఉన్నట్లు సూచిస్తున్నాయి. ఉష్ణోగ్రత ఒత్తిడి 28°C వద్ద సాధారణ పరిధిలో ఉంది."
        : (isHi
          ? "उपग्रह NDVI और कैनोपी तापमान डेटा पुष्पण अवस्था के लिए अत्यंत अनुकूल है। कैनोपी तापमान 28°C पर सामान्य सीमा में है।"
          : "Satellite NDVI vegetation indices and canopy temperature sensor telemetry indicate optimal vegetative vigour during the critical pegging initiation phase.");
    } else if (activeMetric === 'disease') {
      insightBadge = "🐛 " + (isTe ? "చీడపీడల ముందస్తు హెచ్చరిక" : (isHi ? "कीट व रोग चेतावनी" : "AI Disease Risk Forecast"));
      insightTitle = isTe ? "వర్షం తర్వాత టిక్కా ఆకుమచ్చ వ్యాధి ప్రమాదం 62% పెరిగే అవకాశం" : (isHi ? "वर्षा के बाद टिक्का पत्ती धब्बा रोग का जोखिम 62% तक बढ़ने की संभावना" : "Post-Rain Humidity Elevates Tikka Leaf Spot Risk to 62%");
      insightBody = isTe
        ? "వర్షం తర్వాత గాలిలో తేమ పెరగడం వల్ల టిక్కా తెగులు వ్యాపించే అవకాశం ఉంది. వర్షం తగ్గిన వెంటనే 5% వేప నూనె లేదా తగిన శిలీంధ్రనాశిని పిచికారీ చేయండి."
        : (isHi
          ? "बारिश के बाद हवा में नमी बढ़ने से टिक्का रोग के बीजाणु तेजी से फैल सकते हैं। बारिश रुकने के 24 घंटे बाद 5% नीम अर्क या अनुशंसित कवकनाशी का छिड़काव करें।"
          : "Elevated canopy leaf wetness duration after Day 3 rain triggers Cercospora spore germination. Schedule prophylactic bio-agent or 5% neem extract spray.");
    } else {
      insightBadge = "🧪 " + (isTe ? "నేల పోషకాల సమతుల్యత" : (isHi ? "मृदा पोषण संतुलन" : "Soil Nutrients & Gypsum"));
      insightTitle = isTe ? "ఊడల దశలో 200 కేజీల జిప్సం వేయడానికి సరైన సమయం" : (isHi ? "पेगिंग अवस्था में 200 किग्रा/एकड़ जिप्सम डालने का सही समय" : "Pegging Stage Gypsum Application Window (40-45 DAS)");
      insightBody = isTe
        ? "నేలలో కాల్షియం మరియు సల్ఫర్ లోపం రాకుండా, కాయలు గట్టిగా నిండటానికి ఎకరాకు 200 కేజీల జిప్సం వేసి తేలికపాటి తేమ ఉండేలా చూడండి."
        : (isHi
          ? "फलियों के विकास और दाना भराव को मजबूत करने के लिए 40-45 दिनों पर 200 किग्रा/एकड़ जिप्सम का प्रयोग करें और हल्की नमी बनाए रखें।"
          : "Calcium and sulfur uptake directly governs groundnut pod development. Apply 200 kg/acre gypsum around root zone during current 42-day pegging window.");
    }

    // Chart Dimensions
    const svgWidth = 740;
    const svgHeight = 230;
    const padL = 46;
    const padR = 24;
    const padT = 24;
    const padB = 36;
    const plotW = svgWidth - padL - padR;
    const plotH = svgHeight - padT - padB;

    const count = data.length;
    const getX = (i) => count <= 1 ? (padL + plotW / 2) : (padL + (i / (count - 1)) * plotW);
    const getY = (val, min, max) => padT + plotH - ((val - min) / (max - min)) * plotH;

    // Build SVG paths according to active metric
    let svgPlotHtml = '';
    let yLabels = [];
    let legendItems = [];

    if (activeMetric === 'moisture') {
      const minVal = 10;
      const maxVal = 60;
      yLabels = ['60%', '45%', '30%', '15%'];

      const points = data.map((d, i) => ({ x: getX(i), y: getY(d.moisture, minVal, maxVal), ...d }));
      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

      // Threshold lines
      const optUpperY = getY(45, minVal, maxVal);
      const optLowerY = getY(30, minVal, maxVal);

      svgPlotHtml = `
        <!-- Optimal Moisture Zone Shading -->
        <rect x="${padL}" y="${optUpperY}" width="${plotW}" height="${optLowerY - optUpperY}" fill="rgba(34, 197, 94, 0.08)" />
        <line x1="${padL}" y1="${optUpperY}" x2="${padL + plotW}" y2="${optUpperY}" stroke="rgba(34, 197, 94, 0.4)" stroke-dasharray="4 3" stroke-width="1.2" />
        <line x1="${padL}" y1="${optLowerY}" x2="${padL + plotW}" y2="${optLowerY}" stroke="rgba(239, 68, 68, 0.5)" stroke-dasharray="4 3" stroke-width="1.2" />
        <text x="${padL + plotW - 4}" y="${optUpperY - 4}" fill="#16a34a" font-size="10" font-weight="600" text-anchor="end">Optimal Cap (45%)</text>
        <text x="${padL + plotW - 4}" y="${optLowerY - 4}" fill="#dc2626" font-size="10" font-weight="600" text-anchor="end">Min Irrigation Trigger (30%)</text>

        <!-- Moisture Area & Line -->
        <path d="${areaD}" fill="url(#moistureGradient)" opacity="0.45" />
        <path d="${pathD}" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Circles & Rain Markers -->
        ${points.map((p, i) => `
          <g class="chart-point-group" data-idx="${i}">
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#ffffff" stroke="#0284c7" stroke-width="2.5" class="chart-interactive-dot" />
            ${p.rainMm > 0 ? `
              <circle cx="${p.x.toFixed(1)}" cy="${(padT + 12).toFixed(1)}" r="10" fill="#3b82f6" opacity="0.15" />
              <text x="${p.x.toFixed(1)}" y="${(padT + 16).toFixed(1)}" font-size="11" text-anchor="middle">🌧️</text>
              <text x="${p.x.toFixed(1)}" y="${(padT + 28).toFixed(1)}" font-size="9" fill="#1d4ed8" font-weight="700" text-anchor="middle">${p.rainMm}mm</text>
            ` : ''}
          </g>
        `).join('')}
      `;

      legendItems = [
        { color: '#0284c7', label: isTe ? 'నేల తేమ శాతం (%)' : (isHi ? 'मृदा नमी (%)' : 'Soil Moisture (%)') },
        { color: 'rgba(34, 197, 94, 0.8)', label: isTe ? 'అనుకూల పరిధి (30-45%)' : (isHi ? 'अनुकूल क्षेत्र (30-45%)' : 'Optimal Zone (30-45%)') },
        { color: '#3b82f6', label: isTe ? 'వర్షపాతం (మి.మీ)' : (isHi ? 'वर्षा (मिमी)' : 'Rain Event (mm)') }
      ];

    } else if (activeMetric === 'health') {
      const minVal = 50;
      const maxVal = 100;
      yLabels = ['100', '85', '70', '55'];

      const healthPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.health, minVal, maxVal), ...d }));
      const stressPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.canopyStress * 2.5, minVal, maxVal), ...d }));

      const hPath = healthPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const hArea = `${hPath} L ${healthPoints[healthPoints.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${healthPoints[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
      const sPath = stressPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

      svgPlotHtml = `
        <path d="${hArea}" fill="url(#healthGradient)" opacity="0.35" />
        <path d="${hPath}" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${sPath}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" />

        ${healthPoints.map((p, i) => `
          <g class="chart-point-group" data-idx="${i}">
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#ffffff" stroke="#16a34a" stroke-width="2.5" class="chart-interactive-dot" />
          </g>
        `).join('')}
      `;

      legendItems = [
        { color: '#16a34a', label: isTe ? 'పంట ఆరోగ్య సూచిక' : (isHi ? 'फसल स्वास्थ्य सूचकांक' : 'Crop Vigor Index (NDVI)') },
        { color: '#f59e0b', label: isTe ? 'పందిరి ఉష్ణోగ్రత ఒత్తిడి' : (isHi ? 'कैनोपी ताप तनाव' : 'Thermal Stress (°C)') }
      ];

    } else if (activeMetric === 'disease') {
      const minVal = 0;
      const maxVal = 100;
      yLabels = ['100%', '75%', '50%', '25%'];

      const tikkaPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.tikkaRisk, minVal, maxVal), ...d }));
      const minerPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.leafMinerRisk, minVal, maxVal), ...d }));
      const rustPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.rustRisk, minVal, maxVal), ...d }));

      const tPath = tikkaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const tArea = `${tPath} L ${tikkaPoints[tikkaPoints.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${tikkaPoints[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
      const mPath = minerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const rPath = rustPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

      const alertY = getY(50, minVal, maxVal);

      svgPlotHtml = `
        <!-- High Risk Threshold Line -->
        <line x1="${padL}" y1="${alertY}" x2="${padL + plotW}" y2="${alertY}" stroke="rgba(220, 38, 38, 0.45)" stroke-dasharray="4 3" stroke-width="1.2" />
        <text x="${padL + plotW - 4}" y="${alertY - 4}" fill="#dc2626" font-size="10" font-weight="600" text-anchor="end">High Risk Zone (>50%)</text>

        <!-- Tikka Spot Area & Line -->
        <path d="${tArea}" fill="url(#diseaseGradient)" opacity="0.3" />
        <path d="${tPath}" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
        <path d="${mPath}" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" />
        <path d="${rPath}" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3" />

        ${tikkaPoints.map((p, i) => `
          <g class="chart-point-group" data-idx="${i}">
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#ffffff" stroke="#dc2626" stroke-width="2.5" class="chart-interactive-dot" />
          </g>
        `).join('')}
      `;

      legendItems = [
        { color: '#dc2626', label: isTe ? 'టిక్కా ఆకుమచ్చ తెగులు' : (isHi ? 'टिक्का पत्ती धब्बा' : 'Tikka Leaf Spot Risk') },
        { color: '#8b5cf6', label: isTe ? 'ఆకుముడత పురుగు' : (isHi ? 'लीफ माइनर कीट' : 'Leaf Miner Pest Risk') },
        { color: '#f97316', label: isTe ? 'తుప్పు తెగులు (Rust)' : (isHi ? 'गेरुई/रस्ट रोग' : 'Rust Disease Risk') }
      ];

    } else {
      // Nutrients & Gypsum
      const minVal = 0;
      const maxVal = 100;
      yLabels = ['100%', '75%', '50%', '25%'];

      const nPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.nitrogen, minVal, maxVal), ...d }));
      const pPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.phosphorus, minVal, maxVal), ...d }));
      const kPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.potassium, minVal, maxVal), ...d }));
      const gPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.gypsumRequirement, minVal, maxVal), ...d }));

      const nPath = nPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const pPath = pPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const kPath = kPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const gPath = gPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

      svgPlotHtml = `
        <path d="${nPath}" fill="none" stroke="#16a34a" stroke-width="2.5" />
        <path d="${pPath}" fill="none" stroke="#eab308" stroke-width="2.5" />
        <path d="${kPath}" fill="none" stroke="#3b82f6" stroke-width="2.5" />
        <path d="${gPath}" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-dasharray="5 3" />

        ${gPoints.map((p, i) => `
          <g class="chart-point-group" data-idx="${i}">
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#ffffff" stroke="#ec4899" stroke-width="2.5" class="chart-interactive-dot" />
          </g>
        `).join('')}
      `;

      legendItems = [
        { color: '#16a34a', label: 'Nitrogen (N)' },
        { color: '#eab308', label: 'Phosphorus (P)' },
        { color: '#3b82f6', label: 'Potassium (K)' },
        { color: '#ec4899', label: isTe ? 'జిప్సం అవసరం (Gypsum)' : (isHi ? 'जिप्सम आवश्यकता' : 'Gypsum Demand (Pegging)') }
      ];
    }

    // Grid lines
    const gridLines = [0, 0.33, 0.66, 1].map(ratio => {
      const y = padT + plotH * ratio;
      return `<line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="rgba(203, 213, 225, 0.5)" stroke-dasharray="3 3" stroke-width="1" />`;
    }).join('');

    // X-Axis Date Labels
    const xLabelsHtml = data.map((d, i) => {
      // For 30 days, skip some labels to keep readability
      if (daysCount === 30 && i % 3 !== 0 && i !== count - 1) return '';
      const x = getX(i);
      return `
        <text x="${x}" y="${padT + plotH + 18}" fill="#64748b" font-size="10.5" font-weight="600" text-anchor="middle">${d.dayName}</text>
        <text x="${x}" y="${padT + plotH + 30}" fill="#94a3b8" font-size="9" text-anchor="middle">${d.dateStr}</text>
      `;
    }).join('');

    // Y-Axis Labels
    const yLabelsHtml = yLabels.map((lbl, idx) => {
      const y = padT + (plotH / (yLabels.length - 1)) * idx;
      return `<text x="${padL - 8}" y="${y + 3}" fill="#64748b" font-size="10" font-weight="600" text-anchor="end">${lbl}</text>`;
    }).join('');

    container.innerHTML = `
      <div class="advisory-chart-card">
        <!-- 1. CHART BOX HEADER -->
        <div class="advisory-chart-header">
          <div class="advisory-chart-title-wrap">
            <div class="advisory-chart-icon-box">📊</div>
            <div>
              <div class="advisory-chart-heading">
                <span>${isTe ? 'AI వ్యవసాయ విశ్లేషణలు & ముందస్తు ధోరణులు' : (isHi ? 'एआई कृषि विश्लेषण एवं अग्रिम प्रवृत्तियां' : 'AI Agronomic Analytics & Predictive Trends')}</span>
                <span class="advisory-chart-calib-badge">🌱 Kadiri-6 Calibrated</span>
              </div>
              <div class="advisory-chart-sub">
                ${isTe ? 'నేల తేమ, పంట ఆరోగ్యం, తెగుళ్ల ప్రమాద అంచనా మరియు పోషకాల సమతుల్యత' : (isHi ? 'मिट्टी की नमी, फसल स्वास्थ्य, कीट जोखिम पूर्वानुमान एवं पोषण संतुलन' : 'Real-time telemetry tracking soil moisture thresholds, crop stress, disease risk forecast & nutrient balance')}
              </div>
            </div>
          </div>

          <!-- Time Horizon Selector -->
          <div class="advisory-time-pills">
            <button class="time-pill-btn ${activeDays === '7' ? 'active' : ''}" data-days="7">7 ${isTe ? 'రోజులు' : (isHi ? 'दिन' : 'Days')}</button>
            <button class="time-pill-btn ${activeDays === '14' ? 'active' : ''}" data-days="14">14 ${isTe ? 'రోజులు' : (isHi ? 'दिन' : 'Days')}</button>
            <button class="time-pill-btn ${activeDays === '30' ? 'active' : ''}" data-days="30">30 ${isTe ? 'రోజులు' : (isHi ? 'दिन' : 'Days')}</button>
          </div>
        </div>

        <!-- 2. METRIC SELECTOR TABS -->
        <div class="advisory-metric-tabs">
          <button class="metric-tab-btn ${activeMetric === 'moisture' ? 'active' : ''}" data-metric="moisture">
            <span>💧</span>
            <span>${isTe ? 'నేల తేమ & నీటిపారుదల' : (isHi ? 'मिट्टी नमी व सिंचाई' : 'Soil Moisture & Irrigation')}</span>
          </button>
          <button class="metric-tab-btn ${activeMetric === 'health' ? 'active' : ''}" data-metric="health">
            <span>🌿</span>
            <span>${isTe ? 'పంట ఆరోగ్యం & ఒత్తిడి' : (isHi ? 'फसल स्वास्थ्य व तनाव' : 'Crop Health & Vigor')}</span>
          </button>
          <button class="metric-tab-btn ${activeMetric === 'disease' ? 'active' : ''}" data-metric="disease">
            <span>🐛</span>
            <span>${isTe ? 'చీడపీడల ప్రమాద అంచనా' : (isHi ? 'कीट व रोग जोखिम' : 'Pest & Disease Risk')}</span>
          </button>
          <button class="metric-tab-btn ${activeMetric === 'nutrients' ? 'active' : ''}" data-metric="nutrients">
            <span>🧪</span>
            <span>${isTe ? 'పోషకాలు & జిప్సం' : (isHi ? 'पोषण एवं जिप्सम' : 'Nutrients & Gypsum')}</span>
          </button>
        </div>

        <!-- 3. SVG CHART VIEWPORT -->
        <div class="advisory-svg-container">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="advisory-chart-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
              </linearGradient>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#16a34a" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#16a34a" stop-opacity="0.0" />
              </linearGradient>
              <linearGradient id="diseaseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dc2626" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#dc2626" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <!-- Grid Lines & Labels -->
            ${gridLines}
            ${yLabelsHtml}
            ${xLabelsHtml}

            <!-- Dynamic Plot Elements -->
            ${svgPlotHtml}
          </svg>

          <!-- Interactive Tooltip Overlay -->
          <div id="chart-tooltip-box" class="advisory-chart-tooltip" style="display: none;"></div>
        </div>

        <!-- 4. CHART LEGENDS -->
        <div class="advisory-chart-legend-strip">
          ${legendItems.map(item => `
            <div class="chart-legend-item">
              <span class="legend-color-dot" style="background-color: ${item.color};"></span>
              <span class="legend-text">${item.label}</span>
            </div>
          `).join('')}
        </div>

        <!-- 5. AI DIAGNOSTIC INSIGHT CALLOUT (Live Action Recommendation) -->
        <div class="advisory-chart-ai-insight">
          <div class="ai-insight-badge">${insightBadge}</div>
          <div class="ai-insight-content">
            <div class="ai-insight-title">💡 ${insightTitle}</div>
            <div class="ai-insight-text">${insightBody}</div>
          </div>
        </div>

        <!-- 6. QUICK KPI STATS STRIP -->
        <div class="advisory-chart-kpi-row">
          <div class="chart-kpi-chip">
            <span class="kpi-icon">💧</span>
            <div>
              <div class="kpi-label">${isTe ? 'ప్రస్తుత తేమ' : (isHi ? 'वर्तमान नमी' : 'Current Moisture')}</div>
              <div class="kpi-val" style="color: #0284c7;">34% <small style="font-size:0.75rem; color:#16a34a;">● Adequate</small></div>
            </div>
          </div>

          <div class="chart-kpi-chip">
            <span class="kpi-icon">🌿</span>
            <div>
              <div class="kpi-label">${isTe ? 'పంట శక్తి (NDVI)' : (isHi ? 'फसल ओज (NDVI)' : 'Crop Vigor Index')}</div>
              <div class="kpi-val" style="color: #16a34a;">0.74 <small style="font-size:0.75rem; color:#16a34a;">● Healthy</small></div>
            </div>
          </div>

          <div class="chart-kpi-chip">
            <span class="kpi-icon">🌦️</span>
            <div>
              <div class="kpi-label">${isTe ? 'వర్ష సూచన (72గం)' : (isHi ? 'वर्षा (72 घंटे)' : 'Rain Forecast (72h)')}</div>
              <div class="kpi-val" style="color: #2563eb;">14.5 mm <small style="font-size:0.75rem; color:#f59e0b;">(Day 3)</small></div>
            </div>
          </div>

          <div class="chart-kpi-chip">
            <span class="kpi-icon">🛡️</span>
            <div>
              <div class="kpi-label">${isTe ? 'వ్యాధి ప్రమాదం' : (isHi ? 'रोग जोखिम' : 'Current Disease Risk')}</div>
              <div class="kpi-val" style="color: #16a34a;">22% <small style="font-size:0.75rem; color:#16a34a;">● Low Zone</small></div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Attach Event Listeners
    // Metric Tabs
    container.querySelectorAll('.metric-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeMetric = btn.getAttribute('data-metric');
        renderChart();
      });
    });

    // Time Horizon Buttons
    container.querySelectorAll('.time-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeDays = btn.getAttribute('data-days');
        renderChart();
      });
    });

    // Interactive Hover & Touch Tooltips on SVG points
    const tooltipEl = container.querySelector('#chart-tooltip-box');
    container.querySelectorAll('.chart-point-group').forEach(group => {
      const idx = parseInt(group.getAttribute('data-idx'), 10);
      const pt = data[idx];

      group.addEventListener('mouseenter', (e) => {
        if (!pt || !tooltipEl) return;
        let detailsHtml = '';
        if (activeMetric === 'moisture') {
          detailsHtml = `
            <strong>${pt.dayName} (${pt.dateStr})</strong><br/>
            💧 Moisture: <strong>${pt.moisture}%</strong> (${pt.moisture >= 30 ? 'Adequate' : 'Low'})<br/>
            ${pt.rainMm > 0 ? `🌧️ Rain: <strong>${pt.rainMm} mm</strong><br/>` : ''}
            💡 Status: ${pt.moisture < 30 ? '🚨 Irrigation Needed' : '✅ Moisture Satiated'}
          `;
        } else if (activeMetric === 'health') {
          detailsHtml = `
            <strong>${pt.dayName} (${pt.dateStr})</strong><br/>
            🌿 Vigor Score: <strong>${pt.health}/100</strong><br/>
            🌡️ Canopy Stress: <strong>${pt.canopyStress}°C</strong><br/>
            💡 Phenology: Flowering & Pegging (Optimal)
          `;
        } else if (activeMetric === 'disease') {
          detailsHtml = `
            <strong>${pt.dayName} (${pt.dateStr})</strong><br/>
            🍂 Tikka Leaf Spot: <strong>${pt.tikkaRisk}%</strong><br/>
            🐛 Leaf Miner: <strong>${pt.leafMinerRisk}%</strong><br/>
            🛡️ Alert: ${pt.tikkaRisk > 50 ? '⚠️ High Risk — Spray Neem Extract' : '✅ Low Infection Risk'}
          `;
        } else {
          detailsHtml = `
            <strong>${pt.dayName} (${pt.dateStr})</strong><br/>
            N: ${pt.nitrogen}% | P: ${pt.phosphorus}% | K: ${pt.potassium}%<br/>
            🌸 Gypsum Demand: <strong>${pt.gypsumRequirement}%</strong><br/>
            💡 Rec: Apply 200kg gypsum at pegging
          `;
        }

        tooltipEl.innerHTML = detailsHtml;
        tooltipEl.style.display = 'block';

        const svgRect = container.querySelector('.advisory-svg-container').getBoundingClientRect();
        const ptX = getX(idx);
        const relX = (ptX / svgWidth) * svgRect.width;

        tooltipEl.style.left = `${Math.min(svgRect.width - 160, Math.max(10, relX - 70))}px`;
        tooltipEl.style.top = `15px`;
      });

      group.addEventListener('mouseleave', () => {
        if (tooltipEl) tooltipEl.style.display = 'none';
      });
    });
  }

  renderChart();
}
