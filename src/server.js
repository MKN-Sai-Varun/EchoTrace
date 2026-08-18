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

const requiredEnvVars = ["MONGO_URI", "PORT"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://api.groq.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const cleanOrigin = origin.replace(/\/$/, "");
    
    const isAllowed = 
      cleanOrigin === "http://localhost:3001" ||
      cleanOrigin === "http://localhost:3000" ||
      cleanOrigin === frontendUrl ||
      cleanOrigin.endsWith(".vercel.app");
      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" }
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many login attempts, please try again later" },
  skipSuccessfulRequests: true,
});

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`EchoTrace running on port ${process.env.PORT}`);
});
