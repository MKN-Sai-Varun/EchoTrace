"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Plus, TrendingUp, CheckCircle2, Clock, Target, Map,
  Sparkles, RefreshCw, Brain, Lightbulb, Star, BarChart2,
  Sun, Sunset, Moon, Coffee, LogOut, Trash2, User,
  ChevronRight, Zap,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3000";

type EventItem = {
  _id?: string;
  time: string;
  label: string;
  category: string;
  color: string;
  dot: string;
};

type Mindset = {
  state: string;
  confidence: number;
  description: string;
  triggers: string[];
  suggestion: string;
};

type RoutineRecord = {
  routineScore: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  improvement: string;
  consistency: string;
  balanceBreakdown: { physical: number; mental: number; social: number; recovery: number };
  mindset?: Mindset;
  suggestions?: {
    immediate: string; morning: string; afternoon: string;
    evening: string; night: string; weeklyGoal: string;
  };
};

type AiAnalysis = {
  score: number;
  categories: { name: string; percent: number }[];
  insights: string[];
  recommendations: string[];
  mindset?: Mindset;
  routineScore?: number;
  routineFeedback?: string;
  timeOfDaySuggestion?: string;
  personalizedTip?: string;
};

const CAT_COLORS: Record<string, string> = {
  Work: "bg-blue-500", Health: "bg-emerald-500", Social: "bg-orange-500",
  Learning: "bg-purple-500", Food: "bg-yellow-500", Entertainment: "bg-pink-500",
  Personal: "bg-cyan-500", Recovery: "bg-teal-500", Creative: "bg-violet-500",
  Uncategorized: "bg-slate-400",
};

