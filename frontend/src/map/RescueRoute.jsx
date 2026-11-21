import React from "react";
import { Polyline, Popup } from "react-leaflet";

export default function RescueRoute({
  rescueRoutes = [],
  blockedRoads = [],
  showRescue,
  showBlocked,
}) {
  return (
    <>
      {/* Green Rescue Routes */}
      {showRescue &&
        rescueRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: "#10b981",
              weight: 4,
              dashArray: "10, 8",
              opacity: 0.95,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-400">{route.name}</p>
                <p>Status: <span className="text-white font-semibold">{route.status}</span></p>
                <p>Estimated Time: <span className="text-emerald-300">{route.etaMinutes} mins</span></p>
              </div>
            </Popup>
          </Polyline>
        ))}

      {/* Red Blocked Roads */}
      {showBlocked &&
        blockedRoads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: "#ef4444",
              weight: 5,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-red-400">BLOCKED: {road.name}</p>
                <p>Cause: <span className="text-slate-200">{road.reason}</span></p>
              </div>
            </Popup>
          </Polyline>
        ))}
    </>
  );
}