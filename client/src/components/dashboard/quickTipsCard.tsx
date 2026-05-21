"use client";

import { motion } from "framer-motion";
import { Star, Sun } from "lucide-react";

type QuickTipsCardProps = {
  timeOfDaySuggestion?: string;
  personalizedTip?: string;
};

export default function QuickTipsCard({
  timeOfDaySuggestion,
  personalizedTip,
}: QuickTipsCardProps) {
  if (!timeOfDaySuggestion && !personalizedTip) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {timeOfDaySuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="rounded-2xl p-4 border"
          style={{
            background: "var(--tip-now-bg, linear-gradient(135deg, #bfdbfe, #c7d2fe))",
            borderColor: "rgba(96,165,250,0.5)",
          }}
        >
          <p
            className="text-xs font-extrabold uppercase tracking-wide mb-1.5 flex items-center gap-1"
            style={{ color: "var(--tip-label-color, #1e3a8a)" }}
          >
            <Sun className="w-3 h-3" /> Now
          </p>
          <p
            className="text-xs leading-relaxed font-semibold"
            style={{ color: "var(--tip-body-color, #0f172a)" }}
          >
            {timeOfDaySuggestion}
          </p>
        </motion.div>
      )}
      {personalizedTip && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4 border"
          style={{
            background: "var(--tip-tip-bg, linear-gradient(135deg, #fde68a, #fed7aa))",
            borderColor: "rgba(251,191,36,0.5)",
          }}
        >
          <p
            className="text-xs font-extrabold uppercase tracking-wide mb-1.5 flex items-center gap-1"
            style={{ color: "var(--tip-label-color, #78350f)" }}
          >
            <Star className="w-3 h-3" /> Tip
          </p>
          <p
            className="text-xs leading-relaxed font-semibold"
            style={{ color: "var(--tip-body-color, #0f172a)" }}
          >
            {personalizedTip}
          </p>
        </motion.div>
      )}
    </div>
  );
}
