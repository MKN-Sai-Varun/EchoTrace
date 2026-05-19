"use client";

import { motion } from "framer-motion";
import {
  Activity, ArrowLeft, TrendingUp, TrendingDown, Minus,
  Brain, Star, Calendar, Zap, BarChart2, Award,
  CheckCircle2, Target, User,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const API = "http://localhost:3000";

type ProfileStats = {
  avgScore: number;
  bestScore: number;
  totalEvents: number;
  activeDays: number;
  avgRoutineScore: number;
  dominantMindset: string;
  scoreTrend: "improving" | "declining" | "stable";
  topCategories: { category: string; totalCount: number; avgPerDay: number }[];
  balanceAvg: { physical: number; mental: number; social: number; recovery: number };
  scoreHistory: { date: string; score: number; routineScore: number }[];
  mindsetCounts: Record<string, number>;
};

type UserInfo = {
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
};

const MINDSET_CFG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  focused:    { emoji: "🎯", label: "Focused",    color: "text-blue-700",    bg: "bg-blue-100" },
  scattered:  { emoji: "🌀", label: "Scattered",  color: "text-amber-700",   bg: "bg-amber-100" },
  relaxed:    { emoji: "😌", label: "Relaxed",    color: "text-teal-700",    bg: "bg-teal-100" },
  stressed:   { emoji: "😤", label: "Stressed",   color: "text-rose-700",    bg: "bg-rose-100" },
  balanced:   { emoji: "⚖️", label: "Balanced",   color: "text-emerald-700", bg: "bg-emerald-100" },
  social:     { emoji: "🤝", label: "Social",     color: "text-orange-700",  bg: "bg-orange-100" },
  creative:   { emoji: "🎨", label: "Creative",   color: "text-violet-700",  bg: "bg-violet-100" },
  recovering: { emoji: "🌱", label: "Recovering", color: "text-green-700",   bg: "bg-green-100" },
  unknown:    { emoji: "🔍", label: "Unknown",    color: "text-slate-500",   bg: "bg-slate-100" },
};

const CAT_COLORS: Record<string, string> = {
  work: "bg-blue-500", health: "bg-emerald-500", social: "bg-orange-500",
  learning: "bg-purple-500", food: "bg-yellow-500", entertainment: "bg-pink-500",
  personal: "bg-cyan-500", recovery: "bg-teal-500", creative: "bg-violet-500",
  uncategorized: "bg-slate-400",
};

