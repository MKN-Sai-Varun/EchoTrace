"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Activity, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gradient">EchoTrace</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth" className="px-5 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-white/50 transition-colors">
            Login
          </Link>
          <Link href="/auth?mode=register" className="px-5 py-2.5 rounded-xl font-medium btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/60 w-fit backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700">Now with AI Insights</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-800 leading-tight">
              Track reality, <br />
              <span className="text-gradient">not just plans.</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              EchoTrace is an event-based timeline that helps you understand where your time actually went today. Log micro-events, discover patterns, and optimize your routine.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <Link href="/auth?mode=register" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2 group">
                Start Tracking Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              {["Frictionless logging in seconds", "Automatic AI categorization", "Rich insights and recommendations"].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Interactive Demo Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-2 relative"
          >
            {/* Browser-like header */}
            <div className="flex gap-2 px-4 py-3 border-b border-white/40 bg-white/30 rounded-t-xl">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            
            {/* Demo Content */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800">Today's Timeline</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Score: 85</span>
              </div>
              
              {[
                { time: "09:00 AM", label: "Morning run & podcast", color: "bg-emerald-100 text-emerald-700", icon: "🏃" },
                { time: "10:15 AM", label: "Deep work: Project X", color: "bg-blue-100 text-blue-700", icon: "💻" },
                { time: "12:30 PM", label: "Lunch with Sarah", color: "bg-orange-100 text-orange-700", icon: "🥗" },
                { time: "02:00 PM", label: "Team sync meeting", color: "bg-purple-100 text-purple-700", icon: "👥" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.15) }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500">{item.time}</span>
                    <span className="font-medium text-slate-800">{item.label}</span>
                  </div>
                </motion.div>
              ))}
              
              <div className="mt-2 flex gap-2">
                <input 
                  type="text" 
                  disabled
                  placeholder="What did you just do?" 
                  className="glass-input flex-grow px-4 py-3"
                />
                <button disabled className="btn-primary px-6 py-3">Log</button>
              </div>
            </div>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
