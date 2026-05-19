"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type CategoryTrend = {
  category: string;
  totalCount: number;
  avgPerDay: number;
};

type TopActivitiesCardProps = {
  topCategories: CategoryTrend[];
};

const CAT_COLORS: Record<string, string> = {
  work: "bg-blue-500",
  health: "bg-emerald-500",
  social: "bg-orange-500",
  learning: "bg-purple-500",
  food: "bg-yellow-500",
  entertainment: "bg-pink-500",
  personal: "bg-cyan-500",
  recovery: "bg-teal-500",
  creative: "bg-violet-500",
  uncategorized: "bg-slate-400",
};

export default function TopActivitiesCard({
  topCategories,
}: TopActivitiesCardProps) {
  if (topCategories.length === 0) return null;

  const maxCount = topCategories[0].totalCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Top Activities (30
        days)
      </h3>
      <div className="flex flex-col gap-2.5">
        {topCategories.map((cat, i) => {
          const barColor =
            CAT_COLORS[cat.category.toLowerCase()] ?? "bg-slate-400";
          return (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-4">
                #{i + 1}
              </span>
              <div className="flex-grow">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span className="capitalize">{cat.category}</span>
                  <span className="text-slate-400">
                    {cat.totalCount} logs · {cat.avgPerDay}/day
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.totalCount / maxCount) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.07 }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
