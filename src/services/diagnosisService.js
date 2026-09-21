import { mockSampleDiagnosis, mockDiagnosisHistory } from '../data/mockDiagnosis.js';

const STORAGE_KEY = 'agribridge_diagnosis_history';

export const diagnosisService = {
  async analyzeLeaf(imageDataUrl, isSample = false) {
    // Realistic AI scanning latency
    await new Promise(res => setTimeout(res, 1800));

    const result = {
      ...mockSampleDiagnosis,
      scanId: "SCAN-" + Math.floor(10000 + Math.random() * 90000),
      timestamp: new Date().toISOString(),
      imageUrl: imageDataUrl || "./src/assets/sample_leaf.jpg",
      isSample
    };

    // Append to local history
    try {
      let history = await this.getHistory();
      const newHistItem = {
        id: result.scanId,
        date: new Date().toISOString().split('T')[0],
        crop: "Groundnut",
        cropTe: "వేరుశనగ",
        diagnosis: "Early Leaf Spot (Tikka)",
        diagnosisTe: "ఆకు మచ్చ వ్యాధి (తిక్క)",
        confidence: "87%",
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
