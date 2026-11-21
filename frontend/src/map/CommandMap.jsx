<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet";
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
  Mountain,
  AlertTriangle,
  Globe,
  Loader2,
  ShieldCheck,
  LifeBuoy
} from "lucide-react";
import FloodLayer from "./FloodLayer";
import RescueRoute from "./RescueRoute";
import MapSearchBar from "./MapSearchBar";
import { api } from "../services/api";
=======
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, X, MapPin, Loader2, LocateFixed } from "lucide-react";
import FloodLayer from "./FloodLayer";
import RescueRoute from "./RescueRoute";
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)

const DEFAULT_CENTER = [26.158, 91.738];
const DEFAULT_ZOOM = 13;

const createMarkerIcon = (colorClass, pulse = false, label = "") =>
  L.divIcon({
    className: "custom-div-icon",
    html: `<div class="relative flex items-center justify-center"><div class="w-4 h-4 rounded-full border-2 border-white shadow ${colorClass} ${pulse ? "sos-pulse" : ""}"></div>${label ? `<span class="absolute -bottom-5 whitespace-nowrap bg-[#0a1428]/90 text-[10px] font-bold text-white px-1.5 py-0.5 rounded border border-slate-700">${label}</span>` : ""}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

function getDistanceKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapController({ selectedIncident, searchedPlace, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident?.coords) {
      map.flyTo(selectedIncident.coords, 14, { duration: 1.1 });
    }
  }, [selectedIncident, map]);

  useEffect(() => {
    if (searchedPlace?.coords) {
      map.flyTo(searchedPlace.coords, 14, { duration: 1.2 });
    }
  }, [searchedPlace, map]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
    }
  }, [resetTrigger, map]);

  return null;
}

<<<<<<< HEAD
// Map Click Handler for dynamic point threat prediction on click
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// 100% Accurate Google Maps & Global Tile Layers
const TILE_PROVIDERS = {
  google_streets: {
    name: "Google Maps (Roadmap)",
    description: "Official Google Maps: Complete streets, colonies, landmarks & shops up to 21x",
    url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 21,
    maxNativeZoom: 20,
    attribution: "&copy; Google Maps",
  },
  google_hybrid: {
    name: "Google Satellite (Hybrid)",
    description: "High-resolution satellite imagery with street, city and place labels",
    url: "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 21,
    maxNativeZoom: 20,
    attribution: "&copy; Google Maps Imagery",
  },
  google_terrain: {
    name: "Google Terrain",
    description: "Elevation contour shading, rivers, valleys & complete city labels",
    url: "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20,
    maxNativeZoom: 18,
    attribution: "&copy; Google Maps Terrain",
  },
  osm: {
    name: "OpenStreetMap",
    description: "Standard open world street map with all cities and towns",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    maxZoom: 19,
    maxNativeZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  },
  dark: {
    name: "Tactical Dark",
    description: "Night mode emergency operations center theme",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: ["a", "b", "c", "d"],
    maxZoom: 19,
    maxNativeZoom: 18,
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
};

const GUWAHATI_DISASTER_COORDS = [26.158, 91.738];

=======
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)
export default function CommandMap({
  floodZones,
  routes,
  incidents,
  camps,
  layers,
  selectedIncident,
  isDark,
}) {
<<<<<<< HEAD
  const [activeTile, setActiveTile] = useState("google_streets");
  const [currentZoom, setCurrentZoom] = useState(13);
  const [targetLocation, setTargetLocation] = useState({
    name: "Guwahati, Assam (Active Disaster Zone)",
    coords: GUWAHATI_DISASTER_COORDS,
    zoom: 13,
    type: "active_disaster",
  });
  const [searchedCity, setSearchedCity] = useState(null);
  const [locationPrediction, setLocationPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [dynamicFloodZones, setDynamicFloodZones] = useState([]);
  const [dynamicRoutes, setDynamicRoutes] = useState([]);
  const [dynamicBlockedRoads, setDynamicBlockedRoads] = useState([]);
  const [realtimeWeather, setRealtimeWeather] = useState(null);

  const fetchPrediction = async (coords, name) => {
    setIsPredicting(true);
    try {
      const predPromise = api.predictLocation(coords[0], coords[1], name);
      const realtimePromise = api.fetchRealtimeLocationFlood(coords[0], coords[1], name);

      const [pred, realtime] = await Promise.all([predPromise, realtimePromise]);
      setLocationPrediction(pred);

      if (realtime) {
        setRealtimeWeather(realtime.telemetry);
        if (realtime.dynamicFloodZone) {
          setDynamicFloodZones([realtime.dynamicFloodZone]);
        }
        if (realtime.dynamicRescueRoute) {
          setDynamicRoutes([realtime.dynamicRescueRoute]);
        }
        if (realtime.dynamicBlockedRoad) {
          setDynamicBlockedRoads([realtime.dynamicBlockedRoad]);
        }
      }
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setTargetLocation(loc);
    if (loc.type !== "active_disaster") {
      setSearchedCity(loc);
      fetchPrediction(loc.coords, loc.name);
    } else {
      setSearchedCity(null);
      setLocationPrediction(null);
      setDynamicFloodZones([]);
      setDynamicRoutes([]);
      setDynamicBlockedRoads([]);
      setRealtimeWeather(null);
    }
  };

  const handleMapClick = (coords) => {
    const loc = {
      name: `Point [${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E]`,
      coords,
      zoom: 14,
      type: "clicked_point",
    };
    setSearchedCity(loc);
    fetchPrediction(coords, loc.name);
  };

  const isAssamDisasterZone =
    !searchedCity ||
    (Math.abs(targetLocation.coords[0] - 26.158) < 0.8 &&
      Math.abs(targetLocation.coords[1] - 91.738) < 0.8);
=======
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedPlace, setSearchedPlace] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    const localMatches = [
      ...incidents
        .filter(
          (i) =>
            i.id.toLowerCase().includes(q.toLowerCase()) ||
            i.location.toLowerCase().includes(q.toLowerCase())
        )
        .map((i) => ({
          id: i.id,
          name: `${i.id} — ${i.location}`,
          tag: "SOS",
          coords: i.coords,
        })),
      ...camps
        .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
        .map((c) => ({
          id: c.id,
          name: c.name,
          tag: "CAMP",
          coords: c.coords,
        })),
    ];

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=4&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      const geoMatches = data.map((place) => ({
        id: place.place_id,
        name: place.display_name,
        tag: "MAP",
        coords: [parseFloat(place.lat), parseFloat(place.lon)],
      }));
      setResults([...localMatches, ...geoMatches]);
    } catch {
      setResults(localMatches);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item) => {
    setSearchedPlace(item);
    setQuery(item.name.split(",")[0]);
    setResults([]);
  };
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchedPlace(null);
  };

  const nearestCampMatch = useMemo(() => {
    if (!selectedIncident?.coords || !camps.length) return null;
    const eligible = camps.filter(
      (c) => c.capacity - c.occupied >= (selectedIncident.peopleAffected || 1)
    );
    const pool = eligible.length ? eligible : camps;

    let best = null;
    let minKm = Infinity;
    pool.forEach((camp) => {
      const dist = getDistanceKm(selectedIncident.coords, camp.coords);
      if (dist < minKm) {
        minKm = dist;
        best = camp;
      }
    });

    if (!best) return null;
    const etaMins = Math.max(4, Math.round((minKm / 18) * 60));
    return { camp: best, distanceKm: minKm.toFixed(1), etaMins };
  }, [selectedIncident, camps]);

  const tileUrl = isDark
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  const resetBtnStyle = isDark
    ? "bg-[#0a1428]/95 border-slate-700 text-slate-200 hover:text-cyan-400"
    : "bg-white/95 border-slate-300 text-slate-700 hover:text-sky-600";

  return (
    <div className="flex-1 relative h-full w-full">
      {/* Floating Location Search Bar */}
      <div className="absolute top-3 left-14 z-[450] w-72 sm:w-80">
        <form
          onSubmit={handleSearch}
          className={
            "flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg backdrop-blur-md " +
            (isDark
              ? "bg-[#0a1428]/95 border-slate-700 text-white"
              : "bg-white/95 border-slate-300 text-slate-900")
          }
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, village, or SOS ID..."
            className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-slate-400"
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-500 shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </form>

        {results.length > 0 && (
          <div
            className={
              "mt-1.5 rounded-xl border shadow-xl overflow-hidden max-h-56 overflow-y-auto " +
              (isDark
                ? "bg-[#0a1428] border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-800")
            }
          >
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className={
                  "w-full text-left px-3 py-2.5 text-xs flex items-start gap-2 border-b last:border-b-0 transition " +
                  (isDark
                    ? "border-slate-800 hover:bg-slate-800"
                    : "border-slate-100 hover:bg-sky-50")
                }
              >
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{item.name}</p>
                </div>
<<<<<<< HEAD
                <p className="text-[11px] text-slate-300 font-medium">
                  Guwahati & Kamrup Metro, Assam • 26.158°N, 91.738°E • Gauge: 51.1m (+1.6m Above Danger)
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pt-1 border-t border-slate-800">
                  <span>Sensor: ISRO Bhoonidhi RISAT-1A SAR</span>
                  <span className="text-emerald-400 font-bold">{zoomDetailLabel} ({currentZoom}x)</span>
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
                  Coordinates: {targetLocation?.coords[0].toFixed(4)}°N, {targetLocation?.coords[1].toFixed(4)}°E • Zoom: {currentZoom}x
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pt-1 border-t border-slate-800">
                  <span>
                    🛰️ Live Radar: {realtimeWeather?.rainRate > 0 ? `Rain ${realtimeWeather.rainRate} mm/h` : "Real-Time Telemetry Active"} • Elev: {realtimeWeather?.elevation || 12}m
                  </span>
                  <span className={`font-bold ${realtimeWeather?.severity === "CRITICAL" ? "text-rose-400" : "text-emerald-400"}`}>
                    Flood Threat: {realtimeWeather?.severity || "MONITORED"}
                  </span>
                </div>
              </div>
            )}
=======
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-500 shrink-0">
                  {item.tag}
                </span>
              </button>
            ))}
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)
          </div>
        )}
      </div>

      {/* One-Click Reset View Button */}
      <button
        onClick={() => {
          handleClearSearch();
          setResetTrigger((n) => n + 1);
        }}
        title="Reset to Flood Basin View"
        className={"absolute top-3 right-3 z-[450] p-2.5 rounded-xl border shadow-lg transition " + resetBtnStyle}
      >
        <LocateFixed className="w-4 h-4" />
      </button>

      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full z-10">
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors" />
        <MapController
          selectedIncident={selectedIncident}
          searchedPlace={searchedPlace}
          resetTrigger={resetTrigger}
        />

<<<<<<< HEAD
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Searched / Clicked Location Pin with AI Prediction */}
        {searchedCity && (
          <Marker position={searchedCity.coords} icon={searchPinIcon}>
            <Popup>
              <div className="text-xs space-y-2 font-mono p-1 max-w-[320px]">
                <div className="flex items-center justify-between gap-1 border-b border-slate-700 pb-1.5">
                  <p className="font-bold text-cyan-300 text-sm truncate">📍 {searchedCity.name}</p>
                  {locationPrediction && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0 ${
                        locationPrediction.prediction?.is_marooned
                          ? "bg-rose-950 text-rose-300 border border-rose-600"
                          : locationPrediction.prediction?.access_status === "At risk"
                          ? "bg-amber-950 text-amber-300 border border-amber-600"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-600"
                      }`}
                    >
                      {locationPrediction.prediction?.access_status?.toUpperCase() || "ACCESSIBLE"}
                    </span>
                  )}
                </div>

                {isPredicting ? (
                  <div className="py-2.5 flex items-center justify-center gap-2 text-cyan-400 text-[11px] animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Analyzing satellite flood masks & road connectivity...</span>
                  </div>
                ) : locationPrediction ? (
                  <div className="space-y-1.5 text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Threat Risk Score:</span>
                      <span className={`font-black font-mono ${
                        (locationPrediction.prediction?.risk_score || 0) > 70
                          ? "text-rose-400"
                          : (locationPrediction.prediction?.risk_score || 0) > 40
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}>
                        {locationPrediction.prediction?.risk_score || 0} / 100
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Flood Status:</span>
                      <span className={`font-bold ${
                        locationPrediction.prediction?.is_inundated ? "text-rose-400" : "text-emerald-400"
                      }`}>
                        {locationPrediction.prediction?.is_inundated
                          ? "🌊 INUNDATED"
                          : `DRY GROUND (${locationPrediction.prediction?.flood_distance_meters || 0}m)`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Nearest Camp:</span>
                      <span className="text-cyan-300 font-semibold truncate max-w-[140px]">
                        {locationPrediction.nearest_rescue_camp?.camp_name || locationPrediction.nearest_rescue_camp?.name || "NDRF Base"}
                      </span>
                    </div>

                    {locationPrediction.recommended_rescue_route && (
                      <div className="flex justify-between items-center border-t border-slate-800 pt-1 text-[10px]">
                        <span className="text-emerald-400 font-bold">RescueRoute Bypass:</span>
                        <span className="font-mono font-bold text-white">
                          {locationPrediction.recommended_rescue_route.total_distance_km} km (ETA {locationPrediction.recommended_rescue_route.eta_minutes}m)
                        </span>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-300 pt-1 border-t border-slate-800/80 leading-tight">
                      {locationPrediction.prediction?.isolation_reason || locationPrediction.recommended_action}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-300 text-[11px]">{searchedCity.full_name || searchedCity.desc}</p>
                )}

                <div className="flex gap-2 text-[10px] text-slate-400">
                  <span>Lat: {searchedCity.coords[0].toFixed(4)}°N</span>
                  <span>Lon: {searchedCity.coords[1].toFixed(4)}°E</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setTargetLocation({
                        ...searchedCity,
                        bounds: null,
                        zoom: 17,
                        ts: Date.now(),
                      })
                    }
                    className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[10px] font-bold"
                  >
                    🔍 Street Level (17x)
                  </button>
                  <button
                    onClick={() =>
                      setTargetLocation({
                        ...searchedCity,
                        bounds: null,
                        zoom: 14,
                        ts: Date.now(),
                      })
                    }
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] font-bold"
                  >
                    🏙️ City View (14x)
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

        {/* Dynamic AI RescueRoute calculated for clicked/searched point */}
        {locationPrediction?.recommended_rescue_route?.route_coordinates?.length > 1 && (
          <Polyline
            positions={locationPrediction.recommended_rescue_route.route_coordinates}
            pathOptions={{
              color: "#10b981",
              weight: 6,
              dashArray: "8, 6",
              opacity: 0.95,
              lineCap: "round",
            }}
          >
            <Tooltip permanent direction="center">
              <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/60 shadow">
                ⚡ Dynamic RescueRoute: {locationPrediction.recommended_rescue_route.total_distance_km} km ({locationPrediction.recommended_rescue_route.eta_minutes}m ETA)
              </span>
            </Tooltip>
            <Popup>
              <div className="text-xs space-y-1 font-mono p-1">
                <p className="font-bold text-emerald-400">⚡ DYNAMIC RESCUEROUTE AI BYPASS</p>
                <p className="text-white">To: {locationPrediction.place_name}</p>
                <p className="text-slate-300">
                  Total Distance: <span className="font-bold text-emerald-300">{locationPrediction.recommended_rescue_route.total_distance_km} km</span>
                </p>
                <p className="text-slate-300">
                  Estimated Time: <span className="font-bold text-white">{locationPrediction.recommended_rescue_route.eta_minutes} mins</span>
                </p>
                <p className="text-cyan-300 text-[10px]">
                  Bypassing submerged roads via Dijkstra high-ground graph.
                </p>
              </div>
            </Popup>
          </Polyline>
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
        {layers.floodZones && (
          <FloodLayer floodZones={[...(floodZones || []), ...dynamicFloodZones]} />
        )}
=======
        {layers.floodZones && <FloodLayer floodZones={floodZones} />}
>>>>>>> cc0e267 (feat(frontend): add 3D flood basin landing page, tactical HUD, and map search)

        <RescueRoute
          rescueRoutes={[...(routes?.rescueRoutes || []), ...dynamicRoutes]}
          blockedRoads={[...(routes?.blockedRoads || []), ...dynamicBlockedRoads]}
          showRescue={layers.rescueRoutes}
          showBlocked={layers.blockedRoads}
        />

        {searchedPlace && (
          <Marker
            position={searchedPlace.coords}
            icon={createMarkerIcon("bg-sky-500", false, "SEARCHED")}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-sky-400">Searched Location</p>
                <p className="text-white">{searchedPlace.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {nearestCampMatch && (
          <Polyline
            positions={[selectedIncident.coords, nearestCampMatch.camp.coords]}
            pathOptions={{
              color: "#0ea5e9",
              weight: 4,
              dashArray: "6, 8",
              opacity: 1,
            }}
          >
            <Tooltip permanent direction="center">
              <span className="font-bold text-xs">
                Nearest Camp: {nearestCampMatch.distanceKm} km • ~{nearestCampMatch.etaMins} min Boat ETA
              </span>
            </Tooltip>
          </Polyline>
        )}

        {layers.incidents &&
          incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={inc.coords}
              icon={createMarkerIcon(
                inc.type === "SOS" ? "bg-red-500" : "bg-amber-400",
                inc.status !== "DISPATCHED"
              )}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-red-400">
                    {inc.id} • Priority {inc.triageScore}/100
                  </p>
                  <p className="font-semibold text-white">{inc.title}</p>
                  <p className="text-slate-300">
                    {inc.location} ({inc.peopleAffected} people)
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {layers.camps &&
          camps.map((camp) => (
            <Marker
              key={camp.id}
              position={camp.coords}
              icon={createMarkerIcon("bg-emerald-500", false, "CAMP")}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-400">{camp.name}</p>
                  <p>
                    Free Beds:{" "}
                    <span className="text-white font-semibold">
                      {camp.capacity - camp.occupied}
                    </span>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}