import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const nav = useNavigate();
  const { doSignup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await doSignup({ username, email, password });
      nav("/");
    } catch (e2) {
      setError("Signup failed. Please check your info and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>Create account</h2>
      <p className="muted">
        Join the enchanted story. Anyone can read; only authenticated users can contribute.
      </p>

      <form className="stack" onSubmit={onSubmit}>
        <label>
          <div className="muted small">Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          <div className="muted small">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          <div className="muted small">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
          <div className="muted small">Minimum 8 characters.</div>
        </label>

        <button className="btn" disabled={saving}>
          {saving ? "Creating…" : "Sign up"}
        </button>

        {error ? <div className="error">{error}</div> : null}

        <div className="muted small">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
