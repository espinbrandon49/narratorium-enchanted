const requireSocketAuth = require("./socketAuth");
const storyService = require("../services/story.service");

module.exports = function storySocket(io, socket) {
  // Join a story room
  socket.on("story:join", async ({ storyId }) => {
    const userId = requireSocketAuth(socket);
    socket.join(`story:${storyId}`);
  });

  // Patch-first update
  socket.on("story:patch", async ({ storyId, text, insertPosition }) => {
    const userId = requireSocketAuth(socket);

    const patch = await storyService.submitToStory({
      storyId,
      userId,
      text,
      insertPosition,
    });

    // Broadcast patch to others
    socket.to(`story:${storyId}`).emit("story:patch", patch);
  });

  // Escape hatch
  socket.on("story:resync", async ({ storyId }) => {
    const userId = requireSocketAuth(socket);

    const snapshot = await storyService.getStoryWindow({ storyId });

    socket.emit("story:resync", snapshot);
  });
};
