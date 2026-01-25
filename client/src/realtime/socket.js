import { io } from "socket.io-client";

let _socket = null;

export function getSocket() {
  if (_socket) return _socket;

  const url = import.meta.env.VITE_SOCKET_URL || undefined;

  _socket = io(url, {
    withCredentials: true, // bring session cookie into socket handshake
    autoConnect: false, // control connect timing
  });

  return _socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (_socket) _socket.disconnect();
}

// ✅ Hard reset: guarantees a fresh handshake next time
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

export function reconnectSocket() {
  resetSocket();
  return connectSocket();
}
