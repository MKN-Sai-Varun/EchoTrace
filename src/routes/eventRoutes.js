import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/requireAuth.js";
import Event from "../models/Event.js";
import { createEvent, getTodayEvents } from "../services/eventService.js";

const router = express.Router();


const eventValidation = [
  body("label").trim().notEmpty().withMessage("Event label is required")
    .isLength({ max: 500 }).withMessage("Event label must be less than 500 characters")
];

router.post("/", requireAuth, eventValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const VALID_CATEGORIES = ["Work", "Health", "Social", "Learning", "Food", "Entertainment", "Personal", "Recovery", "Creative", "Uncategorized"];
    const rawCategory = req.body.category?.trim();
    const category = VALID_CATEGORIES.includes(rawCategory) ? rawCategory : undefined;

    const event = await createEvent(req.userId, {
    label: req.body.label.trim(),
    category
  });

    res.json({ message: "Event logged successfully", event });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ error: "Failed to log event" });
  }
});

router.get("/today", requireAuth, async (req, res) => {
  try {
    const timeZone = typeof req.query.timeZone === "string" ? req.query.timeZone : undefined;
    const events = await getTodayEvents(req.userId, timeZone);
    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to load events" });
  }
});

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

