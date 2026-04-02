import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

import authRoute from "./routes/auth.js";
import facilityRoute from "./routes/facilities.js";
import userRoute from "./routes/users.js";
import roomRoute from "./routes/rooms.js";
import bookingRoute from "./routes/booking.js";
import { errorHandler } from "./utils/error.js";

dotenv.config();

const app = express();

// ─── Trust Proxy ────────────────────────────────────────────────────────────
// Required for express-rate-limit to correctly identify client IPs
// when running behind a reverse proxy (Nginx, Heroku, Railway, etc.)
app.set("trust proxy", 1);

// ─── Database Connection ─────────────────────────────────────────────────────
const MONGO_RETRY_DELAY_MS = 5000;
const MAX_MONGO_RETRIES = 5;

const connectDB = async (retries = MAX_MONGO_RETRIES) => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false, // disable in production
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    if (retries > 0) {
      console.error(
        `MongoDB connection failed: ${error.message}. Retrying in ${MONGO_RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`
      );
      await new Promise((res) => setTimeout(res, MONGO_RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    console.error("MongoDB connection failed after all retries. Exiting.");
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

// ─── CORS — must be first ─────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CLIENT_URL?.split(",").map((url) => url.trim()) || []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Security Middlewares ─────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// Applied BEFORE body parsing so oversized/malicious bodies are rejected early
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // disable the `X-RateLimit-*` headers
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use(limiter);

// ─── General Middlewares ──────────────────────────────────────────────────────
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// HTTP request logging (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).send("API is running");
});

// Health check endpoint — used by load balancers, uptime monitors, Docker, etc.
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1; // 1 = connected
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    db: mongoose.STATES[dbState],
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.get("/debug", (req, res) => {
  res.json({
    CLIENT_URL: process.env.CLIENT_URL,
    MONGO_URI: process.env.MONGO_URI ? "set" : "missing",
    NODE_ENV: process.env.NODE_ENV,
    allowedOrigins,
  });
});

app.use("/api/auth", authRoute);
app.use("/api/facilities", facilityRoute);
app.use("/api/users", userRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/bookings", bookingRoute);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
// Ensures DB connections are closed cleanly on process termination
// (important for zero-downtime deploys and avoiding connection leaks)
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
};

startServer();