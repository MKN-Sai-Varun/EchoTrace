"use client";

import { motion } from "framer-motion";
import { Activity, Plus, TrendingUp, CheckCircle2, Clock, Map, Target } from "lucide-react";
import { useState, useEffect } from "react";

import CustomCursor from "@/components/CustomCursor";

export default function Dashboard() {
  const [eventInput, setEventInput] = useState("");
  const [mounted, setMounted] = useState(false);
  type EventType = {
    time: string;
    label: string;
    category: string;
    color: string;
    dot: string;
  };
  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventInput.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let category = "Uncategorized";
    let color = "bg-slate-100 text-slate-600";
    let dot = "bg-slate-500";
    
    const lowerInput = eventInput.toLowerCase();
    
    // Basic AI-like keyword categorization
    if (/(work|meeting|email|project|cod|call|zoom|sync|review|task|read)/i.test(lowerInput)) {
      category = "Work";
      color = "bg-blue-100 text-blue-600";
      dot = "bg-blue-500";
    } else if (/(run|walk|gym|exercise|workout|water|sleep|lunch|dinner|breakfast|meal|break|health|meditat)/i.test(lowerInput)) {
      category = "Health";
      color = "bg-emerald-100 text-emerald-600";
      dot = "bg-emerald-500";
    } else if (/(friend|chat|hangout|party|family|social|together|date)/i.test(lowerInput)) {
      category = "Social";
      color = "bg-orange-100 text-orange-600";
      dot = "bg-orange-500";
    }

    const newEvent = {
      time: timeString,
      label: eventInput,
      category,
      color,
      dot
    };

    setEvents(prev => [...prev, newEvent]);
    setEventInput("");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full cursor-none">
      <CustomCursor />
      {/* Header */}
      <header className="flex justify-between items-center mb-8 glass-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">EchoTrace</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden sm:block">Good afternoon, Varun</span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-md">
            V
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-grow">
        
        {/* Left Column: Timeline & Input (7 cols on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Input Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> What are you doing right now?
            </h2>
            <form onSubmit={handleAddEvent} className="flex gap-3 relative">
              <input 
                type="text" 
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                placeholder="e.g., Checking emails, taking a walk..." 
                className="glass-input flex-grow py-4 px-5 text-lg"
              />
              <button type="submit" className="btn-primary px-8 text-lg font-semibold shadow-lg shadow-blue-500/30">
                Log
              </button>
            </form>
          </motion.div>

          {/* Timeline Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 flex-grow"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> Today's Timeline
              </h2>
              <span className="text-sm font-medium text-slate-500">{events.length} activities</span>
            </div>

            <div className="flex flex-col gap-4 relative">
              {events.length > 0 ? (
                <>
                  <div className="absolute left-[69px] top-8 bottom-8 w-0.5 bg-slate-200 z-0" />
                  {events.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="w-12 text-right">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{item.time.split(' ')[0]}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full z-10 border-2 border-white ${item.dot} shadow-sm group-hover:scale-125 transition-transform`} />
                  <div className="glass-card p-4 flex-grow border-white/60 hover:bg-white/80 transition-colors flex justify-between items-center">
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.color}`}>
                      {item.category}
                    </span>
                  </div>
                </motion.div>
              ))}
                </>
              ) : (
                <div className="text-center py-10 text-slate-500 font-medium">
                  No activities logged yet. Start typing above!
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Column: Analysis & Insights (5 cols on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Productivity Score Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500" />
            <h2 className="text-lg font-bold text-slate-800 mb-6 w-full text-left">Daily Score</h2>
            
            <div className="w-32 h-32 rounded-full border-8 border-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(52,211,153,0.3)] relative">
              <div className="absolute inset-2 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_10s_linear_infinite]" />
              <span className="text-4xl font-black text-slate-800">{Math.min(100, events.length * 15)}</span>
            </div>
            
            <p className="text-sm font-medium text-slate-500">
              {events.length === 0 ? "Log an event to get started" : `Based on ${events.length} activities`}
            </p>
          </motion.div>

          {/* Conditional Cards */}
          {events.length > 0 && (
            <>
              {/* AI Insights Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" /> AI Insights
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-start p-3 bg-white/50 rounded-xl border border-white/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-700">Great focus today! You've had 2 deep work blocks without interruptions.</p>
                  </div>
                  <div className="flex gap-3 items-start p-3 bg-white/50 rounded-xl border border-white/50">
                    <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-700">You haven't logged any physical activity since morning. A quick walk is recommended.</p>
                  </div>
                </div>
              </motion.div>

              {/* Categories Summary */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 flex-grow"
              >
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-purple-500" /> Breakdown
                </h2>
                
                <div className="flex flex-col gap-4">
                  {[
                    { name: "Work", percent: 45, color: "bg-blue-500" },
                    { name: "Health", percent: 25, color: "bg-emerald-500" },
                    { name: "Social", percent: 15, color: "bg-orange-500" },
                    { name: "Uncategorized", percent: 15, color: "bg-slate-400" }
                  ].map((cat, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm font-medium text-slate-700">
                        <span>{cat.name}</span>
                        <span>{cat.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percent}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className={`h-full rounded-full ${cat.color}`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
