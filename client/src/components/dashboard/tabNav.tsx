"use client";

type TabType = "timeline" | "insights" | "routine";

type TabNavProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
      {(["timeline", "insights", "routine"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === tab
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "glass-card text-slate-600 hover:text-slate-800"
          }`}
        >
          {tab === "timeline"
            ? "📋 Timeline"
            : tab === "insights"
            ? "✨ AI Insights"
            : "🏆 Routine"}
        </button>
      ))}
    </div>
  );
}
