import React, { Suspense, lazy, useEffect, useState } from "react";
import { ShieldAlert, ArrowRight, Radio, ChevronDown } from "lucide-react";
import { SCENE_CONFIG, HOTSPOTS } from "./landing/config/sceneConfig";
import { useScrollProgress, useReducedMotion, useWebGLSupport } from "./landing/hooks/useLandingHooks";
import TacticalHUD from "./landing/TacticalHUD";
import LandingSections from "./landing/LandingSections";

const TerrainScene = lazy(() => import("./landing/3d/TerrainScene"));

function TopographicFallback() {
  return (
    <div
      className="absolute inset-0 bg-[#060d1f]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 55% 45%, rgba(14,165,233,0.18), transparent 55%), linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 36px 36px, 36px 36px",
      }}
    />
  );
}

export default function LandingPage({ onEnterDashboard }) {
  const scrollProgress = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const webGLSupported = useWebGLSupport();
  const [selectedHotspot, setSelectedHotspot] = useState(HOTSPOTS[0]);

  const show3D = SCENE_CONFIG.ENABLE_3D && webGLSupported;

  // Keyboard shortcuts: L = Launch Command Center, Esc = Close 3D callout
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "l") onEnterDashboard();
      if (e.key === "Escape") setSelectedHotspot(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onEnterDashboard]);

  return (
    <div className="min-h-screen w-screen bg-[#060d1f] text-slate-100 overflow-x-hidden">
      {/* Sticky Minimal Command Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#060d1f]/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-400/30">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-sm font-extrabold tracking-widest text-white">
              AARODRIVA <span className="text-sky-400">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
            <a href="#capabilities" className="hover:text-white transition">Capabilities</a>
            <a href="#hazards" className="hover:text-white transition">Hazards</a>
            <a href="#pipeline" className="hover:text-white transition">How It Works</a>
            <a href="#preview" className="hover:text-white transition">Live Preview</a>
          </div>

          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-1.5 bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            <span>Launch Command Center</span>
            <span className="hidden sm:inline text-[10px] font-mono opacity-75 border border-white/30 px-1 rounded">L</span>
          </button>
        </div>
      </nav>

      {/* SECTION 1: Full-Viewport Interactive 3D Flood Basin Hero */}
      <section className="relative h-screen w-full overflow-hidden flex items-center pt-14">
        {show3D ? (
          <Suspense fallback={<TopographicFallback />}>
            <TerrainScene
              scrollProgress={scrollProgress}
              reducedMotion={reducedMotion}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          </Suspense>
        ) : (
          <TopographicFallback />
        )}

        {/* Readability Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#060d1f]/90 via-[#060d1f]/45 to-transparent" />

        {/* Hero Foreground Content */}
        <div className="relative z-20 max-w-7xl w-full mx-auto px-6 flex flex-col justify-between h-full py-8 pointer-events-none">
          <div className="pointer-events-auto">
            <TacticalHUD scrollProgress={scrollProgress} />
          </div>

          <div className="max-w-xl space-y-5 pointer-events-auto">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.04]">
              <span className="block text-white">SEE THE THREAT.</span>
              <span className="block text-cyan-400 mt-1">SAVE THE LIFE.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Satellite GIS, AI risk triage, and Dijkstra rescue routing unified into one real-time disaster command center. Click any 3D beacon to inspect live basin telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-2 bg-[#ef4444] hover:bg-red-600 text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-2 bg-[#0a1428]/90 hover:bg-slate-800 border border-slate-700 text-slate-100 text-sm font-semibold px-5 py-3.5 rounded-xl transition"
              >
                <Radio className="w-4 h-4 text-red-400" />
                <span>Citizen SOS Access</span>
              </button>
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-auto">
            <span>CLICK 3D BEACONS TO INSPECT • PRESS [L] TO LAUNCH</span>
            <a href="#capabilities" className="inline-flex items-center gap-1 hover:text-cyan-400 transition">
              <span>SCROLL TO EXPLORE</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTIONS 2–6 */}
      <LandingSections scrollProgress={scrollProgress} onEnterDashboard={onEnterDashboard} />
    </div>
  );
}