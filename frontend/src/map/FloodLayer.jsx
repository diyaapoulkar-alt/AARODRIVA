import React from "react";
import { Polygon, Polyline, Popup, Tooltip } from "react-leaflet";

// Major Brahmaputra River Centerline Course through Guwahati / Kamrup
const BRAHMAPUTRA_RIVER = [
  [26.205, 91.660],
  [26.198, 91.685],
  [26.188, 91.710],
  [26.182, 91.730],
  [26.176, 91.750],
  [26.170, 91.770],
  [26.160, 91.795],
  [26.155, 91.820]
];

export default function FloodLayer({ floodZones = [] }) {
  return (
    <>
      {/* Brahmaputra River Channel */}
      <Polyline
        positions={BRAHMAPUTRA_RIVER}
        pathOptions={{
          color: "#0284c7",
          weight: 14,
          opacity: 0.65,
          lineCap: "round",
          lineJoin: "round"
        }}
      >
        <Tooltip permanent direction="center" className="river-tooltip">
          <span className="font-mono text-[10px] font-bold text-sky-200 uppercase tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/50">
            🌊 Brahmaputra River (Water Level: 51.1m — Severe Overflow)
          </span>
        </Tooltip>
      </Polyline>

      {/* Inundated Flood Polygons */}
      {floodZones.map((zone) => {
        const isCritical = zone.severity === "CRITICAL";
        return (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              color: isCritical ? "#00f0ff" : "#38bdf8",
              fillColor: isCritical ? "#06b6d4" : "#0284c7",
              fillOpacity: isCritical ? 0.45 : 0.32,
              weight: isCritical ? 3 : 2,
              dashArray: isCritical ? "4, 6" : null
            }}
          >
            <Tooltip permanent={isCritical} direction="center" className="flood-zone-tooltip">
              <span className="font-mono text-[10px] font-bold text-cyan-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-cyan-500/50">
                {zone.name} ({zone.depthMeters}m depth)
              </span>
            </Tooltip>
            <Popup>
              <div className="text-xs space-y-1.5 font-mono">
                <p className="font-bold text-cyan-300 text-sm">{zone.name}</p>
                <p className="text-slate-300">
                  Severity: <span className="text-rose-400 font-bold">{zone.severity}</span>
                </p>
                <p className="text-slate-300">
                  Sensor: <span className="text-white font-semibold">ISRO Bhoonidhi RISAT-1A C-SAR</span>
                </p>
                <p className="text-slate-300">
                  Submerged Water Depth: <span className="text-cyan-200 font-bold">{zone.depthMeters} meters</span>
                </p>
                <p className="text-amber-400 text-[11px] font-semibold">
                  ⚠️ Direct vehicle transit strictly prohibited.
                </p>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}
