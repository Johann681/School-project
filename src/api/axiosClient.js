import axios from "axios";

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost
    ? "http://localhost:5000/api"
    : "https://school-project-i40q.onrender.com/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAuthSession = () => {
  try {
    return JSON.parse(localStorage.getItem("lmsAuth") || "null");
  } catch {
    localStorage.removeItem("lmsAuth");
    return null;
  }
};

api.interceptors.request.use((config) => {
  const authSession = getAuthSession();
  const token = authSession?.token;

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("lmsAuth");
    }

    return Promise.reject(error);
  }
);

export default api;
