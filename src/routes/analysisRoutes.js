import express from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";

import {
  getTodayAnalysis,
  analyzeDay,
  getAnalysisHistory,
  getCategoryTrends,
  getTodayRoutineRecord,
  getRoutineHistory,
  getTodayMindset,
  getTodaySuggestions,
} from "../services/analysisService.js";
import { getAiAnalysis, getAiCategory, getAiChatResponse } from "../services/aiService.js";
import { getTodayEvents } from "../services/eventService.js";
import { formatTimeInZone, resolveTimeZone } from "../utils/timezone.js";

const router = express.Router();


router.get("/today", requireAuth, async (req, res) => {
  try {
    const timeZone = resolveTimeZone(typeof req.query.timeZone === "string" ? req.query.timeZone : undefined);
    const analysis = await getTodayAnalysis(req.userId, timeZone);
    res.json(analysis);
  } catch (error) {
    console.error("Get analysis error:", error);
    res.status(500).json({ error: "Failed to get analysis" });
  }
});

router.post("/refresh", requireAuth, async (req, res) => {
  try {
    const timeZone = resolveTimeZone(typeof req.query.timeZone === "string" ? req.query.timeZone : undefined);
    const analysis = await analyzeDay(req.userId, new Date(), timeZone);
    res.json(analysis);
  } catch (error) {
    console.error("Refresh analysis error:", error);
    res.status(500).json({ error: "Failed to refresh analysis" });
  }
});

router.get("/full-analysis", requireAuth, async (req, res) => {
  try {
    const timeZone = resolveTimeZone(typeof req.query.timeZone === "string" ? req.query.timeZone : undefined);
    const analysis = await getTodayAnalysis(req.userId, timeZone);
    const routineRecord = await getTodayRoutineRecord(req.userId);
    res.json({ analysis, routineRecord });
  } catch (error) {
    console.error("Full analysis error:", error);
    res.status(500).json({ error: "Failed to get full analysis" });
  }
});

router.post("/full-analysis/refresh", requireAuth, async (req, res) => {
  try {
    const timeZone = resolveTimeZone(typeof req.query.timeZone === "string" ? req.query.timeZone : undefined);
    const analysis = await analyzeDay(req.userId, new Date(), timeZone);
    const routineRecord = await getTodayRoutineRecord(req.userId);
    res.json({ analysis, routineRecord });
  } catch (error) {
    console.error("Refresh full analysis error:", error);
    res.status(500).json({ error: "Failed to refresh analysis" });
  }
});

// After
router.post("/ai-analyze", requireAuth, async (req, res) => {
  try {
    const timeZone = resolveTimeZone(typeof req.query.timeZone === "string" ? req.query.timeZone : undefined);
    const events = await getTodayEvents(req.userId, timeZone);
    const result = await getAiAnalysis(events);
    res.json(result);
  } catch (error) {
    console.error("AI analyze error:", error);
    res.status(500).json({ error: "AI analysis failed. Please try again." });
  }
});


router.post("/categorize-single", requireAuth, async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: "label is required" });
    if (typeof label !== "string" || label.trim().length > 500) {
      return res.status(400).json({ error: "label must be a string under 500 characters" });
    }
    const result = await getAiCategory(label);
    res.json(result);
  } catch (error) {
    console.error("Categorize error:", error);
    res.status(500).json({ error: "Categorization failed" });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const history = await getAnalysisHistory(req.userId, days);
    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to get history" });
  }
});

router.get("/trends", requireAuth, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const trends = await getCategoryTrends(req.userId, days);
    res.json(trends);
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({ error: "Failed to get trends" });
  }
});

router.get("/mindset", requireAuth, async (req, res) => {
  try {
    const mindset = await getTodayMindset(req.userId);
    res.json(mindset);
  } catch (error) {
    console.error("Mindset error:", error);
    res.status(500).json({ error: "Failed to get mindset analysis" });
  }
});

