"use client";

import { motion } from "framer-motion";
import { Plus, Zap } from "lucide-react";

type EventInputProps = {
  eventInput: string;
  setEventInput: React.Dispatch<React.SetStateAction<string>>;
  isLogging: boolean;
  handleAddEvent: (e: React.FormEvent) => Promise<void>;
};

export default function EventInput({
  eventInput,
  setEventInput,
  isLogging,
  handleAddEvent,
}: EventInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <h2 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
        <Plus className="w-4 h-4 text-blue-500" />
        Log Activity
      </h2>

      <form onSubmit={handleAddEvent} className="flex gap-3">
        <input
          type="text"
          value={eventInput}
          onChange={(e) => setEventInput(e.target.value)}
          placeholder="What are you doing right now?"
          className="glass-input flex-grow py-3.5 px-4 text-sm"
        />

        <button
          type="submit"
          disabled={isLogging}
          className="btn-primary px-6 text-sm font-bold shadow-md shadow-blue-500/20 min-w-[80px] flex items-center justify-center"
        >
          {isLogging ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4 mr-1" />
              Log
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}