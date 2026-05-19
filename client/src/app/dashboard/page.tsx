"use client";
import { CAT_COLORS, COLOR_MAP } from "@/constants/colors";
import { MINDSET_CFG } from "@/constants/mindset";

import EventInput from "@/components/dashboard/eventInput";
import TimelinePanel from "@/components/dashboard/timeLinePanel";
import { AiAnalysis } from "@/types/analysis";
import { EventItem } from "@/types/event";
import { RoutineRecord } from "@/types/routine";
import { motion } from "framer-motion";

import {
  Activity,
  BarChart2,
  Brain,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Lightbulb,
  LogOut,
  Map,
  Moon,
  RefreshCw,
  Sparkles,
  Star,
  Sun, Sunset,
  Target,
  TrendingUp,
  User,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const API = "http://localhost:3000";


export default function Dashboard() {
  const [eventInput, setEventInput]         = useState("");
  const [mounted, setMounted]               = useState(false);
  const [isLogging, setIsLogging]           = useState(false);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [events, setEvents]                 = useState<EventItem[]>([]);
  const [aiAnalysis, setAiAnalysis]         = useState<AiAnalysis | null>(null);
  const [routineRecord, setRoutineRecord]   = useState<RoutineRecord | null>(null);
  const [aiError, setAiError]               = useState<string | null>(null);
  const [usingAi, setUsingAi]               = useState(false);
  const [username, setUsername]             = useState("...");
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [activeTab, setActiveTab]           = useState<"timeline"|"insights"|"routine">("timeline");

  const fetchAiAnalysis = useCallback(async (evs: EventItem[]) => {
    if (!evs.length) return;
    setIsAnalyzing(true); setAiError(null);
    try {
      const res = await fetch(`${API}/api/analysis/ai-analyze`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify({ events: evs.map(e => ({ time:e.time, label:e.label })) }),
      });
      if (res.ok) { setAiAnalysis(await res.json()); setUsingAi(true); }
      else throw new Error();
    } catch {
      try {
        const fb = await fetch(`${API}/api/analysis/refresh`, { method:"POST", credentials:"include" });
        if (fb.ok) {
          const d = await fb.json();
          setAiAnalysis({
            score: d.productivityScore ?? 0,
            categories: (d.categories ?? []).map((c: { category:string; percentage:number }) => ({
              name: c.category.charAt(0).toUpperCase() + c.category.slice(1), percent: c.percentage,
            })),
            insights: d.insights ?? [], recommendations: d.recommendations ?? [],
            mindset: d.mindset, routineScore: d.routineScore,
            routineFeedback: d.routineFeedback, timeOfDaySuggestion: d.timeOfDaySuggestion,
            personalizedTip: d.personalizedTip,
          });
          setUsingAi(false);
          setAiError("Keyword-based analysis — AI model not responding.");
        }
      } catch { setAiError("Analysis unavailable."); }
    } finally { setIsAnalyzing(false); }
  }, []);

  const fetchRoutineRecord = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/analysis/routine/today`, { credentials:"include" });
      if (res.ok) { const d = await res.json(); if (d.routineScore !== undefined) setRoutineRecord(d); }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { credentials:"include" });
        if (!meRes.ok) { window.location.href = "/auth"; return; }
        setUsername((await meRes.json()).username || "User");
        const evRes = await fetch(`${API}/api/events/today`, { credentials:"include" });
        if (evRes.ok) {
          const raw = await evRes.json();
          const mapped: EventItem[] = raw.map((e: { _id:string; timestamp:string; label:string; category:string }) => {
            const cat = e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : "Uncategorized";
            return { _id:e._id, time: new Date(e.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
              label:e.label, category:cat, ...(COLOR_MAP[cat] ?? COLOR_MAP.Uncategorized) };
          });
          setEvents(mapped);
          if (mapped.length) { fetchAiAnalysis(mapped); fetchRoutineRecord(); }
        }
      } catch { window.location.href = "/auth"; }
      finally { setIsLoadingEvents(false); }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventInput.trim() || isLogging) return;
    setIsLogging(true);
    const label = eventInput;
    const timeString = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    let category = "Uncategorized", color = COLOR_MAP.Uncategorized.color, dot = COLOR_MAP.Uncategorized.dot;
    try {
      const res = await fetch(`${API}/api/analysis/categorize-single`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify({ label }),
      });
      if (res.ok) { const d = await res.json(); category=d.category||category; color=d.color||color; dot=d.dot||dot; }
    } catch { /* defaults */ }
    let savedId: string|undefined;
    try {
      const sr = await fetch(`${API}/api/events`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify({ label, category }),
      });
      if (sr.ok) { const d = await sr.json(); savedId = d.event?._id; }
    } catch { /* non-critical */ }
    const updated = [...events, { _id:savedId, time:timeString, label, category, color, dot }];
    setEvents(updated); setEventInput(""); setIsLogging(false);
    fetchAiAnalysis(updated); fetchRoutineRecord();
  };

  const handleDeleteEvent = async (index: number) => {
    const ev = events[index];
    if (ev._id) {
      setDeletingId(ev._id);
      try { await fetch(`${API}/api/events/${ev._id}`, { method:"DELETE", credentials:"include" }); } catch { /* best-effort */ }
      setDeletingId(null);
    }
    const updated = events.filter((_,i) => i !== index);
    setEvents(updated);
    if (updated.length) fetchAiAnalysis(updated);
    else { setAiAnalysis(null); setRoutineRecord(null); }
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method:"POST", credentials:"include" });
    window.location.href = "/auth";
  };

  const displayScore      = aiAnalysis?.score ?? Math.min(100, events.length * 12);
  const displayCategories = aiAnalysis?.categories ?? Object.entries(
    events.reduce((acc,e) => { acc[e.category]=(acc[e.category]||0)+1; return acc; }, {} as Record<string,number>)
  ).map(([name,count]) => ({ name, percent: Math.round((count/Math.max(events.length,1))*100) }));
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

      {/* Header */}
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
          <Link href="/profile" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
            <User className="w-4 h-4" /><span className="hidden sm:inline">{username}</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors px-3 py-2 rounded-lg hover:bg-rose-50">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-6">
        {(["timeline","insights","routine"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "glass-card text-slate-600 hover:text-slate-800"}`}>
            {tab === "timeline" ? "📋 Timeline" : tab === "insights" ? "✨ AI Insights" : "🏆 Routine"}
          </button>
        ))}
      </div>

      {/* ── TIMELINE TAB: two-column, input+timeline left, score+breakdown right ── */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* LEFT col */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Log input */}
            <EventInput
              eventInput={eventInput}
              setEventInput={setEventInput}
              isLogging={isLogging}
              handleAddEvent={handleAddEvent}
            />
            {/* Timeline */}
            <TimelinePanel
              events={events}
              isLoading={isLoadingEvents}
              deletingId={deletingId}
              onDelete={handleDeleteEvent}
            />
          </div>

          {/* RIGHT col — score + breakdown */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Score circle */}
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }}
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
                <motion.span key={displayScore} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  className="text-5xl font-black text-slate-800 relative z-10">
                  {isAnalyzing ? <div className="w-8 h-8 border-[3px] border-slate-300 border-t-blue-500 rounded-full animate-spin" /> : displayScore}
                </motion.span>
              </div>
              <p className="text-sm font-medium text-slate-500 text-center">
                {events.length === 0 ? "Log an event to get started"
                  : usingAi ? "AI-powered score"
                  : `Estimated from ${events.length} activities`}
              </p>
            </motion.div>

            {/* Mindset — only when available */}
            {mindset && mindset.state !== "unknown" && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                className={`glass-card p-5 border ${mindsetCfg.border} ${mindsetCfg.bg}`}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Mindset
                </p>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-3xl leading-none">{mindsetCfg.emoji}</span>
                  <div>
                    <p className={`text-lg font-black capitalize ${mindsetCfg.color}`}>{mindset.state}</p>
                    <p className="text-xs text-slate-400">{mindset.confidence}% confidence</p>
                  </div>
                </div>
                {mindset.description && <p className="text-xs text-slate-600 leading-relaxed mb-2">{mindset.description}</p>}
                {mindset.suggestion && (
                  <div className="flex gap-2 items-start p-2.5 bg-white/70 rounded-lg border border-white/80">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-slate-700">{mindset.suggestion}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Category breakdown */}
            {events.length > 0 && displayCategories.length > 0 && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
                className="glass-card p-5 flex-grow">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Map className="w-4 h-4 text-purple-500" /> Activity Breakdown
                </h3>
                {isAnalyzing ? (
                  [1,2,3].map(i => <div key={i} className="h-7 rounded-lg bg-slate-100 animate-pulse mb-2" />)
                ) : (
                  <div className="flex flex-col gap-3">
                    {displayCategories.map((cat, i) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                          <span>{cat.name}</span><span>{cat.percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width:0 }} animate={{ width:`${cat.percent}%` }}
                            transition={{ duration:0.7, delay: i * 0.06 }}
                            className={`h-full rounded-full ${CAT_COLORS[cat.name] ?? "bg-slate-400"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty state hint */}
            {events.length === 0 && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                className="glass-card p-6 flex flex-col items-center text-center gap-3 flex-grow justify-center">
                <Sparkles className="w-8 h-8 text-violet-300" />
                <p className="text-sm font-semibold text-slate-500">AI insights appear here</p>
                <p className="text-xs text-slate-400">Log activities then switch to AI Insights or Routine tabs.</p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── INSIGHTS TAB: two-column, timeline left, AI cards right ── */}
      {activeTab === "insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* LEFT — input + timeline (same as always) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <EventInput
              eventInput={eventInput}
              setEventInput={setEventInput}
              isLogging={isLogging}
              handleAddEvent={handleAddEvent}
            />
            <TimelinePanel
              events={events}
              isLoading={isLoadingEvents}
              deletingId={deletingId}
              onDelete={handleDeleteEvent}
            />

          </div>

          {/* RIGHT — score + all AI insight cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Score */}
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }}
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
                <motion.span key={displayScore} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  className="text-5xl font-black text-slate-800 relative z-10">
                  {isAnalyzing ? <div className="w-8 h-8 border-[3px] border-slate-300 border-t-blue-500 rounded-full animate-spin" /> : displayScore}
                </motion.span>
              </div>
              <p className="text-sm font-medium text-slate-500 text-center">
                {events.length === 0 ? "Log an event to get started" : usingAi ? "AI-powered score" : `Estimated from ${events.length} activities`}
              </p>
            </motion.div>

            {events.length === 0 ? (
              <div className="glass-card p-8 text-center flex-grow flex flex-col items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-violet-300" />
                <p className="text-sm font-semibold text-slate-500">Log activities to unlock AI insights</p>
              </div>
            ) : (
              <>
                {aiError && !isAnalyzing && (
                  <div className="flex gap-2 items-center px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-amber-700">{aiError}</span>
                  </div>
                )}
                {/* Mindset */}
                {mindset && mindset.state !== "unknown" && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                    className={`glass-card p-4 border ${mindsetCfg.border} ${mindsetCfg.bg}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" /> Mindset
                    </p>
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl leading-none">{mindsetCfg.emoji}</span>
                      <div>
                        <p className={`text-base font-black capitalize ${mindsetCfg.color}`}>{mindset.state}</p>
                        <p className="text-xs text-slate-400">{mindset.confidence}% confidence</p>
                      </div>
                    </div>
                    {mindset.description && <p className="text-xs text-slate-600 leading-relaxed mb-2">{mindset.description}</p>}
                    {mindset.suggestion && (
                      <div className="flex gap-2 items-start p-2 bg-white/70 rounded-lg border border-white/80">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-slate-700">{mindset.suggestion}</p>
                      </div>
                    )}
                  </motion.div>
                )}
                {/* Right Now + Tip side by side */}
                {(aiAnalysis?.timeOfDaySuggestion || aiAnalysis?.personalizedTip) && (
                  <div className="grid grid-cols-2 gap-3">
                    {aiAnalysis?.timeOfDaySuggestion && (
                      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
                        className="glass-card p-4 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200/60">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5 flex items-center gap-1"><Sun className="w-3 h-3" /> Now</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{aiAnalysis.timeOfDaySuggestion}</p>
                      </motion.div>
                    )}
                    {aiAnalysis?.personalizedTip && (
                      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
                        className="glass-card p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/90 border border-amber-200/60">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1.5 flex items-center gap-1"><Star className="w-3 h-3" /> Tip</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{aiAnalysis.personalizedTip}</p>
                      </motion.div>
                    )}
                  </div>
                )}
                {/* Insights */}
                {(isAnalyzing || displayInsights.length > 0) && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }} className="glass-card p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-rose-500" />{usingAi ? "AI Insights" : "Insights"}
                    </h3>
                    {isAnalyzing ? [1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse mb-2" />) : (
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
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.32 }} className="glass-card p-5">
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
        </div>
      )}

      {/* ── ROUTINE TAB: two-column, timeline left, routine cards right ── */}
      {activeTab === "routine" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* LEFT — input + timeline */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <EventInput
              eventInput={eventInput}
              setEventInput={setEventInput}
              isLogging={isLogging}
              handleAddEvent={handleAddEvent}
            />
            <TimelinePanel
              events={events}
              isLoading={isLoadingEvents}
              deletingId={deletingId}
              onDelete={handleDeleteEvent}
            />
          </div>

          {/* RIGHT — score + routine cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Score */}
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }}
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
                <motion.span key={displayScore} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  className="text-5xl font-black text-slate-800 relative z-10">
                  {isAnalyzing ? <div className="w-8 h-8 border-[3px] border-slate-300 border-t-blue-500 rounded-full animate-spin" /> : displayScore}
                </motion.span>
              </div>
              <p className="text-sm font-medium text-slate-500 text-center">
                {events.length === 0 ? "Log an event to get started" : usingAi ? "AI-powered score" : `Estimated from ${events.length} activities`}
              </p>
            </motion.div>

            {events.length === 0 ? (
              <div className="glass-card p-8 text-center flex-grow flex flex-col items-center justify-center gap-3">
                <BarChart2 className="w-8 h-8 text-indigo-300" />
                <p className="text-sm font-semibold text-slate-500">Log activities to score your routine</p>
              </div>
            ) : !routineRecord ? (
              <div className="glass-card p-8 text-center flex-grow flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Generating routine analysis…</p>
              </div>
            ) : (
              <>
                {/* Routine score + grade + balance */}
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="glass-card p-5">
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
                        <span className="text-xs text-slate-400">grade</span>
                      </div>
                      {routineRecord.consistency && <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">{routineRecord.consistency}</p>}
                    </div>
                  </div>
                  {routineRecord.balanceBreakdown && (
                    <div className="flex flex-col gap-2">
                      {(Object.entries(routineRecord.balanceBreakdown) as [string,number][]).map(([key,val]) => {
                        const c = key==="physical"?"bg-emerald-400":key==="mental"?"bg-blue-400":key==="social"?"bg-orange-400":"bg-teal-400";
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 capitalize w-14 shrink-0">{key}</span>
                            <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width:0 }} animate={{ width:`${val}%` }} transition={{ duration:0.8 }} className={`h-full rounded-full ${c}`} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Strengths + Weaknesses + Tomorrow */}
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="glass-card p-5">
                  {routineRecord.strengths?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">✅ Strengths</p>
                      <div className="flex flex-col gap-1.5">
                        {routineRecord.strengths.map((s,i) => (
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
                        {routineRecord.weaknesses.map((w,i) => (
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

                {/* Day plan */}
                {suggestions && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="glass-card p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Your Day Plan
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { key:"immediate", label:"Right Now", icon:<Sparkles className="w-3.5 h-3.5 text-violet-500" /> },
                        { key:"morning",   label:"Morning",   icon:<Coffee className="w-3.5 h-3.5 text-amber-500" /> },
                        { key:"afternoon", label:"Afternoon", icon:<Sun className="w-3.5 h-3.5 text-orange-500" /> },
                        { key:"evening",   label:"Evening",   icon:<Sunset className="w-3.5 h-3.5 text-rose-500" /> },
                        { key:"night",     label:"Night",     icon:<Moon className="w-3.5 h-3.5 text-indigo-500" /> },
                      ] as { key: keyof typeof suggestions; label:string; icon:React.ReactNode }[]).map(({ key, label, icon }) => {
                        const text = suggestions[key]; if (!text) return null;
                        return (
                          <div key={key} className="flex gap-2 items-start p-3 bg-white/60 rounded-xl border border-white/80">
                            <div className="shrink-0 mt-0.5">{icon}</div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                              <p className="text-xs font-medium text-slate-700 leading-relaxed">{text}</p>
                            </div>
                          </div>
                        );
                      })}
                      {suggestions.weeklyGoal && (
                        <div className="flex gap-2 items-start p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 col-span-2">
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
        </div>
      )}

    </div>
  );
}
