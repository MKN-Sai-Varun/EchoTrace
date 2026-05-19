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
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },

  scattered: {
    emoji: "🌀",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },

  relaxed: {
    emoji: "😌",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },

  stressed: {
    emoji: "😤",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },

  balanced: {
    emoji: "⚖️",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },

  social: {
    emoji: "🤝",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },

  creative: {
    emoji: "🎨",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },

  recovering: {
    emoji: "🌱",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },

  unknown: {
    emoji: "🔍",
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
};