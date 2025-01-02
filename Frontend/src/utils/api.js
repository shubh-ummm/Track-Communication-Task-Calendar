import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Add request interceptor to handle CORS preflight
api.interceptors.request.use(
  (config) => {
    config.headers["Access-Control-Allow-Credentials"] = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.");
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    } else if (error.response.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    return Promise.reject(error);
  }
);

export default api;
