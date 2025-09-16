// frontend/src/axios.js
import axios from "axios";

const TOKEN_KEY = "tpm_token"; // matches your code

const instance = axios.create({
  baseURL: "https://trainee-miniproject-tracker-backend.onrender.com/app",

  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Retry config
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Request interceptor: attach token, log
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // add metadata for retries
    config.__retryCount = config.__retryCount || 0;
    // You can log requests in dev
    if (process.env.NODE_ENV !== "production") {
      console.debug("[API Request]", config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global error handling + retry
instance.interceptors.response.use(
  (res) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[API Response]", res.status, res.config?.url);
    }
    return res;
  },
  async (error) => {
    const config = error.config || {};
    // Network or timeout => retry
    if (!config || !config.url) return Promise.reject(error);
    const shouldRetry = (!error.response || error.code === 'ECONNABORTED') && config.__retryCount < MAX_RETRIES;
    if (shouldRetry) {
      config.__retryCount += 1;
      await delay(RETRY_DELAY_MS * config.__retryCount);
      return instance(config);
    }

    // If 401 unauthorized: optionally redirect to login
    if (error.response && error.response.status === 401) {
      // Remove token and broadcast logout
      localStorage.removeItem(TOKEN_KEY);
      // Optionally trigger a custom event that app listens to
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

// Helper: create cancel token source
export function createCancelToken() {
  const controller = new AbortController();
  // Axios supports signal since v0.22.0
  return controller;
}

export default instance;
export { TOKEN_KEY };
