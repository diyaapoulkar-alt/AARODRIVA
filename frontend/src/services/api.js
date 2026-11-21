// AARODRIVA AI - API Service Layer
// Connects to local FastAPI backend (http://localhost:8000) or falls back to realistic ISRO Brahmaputra simulation.
// NO EXTERNAL API KEY REQUIRED: All models and data engines run locally and offline-first!

const DIRECT_BACKEND = "http://localhost:8000/api";
const PROXIED_BACKEND = "/api";

// Realistic fallback simulation data (Guwahati / Kamrup Metropolitan, Assam)
const MOCK_DATA = {
  metrics: {
    activeSOS: 14,
    maroonedVillages: 8,
    blockedRoads: 5,
    activeRescueTeams: 11,
    peopleEvacuated: 1420,
    waterLevelTrend: [
      { time: "08:00", level: 48.2, danger: 49.5 },
      { time: "10:00", level: 48.9, danger: 49.5 },
      { time: "12:00", level: 49.6, danger: 49.5 },
      { time: "14:00", level: 50.4, danger: 49.5 },
      { time: "16:00", level: 51.1, danger: 49.5 },
      { time: "18:00", level: 50.8, danger: 49.5 },
    ],
  },
  floodZones: [
    {
      id: "fz-1",
      name: "North Bank Inundation Zone A (Kharghuli / Uzan Bazar)",
      severity: "CRITICAL",
      depthMeters: 2.8,
      coordinates: [
        [26.185, 91.710],
        [26.198, 91.745],
        [26.178, 91.770],
        [26.162, 91.735],
      ],
    },
    {
      id: "fz-2",
      name: "Low-Lying Riverbed Sector B (Pandu Lowlands)",
      severity: "HIGH",
      depthMeters: 1.6,
      coordinates: [
        [26.140, 91.685],
        [26.155, 91.715],
        [26.132, 91.728],
        [26.122, 91.698],
      ],
    },
    {
      id: "fz-3",
      name: "Amingaon Embankment Breach Sector",
      severity: "CRITICAL",
      depthMeters: 2.2,
      coordinates: [
        [26.180, 91.690],
        [26.195, 91.710],
        [26.182, 91.730],
        [26.168, 91.705],
      ],
    },
  ],
  routes: {
    rescueRoutes: [
      {
        id: "rr-1",
        name: "RescueRoute AI: Elevated Ridge Corridor Alpha",
        description: "Dijkstra optimal bypass via Zoo Road & Dispur Ridge avoiding flooded NH-27",
        distanceKm: 10.9,
        etaMinutes: 16,
        status: "CLEAR",
        coordinates: [
          [26.138, 91.785],
          [26.152, 91.768],
          [26.168, 91.752],
          [26.176, 91.742],
        ],
      },
      {
        id: "rr-2",
        name: "Medical Evacuation Route Beta (GS Road Elevated Corridor)",
        description: "High-clearance emergency corridor connecting District Shelter to North Sector",
        distanceKm: 7.4,
        etaMinutes: 12,
        status: "CLEAR",
        coordinates: [
          [26.125, 91.755],
          [26.135, 91.738],
          [26.145, 91.720],
        ],
      },
    ],
    blockedRoads: [
      {
        id: "br-1",
        name: "NH-27 Brahmaputra River Bridge Approach",
        reason: "Submerged (1.4m water depth) — Impassable",
        waterDepth: 1.4,
        coordinates: [
          [26.158, 91.722],
          [26.169, 91.730],
          [26.179, 91.736],
        ],
      },
      {
        id: "br-2",
        name: "Sector 4 Embankment Causeway Road",
        reason: "Embankment Breach & Structural Soil Liquefaction",
        waterDepth: 1.9,
        coordinates: [
          [26.138, 91.705],
          [26.148, 91.712],
        ],
      },
    ],
  },
  incidents: [
    {
      id: "SOS-104",
      type: "SOS",
      title: "12 Civilians Trapped on Rooftop",
      location: "Kharghuli Ward 4 (Brahmaputra Bank)",
      severity: "CRITICAL",
      peopleAffected: 12,
      timestamp: "2 mins ago",
      status: "PENDING",
      coords: [26.182, 91.744],
    },
    {
      id: "SOS-109",
      type: "MAROONED",
      title: "Village Cut Off - Medical Emergency",
      location: "Majuli East Cluster",
      severity: "HIGH",
      peopleAffected: 45,
      timestamp: "9 mins ago",
      status: "DISPATCHED",
      coords: [26.144, 91.708],
    },
    {
      id: "SOS-112",
      type: "SOS",
      title: "School Shelter Water Rising Rapidly",
      location: "Pandu Ghat Road",
      severity: "CRITICAL",
      peopleAffected: 28,
      timestamp: "14 mins ago",
      status: "PENDING",
      coords: [26.168, 91.725],
    },
    {
      id: "SOS-115",
      type: "MAROONED",
      title: "Power Substation Flooded & Food Shortage",
      location: "Amingaon Lowlands",
      severity: "WARNING",
      peopleAffected: 80,
      timestamp: "27 mins ago",
      status: "PENDING",
      coords: [26.188, 91.718],
    },
  ],
  camps: [
    {
      id: "camp-1",
      name: "NDRF Base & Relief Camp #1 (Khanapara)",
      capacity: 500,
      occupied: 310,
      coords: [26.138, 91.785],
    },
    {
      id: "camp-2",
      name: "District Stadium Disaster Shelter",
      capacity: 800,
      occupied: 490,
      coords: [26.125, 91.755],
    },
  ],
};

