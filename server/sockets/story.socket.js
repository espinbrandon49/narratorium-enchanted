const requireSocketAuth = require("./socketAuth");
const storyService = require("../services/story.service");

function emitStoryError(socket, err) {
  const code = err?.code || (err?.message === "UNAUTHORIZED" ? "UNAUTHORIZED" : "SOCKET_ERROR");
  const message =
    err?.message === "UNAUTHORIZED"
      ? "You must be logged in to write."
      : err?.message || "Socket request failed";

  socket.emit("story:error", { code, message });
}

module.exports = function storySocket(io, socket) {
  // Public-read
  socket.on("story:join", async () => {
    try {
      const storyId = await storyService.getDefaultStoryId();
      socket.join(`story:${storyId}`);
    } catch (err) {
      emitStoryError(socket, err);
    }
  });

  // Public-read
  socket.on("story:resync", async () => {
    try {
      const storyId = await storyService.getDefaultStoryId();
      const snapshot = await storyService.getStoryWindow({ storyId });
      socket.emit("story:resync", snapshot);
    } catch (err) {
      emitStoryError(socket, err);
    }
  });

  // Write path (auth required)
  socket.on("story:patch", async ({ submit_event, insertPosition } = {}) => {
    try {
      const userId = requireSocketAuth(socket);
      const storyId = await storyService.getDefaultStoryId();

      const patch = await storyService.submitToStory({
        storyId,
        userId,
        text: submit_event,
        insertPosition,
      });

      socket.emit("story:patch", patch);
      socket.to(`story:${storyId}`).emit("story:patch", patch);
    } catch (err) {
      emitStoryError(socket, err);
    }
  });
};
