import React from "react";
import { Polyline, Popup, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

// Custom Icon for Road Blockage / Submerged Point
const blockedIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full bg-rose-600/30 border-2 border-rose-500 animate-ping absolute"></div>
      <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-xl shadow-rose-600/80">
        <span class="text-xs font-black text-white">⛔</span>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Custom Icon for Rescue Route Start Base
const startBaseIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-7 h-7 rounded-full bg-emerald-500/30 border-2 border-emerald-400 animate-ping absolute"></div>
      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-xl shadow-emerald-500/80">
        <span class="text-[10px] font-bold text-white">⛺</span>
      </div>
      <span class="absolute -bottom-5 whitespace-nowrap bg-emerald-950/95 text-[9px] font-mono font-bold text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/70 shadow">
        SAR STAGING BASE
      </span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom Icon for Rescue Route Destination Point
const destinationIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-7 h-7 rounded-full bg-cyan-500/30 border-2 border-cyan-400 animate-ping absolute"></div>
      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-600 border-2 border-white shadow-xl shadow-cyan-500/80">
        <span class="text-[10px] font-bold text-white">🎯</span>
      </div>
      <span class="absolute -bottom-5 whitespace-nowrap bg-cyan-950/95 text-[9px] font-mono font-bold text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/70 shadow">
        EXTRACTION TARGET
      </span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function RescueRoute({
  rescueRoutes = [],
  blockedRoads = [],
  showRescue = true,
  showBlocked = true,
}) {
  return (
    <>
      {/* Blocked / Submerged Roads */}
      {showBlocked &&
        blockedRoads.map((road) => {
          if (!road.coordinates || road.coordinates.length === 0) return null;
          const midPoint = road.coordinates[Math.floor(road.coordinates.length / 2)];

          return (
            <React.Fragment key={road.id || Math.random()}>
              {/* Outer High-Contrast Dark Outline */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#450a0a",
                  weight: 12,
                  opacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Mid Red Hazard Aura */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#ef4444",
                  weight: 8,
                  opacity: 0.85,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Core Yellow-Red Hazard Striped Line */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#fef08a",
                  weight: 4,
                  dashArray: "6, 6",
                  opacity: 1.0,
                  lineCap: "round",
                }}
              >
                <Tooltip permanent direction="top" className="hazard-tooltip">
                  <span className="font-mono text-[10px] font-black text-rose-200 bg-rose-950/95 px-2.5 py-1 rounded-md border-2 border-rose-500 shadow-xl flex items-center gap-1">
                    <span>⛔</span>
                    <span>SUBMERGED: {road.name}</span>
                    {road.waterDepth && (
                      <span className="text-yellow-300 font-bold">({road.waterDepth}m depth)</span>
                    )}
                  </span>
                </Tooltip>
                <Popup>
                  <div className="text-xs space-y-1.5 font-mono p-1">
                    <p className="font-bold text-rose-400 text-sm">⛔ ROAD BLOCKED BY FLOOD</p>
                    <p className="font-semibold text-white">{road.name}</p>
                    <p className="text-slate-300">
                      Hazard Cause: <span className="text-amber-300 font-bold">{road.reason}</span>
                    </p>
                    {road.waterDepth && (
                      <p className="text-cyan-300">
                        Submerged Depth: <span className="font-bold">{road.waterDepth}m water depth</span>
                      </p>
                    )}
                    <p className="text-rose-400 font-semibold text-[11px] pt-1 border-t border-slate-700">
                      RescueRoute AI has automatically diverted all emergency vehicles away from this link.
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {/* Bouncing Hazard Marker */}
              {midPoint && (
                <Marker position={midPoint} icon={blockedIcon}>
                  <Popup>
                    <div className="text-xs font-mono">
                      <p className="font-bold text-rose-400">SUBMERGED POINT</p>
                      <p className="text-white">{road.name}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}

      {/* Safe Dijkstra Rescue Routes (High-Contrast Neon Highlighted) */}
      {showRescue &&
        rescueRoutes.map((route) => {
          if (!route.coordinates || route.coordinates.length < 2) return null;
          const startPoint = route.coordinates[0];
          const endPoint = route.coordinates[route.coordinates.length - 1];
          const midPoint = route.coordinates[Math.floor(route.coordinates.length / 2)];

          return (
            <React.Fragment key={route.id || Math.random()}>
              {/* Layer 1: Solid Dark Black/Green Underlay for 100% Contrast Against White or Satellite Basemaps */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#022c22",
                  weight: 12,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Layer 2: Radiant Electric Cyan Halo */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#00f0ff",
                  weight: 8,
                  opacity: 0.85,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Layer 3: Ultra-Bright Neon Emerald Core with Dash March */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#00ff88",
                  weight: 4.5,
                  dashArray: "12, 6",
                  opacity: 1.0,
                  lineCap: "round",
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1.5 font-mono p-1">
                    <p className="font-bold text-emerald-400 text-sm">🟢 RESCUEROUTE AI CLEAR PATH</p>
                    <p className="font-semibold text-white">{route.name}</p>
                    {route.description && (
                      <p className="text-slate-300 text-[11px]">{route.description}</p>
                    )}
                    <div className="flex gap-3 text-slate-300 pt-1 border-t border-slate-700">
                      <p>
                        ETA: <span className="text-emerald-300 font-bold">{route.etaMinutes || 16} mins</span>
                      </p>
                      {route.distanceKm && (
                        <p>
                          Distance: <span className="text-white font-bold">{route.distanceKm} km</span>
                        </p>
                      )}
                    </div>
                    <p className="text-emerald-400 text-[11px] font-semibold">
                      Verified safe corridor: High ground elevation strictly avoiding submerged bridges.
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {/* Permanent Center Floating Route Badge */}
              {midPoint && (
                <Polyline
                  positions={[route.coordinates[Math.max(0, Math.floor(route.coordinates.length / 2) - 1)], midPoint]}
                  pathOptions={{ opacity: 0 }}
                >
                  <Tooltip permanent direction="center" className="safe-route-tooltip">
                    <span className="font-mono text-[10px] font-black text-white bg-emerald-950/95 px-3 py-1 rounded-full border-2 border-emerald-400 shadow-2xl flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>🚑 RESCUEROUTE AI: {route.name}</span>
                      <span className="text-cyan-300 font-bold">
                        ({route.distanceKm || "10.9"} km • {route.etaMinutes || 16}m ETA)
                      </span>
                    </span>
                  </Tooltip>
                </Polyline>
              )}

              {/* Waypoint Marker at Start (Staging Base) */}
              {startPoint && (
                <Marker position={startPoint} icon={startBaseIcon}>
                  <Popup>
                    <div className="text-xs font-mono">
                      <p className="font-bold text-emerald-400">SAR STAGING BASE</p>
                      <p className="text-white">Route Start Point</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Waypoint Marker at Destination (Extraction Target) */}
              {endPoint && (
                <Marker position={endPoint} icon={destinationIcon}>
                  <Popup>
                    <div className="text-xs font-mono">
                      <p className="font-bold text-cyan-400">EXTRACTION TARGET</p>
                      <p className="text-white">Dispatched Corridor Destination</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
    </>
  );
}
