"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, TrendingUp, CheckCircle2, Clock, Map, Target, Sparkles, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type EventType = {
  time: string;
  label: string;
  category: string;
  color: string;
  dot: string;
};

type AiAnalysis = {
  categories: { name: string; percent: number }[];
  score: number;
  insights: string[];
  recommendations: string[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Work: "bg-blue-500",
  Health: "bg-emerald-500",
  Social: "bg-orange-500",
  Learning: "bg-purple-500",
  Food: "bg-yellow-500",
  Entertainment: "bg-pink-500",
  Personal: "bg-cyan-500",
  Recovery: "bg-teal-500",
  Creative: "bg-violet-500",
  Uncategorized: "bg-slate-400",
};

export default function Dashboard() {
  const [eventInput, setEventInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [events, setEvents] = useState<EventType[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [usingAi, setUsingAi] = useState(false);
  const [username, setUsername] = useState("...");

  useEffect(() => {
    setMounted(true);

    // 1. Auth guard — redirect to /auth if no valid session
    async function initDashboard() {
      try {
        const meRes = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });
        if (!meRes.ok) {
          window.location.href = "/auth";
          return;
        }
        const meData = await meRes.json();
        setUsername(meData.username || "User");

        // 2. Load today's saved events from the backend
        const eventsRes = await fetch("http://localhost:3000/api/events/today", {
          credentials: "include",
        });
        if (eventsRes.ok) {
          const rawEvents = await eventsRes.json();
          const mapped: EventType[] = rawEvents.map((e: { timestamp: string; label: string; category: string }) => {
            const cat = e.category
              ? e.category.charAt(0).toUpperCase() + e.category.slice(1)
              : "Uncategorized";
            const colorMap: Record<string, { color: string; dot: string }> = {
              Work:          { color: "bg-blue-100 text-blue-600",    dot: "bg-blue-500" },
              Health:        { color: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
              Social:        { color: "bg-orange-100 text-orange-600",  dot: "bg-orange-500" },
              Learning:      { color: "bg-purple-100 text-purple-600",  dot: "bg-purple-500" },
              Food:          { color: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-500" },
              Entertainment: { color: "bg-pink-100 text-pink-600",      dot: "bg-pink-500" },
              Personal:      { color: "bg-cyan-100 text-cyan-700",      dot: "bg-cyan-500" },
              Uncategorized: { color: "bg-slate-100 text-slate-600",    dot: "bg-slate-500" },
            };
            const colors = colorMap[cat] ?? colorMap.Uncategorized;
            return {
              time: new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              label: e.label,
              category: cat,
              ...colors,
            };
          });
          setEvents(mapped);
          if (mapped.length > 0) fetchAiAnalysis(mapped);
        }
      } catch {
        window.location.href = "/auth";
      } finally {
        setIsLoadingEvents(false);
      }
    }

    initDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAiAnalysis = useCallback(async (currentEvents: EventType[]) => {
    if (currentEvents.length === 0) return;
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const payload = currentEvents.map(e => ({ time: e.time, label: e.label }));
      const response = await fetch("http://localhost:3000/api/analysis/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ events: payload }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
        setUsingAi(true);
        setAiError(null);
      } else {
        throw new Error("AI analysis failed");
      }
    } catch {
      // Fallback: use the backend's existing keyword-based analysis
      try {
        const fallbackResponse = await fetch("http://localhost:3000/api/analysis/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          // Map the backend analysis format to our AiAnalysis format
          const mapped: AiAnalysis = {
            score: fallbackData.productivityScore ?? 0,
            categories: (fallbackData.categories ?? []).map((c: { category: string; percentage: number }) => ({
              name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
              percent: c.percentage,
            })),
            insights: fallbackData.insights ?? [],
            recommendations: fallbackData.recommendations ?? [],
          };
          setAiAnalysis(mapped);
          setUsingAi(false);
          setAiError("AI model not connected — showing keyword-based analysis.");
        } else {
          throw new Error("Fallback also failed");
        }
      } catch {
        // Last resort: compute locally from events
        const categoryMap = currentEvents.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const total = currentEvents.length;
        const categories = Object.entries(categoryMap).map(([name, count]) => ({
          name,
          percent: Math.round((count / total) * 100),
        }));
        setAiAnalysis({
          score: Math.min(100, total * 12),
          categories,
          insights: ["Log more activities to generate personalised insights."],
          recommendations: ["Connect your Hugging Face model in .env for AI-powered recommendations."],
        });
        setUsingAi(false);
        setAiError("Running in offline mode — connect backend for full analysis.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);


  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventInput.trim() || isLogging) return;

    setIsLogging(true);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const currentInput = eventInput;

    let category = "Uncategorized";
    let color = "bg-slate-100 text-slate-600";
    let dot = "bg-slate-500";

    try {
      const response = await fetch("http://localhost:3000/api/analysis/categorize-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label: currentInput }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.category) {
          category = data.category;
          color = data.color || color;
          dot = data.dot || dot;
        }
      }
    } catch {
      // Fallback regex categorization
      const lowerInput = currentInput.toLowerCase();
      if (/(work|meeting|email|project|cod|call|zoom|sync|review|task)/i.test(lowerInput)) {
        category = "Work"; color = "bg-blue-100 text-blue-600"; dot = "bg-blue-500";
      } else if (/(run|walk|gym|exercise|workout|sleep|lunch|dinner|breakfast|health|meditat)/i.test(lowerInput)) {
        category = "Health"; color = "bg-emerald-100 text-emerald-600"; dot = "bg-emerald-500";
      } else if (/(friend|chat|hangout|party|family|social|date)/i.test(lowerInput)) {
        category = "Social"; color = "bg-orange-100 text-orange-600"; dot = "bg-orange-500";
      }
    }

    const newEvent = { time: timeString, label: currentInput, category, color, dot };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setEventInput("");

    // Save event to the backend database
    try {
      await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label: currentInput, category }),
      });
    } catch {
      // Non-critical: event is shown in UI even if DB save fails
    }

    setIsLogging(false);

    // Trigger AI full-day analysis after every new log
    fetchAiAnalysis(updatedEvents);
  };

  // Derived values: use AI data if available, else compute from events
  const displayScore = aiAnalysis?.score ?? Math.min(100, events.length * 12);
  const displayCategories = aiAnalysis?.categories ??
    Object.entries(
      events.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, percent: Math.round((count / events.length) * 100) }));
  const displayInsights = aiAnalysis?.insights ?? [];
  const displayRecommendations = aiAnalysis?.recommendations ?? [];

  const scoreColor = displayScore >= 80 ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
    : displayScore >= 50 ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
    : "border-rose-400 shadow-[0_0_30px_rgba(251,113,133,0.3)]";

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 glass-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">EchoTrace</h1>
        </div>
        <div className="flex items-center gap-4">
          {usingAi && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              AI Active
            </div>
          )}
          <span className="text-sm font-medium text-slate-600 hidden sm:block">Good to see you, {username}</span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-md">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-grow">

        {/* Left Column: Timeline & Input */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Input Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> What are you doing right now?
            </h2>
            <form onSubmit={handleAddEvent} className="flex gap-3">
              <input
                type="text"
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                placeholder="e.g., Checking emails, taking a walk..."
                className="glass-input flex-grow py-4 px-5 text-lg"
              />
              <button type="submit" disabled={isLogging} className="btn-primary px-8 text-lg font-semibold shadow-lg shadow-blue-500/30 min-w-[100px]">
                {isLogging ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Log"}
              </button>
            </form>
          </motion.div>

          {/* Timeline Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> Today's Timeline
              </h2>
              <span className="text-sm font-medium text-slate-500">{events.length} activities</span>
            </div>

            <div className="flex flex-col gap-4 relative">
              {isLoadingEvents ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse" />
                      <div className="flex-grow h-14 bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <>
                  <div className="absolute left-[69px] top-8 bottom-8 w-0.5 bg-slate-200 z-0" />
                  {events.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 group cursor-default"
                    >
                      <div className="w-12 text-right">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{item.time.split(" ")[0]}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full z-10 border-2 border-white ${item.dot} shadow-sm group-hover:scale-125 transition-transform`} />
                      <div className="glass-card p-4 flex-grow border-white/60 hover:bg-white/80 transition-colors flex justify-between items-center">
                        <span className="font-medium text-slate-800">{item.label}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.color}`}>{item.category}</span>
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="text-center py-10 text-slate-500 font-medium">
                  No activities logged yet. Start typing above!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Score Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500" />
            <div className="flex items-center justify-between w-full mb-6">
              <h2 className="text-lg font-bold text-slate-800">Daily Score</h2>
              {events.length > 0 && (
                <button
                  onClick={() => fetchAiAnalysis(events)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Analyzing..." : "Re-analyze"}
                </button>
              )}
            </div>

            <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4 relative ${scoreColor}`}>
              <div className="absolute inset-2 border-2 border-dashed border-current opacity-20 rounded-full animate-[spin_10s_linear_infinite]" />
              <motion.span
                key={displayScore}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-slate-800"
              >
                {isAnalyzing ? "..." : displayScore}
              </motion.span>
            </div>

            <p className="text-sm font-medium text-slate-500">
              {events.length === 0
                ? "Log an event to get started"
                : usingAi
                ? "AI-powered score"
                : `Estimated from ${events.length} activities`}
            </p>
          </motion.div>

          {/* Insights & Recommendations */}
          {events.length > 0 && (
            <>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  {usingAi ? "AI Insights" : "Insights"}
                </h2>

                {/* Small soft banner when AI is not connected but fallback worked */}
                {aiError && !isAnalyzing && displayInsights.length > 0 && (
                  <div className="flex gap-2 items-center p-2 mb-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-xs font-medium text-amber-600">⚡ {aiError}</span>
                  </div>
                )}

                {isAnalyzing ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : displayInsights.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {displayInsights.map((insight, i) => (
                      <AnimatePresence key={i}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3 items-start p-3 bg-white/50 rounded-xl border border-white/50"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-slate-700">{insight}</p>
                        </motion.div>
                      </AnimatePresence>
                    ))}
                    {displayRecommendations.map((rec, i) => (
                      <motion.div
                        key={`rec-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (displayInsights.length + i) * 0.1 }}
                        className="flex gap-3 items-start p-3 bg-white/50 rounded-xl border border-white/50"
                      >
                        <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-slate-700">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Log more activities to generate insights.</p>
                )}
              </motion.div>

              {/* Category Breakdown */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 flex-grow">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-purple-500" /> Breakdown
                </h2>

                <div className="flex flex-col gap-4">
                  {isAnalyzing ? (
                    [1, 2, 3].map(i => <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />)
                  ) : (
                    displayCategories.map((cat, i) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex flex-col gap-1"
                      >
                        <div className="flex justify-between text-sm font-medium text-slate-700">
                          <span>{cat.name}</span>
                          <span>{cat.percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percent}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                            className={`h-full rounded-full ${CATEGORY_COLORS[cat.name] ?? "bg-slate-400"}`}
                          />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
