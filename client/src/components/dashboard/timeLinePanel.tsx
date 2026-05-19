"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";

import { EventItem } from "@/types/event";

type TimelinePanelProps = {
  events: EventItem[];
  isLoading: boolean;
  deletingId: string | null;
  onDelete: (index: number) => void;
};

export default function TimelinePanel({
  events,
  isLoading,
  deletingId,
  onDelete,
}: TimelinePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="glass-card p-5 flex-grow"
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Today&apos;s Timeline
        </h2>

        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {events.length}{" "}
          {events.length === 1 ? "activity" : "activities"}
        </span>
      </div>

      <div className="flex flex-col gap-3 relative">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 rounded-xl animate-pulse"
            />
          ))
        ) : events.length > 0 ? (
          <>
            <div className="absolute left-[60px] top-6 bottom-6 w-px bg-slate-200 z-0" />

            <AnimatePresence>
              {events.map((item, i) => (
                <motion.div
                  key={item._id ?? `${item.label}-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 shrink-0 text-right">
                    <span className="text-[10px] font-bold text-slate-400">
                      {item.time.split(" ")[0]}
                    </span>
                  </div>

                  <div
                    className={`w-2.5 h-2.5 rounded-full z-10 border-2 border-white shrink-0 ${item.dot} shadow-sm`}
                  />

                  <div className="flex-grow glass-card px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/90 transition-colors min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {item.label}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${item.color}`}
                      >
                        {item.category}
                      </span>

                      <button
                        onClick={() => onDelete(i)}
                        disabled={deletingId === item._id}
                        aria-label="Delete event"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                        title="Remove"
                      >
                        {deletingId === item._id ? (
                          <div className="w-3.5 h-3.5 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>

            <p className="text-sm font-semibold text-slate-500">
              No activities logged yet
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Start by typing what you&apos;re doing above
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}