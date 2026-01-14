import express from "express";
import Session from "../models/Session.js";
import { 
  getTodayAnalysis, 
  analyzeDay, 
  getAnalysisHistory,
  getCategoryTrends 
} from "../services/analysisService.js";

const router = express.Router();

/* Auth middleware */
async function requireAuth(req, res, next) {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      return res.status(401).json({ error: "Please log in to continue" });
    }

    const sessionId = cookie
      .split("; ")
      .find((row) => row.startsWith("sessionId="))
      ?.split("=")[1];

    if (!sessionId) {
      return res.status(401).json({ error: "Please log in to continue" });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(401).json({ error: "Session expired" });
    }

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

/* GET today's analysis */
router.get("/today", requireAuth, async (req, res) => {
  try {
    const analysis = await getTodayAnalysis(req.userId);
    res.json(analysis);
  } catch (error) {
    console.error("Get analysis error:", error);
    res.status(500).json({ error: "Failed to get analysis" });
  }
});

/* POST regenerate analysis (force refresh) */
router.post("/refresh", requireAuth, async (req, res) => {
  try {
    const analysis = await analyzeDay(req.userId, new Date());
    res.json(analysis);
  } catch (error) {
    console.error("Refresh analysis error:", error);
    res.status(500).json({ error: "Failed to refresh analysis" });
  }
});

/* GET analysis history */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = await getAnalysisHistory(req.userId, Math.min(days, 30));
    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to get history" });
  }
});

/* GET category trends */
router.get("/trends", requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trends = await getCategoryTrends(req.userId, Math.min(days, 30));
    res.json(trends);
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({ error: "Failed to get trends" });
  }
});

export default router;
