require("dotenv").config();

const http = require("http");
const { app, sessionMiddleware } = require("./app");
const { Server } = require("socket.io");

const sequelize = require("./config/connection"); // ✅ ADD: ensures tables exist in fresh JawsDB
const attachSockets = require("./sockets");
const storyService = require("./services/story.service");
const { getOpeningState } = require("./utils/opening");

const PORT = process.env.PORT || 4000;

async function boot() {
  // ✅ CRITICAL: create tables in a fresh prod DB (JawsDB) before any queries run
  await sequelize.sync();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || true,
      credentials: true,
    },
  });

  // ✅ Critical: make Express sessions available on socket.request.session
  io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

  // Attach all socket namespaces / handlers
  attachSockets(io);

  /**
   * -------------------------------------------------------
   * The Opening — Boundary Broadcast (server-authoritative)
   * -------------------------------------------------------
   * Emits `story:opening`:
   * - once on boot
   * - at every open/close boundary
   *
   * No DB state.
   * No overrides.
   * Pure deterministic time math.
   */
  (async function startOpeningBroadcast() {
    try {
      const storyId = await storyService.getDefaultStoryId();
      const room = `story:${storyId}`;

      const scheduleNext = () => {
        const opening = getOpeningState();

        const nowMs = Date.now();
        const closesAtMs = Date.parse(opening.closesAt);
        const nextOpenAtMs = Date.parse(opening.nextOpenAt);

        // If currently open → next boundary is close
        // If closed → next boundary is open
        const nextBoundaryMs = opening.isOpen ? closesAtMs : nextOpenAtMs;

        // Guard against negative or zero delays
        const delayMs = Math.max(250, nextBoundaryMs - nowMs + 50);

        setTimeout(() => {
          const fresh = getOpeningState();
          io.to(room).emit("story:opening", { opening: fresh });
          scheduleNext();
        }, delayMs);
      };

      // emit once on boot
      io.to(room).emit("story:opening", { opening: getOpeningState() });

      // schedule boundary emissions
      scheduleNext();
    } catch (e) {
      // swallow—Opening broadcast should never crash boot
      console.error("Opening broadcast failed:", e);
    }
  })();

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

boot().catch((e) => {
  console.error("Fatal boot error:", e);
  process.exit(1);
});
