import React from "react";
import { Siren, Home, Ban, LifeBuoy } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  ReferenceLine,
} from "recharts";

export default function MetricCards({ metrics }) {
  const cards = [
    {
      label: "Active SOS Alerts",
      value: metrics.activeSOS,
      accent: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      icon: Siren,
    },
    {
      label: "Marooned Villages",
      value: metrics.maroonedVillages,
      accent: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      icon: Home,
    },
    {
      label: "Blocked Roads",
      value: metrics.blockedRoads,
      accent: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/5",
      icon: Ban,
    },
    {
      label: "People Evacuated",
      value: metrics.peopleEvacuated?.toLocaleString("en-IN"),
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      icon: LifeBuoy,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-3 bg-[#081022] border-b border-slate-800 shrink-0">
      {cards.map(({ label, value, accent, border, bg, icon: Icon }) => (
        <div
          key={label}
          className={`rounded-xl border ${border} bg-[#0d1930] px-3.5 py-2.5 flex items-center justify-between`}
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${accent}`}>{value ?? "--"}</p>
          </div>
          <div className={`p-2 rounded-lg ${bg}`}>
            <Icon className={`w-5 h-5 ${accent}`} />
          </div>
        </div>
      ))}

      {/* Recharts River Water Level Sparkline */}
      <div className="col-span-2 lg:col-span-1 rounded-xl border border-cyan-500/30 bg-[#0d1930] px-3 py-2 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">
            Water Level (m)
          </span>
          <span className="text-xs font-bold text-cyan-400">50.8m</span>
        </div>
        <div className="h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.waterLevelTrend || []}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1c36",
                  border: "1px solid #1e3a5f",
                  fontSize: "11px",
                  borderRadius: "6px",
                }}
              />
              <ReferenceLine y={49.5} stroke="#f59e0b" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="level"
                stroke="#22d3ee"
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