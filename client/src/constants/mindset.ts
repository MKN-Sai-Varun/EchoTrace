import { MindsetState } from "@/types/analysis";

type MindsetConfig = {
  emoji: string;
  color: string;
  bg: string;
  border: string;
};

export const MINDSET_CFG: Record<
  MindsetState,
  MindsetConfig
> = {
  focused: {
    emoji: "🎯",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/45",
    border: "border-blue-200 dark:border-blue-800/50",
  },

  scattered: {
    emoji: "🌀",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/45",
    border: "border-amber-200 dark:border-amber-800/50",
  },

  relaxed: {
    emoji: "😌",
    color: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/45",
    border: "border-teal-200 dark:border-teal-800/50",
  },

  stressed: {
    emoji: "😤",
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/45",
    border: "border-rose-200 dark:border-rose-800/50",
  },

  balanced: {
    emoji: "⚖️",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/45",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },

  social: {
    emoji: "🤝",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/45",
    border: "border-orange-200 dark:border-orange-800/50",
  },

  creative: {
    emoji: "🎨",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/45",
    border: "border-violet-200 dark:border-violet-800/50",
  },

  recovering: {
    emoji: "🌱",
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 dark:bg-green-950/45",
    border: "border-green-200 dark:border-green-800/50",
  },

  unknown: {
    emoji: "🔍",
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700/50",
  },
};