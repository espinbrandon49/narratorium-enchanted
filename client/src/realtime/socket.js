import { io } from "socket.io-client";

let _socket = null;

export function getSocket() {
  if (_socket) return _socket;

  const url = import.meta.env.VITE_SOCKET_URL || undefined;

  _socket = io(url, {
    withCredentials: true, // bring session cookie into socket handshake
    autoConnect: false, // control connect timing
  });

  // Always re-join/read on (re)connect so room membership is restored
  _socket.on("connect", () => {
    try {
      _socket.emit("story:join");
      _socket.emit("story:resync");
    } catch (_) {
      // ignore
    }
  });

  return _socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  const s = getSocket();
  if (s.connected) s.disconnect();
  return s;
}

// ✅ Hard reset: only use this when you truly want to drop all listeners
export function resetSocket() {
  if (!_socket) return;

  try {
    _socket.removeAllListeners();
  } catch (_) {
    // ignore
  }

  _socket.disconnect();
  _socket = null;
}

// ✅ Soft reconnect: keeps the same socket instance so existing listeners survive
// This is what you want for logout/login cookie changes.
export function reconnectSocket() {
  const s = getSocket();
  if (s.connected) s.disconnect();
  s.connect();
  return s;
}
