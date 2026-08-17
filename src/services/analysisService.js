import Event from "../models/Event.js";
import Analysis from "../models/Analysis.js";
import RoutineRecord from "../models/RoutineRecord.js";
import { formatTimeInZone, resolveTimeZone } from "../utils/timezone.js";
import {
  getAiAnalysis,
  getMindsetAnalysis,
  getPersonalizedSuggestions,
  scoreRoutine,
} from "./aiService.js";

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD FALLBACK — used when AI is unavailable
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  work:          ["meeting", "email", "call", "project", "task", "deadline", "report", "presentation", "client", "office", "code", "coding", "debug", "review", "deploy"],
  health:        ["exercise", "gym", "workout", "run", "walk", "yoga", "meditate", "meditation", "sleep", "nap", "doctor", "medicine", "vitamins", "stretch"],
  food:          ["breakfast", "lunch", "dinner", "snack", "coffee", "tea", "eat", "cook", "meal", "food", "drink", "water"],
  learning:      ["read", "study", "course", "tutorial", "learn", "practice", "book", "article", "podcast", "video", "research"],
  social:        ["friend", "family", "call", "chat", "meet", "party", "hangout", "date", "visit", "talk"],
  entertainment: ["movie", "show", "game", "gaming", "music", "youtube", "netflix", "scroll", "browse", "relax"],
  personal:      ["shower", "hygiene", "clean", "organize", "laundry", "errands", "shopping", "commute", "travel"],
  creative:      ["write", "draw", "design", "create", "build", "art", "photo", "video", "edit", "brainstorm"],
  recovery:      ["sleep", "nap", "rest", "recover", "relax", "break"],
};

const PRODUCTIVITY_WEIGHTS = {
  work:          1.0,
  learning:      0.9,
  health:        0.85,
  creative:      0.8,
  personal:      0.6,
  food:          0.5,
  social:        0.5,
  recovery:      0.45,
  entertainment: 0.3,
  uncategorized: 0.4,
};

function detectCategory(label) {
  const lower = label.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return "uncategorized";
}

function generateInsights(categories, totalEvents) {
  const insights = [];
  if (totalEvents === 0) {
    insights.push("No events logged today. Start tracking to get insights!");
    return insights;
  }
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  if (top) insights.push(`Your main focus today was "${top.category}" with ${top.count} activities (${top.percentage}%)`);
  const activeCats = categories.filter(c => c.count > 0).length;
  if (activeCats >= 4) insights.push("Great variety! You balanced multiple areas of your life today.");
  else if (activeCats <= 2 && totalEvents > 5) insights.push("Consider diversifying your activities for better work-life balance.");
  const health = categories.find(c => c.category === "health");
  if (health?.count >= 2) insights.push("Excellent focus on health and wellness today! 💪");
  else if (!health || health.count === 0) insights.push("No health activities logged. Consider adding exercise or meditation.");
  const work = categories.find(c => c.category === "work");
  if (work?.percentage > 60) insights.push("Heavy work day! Remember to take breaks and recharge.");
  const entertainment = categories.find(c => c.category === "entertainment");
  if (entertainment?.percentage > 40) insights.push("Lots of entertainment time today. Balance is key!");
  const learning = categories.find(c => c.category === "learning");
  if (learning?.count > 0) insights.push("Great job investing in learning! Knowledge compounds over time. 📚");
  return insights.slice(0, 5);
}

function generateRecommendations(categories, totalEvents) {
  const recs = [];
  if (totalEvents === 0) { recs.push("Start your day by logging your first activity!"); return recs; }
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10 && !categories.find(c => c.category === "health")?.count)
    recs.push("Morning is a great time for exercise or meditation!");
  if (hour >= 14 && hour < 16) recs.push("Afternoon slump? Try a short walk or stretch break.");
  const workCount = categories.find(c => c.category === "work")?.count || 0;
  const healthCount = categories.find(c => c.category === "health")?.count || 0;
  const learningCount = categories.find(c => c.category === "learning")?.count || 0;
  const socialCount = categories.find(c => c.category === "social")?.count || 0;
  if (workCount > 5 && healthCount === 0) recs.push("You've been working hard! Take a break for some physical activity.");
  if (learningCount === 0 && totalEvents > 3) recs.push("Consider dedicating 15-30 minutes to learning something new.");
  if (socialCount === 0 && totalEvents > 5) recs.push("Connect with a friend or family member today.");
  if (totalEvents < 5 && hour > 12) recs.push("Log more activities to get better insights into your day.");
  if (totalEvents > 10) recs.push("Very active day! Make sure to schedule some downtime.");
  return recs.slice(0, 4);
}

