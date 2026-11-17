import axios, { AxiosError } from "axios";

/**
 * Centralized typed Axios client with base URL, timeout, and response interceptor.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? "" : "http://localhost:8000"),
  timeout: 180000, // 3 minutes timeout for heavy PubMed/LLM pipeline runs
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    let parsedMessage = "An unexpected network error occurred.";
    if (error.response?.data?.detail) {
      parsedMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      parsedMessage = error.response.data.message;
    } else if (error.message) {
      parsedMessage = error.message;
    }
    return Promise.reject(new Error(parsedMessage));
  }
);

export default apiClient;
