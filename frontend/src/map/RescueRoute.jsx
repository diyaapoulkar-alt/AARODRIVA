import React from "react";
import { Polyline, Popup, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

// Custom Icon for Road Blockage / Submerged Point
const blockedIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600/90 border-2 border-white shadow-lg shadow-rose-600/50 animate-bounce">
      <span class="text-xs font-black text-white">⛔</span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Custom Icon for Rescue Route Waypoint
const routeIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 border border-white shadow-md shadow-emerald-500/50">
      <span class="text-[10px] font-bold text-white">🚑</span>
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
            <React.Fragment key={road.id}>
              {/* Outer hazard aura */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#ef4444",
                  weight: 8,
                  opacity: 0.4,
                  lineCap: "round",
                }}
              />
              {/* Core dashed blocked line */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#dc2626",
                  weight: 4,
                  dashArray: "8, 6",
                  opacity: 0.95,
                  lineCap: "round",
                }}
              >
                <Tooltip permanent direction="top" className="hazard-tooltip">
                  <span className="font-mono text-[10px] font-black text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-500/60 shadow">
                    ⛔ BLOCKED: {road.name}
                  </span>
                </Tooltip>
                <Popup>
                  <div className="text-xs space-y-1.5 font-mono p-1">
                    <p className="font-bold text-rose-400 text-sm">⛔ ROAD BLOCKED</p>
                    <p className="font-semibold text-white">{road.name}</p>
                    <p className="text-slate-300">
                      Hazard Cause: <span className="text-amber-300 font-bold">{road.reason}</span>
                    </p>
                    {road.waterDepth && (
                      <p className="text-cyan-300">
                        Submerged Depth: <span className="font-bold">{road.waterDepth}m</span>
                      </p>
                    )}
                    <p className="text-rose-400 font-semibold text-[11px] pt-1 border-t border-slate-700">
                      RescueRoute AI has automatically diverted all emergency vehicles away from this link.
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {/* Center Hazard Marker */}
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

      {/* Safe Dijkstra Rescue Routes */}
      {showRescue &&
        rescueRoutes.map((route) => {
          if (!route.coordinates || route.coordinates.length === 0) return null;
          const endPoint = route.coordinates[route.coordinates.length - 1];

          return (
            <React.Fragment key={route.id}>
              {/* Glowing green path aura */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#10b981",
                  weight: 7,
                  opacity: 0.35,
                  lineCap: "round",
                }}
              />
              {/* Core animated dashline */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#059669",
                  weight: 4,
                  dashArray: "12, 8",
                  opacity: 0.95,
                  lineCap: "round",
                }}
              >
                <Tooltip permanent direction="bottom" className="safe-route-tooltip">
                  <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/60 shadow">
                    🟢 {route.name} ({route.etaMinutes || 16} mins)
                  </span>
                </Tooltip>
                <Popup>
                  <div className="text-xs space-y-1.5 font-mono p-1">
                    <p className="font-bold text-emerald-400 text-sm">🟢 RESCUEROUTE AI CLEAR PATH</p>
                    <p className="font-semibold text-white">{route.name}</p>
                    {route.description && (
                      <p className="text-slate-300 text-[11px]">{route.description}</p>
                    )}
                    <div className="flex gap-3 text-slate-300 pt-1 border-t border-slate-700">
                      <p>ETA: <span className="text-emerald-300 font-bold">{route.etaMinutes || 16} mins</span></p>
                      {route.distanceKm && (
                        <p>Distance: <span className="text-white font-bold">{route.distanceKm} km</span></p>
                      )}
                    </div>
                    <p className="text-emerald-400 text-[11px] font-semibold">
                      Path verified: Elevation &gt; 52m (Above high water level).
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {/* Waypoint Marker at Destination */}
              {endPoint && (
                <Marker position={endPoint} icon={routeIcon}>
                  <Popup>
                    <div className="text-xs font-mono">
                      <p className="font-bold text-emerald-400">DISPATCH DESTINATION</p>
                      <p className="text-white">{route.name}</p>
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
