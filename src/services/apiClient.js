/**
 * AgriBridge Unified Common API Client
 * ------------------------------------
 * Provides resilient HTTP GET, POST, and multipart request helpers
 * with AbortController timeout, standardized error handling,
 * and automatic base URL routing.
 */

import { API_BASE_URL, API_TIMEOUT_MS } from "../config.js";

function buildUrl(path) {
  const base = (API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${base}/${cleanPath}`;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || API_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = buildUrl(path);
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (typeof data === "object" && (data.message || data.error || data.detail)) ||
        `API request failed with HTTP ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      error.url = url;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
      timeoutError.status = 408;
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  /**
   * Executes an HTTP GET request
   */
  get(path, options = {}) {
    return request(path, {
      ...options,
      method: "GET"
    });
  },

  /**
   * Executes an HTTP POST request with JSON or FormData body
   */
  post(path, body = {}, options = {}) {
    return request(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  /**
   * Executes an HTTP PUT request with JSON body
   */
  put(path, body = {}, options = {}) {
    return request(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  /**
   * Executes an HTTP PATCH request
   */
  patch(path, body = {}, options = {}) {
    return request(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }
};
