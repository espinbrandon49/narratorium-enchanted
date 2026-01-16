require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");

const sequelize = require("./config/connection");
const { app, store, sessionMiddleware } = require("./app");
const attachSockets = require("./sockets");

// Canonical model initialization (associations + definitions)
require("./models");

const PORT = Number(process.env.PORT || 3001);

async function boot() {
  try {
    // Verify DB connection
    await sequelize.authenticate();

    // Sync application tables
    await sequelize.sync();

    // Sync session store table
    await store.sync();

    // Create HTTP server
    const httpServer = createServer(app);

    // Attach Socket.IO
    const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

    const io = new Server(httpServer, {
      cors: {
        origin: CLIENT_ORIGIN,
        credentials: true,
      },
    });

    // ✅ Bridge Express sessions into Socket.IO
    // This makes socket.request.session available.
    io.engine.use(sessionMiddleware);
    io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

    // Register socket handlers
    attachSockets(io);

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

boot();
