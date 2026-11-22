import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, X, MapPin, Loader2, LocateFixed } from "lucide-react";
import FloodLayer from "./FloodLayer";
import RescueRoute from "./RescueRoute";

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

export default function CommandMap({
  floodZones,
  routes,
  incidents,
  camps,
  layers,
  selectedIncident,
  isDark,
}) {
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
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-500 shrink-0">
                  {item.tag}
                </span>
              </button>
            ))}
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

        {layers.floodZones && <FloodLayer floodZones={floodZones} />}

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