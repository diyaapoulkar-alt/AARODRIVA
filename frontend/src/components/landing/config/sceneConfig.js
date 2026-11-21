/**
 * Central configuration for the AARODRIVA 3D Flood Basin scene.
 * Set ENABLE_3D to false to force the lightweight 2D topographic fallback.
 */
export const SCENE_CONFIG = {
  ENABLE_3D: true,
  basinCoords: "26.158° N, 91.738° E — Guwahati Flood Basin",
  colors: {
    navyBg: "#060d1f",
    navyFog: "#0a1428",
    cyan: "#0ea5e9",
    cyanBright: "#22d3ee",
    crimson: "#ef4444",
    amber: "#fbbf24",
    emerald: "#10b981",
  },
  terrain: {
    size: 24,
    segments: 48,        // Keep 32–56 for locked 60fps on mid-range laptops
    waterLevel: -0.35,   // Raise to simulate higher flood inundation
    maxHeight: 2.2,
  },
  camera: {
    orbitSpeed: 0.08,
    parallaxStrength: 1.1,
    damping: 0.06,
  },
};

export const HOTSPOTS = [
  {
    id: "sos-104",
    label: "SOS-104",
    type: "SOS",
    position: [-2.4, 0.25, 1.8],
    color: "#ef4444",
    title: "12 Civilians Trapped on Rooftop",
    meta: "Priority 94/100 • Kharghuli Ward 4",
    detail: "Water depth: 2.8m • Medical assistance requested",
  },
  {
    id: "flood-a",
    label: "Flood Sector A",
    type: "FLOOD",
    position: [-4.5, -0.1, -1.6],
    color: "#0ea5e9",
    title: "North Bank Inundation Zone A",
    meta: "Critical Depth: 2.8m • Rising +0.4m/hr",
    detail: "Low-lying valley basin submerged; evacuation active",
  },
  {
    id: "nh-27",
    label: "Blocked NH-27",
    type: "BLOCKED",
    position: [0.4, 0.1, 0.2],
    color: "#fbbf24",
    title: "NH-27 River Bridge Approach",
    meta: "Status: IMPASSABLE • 1.4m Submergence",
    detail: "Dijkstra/A* router automatically bypassing segment",
  },
  {
    id: "camp-1",
    label: "Cotton Relief Camp",
    type: "CAMP",
    position: [4.2, 1.35, -2.1],
    color: "#10b981",
    title: "Cotton Relief Camp (High Ground)",
    meta: "Free Beds: 42 • Boat ETA: 2.4 km (~8 min)",
    detail: "Elevation +14m above floodline • Medical & power active",
  },
];