import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chatterbox-thuu.onrender.com");

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let the browser set Content-Type automatically with the multipart boundary.
    // Explicitly delete any Content-Type that axios or a previous interceptor set.
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
