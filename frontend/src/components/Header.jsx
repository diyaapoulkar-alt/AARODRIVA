import React, { useEffect, useState } from "react";
import { ShieldAlert, Radio, RefreshCw, AlertTriangle } from "lucide-react";

export default function Header({ onRefresh, isRefreshing, activeSOSCount, isDark }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className={`h-14 border-b px-4 flex items-center justify-between shrink-0 z-20 transition-colors ${
        isDark
          ? "bg-[#0a1428] border-slate-800 text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg border ${
            isDark
              ? "bg-cyan-500/15 border-cyan-400/40"
              : "bg-sky-50 border-sky-200"
          }`}
        >
          <ShieldAlert className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-sky-600"}`} />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-wide leading-tight">
            AARODRIVA <span className={isDark ? "text-cyan-400 font-semibold" : "text-sky-600 font-semibold"}>COMMAND</span>
          </h1>
          <p className={`text-[11px] uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Flood Emergency Operations Centre
          </p>
        </div>
      </div>

      {/* Plain-English Alert Banner */}
      <div
        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          isDark
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}
      >
        <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
        <span className="text-xs font-semibold">
          Brahmaputra is 1.6m above danger level — {activeSOSCount} active SOS calls
        </span>
      </div>

      {/* Status & Controls */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 text-xs px-2.5 py-1 rounded-md border font-semibold ${
            isDark
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-emerald-700 bg-emerald-50 border-emerald-200"
          }`}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>LIVE SYNC</span>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono font-semibold">
            {time.toLocaleTimeString("en-IN", { hour12: false })} IST
          </div>
          <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>

        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg border transition ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
          }`}
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sky-500" : ""}`} />
        </button>
      </div>
    </header>
  );
}