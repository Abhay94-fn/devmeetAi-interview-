import "dotenv/config";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

// Uncaught exception tracking for process resilience (ERROR 1)
process.on("uncaughtException", (err) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("FATAL UNHANDLED REJECTION AT:", promise, "REASON:", reason);
});

// Startup environment validation (ERROR 12)
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.warn(`⚠️  Missing env vars: ${missing.join(", ")}`);
  console.warn("Auth will not work without JWT_SECRET");
}

import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import interviewerRoutes from "./routes/interviewerRoutes.js";
import registerSocketHandlers from "./socket/index.js";

import fs from "fs";

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: (origin, cb) => cb(null, true), methods: ["GET", "POST"], credentials: true }
});

app.use(helmet({ contentSecurityPolicy: false }));

// Fail-safe CORS and preflight handling for production cross-domain clients
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.get("/", (req, res) => res.json({ message: "🚀 DevMeet Backend API & Socket.IO Server is Live!" }));

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/interviewer", interviewerRoutes);

registerSocketHandlers(io);

/* ---------- Serve static assets in production if frontend build exists ---------- */
if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(process.cwd(), "../frontend/dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`✅ DevMeet backend running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
    process.exit(1);
  }
}

start();
export { app, io };
