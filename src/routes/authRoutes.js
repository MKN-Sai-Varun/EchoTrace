import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";

const router = express.Router();

/* REGISTER */
/* REGISTER */
router.post("/register", async (req, res) => {
  console.log("Registering user:", req.body.username);
  const hash = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    username: req.body.username,
    passwordHash: hash
  });

  const sessionId = crypto.randomUUID();
  await Session.create({ sessionId, userId: user._id });

  res.setHeader(
    "Set-Cookie",
    `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
  );

  res.json({ message: "Registered" });
});

/* LOGIN */
router.post("/login", async (req, res) => {
  console.log("Logging in user:", req.body.username);
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const sessionId = crypto.randomUUID();
  await Session.create({ sessionId, userId: user._id });

  res.setHeader(
    "Set-Cookie",
    `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
  );

  res.json({ message: "Logged in" });
});

/* LOGOUT */    
router.post("/logout", async (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.json({ message: "Logged out" });

  const sessionId = cookie.split("=")[1];
  await Session.deleteOne({ sessionId });

  res.setHeader(
    "Set-Cookie",
    "sessionId=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );

  res.json({ message: "Logged out" });
});

export default router;
