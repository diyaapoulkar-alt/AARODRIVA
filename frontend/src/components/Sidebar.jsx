import React from "react";
import { Layers, Waves, Route, Ban, Siren, Tent } from "lucide-react";

const LAYER_CONFIG = [
  { key: "floodZones", label: "Flood Zones", color: "bg-cyan-400", icon: Waves },
  { key: "rescueRoutes", label: "Rescue Routes", color: "bg-emerald-400", icon: Route },
  { key: "blockedRoads", label: "Blocked Roads", color: "bg-red-500", icon: Ban },
  { key: "incidents", label: "SOS & Marooned", color: "bg-red-500", icon: Siren },
  { key: "camps", label: "Rescue Camps", color: "bg-amber-400", icon: Tent },
];

export default function Sidebar({ layers, onToggleLayer }) {
  return (
    <aside className="w-60 bg-[#0a1428] border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Map Layers</span>
        </div>

        <div className="space-y-2">
          {LAYER_CONFIG.map(({ key, label, color, icon: Icon }) => {
            const active = layers[key];
            return (
              <button
                key={key}
                onClick={() => onToggleLayer(key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition ${
                  active
                    ? "bg-slate-800/90 border-slate-600 text-white"
                    : "bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    active ? color : "bg-slate-700"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactical Legend */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Tactical Legend
        </p>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-cyan-400/50 border border-cyan-400" />
            <span>Inundated Flood Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-300" />
            <span>Active Rescue Corridor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-red-500 rounded" />
            <span>Blocked / Submerged Road</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Active SOS Distress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Warning / Relief Camp</span>
          </div>
        </div>
      </div>
    </aside>
  );
}