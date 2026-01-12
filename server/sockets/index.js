const storySocket = require("./story.socket");

module.exports = function attachSockets(io) {
  io.on("connection", (socket) => {
    storySocket(io, socket);
  });
};
