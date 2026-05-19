"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp } from "lucide-react";

type InsightsCardProps = {
  insights: string[];
  isAnalyzing: boolean;
  usingAi: boolean;
};

export default function InsightsCard({
  insights,
  isAnalyzing,
  usingAi,
}: InsightsCardProps) {
  if (!isAnalyzing && insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-rose-500" />
        {usingAi ? "AI Insights" : "Insights"}
      </h3>
      {isAnalyzing ? (
        [1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-slate-100 animate-pulse mb-2"
          />
        ))
      ) : (
        <div className="flex flex-col gap-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex gap-2.5 items-start p-3 bg-emerald-50/60 rounded-xl border border-emerald-100"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
