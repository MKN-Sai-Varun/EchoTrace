"use client";

import { Activity, LogOut, Sparkles, User } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/themeToggle";

type DashboardHeaderProps = {
  username: string;
  usingAi: boolean;
  onLogout: () => void;
};

export default function DashboardHeader({
  username,
  usingAi,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 glass-card px-6 py-3.5">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h1 className="text-lg font-bold text-slate-800">EchoTrace</h1>
      </div>
      <div className="flex items-center gap-2">
        {usingAi && (
          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
            <Sparkles className="w-3 h-3" /> AI
          </span>
        )}
        <ThemeToggle />
        <Link
          href="/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{username}</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors px-3 py-2 rounded-lg hover:bg-rose-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
