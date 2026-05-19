"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type HistoryItem = {
  date: string;
  score: number;
  routineScore: number;
};

type ScoreHistoryCardProps = {
  scoreHistory: HistoryItem[];
  scoreTrend: "improving" | "declining" | "stable";
};

export default function ScoreHistoryCard({
  scoreHistory,
  scoreTrend,
}: ScoreHistoryCardProps) {
  const maxScore = Math.max(...scoreHistory.map((h) => h.score), 1);

  const trendIcon =
    scoreTrend === "improving" ? (
      <TrendingUp className="w-4 h-4 text-emerald-500" />
    ) : scoreTrend === "declining" ? (
      <TrendingDown className="w-4 h-4 text-rose-500" />
    ) : (
      <Minus className="w-4 h-4 text-slate-400" />
    );

  const trendColor =
    scoreTrend === "improving"
      ? "text-emerald-600"
      : scoreTrend === "declining"
      ? "text-rose-600"
      : "text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> 14-Day Score History
        </h3>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}
        >
          {trendIcon} <span className="capitalize">{scoreTrend}</span>
        </div>
      </div>
      {scoreHistory.length > 0 ? (
        <div className="flex items-end gap-1.5 h-24">
          {scoreHistory.map((day, i) => {
            const h = Math.max((day.score / maxScore) * 100, 4);
            const barColor =
              day.score >= 70
                ? "bg-emerald-400"
                : day.score >= 40
                ? "bg-amber-400"
                : "bg-rose-400";
            const d = new Date(day.date);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}: ${day.score}`}
              >
                <div
                  className="w-full flex flex-col justify-end"
                  style={{ height: "80px" }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                    className={`w-full rounded-t-sm ${barColor} opacity-80 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
                <span className="text-[8px] text-slate-400 font-medium">
                  {d.toLocaleDateString("en-US", { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-6">
          Log events for a few days to see your trend
        </p>
      )}
    </motion.div>
  );
}
export { TrendingUp };
