import React from "react";
import { Polygon, Popup } from "react-leaflet";

export default function FloodLayer({ floodZones }) {
  return (
    <>
      {floodZones.map((zone) => {
        const isCritical = zone.severity === "CRITICAL";
        return (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              color: isCritical ? "#06b6d4" : "#38bdf8",
              fillColor: isCritical ? "#0891b2" : "#0ea5e9",
              fillOpacity: isCritical ? 0.42 : 0.28,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-cyan-300">{zone.name}</p>
                <p>Severity: <span className="font-semibold text-white">{zone.severity}</span></p>
                <p>Water Depth: <span className="font-semibold text-cyan-200">{zone.depthMeters} m</span></p>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}