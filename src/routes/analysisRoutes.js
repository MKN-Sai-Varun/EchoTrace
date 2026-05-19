import express from "express";
import Session from "../models/Session.js";
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
import { getAiAnalysis, getAiCategory } from "../services/aiService.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Auth middleware
// ─────────────────────────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) return res.status(401).json({ error: "Please log in to continue" });

    const sessionId = cookie
      .split("; ")
      .find(row => row.startsWith("sessionId="))
      ?.split("=")[1];

    if (!sessionId) return res.status(401).json({ error: "Please log in to continue" });

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(401).json({ error: "Session expired" });

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Analysis endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** GET today's full analysis (AI + keyword fallback) */
router.get("/today", requireAuth, async (req, res) => {
  try {
    const analysis = await getTodayAnalysis(req.userId);
    res.json(analysis);
  } catch (error) {
    console.error("Get analysis error:", error);
    res.status(500).json({ error: "Failed to get analysis" });
  }
});

/** POST force-regenerate today's analysis */
router.post("/refresh", requireAuth, async (req, res) => {
  try {
    const analysis = await analyzeDay(req.userId, new Date());
    res.json(analysis);
  } catch (error) {
    console.error("Refresh analysis error:", error);
    res.status(500).json({ error: "Failed to refresh analysis" });
  }
});

/** POST AI full-day analysis (accepts events array from frontend) */
router.post("/ai-analyze", requireAuth, async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: "events array is required" });
    }
    const result = await getAiAnalysis(events);
    res.json(result);
  } catch (error) {
    console.error("AI analyze error:", error);
    res.status(500).json({ error: "AI analysis failed: " + error.message });
  }
});

/** POST categorize a single event label */
router.post("/categorize-single", requireAuth, async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: "label is required" });
    const result = await getAiCategory(label);
    res.json(result);
  } catch (error) {
    console.error("Categorize error:", error);
    res.status(500).json({ error: "Categorization failed" });
  }
});

/** GET analysis history */
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

/** GET category trends */
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

// ─────────────────────────────────────────────────────────────────────────────
// Mindset endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** GET today's mindset inference */
router.get("/mindset", requireAuth, async (req, res) => {
  try {
    const mindset = await getTodayMindset(req.userId);
    res.json(mindset);
  } catch (error) {
    console.error("Mindset error:", error);
    res.status(500).json({ error: "Failed to get mindset analysis" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Personalized suggestions endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** GET personalized suggestions for today */
router.get("/suggestions", requireAuth, async (req, res) => {
  try {
    const suggestions = await getTodaySuggestions(req.userId);
    res.json(suggestions);
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Routine record endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** GET today's AI-scored routine record */
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

/** GET routine history for N days */
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

// ─────────────────────────────────────────────────────────────────────────────
// Profile stats endpoint — aggregates everything for the profile page
// ─────────────────────────────────────────────────────────────────────────────

/** GET aggregated profile stats (30-day window) */
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

export default router;
