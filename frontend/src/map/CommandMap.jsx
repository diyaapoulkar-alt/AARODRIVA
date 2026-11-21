import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
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
            ? `<span class="absolute -bottom-5 whitespace-nowrap bg-[#0a1428]/90 text-[10px] font-bold text-white px-1.5 py-0.5 rounded border border-slate-700">${label}</span>`
            : ""
        }
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

function MapController({ selectedIncident }) {
  const map = useMap();
  useEffect(() => {
    if (selectedIncident?.coords) {
      map.flyTo(selectedIncident.coords, 14, { duration: 1.2 });
    }
  }, [selectedIncident, map]);
  return null;
}

export default function CommandMap({
  floodZones,
  routes,
  incidents,
  camps,
  layers,
  selectedIncident,
}) {
  return (
    <div className="flex-1 relative h-full w-full">
      <MapContainer
        center={[26.158, 91.738]}
        zoom={13}
        className="h-full w-full z-10"
        zoomControl={true}
      >
        {/* Dark Navy CartoDB Basemap */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        <MapController selectedIncident={selectedIncident} />

        {/* Flood Polygons */}
        {layers.floodZones && <FloodLayer floodZones={floodZones} />}

        {/* Rescue Routes & Blocked Roads */}
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
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-red-400">{inc.id} • {inc.type}</p>
                    <p className="font-semibold text-white">{inc.title}</p>
                    <p className="text-slate-300">{inc.location} ({inc.peopleAffected} people)</p>
                    <p className="text-emerald-400 font-semibold">Status: {inc.status}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Rescue & Relief Camps */}
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
                  <p>Occupancy: <span className="text-white font-semibold">{camp.occupied} / {camp.capacity}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}