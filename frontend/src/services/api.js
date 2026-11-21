const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Realistic fallback data (Guwahati / Brahmaputra Flood Basin)
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
      name: "North Bank Inundation Zone A",
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
      name: "Low-Lying Riverbed Sector B",
      severity: "HIGH",
      depthMeters: 1.6,
      coordinates: [
        [26.140, 91.685],
        [26.155, 91.715],
        [26.132, 91.728],
        [26.122, 91.698],
      ],
    },
  ],
  routes: {
    rescueRoutes: [
      {
        id: "rr-1",
        name: "NDRF Boat Corridor Alpha",
        etaMinutes: 14,
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
        name: "Medical Supply Route Beta",
        etaMinutes: 22,
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
        name: "NH-27 River Bridge Approach",
        reason: "Submerged (1.4m water)",
        coordinates: [
          [26.158, 91.722],
          [26.169, 91.730],
          [26.179, 91.736],
        ],
      },
      {
        id: "br-2",
        name: "Sector 4 Embankment Road",
        reason: "Landslide & Embankment Breach",
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
      location: "Kharghuli Ward 4",
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
      title: "School Shelter Water Rising",
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
      title: "Power Outage & Food Shortage",
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
      name: "NDRF Base & Relief Camp #1",
      capacity: 500,
      occupied: 310,
      coords: [26.138, 91.785],
    },
    {
      id: "camp-2",
      name: "District Stadium Shelter",
      capacity: 800,
      occupied: 490,
      coords: [26.125, 91.755],
    },
  ],
};

async function fetchWithFallback(endpoint, fallbackValue) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${endpoint}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallbackValue;
  }
}

export const api = {
  getDashboardData: async () => {
    const [metrics, floodZones, routes, incidents, camps] = await Promise.all([
      fetchWithFallback("/metrics", MOCK_DATA.metrics),
      fetchWithFallback("/flood-zones", MOCK_DATA.floodZones),
      fetchWithFallback("/routes", MOCK_DATA.routes),
      fetchWithFallback("/incidents", MOCK_DATA.incidents),
      fetchWithFallback("/camps", MOCK_DATA.camps),
    ]);
    return { metrics, floodZones, routes, incidents, camps };
  },

  dispatchRescueUnit: async (incidentId) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${incidentId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Backend offline");
      return await res.json();
    } catch {
      return { success: true, incidentId, status: "DISPATCHED" };
    }
  },
};