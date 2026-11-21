import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Satellite, Moon, Layers, AlertCircle } from "lucide-react";
import FloodLayer from "./FloodLayer";
import RescueRoute from "./RescueRoute";

// Custom Tactical Markers using L.divIcon
const createMarkerIcon = (colorClass, pulse = false, label = "") =>
  L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-4 h-4 rounded-full border-2 border-white ${colorClass} ${
      pulse ? "sos-pulse" : ""
    }"></div>
        ${
          label
            ? `<span class="absolute -bottom-5 whitespace-nowrap bg-[#0a1428]/95 text-[10px] font-mono font-bold text-white px-1.5 py-0.5 rounded border border-slate-700 shadow">${label}</span>`
            : ""
        }
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// Epicenter Marker
const epicenterIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full bg-rose-600/30 border-2 border-rose-500 animate-ping absolute"></div>
      <div class="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-lg shadow-rose-600/80">
        <span class="text-[10px] text-white font-black">!</span>
      </div>
      <span class="absolute -bottom-6 whitespace-nowrap bg-rose-950/95 text-[10px] font-mono font-black text-rose-300 px-2 py-0.5 rounded border border-rose-500/70 shadow-lg">
        DISASTER EPICENTER (Guwahati)
      </span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map Controller for programmatic flyTo
function MapController({ selectedIncident, targetLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident?.coords) {
      map.flyTo(selectedIncident.coords, 15, { duration: 1.2 });
    }
  }, [selectedIncident, map]);

  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation.coords, targetLocation.zoom, { duration: 1.2 });
    }
  }, [targetLocation, map]);

  return null;
}

