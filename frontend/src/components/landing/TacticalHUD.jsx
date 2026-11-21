import React from "react";
import { Radio, WifiOff, Cpu } from "lucide-react";
import { SCENE_CONFIG } from "./config/sceneConfig";

export default function TacticalHUD({ scrollProgress }) {
  const altitudeLabel =
    scrollProgress < 0.25 ? "ORBITAL" : scrollProgress < 0.55 ? "TACTICAL" : scrollProgress < 0.8 ? "PIPELINE" : "COMMAND";

  return (
    <>
      {/* Corner Reticle Brackets */}
      <div className="pointer-events-none fixed inset-4 z-20 hidden lg:block">
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400/40" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400/40" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400/40" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400/40" />
      </div>

      {/* Vertical Altitude / Scroll Progress Rail */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-center gap-2">
        <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 [writing-mode:vertical-rl]">
          {altitudeLabel}
        </span>
        <div className="w-1 h-28 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="w-full bg-cyan-400 transition-all duration-150"
            style={{ height: `${Math.max(8, scrollProgress * 100)}%` }}
          />
        </div>
      </div>

      {/* Top-Left Basin Telemetry Strip (inside Hero) */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
        <span className="inline-flex items-center gap-1.5 bg-[#0a1428]/90 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-md">
          <Radio className="w-3 h-3 animate-pulse" />
          SAT-LINK: NOMINAL
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[#0a1428]/90 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-md">
          <Cpu className="w-3 h-3" />
          GIS ENGINE: ACTIVE
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[#0a1428]/90 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md">
          <WifiOff className="w-3 h-3 text-amber-400" />
          PWA OFFLINE READY
        </span>
        <span className="hidden sm:inline-flex bg-[#0a1428]/90 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-md">
          {SCENE_CONFIG.basinCoords}
        </span>
      </div>
    </>
  );
}