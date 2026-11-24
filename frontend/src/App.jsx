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
import {
  PlusCircle,
  Megaphone,
  Home,
  Clock,
  Sun,
  Moon,
  FilePlus2,
  MapPin,
  Layers,
  Siren,
  FileText,
  PhoneCall,
  X,
} from "lucide-react";

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
  const [activeMapLocation, setActiveMapLocation] = useState(null);
  const [mobileDrawer, setMobileDrawer] = useState(null); // 'incidents' | 'layers' | null

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
            className={`border-b px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-xs shrink-0 ${
              isDark ? "bg-[#091326] border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => setViewMode("landing")}
              className="inline-flex items-center gap-1.5 font-semibold opacity-75 hover:opacity-100 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Earth</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsDark((prev) => !prev)}
                className={`inline-flex items-center gap-1 font-semibold px-2 sm:px-3 py-1 rounded-lg border transition cursor-pointer text-[11px] sm:text-xs ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-amber-300"
                    : "bg-slate-100 border-slate-300 text-slate-800"
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isDark ? "Daylight UI" : "Night Ops"}</span>
              </button>

              <button
                onClick={() => setSosDrawerOpen(true)}
                className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-[11px] sm:text-xs"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Citizen SOS</span>
              </button>

              <button
                onClick={() => setBroadcastOpen(true)}
                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-[11px] sm:text-xs"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Broadcast</span>
              </button>
            </div>
          </div>

          <MetricCards metrics={data.metrics} isDark={isDark} />

          <div className="flex-1 flex overflow-hidden relative">
            {/* Desktop Left Sidebar: docked permanently on desktop, hidden on mobile */}
            <div className="hidden lg:flex shrink-0">
              <Sidebar
                layers={layers}
                onToggleLayer={handleToggleLayer}
                fleet={fleet}
                isDark={isDark}
              />
            </div>

            {/* Central Tactical GIS Command Map (100% full viewport on phone) */}
            <div className="flex-1 relative flex h-full w-full">
              <CommandMap
                floodZones={projectedFloodZones}
                routes={data.routes}
                incidents={rankedIncidents}
                camps={data.camps}
                layers={layers}
                selectedIncident={selectedIncident}
                isDark={isDark}
                onLocationChange={setActiveMapLocation}
              />

              {/* Flood Forecast Time Slider Overlay */}
              <div
                className={`absolute bottom-16 sm:bottom-5 left-1/2 -translate-x-1/2 z-[400] backdrop-blur-md border px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 ${
                  isDark
                    ? "bg-[#0a1428]/90 border-slate-700 text-white"
                    : "bg-white/95 border-slate-300 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-cyan-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flood Forecast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 6, 12].map((hr) => (
                    <button
                      key={hr}
                      onClick={() => setForecastHours(hr)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
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

              {/* Mobile Bottom Navigation Bar (Phone Only) */}
              <div className="lg:hidden absolute bottom-2 left-2 right-2 z-[450] bg-[#07132b]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around text-xs font-semibold">
                <button
                  onClick={() => setMobileDrawer(null)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer ${
                    mobileDrawer === null ? "text-cyan-400 font-bold bg-cyan-950/70" : "text-slate-400"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px]">Map</span>
                </button>

                <button
                  onClick={() => setMobileDrawer(mobileDrawer === "incidents" ? null : "incidents")}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition relative cursor-pointer ${
                    mobileDrawer === "incidents" ? "text-rose-400 font-bold bg-rose-950/70" : "text-slate-400"
                  }`}
                >
                  <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-[10px]">SOS Queue</span>
                  {data.metrics?.activeSOS > 0 && (
                    <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center justify-center">
                      {data.metrics.activeSOS}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setMobileDrawer(mobileDrawer === "layers" ? null : "layers")}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition cursor-pointer ${
                    mobileDrawer === "layers" ? "text-cyan-400 font-bold bg-cyan-950/70" : "text-slate-400"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-[10px]">Layers</span>
                </button>

                <button
                  onClick={handleOpenSitrep}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px]">SITREP</span>
                </button>

                <button
                  onClick={() => setIsAuthoritiesOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-rose-300 transition cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px]">Hotline</span>
                </button>
              </div>
            </div>

            {/* Desktop Right Sidebar: docked permanently on desktop, hidden on mobile */}
            <div className="hidden lg:flex shrink-0">
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

          {/* Mobile Bottom Sheet Drawer for SOS Queue */}
          {mobileDrawer === "incidents" && (
            <div className="lg:hidden fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-[#0a1428] border-t border-cyan-500/40 rounded-t-3xl max-h-[82vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-[#0d1c38]">
                  <div className="flex items-center gap-2">
                    <Siren className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                      AI-Ranked SOS Incidents
                    </h3>
                  </div>
                  <button
                    onClick={() => setMobileDrawer(null)}
                    className="text-slate-300 hover:text-white p-1 rounded-lg bg-slate-800 text-xs px-2.5 py-1 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <IncidentPanel
                    incidents={rankedIncidents}
                    selectedIncident={selectedIncident}
                    onSelectIncident={(inc) => {
                      setSelectedIncident(inc);
                      setMobileDrawer(null);
                    }}
                    onDispatch={handleDispatch}
                    onExportSitRep={handleExportSitRep}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Bottom Sheet Drawer for Layers & Fleet */}
          {mobileDrawer === "layers" && (
            <div className="lg:hidden fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-[#0a1428] border-t border-cyan-500/40 rounded-t-3xl max-h-[82vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-[#0d1c38]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                      Map Layers & Fleet
                    </h3>
                  </div>
                  <button
                    onClick={() => setMobileDrawer(null)}
                    className="text-slate-300 hover:text-white p-1 rounded-lg bg-slate-800 text-xs px-2.5 py-1 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar
                    layers={layers}
                    onToggleLayer={handleToggleLayer}
                    fleet={fleet}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          )}
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
        activeLocation={activeMapLocation}
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
