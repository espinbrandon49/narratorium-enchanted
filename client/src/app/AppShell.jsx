import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import WaxSealButton from "../components/WaxSealButton";

export default function AppShell({ children }) {
  const nav = useNavigate();
  const { isAuthed, user, doLogout } = useAuth();

  async function onLogout() {
    await doLogout();
    nav("/");
  }

  return (
    <div
      className="
        min-h-screen text-slate-900
        bg-[radial-gradient(1200px_700px_at_20%_10%,rgba(255,255,255,0.55),rgba(255,255,255,0)_60%),radial-gradient(900px_600px_at_80%_20%,rgba(255,255,255,0.35),rgba(255,255,255,0)_55%),linear-gradient(180deg,#f7f0df,#efe2c7_55%,#e8d7b7)]
      "
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-['Cinzel'] text-3xl tracking-wide">
              Narratorium
            </div>
            <div className="mt-1 max-w-xl text-sm italic text-slate-700">
              “Narratorium is a fire that never goes out — it changes only by what is added to it, and it burns most brightly in the moments we are present together.”
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              to="/"
              className="rounded-md px-2 py-1 text-slate-800 hover:bg-white/40 hover:underline"
            >
              Story
            </Link>

            {!isAuthed ? (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-2 py-1 text-slate-800 hover:bg-white/40 hover:underline"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md px-2 py-1 text-slate-800 hover:bg-white/40 hover:underline"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <span className="text-slate-700">
                  {user?.username ? user.username : `User #${user?.id ?? "?"}`}
                </span>

                {/* wax-seal button */}
                <WaxSealButton onClick={onLogout}>Logout</WaxSealButton>
              </>
            )}
          </nav>
        </header>

        <main
          className="
    relative
    rounded-2xl bg-white/70 p-5
    shadow-[0_20px_60px_rgba(15,23,42,0.25)]
    ring-1 ring-slate-900/10
    backdrop-blur-sm

    /* subtle parchment vignette */
    before:pointer-events-none
    before:absolute before:inset-0
    before:rounded-2xl
    before:bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(255,255,255,0.55),rgba(255,255,255,0)_60%),radial-gradient(900px_700px_at_50%_120%,rgba(0,0,0,0.06),rgba(0,0,0,0)_55%)]
    before:opacity-80
  "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
