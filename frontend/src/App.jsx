import React, { useEffect, useState, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricCards from "./components/MetricCards";
import IncidentPanel from "./components/IncidentPanel";
import CommandMap from "./map/CommandMap";
import SitrepModal from "./components/SitrepModal";
import AuthoritiesModal from "./components/AuthoritiesModal";
import SOSModal from "./sos/SOSModal";
import { api } from "./services/api";

export default function App() {
  const [data, setData] = useState({
    metrics: {},
    floodZones: [],
    routes: { rescueRoutes: [], blockedRoads: [] },
    incidents: [],
    camps: [],
    isBackendOnline: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
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
    const interval = setInterval(loadData, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDispatch = async (incidentId) => {
    await api.dispatchRescueUnit(incidentId);
    setData((prev) => ({
      ...prev,
      incidents: prev.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, status: "DISPATCHED" } : inc
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
    <div className="h-screen w-screen flex flex-col bg-[#060d1f] text-slate-100 overflow-hidden font-sans">
      <Header
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        activeSOSCount={data.metrics.activeSOS || 0}
        isBackendOnline={data.isBackendOnline}
        onOpenSitrep={handleOpenSitrep}
        onOpenAuthorities={() => setIsAuthoritiesOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
      />

      <MetricCards metrics={data.metrics} />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar layers={layers} onToggleLayer={handleToggleLayer} />

        <CommandMap
          floodZones={data.floodZones}
          routes={data.routes}
          incidents={data.incidents}
          camps={data.camps}
          layers={layers}
          selectedIncident={selectedIncident}
        />

        <IncidentPanel
          incidents={data.incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
          onDispatch={handleDispatch}
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
