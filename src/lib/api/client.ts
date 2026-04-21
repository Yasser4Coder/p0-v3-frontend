import axios from "axios";
import { getAccessToken } from "../auth/storage";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || "https://p0.soslawdz.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

