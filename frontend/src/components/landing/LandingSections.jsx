import React, { useState } from "react";
import {
  ShieldAlert, Satellite, Sparkles, Radio, Route, FileText,
  Waves, Mountain, Activity, Flame, Wind, Sun, LifeBuoy, Thermometer, Factory,
  ArrowRight, Layers, MapPin, CheckCircle2
} from "lucide-react";

const CAPABILITIES = [
  { icon: ShieldAlert, title: "Emergency Command Center", desc: "Unified dark/daylight operational view for NDRF & SDMA dispatchers.", tag: "CORE" },
  { icon: Satellite, title: "Satellite & GIS Intelligence", desc: "GeoPandas & Shapely inundation polygons layered over live road networks.", tag: "GIS" },
  { icon: Sparkles, title: "AI Risk Triage (0–100)", desc: "Auto-ranks stranded SOS calls by water depth, headcount, and medical flags.", tag: "AI" },
  { icon: Radio, title: "Citizen SOS Beacon", desc: "Offline-capable PWA distress reporting with instant GPS coordinate lock.", tag: "SOS" },
  { icon: Route, title: "Dijkstra / A* Rescue Router", desc: "Calculates safe green boat & road corridors while bypassing submerged NH segments.", tag: "ROUTING" },
  { icon: FileText, title: "One-Click PDF SITREP", desc: "ReportLab-powered district emergency briefings ready for command handoff.", tag: "REPORT" },
];

const HAZARDS = [
  { name: "Floods", level: "DEEP MODULE", risk: 94, color: "text-cyan-400", icon: Waves },
  { name: "Landslides", level: "ACTIVE", risk: 72, color: "text-amber-400", icon: Mountain },
  { name: "Earthquakes", level: "MONITOR", risk: 41, color: "text-slate-300", icon: Activity },
  { name: "Forest Fires", level: "MONITOR", risk: 58, color: "text-red-400", icon: Flame },
  { name: "Cyclones", level: "ACTIVE", risk: 81, color: "text-cyan-300", icon: Wind },
  { name: "Droughts", level: "MONITOR", risk: 34, color: "text-amber-300", icon: Sun },
  { name: "Tsunamis & Avalanches", level: "MONITOR", risk: 29, color: "text-sky-400", icon: LifeBuoy },
  { name: "Heatwaves", level: "ACTIVE", risk: 67, color: "text-amber-400", icon: Thermometer },
  { name: "Industrial Accidents", level: "MONITOR", risk: 45, color: "text-red-400", icon: Factory },
];

const PIPELINE = [
  { step: "01", title: "DETECT", desc: "Satellite imagery, river gauges & citizen SOS beacons stream in." },
  { step: "02", title: "ANALYSE", desc: "AI triage engine scores urgency (0–100) and predicts +6h/+12h flood spread." },
  { step: "03", title: "LOCATE", desc: "Pinpoints marooned clusters, submerged bridges, and free relief camp beds." },
  { step: "04", title: "PLAN", desc: "NetworkX Dijkstra/A* computes fastest safe corridors bypassing blocked roads." },
  { step: "05", title: "RESPOND", desc: "One-click NDRF boat dispatch, bilingual SMS alerts & PDF SITREP export." },
];

function TiltCard({ item }) {
  const [style, setStyle] = useState({});
  const Icon = item.icon;

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({ transform: `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.02)` });
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => setStyle({ transform: "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)" })}
      style={style}
      className="rounded-2xl bg-[#0a1428]/90 border border-slate-800 hover:border-cyan-500/50 p-5 transition-transform duration-150 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
          {item.tag}
        </span>
      </div>
      <h3 className="text-base font-bold text-white">{item.title}</h3>
      <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
    </div>
  );
}

