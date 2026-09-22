import { mockSampleDiagnosis, mockDiagnosisHistory } from '../data/mockDiagnosis.js';
import { farmService } from './farmService.js';
import { apiClient } from './apiClient.js';
import { USE_MOCK_FALLBACK } from '../config.js';

const STORAGE_KEY = 'agribridge_diagnosis_history';

export function diagnoseLeaf(imageFile, cropName = "Groundnut") {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("crop_name", cropName);

  return apiClient.post("/api/v1/diagnoses", formData);
}

export const diagnosisService = {
  /**
   * Run computer vision crop diagnosis via Flask backend
   */
  async analyzeLeaf(imageDataUrlOrFile, isSample = false, cropName = null) {
    let crop = cropName;
    if (!crop) {
      try {
        const farm = await farmService.getFarmProfile();
        crop = farm?.crop || "Groundnut";
      } catch {
        crop = "Groundnut";
      }
    }

    let backendResult = null;
    try {
      if (imageDataUrlOrFile instanceof File || imageDataUrlOrFile instanceof Blob) {
        backendResult = await diagnoseLeaf(imageDataUrlOrFile, crop);
      } else {
        // Send base64 payload via JSON
        const payload = {
          image_base64: imageDataUrlOrFile || "",
          crop_name: crop
        };
        backendResult = await apiClient.post('/api/v1/diagnoses', payload);
      }
    } catch (err) {
      if (!USE_MOCK_FALLBACK) throw err;
      console.warn("Backend /api/v1/diagnoses fetch failed, using client diagnostic fallback:", err);
    }

    const dataObj = backendResult?.data || backendResult;
    const primaryFinding = dataObj?.findings?.[0];
    const diseaseDetected = dataObj?.disease_detected || dataObj?.disease || primaryFinding?.disease || mockSampleDiagnosis.diseaseName;
    
    let confidenceScore = mockSampleDiagnosis.confidence;
    if (dataObj?.confidence_score !== undefined) {
      confidenceScore = Math.round(dataObj.confidence_score <= 1.0 ? dataObj.confidence_score * 100 : dataObj.confidence_score);
    } else if (dataObj?.confidence !== undefined) {
      confidenceScore = Math.round(dataObj.confidence <= 1.0 ? dataObj.confidence * 100 : dataObj.confidence);
    } else if (primaryFinding?.confidence_score !== undefined) {
      confidenceScore = Math.round(primaryFinding.confidence_score <= 1.0 ? primaryFinding.confidence_score * 100 : primaryFinding.confidence_score);
    }

    const weightsStatus = dataObj?.weights_status || dataObj?.data_quality?.weights_status || (backendResult ? "groundnut_trained_model" : "fallback");
    const diagnosisSource = dataObj?.diagnosis_source || dataObj?.data_quality?.diagnosis_source || (backendResult ? "groundnut_trained_model" : "FALLBACK");
    const engineName = dataObj?.engine || dataObj?.data_quality?.model_name || (backendResult ? "MobileNetV2 Deep Neural Network" : "Demo Fallback");
    const warning = dataObj?.warning || backendResult?.warning || "";

    const immediateAction = dataObj?.immediate_actions?.[0] || dataObj?.recommendation || mockSampleDiagnosis.immediateActionEn;
    const preventionPractices = dataObj?.prevention_monitoring?.length ? dataObj.prevention_monitoring : (dataObj?.regenerative_prevention ? [dataObj.regenerative_prevention] : mockSampleDiagnosis.preventionPracticesEn);

    const result = {
      ...mockSampleDiagnosis,
      cropName: crop,
      crop: crop.toLowerCase(),
      diseaseName: diseaseDetected,
      disease: dataObj?.disease || diseaseDetected,
      conditionEn: dataObj?.condition_en || diseaseDetected,
      conditionTe: dataObj?.condition_te || diseaseDetected,
      conditionHi: dataObj?.condition_hi || diseaseDetected,
      confidence: confidenceScore,
      confidencePercent: confidenceScore,
      scanId: dataObj?.scan_id || ("SCAN-" + Math.floor(10000 + Math.random() * 90000)),
      timestamp: new Date().toISOString(),
      imageUrl: typeof imageDataUrlOrFile === 'string' ? imageDataUrlOrFile : "./src/assets/sample_leaf.jpg",
      isSample,
      screeningDisclaimer: dataObj?.screening_disclaimer || "AI-assisted screening tool, not a certified laboratory diagnosis.",
      weightsStatus,
      diagnosisSource,
      engineName,
      warning,
      recommendation: dataObj?.recommendation || "",
      immediateActionEn: immediateAction,
      immediateActionTe: immediateAction,
      immediateActionHi: immediateAction,
      preventionPracticesEn: preventionPractices,
      preventionPracticesTe: preventionPractices,
      preventionPracticesHi: preventionPractices,
      dataSource: diagnosisSource === "groundnut_trained_model" 
        ? "MobileNetV2 Groundnut Classifier" 
        : (diagnosisSource === "YOLOv8" ? "YOLOv8 Neural Network" : (diagnosisSource === "HEURISTIC" ? "Agronomic Heuristic Classifier" : "Demo Fallback"))
    };

    // Append to local history with crop info
    try {
      let history = await this.getHistory();
      const newHistItem = {
        id: result.scanId,
        date: new Date().toISOString().split('T')[0],
        crop: crop,
        cropTe: crop === "Groundnut" ? "వేరుశనగ" : crop,
        diagnosis: result.diseaseName,
        diagnosisTe: result.conditionTe,
        diagnosisHi: result.conditionHi,
        confidence: `${result.confidence}%`,
        status: "Treatment Advised",
        statusTe: "చికిత్స సూచించబడింది",
        imageUrl: result.imageUrl
      };
      history.unshift(newHistItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (e) {
      console.warn("Failed to persist scan history:", e);
    }

    return result;
  },

  async getHistory() {
    try {
      const data = await apiClient.get('/api/v1/diagnoses/history');
      const hist = data?.history || data?.data?.history;
      if (Array.isArray(hist) && hist.length > 0) {
        const mapped = hist.map(r => ({
          id: r.id ? `SCAN-${r.id}` : (r.image_ref || "SCAN-000"),
          date: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          crop: r.crop || "Groundnut",
          cropTe: r.crop === "Groundnut" ? "వేరుశనగ" : r.crop,
          diagnosis: r.disease,
          diagnosisTe: r.disease,
          confidence: `${Math.round(r.confidence || 0)}%`,
          status: "Treatment Advised",
          statusTe: "చికిత్స సూచించబడింది",
          imageUrl: r.image_ref && !r.image_ref.startsWith('http') ? `./src/assets/${r.image_ref}` : (r.image_ref || "./src/assets/sample_leaf.jpg")
        }));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (e) {
      // Fallback to localStorage if backend is unreachable
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [...mockDiagnosisHistory];
  }
};
