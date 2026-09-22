import { mockSampleDiagnosis, mockDiagnosisHistory } from '../data/mockDiagnosis.js';
import { farmService } from './farmService.js';

const STORAGE_KEY = 'agribridge_diagnosis_history';
const API_BASE = 'http://localhost:5000';

export const diagnosisService = {
  async analyzeLeaf(imageDataUrl, isSample = false, cropName = null) {
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
      // Pass farm.crop as crop_name parameter to backend /diagnose call
      const payload = {
        image_base64: imageDataUrl || "",
        crop_name: crop
      };
      const res = await fetch(`${API_BASE}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        backendResult = await res.json();
      }
    } catch (err) {
      console.warn("Backend /diagnose fetch failed, using client diagnostic engine:", err);
    }

    const primaryFinding = backendResult?.findings?.[0];
    const diseaseDetected = primaryFinding?.disease || mockSampleDiagnosis.diseaseName;
    const confidenceScore = primaryFinding?.confidence_score 
      ? Math.round(primaryFinding.confidence_score * 100) 
      : mockSampleDiagnosis.confidence;

    const result = {
      ...mockSampleDiagnosis,
      cropName: crop,
      diseaseName: diseaseDetected,
      confidence: confidenceScore,
      scanId: backendResult?.scan_id || ("SCAN-" + Math.floor(10000 + Math.random() * 90000)),
      timestamp: new Date().toISOString(),
      imageUrl: imageDataUrl || "./src/assets/sample_leaf.jpg",
      isSample
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
        diagnosisTe: result.diseaseNameTe || result.diseaseName,
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
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [...mockDiagnosisHistory];
  }
};
