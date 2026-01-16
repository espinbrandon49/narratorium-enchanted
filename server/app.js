require("dotenv").config();
const cors = require("cors");

const path = require("path");
const express = require("express");
const session = require("express-session");

const apiRoutes = require("./routes");
const createSessionStore = require("./config/sessionStore");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Proxy (Heroku/Render/etc.), cookies need this
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static public assets (favicon, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Sessions
const store = createSessionStore();

const sessionMiddleware = session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7),
  },
});

app.use(sessionMiddleware);

// API
app.use("/api", apiRoutes);

// 404 + error handler (single)
app.use(notFound);
app.use(errorHandler);

module.exports = { app, store, sessionMiddleware };
