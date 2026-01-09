import express from "express";
import Session from "../models/Session.js";
import { createEvent, getTodayEvents } from "../services/eventService.js";

const router = express.Router();

/* Manual auth check */
async function getUserFromRequest(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  // Better cookie parsing
  const sessionId = cookie
    .split('; ')
    .find(row => row.startsWith('sessionId='))
    ?.split('=')[1];
    
  if (!sessionId) return null;

  const session = await Session.findOne({ sessionId });
  return session?.userId || null;
}

router.post("/", async (req, res) => {
  const userId = await getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const event = await createEvent(userId, req.body);
  res.json(event);
});

router.get("/today", async (req, res) => {
  const userId = await getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const events = await getTodayEvents(userId);
  res.json(events);
});

export default router;
