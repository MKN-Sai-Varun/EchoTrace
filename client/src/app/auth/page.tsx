"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowRight, Mail, Lock, User,
  CheckCircle2, TrendingUp, Clock, Brain, Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("mode=register")) setIsLogin(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Clear error and fields when switching modes
  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin
      ? `${API}/api/auth/login`
      : `${API}/api/auth/register`;

    const body = isLogin ? { username, password } : { username, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }
      window.location.href = "/dashboard";
    } catch {
      setError("Cannot connect to server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="w-full max-w-5xl min-h-0 lg:h-[680px] glass-card relative flex flex-col lg:flex-row overflow-hidden shadow-2xl">

        {/* ── LEFT INFO PANEL — shown when register form is active (form slid right) ── */}
        <div className="hidden lg:flex w-1/2 h-full flex-col justify-center px-12 py-8 relative select-none">
          <div className="absolute inset-0 bg-blue-500/5 -z-10" />
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">EchoTrace</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4 leading-tight">
            Welcome back to your <span className="text-gradient">reality.</span>
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-sm">
            Your timeline awaits. Sign in to access AI insights, your productivity score, and today&apos;s events.
          </p>
          <div className="flex flex-col gap-3 mb-10">
            {[
              { icon: <TrendingUp className="w-4 h-4 text-blue-500" />, text: "Track your daily productivity score" },
              { icon: <Brain className="w-4 h-4 text-violet-500" />, text: "AI-powered mindset inference" },
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, text: "Personalized routine suggestions" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                {f.icon} {f.text}
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Already have an account?</p>
            <button type="button" onClick={() => switchMode(true)}
              className="px-7 py-2.5 rounded-xl border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 transition-colors text-sm shadow-sm">
              Sign In
            </button>
          </div>
        </div>

        {/* ── RIGHT INFO PANEL — shown when login form is active (form on left) ── */}
        <div className="hidden lg:flex w-1/2 h-full flex-col justify-center px-12 py-8 relative select-none">
          <div className="absolute inset-0 bg-emerald-500/5 -z-10" />
          <div className="flex items-center gap-2 mb-8 justify-end">
            <span className="text-2xl font-bold text-slate-800">EchoTrace</span>
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4 leading-tight text-right">
            Start tracking <br /><span className="text-emerald-600">your true time.</span>
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-right text-sm">
            Log micro-events throughout your day. EchoTrace reconstructs your timeline and tells you exactly where your time went.
          </p>
          <div className="flex flex-col gap-3 mb-10 items-end">
            {[
              { icon: <Clock className="w-4 h-4 text-emerald-500" />, text: "Frictionless logging in seconds" },
              { icon: <Zap className="w-4 h-4 text-amber-500" />, text: "Automatic AI categorization" },
              { icon: <TrendingUp className="w-4 h-4 text-blue-500" />, text: "Rich insights and recommendations" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                {f.text} {f.icon}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">New to EchoTrace?</p>
            <button type="button" onClick={() => switchMode(false)}
              className="px-7 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors text-sm shadow-sm">
              Create Account
            </button>
          </div>
        </div>

        {/* ── SLIDING FORM BOX ──
            Login  → left: 0%   (covers left panel, right panel visible)
            Register → left: 50% (covers right panel, left panel visible)
        ── */}
        <motion.div
          animate={{ left: isDesktop ? (isLogin ? "0%" : "50%") : "0%" }}
          transition={{ type: "spring", stiffness: 55, damping: 14 }}
          className="auth-surface relative lg:absolute top-0 w-full lg:w-1/2 min-h-0 lg:h-full bg-white/98 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.12)] z-20 flex flex-col justify-center px-5 sm:px-8 lg:px-12 py-8 lg:py-0 border-x border-slate-200/80 overflow-y-auto"
        >
          <div className="flex lg:hidden gap-1 p-1 mb-6 rounded-xl bg-slate-100 w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                !isLogin ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div key="login"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 sm:gap-7 w-full max-w-sm mx-auto"
              >
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">Sign In</h1>
                  <p className="text-slate-500 text-sm">Welcome back — enter your details below.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Username or Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                        className="glass-input bg-slate-50/80 w-full pl-11 pr-4 py-3.5 text-sm focus:bg-white"
                        placeholder="you@example.com or username" autoComplete="username" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        className="glass-input bg-slate-50/80 w-full pl-11 pr-4 py-3.5 text-sm focus:bg-white"
                        placeholder="••••••••" autoComplete="current-password" />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 mt-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-400 lg:hidden">
                  No account?{" "}
                  <button type="button" onClick={() => switchMode(false)} className="text-blue-600 font-bold hover:underline">
                    Create one free
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div key="register"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 sm:gap-7 w-full max-w-sm mx-auto"
              >
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">Register</h1>
                  <p className="text-slate-500 text-sm">Create your free EchoTrace account.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                        className="glass-input bg-slate-50/80 w-full pl-11 pr-4 py-3.5 text-sm focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white"
                        placeholder="johndoe" autoComplete="username" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Email <span className="text-slate-400 normal-case font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="glass-input bg-slate-50/80 w-full pl-11 pr-4 py-3.5 text-sm focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white"
                        placeholder="you@example.com" autoComplete="email" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        className="glass-input bg-slate-50/80 w-full pl-11 pr-4 py-3.5 text-sm focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white"
                        placeholder="Min. 6 characters" autoComplete="new-password" />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 mt-1 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20 text-sm font-bold">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-400 lg:hidden">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode(true)} className="text-emerald-600 font-bold hover:underline">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
