"use client";

import { motion } from "framer-motion";
import {
  Coffee,
  Lightbulb,
  Moon,
  Sparkles,
  Sun,
  Sunset,
  TrendingUp,
} from "lucide-react";

type SuggestionsType = {
  immediate?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  night?: string;
  weeklyGoal?: string;
};

type DayPlanCardProps = {
  suggestions?: SuggestionsType;
};

export default function DayPlanCard({ suggestions }: DayPlanCardProps) {
  if (!suggestions) return null;

  const items = [
    {
      key: "immediate" as const,
      label: "Right Now",
      icon: <Sparkles className="w-3.5 h-3.5 text-violet-500" />,
    },
    {
      key: "morning" as const,
      label: "Morning",
      icon: <Coffee className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      key: "afternoon" as const,
      label: "Afternoon",
      icon: <Sun className="w-3.5 h-3.5 text-orange-500" />,
    },
    {
      key: "evening" as const,
      label: "Evening",
      icon: <Sunset className="w-3.5 h-3.5 text-rose-500" />,
    },
    {
      key: "night" as const,
      label: "Night",
      icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
    },
  ];

  const hasAnySuggestion = items.some(({ key }) => !!suggestions[key]);
  if (!hasAnySuggestion && !suggestions.weeklyGoal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" /> Your Day Plan
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map(({ key, label, icon }) => {
          const text = suggestions[key];
          if (!text) return null;
          return (
            <div
              key={key}
              className="flex gap-2 items-start p-3 bg-white/60 rounded-xl border border-white/80"
            >
              <div className="shrink-0 mt-0.5">{icon}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {text}
                </p>
              </div>
            </div>
          );
        })}
        {suggestions.weeklyGoal && (
          <div className="flex gap-2 items-start p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 sm:col-span-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">
                Weekly Goal
              </p>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                {suggestions.weeklyGoal}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
