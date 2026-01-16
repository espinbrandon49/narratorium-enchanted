import axios from "axios";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
    withCredentials: true, // critical for session cookies
    headers: { "Content-Type": "application/json" },
});
