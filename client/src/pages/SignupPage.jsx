import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import WaxSealButton from "../components/WaxSealButton";

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
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/10 backdrop-blur-sm">
        <h2 className="font-['Cinzel'] text-2xl tracking-wide">
          Create account
        </h2>
        <p className="mt-1 text-sm italic text-slate-700">
          Join the enchanted story. Anyone can read; only authenticated users
          can contribute.
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <div className="text-xs tracking-wide text-slate-700">Username</div>
            <input
              className="
                mt-1 w-full rounded-xl border border-slate-900/15
                bg-white/70 px-3 py-2
                text-slate-900 placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-amber-700/25
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <div className="text-xs tracking-wide text-slate-700">Email</div>
            <input
              className="
                mt-1 w-full rounded-xl border border-slate-900/15
                bg-white/70 px-3 py-2
                text-slate-900 placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-amber-700/25
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <div className="text-xs tracking-wide text-slate-700">Password</div>
            <input
              className="
                mt-1 w-full rounded-xl border border-slate-900/15
                bg-white/70 px-3 py-2
                text-slate-900 placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-amber-700/25
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
            <div className="mt-1 text-xs text-slate-700">
              Minimum 8 characters.
            </div>
          </label>

          {/* wax-seal submit */}
          <WaxSealButton disabled={saving}>
            {saving ? "Creating…" : "Sign up"}
          </WaxSealButton>

          {error ? (
            <div className="rounded-xl border border-red-900/20 bg-red-700/10 px-3 py-2 text-sm text-red-900">
              {error}
            </div>
          ) : null}

          <div className="text-sm text-slate-700">
            Already have an account?{" "}
            <Link
              className="font-medium text-slate-900 underline hover:no-underline"
              to="/login"
            >
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
