import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import * as auth from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // {id,...} or null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Silent session check: do not surface errors if user is simply logged out
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await auth.me();
            if (res.ok) setUser(res.data);
            else setUser(null);
        } catch (e) {
            setUser(null);
            // intentionally silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const doLogin = useCallback(
        async (payload) => {
            setError("");
            const res = await auth.login(payload);
            if (!res.ok) throw new Error(res?.error?.code || "LOGIN_FAILED");
            await refresh();
            return res;
        },
        [refresh]
    );

    const doSignup = useCallback(
        async (payload) => {
            setError("");
            const res = await auth.signup(payload);
            if (!res.ok) throw new Error(res?.error?.code || "SIGNUP_FAILED");
            await refresh();
            return res;
        },
        [refresh]
    );

    const doLogout = useCallback(async () => {
        setError("");
        await auth.logout();
        await refresh();
    }, [refresh]);

    const value = useMemo(
        () => ({
            user,
            isAuthed: !!user?.id,
            loading,
            error,
            refresh,
            doLogin,
            doSignup,
            doLogout,
        }),
        [user, loading, error, refresh, doLogin, doSignup, doLogout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
    return ctx;
}
