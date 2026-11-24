import React from "react";
import { Siren, Home, Ban, LifeBuoy } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  ReferenceLine,
} from "recharts";

export default function MetricCards({ metrics, isDark }) {
  const cards = [
    {
      label: "Active SOS Alerts",
      value: metrics.activeSOS,
      accent: isDark ? "text-red-400" : "text-red-600",
      bg: isDark ? "bg-red-500/10" : "bg-red-50",
      icon: Siren,
    },
    {
      label: "Marooned Villages",
      value: metrics.maroonedVillages,
      accent: isDark ? "text-amber-400" : "text-amber-600",
      bg: isDark ? "bg-amber-500/10" : "bg-amber-50",
      icon: Home,
    },
    {
      label: "Blocked Roads",
      value: metrics.blockedRoads,
      accent: isDark ? "text-red-400" : "text-red-600",
      bg: isDark ? "bg-red-500/10" : "bg-red-50",
      icon: Ban,
    },
    {
      label: "People Evacuated",
      value: metrics.peopleEvacuated?.toLocaleString("en-IN"),
      accent: isDark ? "text-emerald-400" : "text-emerald-600",
      bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      icon: LifeBuoy,
    },
  ];

  return (
    <div
      className={`flex lg:grid overflow-x-auto lg:grid-cols-5 gap-2.5 p-2 sm:p-3 border-b shrink-0 transition-colors scrollbar-none ${
        isDark ? "bg-[#081022] border-slate-800" : "bg-slate-50 border-slate-200"
      }`}
    >
      {cards.map(({ label, value, accent, bg, icon: Icon }) => (
        <div
          key={label}
          className={`min-w-[145px] sm:min-w-0 flex-1 rounded-xl border px-3 py-2 flex items-center justify-between shadow-sm shrink-0 ${
            isDark ? "border-slate-800 bg-[#0d1930]" : "border-slate-200 bg-white"
          }`}
        >
          <div>
            <p
              className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {label}
            </p>
            <p className={`text-xl sm:text-2xl font-bold font-mono mt-0.5 ${accent}`}>
              {value ?? "--"}
            </p>
          </div>
          <div className={`p-1.5 sm:p-2 rounded-lg ${bg}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent}`} />
          </div>
        </div>
      ))}

      {/* River Water Level Sparkline */}
      <div
        className={`min-w-[170px] sm:min-w-0 flex-1 col-span-2 lg:col-span-1 rounded-xl border px-3 py-2 flex flex-col justify-between shadow-sm shrink-0 ${
          isDark ? "border-slate-800 bg-[#0d1930]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Water Level (m)
          </span>
          <span className={`text-xs font-mono font-bold ${isDark ? "text-cyan-400" : "text-sky-600"}`}>
            50.8m
          </span>
        </div>
        <div className="h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.waterLevelTrend || []}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#0f1c36" : "#ffffff",
                  border: isDark ? "1px solid #1e3a5f" : "1px solid #e2e8f0",
                  fontSize: "11px",
                  borderRadius: "6px",
                }}
              />
              <ReferenceLine y={49.5} stroke="#f59e0b" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="level"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#waterGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}