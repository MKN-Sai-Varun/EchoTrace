"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";

type AvgRoutineScoreCardProps = {
  avgRoutineScore: number;
};

export default function AvgRoutineScoreCard({
  avgRoutineScore,
}: AvgRoutineScoreCardProps) {
  if (avgRoutineScore <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card p-5 flex items-center gap-5"
    >
      <div className="w-16 h-16 rounded-full border-4 border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.2)]">
        <span className="text-xl font-black text-slate-800">
          {avgRoutineScore}
        </span>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">
          Avg Routine Score
        </p>
        <p className="text-sm font-semibold text-slate-700">30-day average</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {avgRoutineScore >= 70
            ? "Excellent consistency 🌟"
            : avgRoutineScore >= 50
            ? "Good foundation, keep building"
            : "Room to grow — stay consistent"}
        </p>
      </div>
      <Target className="w-8 h-8 text-indigo-300 ml-auto" />
    </motion.div>
  );
}
