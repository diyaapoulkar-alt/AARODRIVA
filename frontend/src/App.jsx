import React, { useEffect, useState, useCallback, useMemo } from "react";
import { PlusCircle, Megaphone, Home, Clock, Sun, Moon, FilePlus2 } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricCards from "./components/MetricCards";
import IncidentPanel from "./components/IncidentPanel";
import BroadcastModal from "./components/BroadcastModal";
import CitizenSOSDrawer from "./components/CitizenSOSDrawer";
import CommandMap from "./map/CommandMap";
import SitrepModal from "./components/SitrepModal";
import AuthoritiesModal from "./components/AuthoritiesModal";
import SOSModal from "./sos/SOSModal";
import { api } from "./services/api";

// Feature #3: AI Triage Priority Score Engine (0–100)
function computeTriageScore(inc) {
  const depthMap = { Roof: 45, Waist: 25, Knee: 10 };
  const sevMap = { CRITICAL: 40, HIGH: 25, WARNING: 12 };
  const depthScore = inc.waterDepth ? depthMap[inc.waterDepth] || 20 : sevMap[inc.severity] || 15;
  const peopleScore = Math.min(Math.round((inc.peopleAffected || 1) * 1.2), 30);
  const medScore = inc.medicalEmergency || inc.title?.toLowerCase().includes("medical") ? 25 : 0;
  return Math.min(100, depthScore + peopleScore + medScore);
}

const INITIAL_FLEET = [
  { id: "u-1", name: "NDRF Boat-01", type: "BOAT", power: 88, status: "IDLE", assignedTo: null },
  { id: "u-2", name: "Rescue Boat-02", type: "BOAT", power: 74, status: "IDLE", assignedTo: null },
  { id: "u-3", name: "Recon Drone-01", type: "DRONE", power: 92, status: "IDLE", assignedTo: null },
  { id: "u-4", name: "Med-Evac Van-03", type: "AMBULANCE", power: 65, status: "IDLE", assignedTo: null },
];

