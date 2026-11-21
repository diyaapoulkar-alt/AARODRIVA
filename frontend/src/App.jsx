import React, { useEffect, useState, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricCards from "./components/MetricCards";
import IncidentPanel from "./components/IncidentPanel";
import CommandMap from "./map/CommandMap";
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060d1f] text-slate-100 overflow-hidden font-sans">
      <Header
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        activeSOSCount={data.metrics.activeSOS || 0}
        isBackendOnline={data.isBackendOnline}
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
    </div>
  );
}
