"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star, Target } from "lucide-react";
import { RoutineRecord } from "@/types/routine";

type RoutineFeedbackCardProps = {
  routineRecord: RoutineRecord;
};

export default function RoutineFeedbackCard({
  routineRecord,
}: RoutineFeedbackCardProps) {
  const hasStrengths = routineRecord.strengths?.length > 0;
  const hasWeaknesses = routineRecord.weaknesses?.length > 0;
  const hasImprovement = !!routineRecord.improvement;

  if (!hasStrengths && !hasWeaknesses && !hasImprovement) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card p-5"
    >
      {hasStrengths && (
        <div className="mb-4">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
            ✅ Strengths
          </p>
          <div className="flex flex-col gap-1.5">
            {routineRecord.strengths.map((s, i) => (
              <div
                key={i}
                className="flex gap-2 items-start p-2.5 bg-emerald-50 rounded-lg border border-emerald-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-700">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasWeaknesses && (
        <div className="mb-4">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">
            ⚠️ Areas to Improve
          </p>
          <div className="flex flex-col gap-1.5">
            {routineRecord.weaknesses.map((w, i) => (
              <div
                key={i}
                className="flex gap-2 items-start p-2.5 bg-rose-50 rounded-lg border border-rose-100"
              >
                <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-700">{w}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasImprovement && (
        <div className="flex gap-2.5 items-start p-3 bg-amber-50 rounded-xl border border-amber-200">
          <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">
              Tomorrow&apos;s Focus
            </p>
            <p className="text-xs font-medium text-slate-700">
              {routineRecord.improvement}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
