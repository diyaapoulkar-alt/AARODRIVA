import React, { useRef, useEffect, useState, useCallback } from "react";
import { Globe, Satellite, AlertTriangle, ShieldCheck } from "lucide-react";

// Global flood hotspots to project in 3D
const HOTSPOTS = [
  { name: "Guwahati (Assam, IN)", lat: 26.18, lon: 91.74, threat: "CRITICAL", color: "#f43f5e", victims: "1,020 stranded", basin: "Brahmaputra" },
  { name: "Sylhet Basin (BD)", lat: 24.89, lon: 91.86, threat: "HIGH", color: "#fb923c", victims: "Surma Overflow", basin: "Meghna" },
  { name: "Valencia (Spain)", lat: 39.46, lon: -0.37, threat: "HIGH", color: "#fb923c", victims: "DANA Flash Flooding", basin: "Turia" },
  { name: "Houston (USA)", lat: 29.76, lon: -95.36, threat: "MODERATE", color: "#38bdf8", victims: "Bayou Overflow", basin: "San Jacinto" },
  { name: "Rio Grande do Sul (BR)", lat: -30.03, lon: -51.23, threat: "HIGH", color: "#f43f5e", victims: "Lagoon Rising", basin: "Guaíba" },
  { name: "Yangtze River (CN)", lat: 30.59, lon: 114.3, threat: "HIGH", color: "#fb923c", victims: "Monsoon Surge", basin: "Yangtze" },
  { name: "Brisbane / East Coast (AU)", lat: -27.47, lon: 153.02, threat: "MODERATE", color: "#38bdf8", victims: "Riverine Alert", basin: "Brisbane" },
  { name: "Kinshasa / Congo (CD)", lat: -4.44, lon: 15.26, threat: "MODERATE", color: "#38bdf8", victims: "Congo Basin Rise", basin: "Congo" },
];

// Simplified outline polygons for key world continents (lat, lon pairs)
const CONTINENT_OUTLINES = [
  // India & South Asia
  [[35, 74], [31, 78], [28, 88], [27, 95], [24, 93], [22, 89], [19, 85], [16, 82], [10, 79], [8, 77], [12, 75], [16, 73], [21, 69], [24, 67], [28, 70], [35, 74]],
  // East Asia & Siberia
  [[35, 74], [45, 80], [55, 90], [60, 110], [55, 130], [40, 125], [30, 122], [22, 114], [20, 105], [24, 93], [28, 88], [31, 78], [35, 74]],
  // Europe
  [[36, -6], [43, -9], [48, -5], [54, 8], [58, 12], [65, 20], [70, 28], [60, 40], [50, 40], [45, 30], [40, 26], [38, 22], [37, 15], [36, -6]],
  // Africa
  [[37, 10], [32, 32], [22, 37], [12, 44], [0, 42], [-10, 40], [-25, 33], [-34, 26], [-34, 18], [-20, 12], [-5, 12], [5, 2], [5, -4], [15, -17], [28, -13], [35, -5], [37, 10]],
  // North America
  [[15, -92], [25, -97], [30, -85], [25, -80], [35, -75], [45, -65], [55, -60], [60, -65], [70, -75], [70, -120], [60, -140], [55, -130], [40, -124], [30, -115], [20, -105], [15, -92]],
  // South America
  [[12, -72], [10, -62], [0, -50], [-10, -36], [-23, -42], [-35, -53], [-50, -68], [-55, -70], [-45, -75], [-30, -71], [-18, -70], [-5, -80], [5, -77], [12, -72]],
  // Australia
  [[-12, 131], [-15, 136], [-12, 142], [-22, 150], [-30, 153], [-38, 147], [-38, 140], [-35, 135], [-35, 115], [-22, 114], [-15, 124], [-12, 131]],
];

