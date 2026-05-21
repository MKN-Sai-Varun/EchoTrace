"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

// Extracted Components
import ProfileHeader from "@/components/profile/profileHeader";
import IdentityCard from "@/components/profile/identityCard";
import PersonalityCard from "@/components/profile/personalityCard";
import MindsetOverviewCard from "@/components/profile/mindsetOverviewCard";
import KeyStatsGrid from "@/components/profile/keyStatsGrid";
import ScoreHistoryCard from "@/components/profile/scoreHistoryCard";
import LifeBalanceCard from "@/components/profile/lifeBalanceCard";
import TopActivitiesCard from "@/components/profile/topActivitiesCard";
import AvgRoutineScoreCard from "@/components/profile/avgRoutineScoreCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  customCursor: boolean;
  createdAt: string;
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
        if (!meRes.ok) {
          window.location.href = "/auth";
          return;
        }
        const meData = await meRes.json();
        setUser(meData);
        if (meData.customCursor !== undefined) {
          localStorage.setItem("customCursor", meData.customCursor ? "true" : "false");
          window.dispatchEvent(new Event("customCursorToggle"));
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch {
        window.location.href = "/auth";
      } finally {
        setLoading(false);
      }
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

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <ProfileHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Identity & Personality */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <IdentityCard user={user} />

          {/* Preferences Card */}
          <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferences</h3>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">Custom Cursor</p>
                <p className="text-xs text-slate-400 mt-0.5">Enable EchoTrace's interactive magnetic cursor</p>
              </div>
              <button
                onClick={async () => {
                  if (!user) return;
                  const newValue = !user.customCursor;
                  try {
                    const res = await fetch(`${API}/api/auth/preferences`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ customCursor: newValue }),
                    });
                    if (res.ok) {
                      setUser({ ...user, customCursor: newValue });
                      localStorage.setItem("customCursor", newValue ? "true" : "false");
                      window.dispatchEvent(new Event("customCursorToggle"));
                    }
                  } catch (e) {
                    console.error("Failed to update cursor settings", e);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  user?.customCursor ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
                aria-label="Toggle custom cursor"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    user?.customCursor ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <PersonalityCard personality={personality} />

          {stats && (
            <MindsetOverviewCard
              dominantMindset={stats.dominantMindset}
              mindsetCounts={stats.mindsetCounts}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Statistics & Trends */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {stats && (
            <KeyStatsGrid
              avgScore={stats.avgScore}
              bestScore={stats.bestScore}
              activeDays={stats.activeDays}
              totalEvents={stats.totalEvents}
            />
          )}

          {stats && (
            <ScoreHistoryCard
              scoreHistory={stats.scoreHistory}
              scoreTrend={stats.scoreTrend}
            />
          )}

          {stats && <LifeBalanceCard balanceAvg={stats.balanceAvg} />}

          {stats && <TopActivitiesCard topCategories={stats.topCategories} />}

          {stats && <AvgRoutineScoreCard avgRoutineScore={stats.avgRoutineScore} />}

          {/* No data state fallback */}
          {(!stats || stats.activeDays === 0) && (
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
