const requireSocketAuth = require("./socketAuth");
const storyService = require("../services/story.service");
const AppError = require("../utils/AppError");
const { getOpeningState } = require("../utils/opening");

function emitStoryError(socket, err) {
  const isUnauthorized = err?.message === "UNAUTHORIZED";

  const code = err?.code || (isUnauthorized ? "UNAUTHORIZED" : "SOCKET_ERROR");
  const message =
    err?.message === "UNAUTHORIZED"
      ? "You must be logged in to write."
      : err?.message || "Socket request failed";

  const details = err?.details;

  // Keep shape stable; add optional details for semantic errors.
  const payload = { code, message };
  if (details !== undefined) payload.details = details;

  socket.emit("story:error", payload);
}

module.exports = function storySocket(io, socket) {
  // Public-read
  socket.on("story:join", async () => {
    try {
      const storyId = await storyService.getDefaultStoryId();
      socket.join(`story:${storyId}`);

      // Lightweight state push (does not change story data payload shapes).
      socket.emit("story:state", {
        storyId,
        opening: getOpeningState(),
      });
    } catch (err) {
      emitStoryError(socket, err);
    }
  });

  // Public-read
  socket.on("story:resync", async () => {
    try {
      const storyId = await storyService.getDefaultStoryId();
      const snapshot = await storyService.getStoryWindow({ storyId });
      socket.emit("story:resync", {
        ...snapshot,
        opening: getOpeningState(),
      });
    } catch (err) {
      emitStoryError(socket, err);
    }
  });

  // Write path (auth required + Opening required)
  socket.on("story:patch", async ({ submit_event, insertPosition } = {}) => {
    try {
      const userId = requireSocketAuth(socket);

      const opening = getOpeningState();
      if (!opening.isOpen) {
        throw new AppError("OPENING_CLOSED", "The story is resting.", 403, opening);
      }

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
