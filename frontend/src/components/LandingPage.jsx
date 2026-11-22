import React from "react";
import Earth3D from "./Earth3D";
import {
  ShieldAlert,
  Compass,
  Radio,
  FileText,
  PhoneCall,
  ArrowRight,
  Satellite,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage({
  onLaunchMap,
  onEnterDashboard,
  onOpenSitrep,
  onOpenAuthorities,
  onOpenSOS,
  isBackendOnline = false,
}) {
  const handleLaunch = onLaunchMap || onEnterDashboard;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#040814] text-slate-100 overflow-x-hidden overflow-y-auto font-sans relative select-none">
      {/* Background Starry & Subtle Grid Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* 1. TOP DASHBOARD NAVIGATION BAR */}
      <nav className="h-16 w-full border-b border-slate-800/80 bg-[#060c1d]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <div className="w-full h-full bg-[#071127] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border-2 border-[#071127] animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">
                AARODRIVA <span className="text-cyan-400">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                ASTRA 2026
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span>ISRO RISAT-1A SAR TELEMETRY STREAM</span>
            </p>
          </div>
        </div>

        {/* Dashboard Status Pills */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">DIJKSTRA GRAPH:</span>
            <span className="text-emerald-400 font-bold">OPTIMIZED</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400">BASINS MONITORED:</span>
            <span className="text-cyan-400 font-bold">12 WORLDWIDE</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            isBackendOnline
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/40 text-amber-300"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>{isBackendOnline ? "FASTAPI ENGINE :8000" : "AUTONOMOUS SIM ENGINE"}</span>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-3">
          {onOpenSitrep && (
            <button
              onClick={onOpenSitrep}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>SITREP Report</span>
            </button>
          )}

          {onOpenAuthorities && (
            <button
              onClick={onOpenAuthorities}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/50 text-xs font-semibold text-rose-300 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Authorities</span>
            </button>
          )}

          {/* LAUNCH MAP TOP BUTTON */}
          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-black tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.9)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>LAUNCH EOC MAP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 2. HERO SPLIT: LEFT CONTENT (DETAILS + 3D TEXT) & RIGHT CONTENT (HALF 3D EARTH) */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 py-4 relative z-10 max-w-[1700px] mx-auto w-full">
        {/* LEFT COLUMN: 3D Animated Headline, Tagline, Details, Action Buttons */}
        <div className="w-full lg:w-[52%] space-y-6 py-4 lg:py-6 z-20">
          {/* Mission Category Super-Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>SATELLITE-TO-RESCUE INTELLIGENCE PLATFORM</span>
          </div>

          {/* 3D Animated Tagline */}
          <div className="space-y-2">
            <h2 className="text-xs sm:text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center gap-2">
              <span className="inline-block w-8 h-0.5 bg-cyan-400" />
              AARODRIVA AI · FROM ORBIT TO ACTION
            </h2>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] text-3d-cyber">
              SEE THE <br />
              <span className="text-stroke-cyan">DISASTER.</span> <br />
              PREDICT THE <br />
              IMPACT. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                SAVE LIVES.
              </span>
            </h1>
          </div>

          {/* Deep Description */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
            Satellite-powered geospatial intelligence for faster, smarter, and life-saving disaster response. Pairs all-weather Synthetic Aperture Radar (SAR) with a dynamic topological Dijkstra road graph to detect inundation perimeters and route emergency responders around flood hazard barriers.
          </p>

          {/* 4 Feature Capability Cards with 3D Hover Depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-400/60 transition shadow-lg hover:shadow-cyan-500/20 group">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
                  <Satellite className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300">SAR Inundation Radar</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Sub-meter radar penetration through dense cloud cover mapping real-time water masks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-400/60 transition shadow-lg hover:shadow-emerald-500/20 group">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300">RescueRoute AI Dijkstra</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Topological road graph automatically severing submerged links for 100% safe high-ground bypass.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 hover:border-amber-400/60 transition shadow-lg hover:shadow-amber-500/20 group">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-amber-300">Marooned Settlement Index</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Spatial isolation analytics identifying severed villages and stranded souls needing immediate airdrop.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/20 hover:border-rose-400/60 transition shadow-lg hover:shadow-rose-500/20 group">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-rose-300">Multi-Agency EOC Dispatch</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Direct tactical synchronization with NDRF 1st Bn, SDRF Assam, DEOC Kamrup & 108 Ambulance Fleet.
              </p>
            </div>
          </div>

          {/* PRIMARY CALL-TO-ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={handleLaunch}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center gap-3 shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:shadow-[0_0_50px_rgba(6,182,212,1)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>🚀 LAUNCH EOC COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenSitrep && (
              <button
                onClick={onOpenSitrep}
                className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition hover:text-white cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>SITREP BRIEFING</span>
              </button>
            )}

            {onOpenAuthorities && (
              <button
                onClick={onOpenAuthorities}
                className="px-4 py-3.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/40 text-rose-300 font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>HOTLINES</span>
              </button>
            )}
          </div>

          {/* Live Telemetry Ticker Ribbon */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px]">FLOOD BASIN INUNDATION</span>
              <span className="text-cyan-400 font-bold text-sm">142.8 km²</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">MAROONED SOULS IDENTIFIED</span>
              <span className="text-rose-400 font-bold text-sm">1,020 Souls</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DIJKSTRA SAFETY CLEARANCE</span>
              <span className="text-emerald-400 font-bold text-sm">100% High-Ground</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ALGORITHM LATENCY</span>
              <span className="text-amber-400 font-bold text-sm">&lt; 12 ms</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE 3D HALF-EARTH DIVING IN */}
        <div className="w-full lg:w-[48%] h-[420px] sm:h-[520px] lg:h-[650px] relative flex items-center justify-center lg:justify-end overflow-visible">
          <Earth3D />
        </div>
      </main>
    </div>
  );
}
