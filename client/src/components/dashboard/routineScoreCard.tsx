"use client";

import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { RoutineRecord } from "@/types/routine";

type RoutineScoreCardProps = {
  routineRecord: RoutineRecord;
};

export default function RoutineScoreCard({
  routineRecord,
}: RoutineScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-500" /> Routine Score
      </h3>
      <div className="flex items-center gap-5 mb-5">
        <div className="w-20 h-20 rounded-full border-[6px] border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <span className="text-2xl font-black text-slate-800">
            {routineRecord.routineScore}
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-indigo-600">
              {routineRecord.grade}
            </span>
            <span className="text-xs text-slate-400">grade</span>
          </div>
          {routineRecord.consistency && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">
              {routineRecord.consistency}
            </p>
          )}
        </div>
      </div>
      {routineRecord.balanceBreakdown && (
        <div className="flex flex-col gap-2">
          {(
            Object.entries(routineRecord.balanceBreakdown) as [string, number][]
          ).map(([key, val]) => {
            const c =
              key === "physical"
                ? "bg-emerald-400"
                : key === "mental"
                ? "bg-blue-400"
                : key === "social"
                ? "bg-orange-400"
                : "bg-teal-400";
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 capitalize w-14 shrink-0">
                  {key}
                </span>
                <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${c}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 w-6 text-right">
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
