"use client";

import { motion } from "framer-motion";
import { Map } from "lucide-react";
import { CAT_COLORS } from "@/constants/colors";

type CategoryItem = {
  name: string;
  percent: number;
};

type CategoryBreakdownCardProps = {
  displayCategories: CategoryItem[];
  isAnalyzing: boolean;
};

export default function CategoryBreakdownCard({
  displayCategories,
  isAnalyzing,
}: CategoryBreakdownCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card p-5 flex-grow"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Map className="w-4 h-4 text-purple-500" /> Activity Breakdown
      </h3>
      {isAnalyzing ? (
        [1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-7 rounded-lg bg-slate-100 animate-pulse mb-2"
          />
        ))
      ) : (
        <div className="flex flex-col gap-3">
          {displayCategories.map((cat, i) => (
            <div key={cat.name}>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>{cat.name}</span>
                <span>{cat.percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percent}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }}
                  className={`h-full rounded-full ${
                    CAT_COLORS[cat.name] ?? "bg-slate-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
