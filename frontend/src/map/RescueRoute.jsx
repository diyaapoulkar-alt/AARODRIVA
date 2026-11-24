import React from "react";
import { Polyline, Popup, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

// Helper to calculate an isometric ground drop-shadow path
function getIsometricShadowCoords(coords, offsetLat = -0.0006, offsetLon = 0.0006) {
  if (!coords || !Array.isArray(coords)) return [];
  return coords.map(([lat, lon]) => [lat + offsetLat, lon + offsetLon]);
}

// 3D Isometric Icon for Submerged / Blocked Road Point
const blocked3DIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center transform-3d group cursor-pointer">
      <!-- Ground Shadow Pill -->
      <div class="w-8 h-3 rounded-full bg-black/60 blur-[2px] absolute top-5 left-1 -rotate-6"></div>
      <!-- Animated Warning Pulse Ring -->
      <div class="w-8 h-8 rounded-full bg-rose-600/30 border-2 border-rose-500 animate-ping absolute"></div>
      <!-- 3D Popping Hazard Core -->
      <div class="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-white shadow-[0_6px_14px_rgba(225,29,72,0.8)] -translate-y-1 transition hover:-translate-y-2">
        <span class="text-xs font-black text-white drop-shadow">⛔</span>
      </div>
      <!-- Elevated 3D Badge -->
      <div class="absolute -bottom-5 whitespace-nowrap bg-rose-950/95 text-[9px] font-mono font-bold text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/80 shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
        ROAD SEVERED
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// 3D Isometric Icon for Safe Staging Base
const startBase3DIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center transform-3d group cursor-pointer">
      <!-- Ground Shadow Pill -->
      <div class="w-9 h-3 rounded-full bg-black/60 blur-[2px] absolute top-5 left-1 -rotate-6"></div>
      <!-- Emerald Radar Ping -->
      <div class="w-8 h-8 rounded-full bg-emerald-500/30 border-2 border-emerald-400 animate-ping absolute"></div>
      <!-- 3D Popping Hex/Square -->
      <div class="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-white shadow-[0_6px_16px_rgba(16,185,129,0.9)] -translate-y-1 transition hover:-translate-y-2">
        <span class="text-xs font-bold text-white drop-shadow">⛺</span>
      </div>
      <!-- Elevated 3D Badge -->
      <div class="absolute -bottom-5 whitespace-nowrap bg-emerald-950/95 text-[9px] font-mono font-black text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/90 shadow-[0_4px_12px_rgba(0,0,0,0.7)] flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>SAR STAGING BASE (+48m)</span>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// 3D Isometric Icon for Rescue Destination Target
const destination3DIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center transform-3d group cursor-pointer">
      <!-- Ground Shadow Pill -->
      <div class="w-9 h-3 rounded-full bg-black/60 blur-[2px] absolute top-5 left-1 -rotate-6"></div>
      <!-- Cyan Radar Ping -->
      <div class="w-8 h-8 rounded-full bg-cyan-500/30 border-2 border-cyan-400 animate-ping absolute"></div>
      <!-- 3D Popping Target Core -->
      <div class="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white shadow-[0_6px_16px_rgba(6,182,212,0.9)] -translate-y-1 transition hover:-translate-y-2">
        <span class="text-xs font-bold text-white drop-shadow">🎯</span>
      </div>
      <!-- Elevated 3D Badge -->
      <div class="absolute -bottom-5 whitespace-nowrap bg-cyan-950/95 text-[9px] font-mono font-black text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/90 shadow-[0_4px_12px_rgba(0,0,0,0.7)] flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span>EXTRACTION TARGET</span>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// 3D Waypoint Pin for Intermediate Ridge Checkpoint
const ridgeWaypoint3DIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center transform-3d">
      <div class="w-5 h-2 rounded-full bg-black/50 blur-[1px] absolute top-3"></div>
      <div class="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-md flex items-center justify-center -translate-y-1">
        <span class="text-[8px] font-black text-slate-950">▲</span>
      </div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function RescueRoute({
  rescueRoutes = [],
  blockedRoads = [],
  showRescue = true,
  showBlocked = true,
}) {
  return (
    <>
      {/* ======================================================== */}
      {/* 1. BLOCKED / SUBMERGED ROADS (3D ELEVATED HAZARD TRENCH) */}
      {/* ======================================================== */}
      {showBlocked &&
        blockedRoads.map((road) => {
          if (!road.coordinates || road.coordinates.length === 0) return null;
          const midPoint = road.coordinates[Math.floor(road.coordinates.length / 2)];
          const shadowCoords = getIsometricShadowCoords(road.coordinates, -0.0007, 0.0007);

          return (
            <React.Fragment key={road.id || Math.random()}>
              {/* Layer 1: Ground Cast Shadow (gives elevated / popping depth) */}
              <Polyline
                positions={shadowCoords}
                pathOptions={{
                  color: "#000000",
                  weight: 15,
                  opacity: 0.55,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Layer 2: Deep Crimson Under-chassis Casing */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#450a0a",
                  weight: 11,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Layer 3: Warning Red Neon Aura */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#ef4444",
                  weight: 7,
                  opacity: 0.85,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Layer 4: Animated Hazard Striping with Moving Warning Pulse */}
              <Polyline
                positions={road.coordinates}
                pathOptions={{
                  color: "#fef08a",
                  weight: 3.5,
                  dashArray: "8, 8",
                  className: "hazard-pulse-3d",
                  opacity: 1.0,
                  lineCap: "round",
                }}
              >
                <Tooltip permanent direction="top" className="hazard-tooltip">
                  <span className="font-mono text-[10px] font-black text-rose-200 bg-rose-950/95 px-3 py-1 rounded-lg border-2 border-rose-500 shadow-[0_4px_16px_rgba(244,63,94,0.6)] flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="animate-pulse">⛔</span>
                    <span>SUBMERGED: {road.name}</span>
                    {road.waterDepth && (
                      <span className="text-amber-300 font-bold">({road.waterDepth}m depth)</span>
                    )}
                  </span>
                </Tooltip>

                <Popup>
                  <div className="text-xs space-y-1.5 font-mono p-1">
                    <div className="flex items-center gap-1.5 text-rose-400 font-black text-sm">
                      <span>⛔</span>
                      <span>ROAD IMPASSABLE (SUBMERGED)</span>
                    </div>
                    <p className="font-semibold text-white text-xs">{road.name}</p>
                    <p className="text-slate-300">
                      Hazard Cause:{" "}
                      <span className="text-amber-300 font-bold">{road.reason || "Flash Inundation"}</span>
                    </p>
                    {road.waterDepth && (
                      <p className="text-cyan-300">
                        Peak Water Depth: <span className="font-bold">{road.waterDepth}m above tarmac</span>
                      </p>
                    )}
                    <div className="pt-1.5 border-t border-slate-700/80 text-[11px] text-rose-400 font-semibold">
                      RescueRoute AI has dynamically isolated this segment and rerouted all emergency convoys.
                    </div>
                  </div>
                </Popup>
              </Polyline>

              {/* Floating 3D Hazard Point Marker */}
              {midPoint && (
                <Marker position={midPoint} icon={blocked3DIcon}>
                  <Popup>
                    <div className="text-xs font-mono">
                      <p className="font-bold text-rose-400">⛔ INUNDATION POINT</p>
                      <p className="text-white">{road.name}</p>
                      <p className="text-amber-300 text-[11px]">Water Depth: {road.waterDepth || 1.4}m</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}

      {/* ======================================================== */}
      {/* 2. SAFE RESCUE ROUTES (3D ELEVATED POPPING CONDUIT PIPE)  */}
      {/* ======================================================== */}
      {showRescue &&
        rescueRoutes.map((route) => {
          if (!route.coordinates || route.coordinates.length < 2) return null;
          const startPoint = route.coordinates[0];
          const endPoint = route.coordinates[route.coordinates.length - 1];
          const midPoint = route.coordinates[Math.floor(route.coordinates.length / 2)];
          const shadowCoords = getIsometricShadowCoords(route.coordinates, -0.0008, 0.0008);

          return (
            <React.Fragment key={route.id || Math.random()}>
              {/* 3D Tier 1: Isometric Ground Cast Shadow (renders underneath route on terrain) */}
              <Polyline
                positions={shadowCoords}
                pathOptions={{
                  color: "#000000",
                  weight: 18,
                  opacity: 0.55,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* 3D Tier 2: Dark Cyber Under-chassis Base (Conduit Foundation) */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#022c22",
                  weight: 13,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* 3D Tier 3: Radiant Electric Cyan Halo Tube */}
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

              {/* 3D Tier 4: Ultra-Bright Neon Emerald Core Conduit */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#00ff88",
                  weight: 4.5,
                  opacity: 1.0,
                  lineCap: "round",
                }}
              />

              {/* 3D Tier 5: Animated Directional Convoy Pulse Flow (Moving White Laser Energy Stream) */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2.2,
                  dashArray: "10, 16",
                  className: "rescue-route-pulse-3d",
                  opacity: 0.95,
                  lineCap: "round",
                }}
              >
                <Popup>
                  <div className="text-xs space-y-2 font-mono p-1">
                    <div className="flex items-center gap-2 border-b border-emerald-500/30 pb-1.5">
                      <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">🚑</span>
                      <div>
                        <p className="font-black text-emerald-400 text-sm">3D ELEVATED RESCUEROUTE AI</p>
                        <p className="text-[10px] text-cyan-300">Dijkstra Topographic Safe Corridor</p>
                      </div>
                    </div>

                    <p className="font-bold text-white text-xs">{route.name}</p>
                    {route.description && (
                      <p className="text-slate-300 text-[11px] leading-relaxed">{route.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 bg-[#061426] p-2 rounded-lg border border-emerald-500/30 text-slate-300 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">TOTAL DISTANCE</span>
                        <span className="text-white font-black text-xs">{route.distanceKm || "10.9"} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ESTIMATED TIME</span>
                        <span className="text-emerald-300 font-black text-xs">{route.etaMinutes || 16} mins</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ELEVATION CLEARANCE</span>
                        <span className="text-cyan-300 font-bold">+3.4m Above Flood</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">CONVOY STATUS</span>
                        <span className="text-emerald-400 font-bold">100% PASSABLE</span>
                      </div>
                    </div>

                    <p className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                      <span>✓</span>
                      <span>Verified: Submerged bridges and low-lying flash water actively bypassed.</span>
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {/* Permanent Center Floating 3D Route Badge */}
              {midPoint && (
                <Polyline
                  positions={[route.coordinates[Math.max(0, Math.floor(route.coordinates.length / 2) - 1)], midPoint]}
                  pathOptions={{ opacity: 0 }}
                >
                  <Tooltip permanent direction="center" className="safe-route-tooltip">
                    <span className="font-mono text-[10px] font-black text-white bg-gradient-to-r from-emerald-950 via-[#06241a] to-emerald-950 px-3.5 py-1.5 rounded-full border-2 border-emerald-400 shadow-[0_6px_20px_rgba(16,185,129,0.7)] flex items-center gap-2 backdrop-blur-md transform-3d hover:scale-105 transition">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="tracking-wide">🚑 3D RESCUEROUTE: {route.name}</span>
                      <span className="text-cyan-300 font-black bg-cyan-950/80 px-2 py-0.2 rounded-md border border-cyan-500/50">
                        {route.distanceKm || "10.9"} km • {route.etaMinutes || 16}m ETA
                      </span>
                    </span>
                  </Tooltip>
                </Polyline>
              )}

              {/* Intermediate Ridge Waypoint Marker */}
              {midPoint && (
                <Marker position={midPoint} icon={ridgeWaypoint3DIcon}>
                  <Tooltip direction="top" offset={[0, -10]}>
                    <span className="text-[10px] font-mono font-bold bg-slate-900/95 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/60 shadow">
                      ▲ DRY RIDGE CORRIDOR (+52m)
                    </span>
                  </Tooltip>
                </Marker>
              )}

              {/* Waypoint 3D Pin at Start (SAR Staging Base) */}
              {startPoint && (
                <Marker position={startPoint} icon={startBase3DIcon}>
                  <Popup>
                    <div className="text-xs font-mono space-y-1">
                      <p className="font-black text-emerald-400 text-sm">⛺ SAR STAGING BASE</p>
                      <p className="text-white font-semibold">Elevated Assembly Ground</p>
                      <p className="text-cyan-300 text-[11px]">Elevation: +54.0m ASL (Dry Ground)</p>
                      <p className="text-slate-300 text-[10px]">Medical triaging & boat launching depot.</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Waypoint 3D Pin at Destination (Extraction Target) */}
              {endPoint && (
                <Marker position={endPoint} icon={destination3DIcon}>
                  <Popup>
                    <div className="text-xs font-mono space-y-1">
                      <p className="font-black text-cyan-400 text-sm">🎯 EXTRACTION TARGET</p>
                      <p className="text-white font-semibold">Designated Evacuation Zone</p>
                      <p className="text-slate-300 text-[11px]">Direct corridor connecting safe camp to target.</p>
                      <p className="text-emerald-400 text-[10px] font-bold">Clear of water hazard.</p>
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
