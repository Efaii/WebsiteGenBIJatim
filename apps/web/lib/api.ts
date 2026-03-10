import axios from "axios";

/**
 * @module api
 * @description Centralized Axios client for all API calls.
 * - Public routes use the base instance.
 * - Admin routes automatically attach the Bearer token via interceptor.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth interceptor: automatically attach JWT token for authenticated requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
