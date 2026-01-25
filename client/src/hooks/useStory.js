import { useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { getSocket } from "../realtime/socket";
import { storyConnect, storyJoin, storyResync, storyPatch } from "../realtime/story";

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return {
        storyId: action.payload.storyId,
        tokens: action.payload.tokens,
      };

    case "APPLY_PATCH": {
      const patch = action.payload;
      if (patch.type !== "insert") return state;

      let tokens = [...state.tokens];

      const insertIdx = Math.max(0, patch.from - 1);

      const inserted = patch.tokens.map((t) => ({
        id: `local-${t.position}-${t.value}`,
        value: t.value,
        position: t.position,
      }));

      // mirror server shift (legacy-safe; in Phase 8 append-only this won't move anything)
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].position >= patch.from) {
          tokens[i] = {
            ...tokens[i],
            position: tokens[i].position + inserted.length,
          };
        }
      }

      tokens.splice(insertIdx, 0, ...inserted);
      tokens.sort((a, b) => a.position - b.position);

      // ✅ Server-owned living window boundary: obey it (no client policy)
      if (Number.isInteger(patch.windowStartPosition) && patch.windowStartPosition > 1) {
        tokens = tokens.filter((t) => t.position >= patch.windowStartPosition);
      }

      return { ...state, tokens };
    }

    default:
      return state;
  }
}

export function useStory() {
  const [state, dispatch] = useReducer(reducer, {
    storyId: null,
    tokens: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Opening world-state (server-owned)
  const [opening, setOpening] = useState(null);
  const [openingMessage, setOpeningMessage] = useState("");

  const socket = useMemo(() => getSocket(), []);

  const retry = useCallback(() => {
    setError("");
    setLoading(true);
    storyConnect();
    storyJoin();
    storyResync();
  }, []);

  useEffect(() => {
    storyConnect();

    const onConnect = () => {
      setError("");
      storyJoin();
      storyResync();
    };

    const onDisconnect = () => {
      // no-op; UI can show disconnected status if desired
    };

    const onResync = (snapshot) => {
      dispatch({ type: "RESET", payload: snapshot });

      // Opening may be embedded in resync payload
      if (snapshot?.opening) {
        setOpening(snapshot.opening);
        if (snapshot.opening?.isOpen) setOpeningMessage("");
      }

      setLoading(false);
    };

    const onPatch = (patch) => {
      dispatch({ type: "APPLY_PATCH", payload: patch });
    };

    const onStoryState = (payload) => {
      // Initial join state
      if (payload?.opening) {
        setOpening(payload.opening);
        if (payload.opening?.isOpen) setOpeningMessage("");
      }
    };

    // ✅ Live boundary flip (no refresh)
    const onOpening = (payload) => {
      const next = payload?.opening || payload;
      if (!next) return;

      setOpening(next);
      if (next?.isOpen) setOpeningMessage("");
    };

    const onStoryError = (payload) => {
      // Semantic handling for Opening
      if (payload?.code === "OPENING_CLOSED") {
        setOpeningMessage(payload.message || "The story is resting.");

        if (payload.details) {
          setOpening(payload.details);
        }

        // converge back to server truth
        storyResync();
        return;
      }

      // generic error path
      setError(payload?.message || "Story error.");
      setLoading(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("story:state", onStoryState);
    socket.on("story:opening", onOpening);
    socket.on("story:resync", onResync);
    socket.on("story:patch", onPatch);
    socket.on("story:error", onStoryError);

    // hot reload safety
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("story:state", onStoryState);
      socket.off("story:opening", onOpening);
      socket.off("story:resync", onResync);
      socket.off("story:patch", onPatch);
      socket.off("story:error", onStoryError);
    };
  }, [socket]);

  const submit = useCallback(async ({ submit_event }) => {
    setError("");
    setOpeningMessage("");

    // Phase 8+: client sends intent only; server decides ordering + window boundary
    storyPatch({ submit_event });
  }, []);

  return {
    storyId: state.storyId,
    tokens: state.tokens,

    loading,
    error,
    retry,

    opening,
    openingMessage,

    submit,
  };
}