export default function LandingSections({ scrollProgress, onEnterDashboard }) {
  const [selectedHazard, setSelectedHazard] = useState(HAZARDS[0]);
  const [previewLayers, setPreviewLayers] = useState({ flood: true, route: true, blocked: true, camp: true });

  const activeStage = Math.min(4, Math.floor(Math.max(0, scrollProgress - 0.42) * 14));

  return (
    <div className="relative z-10 bg-[#060d1f] text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-28">
        {/* SECTION 2: Core Capabilities (3D Tilt Cards) */}
        <section id="capabilities" className="space-y-6">
          <div>
            <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-400">
              Core Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Built for high-stress rescue decisions.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap) => (
              <TiltCard key={cap.title} item={cap} />
            ))}
          </div>
        </section>

        {/* SECTION 3: Multi-Hazard Intelligence & Telemetry */}
        <section id="hazards" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-400">
              Multi-Hazard Intelligence
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              One platform. 9 monitored hazards.
            </h2>
            <div className="flex flex-wrap gap-2">
              {HAZARDS.map((h) => {
                const Icon = h.icon;
                const active = selectedHazard.name === h.name;
                return (
                  <button
                    key={h.name}
                    onClick={() => setSelectedHazard(h)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      active
                        ? "bg-sky-500/20 border-sky-400 text-white"
                        : "bg-[#0a1428] border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${h.color}`} />
                    {h.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-[#0a1428] border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">{selectedHazard.name.toUpperCase()}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                {selectedHazard.level}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Basin Threat Index</span>
                <span className="font-mono font-bold text-white">{selectedHazard.risk} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-red-500 transition-all duration-300"
                  style={{ width: `${selectedHazard.risk}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Real-time satellite ingestion paired with automated GeoPandas risk polygons and instant NDRF alerting.
            </p>
          </div>
        </section>

        {/* SECTION 4: Scroll-Driven 5-Stage Pipeline */}
        <section id="pipeline" className="space-y-6">
          <div>
            <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-400">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              From satellite signal to boots on the ground.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PIPELINE.map((p, idx) => {
              const lit = idx <= activeStage;
              return (
                <div
                  key={p.step}
                  className={`rounded-2xl p-5 border transition-all duration-300 ${
                    lit
                      ? "bg-[#0d1930] border-cyan-400/60 shadow-lg shadow-cyan-500/10"
                      : "bg-[#0a1428]/70 border-slate-800 opacity-70"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-cyan-400">{p.step}</span>
                  <h3 className="text-sm font-extrabold text-white tracking-wider mt-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: Live Command Center Preview */}
        <section id="preview" className="rounded-3xl bg-[#0a1428] border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                Interactive Command Preview
              </p>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Guwahati Flood Basin — Live Triage & Boat Routing
              </h2>
            </div>
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-2 bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition"
            >
              <span>Open Live Leaflet Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            <div className="lg:col-span-4 space-y-2.5">
              <p className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Toggle Simulated Layers
              </p>
              {[
                { k: "flood", label: "Flood Inundation Zones", color: "bg-sky-400" },
                { k: "route", label: "Safe Rescue Corridors", color: "bg-emerald-400" },
                { k: "blocked", label: "Blocked Highways (NH-27)", color: "bg-red-500" },
                { k: "camp", label: "Relief Camps (42 Free Beds)", color: "bg-amber-400" },
              ].map(({ k, label, color }) => (
                <button
                  key={k}
                  onClick={() => setPreviewLayers((p) => ({ ...p, [k]: !p[k] }))}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                    previewLayers[k] ? "bg-slate-800/90 border-slate-600 text-white" : "bg-slate-900/50 border-slate-800 text-slate-500"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${previewLayers[k] ? color : "bg-slate-700"}`} />
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 rounded-2xl bg-[#060d1f] border border-slate-800 p-5 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> SOS-104 • Priority 94/100
                </span>
                <span className="text-emerald-400 font-bold">Nearest Camp: 2.4 km • ~8 min Boat ETA</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0a1428] border border-slate-800">
                  <p className="text-slate-400">Active SOS</p>
                  <p className="text-xl font-mono font-bold text-red-400 mt-1">14</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a1428] border border-slate-800">
                  <p className="text-slate-400">Evacuated</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">1,420</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a1428] border border-slate-800">
                  <p className="text-slate-400">River Level</p>
                  <p className="text-xl font-mono font-bold text-sky-400 mt-1">50.8m</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready for live dispatch, citizen SOS intake, and downloadable SITREP export.</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Final Mission CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-[#0a1428] via-[#0d1d38] to-[#060d1f] border border-cyan-500/30 p-10 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            One platform. Every disaster.{" "}
            <span className="text-cyan-400">Every life matters.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-2 text-[11px] font-mono text-slate-300">
            {["React + Vite", "Leaflet GIS", "Three.js R3F", "FastAPI", "GeoPandas", "NetworkX", "PWA Offline"].map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
          <div className="pt-2">
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-2.5 bg-[#ef4444] hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-red-600/25 transition"
            >
              <span>Launch Live Command Center</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}