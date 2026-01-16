import { useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { getSocket } from "../realtime/socket";
import { storyConnect, storyJoin, storyResync, storyPatch } from "../realtime/story";

function reducer(state, action) {
    switch (action.type) {
        case "RESET":
            return { storyId: action.payload.storyId, tokens: action.payload.tokens };
        case "APPLY_PATCH": {
            const patch = action.payload;
            if (patch.type !== "insert") return state;

            // naive patch apply: insert by position
            const tokens = [...state.tokens];
            const insertIdx = Math.max(0, patch.from - 1);
            const inserted = patch.tokens.map((t) => ({
                id: `local-${t.position}-${t.value}`,
                value: t.value,
                position: t.position,
            }));

            // shift existing positions >= from by inserted count (client-side mirror)
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].position >= patch.from) tokens[i] = { ...tokens[i], position: tokens[i].position + inserted.length };
            }

            tokens.splice(insertIdx, 0, ...inserted);

            // keep ordered by position
            tokens.sort((a, b) => a.position - b.position);

            return { ...state, tokens };
        }
        default:
            return state;
    }
}

export function useStory() {
    const [state, dispatch] = useReducer(reducer, { storyId: null, tokens: [] });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(false);

    const socket = useMemo(() => getSocket(), []);

    const retry = useCallback(() => {
        setError("");
        setLoading(true);
        try {
            storyConnect();
            storyJoin();
            storyResync();
        } catch (e) {
            setError("Socket connect failed.");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // connect + wire listeners once
        storyConnect();

        const onConnect = () => {
            setConnected(true);
            setError("");
            storyJoin();
            storyResync();
        };

        const onDisconnect = () => setConnected(false);

        const onResync = (snapshot) => {
            dispatch({ type: "RESET", payload: snapshot });
            setLoading(false);
        };

        const onPatch = (patch) => {
            dispatch({ type: "APPLY_PATCH", payload: patch });
        };

        const onStoryError = (payload) => {
            setError(payload?.message || "Story error.");
            setLoading(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("story:resync", onResync);
        socket.on("story:patch", onPatch);
        socket.on("story:error", onStoryError);

        // if already connected (hot reload)
        if (socket.connected) onConnect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("story:resync", onResync);
            socket.off("story:patch", onPatch);
            socket.off("story:error", onStoryError);
        };
    }, [socket]);

    const submit = useCallback(async ({ submit_event }) => {
        setError("");
        const insertPosition = (state.tokens?.length || 0) + 1;
        storyPatch({ submit_event, insertPosition });
    }, [state.tokens]);

    return {
        storyId: state.storyId,
        tokens: state.tokens,
        loading,
        error,
        connected,
        retry,
        submit,
    };
}
