import { connectSocket, getSocket } from "./socket";

export function storyConnect() {
  const socket = connectSocket();
  return socket;
}

export function storyJoin() {
  const socket = getSocket();
  socket.emit("story:join");
}

export function storyResync() {
  const socket = getSocket();
  socket.emit("story:resync");
}

// Phase 8+: server is authoritative on insertion position (append-only).
// Client sends intent only.
export function storyPatch({ submit_event }) {
  const socket = getSocket();
  socket.emit("story:patch", { submit_event });
}

// Optional helpers for clean hook usage
export function onStoryState(handler) {
  const socket = getSocket();
  socket.on("story:state", handler);
  return () => socket.off("story:state", handler);
}

export function onStoryResync(handler) {
  const socket = getSocket();
  socket.on("story:resync", handler);
  return () => socket.off("story:resync", handler);
}

export function onStoryPatch(handler) {
  const socket = getSocket();
  socket.on("story:patch", handler);
  return () => socket.off("story:patch", handler);
}

export function onStoryOpening(handler) {
  const socket = getSocket();
  // If you broadcast boundary flips, standardize on one event name.
  socket.on("story:opening", handler);
  return () => socket.off("story:opening", handler);
}

export function onStoryError(handler) {
  const socket = getSocket();
  socket.on("story:error", handler);
  return () => socket.off("story:error", handler);
}