const TILE_PROVIDERS = {
  satellite: {
    name: "Satellite (ISRO EO)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  dark: {
    name: "Tactical Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  street: {
    name: "Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
};

const PRESET_LOCATIONS = [
  { name: "Full Overview", coords: [26.158, 91.738], zoom: 13 },
  { name: "Brahmaputra River", coords: [26.182, 91.730], zoom: 14 },
  { name: "Submerged NH-27", coords: [26.169, 91.730], zoom: 15 },
  { name: "Kharghuli SOS", coords: [26.182, 91.744], zoom: 15 },
  { name: "NDRF Base", coords: [26.138, 91.785], zoom: 14 },
];

export default function CommandMap({
  floodZones,
  routes,
  incidents,
  camps,
  layers,
  selectedIncident,
}) {
  const [activeTile, setActiveTile] = useState("dark");
  const [targetLocation, setTargetLocation] = useState(null);

  return (
    <div className="flex-1 relative h-full w-full bg-[#060d1f] overflow-hidden">
      {/* High-Visibility Disaster Operations HUD Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] w-[95%] max-w-4xl pointer-events-none">
        <div className="bg-[#081329]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl text-white pointer-events-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-black tracking-wide text-rose-300 uppercase">
                    ACTIVE DISASTER ZONE: BRAHMAPUTRA FLOOD BASIN
                  </h2>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-700/80 rounded">
                    SEVERITY: RED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Guwahati & Kamrup Metropolitan, Assam • 26.158°N, 91.738°E • River Level: 51.1m (+1.6m above danger)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                ISRO Bhoonidhi RISAT-1A SAR Radar
              </span>
            </div>
          </div>

          {/* Quick Location Navigation Buttons */}
          <div className="flex items-center gap-1.5 pt-2 overflow-x-auto text-[11px] font-medium text-slate-300">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 shrink-0 font-bold flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" /> Focus:
            </span>
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setTargetLocation({ coords: loc.coords, zoom: loc.zoom, ts: Date.now() })}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 border border-slate-700/80 whitespace-nowrap transition text-[10px]"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Basemap Switcher Control (Top Right) */}
      <div className="absolute top-24 right-3 z-[400] flex flex-col gap-1 bg-[#09152e]/90 backdrop-blur-sm border border-slate-700/80 p-1.5 rounded-lg shadow-xl">
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase px-1">Basemap</span>
        <button
          onClick={() => setActiveTile("dark")}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition ${
            activeTile === "dark"
              ? "bg-cyan-600 text-white font-bold"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Moon className="w-3 h-3" /> Dark
        </button>
        <button
          onClick={() => setActiveTile("satellite")}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition ${
            activeTile === "satellite"
              ? "bg-cyan-600 text-white font-bold"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Satellite className="w-3 h-3" /> Satellite
        </button>
        <button
          onClick={() => setActiveTile("street")}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition ${
            activeTile === "street"
              ? "bg-cyan-600 text-white font-bold"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Layers className="w-3 h-3" /> Street
        </button>
      </div>

      {/* The Map */}
      <MapContainer
        center={[26.158, 91.738]}
        zoom={13}
        className="h-full w-full z-10"
        zoomControl={true}
      >
        <TileLayer
          key={activeTile}
          url={TILE_PROVIDERS[activeTile].url}
          attribution={TILE_PROVIDERS[activeTile].attribution}
          maxZoom={19}
        />

        <MapController
          selectedIncident={selectedIncident}
          targetLocation={targetLocation}
        />

        {/* Disaster Epicenter Marker */}
        <Marker position={[26.182, 91.730]} icon={epicenterIcon}>
          <Popup>
            <div className="text-xs space-y-1 font-mono p-1">
              <p className="font-bold text-rose-400 text-sm">🚨 FLOOD DISASTER EPICENTER</p>
              <p className="font-semibold text-white">Brahmaputra River - Guwahati Reach</p>
              <p className="text-slate-300">
                Water Gauge: <span className="text-cyan-300 font-bold">51.10 meters</span>
              </p>
              <p className="text-rose-400 font-bold">
                Level: 1.6m Above Danger Mark (49.50m)
              </p>
              <p className="text-slate-400 text-[11px]">
                Active Embankment Overflow affecting Kharghuli, Pandu, and North Bank settlements.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Flood Inundation Polygons & Brahmaputra River Course */}
        {layers.floodZones && <FloodLayer floodZones={floodZones} />}

        {/* Dijkstra Safe Bypass Routes & Submerged Blocked Roads */}
        <RescueRoute
          rescueRoutes={routes.rescueRoutes}
          blockedRoads={routes.blockedRoads}
          showRescue={layers.rescueRoutes}
          showBlocked={layers.blockedRoads}
        />

        {/* SOS & Marooned Incident Markers */}
        {layers.incidents &&
          incidents.map((inc) => {
            const isSOS = inc.type === "SOS";
            return (
              <Marker
                key={inc.id}
                position={inc.coords}
                icon={createMarkerIcon(
                  isSOS ? "bg-red-500" : "bg-amber-400",
                  inc.status !== "DISPATCHED",
                  inc.id
                )}
              >
                <Popup>
                  <div className="text-xs space-y-1 font-mono p-1">
                    <p className="font-bold text-red-400">{inc.id} • {inc.type}</p>
                    <p className="font-semibold text-white">{inc.title}</p>
                    <p className="text-slate-300">{inc.location} ({inc.peopleAffected} people affected)</p>
                    <p className="text-emerald-400 font-semibold">Status: {inc.status}</p>
                    <p className="text-slate-400 text-[10px]">Reported via: NavIC Distress Messaging Beacon</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Relief Camps */}
        {layers.camps &&
          camps.map((camp) => (
            <Marker
              key={camp.id}
              position={camp.coords}
              icon={createMarkerIcon("bg-emerald-500", false, "CAMP")}
            >
              <Popup>
                <div className="text-xs space-y-1 font-mono p-1">
                  <p className="font-bold text-emerald-400">{camp.name}</p>
                  <p>
                    Occupancy: <span className="text-white font-semibold">{camp.occupied} / {camp.capacity}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">Equipped with Medical, Food & Evacuation Heli-pad</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
