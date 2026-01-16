import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
    const nav = useNavigate();
    const { doLogin } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await doLogin({ email, password });
            nav("/");
        } catch (e2) {
            setError("Invalid credentials.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card">
            <h2>Login</h2>
            <form className="stack" onSubmit={onSubmit}>
                <label>
                    <div className="muted small">Email</div>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label>
                    <div className="muted small">Password</div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>

                <button className="btn" disabled={saving}>
                    {saving ? "Signing in..." : "Login"}
                </button>

                {error ? <div className="error">{error}</div> : null}

                <div className="muted small">
                    No account? <Link to="/signup">Signup</Link>
                </div>
            </form>
        </div>
    );
}
