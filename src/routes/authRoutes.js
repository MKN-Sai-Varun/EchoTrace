import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Session from "../models/Session.js";

const router = express.Router();

// Helper function to parse cookies consistently
function getSessionIdFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("sessionId="));
  return match?.split("=")[1] || null;
}

// Validation rules
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];

const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required")
];

/* REGISTER */
router.post("/register", registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    console.log("Registering user:", username);
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash: hash
    });

    const sessionId = crypto.randomUUID();
    await Session.create({ sessionId, userId: user._id });

    res.setHeader(
      "Set-Cookie",
      `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
    );

    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/* LOGIN */
router.post("/login", loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    console.log("Logging in user:", username);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const sessionId = crypto.randomUUID();
    await Session.create({ sessionId, userId: user._id });

    res.setHeader(
      "Set-Cookie",
      `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
    );

    res.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

/* LOGOUT */
router.post("/logout", async (req, res) => {
  try {
    const sessionId = getSessionIdFromCookie(req.headers.cookie);

    if (sessionId) {
      await Session.deleteOne({ sessionId });
    }

    res.setHeader(
      "Set-Cookie",
      "sessionId=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
    );

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
