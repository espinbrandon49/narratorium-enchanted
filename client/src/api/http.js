import axios from "axios";

// Dev: VITE_API_BASE_URL=http://localhost:3001
// Prod: empty → same-origin (/api)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({
  baseURL: API_BASE || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});
