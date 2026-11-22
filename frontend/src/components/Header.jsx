import React, { useEffect, useState } from "react";
<<<<<<< HEAD
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
} from "lucide-react";

export default function Header({
  onRefresh,
  isRefreshing,
  activeSOSCount,
  isBackendOnline = false,
  onOpenSitrep,
  onOpenAuthorities,
  onOpenSOS,
}) {
=======
import { ShieldAlert, Radio, RefreshCw, AlertTriangle } from "lucide-react";

export default function Header({ onRefresh, isRefreshing, activeSOSCount, isDark }) {
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)
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
<<<<<<< HEAD
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
            <span className="text-[10px] text-cyan-400/90 hidden md:inline font-mono">
              Brahmaputra Flood Basin
            </span>
          </div>
        </div>
      </div>

      {/* Operational Action Shortcuts */}
      <div className="hidden lg:flex items-center gap-2">
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
          title="View and Download Comprehensive Flood & Rescue Operations SITREP"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>EOC SITREP Report</span>
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
=======
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
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)
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

<<<<<<< HEAD
        {/* Mobile Quick Actions dropdown trigger */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            onClick={onOpenAuthorities}
            className="p-1.5 rounded-lg bg-rose-950 border border-rose-700 text-rose-300"
            title="Authorities"
          >
            <PhoneCall className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenSitrep}
            className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300"
            title="SITREP Report"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clock */}
        <div className="text-right hidden sm:block font-mono">
          <div className="text-xs font-semibold text-slate-200">
=======
        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono font-semibold">
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)
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
<<<<<<< HEAD

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
                className="px-4 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
=======
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)
    </header>
  );
}