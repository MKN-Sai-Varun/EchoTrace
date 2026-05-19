/**
 * EchoTrace AI Service — Groq (OpenAI-compatible) backend.
 *
 * Groq API format:
 *   POST https://api.groq.com/openai/v1/chat/completions
 *   Headers: Authorization: Bearer <GROQ_API_KEY>
 *   Body: { model, messages, temperature, max_tokens, response_format? }
 *   Response: { choices: [{ message: { content: "..." } }] }
 */

import { categoryCache, analysisCache, routineCache, suggestionsCache } from "./aiCache.js";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

/**
 * Core Groq API caller — uses OpenAI-compatible chat completions format.
 */
async function callGroq(messages, { temperature = 0.4, maxTokens = 1024, jsonMode = false } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  const modelUrl = process.env.AI_MODEL_URL || "https://api.groq.com/openai/v1/chat/completions";

  if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment.");

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  // Request JSON output when we need structured data
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  console.log(`[aiService] Calling Groq (${GROQ_MODEL}), jsonMode=${jsonMode}`);

  const response = await fetch(modelUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) throw new Error("Empty response from Groq: " + JSON.stringify(data));

  console.log("[aiService] Groq reply (first 200 chars):", content.slice(0, 200));
  return content;
}

/**
 * Safely parse JSON from model output — handles markdown code fences and trailing text.
 */
function parseJsonReply(text) {
  // Strip markdown code fences if present
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
    // Try to extract the first {...} block
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    throw new Error("Could not parse JSON from model reply: " + text.slice(0, 150));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full-day AI analysis.
 * Returns: { score, categories, insights, recommendations, mindset, routineScore, routineFeedback }
 */
export async function getAiAnalysis(events, userHistory = null) {
  const cacheKey = JSON.stringify({ events, userHistory });
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    console.log("[aiService] Cache HIT for getAiAnalysis");
    return cached;
  }
  console.log("[aiService] Cache MISS for getAiAnalysis");

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

  const historyContext = userHistory
    ? `\nUser's recent history (last 7 days avg score: ${userHistory.avgScore}, top category: ${userHistory.topCategory}):`
    : "";

  const systemPrompt = `You are EchoTrace's personal AI coach. Analyze the user's logged activities and return a JSON object with these exact keys:

{
  "score": <integer 0-100, productivity score>,
  "categories": [{ "name": "<category>", "percent": <integer> }],
  "insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "recommendations": ["<rec 1>", "<rec 2>", "<rec 3>"],
  "mindset": {
    "state": "<one of: focused, scattered, relaxed, stressed, balanced, social, creative, recovering>",
    "confidence": <integer 0-100>,
    "description": "<1-2 sentence description of inferred mental/emotional state>",
    "triggers": ["<what seems to be driving this mindset>"]
  },
  "routineScore": <integer 0-100, how consistent/healthy the routine pattern is>,
  "routineFeedback": "<1-2 sentences on the routine quality and what to improve>",
  "timeOfDaySuggestion": "<specific suggestion for what to do in the current ${timeOfDay} based on their day so far>",
  "personalizedTip": "<one highly specific, actionable tip based on their exact activity pattern today>"
}

Scoring guide:
- Productivity score: weight work/learning/health highly, entertainment/uncategorized lower
- Routine score: reward consistent patterns (morning health, focused work blocks, social time), penalise erratic or unbalanced days
- Mindset: infer from activity types, timing, and sequence — e.g. back-to-back meetings = stressed, morning workout + deep work = focused
- Be specific and personal — reference actual activities the user logged, not generic advice
- Today is ${dayOfWeek}, current time is ${timeOfDay}.${historyContext}`;

  const userPrompt = `Here are my activities today (${events.length} total):
${events.map((e, i) => `${i + 1}. [${e.time || "?"}] ${e.label}`).join("\n")}

Analyze my day and return the JSON.`;

  try {
    const reply = await callGroq(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      { temperature: 0.5, maxTokens: 1200, jsonMode: true }
    );
    const parsed = parseJsonReply(reply);
    analysisCache.set(cacheKey, parsed, 10 * 60 * 1000); // 10 minutes cache
    return parsed;
  } catch (error) {
    console.error("[aiService] getAiAnalysis error:", error.message);
    throw error;
  }
}

/**
 * Categorize a single event label.
 * Returns: { category, color, dot }
 */
