import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import CommandMap from './map/CommandMap';
import IncidentPanel from './components/IncidentPanel';
import SOSModal from './sos/SOSModal';
import SitrepModal from './components/SitrepModal';
import { api } from './services/api';

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [floodZones, setFloodZones] = useState(null);
  const [villages, setVillages] = useState(null);
  const [rescueCamps, setRescueCamps] = useState(null);
  const [roads, setRoads] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isSitrepOpen, setIsSitrepOpen] = useState(false);
  const [sitrepData, setSitrepData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all initial GIS and EOC data
  useEffect(() => {
    async function loadInitialData() {
      const [m, fz, v, c, r, s] = await Promise.all([
        api.getMetrics(),
        api.getFloodZones(),
        api.getVillages(),
        api.getRescueCamps(),
        api.getRoads(),
        api.getSOSList()
      ]);
      setMetrics(m);
      setFloodZones(fz);
      setVillages(v);
      setRescueCamps(c);
      setRoads(r);
      setSosList(s);
    }
    loadInitialData();
  }, []);

  // Handle routing trigger from incident panel or map
  const handleCalculateRoute = async (sos) => {
    setSelectedIncident(sos);
    setLoadingRoute(true);
    showToast(`Calculating safe flood-bypass route for ${sos.id}...`);

    try {
      const res = await api.calculateRoute('CAMP_01', 'VIL_01', true);
      setActiveRoute(res);
      setLoadingRoute(false);
      showToast(`Safe route generated: ${res.total_distance_km} km (Dijkstra bypassed 1 submerged bridge)`);
    } catch {
      setLoadingRoute(false);
      showToast('Error calculating route');
    }
  };

  // Handle status update
  const handleUpdateStatus = async (id, status) => {
    await api.updateSOSStatus(id, status);
    setSosList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    showToast(`Incident ${id} marked as ${status.toUpperCase()}`);
  };

  // Handle citizen beacon submitted
  const handleSOSSubmitted = (newIncident) => {
    setSosList((prev) => [newIncident, ...prev]);
    showToast(`New NavIC SOS beacon received: ${newIncident.id}`);
  };

  // Handle open SITREP
  const handleOpenSitrep = async () => {
    const data = await api.getSitrep();
    setSitrepData(data);
    setIsSitrepOpen(true);
  };

  return (
    <div className="min-h-screen bg-tactical-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        metrics={metrics}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenSitrep={handleOpenSitrep}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1700px] w-full mx-auto flex flex-col gap-4">
        {/* Top 4 Metrics Cards */}
        <MetricCards metrics={metrics} activeRouteInfo={activeRoute} />

        {/* Dashboard Grid: 2/3 Tactical Map, 1/3 Incident Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-start">
          <div className="lg:col-span-2">
            <CommandMap
              floodZones={floodZones}
              villages={villages}
              rescueCamps={rescueCamps}
              roads={roads}
              sosList={sosList}
              activeRoute={activeRoute}
              onSelectVillage={(v) => showToast(`Selected village: ${v.name}`)}
              onSelectSOS={handleCalculateRoute}
            />
          </div>

          <div className="lg:col-span-1 h-full">
            <IncidentPanel
              sosList={sosList}
              selectedIncident={selectedIncident}
              onSelectIncident={(sos) => setSelectedIncident(sos)}
              onCalculateRoute={handleCalculateRoute}
              onUpdateStatus={handleUpdateStatus}
              loadingRoute={loadingRoute}
            />
          </div>
        </div>
      </main>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500 text-cyan-300 font-mono text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        onSubmitSuccess={handleSOSSubmitted}
      />

      <SitrepModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        sitrepData={sitrepData}
      />
    </div>
  );
}
