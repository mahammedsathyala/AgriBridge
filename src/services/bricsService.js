import { bricsCountries, bricsNetworkGraph, sampleDataExchangePayload } from '../data/mockBrics.js';

export const bricsService = {
  async getCountries() {
    return [...bricsCountries];
  },

  async getNetworkGraph() {
    return { ...bricsNetworkGraph };
  },

  async getStatus() {
    return [
      { key: "cads", nameKey: "brics.schemaStatus", status: "Active", statusTe: "క్రియాశీలకం", version: "v1.4-ISO-JSON" },
      { key: "gateway", nameKey: "brics.gatewayStatus", status: "Active", statusTe: "క్రియాశీలకం", latency: "42ms" },
      { key: "registry", nameKey: "brics.registryStatus", status: "Active", statusTe: "క్రియాశీలకం", models: "18 Federated Models" },
      { key: "trans", nameKey: "brics.transStatus", status: "Active", statusTe: "క్రియాశీలకం", langs: "5 Languages" },
      { key: "privacy", nameKey: "brics.privacyStatus", status: "Active", statusTe: "క్రియాశీలకం", standard: "Diff-Privacy ε=0.5" },
      { key: "provenance", nameKey: "brics.provenanceStatus", status: "Active", statusTe: "క్రియాశీలకం", ledger: "Verifiable Block Ledger" }
    ];
  },

  async simulateDataExchange(sourceCode, targetCode, indicator) {
    // Realistic cross-border encrypted network hop simulation
    await new Promise(res => setTimeout(res, 1200));

    const source = bricsCountries.find(c => c.code === sourceCode) || bricsCountries[0];
    const target = bricsCountries.find(c => c.code === targetCode) || bricsCountries[1];

    const payload = sampleDataExchangePayload(source, target, indicator);

    // Persist to backend SQLite DB DataExchangeLog audit table
    try {
      await fetch('http://localhost:5000/api/brics/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_node: source.name,
          target_node: target.name,
          indicator: indicator,
          payload: payload
        }),
        signal: AbortSignal.timeout(3000)
      });
    } catch (e) {
      console.warn("Backend CADS exchange logging failed (offline fallback):", e);
    }

    return {
      success: true,
      source,
      target,
      indicator,
      payload
    };
  }
};
