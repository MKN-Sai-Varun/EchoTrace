"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

type MINDSET_CFG_Type = Record<
  string,
  { emoji: string; label: string; color: string; bg: string }
>;

const MINDSET_CFG: MINDSET_CFG_Type = {
  focused: {
    emoji: "🎯",
    label: "Focused",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  scattered: {
    emoji: "🌀",
    label: "Scattered",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  relaxed: {
    emoji: "😌",
    label: "Relaxed",
    color: "text-teal-700",
    bg: "bg-teal-100",
  },
  stressed: {
    emoji: "😤",
    label: "Stressed",
    color: "text-rose-700",
    bg: "bg-rose-100",
  },
  balanced: {
    emoji: "⚖️",
    label: "Balanced",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  social: {
    emoji: "🤝",
    label: "Social",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  creative: {
    emoji: "🎨",
    label: "Creative",
    color: "text-violet-700",
    bg: "bg-violet-100",
  },
  recovering: {
    emoji: "🌱",
    label: "Recovering",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  unknown: {
    emoji: "🔍",
    label: "Unknown",
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
};

type MindsetOverviewCardProps = {
  dominantMindset: string;
  mindsetCounts: Record<string, number>;
};

export default function MindsetOverviewCard({
  dominantMindset,
  mindsetCounts,
}: MindsetOverviewCardProps) {
  const dominantMindsetCfg =
    MINDSET_CFG[dominantMindset] ?? MINDSET_CFG.unknown;
  const mindsetList = Object.entries(mindsetCounts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className={`glass-card p-5 border ${dominantMindsetCfg.bg}`}
    >
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Brain className="w-3.5 h-3.5" /> Dominant Mindset (30 days)
      </p>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{dominantMindsetCfg.emoji}</span>
        <div>
          <p
            className={`text-base font-black capitalize ${dominantMindsetCfg.color}`}
          >
            {dominantMindsetCfg.label}
          </p>
          {mindsetList.length > 0 && (
            <p className="text-xs text-slate-400">
              {mindsetCounts[dominantMindset] ?? 0} days recorded
            </p>
          )}
        </div>
      </div>
      {mindsetList.length > 1 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {mindsetList
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([state, count]) => {
              const cfg = MINDSET_CFG[state] ?? MINDSET_CFG.unknown;
              const maxCount = Math.max(...Object.values(mindsetCounts));
              return (
                <div key={state} className="flex items-center gap-2">
                  <span className="text-sm w-5">{cfg.emoji}</span>
                  <div className="flex-grow h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.7 }}
                      className={`h-full rounded-full ${cfg.bg
                        .replace("bg-", "bg-")
                        .replace("-100", "-400")}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 w-4">
                    {count}d
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </motion.div>
  );
}
export { MINDSET_CFG };