export default function Earth3D({ onSelectHotspot }) {
  const canvasRef = useRef(null);
  const [activeHotspot, setActiveHotspot] = useState(HOTSPOTS[0]);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  // Rotation angles in radians
  const rotRef = useRef({
    x: 0.35, // slight tilt showing Northern hemisphere (Assam/India)
    y: -1.6, // center over South Asia by default
  });

  const satAngleRef = useRef(0);

  // Convert (lat, lon) to 3D Cartesian coordinates on unit sphere
  const latLonToVector = (lat, lon) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return {
      x: -(Math.sin(phi) * Math.cos(theta)),
      z: Math.sin(phi) * Math.sin(theta),
      y: Math.cos(phi),
    };
  };

  // Rotate a 3D vector by current camera angles rotX and rotY
  const rotateVector = (v, rotX, rotY) => {
    // Rotate around Y axis (longitude orbit)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = v.x * cosY + v.z * sinY;
    const z1 = -v.x * sinY + v.z * cosY;
    const y1 = v.y;

    // Rotate around X axis (latitude tilt)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    return { x: x1, y: y2, z: z2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, width, height);

      // Auto rotate when not actively dragging
      if (!isDraggingRef.current) {
        rotRef.current.y += 0.003;
      }
      satAngleRef.current += 0.02;

      // Position sphere so that it is positioned on the right side diving in
      // Center of globe is shifted to the right: ~70-75% of container width
      const radius = Math.min(width, height) * 0.44;
      const centerX = width * 0.65;
      const centerY = height * 0.52;

      // 1. Draw Starfield background
      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      const starSeed = [
        [0.1, 0.15, 1.5], [0.25, 0.8, 1], [0.4, 0.2, 2], [0.85, 0.12, 1.2],
        [0.9, 0.85, 1.8], [0.15, 0.6, 1], [0.35, 0.75, 1.4], [0.75, 0.9, 1.1]
      ];
      starSeed.forEach(([rx, ry, s]) => {
        ctx.beginPath();
        ctx.arc(rx * width, ry * height, s * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Atmospheric Outer Glow (Fresnel Limb Glow)
      const atmosGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.85,
        centerX, centerY, radius * 1.25
      );
      atmosGradient.addColorStop(0, "rgba(6, 182, 212, 0.35)");
      atmosGradient.addColorStop(0.5, "rgba(14, 165, 233, 0.18)");
      atmosGradient.addColorStop(0.85, "rgba(56, 189, 248, 0.06)");
      atmosGradient.addColorStop(1, "rgba(2, 6, 23, 0)");

      ctx.fillStyle = atmosGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 3. Deep Ocean Sphere (Globe base)
      const oceanGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius
      );
      oceanGradient.addColorStop(0, "#0e2a4a");
      oceanGradient.addColorStop(0.5, "#081d38");
      oceanGradient.addColorStop(0.85, "#051329");
      oceanGradient.addColorStop(1, "#020713");

      ctx.fillStyle = oceanGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Lat/Lon Graticule lines (Wireframe latitude rings)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1 * dpr;

      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 8) {
          const v = latLonToVector(lat, lon);
          const rv = rotateVector(v, rotRef.current.x, rotRef.current.y);
          if (rv.z > 0) { // Visible on front hemisphere
            const sx = centerX + rv.x * radius;
            const sy = centerY - rv.y * radius;
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      });

      // 5. Draw Continents & Landmasses
      CONTINENT_OUTLINES.forEach((polygon) => {
        ctx.beginPath();
        let started = false;
        const visiblePoints = [];

        polygon.forEach(([lat, lon]) => {
          const v = latLonToVector(lat, lon);
          const rv = rotateVector(v, rotRef.current.x, rotRef.current.y);
          if (rv.z > 0) {
            visiblePoints.push({
              x: centerX + rv.x * radius,
              y: centerY - rv.y * radius,
              z: rv.z,
            });
          }
        });

        if (visiblePoints.length > 2) {
          ctx.beginPath();
          ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
          for (let i = 1; i < visiblePoints.length; i++) {
            ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
          ctx.fill();
          ctx.strokeStyle = "rgba(52, 211, 153, 0.45)";
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();
        }
      });

      // 6. Draw Global Disaster Flood Hotspots
      HOTSPOTS.forEach((spot) => {
        const v = latLonToVector(spot.lat, spot.lon);
        const rv = rotateVector(v, rotRef.current.x, rotRef.current.y);

        // Only draw if front-facing (z > 0.05)
        if (rv.z > 0.05) {
          const sx = centerX + rv.x * radius;
          const sy = centerY - rv.y * radius;
          const scale = 0.5 + rv.z * 0.5;

          // Animated pulse ring around hotspot
          const pulsePhase = (Date.now() / 600) % 1;
          const pulseR = (6 + pulsePhase * 16) * scale * dpr;
          ctx.beginPath();
          ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.8 - pulsePhase * 0.7})`;
          ctx.lineWidth = 1.5 * dpr;
          ctx.stroke();

          // Core Hotspot Marker
          ctx.beginPath();
          ctx.arc(sx, sy, 4.5 * scale * dpr, 0, Math.PI * 2);
          ctx.fillStyle = spot.color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          // Hotspot Label Tag
          if (rv.z > 0.3) {
            ctx.font = `bold ${Math.floor(10 * dpr)}px 'Inter', sans-serif`;
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 4;
            ctx.fillText(spot.name, sx + 8 * dpr, sy - 4 * dpr);
            ctx.shadowBlur = 0;
          }
        }
      });

      // 7. Render ISRO RISAT-1A / EOS-04 Satellite Orbit
      const orbitRadius = radius * 1.35;
      const satAngle = satAngleRef.current;
      const satVec = {
        x: Math.cos(satAngle),
        y: Math.sin(satAngle) * 0.7, // tilted orbital inclination
        z: Math.sin(satAngle) * 0.71,
      };
      const rSat = rotateVector(satVec, rotRef.current.x, rotRef.current.y);
      const satX = centerX + rSat.x * orbitRadius;
      const satY = centerY - rSat.y * orbitRadius;

      // Draw Satellite Orbit Track
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const tv = { x: Math.cos(a), y: Math.sin(a) * 0.7, z: Math.sin(a) * 0.71 };
        const rtv = rotateVector(tv, rotRef.current.x, rotRef.current.y);
        const px = centerX + rtv.x * orbitRadius;
        const py = centerY - rtv.y * orbitRadius;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      // Draw Satellite Scanner Beam onto Earth surface
      if (rSat.z > 0) {
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(centerX + rSat.x * radius * 0.8, centerY - rSat.y * radius * 0.8);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.setLineDash([4 * dpr, 4 * dpr]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Satellite Body
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(satX, satY, 4 * dpr, 0, Math.PI * 2);
        ctx.fill();

        // Solar Panels
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(satX - 8 * dpr, satY - 1.5 * dpr, 5 * dpr, 3 * dpr);
        ctx.fillRect(satX + 3 * dpr, satY - 1.5 * dpr, 5 * dpr, 3 * dpr);

        // Satellite Name Pill
        ctx.font = `600 ${Math.floor(9 * dpr)}px monospace`;
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("ISRO RISAT-1A [SAR]", satX + 10 * dpr, satY + 3 * dpr);
      }

      // 8. Globe Edge Shading / Rim Highlight
      const rimGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.92,
        centerX, centerY, radius
      );
      rimGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      rimGradient.addColorStop(0.8, "rgba(6, 182, 212, 0.2)");
      rimGradient.addColorStop(1, "rgba(56, 189, 248, 0.6)");
      ctx.fillStyle = rimGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Mouse & Touch 360-degree rotation handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0].clientY) || 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;

    rotRef.current.y += dx * 0.006;
    rotRef.current.x = Math.max(-1.1, Math.min(1.1, rotRef.current.x + dy * 0.006));

    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[620px] select-none overflow-visible flex items-center justify-end">
      {/* Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 360 Drag Badge */}
      <div className="absolute bottom-6 right-8 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg text-[11px] font-mono text-cyan-300 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>360° Interactive Orbit (Drag to rotate)</span>
      </div>

      {/* Active Disaster Monitoring Badge */}
      <div className="absolute top-8 right-8 bg-slate-900/90 backdrop-blur-md border border-rose-500/40 p-3 rounded-xl shadow-xl max-w-xs hidden sm:block pointer-events-auto">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          <span>Active Inundation Locus</span>
        </div>
        <p className="text-white text-sm font-black">{activeHotspot.name}</p>
        <p className="text-slate-400 text-[11px] font-mono">{activeHotspot.victims} • {activeHotspot.basin} Basin</p>
      </div>
    </div>
  );
}
