import express from "express";
import { body, validationResult } from "express-validator";
import Session from "../models/Session.js";
import Event from "../models/Event.js";
import { createEvent, getTodayEvents } from "../services/eventService.js";

const router = express.Router();

/* Auth middleware */
async function getUserFromRequest(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const sessionId = cookie.split("; ").find(r => r.startsWith("sessionId="))?.split("=")[1];
  if (!sessionId) return null;
  const session = await Session.findOne({ sessionId });
  return session?.userId || null;
}

async function requireAuth(req, res, next) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return res.status(401).json({ error: "Please log in to continue" });
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

const eventValidation = [
  body("label").trim().notEmpty().withMessage("Event label is required")
    .isLength({ max: 500 }).withMessage("Event label must be less than 500 characters")
];

/* POST — create event */
router.post("/", requireAuth, eventValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const event = await createEvent(req.userId, {
      label: req.body.label.trim(),
      category: req.body.category?.trim()
    });
    res.json({ message: "Event logged successfully", event });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ error: "Failed to log event" });
  }
});

/* GET — today's events */
router.get("/today", requireAuth, async (req, res) => {
  try {
    const events = await getTodayEvents(req.userId);
    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to load events" });
  }
});

/* DELETE — remove a single event (must belong to the authenticated user) */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId   // ensures users can only delete their own events
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;