async function executeRequest(endpoint) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  // Try direct backend first, then relative proxied path
  const candidateUrls = [
    `${DIRECT_BACKEND}${endpoint}`,
    `${PROXIED_BACKEND}${endpoint}`,
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        clearTimeout(timeoutId);
        return await res.json();
      }
    } catch {
      // try next
    }
  }
  clearTimeout(timeoutId);
  throw new Error("Backend offline");
}

async function fetchWithFallback(endpoint, fallbackValue) {
  try {
    return await executeRequest(endpoint);
  } catch {
    return fallbackValue;
  }
}

export const api = {
  checkBackendHealth: async () => {
    try {
      const data = await executeRequest("/health");
      return { online: true, details: data };
    } catch {
      return { online: false, details: null };
    }
  },

  getDashboardData: async () => {
    // Probe health concurrently
    const healthPromise = api.checkBackendHealth();

    const [metrics, floodZones, routes, incidents, camps, health] = await Promise.all([
      fetchWithFallback("/metrics", MOCK_DATA.metrics),
      fetchWithFallback("/flood-zones", MOCK_DATA.floodZones),
      fetchWithFallback("/routes", MOCK_DATA.routes),
      fetchWithFallback("/incidents", MOCK_DATA.incidents),
      fetchWithFallback("/camps", MOCK_DATA.camps),
      healthPromise,
    ]);

    return {
      metrics,
      floodZones,
      routes,
      incidents,
      camps,
      isBackendOnline: health.online,
    };
  },

  predictLocation: async (lat, lon, placeName = "") => {
    try {
      const res = await fetch(`${DIRECT_BACKEND}/predict/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          place_name: placeName,
        }),
      });
      if (!res.ok) throw new Error("Predict offline");
      return await res.json();
    } catch {
      const distToGhy = Math.hypot(lat - 26.158, lon - 91.738) * 111;
      const isNearDisaster = distToGhy < 15;
      return {
        place_name: placeName || `Coordinates [${lat.toFixed(3)}, ${lon.toFixed(3)}]`,
        latitude: lat,
        longitude: lon,
        prediction: {
          access_status: isNearDisaster ? "At risk" : "Accessible",
          is_marooned: false,
          is_inundated: false,
          risk_score: isNearDisaster ? 60 : 15,
          isolation_reason: isNearDisaster ? "Near active flood basin perimeter" : "Normal ground elevation",
        },
      };
    }
  },

  dispatchRescueUnit: async (incidentId) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${DIRECT_BACKEND}/incidents/${incidentId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Backend offline");
      return await res.json();
    } catch {
      return { success: true, incidentId, status: "DISPATCHED" };
    }
  },
};

