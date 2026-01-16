import { Routes, Route, Navigate } from "react-router-dom";
import StoryPage from "../pages/StoryPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<StoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
