import React, { useState, useEffect } from "react";
import Earth3D from "./Earth3D";
import AarodrivaLogo from "./AarodrivaLogo";
import {
  FileText,
  PhoneCall,
  ArrowRight,
  Satellite,
  Sparkles,
} from "lucide-react";

const LINE1 = "SEE THE DISASTER.";
const LINE2 = "PREDICT THE IMPACT.";
const LINE3 = "SAVE LIVES.";
const TOTAL_CHARS = LINE1.length + LINE2.length + LINE3.length;

export default function LandingPage({
  onLaunchMap,
  onEnterDashboard,
  onOpenSitrep,
  onOpenAuthorities,
  onOpenSOS,
  isBackendOnline = false,
}) {
  const handleLaunch = onLaunchMap || onEnterDashboard;

  // Typewriter effect state
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCharCount((prev) => {
        if (prev < TOTAL_CHARS) {
          return prev + 1;
        }
        return prev;
      });
    }, 45);

    // Subtle re-typing cycle every 14 seconds to keep presentation dynamic
    const cycleTimer = setInterval(() => {
      setCharCount(0);
    }, 14000);

    return () => {
      clearInterval(timer);
      clearInterval(cycleTimer);
    };
  }, []);

  // Compute typed substrings for each line
  const l1Len = Math.min(LINE1.length, charCount);
  const l1Text = LINE1.slice(0, l1Len);
  const l1Prefix = l1Len <= 8 ? l1Text : "SEE THE ";
  const l1Accent = l1Len > 8 ? l1Text.slice(8) : "";

  const l2Len = Math.max(0, Math.min(LINE2.length, charCount - LINE1.length));
  const l2Text = LINE2.slice(0, l2Len);

  const l3Len = Math.max(
    0,
    Math.min(LINE3.length, charCount - LINE1.length - LINE2.length)
  );
  const l3Text = LINE3.slice(0, l3Len);

  const isLine1Active = charCount <= LINE1.length;
  const isLine2Active =
    charCount > LINE1.length && charCount <= LINE1.length + LINE2.length;
  const isLine3Active = charCount > LINE1.length + LINE2.length;

  const Cursor = () => (
    <span className="inline-block w-1.5 h-[0.85em] bg-cyan-400 animate-pulse ml-1 align-baseline shadow-[0_0_8px_#38bdf8]" />
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#040814] text-slate-100 font-sans relative select-none">
      {/* Background Starry Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_65%_40%,rgba(14,165,233,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* 1. TOP DASHBOARD NAVIGATION BAR (Fixed height, perfectly fitted) */}
      <nav className="h-14 sm:h-16 w-full border-b border-slate-800/80 bg-[#060c1d]/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between z-30 shrink-0">
        {/* Brand with Elite Logo */}
        <div className="flex items-center gap-3">
          <AarodrivaLogo size={36} animate={true} showGlow={false} />

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

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
              isBackendOnline
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/40 border-amber-500/40 text-amber-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>
              {isBackendOnline ? "RENDER ENGINE ONLINE" : "AUTONOMOUS SIM"}
            </span>
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
            <Sparkles
              className="w-3 h-3 text-cyan-400 animate-spin"
              style={{ animationDuration: "8s" }}
            />
            <span>SATELLITE-TO-RESCUE INTELLIGENCE PLATFORM</span>
          </div>

          {/* 3D Animated Tagline with Real-Time Typing Animation */}
          <div className="space-y-1 min-h-[175px] sm:min-h-[215px] xl:min-h-[250px]">
            <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              AARODRIVA AI · FROM ORBIT TO ACTION
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[54px] font-black tracking-tight text-white leading-[1.08] text-3d-cyber">
              <span>{l1Prefix}</span>
              <br />
              <span className="text-stroke-cyan">{l1Accent}</span>
              {isLine1Active && <Cursor />}
              <br />
              {l2Len > 0 && (
                <>
                  <span>{l2Text}</span>
                  {isLine2Active && <Cursor />}
                  <br />
                </>
              )}
              {l3Len > 0 && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                  {l3Text}
                  {isLine3Active && <Cursor />}
                </span>
              )}
            </h1>
          </div>

          {/* Concise Professional SaaS Description */}
          <p className="text-slate-300 text-xs sm:text-sm xl:text-base leading-relaxed max-w-lg font-normal">
            Autonomous C-Band radar flood intelligence paired with dynamic
            topological Dijkstra road graphs. Detects inundated transit barriers
            in real time and recalculates zero-risk high-ground evacuation
            routes for national disaster responders.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleLaunch}
              className="px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2.5 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.9)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>LAUNCH COMMAND CENTER</span>
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
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">
                SAR INUNDATION
              </span>
              <span className="text-cyan-400 font-bold text-sm">142.8 km²</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">
                MAROONED SOULS
              </span>
              <span className="text-rose-400 font-bold text-sm">3,710</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">
                SAFE ROUTES
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                100% CLEAR
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Half-Earth (Dives in at the right edge) */}
        <div className="w-full lg:w-[52%] h-[45vh] lg:h-full relative flex items-center justify-end overflow-visible pointer-events-auto">
          {/* Ambient Cosmic Radial Glow Behind Earth */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] lg:w-[580px] h-[420px] lg:h-[580px] bg-gradient-to-l from-cyan-500/20 via-sky-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Earth 3D Canvas Container */}
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Earth3D onExplore={handleLaunch} />
          </div>
        </div>
      </main>
    </div>
  );
}
