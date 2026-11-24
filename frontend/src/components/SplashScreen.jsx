import React, { useState, useEffect } from "react";
import AarodrivaLogo from "./AarodrivaLogo";

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING ORBITAL RADAR");

  useEffect(() => {
    const steps = [
      { at: 25, text: "LOCKING ISRO & SENTINEL SAR FEEDS" },
      { at: 55, text: "INGESTING TOPOGRAPHIC ELEVATION MESH" },
      { at: 80, text: "COMPUTING RESCUEROUTE AI GRAPHS" },
      { at: 96, text: "DISASTER COMMAND ONLINE" },
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
          }, 250);
          return 100;
        }
        return next;
      });
    }, 35);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center p-6 text-slate-100 cursor-pointer overflow-hidden select-none"
    >
      {/* Deep Space Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-[#030816] to-[#01040a] pointer-events-none" />

      {/* Subtle Orbital Halo Rings */}
      <div
        className="absolute w-[440px] h-[440px] rounded-full border border-cyan-500/15 pointer-events-none animate-spin"
        style={{ animationDuration: "35s" }}
      />
      <div
        className="absolute w-[320px] h-[320px] rounded-full border border-cyan-400/20 pointer-events-none animate-spin"
        style={{ animationDuration: "20s", animationDirection: "reverse" }}
      />

      {/* Elite Bespoke Logo Centerpiece */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Soft Radar Wave Ping */}
        <div className="absolute w-28 h-28 rounded-full border border-cyan-400/30 animate-wave-ping" />
        <AarodrivaLogo size={96} animate={true} showGlow={true} />
      </div>

      {/* Clean Minimal Typography */}
      <div className="text-center space-y-1 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.25em] text-white text-3d-cyber uppercase">
          AARODRIVA
        </h1>
        <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.3em] text-cyan-400/90 uppercase">
          SATELLITE DISASTER INTELLIGENCE
        </p>
      </div>

      {/* Sleek Minimal Progress Meter */}
      <div className="w-full max-w-xs mt-8 space-y-2.5 z-10">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400 px-0.5">
          <span className="text-cyan-300 font-bold">{statusText}</span>
          <span className="text-emerald-400 font-bold">{progress}%</span>
        </div>

        <div className="w-full h-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-[10px] font-mono text-slate-500 tracking-wider">
          CLICK ANYWHERE TO ENTER
        </p>
      </div>
    </div>
  );
}