export async function getAiCategory(eventLabel) {
  const cacheKey = eventLabel.trim().toLowerCase();
  const cached = categoryCache.get(cacheKey);
  if (cached) {
    console.log(`[aiService] Cache HIT for getAiCategory: "${eventLabel}" -> "${cached.category}"`);
    return cached;
  }
  console.log(`[aiService] Cache MISS for getAiCategory: "${eventLabel}"`);

  if (!process.env.GROQ_API_KEY) {
    const fallback = keywordFallback(eventLabel);
    categoryCache.set(cacheKey, fallback, 24 * 60 * 60 * 1000);
    return fallback;
  }

  try {
    const systemPrompt = `You are an activity categorizer. Given an activity description, return a JSON object with a single key "category" whose value is exactly one of: Work, Health, Food, Learning, Social, Entertainment, Personal, Creative, Recovery, Uncategorized.

Examples:
- "morning run" → {"category": "Health"}
- "team standup" → {"category": "Work"}
- "read book" → {"category": "Learning"}
- "lunch with friend" → {"category": "Social"}`;

    const reply = await callGroq(
      [{ role: "system", content: systemPrompt }, { role: "user", content: `Categorize: "${eventLabel}"` }],
      { temperature: 0.1, maxTokens: 50, jsonMode: true }
    );
    const parsed = parseJsonReply(reply);
    const result = enrichWithColors(parsed);
    categoryCache.set(cacheKey, result, 24 * 60 * 60 * 1000); // 24 hours cache
    return result;
  } catch (error) {
    console.error("[aiService] getAiCategory error, using fallback:", error.message);
    const fallback = keywordFallback(eventLabel);
    categoryCache.set(cacheKey, fallback, 24 * 60 * 60 * 1000); // cache fallback too
    return fallback;
  }
}

/**
 * Infer mindset from a list of events.
 * Returns: { state, confidence, description, triggers }
 */
export async function getMindsetAnalysis(events) {
  if (!process.env.GROQ_API_KEY || events.length === 0) {
    return defaultMindset();
  }

  try {
    const systemPrompt = `You are a behavioral psychologist AI. Based on a user's logged activities, infer their current mental and emotional state.

Return a JSON object:
{
  "state": "<one of: focused, scattered, relaxed, stressed, balanced, social, creative, recovering>",
  "confidence": <integer 0-100>,
  "description": "<2-3 sentences describing the inferred mindset and what's driving it>",
  "triggers": ["<activity or pattern that signals this mindset>"],
  "suggestion": "<one specific action to either maintain or improve this mindset right now>"
}

Be empathetic, specific, and reference actual activities. Avoid generic statements.`;

    const userPrompt = `My activities today:\n${events.map((e, i) => `${i + 1}. ${e.label}`).join("\n")}\n\nWhat is my current mindset?`;

    const reply = await callGroq(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      { temperature: 0.6, maxTokens: 400, jsonMode: true }
    );
    return parseJsonReply(reply);
  } catch (error) {
    console.error("[aiService] getMindsetAnalysis error:", error.message);
    return defaultMindset();
  }
}

/**
 * Generate personalized suggestions for any part of the day.
 * Returns: { morning, afternoon, evening, night, immediate }
 */
export async function getPersonalizedSuggestions(events, userHistory = null) {
  const cacheKey = JSON.stringify({ events, userHistory });
  const cached = suggestionsCache.get(cacheKey);
  if (cached) {
    console.log("[aiService] Cache HIT for getPersonalizedSuggestions");
    return cached;
  }
  console.log("[aiService] Cache MISS for getPersonalizedSuggestions");

  if (!process.env.GROQ_API_KEY) {
    return defaultSuggestions();
  }

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

  const historyNote = userHistory
    ? `The user's historical patterns: avg score ${userHistory.avgScore}/100, most active in ${userHistory.topCategory}.`
    : "";

  try {
    const systemPrompt = `You are EchoTrace's personal routine coach. Based on the user's activities today and their patterns, generate highly personalized, actionable suggestions for each part of the day.

Return a JSON object:
{
  "immediate": "<what to do RIGHT NOW in the current ${timeOfDay}, based on today's activities>",
  "morning": "<specific morning routine suggestion based on their patterns>",
  "afternoon": "<specific afternoon suggestion>",
  "evening": "<specific evening wind-down suggestion>",
  "night": "<specific night routine suggestion>",
  "weeklyGoal": "<one habit to build this week based on what's missing from their routine>"
}

${historyNote}
Be specific — reference their actual activities. Avoid generic advice like "drink water" unless it's genuinely relevant.`;

    const userPrompt = `Today's activities (${events.length} logged, current time: ${timeOfDay}):\n${events.map((e, i) => `${i + 1}. ${e.label}`).join("\n")}\n\nGive me personalized suggestions for my day.`;

    const reply = await callGroq(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      { temperature: 0.7, maxTokens: 600, jsonMode: true }
    );
    const parsed = parseJsonReply(reply);
    suggestionsCache.set(cacheKey, parsed, 10 * 60 * 1000); // 10 minutes cache
    return parsed;
  } catch (error) {
    console.error("[aiService] getPersonalizedSuggestions error:", error.message);
    return defaultSuggestions();
  }
}

