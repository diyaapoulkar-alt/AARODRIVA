import React from 'react';

export default function MetricCards({ metrics, activeRouteInfo }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
      {/* Metric 1: Inundation Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Satellite Inundation</p>
            <h3 className="text-2xl font-black text-white mt-0.5 tracking-tight font-mono">
              {metrics?.inundation_area_sqkm || 142.8} <span className="text-sm font-normal text-slate-400">km²</span>
            </h3>
          </div>
          <span className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-lg">🛰️</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span>Sensor: <strong className="text-cyan-300">RISAT-1A C-SAR</strong></span>
          <span className="text-emerald-400">Bhoonidhi Feed</span>
        </div>
      </div>

      {/* Metric 2: Marooned Villages */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
        <div className="absolute top-0 left-0 h-1 w-full bg-rose-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Marooned Settlements</p>
            <h3 className="text-2xl font-black text-rose-400 mt-0.5 tracking-tight font-mono">
              {metrics?.marooned_settlements_count || 2} <span className="text-xs text-rose-300 font-normal">Cut Off</span>
            </h3>
          </div>
          <span className="p-2 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40 text-lg">⚠️</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span>Population: <strong className="text-rose-300">{metrics?.marooned_population || 1020} souls</strong></span>
          <span className="text-amber-400">Bridges Down</span>
        </div>
      </div>

      {/* Metric 3: Active SOS Beacons */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
        <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active SOS Beacons</p>
            <h3 className="text-2xl font-black text-amber-400 mt-0.5 tracking-tight font-mono">
              {metrics?.active_sos_count || 3} <span className="text-xs text-slate-400 font-normal">Pending</span>
            </h3>
          </div>
          <span className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40 text-lg">🚨</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span>Stranded: <strong className="text-amber-300">{metrics?.total_stranded_count || 24} people</strong></span>
          <span className="text-emerald-400">NavIC Pings</span>
        </div>
      </div>

      {/* Metric 4: RescueRoute AI Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
        <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">RescueRoute Engine</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-0.5 tracking-tight font-mono">
              {activeRouteInfo ? `${activeRouteInfo.total_distance_km} km` : 'Dijkstra AI'}
            </h3>
          </div>
          <span className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-lg">🛣️</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span>{activeRouteInfo ? `Bypassed: ${activeRouteInfo.avoided_flooded_roads_count} Flood Hazards` : 'Flood Bypass Ready'}</span>
          <span className="text-emerald-400">Optimal Safe Path</span>
        </div>
      </div>
    </div>
  );
}
