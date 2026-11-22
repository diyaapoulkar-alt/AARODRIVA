import React, { useState, useEffect } from "react";
import { ShieldAlert, Radio, Satellite, Compass } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing AARODRIVA Orbital Feeds...");

  useEffect(() => {
    const steps = [
      { at: 20, text: "Locking onto ISRO RISAT-1A / EOS-04 SAR Telemetry..." },
      { at: 45, text: "Ingesting C-Band Synthetic Aperture Radar Inundation Polygons..." },
      { at: 70, text: "Building Dijkstra Topological Road Graphs & Elevation Meshes..." },
      { at: 90, text: "Synchronizing Multi-Agency NDRF / SDRF Tactical Dispatch Feeds..." },
      { at: 100, text: "Planetary Disaster Command Ready." },
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3;
        const matchingStep = steps.find((s) => next >= s.at && prev < s.at);
        if (matchingStep) {
          setStatusText(matchingStep.text);
        }
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 350);
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 bg-[#040814] flex flex-col items-center justify-center p-6 text-slate-100 cursor-pointer overflow-hidden select-none"
    >
      {/* Background Starfield & Deep Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#060e22] to-[#030611] pointer-events-none" />

      {/* Orbit Rings Animation */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/10 pointer-events-none animate-spin" style={{ animationDuration: '30s' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#38bdf8]" />
      </div>
      <div className="absolute w-[360px] h-[360px] rounded-full border border-cyan-500/20 pointer-events-none animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />

      {/* Center Symbol with Pulsing Radar Halo */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Expanding Wave Ping */}
        <div className="absolute w-28 h-28 rounded-full border-2 border-cyan-400/40 animate-wave-ping" />
        <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20 animate-wave-ping" style={{ animationDelay: '0.8s' }} />

        {/* Central Hexagonal Emblem */}
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-[#040d21] border-2 border-cyan-400/70 p-5 shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center backdrop-blur-xl animate-float-3d">
          <ShieldAlert className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
          <Satellite className="w-5 h-5 text-amber-400 absolute top-2 right-2 animate-pulse" />
          <Radio className="w-5 h-5 text-emerald-400 absolute bottom-2 left-2 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* 3D Animated Title & Branding */}
      <div className="text-center space-y-2 z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-mono tracking-widest text-cyan-300 uppercase shadow-inner">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          ASTRA 2026 Space Operations Initiative
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 text-3d-cyber uppercase">
          AARODRIVA
        </h1>

        <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Autonomous Satellite Radar & Evacuation Intelligence Engine
        </p>
      </div>

      {/* Progress Bar & Telemetry Feedback */}
      <div className="w-full max-w-md mt-10 space-y-3 z-10">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-300/90 px-1">
          <span className="truncate pr-2">{statusText}</span>
          <span className="font-bold text-cyan-400">{progress}%</span>
        </div>

        <div className="w-full h-2 bg-slate-900/90 border border-cyan-500/30 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(56,189,248,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-[11px] text-slate-500 tracking-wider">
          Click anywhere to skip intro • Autonomous EOC Core
        </p>
      </div>
    </div>
  );
}