/**
 * Score and record a daily routine.
 * Returns: { routineScore, strengths, weaknesses, improvement, consistency }
 */
export async function scoreRoutine(events, analysisHistory = []) {
  const cacheKey = JSON.stringify({ events, analysisHistory });
  const cached = routineCache.get(cacheKey);
  if (cached) {
    console.log("[aiService] Cache HIT for scoreRoutine");
    return cached;
  }
  console.log("[aiService] Cache MISS for scoreRoutine");

  if (!process.env.GROQ_API_KEY || events.length === 0) {
    return defaultRoutineScore();
  }

  const historyContext = analysisHistory.length > 0
    ? `\nPast ${analysisHistory.length} days scores: ${analysisHistory.map(h => h.productivityScore || 0).join(", ")}`
    : "";

  try {
    const systemPrompt = `You are a routine optimization expert. Evaluate the quality of a user's daily routine based on their logged activities.

Return a JSON object:
{
  "routineScore": <integer 0-100>,
  "grade": "<A/B/C/D/F>",
  "strengths": ["<what they did well today>"],
  "weaknesses": ["<what was missing or imbalanced>"],
  "improvement": "<the single most impactful change they could make tomorrow>",
  "consistency": "<comment on how today compares to their recent history>",
  "balanceBreakdown": {
    "physical": <0-100>,
    "mental": <0-100>,
    "social": <0-100>,
    "recovery": <0-100>
  }
}

Scoring criteria:
- Physical health activities (exercise, walks): up to 25 points
- Mental/cognitive activities (work, learning, creative): up to 30 points  
- Social connection: up to 15 points
- Recovery/self-care (sleep, meals, personal): up to 15 points
- Variety and balance bonus: up to 15 points
${historyContext}`;

    const userPrompt = `Today's activities:\n${events.map((e, i) => `${i + 1}. [${e.category || "?"}] ${e.label}`).join("\n")}\n\nScore my routine.`;

    const reply = await callGroq(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      { temperature: 0.4, maxTokens: 600, jsonMode: true }
    );
    const parsed = parseJsonReply(reply);
    routineCache.set(cacheKey, parsed, 10 * 60 * 1000); // 10 minutes cache
    return parsed;
  } catch (error) {
    console.error("[aiService] scoreRoutine error:", error.message);
    return defaultRoutineScore();
  }
}

/**
 * AI Productivity Chat Agent.
 * Gives context-aware, real-time responses about user's day and questions.
 */
