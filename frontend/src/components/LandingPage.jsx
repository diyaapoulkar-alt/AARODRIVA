import React from "react";
import Earth3D from "./Earth3D";
import {
  ShieldAlert,
  FileText,
  PhoneCall,
  ArrowRight,
  Satellite,
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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#040814] text-slate-100 font-sans relative select-none">
      {/* Background Starry Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_65%_40%,rgba(14,165,233,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* 1. TOP DASHBOARD NAVIGATION BAR (Fixed height, perfectly fitted) */}
      <nav className="h-14 sm:h-16 w-full border-b border-slate-800/80 bg-[#060c1d]/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between z-30 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-[#071127] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border border-[#071127] animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-wider text-white">
                AARODRIVA <span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                ASTRA 2026
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1 hidden sm:flex">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span>ISRO RISAT-1A SAR TELEMETRY STREAM</span>
            </p>
          </div>
        </div>

        {/* Dashboard Status Pills */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">DIJKSTRA GRAPH:</span>
            <span className="text-emerald-400 font-bold">OPTIMIZED</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
            isBackendOnline
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/40 text-amber-300"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>{isBackendOnline ? "FASTAPI ENGINE :8000" : "AUTONOMOUS SIM"}</span>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-2.5">
          {onOpenSitrep && (
            <button
              onClick={onOpenSitrep}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>SITREP</span>
            </button>
          )}

          {onOpenAuthorities && (
            <button
              onClick={onOpenAuthorities}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-600/40 text-xs font-semibold text-rose-300 transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Hotlines</span>
            </button>
          )}

          {/* LAUNCH MAP TOP BUTTON */}
          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-black tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            <span>LAUNCH MAP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN HERO SECTION: 100% SINGLE VIEWPORT (NO SCROLLING) */}
      <main className="flex-1 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col lg:flex-row items-center justify-between px-6 lg:px-14 max-w-[1600px] mx-auto w-full overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: Clean, Professional, High-Impact SaaS Layout */}
        <div className="w-full lg:w-[48%] flex flex-col justify-center space-y-4 xl:space-y-5 z-20 py-2">
          
          {/* Mission Category Super-Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/30 text-[10.5px] font-mono text-cyan-300 shadow-sm w-fit">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>SATELLITE-TO-RESCUE INTELLIGENCE PLATFORM</span>
          </div>

          {/* 3D Animated Tagline (Exact wording requested) */}
          <div className="space-y-1">
            <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              AARODRIVA AI · FROM ORBIT TO ACTION
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[50px] xl:text-[58px] font-black tracking-tight text-white leading-[1.03] text-3d-cyber">
              SEE THE <br />
              <span className="text-stroke-cyan">DISASTER.</span> <br />
              PREDICT THE <br />
              IMPACT. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                SAVE LIVES.
              </span>
            </h1>
          </div>

          {/* Concise Professional SaaS Description */}
          <p className="text-slate-300 text-xs sm:text-sm xl:text-base leading-relaxed max-w-lg font-normal">
            Autonomous C-Band radar flood intelligence paired with dynamic topological Dijkstra road graphs. Detects inundated transit barriers in real time and recalculates zero-risk high-ground evacuation routes for national disaster responders.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleLaunch}
              className="px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2.5 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.9)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>🚀 LAUNCH COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenSitrep && (
              <button
                onClick={onOpenSitrep}
                className="px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>SITREP BRIEFING</span>
              </button>
            )}

            {onOpenAuthorities && (
              <button
                onClick={onOpenAuthorities}
                className="px-3.5 py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>HOTLINES</span>
              </button>
            )}
          </div>

          {/* Executive Live Telemetry Ribbon (Horizontal & Compact) */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-5 sm:gap-6 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">SAR INUNDATION</span>
              <span className="text-cyan-400 font-bold text-sm">142.8 km²</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">MAROONED SOULS</span>
              <span className="text-rose-400 font-bold text-sm">1,020</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">DIJKSTRA SAFETY</span>
              <span className="text-emerald-400 font-bold text-sm">100% CLEAR</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">LATENCY</span>
              <span className="text-amber-400 font-bold text-sm">&lt; 12ms</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D HALF-EARTH (Fitted directly into viewport) */}
        <div className="w-full lg:w-[52%] h-full relative flex items-center justify-center lg:justify-end overflow-hidden">
          <Earth3D />
        </div>
      </main>
    </div>
  );
}
