import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      toast.error(error.response.data.message || "Something went wrong");
    } else {
      toast.error("Unable to connect to server. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default api;
