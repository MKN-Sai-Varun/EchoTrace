"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

type PersonalityType = {
  type: string;
  description: string;
  traits: string[];
};

type PersonalityCardProps = {
  personality: PersonalityType | null;
};

export default function PersonalityCard({ personality }: PersonalityCardProps) {
  if (!personality) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="glass-card p-5 border border-violet-200/60 dark:border-violet-800/40 bg-violet-100 dark:bg-violet-950/40"
    >
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" /> Personality Type
      </p>
      <h3 className="text-lg font-black text-slate-800 mb-2">
        {personality.type}
      </h3>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        {personality.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {personality.traits.map((t) => (
          <span
            key={t}
            className="text-[10px] font-bold px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}