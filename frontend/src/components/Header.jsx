import React, { useEffect, useState } from "react";
import AarodrivaLogo from "./AarodrivaLogo";
import {
  ShieldAlert,
  Radio,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  MapPin,
  FileText,
  PhoneCall,
  Siren,
  Home,
  Sun,
  Moon,
} from "lucide-react";

export default function Header({
  onRefresh,
  isRefreshing,
  activeSOSCount,
  isBackendOnline = false,
  onOpenSitrep,
  onOpenAuthorities,
  onOpenSOS,
  onGoHome,
  isDark = true,
  onToggleTheme,
}) {
  const [time, setTime] = useState(new Date());
  const [showApiInfo, setShowApiInfo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className={`h-16 border-b px-4 flex items-center justify-between shrink-0 z-20 transition-colors ${
        isDark
          ? "bg-[#081225] border-slate-800/80 text-white"
          : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}
    >
      {/* Brand & Mission */}
      <div
        onClick={onGoHome}
        className="flex items-center gap-3 cursor-pointer group"
        title="Return to Landing Page & 3D Earth Mission Overview"
      >
        <AarodrivaLogo size={34} animate={false} showGlow={false} className="group-hover:scale-105 transition" />
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={`text-base font-black tracking-wider leading-tight transition ${
                isDark ? "text-white group-hover:text-cyan-300" : "text-slate-900 group-hover:text-sky-600"
              }`}
            >
              AARODRIVA <span className={isDark ? "text-cyan-400 font-semibold" : "text-sky-600 font-semibold"}>AI</span>
            </h1>
            <span
              className={`hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                isDark
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  : "bg-sky-100 text-sky-800 border border-sky-300"
              }`}
            >
              ASTRA 2026
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Guwahati, Assam
            </span>
            <span className="text-slate-500">•</span>
            <span className={`text-[10px] hidden md:inline font-mono ${isDark ? "text-cyan-400/90" : "text-sky-600"}`}>
              Brahmaputra Flood Basin
            </span>
          </div>
        </div>
      </div>

      {/* Operational Action Shortcuts */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Mission Home Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition shadow-sm ${
              isDark
                ? "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-cyan-500/40"
                : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
            }`}
            title="Return to 3D Earth Mission Home & Overview"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mission Home</span>
          </button>
        )}

        {/* Contact Authorities Button */}
        <button
          onClick={onOpenAuthorities}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
          title="Contact Nearby Emergency Authorities (NDRF, SDRF, ASDMA, DEOC, 108)"
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Authorities Hotline</span>
        </button>

        {/* EOC SITREP Report Button */}
        <button
          onClick={onOpenSitrep}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 rounded-lg text-xs font-bold transition shadow-sm"
          title="View and Download Comprehensive Flood & Rescue Operations SITREP PDF"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>EOC SITREP PDF</span>
        </button>

        {/* Citizen SOS Button */}
        <button
          onClick={onOpenSOS}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 rounded-lg text-xs font-bold transition shadow-sm"
          title="Simulate Citizen NavIC Distress Beacon"
        >
          <Siren className="w-3.5 h-3.5 text-amber-400" />
          <span>Citizen SOS</span>
        </button>
      </div>

      {/* Backend Status & Controls */}
      <div className="flex items-center gap-3">
        {/* Day/Night Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition ${
              isDark
                ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
            }`}
            title="Toggle Daylight UI / Night Ops"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-semibold">{isDark ? "Day" : "Night"}</span>
          </button>
        )}

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
          <div className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            {time.toLocaleTimeString("en-IN", { hour12: false })} IST
          </div>
          <div className="text-[10px] text-slate-400">
            {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg border transition ${
            isDark
              ? "bg-slate-800/90 hover:bg-slate-700 border-slate-700/80 text-slate-300 hover:text-white"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900"
          }`}
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
                  AARODRIVA AI does not require external third-party paid keys (Google Maps, Mapbox). The GIS graph engine, Dijkstra flood-avoidance routing, and satellite feeds run completely locally and sovereignly.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">To connect the live Python engine:</p>
                <div className="bg-black/70 p-2 rounded border border-slate-800 font-mono text-cyan-300 text-[11px]">
                  python backend/main.py
                </div>
                <p className="text-[11px] text-slate-500">
                  Backend will automatically serve Dijkstra routing & SITREP generation at port 8000.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowApiInfo(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition cursor-pointer"
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
