"use client";

import { motion } from "framer-motion";
import { Star, Award, Calendar, Zap } from "lucide-react";

type KeyStatsGridProps = {
  avgScore: number;
  bestScore: number;
  activeDays: number;
  totalEvents: number;
};

export default function KeyStatsGrid({
  avgScore,
  bestScore,
  activeDays,
  totalEvents,
}: KeyStatsGridProps) {
  const items = [
    {
      label: "Avg Score",
      value: avgScore,
      icon: <Star className="w-4 h-4 text-amber-500" />,
      suffix: "/100",
    },
    {
      label: "Best Score",
      value: bestScore,
      icon: <Award className="w-4 h-4 text-emerald-500" />,
      suffix: "/100",
    },
    {
      label: "Active Days",
      value: activeDays,
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      suffix: " days",
    },
    {
      label: "Total Logs",
      value: totalEvents,
      icon: <Zap className="w-4 h-4 text-violet-500" />,
      suffix: "",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {items.map(({ label, value, icon, suffix }) => (
        <div key={label} className="glass-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 mb-1">
            {icon}
            <span className="text-xs font-bold text-slate-500">{label}</span>
          </div>
          <p className="text-2xl font-black text-slate-800">
            {value}
            <span className="text-xs font-semibold text-slate-400">
              {suffix}
            </span>
          </p>
        </div>
      ))}
    </motion.div>
  );
}
