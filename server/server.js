// server/server.js
require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");

const sequelize = require("./config/connection");
const { app, store } = require("./app");
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
    const io = new Server(httpServer);

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
