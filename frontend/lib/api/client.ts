import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// Browser selalu hit relative path (e.g. /api/v1/...), yang akan di-rewrite 
// oleh next.config.ts ke /api/proxy/..., tempat API Key akan disuntikkan.
const API_BASE_URL = "";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // 30s cukup untuk produksi — 60s terlalu lama untuk UX
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      "Terjadi kesalahan jaringan";
    console.error("[JobSeeker API Error]", message);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
