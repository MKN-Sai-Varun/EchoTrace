"use client";

import { motion } from "framer-motion";
import { Brain, Lightbulb } from "lucide-react";

import { MINDSET_CFG } from "@/constants/mindset";
import { Mindset } from "@/types/analysis";

type MindsetCardProps = {
  mindset: Mindset;
};

export default function MindsetCard({
  mindset,
}: MindsetCardProps) {
  const mindsetCfg =
    MINDSET_CFG[mindset.state] ??
    MINDSET_CFG.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`glass-card p-5 border ${mindsetCfg.border} ${mindsetCfg.bg}`}
    >
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Brain className="w-3.5 h-3.5" />
        Mindset
      </p>

      <div className="flex items-start gap-3 mb-2">
        <span className="text-3xl leading-none">
          {mindsetCfg.emoji}
        </span>

        <div>
          <p
            className={`text-lg font-black capitalize ${mindsetCfg.color}`}
          >
            {mindset.state}
          </p>

          <p className="text-xs text-slate-400">
            {mindset.confidence}% confidence
          </p>
        </div>
      </div>

      {mindset.description && (
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          {mindset.description}
        </p>
      )}

      {mindset.suggestion && (
        <div className="flex gap-2 items-start p-2.5 bg-white/70 rounded-lg border border-white/80">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />

          <p className="text-xs font-medium text-slate-700">
            {mindset.suggestion}
          </p>
        </div>
      )}
    </motion.div>
  );
}