export async function getAiChatResponse(message, events = [], analysis = null, routineRecord = null) {
  if (!process.env.GROQ_API_KEY) {
    return "The AI Coach is currently offline. Please configure your GROQ_API_KEY.";
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

  const eventsSummary = events.length > 0
    ? events.map((e, i) => `${i + 1}. [${e.time || "?"}] [${e.category || "Uncategorized"}] ${e.label}`).join("\n")
    : "No events logged today yet.";

  const mindsetSummary = analysis?.mindset 
    ? `${analysis.mindset.state} (confidence: ${analysis.mindset.confidence}%, triggers: ${analysis.mindset.triggers?.join(", ") || "none"})`
    : "unknown";

  const systemPrompt = `You are EchoTrace's personal AI Productivity Coach.
Your goal is to guide the user in real-time, helping them stay balanced, focused, and healthy.
Be conversational, encouraging, direct, and concise (keep replies under 3-4 sentences unless they ask for a detailed plan).

Context for Today (${dayName}, current time is ${timeStr}):
- Logged Events:
${eventsSummary}
- Today's Productivity Score: ${analysis?.score || "N/A"}/100
- Today's Routine Grade: ${routineRecord?.grade || "N/A"} (score: ${routineRecord?.routineScore || "N/A"})
- Inferred Mindset: ${mindsetSummary}
- Strengths: ${routineRecord?.strengths?.join(", ") || "N/A"}
- Areas to Improve: ${routineRecord?.weaknesses?.join(", ") || "N/A"}
- Tomorrow's Focus suggestion: ${routineRecord?.improvement || "N/A"}
- Weekly Goal: ${routineRecord?.suggestions?.weeklyGoal || "N/A"}

Always ground your advice in their actual logged events. If they ask what to do right now, recommend something highly specific based on the current time and their events. Do not give generic advice. Keep your response in markdown format.`;

  try {
    const response = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ], { temperature: 0.7, maxTokens: 400 });
    return response;
  } catch (error) {
    console.error("[aiService] getAiChatResponse error:", error.message);
    return "Sorry, I had trouble processing that request. Please try again in a moment.";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function enrichWithColors(parsed) {
  const colorMap = {
    Work:          { color: "bg-blue-100 text-blue-600",       dot: "bg-blue-500" },
    Health:        { color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
    Social:        { color: "bg-orange-100 text-orange-600",   dot: "bg-orange-500" },
    Learning:      { color: "bg-purple-100 text-purple-600",   dot: "bg-purple-500" },
    Food:          { color: "bg-yellow-100 text-yellow-700",   dot: "bg-yellow-500" },
    Entertainment: { color: "bg-pink-100 text-pink-600",       dot: "bg-pink-500" },
    Personal:      { color: "bg-cyan-100 text-cyan-700",       dot: "bg-cyan-500" },
    Recovery:      { color: "bg-teal-100 text-teal-700",       dot: "bg-teal-500" },
    Creative:      { color: "bg-violet-100 text-violet-600",   dot: "bg-violet-500" },
    Uncategorized: { color: "bg-slate-100 text-slate-600",     dot: "bg-slate-500" },
  };
  const cat = parsed.category || "Uncategorized";
  const defaults = colorMap[cat] || colorMap.Uncategorized;
  return { category: cat, color: parsed.color || defaults.color, dot: parsed.dot || defaults.dot };
}

function keywordFallback(label) {
  const l = label.toLowerCase();
  if (/(work|meeting|email|project|cod|call|zoom|sync|review|task|deploy|debug)/i.test(l))
    return { category: "Work",          color: "bg-blue-100 text-blue-600",       dot: "bg-blue-500" };
  if (/(run|walk|gym|exercise|workout|yoga|meditat|stretch|sport)/i.test(l))
    return { category: "Health",        color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" };
  if (/(breakfast|lunch|dinner|snack|coffee|tea|eat|cook|meal|food)/i.test(l))
    return { category: "Food",          color: "bg-yellow-100 text-yellow-700",   dot: "bg-yellow-500" };
  if (/(read|study|course|tutorial|learn|book|article|podcast|research)/i.test(l))
    return { category: "Learning",      color: "bg-purple-100 text-purple-600",   dot: "bg-purple-500" };
  if (/(friend|chat|hangout|party|family|social|date|visit|meet)/i.test(l))
    return { category: "Social",        color: "bg-orange-100 text-orange-600",   dot: "bg-orange-500" };
  if (/(movie|show|game|gaming|music|youtube|netflix|scroll|browse)/i.test(l))
    return { category: "Entertainment", color: "bg-pink-100 text-pink-600",       dot: "bg-pink-500" };
  if (/(write|draw|design|create|build|art|photo|edit|brainstorm)/i.test(l))
    return { category: "Creative",      color: "bg-violet-100 text-violet-600",   dot: "bg-violet-500" };
  if (/(sleep|nap|rest|recover|relax)/i.test(l))
    return { category: "Recovery",      color: "bg-teal-100 text-teal-700",       dot: "bg-teal-500" };
  if (/(shower|clean|laundry|errands|shopping|commute)/i.test(l))
    return { category: "Personal",      color: "bg-cyan-100 text-cyan-700",       dot: "bg-cyan-500" };
  return { category: "Uncategorized",   color: "bg-slate-100 text-slate-600",     dot: "bg-slate-500" };
}

function defaultMindset() {
  return {
    state: "balanced",
    confidence: 50,
    description: "Not enough data to infer mindset. Log more activities throughout the day.",
    triggers: [],
    suggestion: "Keep logging your activities to get personalized mindset insights.",
  };
}

function defaultSuggestions() {
  return {
    immediate: "Log your current activity to get personalized suggestions.",
    morning: "Start with a short exercise or meditation session.",
    afternoon: "Schedule your most important task during peak focus hours (1–3 PM).",
    evening: "Wind down with light reading or a walk.",
    night: "Avoid screens 30 minutes before bed for better sleep.",
    weeklyGoal: "Build a consistent morning routine.",
  };
}

function defaultRoutineScore() {
  return {
    routineScore: 0,
    grade: "N/A",
    strengths: [],
    weaknesses: ["No activities logged yet"],
    improvement: "Start logging your daily activities to get a routine score.",
    consistency: "No history available.",
    balanceBreakdown: { physical: 0, mental: 0, social: 0, recovery: 0 },
  };
}
