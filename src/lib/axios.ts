import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/types/api";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// response
api.interceptors.response.use(
  (response) => {
    console.log("response interceptor", response.data);
    return response.data;
  },
  (error) => {
    const parsedError = parseApiError(error);
    if (parsedError.status === 401) {
      // Automatically log out when token expires or session invalidates
      useAuthStore.getState().logout();
    }
    return Promise.reject(parsedError);
  },
);

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const res = error.response;

    if (!res) {
      return {
        success: false,
        message: "Network error",
      };
    }

    return {
      success: false,
      message: res.data?.message ?? "Something went wrong",
      errors: res.data?.errors,
      status: res.status,
    };
  }

  return {
    success: false,
    message: "Unexpected error",
  };
}
