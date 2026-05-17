import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "PORT"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for simplicity
}));

// CORS middleware
app.use(cors({
  origin: "http://localhost:3001", // Next.js dev server port
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later" }
});
app.use(limiter);

// Auth-specific rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes
  message: { error: "Too many login attempts, please try again later" }
});

app.use(express.json());
app.use(express.static("public"));

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`EchoTrace running on port ${process.env.PORT}`);
});
