import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  Satellite,
  Moon,
  Layers,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
  Globe,
} from "lucide-react";
import FloodLayer from "./FloodLayer";
import RescueRoute from "./RescueRoute";
import MapSearchBar from "./MapSearchBar";

// Tactical Marker for SOS / Marooned incidents
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

// Epicenter Marker for Assam Flood Zone
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

// Search Pin for any user-searched city worldwide
const searchPinIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-9 h-9 rounded-full bg-cyan-500/25 border-2 border-cyan-400 animate-ping absolute"></div>
      <div class="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center shadow-xl shadow-cyan-600/80 text-white font-bold text-xs">
        📍
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Map Controller for smooth flyTo and programmatic control
function MapController({ selectedIncident, targetLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident?.coords) {
      map.flyTo(selectedIncident.coords, 15, { duration: 1.2 });
    }
  }, [selectedIncident, map]);

  useEffect(() => {
    if (targetLocation?.coords) {
      map.flyTo(targetLocation.coords, targetLocation.zoom || 13, {
        duration: 1.5,
      });
    }
  }, [targetLocation, map]);

  return null;
}

// Tile layers providing Google Maps style details, Satellite Hybrid, OpenStreetMap and Tactical Dark
const TILE_PROVIDERS = {
  voyager: {
    name: "Google Style (Voyager)",
    description: "Detailed city, country, road & place names just like Google Maps",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>",
    maxZoom: 19,
  },
  satellite_hybrid: {
    name: "Satellite (Hybrid)",
    description: "High-resolution satellite imagery with country, city & road labels",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labelsUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19,
  },
  osm: {
    name: "OpenStreetMap",
    description: "Standard open world street map with all cities and towns",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
  dark: {
    name: "Tactical Dark",
    description: "Night mode emergency operations center theme",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 19,
  },
};

const GUWAHATI_DISASTER_COORDS = [26.158, 91.738];

export default function CommandMap({
  floodZones,
  routes,
  incidents,
  camps,
  layers,
  selectedIncident,
}) {
  const [activeTile, setActiveTile] = useState("voyager");
  const [targetLocation, setTargetLocation] = useState({
    name: "Guwahati, Assam (Active Disaster Zone)",
    coords: GUWAHATI_DISASTER_COORDS,
    zoom: 13,
    type: "active_disaster",
  });
  const [searchedCity, setSearchedCity] = useState(null);

  const handleSelectLocation = (loc) => {
    setTargetLocation(loc);
    if (loc.type !== "active_disaster") {
      setSearchedCity(loc);
    } else {
      setSearchedCity(null);
    }
  };

  const isAssamDisasterZone =
    !searchedCity ||
    (Math.abs(targetLocation.coords[0] - 26.158) < 0.8 &&
      Math.abs(targetLocation.coords[1] - 91.738) < 0.8);

  return (
    <div className="flex-1 relative h-full w-full bg-[#060d1f] overflow-hidden">
      {/* Top Floating Control Bar: Search & HUD */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-col md:flex-row items-start justify-between gap-3 pointer-events-none">
        {/* Google Maps Style Global City Search Bar */}
        <MapSearchBar
          onSelectLocation={handleSelectLocation}
          currentFocusName={targetLocation?.name}
        />

        {/* Dynamic Disaster & Reconnaissance HUD Badge */}
        <div className="w-full md:w-auto max-w-xl pointer-events-auto">
          <div className="bg-[#081329]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl text-white">
            {isAssamDisasterZone ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <h2 className="text-xs sm:text-sm font-black tracking-wide text-rose-300 uppercase">
                      ACTIVE DISASTER: BRAHMAPUTRA FLOOD BASIN
                    </h2>
                  </div>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-700/80 rounded shrink-0">
                    SEVERITY: RED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Guwahati & Kamrup Metro, Assam • 26.158°N, 91.738°E • Gauge: 51.1m (+1.6m Above Danger)
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pt-1 border-t border-slate-800">
                  <span>Sensor: ISRO Bhoonidhi RISAT-1A SAR</span>
                  <span>14 Marooned Sectors Monitored</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                    <h2 className="text-xs sm:text-sm font-black tracking-wide text-cyan-300 uppercase truncate">
                      {searchedCity?.name}
                    </h2>
                  </div>
                  <button
                    onClick={() =>
                      handleSelectLocation({
                        name: "Guwahati, Assam (Active Disaster Zone)",
                        coords: GUWAHATI_DISASTER_COORDS,
                        zoom: 13,
                        type: "active_disaster",
                      })
                    }
                    className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition shadow shrink-0"
                  >
                    🚨 Return to Assam EOC
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">
                  Coordinates: {targetLocation?.coords[0].toFixed(4)}°N, {targetLocation?.coords[1].toFixed(4)}°E • Zoom: {targetLocation?.zoom}x
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  Global Earth Observation Mode: Zoom in to inspect local streets, bridges and topography.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basemap Switcher Floating Widget (Top Right) */}
      <div className="absolute top-28 right-3 z-[400] flex flex-col gap-1 bg-[#09152e]/95 backdrop-blur-md border border-cyan-500/40 p-2 rounded-xl shadow-2xl">
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase px-1 pb-1 border-b border-slate-800 flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-400" /> Basemap
        </span>

        {/* Google Maps Style Voyager */}
        <button
          onClick={() => setActiveTile("voyager")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition text-left ${
            activeTile === "voyager"
              ? "bg-cyan-600 text-white font-bold shadow"
              : "text-slate-300 hover:bg-slate-800"
          }`}
          title="Google Maps style with detailed country, city, street names"
        >
          <MapIcon className="w-3.5 h-3.5 text-cyan-300" />
          <span>Google Style</span>
        </button>

        {/* Satellite Hybrid */}
        <button
          onClick={() => setActiveTile("satellite_hybrid")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition text-left ${
            activeTile === "satellite_hybrid"
              ? "bg-cyan-600 text-white font-bold shadow"
              : "text-slate-300 hover:bg-slate-800"
          }`}
          title="Satellite imagery with superimposed country and city labels"
        >
          <Satellite className="w-3.5 h-3.5 text-cyan-300" />
          <span>Satellite Hybrid</span>
        </button>

        {/* Tactical Dark */}
        <button
          onClick={() => setActiveTile("dark")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition text-left ${
            activeTile === "dark"
              ? "bg-cyan-600 text-white font-bold shadow"
              : "text-slate-300 hover:bg-slate-800"
          }`}
          title="Tactical dark theme for command center operations"
        >
          <Moon className="w-3.5 h-3.5 text-cyan-300" />
          <span>Tactical Dark</span>
        </button>

        {/* OpenStreetMap */}
        <button
          onClick={() => setActiveTile("osm")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition text-left ${
            activeTile === "osm"
              ? "bg-cyan-600 text-white font-bold shadow"
              : "text-slate-300 hover:bg-slate-800"
          }`}
          title="Standard OpenStreetMap global street map"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-300" />
          <span>OpenStreetMap</span>
        </button>
      </div>

      {/* The Leaflet World Map Container */}
      <MapContainer
        center={GUWAHATI_DISASTER_COORDS}
        zoom={13}
        minZoom={2}
        maxZoom={19}
        worldCopyJump={true}
        className="h-full w-full z-10"
        zoomControl={true}
      >
        {/* Base Tile Layer */}
        <TileLayer
          key={activeTile}
          url={TILE_PROVIDERS[activeTile].url}
          attribution={TILE_PROVIDERS[activeTile].attribution}
          maxZoom={TILE_PROVIDERS[activeTile].maxZoom || 19}
        />

        {/* Satellite Reference Labels Overlay (For Satellite Hybrid mode) */}
        {activeTile === "satellite_hybrid" && (
          <TileLayer
            key="satellite-labels"
            url={TILE_PROVIDERS.satellite_hybrid.labelsUrl}
            maxZoom={19}
            zIndex={200}
          />
        )}

        <MapController
          selectedIncident={selectedIncident}
          targetLocation={targetLocation}
        />

        {/* Searched Location Pin */}
        {searchedCity && (
          <Marker position={searchedCity.coords} icon={searchPinIcon}>
            <Popup>
              <div className="text-xs space-y-2 font-mono p-1">
                <p className="font-bold text-cyan-400 text-sm">📍 {searchedCity.name}</p>
                <p className="text-slate-300 text-[11px]">{searchedCity.full_name || searchedCity.desc}</p>
                <div className="flex gap-2 text-[10px] text-slate-400">
                  <span>Lat: {searchedCity.coords[0].toFixed(4)}</span>
                  <span>Lon: {searchedCity.coords[1].toFixed(4)}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex gap-2">
                  <button
                    onClick={() =>
                      setTargetLocation({
                        ...searchedCity,
                        zoom: Math.min(17, (targetLocation.zoom || 13) + 2),
                        ts: Date.now(),
                      })
                    }
                    className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[10px] font-bold"
                  >
                    🔍 Zoom Closer
                  </button>
                  <button
                    onClick={() =>
                      handleSelectLocation({
                        name: "Guwahati, Assam (Active Disaster Zone)",
                        coords: GUWAHATI_DISASTER_COORDS,
                        zoom: 13,
                        type: "active_disaster",
                      })
                    }
                    className="px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-[10px] font-bold"
                  >
                    🚨 Go to Assam EOC
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Disaster Epicenter Marker (Assam) */}
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