function calculateProductivityScore(categories, totalEvents) {
  if (totalEvents === 0) return 0;
  let weightedSum = 0;
  for (const cat of categories) {
    const w = PRODUCTIVITY_WEIGHTS[cat.category] || 0.4;
    weightedSum += cat.count * w;
  }
  const base = (weightedSum / totalEvents) * 100;
  const varietyBonus = Math.min(categories.filter(c => c.count > 0).length * 2, 10);
  const healthBonus = categories.find(c => c.category === "health")?.count > 0 ? 5 : 0;
  return Math.min(Math.round(base + varietyBonus + healthBonus), 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ANALYSIS PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full analysis for a given day.
 * Tries Groq AI first; falls back to keyword-based analysis on failure.
 */
export async function analyzeDay(userId, date = new Date(), timeZone = "UTC") {
  const tz = resolveTimeZone(timeZone);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const events = await Event.find({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ timestamp: 1 });

  // Build category map using keyword detection
  const categoryMap = new Map();
  for (const event of events) {
    const category = event.category || detectCategory(event.label);
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { category, count: 0, events: [] });
    }
    const cat = categoryMap.get(category);
    cat.count++;
    cat.events.push({ label: event.label, timestamp: event.timestamp });
  }

  const totalEvents = events.length;
  const categories = Array.from(categoryMap.values())
    .map(cat => ({
      ...cat,
      percentage: totalEvents > 0 ? Math.round((cat.count / totalEvents) * 100) : 0,
      timeSpent: cat.count * 15,
    }))
    .sort((a, b) => b.count - a.count);

  const topCategory = categories.length > 0 ? categories[0].category : null;

  // Keyword-based fallback values
  const keywordInsights = generateInsights(categories, totalEvents);
  const keywordRecs = generateRecommendations(categories, totalEvents);
  const keywordScore = calculateProductivityScore(categories, totalEvents);

  // Fetch recent history for context
  const recentHistory = await getAnalysisHistory(userId, 7);
  const avgScore = recentHistory.length > 0
    ? Math.round(recentHistory.reduce((s, h) => s + (h.productivityScore || 0), 0) / recentHistory.length)
    : null;
  const userHistory = avgScore !== null ? { avgScore, topCategory } : null;

  // Prepare event payload for AI
  const eventPayload = events.map(e => ({
    time: formatTimeInZone(e.timestamp, tz),
    label: e.label,
    category: e.category || detectCategory(e.label),
  }));

  let analysisSource = "keyword";
  let aiScore = keywordScore;
  let aiInsights = keywordInsights;
  let aiRecs = keywordRecs;
  let mindset = { state: "unknown", confidence: 0, description: "", triggers: [], suggestion: "" };
  let routineScore = 0;
  let routineFeedback = "";
  let timeOfDaySuggestion = "";
  let personalizedTip = "";

  // Try AI analysis
  if (process.env.GROQ_API_KEY && totalEvents > 0) {
    try {
      const aiResult = await getAiAnalysis(eventPayload, userHistory);

      if (aiResult.score !== undefined) aiScore = Math.min(100, Math.max(0, Math.round(aiResult.score)));
      if (Array.isArray(aiResult.insights) && aiResult.insights.length > 0) aiInsights = aiResult.insights;
      if (Array.isArray(aiResult.recommendations) && aiResult.recommendations.length > 0) aiRecs = aiResult.recommendations;
      if (aiResult.mindset) mindset = aiResult.mindset;
      if (aiResult.routineScore !== undefined) routineScore = Math.min(100, Math.max(0, Math.round(aiResult.routineScore)));
      if (aiResult.routineFeedback) routineFeedback = aiResult.routineFeedback;
      if (aiResult.timeOfDaySuggestion) timeOfDaySuggestion = aiResult.timeOfDaySuggestion;
      if (aiResult.personalizedTip) personalizedTip = aiResult.personalizedTip;

      analysisSource = "ai";
      console.log("[analysisService] AI analysis succeeded, score:", aiScore);
    } catch (err) {
      console.error("[analysisService] AI analysis failed, using keyword fallback:", err.message);
    }
  }

  // Save/update Analysis document
  const analysis = await Analysis.findOneAndUpdate(
    { userId, date: startOfDay },
    {
      userId,
      date: startOfDay,
      totalEvents,
      categories,
      insights: aiInsights,
      recommendations: aiRecs,
      productivityScore: aiScore,
      topCategory,
      mindset,
      routineScore,
      routineFeedback,
      timeOfDaySuggestion,
      personalizedTip,
      analysisSource,
    },
    { upsert: true, new: true }
  );

  // Save/update RoutineRecord if we have AI data
  if (analysisSource === "ai" && totalEvents > 0) {
    try {
      const routineData = await scoreRoutine(eventPayload, recentHistory);
      const suggestionsData = await getPersonalizedSuggestions(eventPayload, userHistory);

      await RoutineRecord.findOneAndUpdate(
        { userId, date: startOfDay },
        {
          userId,
          date: startOfDay,
          routineScore: routineData.routineScore ?? routineScore,
          grade: routineData.grade ?? "N/A",
          strengths: routineData.strengths ?? [],
          weaknesses: routineData.weaknesses ?? [],
          improvement: routineData.improvement ?? "",
          consistency: routineData.consistency ?? "",
          balanceBreakdown: routineData.balanceBreakdown ?? { physical: 0, mental: 0, social: 0, recovery: 0 },
          mindset,
          suggestions: suggestionsData,
          eventCount: totalEvents,
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("[analysisService] RoutineRecord save failed:", err.message);
    }
  }

  return analysis;
}

/**
 * Get today's analysis — regenerate if stale (>5 min) or missing.
 */
export async function getTodayAnalysis(userId, timeZone = "UTC") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let analysis = await Analysis.findOne({ userId, date: today });

  if (!analysis || (Date.now() - analysis.updatedAt.getTime()) > 5 * 60 * 1000) {
    analysis = await analyzeDay(userId, today, timeZone);
  }

  return analysis;
}

/**
 * Get analysis history for N days.
 */
export async function getAnalysisHistory(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return Analysis.find({ userId, date: { $gte: startDate } }).sort({ date: -1 });
}

/**
 * Get category trends over N days.
 */
export async function getCategoryTrends(userId, days = 7) {
  const analyses = await getAnalysisHistory(userId, days);
  const totals = new Map();

  for (const analysis of analyses) {
    for (const cat of analysis.categories) {
      if (!totals.has(cat.category)) totals.set(cat.category, { count: 0, days: 0 });
      const t = totals.get(cat.category);
      t.count += cat.count;
      t.days++;
    }
  }

  return Array.from(totals.entries())
    .map(([category, data]) => ({
      category,
      totalCount: data.count,
      avgPerDay: Math.round((data.count / data.days) * 10) / 10,
      daysActive: data.days,
    }))
    .sort((a, b) => b.totalCount - a.totalCount);
}

/**
 * Get today's routine record (AI-scored).
 */
export async function getTodayRoutineRecord(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return RoutineRecord.findOne({ userId, date: today });
}

/**
 * Get routine history for N days.
 */
export async function getRoutineHistory(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  return RoutineRecord.find({ userId, date: { $gte: startDate } }).sort({ date: -1 });
}

/**
 * Get mindset analysis for today's events (standalone call).
 */
export async function getTodayMindset(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const events = await Event.find({
    userId,
    timestamp: { $gte: start },
  }).sort({ timestamp: 1 });

  if (events.length === 0) {
    return { state: "unknown", confidence: 0, description: "No events logged yet.", triggers: [], suggestion: "Start logging your activities to get mindset insights." };
  }

  const payload = events.map(e => ({ label: e.label }));
  return getMindsetAnalysis(payload);
}

/**
 * Get personalized suggestions for today (standalone call).
 */
export async function getTodaySuggestions(userId, timeZone = "UTC") {
  const tz = resolveTimeZone(timeZone);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const events = await Event.find({
    userId,
    timestamp: { $gte: start },
  }).sort({ timestamp: 1 });

  const recentHistory = await getAnalysisHistory(userId, 7);
  const avgScore = recentHistory.length > 0
    ? Math.round(recentHistory.reduce((s, h) => s + (h.productivityScore || 0), 0) / recentHistory.length)
    : null;

  const payload = events.map(e => ({
    time: formatTimeInZone(e.timestamp, tz),
    label: e.label,
  }));

  const topCategory = recentHistory[0]?.topCategory || null;
  const userHistory = avgScore !== null ? { avgScore, topCategory } : null;

  return getPersonalizedSuggestions(payload, userHistory);
}
