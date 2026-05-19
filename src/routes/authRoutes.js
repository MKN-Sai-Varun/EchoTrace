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
    .withMessage("Password must be at least 6 characters"),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("firstName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters")
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

    const { username, password, email, firstName, lastName } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    console.log("Registering user:", username);
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash: hash,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined
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

    // Allow login with either username or email
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username.toLowerCase() }
      ]
    });
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

/* GET CURRENT USER */
router.get("/me", async (req, res) => {
  try {
    const sessionId = getSessionIdFromCookie(req.headers.cookie);
    if (!sessionId) return res.status(401).json({ error: "Not authenticated" });

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(401).json({ error: "Session expired" });

    const user = await User.findById(session.userId)
      .select("username email firstName lastName theme createdAt");
    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({
      username:  user.username,
      email:     user.email    || null,
      firstName: user.firstName || null,
      lastName:  user.lastName  || null,
      theme:     user.theme    || "midnight",
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

/* UPDATE USER PREFERENCES */
router.patch("/preferences", async (req, res) => {
  try {
    const sessionId = getSessionIdFromCookie(req.headers.cookie);
    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(401).json({ error: "Session expired" });
    }

    const { theme } = req.body;
    const validThemes = ["midnight", "ocean", "forest", "sunset", "lavender"];
    
    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({ error: "Invalid theme" });
    }

    const user = await User.findByIdAndUpdate(
      session.userId,
      { theme },
      { new: true }
    ).select("username theme");

    res.json({
      message: "Preferences updated",
      theme: user.theme
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