function getPersonalityType(stats: ProfileStats): { type: string; description: string; traits: string[] } {
  const { topCategories, dominantMindset, avgScore, balanceAvg } = stats;
  const topCat = topCategories[0]?.category?.toLowerCase() ?? "";

  if (dominantMindset === "focused" && topCat === "work") {
    return {
      type: "The Deep Worker",
      description: "You thrive in focused, high-output sessions. Your days are structured around meaningful work and you rarely let distractions derail you.",
      traits: ["High focus capacity", "Goal-oriented", "Disciplined", "Productive"],
    };
  }
  if (dominantMindset === "creative" || topCat === "creative") {
    return {
      type: "The Creator",
      description: "Your mind is always building something. You find energy in making things — whether that's writing, designing, or problem-solving.",
      traits: ["Imaginative", "Expressive", "Flow-state seeker", "Idea-driven"],
    };
  }
  if (dominantMindset === "social" || topCat === "social") {
    return {
      type: "The Connector",
      description: "People energize you. Your best days involve meaningful conversations, collaboration, and shared experiences.",
      traits: ["Empathetic", "Collaborative", "Communicative", "Relationship-focused"],
    };
  }
  if (topCat === "health" || balanceAvg.physical > 60) {
    return {
      type: "The Optimizer",
      description: "You treat your body and mind as systems to improve. Health, recovery, and performance are central to how you structure your days.",
      traits: ["Health-conscious", "Disciplined", "Long-term thinker", "Self-aware"],
    };
  }
  if (topCat === "learning") {
    return {
      type: "The Learner",
      description: "Curiosity drives you. You consistently invest time in growing your knowledge and skills, treating every day as a chance to improve.",
      traits: ["Curious", "Growth-minded", "Reflective", "Knowledge-seeker"],
    };
  }
  if (dominantMindset === "relaxed" || dominantMindset === "recovering") {
    return {
      type: "The Restorer",
      description: "You understand the value of recovery. You balance effort with rest, and your calm approach helps you sustain energy over time.",
      traits: ["Balanced", "Mindful", "Sustainable", "Self-caring"],
    };
  }
  if (avgScore >= 70) {
    return {
      type: "The All-Rounder",
      description: "You maintain strong performance across multiple areas of life. Your variety and consistency make you adaptable and well-rounded.",
      traits: ["Versatile", "Consistent", "Balanced", "Resilient"],
    };
  }
  return {
    type: "The Explorer",
    description: "You're still discovering your rhythm. Each day brings new patterns — keep logging and your true nature will emerge.",
    traits: ["Open-minded", "Adaptable", "Curious", "Evolving"],
  };
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
        <span className="capitalize">{label}</span><span>{value}/100</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9 }}
          className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser]       = useState<UserInfo | null>(null);
  const [stats, setStats]     = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, statsRes] = await Promise.all([
          fetch(`${API}/api/auth/me`, { credentials: "include" }),
          fetch(`${API}/api/analysis/profile-stats`, { credentials: "include" }),
        ]);
        if (!meRes.ok) { window.location.href = "/auth"; return; }
        setUser(await meRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch { window.location.href = "/auth"; }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const personality = stats ? getPersonalityType(stats) : null;
  const dominantMindsetCfg = MINDSET_CFG[stats?.dominantMindset ?? "unknown"] ?? MINDSET_CFG.unknown;
  const trendIcon = stats?.scoreTrend === "improving"
    ? <TrendingUp className="w-4 h-4 text-emerald-500" />
    : stats?.scoreTrend === "declining"
    ? <TrendingDown className="w-4 h-4 text-rose-500" />
    : <Minus className="w-4 h-4 text-slate-400" />;
  const trendColor = stats?.scoreTrend === "improving" ? "text-emerald-600"
    : stats?.scoreTrend === "declining" ? "text-rose-600" : "text-slate-500";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const maxScore = Math.max(...(stats?.scoreHistory.map(h => h.score) ?? [1]), 1);

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">

      {/* Header */}
      <header className="flex items-center justify-between mb-8 glass-card px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-800">EchoTrace</h1>
        </div>
        <Link href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Identity card ── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Avatar + name */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
              {user?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-0.5">
              {user?.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : user?.username}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-1">@{user?.username}</p>
            {user?.email && <p className="text-xs text-slate-400">{user.email}</p>}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Member since {joinDate}
            </div>
          </motion.div>

          {/* Personality type */}
          {personality && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="glass-card p-5 bg-gradient-to-br from-violet-50/80 to-indigo-50/80 border border-violet-200/60">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Personality Type
              </p>
              <h3 className="text-lg font-black text-slate-800 mb-2">{personality.type}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{personality.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {personality.traits.map(t => (
                  <span key={t} className="text-[10px] font-bold px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full">{t}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dominant mindset */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className={`glass-card p-5 border ${dominantMindsetCfg.bg}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Dominant Mindset (30 days)
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{dominantMindsetCfg.emoji}</span>
              <div>
                <p className={`text-base font-black capitalize ${dominantMindsetCfg.color}`}>{dominantMindsetCfg.label}</p>
                {stats && Object.keys(stats.mindsetCounts).length > 0 && (
                  <p className="text-xs text-slate-400">
                    {stats.mindsetCounts[stats.dominantMindset] ?? 0} days recorded
                  </p>
                )}
              </div>
            </div>
            {/* Mindset frequency bars */}
            {stats && Object.keys(stats.mindsetCounts).length > 1 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {Object.entries(stats.mindsetCounts)
                  .sort((a, b) => b[1] - a[1]).slice(0, 4)
                  .map(([state, count]) => {
                    const cfg = MINDSET_CFG[state] ?? MINDSET_CFG.unknown;
                    const maxCount = Math.max(...Object.values(stats.mindsetCounts));
                    return (
                      <div key={state} className="flex items-center gap-2">
                        <span className="text-sm w-5">{cfg.emoji}</span>
                        <div className="flex-grow h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }}
                            transition={{ duration: 0.7 }} className={`h-full rounded-full ${cfg.bg.replace("bg-", "bg-").replace("-100", "-400")}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-4">{count}d</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT: Stats ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Key stats grid */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Avg Score",    value: stats?.avgScore ?? 0,        icon: <Star className="w-4 h-4 text-amber-500" />,    suffix: "/100" },
              { label: "Best Score",   value: stats?.bestScore ?? 0,       icon: <Award className="w-4 h-4 text-emerald-500" />, suffix: "/100" },
              { label: "Active Days",  value: stats?.activeDays ?? 0,      icon: <Calendar className="w-4 h-4 text-blue-500" />, suffix: " days" },
              { label: "Total Logs",   value: stats?.totalEvents ?? 0,     icon: <Zap className="w-4 h-4 text-violet-500" />,   suffix: "" },
            ].map(({ label, value, icon, suffix }) => (
              <div key={label} className="glass-card p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs font-bold text-slate-500">{label}</span></div>
                <p className="text-2xl font-black text-slate-800">{value}<span className="text-xs font-semibold text-slate-400">{suffix}</span></p>
              </div>
            ))}
          </motion.div>

          {/* Score trend + routine score */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> 14-Day Score History
              </h3>
              <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
                {trendIcon} {stats?.scoreTrend ?? "stable"}
              </div>
            </div>
            {stats?.scoreHistory && stats.scoreHistory.length > 0 ? (
              <div className="flex items-end gap-1.5 h-24">
                {stats.scoreHistory.map((day, i) => {
                  const h = Math.max((day.score / maxScore) * 100, 4);
                  const barColor = day.score >= 70 ? "bg-emerald-400" : day.score >= 40 ? "bg-amber-400" : "bg-rose-400";
                  const d = new Date(day.date);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${day.score}`}>
                      <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.6, delay: i * 0.04 }}
                          className={`w-full rounded-t-sm ${barColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <span className="text-[8px] text-slate-400 font-medium">
                        {d.toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Log events for a few days to see your trend</p>
            )}
          </motion.div>

          {/* Life balance */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Life Balance (30-day avg)
            </h3>
            <div className="flex flex-col gap-3">
              <ScoreBar label="Physical"  value={stats?.balanceAvg.physical  ?? 0} color="bg-emerald-400" />
              <ScoreBar label="Mental"    value={stats?.balanceAvg.mental    ?? 0} color="bg-blue-400" />
              <ScoreBar label="Social"    value={stats?.balanceAvg.social    ?? 0} color="bg-orange-400" />
              <ScoreBar label="Recovery"  value={stats?.balanceAvg.recovery  ?? 0} color="bg-teal-400" />
            </div>
          </motion.div>

          {/* Top categories */}
          {stats?.topCategories && stats.topCategories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Top Activities (30 days)
              </h3>
              <div className="flex flex-col gap-2.5">
                {stats.topCategories.map((cat, i) => {
                  const maxCount = stats.topCategories[0].totalCount;
                  const barColor = CAT_COLORS[cat.category.toLowerCase()] ?? "bg-slate-400";
                  return (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                      <div className="flex-grow">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span className="capitalize">{cat.category}</span>
                          <span className="text-slate-400">{cat.totalCount} logs · {cat.avgPerDay}/day</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.totalCount / maxCount) * 100}%` }}
                            transition={{ duration: 0.7, delay: i * 0.07 }}
                            className={`h-full rounded-full ${barColor}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Routine score */}
          {(stats?.avgRoutineScore ?? 0) > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-card p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.2)]">
                <span className="text-xl font-black text-slate-800">{stats?.avgRoutineScore}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">Avg Routine Score</p>
                <p className="text-sm font-semibold text-slate-700">30-day average</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(stats?.avgRoutineScore ?? 0) >= 70 ? "Excellent consistency 🌟" :
                   (stats?.avgRoutineScore ?? 0) >= 50 ? "Good foundation, keep building" :
                   "Room to grow — stay consistent"}
                </p>
              </div>
              <Target className="w-8 h-8 text-indigo-300 ml-auto" />
            </motion.div>
          )}

          {/* No data state */}
          {!stats || stats.activeDays === 0 && (
            <div className="glass-card p-8 text-center">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No data yet</p>
              <p className="text-xs text-slate-400 mt-1">Start logging events on the dashboard to build your profile</p>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-blue-600 hover:underline">
                Go to Dashboard <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
