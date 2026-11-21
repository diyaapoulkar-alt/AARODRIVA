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
  [26.155, 91.820],
];

export default function FloodLayer({ floodZones = [] }) {
  // Check if viewing Assam basin
  const hasAssamZones = floodZones.some(
    (z) => z.coordinates && z.coordinates[0] && Math.abs(z.coordinates[0][0] - 26.158) < 1.2
  );

  return (
    <>
      {/* Brahmaputra River Channel (When in Assam Theater) */}
      {hasAssamZones && (
        <Polyline
          positions={BRAHMAPUTRA_RIVER}
          pathOptions={{
            color: "#0284c7",
            weight: 14,
            opacity: 0.65,
            lineCap: "round",
            lineJoin: "round",
          }}
        >
          <Tooltip permanent direction="center" className="river-tooltip">
            <span className="font-mono text-[10px] font-bold text-sky-200 uppercase tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/50">
              🌊 Brahmaputra River (Water Level: 51.1m — Severe Overflow)
            </span>
          </Tooltip>
        </Polyline>
      )}

      {/* Inundated Flood Polygons Worldwide */}
      {floodZones.map((zone) => {
        if (!zone.coordinates || zone.coordinates.length < 3) return null;
        const isCritical = zone.severity === "CRITICAL";

        return (
          <Polygon
            key={zone.id || Math.random()}
            positions={zone.coordinates}
            pathOptions={{
              color: isCritical ? "#00f0ff" : "#38bdf8",
              fillColor: isCritical ? "#06b6d4" : "#0284c7",
              fillOpacity: isCritical ? 0.48 : 0.35,
              weight: isCritical ? 3.5 : 2.5,
              dashArray: isCritical ? "4, 6" : null,
            }}
          >
            <Tooltip permanent={isCritical} direction="center" className="flood-zone-tooltip">
              <span className="font-mono text-[10px] font-bold text-cyan-300 bg-slate-950/95 px-2 py-0.5 rounded border border-cyan-500/60 shadow">
                🌊 {zone.name} ({zone.depthMeters || 1.8}m depth)
              </span>
            </Tooltip>
            <Popup>
              <div className="text-xs space-y-1.5 font-mono p-1">
                <p className="font-bold text-cyan-300 text-sm">{zone.name}</p>
                {zone.region && (
                  <p className="text-slate-400 text-[11px]">Region: <span className="text-slate-200">{zone.region}</span></p>
                )}
                <p className="text-slate-300">
                  Severity: <span className={isCritical ? "text-rose-400 font-bold" : "text-amber-300 font-bold"}>{zone.severity}</span>
                </p>
                <p className="text-slate-300">
                  Sensor: <span className="text-white font-semibold">{zone.sensor || "Satellite C-Band Radar Telemetry"}</span>
                </p>
                <p className="text-slate-300">
                  Submerged Water Depth: <span className="text-cyan-200 font-bold">{zone.depthMeters} meters</span>
                </p>
                <p className="text-amber-400 text-[11px] font-semibold pt-1 border-t border-slate-700">
                  ⚠️ Direct vehicle transit strictly prohibited. RescueRoute AI bypass active.
                </p>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}
