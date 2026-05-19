"use client";

import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";

type LifeBalanceCardProps = {
  balanceAvg: {
    physical: number;
    mental: number;
    social: number;
    recovery: number;
  };
};

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
        <span className="capitalize">{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function LifeBalanceCard({ balanceAvg }: LifeBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-500" /> Life Balance (30-day avg)
      </h3>
      <div className="flex flex-col gap-3">
        <ScoreBar
          label="Physical"
          value={balanceAvg.physical}
          color="bg-emerald-400"
        />
        <ScoreBar label="Mental" value={balanceAvg.mental} color="bg-blue-400" />
        <ScoreBar
          label="Social"
          value={balanceAvg.social}
          color="bg-orange-400"
        />
        <ScoreBar
          label="Recovery"
          value={balanceAvg.recovery}
          color="bg-teal-400"
        />
      </div>
    </motion.div>
  );
}
