import React, { useEffect, useState } from "react";
import { ShieldAlert, Radio, RefreshCw, AlertTriangle } from "lucide-react";

export default function Header({ onRefresh, isRefreshing, activeSOSCount }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-[#0a1428] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-cyan-500/15 border border-cyan-400/40 p-2 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wider text-white leading-tight">
            AARODRIVA <span className="text-cyan-400 font-normal">COMMAND</span>
          </h1>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest">
            Flood Emergency Operations Centre
          </p>
        </div>
      </div>

      {/* Live Alert Banner */}
      <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
        <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs font-medium text-amber-300">
          RED ALERT: River water 1.3m above danger mark • {activeSOSCount} Active SOS
        </span>
      </div>

      {/* Status & Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold">LIVE SYNC</span>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono font-semibold text-slate-200">
            {time.toLocaleTimeString("en-IN", { hour12: false })} IST
          </div>
          <div className="text-[10px] text-slate-400">
            {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
        </button>
      </div>
    </header>
  );
}