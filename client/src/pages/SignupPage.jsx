import React, { useState } from "react";
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
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>Create account</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Join the enchanted story. Anyone can read; only authenticated users can contribute.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
          <small style={{ opacity: 0.75 }}>Minimum 8 characters.</small>
        </label>

        {error ? (
          <div style={{ padding: 10, borderRadius: 8, border: "1px solid #f3b6b6" }}>{error}</div>
        ) : null}

        <button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Sign up"}
        </button>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", opacity: 0.85 }}>
          <span>Already have an account?</span>
          <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}
