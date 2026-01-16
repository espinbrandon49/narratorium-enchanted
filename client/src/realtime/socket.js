import { io } from "socket.io-client";

let _socket = null;

export function getSocket() {
    if (_socket) return _socket;

    const url = import.meta.env.VITE_SOCKET_URL || undefined;

    _socket = io(url, {
        withCredentials: true, // bring session cookie into socket handshake
        autoConnect: false,
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
