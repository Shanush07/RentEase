// src/api.js
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const BASE_URL = "http://localhost:4000";

export function useApi() {
  const { getToken } = useAuth();

  const api = axios.create({ baseURL: BASE_URL });

  api.interceptors.request.use(async (config) => {
    const token = await getToken({ template: "default" });
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return api;
}
