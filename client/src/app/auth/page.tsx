"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRight, Mail, Lock, User, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("mode=register")) {
      setIsLogin(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  // The background theme is now handled cleanly by globals.css shapes.
  // We removed the body style overriding to eliminate the purple tint.

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-8 overflow-hidden">
      
      {/* Main Book Container */}
      <div className="w-full max-w-5xl h-[700px] glass-card relative flex overflow-hidden shadow-2xl">
        
        {/* ================= BACKGROUND INFO PANELS (Layer 1) ================= */}
        
        {/* Left Info Panel (Visible when Box is on the Right / Registration Mode) */}
        <div className="w-1/2 h-full flex flex-col justify-center px-12 py-8 relative">
          {/* Subtle gradient to differentiate */}
          <div className="absolute inset-0 bg-blue-500/5 -z-10" />
          
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">EchoTrace</span>
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-6 leading-tight">
            Welcome back to your <span className="text-gradient">reality.</span>
          </h2>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your timeline awaits. Sign in to access your AI insights, view your productivity score, and log new events. 
          </p>

          <div className="flex flex-col gap-4 mb-10">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Track your daily productivity score.
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Get personalized AI routine suggestions.
            </div>
          </div>
          
          <div>
            <p className="text-sm font-bold text-slate-500 mb-3">Already have an account?</p>
            <button 
              onClick={() => setIsLogin(true)}
              className="px-8 py-3 rounded-xl border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right Info Panel (Visible when Box is on the Left / Login Mode) */}
        <div className="w-1/2 h-full flex flex-col justify-center px-12 py-8 relative">
          <div className="absolute inset-0 bg-emerald-500/5 -z-10" />

          <div className="flex items-center gap-2 mb-8 justify-end">
            <span className="text-2xl font-bold text-slate-800">EchoTrace</span>
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800 mb-6 leading-tight text-right">
            Start tracking <br/><span className="text-emerald-600">your true time.</span>
          </h2>
          
          <p className="text-slate-600 mb-8 leading-relaxed text-right">
            EchoTrace is an event-based timeline that helps you understand where your time actually went today. Stop guessing and start optimizing.
          </p>

          <div className="flex flex-col gap-4 mb-10 items-end">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              Frictionless logging in seconds <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              Automatic AI categorization <Activity className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-sm font-bold text-slate-500 mb-3">New here?</p>
            <button 
              onClick={() => setIsLogin(false)}
              className="px-8 py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Create Account
            </button>
          </div>
        </div>


        {/* ================= SLIDING FORM BOX (Layer 2) ================= */}
        
        <motion.div
          animate={{ left: isLogin ? "0%" : "50%" }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          className="absolute top-0 w-1/2 h-full bg-white/95 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] z-20 flex flex-col justify-center px-12 border-x border-white/50"
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              // LOGIN FORM
              <motion.div 
                key="login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8 w-full max-w-sm mx-auto"
              >
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black text-slate-800">Sign In</h1>
                  <p className="text-slate-500 font-medium">Please enter your details to login.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" required className="glass-input bg-slate-50 w-full pl-12 pr-4 py-3.5 focus:bg-white" placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-bold text-slate-700">Password</label>
                      <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="password" required className="glass-input bg-slate-50 w-full pl-12 pr-4 py-3.5 focus:bg-white" placeholder="••••••••" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-lg">
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              // REGISTER FORM
              <motion.div 
                key="register"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8 w-full max-w-sm mx-auto"
              >
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black text-slate-800">Register</h1>
                  <p className="text-slate-500 font-medium">Create your EchoTrace account.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" required className="glass-input bg-slate-50 w-full pl-12 pr-4 py-3.5 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white" placeholder="johndoe" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" className="glass-input bg-slate-50 w-full pl-12 pr-4 py-3.5 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white" placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="password" required className="glass-input bg-slate-50 w-full pl-12 pr-4 py-3.5 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white" placeholder="••••••••" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20 text-lg">
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign Up <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
