import React from "react";

export default function AarodrivaLogo({
  size = 64,
  className = "",
  showGlow = true,
  animate = true,
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Pulsing Radar Aura */}
      {showGlow && (
        <div
          className={`absolute inset-0 rounded-full bg-cyan-500/25 blur-xl pointer-events-none ${
            animate ? "animate-pulse" : ""
          }`}
          style={{ animationDuration: "3s" }}
        />
      )}

      {/* Bespoke Elite AARODRIVA SVG Crest */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_20px_rgba(6,182,212,0.45)]"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="emeraldCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Orbit Track (Tilted Ellipse) */}
        <ellipse
          cx="60"
          cy="60"
          rx="52"
          ry="20"
          transform="rotate(-28 60 60)"
          stroke="#06b6d4"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          opacity="0.45"
        />

        {/* Orbiting Satellite Node 1 */}
        <circle cx="20" cy="42" r="2.5" fill="#38bdf8" className={animate ? "animate-ping" : ""} />
        <circle cx="20" cy="42" r="2" fill="#ffffff" />

        {/* Orbiting Satellite Node 2 */}
        <circle cx="100" cy="78" r="2" fill="#34d399" />

        {/* 2. Outer Faceted Cyber-Shield Contour */}
        <path
          d="M 60 8 
             L 102 24 
             L 108 64 
             L 86 102 
             L 60 114 
             L 34 102 
             L 12 64 
             L 18 24 
             Z"
          fill="url(#shieldGradient)"
          stroke="url(#neonCyan)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Inner Tactical Border Inset */}
        <path
          d="M 60 16 
             L 95 30 
             L 100 64 
             L 80 96 
             L 60 106 
             L 40 96 
             L 20 64 
             L 25 30 
             Z"
          fill="#061126"
          fillOpacity="0.85"
          stroke="#0284c7"
          strokeWidth="1"
          strokeDasharray="12 4"
          opacity="0.75"
        />

        {/* 3. Radar Reticle Crosshairs */}
        <circle cx="60" cy="62" r="28" stroke="#0891b2" strokeWidth="0.8" opacity="0.4" />
        <circle cx="60" cy="62" r="18" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
        <line x1="60" y1="28" x2="60" y2="96" stroke="#06b6d4" strokeWidth="0.8" opacity="0.25" />
        <line x1="28" y1="62" x2="92" y2="62" stroke="#06b6d4" strokeWidth="0.8" opacity="0.25" />

        {/* 4. Sharp Aerodynamic Delta "A" Monogram */}
        {/* Left Wing */}
        <path
          d="M 60 26 
             L 36 86 
             L 48 86 
             L 60 52 
             Z"
          fill="url(#neonCyan)"
        />
        {/* Right Wing */}
        <path
          d="M 60 26 
             L 84 86 
             L 72 86 
             L 60 52 
             Z"
          fill="url(#neonCyan)"
          opacity="0.9"
        />

        {/* Horizontal Laser Ridge / NavIC Telemetry Bridge */}
        <path
          d="M 44 68 
             L 76 68 
             L 74 74 
             L 46 74 
             Z"
          fill="url(#emeraldCore)"
          filter="url(#neonFilter)"
        />

        {/* 5. Central Disaster Telemetry Beacon (Heart) */}
        <circle cx="60" cy="62" r="4.5" fill="#ffffff" />
        <circle cx="60" cy="62" r="3" fill="#00ff88" />
        <circle cx="60" cy="62" r="1.5" fill="#ffffff" />

        {/* Apex Crown Pip */}
        <polygon points="60,18 63,23 57,23" fill="#38bdf8" />
      </svg>
    </div>
  );
}
