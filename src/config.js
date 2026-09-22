/**
 * AgriBridge Centralized API Configuration
 * ----------------------------------------
 * Dynamically resolves backend API base URL with fallback to local development port.
 * Allows override via window.APP_CONFIG.API_BASE_URL (for GitHub Pages / cloud hosting).
 */

const DEFAULT_API_URL = "http://localhost:5000";

export const API_BASE_URL =
  window.APP_CONFIG?.API_BASE_URL ||
  window.__AGRIBRIDGE_API_URL__ ||
  DEFAULT_API_URL;

export const API_TIMEOUT_MS = 10000;

export const USE_MOCK_FALLBACK = true;
