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

export function storyPatch({ submit_event, insertPosition }) {
    const socket = getSocket();
    socket.emit("story:patch", { submit_event, insertPosition });
}
