import React, { useEffect, useState, useCallback, useMemo } from "react";
import SplashScreen from "./components/SplashScreen";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricCards from "./components/MetricCards";
import IncidentPanel from "./components/IncidentPanel";
import CommandMap from "./map/CommandMap";
import SitrepModal from "./components/SitrepModal";
import AuthoritiesModal from "./components/AuthoritiesModal";
import SOSModal from "./sos/SOSModal";
import BroadcastModal from "./components/BroadcastModal";
import CitizenSOSDrawer from "./components/CitizenSOSDrawer";
import { api } from "./services/api";
import { PlusCircle, Megaphone, Home, Clock, Sun, Moon, FilePlus2 } from "lucide-react";

// AI Triage Priority Score Engine (0–100)
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
  // Navigation Modes: 'splash' -> 'landing' -> 'map'
  const [viewMode, setViewMode] = useState("splash");
  const [isDark, setIsDark] = useState(true);

  const [data, setData] = useState({
    metrics: {},
    floodZones: [],
    routes: { rescueRoutes: [], blockedRoads: [] },
    incidents: [],
    camps: [],
    isBackendOnline: false,
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
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Auto-score & rank incidents (Pending highest-score first)
  const rankedIncidents = useMemo(() => {
    return (data.incidents || [])
      .map((inc) => ({ ...inc, triageScore: computeTriageScore(inc) }))
      .sort((a, b) => {
        if (a.status === "DISPATCHED" && b.status !== "DISPATCHED") return 1;
        if (b.status === "DISPATCHED" && a.status !== "DISPATCHED") return -1;
        return b.triageScore - a.triageScore;
      });
  }, [data.incidents]);

  const projectedFloodZones = useMemo(() => {
    if (!data.floodZones || data.floodZones.length === 0) return [];
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

  const handleToggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Assign fleet unit on Dispatch
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

  // Submit Citizen SOS via Drawer
  const handleCitizenSOS = ({ location, waterDepth, peopleAffected, medicalEmergency }) => {
    const newId = `SOS-${Math.floor(200 + Math.random() * 799)}`;
    const newIncident = {
      id: newId,
      type: "SOS",
      title: `${waterDepth}-Level Flood${medicalEmergency ? " + Medical Emergency" : ""}`,
      location,
      waterDepth,
      medicalEmergency,
      severity: waterDepth === "Roof" || medicalEmergency ? "CRITICAL" : "HIGH",
      peopleAffected,
      timestamp: "Just now",
      status: "PENDING",
      coords: [26.162 + (Math.random() - 0.5) * 0.025, 91.735 + (Math.random() - 0.5) * 0.025],
    };
    setData((prev) => ({
      ...prev,
      metrics: { ...prev.metrics, activeSOS: (prev.metrics.activeSOS || 0) + 1 },
      incidents: [newIncident, ...prev.incidents],
    }));
    setSelectedIncident({ ...newIncident, triageScore: computeTriageScore(newIncident) });
  };

  // Handle citizen SOS modal submission
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

  // One-Click District SitRep CSV Download
  const handleExportSitRep = () => {
    const header = "Incident ID,Location,People Affected,AI Triage Score,Status,Assigned Unit\n";
    const rows = rankedIncidents
      .map(
        (i) =>
          `${i.id},"${i.location}",${i.peopleAffected},${i.triageScore},${i.status},"${
            i.assignedUnit || "Unassigned"
          }"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AARODRIVA_SitRep_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 1. INITIAL SPLASH / LOADING SCREEN */}
      {viewMode === "splash" && (
        <SplashScreen onComplete={() => setViewMode("landing")} />
      )}

      {/* 2. LANDING / HOME PAGE WITH 3D HALF-EARTH & 3D TEXT */}
      {viewMode === "landing" && (
        <LandingPage
          onLaunchMap={() => setViewMode("map")}
          onEnterDashboard={() => setViewMode("map")}
          onOpenSitrep={handleOpenSitrep}
          onOpenAuthorities={() => setIsAuthoritiesOpen(true)}
          onOpenSOS={() => setSosDrawerOpen(true)}
          isBackendOnline={data.isBackendOnline}
        />
      )}

      {/* 3. FULL EOC COMMAND CENTER MAP DASHBOARD */}
      {viewMode === "map" && (
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
            onOpenSOS={() => setSosDrawerOpen(true)}
            onGoHome={() => setViewMode("landing")}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
          />

          {/* Operations Action Bar with Daylight/Night Mode & Quick Actions */}
          <div
            className={`border-b px-4 py-1.5 flex items-center justify-between text-xs shrink-0 ${
              isDark ? "bg-[#091326] border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => setViewMode("landing")}
              className="inline-flex items-center gap-1.5 font-semibold opacity-75 hover:opacity-100 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Earth Landing</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg border transition cursor-pointer ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-amber-300"
                    : "bg-slate-100 border-slate-300 text-slate-800"
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isDark ? "Daylight UI" : "Night Ops"}</span>
              </button>

              <button
                onClick={() => setSosDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded-lg transition cursor-pointer"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Citizen SOS Report</span>
              </button>

              <button
                onClick={() => setBroadcastOpen(true)}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Broadcast Alert</span>
              </button>
            </div>
          </div>

          <MetricCards metrics={data.metrics} isDark={isDark} />

          <div className="flex-1 flex overflow-hidden relative">
            <Sidebar
              layers={layers}
              onToggleLayer={handleToggleLayer}
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

              {/* Flood Forecast Time Slider Overlay */}
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
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
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
        </div>
      )}

      {/* GLOBAL MODALS ACCESSIBLE ACROSS ALL VIEWS */}
      {/* Official Formatted Situation Report (SITREP) with PDF download */}
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

      {/* Citizen NavIC Distress SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        onSubmitSuccess={handleSOSSuccess}
      />

      {/* Multi-Channel Evacuation Broadcast Modal */}
      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        floodZones={projectedFloodZones}
      />

      {/* Citizen SOS Intake Drawer */}
      <CitizenSOSDrawer
        isOpen={sosDrawerOpen}
        onClose={() => setSosDrawerOpen(false)}
        onSubmitSOS={handleCitizenSOS}
        isDark={isDark}
      />
    </>
  );
}
