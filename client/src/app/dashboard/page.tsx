"use client";

import { useCallback, useEffect, useState } from "react";
import { COLOR_MAP } from "@/constants/colors";

import { AiAnalysis } from "@/types/analysis";
import { EventItem } from "@/types/event";
import { RoutineRecord } from "@/types/routine";

import { BarChart2, Sparkles } from "lucide-react";

// Extracted Components
import DashboardHeader from "@/components/dashboard/dashboardHeader";
import TabNav from "@/components/dashboard/tabNav";
import EventInput from "@/components/dashboard/eventInput";
import TimelinePanel from "@/components/dashboard/timeLinePanel";
import ScoreCard from "@/components/dashboard/scoreCard";
import MindsetCard from "@/components/dashboard/mindsetCard";
import CategoryBreakdownCard from "@/components/dashboard/categoryBreakdownCard";
import EmptyStateCard from "@/components/dashboard/emptyStateCard";
import AiErrorBanner from "@/components/dashboard/aiErrorBanner";
import QuickTipsCard from "@/components/dashboard/quickTipsCard";
import InsightsCard from "@/components/dashboard/insightsCard";
import RecommendationsCard from "@/components/dashboard/recommendationsCard";
import RoutineScoreCard from "@/components/dashboard/routineScoreCard";
import RoutineFeedbackCard from "@/components/dashboard/routineFeedbackCard";
import DayPlanCard from "@/components/dashboard/dayPlanCard";
import AiAgentChat from "@/components/dashboard/aiAgentChat";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Dashboard() {
  const [pendingAnalysis, setPendingAnalysis] = useState(false);
  const [eventInput, setEventInput]         = useState("");
  const [mounted, setMounted]               = useState(false);
  const [isLogging, setIsLogging]           = useState(false);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [cooldown, setCooldown]             = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [events, setEvents]                 = useState<EventItem[]>([]);
  const [aiAnalysis, setAiAnalysis]         = useState<AiAnalysis | null>(null);
  const [routineRecord, setRoutineRecord]   = useState<RoutineRecord | null>(null);
  const [aiError, setAiError]               = useState<string | null>(null);
  const [usingAi, setUsingAi]               = useState(false);
  const [username, setUsername]             = useState("...");
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [activeTab, setActiveTab]           = useState<"timeline" | "insights" | "routine">("timeline");

  const fetchDashboardData = useCallback(async (evs: EventItem[], forceRefresh = false) => {
    if (!evs.length) return;
    setIsAnalyzing(true);
    setAiError(null);
    const endpoint = forceRefresh
      ? `${API}/api/analysis/full-analysis/refresh`
      : `${API}/api/analysis/full-analysis`;

    try {
      const res = await fetch(endpoint, {
        method: forceRefresh ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const analysis = data.analysis;
        const routine = data.routineRecord;

        if (analysis) {
          setAiAnalysis({
            score: analysis.productivityScore ?? 0,
            categories: (analysis.categories ?? []).map((c: { category: string; percentage: number }) => ({
              name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
              percent: c.percentage,
            })),
            insights: analysis.insights ?? [],
            recommendations: analysis.recommendations ?? [],
            mindset: analysis.mindset,
            routineScore: analysis.routineScore,
            routineFeedback: analysis.routineFeedback,
            timeOfDaySuggestion: analysis.timeOfDaySuggestion,
            personalizedTip: analysis.personalizedTip,
          });
          setUsingAi(analysis.analysisSource === "ai");
          if (analysis.analysisSource !== "ai") {
            setAiError("Keyword-based analysis — AI model not responding.");
          }
        }
        if (routine && routine.routineScore !== undefined) {
          setRoutineRecord(routine);
        }
        setPendingAnalysis(false);
      } else {
        throw new Error();
      }
    } catch {
      setAiError("Analysis unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { credentials: "include" });
        if (!meRes.ok) {
          window.location.href = "/auth";
          return;
        }
        setUsername((await meRes.json()).username || "User");
        const evRes = await fetch(`${API}/api/events/today`, { credentials: "include" });
        if (evRes.ok) {
          const raw = await evRes.json();
          const mapped: EventItem[] = raw.map((e: { _id: string; timestamp: string; label: string; category: string }) => {
            const cat = e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : "Uncategorized";
            return {
              _id: e._id,
              time: new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              label: e.label,
              category: cat,
              ...(COLOR_MAP[cat] ?? COLOR_MAP.Uncategorized),
            };
          });
          setEvents(mapped);
          if (mapped.length) {
            fetchDashboardData(mapped, false);
          }
        }
      } catch {
        window.location.href = "/auth";
      } finally {
        setIsLoadingEvents(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventInput.trim() || isLogging) return;
    setIsLogging(true);
    const label = eventInput;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let category = "Uncategorized",
      color = COLOR_MAP.Uncategorized.color,
      dot = COLOR_MAP.Uncategorized.dot;
    try {
      const res = await fetch(`${API}/api/analysis/categorize-single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label }),
      });
      if (res.ok) {
        const d = await res.json();
        category = d.category || category;
        color = d.color || color;
        dot = d.dot || dot;
      }
    } catch {
      /* defaults */
    }
    let savedId: string | undefined;
    try {
      const sr = await fetch(`${API}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label, category }),
      });
      if (sr.ok) {
        const d = await sr.json();
        savedId = d.event?._id;
      }
    } catch {
      /* non-critical */
    }
    const updated = [...events, { _id: savedId, time: timeString, label, category, color, dot }];
    setEvents(updated);
    setEventInput("");
    setIsLogging(false);
    setPendingAnalysis(true);
  };

  const handleDeleteEvent = async (index: number) => {
    const ev = events[index];
    if (ev._id) {
      setDeletingId(ev._id);
      try {
        await fetch(`${API}/api/events/${ev._id}`, { method: "DELETE", credentials: "include" });
      } catch {
        /* best-effort */
      }
      setDeletingId(null);
    }
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    if (updated.length) {
      setPendingAnalysis(true);
    } else {
      setAiAnalysis(null);
      setRoutineRecord(null);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/auth";
  };

  const handleTabChange = (tab: "timeline" | "insights" | "routine") => {
    setActiveTab(tab);
    if ((tab === "insights" || tab === "routine") && pendingAnalysis && events.length > 0) {
      fetchDashboardData(events, false);
    }
  };

  const handleRefresh = () => {
    if (isAnalyzing || cooldown) return;
    fetchDashboardData(events, true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000); // 5s cooldown
  };

  const displayScore      = aiAnalysis?.score ?? Math.min(100, events.length * 12);
  const displayCategories =
    aiAnalysis?.categories ??
    Object.entries(
      events.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, percent: Math.round((count / Math.max(events.length, 1)) * 100) }));

  const displayInsights = aiAnalysis?.insights ?? [];
  const displayRecs     = aiAnalysis?.recommendations ?? [];
  const mindset         = aiAnalysis?.mindset ?? routineRecord?.mindset;
  const suggestions     = routineRecord?.suggestions;
  const scoreColor =
    displayScore >= 80
      ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.25)]"
      : displayScore >= 50
      ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.25)]"
      : "border-rose-400 shadow-[0_0_30px_rgba(251,113,133,0.25)]";

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <DashboardHeader username={username} usingAi={usingAi} onLogout={handleLogout} />

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* TIMELINE TAB */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* LEFT: input + timeline */}
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

          {/* RIGHT: score + breakdown */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <ScoreCard
              displayScore={displayScore}
              scoreColor={scoreColor}
              events={events}
              usingAi={usingAi}
              isAnalyzing={isAnalyzing || cooldown}
              onRefresh={handleRefresh}
            />

            {mindset && mindset.state !== "unknown" && <MindsetCard mindset={mindset} />}

            {events.length > 0 && displayCategories.length > 0 && (
              <CategoryBreakdownCard displayCategories={displayCategories} isAnalyzing={isAnalyzing} />
            )}

            {events.length === 0 && (
              <EmptyStateCard
                icon={<Sparkles className="w-8 h-8 text-violet-300" />}
                title="AI insights appear here"
                description="Log activities then switch to AI Insights or Routine tabs."
              />
            )}
          </div>
        </div>
      )}

      {/* INSIGHTS TAB */}
      {activeTab === "insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* LEFT: input + timeline */}
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

          {/* RIGHT: AI insights */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <ScoreCard
              displayScore={displayScore}
              scoreColor={scoreColor}
              events={events}
              usingAi={usingAi}
              isAnalyzing={isAnalyzing || cooldown}
              onRefresh={handleRefresh}
            />

            {events.length === 0 ? (
              <EmptyStateCard
                icon={<Sparkles className="w-8 h-8 text-violet-300" />}
                title="Log activities to unlock AI insights"
              />
            ) : (
              <>
                <AiErrorBanner aiError={aiError} isAnalyzing={isAnalyzing} />

                {mindset && mindset.state !== "unknown" && <MindsetCard mindset={mindset} />}

                <QuickTipsCard
                  timeOfDaySuggestion={aiAnalysis?.timeOfDaySuggestion}
                  personalizedTip={aiAnalysis?.personalizedTip}
                />

                <InsightsCard insights={displayInsights} isAnalyzing={isAnalyzing} usingAi={usingAi} />

                <RecommendationsCard recommendations={displayRecs} />
              </>
            )}
          </div>
        </div>
      )}

      {/* ROUTINE TAB */}
      {activeTab === "routine" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* LEFT: input + timeline */}
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

          {/* RIGHT: routine score & metrics */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <ScoreCard
              displayScore={displayScore}
              scoreColor={scoreColor}
              events={events}
              usingAi={usingAi}
              isAnalyzing={isAnalyzing || cooldown}
              onRefresh={handleRefresh}
            />

            {events.length === 0 ? (
              <EmptyStateCard
                icon={<BarChart2 className="w-8 h-8 text-indigo-300" />}
                title="Log activities to score your routine"
              />
            ) : !routineRecord ? (
              <div className="glass-card p-8 text-center flex-grow flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Generating routine analysis…</p>
              </div>
            ) : (
              <>
                <RoutineScoreCard routineRecord={routineRecord} />

                <RoutineFeedbackCard routineRecord={routineRecord} />

                <DayPlanCard suggestions={suggestions} />
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Floating AI Coach Chatbox */}
      <AiAgentChat apiUrl={API} />
    </div>
  );
}
