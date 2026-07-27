import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 90000, // 90s — handles Render free tier container cold starts (takes 30-50s when sleeping)
});

// Safe storage helper — Edge tracking prevention can block localStorage
function safeGetToken() {
  try { return localStorage.getItem("accessToken"); }
  catch { try { return sessionStorage.getItem("accessToken"); } catch { return null; } }
}
function safeSaveToken(t) {
  try { localStorage.setItem("accessToken", t); } catch { try { sessionStorage.setItem("accessToken", t); } catch {} }
}
function safeRemoveToken() {
  try { localStorage.removeItem("accessToken"); } catch {}
  try { sessionStorage.removeItem("accessToken"); } catch {}
}

// Attach access token from storage
api.interceptors.request.use((config) => {
  const token = safeGetToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 & retry on Render cold-start Network Errors
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/google", "/auth/google-token"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const requestUrl = original?.url || "";

    // Retry once if Network Error (Render backend sleeping & waking up)
    if (!error.response && (!error.code || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") && !original._networkRetry) {
      original._networkRetry = true;
      console.warn("Network error or cold-start timeout — Retrying request after backend wakes up...");
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return api(original);
    }

    // Never intercept auth endpoints for 401 refresh — let them propagate errors to the UI
    const isAuthRequest = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));
    if (isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        safeSaveToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        safeRemoveToken();
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
