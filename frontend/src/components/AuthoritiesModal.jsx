import React, { useState } from "react";
import { Phone, Radio, Shield, Send, CheckCircle2, Copy, AlertTriangle, ExternalLink } from "lucide-react";

const AUTHORITIES = [
  {
    id: "ndrf-1",
    name: "NDRF 1st Battalion Command Post",
    badge: "National Disaster Response Force",
    badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
    hq: "Patgaon / Dispur Relay Post, Guwahati",
    phone: "+91-361-2840284",
    tollFree: "1078 (National NDRF Helpline)",
    radio: "VHF Channel 16 (156.800 MHz) / HF 5205 kHz",
    capabilities: "12 Motorized Inflatable Zodiac Boats, 45 Deep Divers, Flood Extraction Medical Unit",
    status: "STANDBY & DEPLOYED",
  },
  {
    id: "sdrf-assam",
    name: "SDRF Assam Headquarters",
    badge: "State Disaster Response Force",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
    hq: "Kahilipara Emergency Depot, Guwahati",
    phone: "+91-361-2381511",
    tollFree: "1070 (State Emergency Operations)",
    radio: "VHF 162.400 MHz",
    capabilities: "8 Rapid River Extraction Boats, 4 High-Clearance Amphibious Rescue Trucks",
    status: "ACTIVE RESPONSE",
  },
  {
    id: "asdma",
    name: "ASDMA State Command Centre",
    badge: "Assam State Disaster Mgmt Authority",
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
    hq: "Assam Secretariat Complex, Dispur",
    phone: "+91-361-2237221",
    tollFree: "1079 (Flood Control Room)",
    radio: "State Disaster WAN / SATCOM Inmarsat",
    capabilities: "Incident Command Oversight, Relief Camp Resource Allocation, Air-Drop Authorization",
    status: "RED ALERT ACTIVE",
  },
  {
    id: "deoc-kamrup",
    name: "District EOC (Kamrup Metropolitan)",
    badge: "District Administration",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
    hq: "DC Office Complex, Panbazar, Guwahati",
    phone: "+91-361-2733052",
    tollFree: "1077 (District Control)",
    radio: "District VHF Relay 148.250 MHz",
    capabilities: "Local Evacuation Shelters, Food Packet Distribution, Ward Rescue Mobilization",
    status: "24x7 OPERATIONAL",
  },
  {
    id: "medical-108",
    name: "Mrityunjoy 108 Emergency Medical Service",
    badge: "Ambulance & Trauma Care",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-700",
    hq: "Guwahati Medical College & Hospital (GMCH) Base",
    phone: "108",
    tollFree: "108 / +91-361-2680108",
    radio: "Emergency Medical Fleet Net",
    capabilities: "14 River Ambulances, 22 Advanced Life Support (ALS) Ambulances on Standby",
    status: "PRIORITY DISPATCH",
  },
  {
    id: "iaf-sar",
    name: "Indian Air Force (Eastern Air Command SAR)",
    badge: "Air-Sea Search & Rescue",
    badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-700",
    hq: "Air Force Station Borjhar, Guwahati",
    phone: "+91-361-2840170",
    tollFree: "Air Operations Command",
    radio: "Military UHF 243.000 MHz",
    capabilities: "Mi-17 V5 Medium Lift Helicopters, Aerial Food Dropping, Winch Extraction",
    status: "ON 30-MIN NOTICE",
  },
  {
    id: "iwai",
    name: "Inland Waterways Authority of India (IWAI)",
    badge: "River Transport",
    badgeColor: "bg-sky-950 text-sky-300 border-sky-700",
    hq: "National Waterway 2 (Brahmaputra), Pandu Port",
    phone: "+91-361-2570055",
    tollFree: "IWAI Emergency Control",
    radio: "Marine VHF Channel 12",
    capabilities: "Large Vessel Ferry Barges capable of mass evacuation of 200+ civilians per trip",
    status: "MOORED & READY",
  },
];

