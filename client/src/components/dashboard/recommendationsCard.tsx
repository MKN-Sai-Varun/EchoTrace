"use client";

import { motion } from "framer-motion";
import { ChevronRight, Target } from "lucide-react";

type RecommendationsCardProps = {
  recommendations: string[];
};

export default function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-amber-500" /> Recommendations
      </h3>
      <div className="flex flex-col gap-2">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex gap-2.5 items-start p-3 bg-amber-50/60 rounded-xl border border-amber-100"
          >
            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {rec}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
