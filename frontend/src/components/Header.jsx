import React from 'react';

export default function Header({ onOpenSOS, onOpenSitrep, metrics }) {
  return (
    <header className="border-b border-slate-800 bg-tactical-800/80 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
      {/* Brand & Mission Tagline */}
      <div className="flex items-center space-x-3.5">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl tracking-wider">
          A
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AARODRIVA AI
              <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-semibold tracking-wider">
                EOC ACTIVE
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <span>ISRO Space Intelligence: Bhoonidhi · Bhuvan · MOSDAC</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Assam Floodplain Sector</span>
          </p>
        </div>
      </div>

      {/* NavIC Satellite Constellation Status & Quick Actions */}
      <div className="flex items-center space-x-3 text-xs">
        {/* NavIC Satellite Health Pill */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono">
            NavIC: <strong className="text-emerald-400 font-semibold">{metrics?.navic_satellites_locked || 7} Sats</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">L5/S-Band</span>
        </div>

        {/* SOS Citizen Beacon Trigger */}
        <button
          onClick={onOpenSOS}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <span className="animate-pulse">🚨</span>
          <span>Citizen SOS (NavIC)</span>
        </button>

        {/* SITREP Briefing Button */}
        <button
          onClick={onOpenSitrep}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium"
        >
          <span>📋</span>
          <span>EOC SITREP</span>
        </button>
      </div>
    </header>
  );
}