export default function App() {
  const [view, setView] = useState("landing");
  const [isDark, setIsDark] = useState(false); // Feature #1: Starts in Bright Daylight Mode
  const [data, setData] = useState({
    metrics: {},
    floodZones: [],
    routes: { rescueRoutes: [], blockedRoads: [] },
    incidents: [],
    camps: [],
  });
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [forecastHours, setForecastHours] = useState(0);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [sosDrawerOpen, setSosDrawerOpen] = useState(false);
  const [layers, setLayers] = useState({
    floodZones: true,
    rescueRoutes: true,
    blockedRoads: true,
    incidents: true,
    camps: true,
  });

  // Modal Visibility States
  const [isSitrepOpen, setIsSitrepOpen] = useState(false);
  const [sitrepData, setSitrepData] = useState(null);
  const [isAuthoritiesOpen, setIsAuthoritiesOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const result = await api.getDashboardData();
    setData(result);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Auto-score & rank incidents (Pending highest-score first)
  const rankedIncidents = useMemo(() => {
    return data.incidents
      .map((inc) => ({ ...inc, triageScore: computeTriageScore(inc) }))
      .sort((a, b) => {
        if (a.status === "DISPATCHED" && b.status !== "DISPATCHED") return 1;
        if (b.status === "DISPATCHED" && a.status !== "DISPATCHED") return -1;
        return b.triageScore - a.triageScore;
      });
  }, [data.incidents]);

  const projectedFloodZones = useMemo(() => {
    if (forecastHours === 0) return data.floodZones;
    const expand = forecastHours === 6 ? 0.004 : 0.009;
    return data.floodZones.map((zone) => {
      const cLat = zone.coordinates.reduce((s, c) => s + c[0], 0) / zone.coordinates.length;
      const cLng = zone.coordinates.reduce((s, c) => s + c[1], 0) / zone.coordinates.length;
      return {
        ...zone,
        depthMeters: Number((zone.depthMeters + (forecastHours === 6 ? 0.6 : 1.3)).toFixed(1)),
        severity: forecastHours === 12 ? "CRITICAL" : zone.severity,
        coordinates: zone.coordinates.map(([lat, lng]) => [
          lat + (lat >= cLat ? expand : -expand),
          lng + (lng >= cLng ? expand : -expand),
        ]),
      };
    });
  }, [data.floodZones, forecastHours]);

  // Feature #5: Assign first IDLE fleet unit on Dispatch
  const handleDispatch = async (incidentId) => {
    await api.dispatchRescueUnit(incidentId);
    const availableUnit = fleet.find((u) => u.status === "IDLE");
    const unitName = availableUnit ? availableUnit.name : "Reserve Unit";

    if (availableUnit) {
      setFleet((prev) =>
        prev.map((u) =>
          u.id === availableUnit.id ? { ...u, status: "EN ROUTE", assignedTo: incidentId } : u
        )
      );
    }

    setData((prev) => ({
      ...prev,
      incidents: prev.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, status: "DISPATCHED", assignedUnit: unitName } : inc
      ),
    }));
  };

  // Open SITREP Situation Report Modal
  const handleOpenSitrep = async () => {
    const report = await api.getSitrep();
    setSitrepData(report);
    setIsSitrepOpen(true);
  };

  // Handle citizen SOS submission
  const handleSOSSuccess = (newIncident) => {
    setData((prev) => ({
      ...prev,
      incidents: [
        {
          id: newIncident.id,
          type: "SOS",
          title: `Distress: ${newIncident.village_name || "Citizen Location"} (${newIncident.people_count || 4} souls)`,
          location: newIncident.village_name || "Reported via NavIC",
          severity: "CRITICAL",
          peopleAffected: newIncident.people_count || 4,
          timestamp: "Just now",
          status: "PENDING",
          coords: [newIncident.latitude || 26.182, newIncident.longitude || 91.744],
        },
        ...prev.incidents,
      ],
      metrics: {
        ...prev.metrics,
        activeSOS: (prev.metrics.activeSOS || 0) + 1,
      },
    }));
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors ${
        isDark ? "bg-[#060d1f] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <Header
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        activeSOSCount={data.metrics.activeSOS || 0}
        isBackendOnline={data.isBackendOnline}
        onOpenSitrep={handleOpenSitrep}
        onOpenAuthorities={() => setIsAuthoritiesOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
      />

      {/* Operations Action Bar with Day/Night Toggle & Citizen SOS Trigger */}
      <div
        className={`border-b px-4 py-1.5 flex items-center justify-between text-xs shrink-0 ${
          isDark ? "bg-[#091326] border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <button
          onClick={() => setView("landing")}
          className="inline-flex items-center gap-1.5 font-semibold opacity-75 hover:opacity-100 transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Feature #1: Daylight / Tactical Night Mode Toggle */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg border transition ${
              isDark
                ? "bg-slate-800 border-slate-700 text-amber-300"
                : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDark ? "Daylight UI" : "Night Ops"}</span>
          </button>

          {/* Feature #2: Citizen SOS Drawer Button */}
          <button
            onClick={() => setSosDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded-lg transition"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Citizen SOS Report</span>
          </button>

          <button
            onClick={() => setBroadcastOpen(true)}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast</span>
          </button>
        </div>
      </div>

      <MetricCards metrics={data.metrics} isDark={isDark} />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          layers={layers}
          onToggleLayer={(k) => setLayers((p) => ({ ...p, [k]: !p[k] }))}
          fleet={fleet}
          isDark={isDark}
        />

        <div className="flex-1 relative flex">
          <CommandMap
            floodZones={projectedFloodZones}
            routes={data.routes}
            incidents={rankedIncidents}
            camps={data.camps}
            layers={layers}
            selectedIncident={selectedIncident}
            isDark={isDark}
          />

          <div
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-[400] backdrop-blur-md border px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 ${
              isDark
                ? "bg-[#0a1428]/90 border-slate-700 text-white"
                : "bg-white/95 border-slate-300 text-slate-900"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-500">
              <Clock className="w-4 h-4" />
              <span>Flood Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 6, 12].map((hr) => (
                <button
                  key={hr}
                  onClick={() => setForecastHours(hr)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    forecastHours === hr
                      ? "bg-cyan-500 text-slate-950"
                      : isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {hr === 0 ? "Now" : `+${hr}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <IncidentPanel
          incidents={rankedIncidents}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
          onDispatch={handleDispatch}
          onExportSitRep={handleExportSitRep}
          isDark={isDark}
        />
      </div>

      {/* Situation Report (SITREP) Modal */}
      <SitrepModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        sitrepData={sitrepData}
      />

      {/* Emergency Authorities Hotline & Directory Modal */}
      <AuthoritiesModal
        isOpen={isAuthoritiesOpen}
        onClose={() => setIsAuthoritiesOpen(false)}
        activeIncidents={data.incidents}
      />

      {/* NavIC Citizen Distress SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        onSubmitSuccess={handleSOSSuccess}
      />
    </div>
  );
}