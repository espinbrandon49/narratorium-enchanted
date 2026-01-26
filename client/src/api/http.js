import axios from "axios";

// In dev, VITE_API_BASE_URL=http://localhost:3001
// In prod (Heroku monolith), undefined → same-origin
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : "/api",
  withCredentials: true, // critical for session cookies
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});
