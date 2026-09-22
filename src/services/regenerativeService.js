import { defaultRegenerativePractices, defaultRegenerativeMetrics } from '../data/mockRegenerative.js';
import { farmService } from './farmService.js';
import { apiClient } from './apiClient.js';
import { USE_MOCK_FALLBACK } from '../config.js';

export const regenerativeService = {
  /**
   * Fetch regenerative agriculture assessment from backend
   */
  async getAssessment(coords = null) {
    let lat = 15.8281;
    let lon = 78.0373;
    let crop = "Groundnut";

    try {
      const farm = await farmService.getFarmProfile();
      if (farm?.coordinates?.lat && farm?.coordinates?.lng) {
        lat = farm.coordinates.lat;
        lon = farm.coordinates.lng;
      }
      if (farm?.crop) crop = farm.crop;
    } catch {}

    try {
      const res = await apiClient.get(`/api/v1/regenerative/assessment?lat=${lat}&lon=${lon}&crop=${encodeURIComponent(crop)}`);
      const data = res?.data || res;
      if (data && (data.total_score !== undefined || data.data?.total_score !== undefined)) {
        const assessment = data.data || data;
        const rawPillars = assessment.pillar_scores || [];

        const indicators = rawPillars.map(p => ({
          key: p.key,
          labelEn: p.label_en || p.label || p.key,
          labelTe: p.label_te || p.label_en || p.key,
          valuePercent: p.value_percent ?? 65,
          targetPercent: p.target_percent ?? 85,
          calculationBasis: p.calculation_basis || ""
        }));

        return {
          baseScore: assessment.total_score ?? defaultRegenerativeMetrics.baseScore,
          targetScore: assessment.target_score ?? defaultRegenerativeMetrics.targetScore,
          indicators: indicators.length > 0 ? indicators : defaultRegenerativeMetrics.indicators,
          sourceStatus: data.source_status || data.source || "MODEL_CALCULATION",
          scoreName: data.score_name || "AgriBridge Regenerative Practice Score",
          methodology: data.methodology || "Calculated from SoilGrids and telemetry",
          disclaimer: data.disclaimer || "AgriBridge agronomic advisory benchmark"
        };
      }
    } catch (err) {
      if (!USE_MOCK_FALLBACK) throw err;
    }

    return {
      baseScore: defaultRegenerativeMetrics.baseScore,
      targetScore: defaultRegenerativeMetrics.targetScore,
      indicators: defaultRegenerativeMetrics.indicators,
      sourceStatus: "FALLBACK",
      scoreName: "AgriBridge Regenerative Practice Score",
      methodology: "Offline local model benchmark",
      disclaimer: "Offline benchmark mode active"
    };
  }
};
