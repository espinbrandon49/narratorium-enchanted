import axios from "axios";

// Normal dev default: server runs on 3001.
// Prod: set VITE_API_BASE_URL to "" (monolith) or your deployed origin.
const FALLBACK_DEV_API = "http://localhost:3001";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || FALLBACK_DEV_API,
    withCredentials: true, // critical for session cookies
    headers: { "Content-Type": "application/json" },
    timeout: 15000, // prevents infinite "Signing in..." hangs
});
