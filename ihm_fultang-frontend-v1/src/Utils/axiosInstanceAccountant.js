import axios from "axios";

const axiosInstanceAccountant = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_FULTANG_API_BASE_ACCOUNTANT_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstanceAccountant.interceptors.request.use((config) => {
  const token = localStorage.getItem("token_key_fultang");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstanceAccountant;
