import React, { useEffect, useState } from "react";
import { ShieldAlert, Radio, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Info, MapPin } from "lucide-react";

export default function Header({
  onRefresh,
  isRefreshing,
  activeSOSCount,
  isBackendOnline = false,
}) {
  const [time, setTime] = useState(new Date());
  const [showApiInfo, setShowApiInfo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#081225] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand & Mission */}
      <div className="flex items-center gap-3">
        <div className="bg-cyan-500/15 border border-cyan-400/40 p-2 rounded-lg shadow-sm shadow-cyan-500/10">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-wider text-white leading-tight">
              AARODRIVA <span className="text-cyan-400 font-semibold">AI</span>
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
              ASTRA 2026
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span className="font-medium text-slate-300">Guwahati, Assam</span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-cyan-400/90 hidden md:inline font-mono">Brahmaputra Flood Basin</span>
          </div>
        </div>
      </div>

      {/* Live Disaster Alert Banner */}
      <div className="hidden lg:flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-full">
        <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
        <span className="text-xs font-semibold text-rose-300">
          BRAHMAPUTRA INUNDATION: 1.6m above danger mark • {activeSOSCount} Active SOS
        </span>
      </div>

      {/* Backend Status & Controls */}
      <div className="flex items-center gap-3">
        {/* Backend API Connection Status Indicator */}
        <div
          onClick={() => setShowApiInfo(!showApiInfo)}
          className={`cursor-pointer flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition ${
            isBackendOnline
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
              : "text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
          }`}
          title="Click to view API & Backend Status details"
        >
          {isBackendOnline ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-semibold hidden sm:inline">API CONNECTED</span>
              <span className="font-mono text-[10px] text-emerald-300 hidden md:inline">:8000</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold hidden sm:inline">SIMULATED FEED</span>
              <span className="font-mono text-[10px] text-amber-400 hidden md:inline">(OFFLINE)</span>
            </>
          )}
          <Info className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Clock */}
        <div className="text-right hidden sm:block font-mono">
          <div className="text-xs font-semibold text-slate-200">
            {time.toLocaleTimeString("en-IN", { hour12: false })} IST
          </div>
          <div className="text-[10px] text-slate-400">
            {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition hover:text-white"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
        </button>
      </div>

      {/* API Info Modal */}
      {showApiInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b162c] border border-cyan-500/40 rounded-xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AARODRIVA Engine Connectivity
                </h3>
              </div>
              <button
                onClick={() => setShowApiInfo(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-semibold text-slate-400">Status:</span>
                {isBackendOnline ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    FastAPI Engine Online (http://localhost:8000)
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Autonomous Simulation Mode (Mocking ISRO feeds)
                  </span>
                )}
              </div>

              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-cyan-200 space-y-1.5">
                <p className="font-bold text-white">💡 No API Key Needed!</p>
                <p>
                  AARODRIVA AI does not require external third-party paid keys (Google Maps, Mapbox). The GIS graph engine, Dijkstra flood-avoidance routing, and satellite mock feeds run completely locally.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">To connect the live Python engine:</p>
                <div className="bg-black/70 p-2 rounded border border-slate-800 font-mono text-cyan-300 text-[11px]">
                  python backend/main.py
                </div>
                <p className="text-[11px] text-slate-500">
                  Backend will automatically serve Dijkstra routing at port 8000.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowApiInfo(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
