// server/sockets/index.js
function attachSockets(io) {
    io.on("connection", (socket) => {
        // Phase 2: wiring only (no handlers yet)
        // Optional: console.log("socket connected:", socket.id);
    });
}

module.exports = attachSockets;
