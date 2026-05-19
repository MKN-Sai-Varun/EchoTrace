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
          className="glass-card p-4 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200/60"
        >
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Sun className="w-3 h-3" /> Now
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {timeOfDaySuggestion}
          </p>
        </motion.div>
      )}
      {personalizedTip && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/90 border border-amber-200/60"
        >
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Star className="w-3 h-3" /> Tip
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {personalizedTip}
          </p>
        </motion.div>
      )}
    </div>
  );
}
