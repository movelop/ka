import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoute from "./routes/auth.js";
import facilityRoute from "./routes/facilities.js";
import userRoute from "./routes/users.js";
import roomRoute from "./routes/rooms.js";
import bookingRoute from "./routes/booking.js";
import { errorHandler } from "./utils/error.js";
import compression from "compression";

dotenv.config();

const app = express();

/**
 * DATABASE CONNECTION
 */
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false, // disable in production
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);


/**
 * MIDDLEWARES
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use(limiter)

app.use(compression())

/**
 * ROUTES
 */
app.get("/", (req, res) => {
  res.status(200).send("API is running");
});

app.use("/api/auth", authRoute);
app.use("/api/facilities", facilityRoute);
app.use("/api/users", userRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/bookings", bookingRoute);

/**
 * GLOBAL ERROR HANDLER (LAST)
 */
app.use(errorHandler);

/**
 * START SERVER
 */
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