router.get("/suggestions", requireAuth, async (req, res) => {
  try {
    const suggestions = await getTodaySuggestions(req.userId);
    res.json(suggestions);
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

router.get("/routine/today", requireAuth, async (req, res) => {
  try {
    const record = await getTodayRoutineRecord(req.userId);
    if (!record) {
      // Trigger a full analysis which will create the routine record
      await analyzeDay(req.userId, new Date());
      const newRecord = await getTodayRoutineRecord(req.userId);
      return res.json(newRecord || { message: "No routine data yet — log more events." });
    }
    res.json(record);
  } catch (error) {
    console.error("Routine today error:", error);
    res.status(500).json({ error: "Failed to get routine record" });
  }
});

router.get("/routine/history", requireAuth, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const history = await getRoutineHistory(req.userId, days);
    res.json(history);
  } catch (error) {
    console.error("Routine history error:", error);
    res.status(500).json({ error: "Failed to get routine history" });
  }
});

router.get("/profile-stats", requireAuth, async (req, res) => {
  try {
    const [history, trends, routineHistory] = await Promise.all([
      getAnalysisHistory(req.userId, 30),
      getCategoryTrends(req.userId, 30),
      getRoutineHistory(req.userId, 30),
    ]);

    // Productivity score stats
    const scores = history.map(h => h.productivityScore || 0).filter(s => s > 0);
    const avgScore    = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore   = scores.length ? Math.max(...scores) : 0;
    const totalEvents = history.reduce((s, h) => s + (h.totalEvents || 0), 0);
    const activeDays  = history.filter(h => (h.totalEvents || 0) > 0).length;

    // Routine score stats
    const rScores = routineHistory.map(r => r.routineScore || 0).filter(s => s > 0);
    const avgRoutineScore = rScores.length ? Math.round(rScores.reduce((a, b) => a + b, 0) / rScores.length) : 0;

    // Mindset frequency
    const mindsetCounts = {};
    for (const r of routineHistory) {
      const state = r.mindset?.state;
      if (state && state !== "unknown") mindsetCounts[state] = (mindsetCounts[state] || 0) + 1;
    }
    const dominantMindset = Object.entries(mindsetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

    // Score trend (last 7 vs previous 7)
    const recent7  = scores.slice(0, 7);
    const prev7    = scores.slice(7, 14);
    const recentAvg = recent7.length ? recent7.reduce((a, b) => a + b, 0) / recent7.length : 0;
    const prevAvg   = prev7.length   ? prev7.reduce((a, b) => a + b, 0)   / prev7.length   : 0;
    const scoreTrend = recentAvg > prevAvg + 3 ? "improving" : recentAvg < prevAvg - 3 ? "declining" : "stable";

    // Balance averages from routine records
    const balanceFields = ["physical", "mental", "social", "recovery"];
    const balanceAvg = {};
    for (const field of balanceFields) {
      const vals = routineHistory.map(r => r.balanceBreakdown?.[field] || 0).filter(v => v > 0);
      balanceAvg[field] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }

    // Daily score history for chart (last 14 days, oldest first)
    const scoreHistory = [...history].reverse().slice(-14).map(h => ({
      date: h.date,
      score: h.productivityScore || 0,
      routineScore: 0,
    }));
    // Merge routine scores
    for (const rh of routineHistory) {
      const entry = scoreHistory.find(s => new Date(s.date).toDateString() === new Date(rh.date).toDateString());
      if (entry) entry.routineScore = rh.routineScore || 0;
    }

    res.json({
      avgScore,
      bestScore,
      totalEvents,
      activeDays,
      avgRoutineScore,
      dominantMindset,
      scoreTrend,
      topCategories: trends.slice(0, 5),
      balanceAvg,
      scoreHistory,
      mindsetCounts,
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    res.status(500).json({ error: "Failed to get profile stats" });
  }
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each user to 15 chat messages per 15 minutes
  keyGenerator: (req) => req.userId?.toString() || req.ip,
  message: { error: "You've reached the message limit for the AI Coach. Please take a short break and try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** POST AI productivity chat response */
router.post("/chat", requireAuth, chatLimiter, async (req, res) => {
  try {
    const { message, timeZone: clientTimeZone } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message string is required" });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: "Message is too long. Please keep your question under 500 characters." });
    }

    const timeZone = resolveTimeZone(
      typeof clientTimeZone === "string" ? clientTimeZone : undefined
    );

    const events = await getTodayEvents(req.userId, timeZone);
    const analysis = await getTodayAnalysis(req.userId);
    const routineRecord = await getTodayRoutineRecord(req.userId);

    const mappedEvents = events.map((e) => ({
      time: formatTimeInZone(e.timestamp, timeZone),
      timestamp: e.timestamp,
      category: e.category,
      label: e.label,
    }));

    const analysisContext = analysis ? {
      score: analysis.productivityScore,
      mindset: analysis.mindset,
    } : null;

    const response = await getAiChatResponse(
      message,
      mappedEvents,
      analysisContext,
      routineRecord,
      timeZone
    );
    res.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);
    // Graceful fallback response
    res.status(200).json({ response: "Sorry, I had trouble processing that request. Please try again in a moment." });
  }
});

export default router;
