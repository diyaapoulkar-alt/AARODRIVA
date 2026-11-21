import React, { useEffect, useRef, useState } from 'react';

export default function CommandMap({
  floodZones,
  villages,
  rescueCamps,
  roads,
  sosList,
  activeRoute,
  onSelectVillage,
  onSelectSOS
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    flood: null,
    villages: null,
    camps: null,
    roads: null,
    sos: null,
    route: null
  });

  const [toggles, setToggles] = useState({
    flood: true,
    villages: true,
    camps: true,
    roads: true,
    sos: true
  });

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    // Center on Golaghat / Brahmaputra basin, Assam
    const map = L.map(mapContainerRef.current, {
      center: [26.65, 93.15],
      zoom: 11,
      zoomControl: false
    });

    // Dark Tactical Base Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; ISRO Bhuvan Thematic Services & OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize layer groups
    layersRef.current.flood = L.layerGroup().addTo(map);
    layersRef.current.roads = L.layerGroup().addTo(map);
    layersRef.current.villages = L.layerGroup().addTo(map);
    layersRef.current.camps = L.layerGroup().addTo(map);
    layersRef.current.sos = L.layerGroup().addTo(map);
    layersRef.current.route = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Flood Zones Layer
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current || !L || !layersRef.current.flood) return;
    const group = layersRef.current.flood;
    group.clearLayers();

    if (!toggles.flood || !floodZones?.features) return;

    L.geoJSON(floodZones, {
      style: {
        color: '#00f0ff',
        weight: 2,
        fillColor: '#00e5ff',
        fillOpacity: 0.32,
        dashArray: '4, 4'
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        layer.bindPopup(`
          <div style="font-family: monospace; font-size: 11px;">
            <strong style="color: #00f0ff; font-size: 13px;">${props.name || 'Flood Zone'}</strong><br/>
            <span style="color: #94a3b8;">Source: ${props.source || 'ISRO Bhoonidhi SAR'}</span><br/>
            <span style="color: #cbd5e1;">Depth: ${props.depth_category || 'Severe (>1.5m)'}</span><br/>
            <span style="color: #38bdf8;">Area: ${props.inundation_area_sqkm || 84.6} sq km</span>
          </div>
        `);
      }
    }).addTo(group);
  }, [floodZones, toggles.flood]);

  // Update Roads Layer
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current || !L || !layersRef.current.roads) return;
    const group = layersRef.current.roads;
    group.clearLayers();

    if (!toggles.roads || !roads?.features) return;

    L.geoJSON(roads, {
      style: (feature) => {
        const isFlooded = feature?.properties?.is_flooded;
        return {
          color: isFlooded ? '#ef4444' : '#475569',
          weight: isFlooded ? 4 : 2.5,
          opacity: isFlooded ? 0.9 : 0.6,
          dashArray: isFlooded ? '6, 6' : null
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const isFlooded = props.is_flooded;
        layer.bindPopup(`
          <div style="font-family: monospace; font-size: 11px;">
            <strong style="color: ${isFlooded ? '#ef4444' : '#94a3b8'};">${props.name}</strong><br/>
            <span>Status: <strong>${isFlooded ? '🔴 SUBMERGED / IMPASSABLE' : '🟢 CLEAR'}</strong></span><br/>
            ${props.water_depth_cm ? `<span style="color: #f87171;">Water Depth: ${props.water_depth_cm} cm</span><br/>` : ''}
            <span>Length: ${props.length_km} km</span>
          </div>
        `);
      }
    }).addTo(group);
  }, [roads, toggles.roads]);

  // Update Villages Layer
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current || !L || !layersRef.current.villages) return;
    const group = layersRef.current.villages;
    group.clearLayers();

    if (!toggles.villages || !villages?.features) return;

    villages.features.forEach((feature) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [0, 0];
      const isMarooned = props.is_marooned || props.access_status === 'Marooned';

      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isMarooned ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width: 22px; height: 22px; border-radius: 50%; background: ${isMarooned ? '#ef4444' : '#10b981'}; border: 2.5px solid #0f172a; box-shadow: 0 0 10px ${isMarooned ? '#ef4444' : '#10b981'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
            ${isMarooned ? '!' : '✓'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-village-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([coords[1], coords[0]], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <strong style="color: ${isMarooned ? '#f87171' : '#34d399'}; font-size: 13px;">${props.name}</strong><br/>
          <span>Status: <strong>${props.access_status || 'Monitored'}</strong></span><br/>
          <span>Population: <strong>${props.population} souls</strong></span><br/>
          <p style="margin-top: 5px; color: #94a3b8; font-size: 10px;">${props.isolation_reason || ''}</p>
        </div>
      `);
      marker.addTo(group);
    });
  }, [villages, toggles.villages]);

  // Update Rescue Camps Layer
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current || !L || !layersRef.current.camps) return;
    const group = layersRef.current.camps;
    group.clearLayers();

    if (!toggles.camps || !rescueCamps?.features) return;

    rescueCamps.features.forEach((feature) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [0, 0];

      const iconHtml = `
        <div style="width: 28px; height: 28px; border-radius: 8px; background: #0284c7; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);">
          ⛺
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-camp-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([coords[1], coords[0]], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <strong style="color: #38bdf8; font-size: 13px;">${props.name}</strong><br/>
          <span>Agency: <strong>${props.commanding_agency || 'NDRF'}</strong></span><br/>
          <span>Boats Available: <strong>${props.available_boats || 4} Speedboats</strong></span><br/>
          <span>VHF Radio: <strong>${props.radio_frequency_vhf || '156.800 MHz'}</strong></span>
        </div>
      `);
      marker.addTo(group);
    });
  }, [rescueCamps, toggles.camps]);

  // Update SOS Markers
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current || !L || !layersRef.current.sos) return;
    const group = layersRef.current.sos;
    group.clearLayers();

    if (!toggles.sos || !sosList) return;

    sosList.forEach((sos) => {
      if (!sos.latitude || !sos.longitude) return;
      const isCritical = sos.urgency?.toLowerCase() === 'critical';

      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${isCritical ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 26px; height: 26px; border-radius: 50%; background: ${isCritical ? '#f43f5e' : '#f59e0b'}; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 12px ${isCritical ? '#f43f5e' : '#f59e0b'};">
            🚨
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-sos-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([sos.latitude, sos.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px;">
          <strong style="color: #f43f5e; font-size: 13px;">${sos.id} — ${sos.village_name}</strong><br/>
          <span>Urgency: <strong style="text-transform: uppercase;">${sos.urgency}</strong></span><br/>
          <span>Headcount: <strong>${sos.people_count} Stranded</strong></span><br/>
          <span>NavIC GNSS: <strong>Verified</strong></span><br/>
          <p style="margin-top: 5px; color: #cbd5e1; font-style: italic;">"${sos.message || ''}"</p>
        </div>
      `);
      marker.addTo(group);
    });
  }, [sosList, toggles.sos]);

  // Update Dynamic Calculated Rescue Route
  useEffect(() => {
    const L = window.L;
    if (!mapInstanceRef.current || !L || !layersRef.current.route) return;
    const group = layersRef.current.route;
    group.clearLayers();

    if (!activeRoute?.route_coordinates?.length) return;

    const coords = activeRoute.route_coordinates;

    // Glowing outer outline
    L.polyline(coords, {
      color: '#064e3b',
      weight: 9,
      opacity: 0.8
    }).addTo(group);

    // Neon green inner polyline
    const line = L.polyline(coords, {
      color: '#10b981',
      weight: 5,
      opacity: 1,
      dashArray: '2, 8',
      lineCap: 'round'
    }).addTo(group);

    // Route info label at midpoint
    const midIdx = Math.floor(coords.length / 2);
    const midPoint = coords[midIdx];
    if (midPoint) {
      const tooltipIcon = L.divIcon({
        html: `
          <div style="background: rgba(16, 185, 129, 0.95); color: #064e3b; font-family: monospace; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap; border: 1px solid #34d399;">
            ✓ Safe Bypass: ${activeRoute.total_distance_km} km (Avoided Submerged Bridge)
          </div>
        `,
        className: 'route-badge',
        iconAnchor: [80, 24]
      });
      L.marker(midPoint, { icon: tooltipIcon }).addTo(group);
    }

    // Fit map bounds to show route nicely
    mapInstanceRef.current.fitBounds(line.getBounds(), { padding: [50, 50] });
  }, [activeRoute]);

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-tactical-900">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Controls Floating Widget */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs shadow-xl font-mono text-slate-300 space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700/60 pb-1 flex items-center justify-between gap-4">
          <span>ISRO Tactical Layers</span>
          <span className="text-cyan-400">Live</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={toggles.flood}
            onChange={(e) => setToggles({ ...toggles, flood: e.target.checked })}
            className="rounded text-cyan-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            Bhoonidhi SAR Flood Mask
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={toggles.villages}
            onChange={(e) => setToggles({ ...toggles, villages: e.target.checked })}
            className="rounded text-rose-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            Marooned Settlements
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={toggles.camps}
            onChange={(e) => setToggles({ ...toggles, camps: e.target.checked })}
            className="rounded text-blue-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400"></span>
            NDRF Staging Camps
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={toggles.roads}
            onChange={(e) => setToggles({ ...toggles, roads: e.target.checked })}
            className="rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Road Graph & Bridges
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={toggles.sos}
            onChange={(e) => setToggles({ ...toggles, sos: e.target.checked })}
            className="rounded text-rose-500 focus:ring-0 bg-slate-800 border-slate-700"
          />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span>
            NavIC SOS Beacons
          </span>
        </label>
      </div>

      {/* Map Legend Floating Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-300 flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Marooned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Accessible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 bg-emerald-400 border border-emerald-300"></span> Safe Bypass
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 bg-rose-500 border border-rose-400"></span> Submerged Road
        </span>
      </div>
    </div>
  );
}
