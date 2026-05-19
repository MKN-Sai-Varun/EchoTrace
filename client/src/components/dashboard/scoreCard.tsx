"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { EventItem } from "@/types/event";

type ScoreCardProps = {
  displayScore: number;
  scoreColor: string;

  events: EventItem[];

  usingAi: boolean;
  isAnalyzing: boolean;

  onRefresh: () => void;
};

export default function ScoreCard({
  displayScore,
  scoreColor,
  events,
  usingAi,
  isAnalyzing,
  onRefresh,
}: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-6 flex flex-col items-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-violet-500" />

      <div className="flex items-center justify-between w-full mb-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Daily Score
        </h2>

        {events.length > 0 && (
          <button
            onClick={onRefresh}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isAnalyzing ? "animate-spin" : ""
              }`}
            />

            {isAnalyzing ? "Analyzing…" : "Re-analyze"}
          </button>
        )}
      </div>

      <div
        className={`w-36 h-36 rounded-full border-8 flex items-center justify-center mb-5 relative ${scoreColor}`}
      >
        <div className="absolute inset-2 border-2 border-dashed border-current opacity-20 rounded-full animate-[spin_10s_linear_infinite]" />

        <motion.span
          key={displayScore}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black text-slate-800 relative z-10"
        >
          {isAnalyzing ? (
            <div className="w-8 h-8 border-[3px] border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            displayScore
          )}
        </motion.span>
      </div>

      <p className="text-sm font-medium text-slate-500 text-center">
        {events.length === 0
          ? "Log an event to get started"
          : usingAi
          ? "AI-powered score"
          : `Estimated from ${events.length} activities`}
      </p>
    </motion.div>
  );
}