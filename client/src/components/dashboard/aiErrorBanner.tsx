"use client";

import { Zap } from "lucide-react";

type AiErrorBannerProps = {
  aiError: string | null;
  isAnalyzing: boolean;
};

export default function AiErrorBanner({
  aiError,
  isAnalyzing,
}: AiErrorBannerProps) {
  if (!aiError || isAnalyzing) return null;

  return (
    <div className="flex gap-2 items-center px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-200">
      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span className="text-xs font-medium text-amber-700">{aiError}</span>
    </div>
  );
}