const COLOR_MAP: Record<string, { color: string; dot: string }> = {
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

const MINDSET_CFG: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  focused:    { emoji: "🎯", color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
  scattered:  { emoji: "🌀", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
  relaxed:    { emoji: "😌", color: "text-teal-700",    bg: "bg-teal-50",    border: "border-teal-200" },
  stressed:   { emoji: "😤", color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200" },
  balanced:   { emoji: "⚖️", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  social:     { emoji: "🤝", color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200" },
  creative:   { emoji: "🎨", color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200" },
  recovering: { emoji: "🌱", color: "text-green-700",   bg: "bg-green-50",   border: "border-green-200" },
  unknown:    { emoji: "🔍", color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200" },
};

export default function Dashboard() {
  const [eventInput, setEventInput]     = useState("");
  const [mounted, setMounted]           = useState(false);
  const [isLogging, setIsLogging]       = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [events, setEvents]             = useState<EventItem[]>([]);
  const [aiAnalysis, setAiAnalysis]     = useState<AiAnalysis | null>(null);
  const [routineRecord, setRoutineRecord] = useState<RoutineRecord | null>(null);
  const [aiError, setAiError]           = useState<string | null>(null);
  const [usingAi, setUsingAi]           = useState(false);
  const [username, setUsername]         = useState("...");
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<"timeline" | "insights" | "routine">("timeline");

  /* ── AI analysis ── */
  const fetchAiAnalysis = useCallback(async (evs: EventItem[]) => {
    if (evs.length === 0) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const payload = evs.map(e => ({ time: e.time, label: e.label }));
      const res = await fetch(`${API}/api/analysis/ai-analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ events: payload }),
      });
      if (res.ok) { setAiAnalysis(await res.json()); setUsingAi(true); }
      else throw new Error();
    } catch {
      try {
        const fb = await fetch(`${API}/api/analysis/refresh`, { method: "POST", credentials: "include" });
        if (fb.ok) {
          const d = await fb.json();
          setAiAnalysis({
            score: d.productivityScore ?? 0,
            categories: (d.categories ?? []).map((c: { category: string; percentage: number }) => ({
              name: c.category.charAt(0).toUpperCase() + c.category.slice(1), percent: c.percentage,
            })),
            insights: d.insights ?? [], recommendations: d.recommendations ?? [],
            mindset: d.mindset, routineScore: d.routineScore,
            routineFeedback: d.routineFeedback, timeOfDaySuggestion: d.timeOfDaySuggestion,
            personalizedTip: d.personalizedTip,
          });
          setUsingAi(false);
          setAiError("Showing keyword-based analysis — AI model not responding.");
        }
      } catch { setAiError("Analysis unavailable. Check backend connection."); }
    } finally { setIsAnalyzing(false); }
  }, []);

  /* ── Routine record ── */
  const fetchRoutineRecord = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/analysis/routine/today`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); if (d.routineScore !== undefined) setRoutineRecord(d); }
    } catch { /* non-critical */ }
  }, []);

  /* ── Init ── */
  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { credentials: "include" });
        if (!meRes.ok) { window.location.href = "/auth"; return; }
        const me = await meRes.json();
        setUsername(me.username || "User");

        const evRes = await fetch(`${API}/api/events/today`, { credentials: "include" });
        if (evRes.ok) {
          const raw = await evRes.json();
          const mapped: EventItem[] = raw.map((e: { _id: string; timestamp: string; label: string; category: string }) => {
            const cat = e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : "Uncategorized";
            return {
              _id: e._id,
              time: new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              label: e.label, category: cat,
              ...(COLOR_MAP[cat] ?? COLOR_MAP.Uncategorized),
            };
          });
          setEvents(mapped);
          if (mapped.length > 0) { fetchAiAnalysis(mapped); fetchRoutineRecord(); }
        }
      } catch { window.location.href = "/auth"; }
      finally { setIsLoadingEvents(false); }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Add event ── */
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventInput.trim() || isLogging) return;
    setIsLogging(true);
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const label = eventInput;
    let category = "Uncategorized", color = COLOR_MAP.Uncategorized.color, dot = COLOR_MAP.Uncategorized.dot;

    try {
      const res = await fetch(`${API}/api/analysis/categorize-single`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ label }),
      });
      if (res.ok) { const d = await res.json(); category = d.category || category; color = d.color || color; dot = d.dot || dot; }
    } catch { /* use defaults */ }

    // Save to DB and get the _id back
    let savedId: string | undefined;
    try {
      const saveRes = await fetch(`${API}/api/events`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ label, category }),
      });
      if (saveRes.ok) { const d = await saveRes.json(); savedId = d.event?._id; }
    } catch { /* non-critical */ }

    const newEvent: EventItem = { _id: savedId, time: timeString, label, category, color, dot };
    const updated = [...events, newEvent];
    setEvents(updated);
    setEventInput("");
    setIsLogging(false);
    fetchAiAnalysis(updated);
    fetchRoutineRecord();
  };

  /* ── Delete event ── */
  const handleDeleteEvent = async (index: number) => {
    const ev = events[index];
    if (!ev._id) {
      // No DB id — just remove from local state
      const updated = events.filter((_, i) => i !== index);
      setEvents(updated);
      if (updated.length > 0) fetchAiAnalysis(updated);
      return;
    }
    setDeletingId(ev._id);
    try {
      await fetch(`${API}/api/events/${ev._id}`, { method: "DELETE", credentials: "include" });
    } catch { /* best-effort */ }
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    setDeletingId(null);
    if (updated.length > 0) fetchAiAnalysis(updated);
    else { setAiAnalysis(null); setRoutineRecord(null); }
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/auth";
  };

  /* ── Derived display values ── */
  const displayScore = aiAnalysis?.score ?? Math.min(100, events.length * 12);
  const displayCategories = aiAnalysis?.categories ?? Object.entries(
    events.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, percent: Math.round((count / Math.max(events.length, 1)) * 100) }));
  const displayInsights = aiAnalysis?.insights ?? [];
  const displayRecs     = aiAnalysis?.recommendations ?? [];
  const mindset    = aiAnalysis?.mindset ?? routineRecord?.mindset;
  const mindsetCfg = MINDSET_CFG[mindset?.state ?? "unknown"] ?? MINDSET_CFG.unknown;
  const suggestions = routineRecord?.suggestions;
  const scoreColor = displayScore >= 80
    ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.25)]"
    : displayScore >= 50 ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.25)]"
    : "border-rose-400 shadow-[0_0_30px_rgba(251,113,133,0.25)]";

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">

      {/* ── Header ── */}
      <header className="flex justify-between items-center mb-6 glass-card px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-800">EchoTrace</h1>
        </div>
        <div className="flex items-center gap-2">
          {usingAi && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          )}
          <Link href="/profile"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{username}</span>
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors px-3 py-2 rounded-lg hover:bg-rose-50">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Tab Nav ── */}
      <div className="flex gap-2 mb-6">
        {(["timeline", "insights", "routine"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "glass-card text-slate-600 hover:text-slate-800 hover:bg-white/90"
            }`}>
            {tab === "timeline" ? "📋 Timeline" : tab === "insights" ? "✨ AI Insights" : "🏆 Routine"}
          </button>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">

        {/* ── LEFT: Input + Timeline + Category Breakdown ── */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Log input */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <h2 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Plus className="w-4 h-4 text-blue-500" /> Log Activity
            </h2>
            <form onSubmit={handleAddEvent} className="flex gap-3">
              <input type="text" value={eventInput} onChange={e => setEventInput(e.target.value)}
                placeholder="What are you doing right now?" className="glass-input flex-grow py-3.5 px-4 text-sm" />
              <button type="submit" disabled={isLogging}
                className="btn-primary px-6 text-sm font-bold shadow-md shadow-blue-500/20 min-w-[80px] flex items-center justify-center">
                {isLogging
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Zap className="w-4 h-4 mr-1" />Log</>}
              </button>
            </form>
          </motion.div>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="glass-card p-5 flex-grow">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Today&apos;s Timeline
              </h2>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {events.length} {events.length === 1 ? "activity" : "activities"}
              </span>
            </div>

            <div className="flex flex-col gap-3 relative">
              {isLoadingEvents ? (
                [1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)
              ) : events.length > 0 ? (
                <>
                  <div className="absolute left-[60px] top-6 bottom-6 w-px bg-slate-200 z-0" />
                  <AnimatePresence>
                    {events.map((item, i) => (
                      <motion.div key={item._id ?? i}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 group">
                        <div className="w-10 shrink-0 text-right">
                          <span className="text-[10px] font-bold text-slate-400 leading-none">
                            {item.time.split(" ")[0]}
                          </span>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full z-10 border-2 border-white shrink-0 ${item.dot} shadow-sm`} />
                        <div className="flex-grow glass-card px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/90 transition-colors min-w-0">
                          <span className="text-sm font-medium text-slate-800 truncate">{item.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${item.color}`}>
                              {item.category}
                            </span>
                            <button
                              onClick={() => handleDeleteEvent(i)}
                              disabled={deletingId === item._id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                              title="Remove log">
                              {deletingId === item._id
                                ? <div className="w-3.5 h-3.5 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm font-semibold text-slate-500">No activities logged yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start by typing what you&apos;re doing above</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Category breakdown — always shown below timeline in left column */}
          {events.length > 0 && displayCategories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="glass-card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Map className="w-4 h-4 text-purple-500" /> Activity Breakdown
              </h3>
              {isAnalyzing ? (
                <div className="flex flex-col gap-2.5">
                  {[1,2,3].map(i => <div key={i} className="h-7 rounded-lg bg-slate-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {displayCategories.map((cat, i) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                        <span>{cat.name}</span><span>{cat.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percent}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06 }}
                          className={`h-full rounded-full ${CAT_COLORS[cat.name] ?? "bg-slate-400"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── INSIGHTS TAB content — left column ── */}
          {activeTab === "insights" && (
            <div className="flex flex-col gap-4">
              {events.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">Log activities to unlock AI insights</p>
                </div>
              ) : (
                <>
                  {aiError && !isAnalyzing && (
                    <div className="flex gap-2 items-center px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-amber-700">{aiError}</span>
                    </div>
                  )}
                  {(aiAnalysis?.timeOfDaySuggestion || aiAnalysis?.personalizedTip) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiAnalysis?.timeOfDaySuggestion && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-4 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200/60">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5" /> Right Now
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.timeOfDaySuggestion}</p>
                        </motion.div>
                      )}
                      {aiAnalysis?.personalizedTip && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                          className="glass-card p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/90 border border-amber-200/60">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" /> Personalized Tip
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.personalizedTip}</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                  {(isAnalyzing || displayInsights.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-rose-500" />
                        {usingAi ? "AI Insights" : "Insights"}
                      </h3>
                      {isAnalyzing ? (
                        <div className="flex flex-col gap-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}</div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {displayInsights.map((insight, i) => (
                            <div key={i} className="flex gap-2.5 items-start p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700 leading-relaxed">{insight}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                  {displayRecs.length > 0 && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-500" /> Recommendations
                      </h3>
                      <div className="flex flex-col gap-2">
                        {displayRecs.map((rec, i) => (
                          <div key={i} className="flex gap-2.5 items-start p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-slate-700 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ROUTINE TAB content — left column ── */}
          {activeTab === "routine" && (
            <div className="flex flex-col gap-4">
              {events.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <BarChart2 className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">Log activities to score your routine</p>
                </div>
              ) : !routineRecord ? (
                <div className="glass-card p-8 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Generating routine analysis…</p>
                </div>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-indigo-500" /> Routine Score
                    </h3>
                    <div className="flex items-center gap-5 mb-5">
                      <div className="w-20 h-20 rounded-full border-[6px] border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <span className="text-2xl font-black text-slate-800">{routineRecord.routineScore}</span>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-4xl font-black text-indigo-600">{routineRecord.grade}</span>
                          <span className="text-xs text-slate-400 font-medium">grade</span>
                        </div>
                        {routineRecord.consistency && (
                          <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">{routineRecord.consistency}</p>
                        )}
                      </div>
                    </div>
                    {routineRecord.balanceBreakdown && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(Object.entries(routineRecord.balanceBreakdown) as [string, number][]).map(([key, val]) => {
                          const barColor = key === "physical" ? "bg-emerald-400" : key === "mental" ? "bg-blue-400" : key === "social" ? "bg-orange-400" : "bg-teal-400";
                          return (
                            <div key={key} className="p-3 bg-white/60 rounded-xl border border-white/80">
                              <div className="flex justify-between items-center mb-1.5">
                                <p className="text-[10px] font-bold text-slate-500 capitalize">{key}</p>
                                <p className="text-[10px] font-bold text-slate-700">{val}</p>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }}
                                  className={`h-full rounded-full ${barColor}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                    className="glass-card p-5">
                    {routineRecord.strengths?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">✅ Strengths</p>
                        <div className="flex flex-col gap-1.5">
                          {routineRecord.strengths.map((s, i) => (
                            <div key={i} className="flex gap-2 items-start p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {routineRecord.weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">⚠️ Areas to Improve</p>
                        <div className="flex flex-col gap-1.5">
                          {routineRecord.weaknesses.map((w, i) => (
                            <div key={i} className="flex gap-2 items-start p-2.5 bg-rose-50 rounded-lg border border-rose-100">
                              <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700">{w}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {routineRecord.improvement && (
                      <div className="flex gap-2.5 items-start p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Tomorrow&apos;s Focus</p>
                          <p className="text-xs font-medium text-slate-700">{routineRecord.improvement}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  {suggestions && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Your Day Plan
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {([
                          { key: "immediate", label: "Right Now",  icon: <Sparkles className="w-3.5 h-3.5 text-violet-500" /> },
                          { key: "morning",   label: "Morning",    icon: <Coffee className="w-3.5 h-3.5 text-amber-500" /> },
                          { key: "afternoon", label: "Afternoon",  icon: <Sun className="w-3.5 h-3.5 text-orange-500" /> },
                          { key: "evening",   label: "Evening",    icon: <Sunset className="w-3.5 h-3.5 text-rose-500" /> },
                          { key: "night",     label: "Night",      icon: <Moon className="w-3.5 h-3.5 text-indigo-500" /> },
                        ] as { key: keyof typeof suggestions; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => {
                          const text = suggestions[key];
                          if (!text) return null;
                          return (
                            <div key={key} className="flex gap-3 items-start p-3 bg-white/60 rounded-xl border border-white/80">
                              <div className="shrink-0 mt-0.5">{icon}</div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                                <p className="text-xs font-medium text-slate-700 leading-relaxed">{text}</p>
                              </div>
                            </div>
                          );
                        })}
                        {suggestions.weeklyGoal && (
                          <div className="flex gap-3 items-start p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 sm:col-span-2">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Weekly Goal</p>
                              <p className="text-xs font-medium text-slate-700 leading-relaxed">{suggestions.weeklyGoal}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Score + Mindset + Routine summary — always the same ── */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Score card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-violet-500" />
            <div className="flex items-center justify-between w-full mb-6">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Daily Score</h2>
              {events.length > 0 && (
                <button onClick={() => { fetchAiAnalysis(events); fetchRoutineRecord(); }} disabled={isAnalyzing}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Analyzing…" : "Re-analyze"}
                </button>
              )}
            </div>
            <div className={`w-36 h-36 rounded-full border-8 flex items-center justify-center mb-5 relative ${scoreColor}`}>
              <div className="absolute inset-2 border-2 border-dashed border-current opacity-20 rounded-full animate-[spin_10s_linear_infinite]" />
              <motion.span key={displayScore} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black text-slate-800">
                {isAnalyzing
                  ? <div className="w-8 h-8 border-[3px] border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                  : displayScore}
              </motion.span>
            </div>
            <p className="text-sm font-medium text-slate-500 text-center">
              {events.length === 0 ? "Log an event to get started"
                : usingAi ? <span className="flex items-center gap-1.5 justify-center"><Sparkles className="w-3.5 h-3.5 text-violet-500" />AI-powered score</span>
                : `Estimated from ${events.length} activities`}
            </p>
          </motion.div>

          {/* Mindset — always shown when available */}
          {mindset && mindset.state !== "unknown" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`glass-card p-5 border ${mindsetCfg.border} ${mindsetCfg.bg}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Mindset Inference
              </p>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl leading-none">{mindsetCfg.emoji}</span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-lg font-black capitalize ${mindsetCfg.color}`}>{mindset.state}</p>
                    <span className="text-xs text-slate-400 font-medium">{mindset.confidence}%</span>
                  </div>
                  {mindset.description && <p className="text-xs text-slate-600 leading-relaxed">{mindset.description}</p>}
                </div>
              </div>
              {mindset.suggestion && (
                <div className="flex gap-2 items-start p-2.5 bg-white/70 rounded-lg border border-white/80">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-700">{mindset.suggestion}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Routine summary — always shown when available */}
          {routineRecord && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-card p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-500" /> Routine Score
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-[5px] border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.2)]">
                  <span className="text-xl font-black text-slate-800">{routineRecord.routineScore}</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-indigo-600">{routineRecord.grade}</span>
                  {routineRecord.improvement && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[160px]">{routineRecord.improvement}</p>
                  )}
                </div>
              </div>
              {routineRecord.balanceBreakdown && (
                <div className="flex flex-col gap-2">
                  {(Object.entries(routineRecord.balanceBreakdown) as [string, number][]).map(([key, val]) => {
                    const c = key === "physical" ? "bg-emerald-400" : key === "mental" ? "bg-blue-400" : key === "social" ? "bg-orange-400" : "bg-teal-400";
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 capitalize w-14 shrink-0">{key}</span>
                        <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${c}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{val}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Empty hint when no data */}
          {events.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-card p-6 flex flex-col items-center text-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-300" />
              <p className="text-sm font-semibold text-slate-500">AI insights appear here</p>
              <p className="text-xs text-slate-400 leading-relaxed">Log activities then switch to AI Insights or Routine tabs.</p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

          {/* ── INSIGHTS TAB — placeholder, never rendered, kept for diff clarity ── */}
          {false && (
            <div className="flex flex-col gap-4">
              {events.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">Log activities to unlock AI insights</p>
                </div>
              ) : (
                <>
                  {/* AI error banner */}
                  {aiError && !isAnalyzing && (
                    <div className="flex gap-2 items-center px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-amber-700">{aiError}</span>
                    </div>
                  )}

                  {/* Mindset */}
                  {mindset && mindset.state !== "unknown" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`glass-card p-4 border ${mindsetCfg.border} ${mindsetCfg.bg}`}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" /> Mindset
                      </p>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl leading-none mt-0.5">{mindsetCfg.emoji}</span>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-base font-black capitalize ${mindsetCfg.color}`}>{mindset.state}</p>
                            <span className="text-xs text-slate-400 font-medium">{mindset.confidence}% confidence</span>
                          </div>
                          {mindset.description && (
                            <p className="text-xs text-slate-600 leading-relaxed mb-2">{mindset.description}</p>
                          )}
                          {mindset.suggestion && (
                            <div className="flex gap-2 items-start p-2 bg-white/70 rounded-lg border border-white">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700">{mindset.suggestion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Right Now + Personalized Tip */}
                  {(aiAnalysis?.timeOfDaySuggestion || aiAnalysis?.personalizedTip) && (
                    <div className="grid grid-cols-1 gap-3">
                      {aiAnalysis?.timeOfDaySuggestion && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                          className="glass-card p-4 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200/60">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5" /> Right Now
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.timeOfDaySuggestion}</p>
                        </motion.div>
                      )}
                      {aiAnalysis?.personalizedTip && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                          className="glass-card p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/90 border border-amber-200/60">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" /> Personalized Tip
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.personalizedTip}</p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Insights */}
                  {(isAnalyzing || displayInsights.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-rose-500" />
                        {usingAi ? "AI Insights" : "Insights"}
                      </h3>
                      {isAnalyzing ? (
                        <div className="flex flex-col gap-2">
                          {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {displayInsights.map((insight, i) => (
                            <div key={i} className="flex gap-2.5 items-start p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700 leading-relaxed">{insight}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Recommendations */}
                  {displayRecs.length > 0 && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-500" /> Recommendations
                      </h3>
                      <div className="flex flex-col gap-2">
                        {displayRecs.map((rec, i) => (
                          <div key={i} className="flex gap-2.5 items-start p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-slate-700 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Full category breakdown */}
                  {displayCategories.length > 0 && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-4">Activity Breakdown</h3>
                      <div className="flex flex-col gap-3">
                        {displayCategories.map((cat, i) => (
                          <div key={cat.name}>
                            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                              <span>{cat.name}</span><span>{cat.percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percent}%` }}
                                transition={{ duration: 0.7, delay: i * 0.06 }}
                                className={`h-full rounded-full ${CAT_COLORS[cat.name] ?? "bg-slate-400"}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ROUTINE TAB ── */}
          {activeTab === "routine" && (
            <div className="flex flex-col gap-4">
              {events.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <BarChart2 className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">Log activities to score your routine</p>
                </div>
              ) : !routineRecord ? (
                <div className="glass-card p-8 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Generating routine analysis…</p>
                </div>
              ) : (
                <>
                  {/* Score + Grade */}
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-indigo-500" /> Routine Score
                    </h3>
                    <div className="flex items-center gap-5 mb-5">
                      <div className="w-20 h-20 rounded-full border-[6px] border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <span className="text-2xl font-black text-slate-800">{routineRecord.routineScore}</span>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-4xl font-black text-indigo-600">{routineRecord.grade}</span>
                          <span className="text-xs text-slate-400 font-medium">grade</span>
                        </div>
                        {routineRecord.consistency && (
                          <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">{routineRecord.consistency}</p>
                        )}
                      </div>
                    </div>

                    {/* Balance breakdown */}
                    {routineRecord.balanceBreakdown && (
                      <div className="grid grid-cols-2 gap-2.5">
                        {(Object.entries(routineRecord.balanceBreakdown) as [string, number][]).map(([key, val]) => {
                          const barColor = key === "physical" ? "bg-emerald-400" : key === "mental" ? "bg-blue-400" : key === "social" ? "bg-orange-400" : "bg-teal-400";
                          return (
                            <div key={key} className="p-3 bg-white/60 rounded-xl border border-white/80">
                              <div className="flex justify-between items-center mb-1.5">
                                <p className="text-[10px] font-bold text-slate-500 capitalize">{key}</p>
                                <p className="text-[10px] font-bold text-slate-700">{val}</p>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }}
                                  className={`h-full rounded-full ${barColor}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  {/* Strengths + Weaknesses */}
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                    className="glass-card p-5">
                    {routineRecord.strengths?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">✅ Strengths</p>
                        <div className="flex flex-col gap-1.5">
                          {routineRecord.strengths.map((s, i) => (
                            <div key={i} className="flex gap-2 items-start p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {routineRecord.weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">⚠️ Areas to Improve</p>
                        <div className="flex flex-col gap-1.5">
                          {routineRecord.weaknesses.map((w, i) => (
                            <div key={i} className="flex gap-2 items-start p-2.5 bg-rose-50 rounded-lg border border-rose-100">
                              <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-slate-700">{w}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {routineRecord.improvement && (
                      <div className="flex gap-2.5 items-start p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Tomorrow&apos;s Focus</p>
                          <p className="text-xs font-medium text-slate-700">{routineRecord.improvement}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Personalized Day Plan */}
                  {suggestions && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                      className="glass-card p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Your Day Plan
                      </h3>
                      <div className="flex flex-col gap-2.5">
                        {([
                          { key: "immediate", label: "Right Now",  icon: <Sparkles className="w-3.5 h-3.5 text-violet-500" /> },
                          { key: "morning",   label: "Morning",    icon: <Coffee className="w-3.5 h-3.5 text-amber-500" /> },
                          { key: "afternoon", label: "Afternoon",  icon: <Sun className="w-3.5 h-3.5 text-orange-500" /> },
                          { key: "evening",   label: "Evening",    icon: <Sunset className="w-3.5 h-3.5 text-rose-500" /> },
                          { key: "night",     label: "Night",      icon: <Moon className="w-3.5 h-3.5 text-indigo-500" /> },
                        ] as { key: keyof typeof suggestions; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => {
                          const text = suggestions[key];
                          if (!text) return null;
                          return (
                            <div key={key} className="flex gap-3 items-start p-3 bg-white/60 rounded-xl border border-white/80">
                              <div className="shrink-0 mt-0.5">{icon}</div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                                <p className="text-xs font-medium text-slate-700 leading-relaxed">{text}</p>
                              </div>
                            </div>
                          );
                        })}
                        {suggestions.weeklyGoal && (
                          <div className="flex gap-3 items-start p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Weekly Goal</p>
                              <p className="text-xs font-medium text-slate-700 leading-relaxed">{suggestions.weeklyGoal}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TIMELINE TAB right panel: just mindset if available ── */}
          {activeTab === "timeline" && mindset && mindset.state !== "unknown" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`glass-card p-4 border ${mindsetCfg.border} ${mindsetCfg.bg}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Current Mindset
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mindsetCfg.emoji}</span>
                <div>
                  <p className={`text-sm font-black capitalize ${mindsetCfg.color}`}>{mindset.state}</p>
                  <p className="text-xs text-slate-500">{mindset.confidence}% confidence</p>
                </div>
              </div>
              {mindset.suggestion && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed border-t border-white/60 pt-2">{mindset.suggestion}</p>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
