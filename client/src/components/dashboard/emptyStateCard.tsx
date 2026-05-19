"use client";

import { motion } from "framer-motion";

type EmptyStateCardProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  delay?: number;
};

export default function EmptyStateCard({
  icon,
  title,
  description,
  delay = 0.2,
}: EmptyStateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 flex flex-col items-center text-center gap-3 flex-grow justify-center min-h-[220px]"
    >
      <div className="flex justify-center items-center">{icon}</div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </motion.div>
  );
}
