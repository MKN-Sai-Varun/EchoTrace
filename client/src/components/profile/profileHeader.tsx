"use client";

import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/themeToggle";

export default function ProfileHeader() {
  return (
    <header className="flex items-center justify-between mb-8 glass-card px-6 py-3.5">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h1 className="text-lg font-bold text-slate-800">EchoTrace</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
      </div>
    </header>
  );
}
