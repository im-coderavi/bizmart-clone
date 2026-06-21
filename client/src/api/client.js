import axios from "axios";

// In dev, "/api" is proxied to the local server (see vite.config.js).
// In production (Vercel), set VITE_API_URL to the backend URL (with or without
// a trailing /api — both work, e.g. https://your-backend.vercel.app).
function resolveBaseURL() {
  const raw = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return "/api";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
});

// attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// surface a clean error message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Something went wrong";
    err.uiMessage = message;
    err.needMembership = err.response?.data?.needMembership;
    return Promise.reject(err);
  }
);

export default api;