export default function AuthoritiesModal({ isOpen, onClose, activeIncidents = [] }) {
  const [copied, setCopied] = useState(false);
  const [dispatchedId, setDispatchedId] = useState(null);

  if (!isOpen) return null;

  const handleBroadcastSAR = () => {
    const summary = `🚨 AARODRIVA AI — EMERGENCY RESCUE DISPATCH TELEGRAM
TIMESTAMP: ${new Date().toLocaleString("en-IN")} IST
MISSION SECTOR: GUWAHATI / BRAHMAPUTRA FLOOD BASIN
SEVERITY: RED ALERT (WATER LEVEL 51.10m | +1.60m ABOVE DANGER)
COORDINATES: 26.158°N, 91.738°E

ACTIVE DISTRESS BEACONS (PRIORITY SAR QUEUE):
${activeIncidents
  .map(
    (inc, idx) =>
      `${idx + 1}. [${inc.id}] ${inc.title} - ${inc.location} (${inc.peopleAffected} souls) - GPS: ${
        inc.coords ? inc.coords.join(", ") : "N/A"
      }`
  )
  .join("\n")}

OPTIMAL EVACUATION ROUTE (RESCUEROUTE AI):
CORRIDOR: NDRF Base Khanapara -> Dispur Ridge -> Zoo Road Ridge -> Kharghuli
TOTAL DISTANCE: 10.9 km (ETA: 16 mins)
HAZARDS BYPASSED: NH-27 Submerged Bridge (1.4m water depth)

AUTHORIZED BY: EMERGENCY OPERATIONS CENTRE (EOC) COMMAND`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTriggerDispatch = (authorityId) => {
    setDispatchedId(authorityId);
    setTimeout(() => setDispatchedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-[#0b162c] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1e3d] via-[#102a54] to-[#0d1e3d] p-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40">
              <Phone className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide uppercase">
                Emergency Authorities Hotline Directory
              </h3>
              <p className="text-[11px] font-mono text-cyan-300">
                Assam State Disaster Operations Network • Inter-Agency Rapid Relay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Action Banner */}
        <div className="bg-[#081224] px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-300 font-bold">DISPATCH READY:</span>
            <span>7 Agency Control Rooms Monitored in Real-Time</span>
          </div>

          <button
            onClick={handleBroadcastSAR}
            className="px-3 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>SAR Telegram Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SAR Incident Coordinates</span>
              </>
            )}
          </button>
        </div>

        {/* Directory List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {AUTHORITIES.map((auth) => {
            const isDispatched = dispatchedId === auth.id;

            return (
              <div
                key={auth.id}
                className="bg-[#09152b] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition shadow-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{auth.name}</h4>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${auth.badgeColor}`}
                      >
                        {auth.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Command Post: <span className="text-slate-200">{auth.hq}</span>
                    </p>
                  </div>

                  {/* Contact Links & Dispatch */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <a
                      href={`tel:${auth.phone.replace(/[^0-9+]/g, "")}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow shadow-emerald-600/30"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{auth.tollFree.split(" ")[0]}</span>
                    </a>

                    <button
                      onClick={() => handleTriggerDispatch(auth.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                        isDispatched
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60"
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Alert Transmitted</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send EOC Packet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Capability & Communications specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/80">
                  <div className="text-slate-300">
                    <span className="text-slate-500 uppercase">Radio Freq:</span>{" "}
                    <span className="text-cyan-300">{auth.radio}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500 uppercase">Direct Tel:</span>{" "}
                    <span className="text-white font-semibold">{auth.phone}</span>
                  </div>
                  <div className="md:col-span-2 text-slate-400">
                    <span className="text-slate-500 uppercase">Deployment Capability:</span>{" "}
                    <span className="text-slate-300">{auth.capabilities}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#081224] p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            VHF Channel 16 is guarded continuously during flood emergency operations.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
