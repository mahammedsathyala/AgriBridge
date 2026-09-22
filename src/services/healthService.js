/**
 * AgriBridge Health & System Connectivity Service
 * ------------------------------------------------
 * Periodically monitors Flask backend connectivity and maintains
 * reactive listeners for live/demo status transitions across the UI.
 */

import { apiClient } from "./apiClient.js";

let backendStatus = {
  connected: false,
  checkedAt: null,
  serviceInfo: null,
  error: null
};

const listeners = new Set();

export const healthService = {
  /**
   * Queries Flask backend /api/v1/health endpoint
   */
  async checkBackendHealth() {
    try {
      const data = await apiClient.get("/api/v1/health", { timeoutMs: 3500 });
      backendStatus = {
        connected: true,
        checkedAt: new Date().toISOString(),
        serviceInfo: data,
        error: null
      };
      this._notify();
      return {
        connected: true,
        data
      };
    } catch (error) {
      backendStatus = {
        connected: false,
        checkedAt: new Date().toISOString(),
        serviceInfo: null,
        error
      };
      this._notify();
      return {
        connected: false,
        error
      };
    }
  },

  /**
   * Get current cached backend status
   */
  getStatus() {
    return { ...backendStatus };
  },

  /**
   * Subscribe to backend connectivity state changes
   */
  subscribe(callback) {
    listeners.add(callback);
    // Trigger immediately with current status
    callback(this.getStatus());
    return () => listeners.delete(callback);
  },

  _notify() {
    const status = this.getStatus();
    listeners.forEach((cb) => {
      try {
        cb(status);
      } catch (err) {
        console.error("Error in health listener:", err);
      }
    });
  }
};
