import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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
