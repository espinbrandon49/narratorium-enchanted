import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AppShell({ children }) {
    const nav = useNavigate();
    const { isAuthed, user, loading, doLogout } = useAuth();

    async function onLogout() {
        await doLogout();
        nav("/");
    }

    return (
        <div className="container">
            <header className="header">
                <div className="brand">
                    <div className="title">Narratorium</div>
                    <div className="subtitle">“This is an Etch-A-Sketch that never shakes back to its original state.”</div>
                </div>

                <nav className="nav">
                    <Link to="/">Story</Link>
                    {!loading && !isAuthed && (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                    {!loading && isAuthed && (
                        <>
                            <span className="muted">User #{user.id}</span>
                            <button className="btn secondary" onClick={onLogout}>Logout</button>
                        </>
                    )}
                </nav>
            </header>

            <main>{children}</main>
        </div>
    );
}
