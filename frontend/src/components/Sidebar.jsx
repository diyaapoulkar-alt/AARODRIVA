import React from "react";
import { Layers, Waves, Route, Ban, Siren, Tent, Ship, Cpu, Truck } from "lucide-react";

const LAYER_CONFIG = [
  { key: "floodZones", label: "Flood Zones", color: "bg-cyan-400", icon: Waves },
  { key: "rescueRoutes", label: "Rescue Routes", color: "bg-emerald-400", icon: Route },
  { key: "blockedRoads", label: "Blocked Roads", color: "bg-red-500", icon: Ban },
  { key: "incidents", label: "SOS & Marooned", color: "bg-red-500", icon: Siren },
  { key: "camps", label: "Rescue Camps", color: "bg-amber-400", icon: Tent },
];

const UNIT_ICON = { BOAT: Ship, DRONE: Cpu, AMBULANCE: Truck };

export default function Sidebar({ layers, onToggleLayer, fleet = [], isDark }) {
  return (
    <aside
      className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 overflow-y-auto transition-colors ${
        isDark
          ? "bg-[#0a1428] border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="space-y-6">
        {/* Map Layers */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Map Layers</span>
          </div>

          <div className="space-y-1.5">
            {LAYER_CONFIG.map(({ key, label, color, icon: Icon }) => {
              const active = layers[key];
              return (
                <button
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                    active
                      ? isDark
                        ? "bg-slate-800/90 border-slate-600 text-white"
                        : "bg-sky-50 border-sky-300 text-slate-900"
                      : isDark
                      ? "bg-slate-900/40 border-slate-800/80 text-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${active ? color : "bg-slate-500/40"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature #5: NDRF Fleet & Drone Live Status */}
        <div className="pt-4 border-t border-slate-700/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              NDRF Fleet Status
            </span>
            <span className="text-[10px] font-bold text-emerald-500">
              {fleet.filter((u) => u.status === "IDLE").length} Ready
            </span>
          </div>

          <div className="space-y-2">
            {fleet.map((unit) => {
              const Icon = UNIT_ICON[unit.type] || Ship;
              const isBusy = unit.status === "EN ROUTE";
              return (
                <div
                  key={unit.id}
                  className={`p-2.5 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#0d1930] border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-cyan-500" />
                      {unit.name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        isBusy
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-emerald-500/20 text-emerald-500"
                      }`}
                    >
                      {isBusy ? `→ ${unit.assignedTo}` : "IDLE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                    <span>{unit.type === "DRONE" ? "Battery" : "Fuel"}</span>
                    <span>{unit.power}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        unit.power > 50 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${unit.power}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}