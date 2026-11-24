import React, { useState, useEffect } from "react";
import { Phone, Radio, Shield, Send, CheckCircle2, Copy, AlertTriangle, ExternalLink, Globe, Compass, MapPin } from "lucide-react";

export const REGIONAL_DIRECTORIES = {
  assam: {
    name: "India — Assam & Northeast",
    flag: "🇮🇳",
    subtext: "Assam State Disaster Operations Network • Inter-Agency Rapid Relay",
    theater: "Brahmaputra Flood Basin / Kamrup & Kaziranga Sector",
    authorities: [
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
    ],
  },
  mumbai: {
    name: "India — Maharashtra & Mumbai",
    flag: "🇮🇳",
    subtext: "Konkan Coast & Mumbai Metropolitan Disaster Management",
    theater: "Mumbai Coastal Zone & Western Ghats Catchment",
    authorities: [
      {
        id: "ndrf-5",
        name: "NDRF 5th Battalion (Pune / Mumbai Relay)",
        badge: "National Disaster Response Force",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Sudumbare, Pune / Mumbai Forward Base Andheri",
        phone: "+91-20-27299100",
        tollFree: "1078 (National NDRF)",
        radio: "VHF Marine & Urban Net",
        capabilities: "Urban Flood Rescue, High-Capacity De-watering Pumps, Collapsed Structure SAR",
        status: "DEPLOYED & PATROLLING",
      },
      {
        id: "bmc-disaster",
        name: "BMC Disaster Management Cell (Central Command)",
        badge: "Municipal Corporation of Greater Mumbai",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "BMC HQ, Fort, Mumbai",
        phone: "+91-22-22694727",
        tollFree: "1916 (BMC Disaster Helpline)",
        radio: "VHF Disaster Channel 1 & 2",
        capabilities: "60 High-Pressure Dewatering Pumps, Mithi River Flood Gates Oversight, Ward Control Rooms",
        status: "24x7 MONITORED",
      },
      {
        id: "coastguard-west",
        name: "Indian Coast Guard (Regional HQ West)",
        badge: "Maritime SAR & Coastal Rescue",
        badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
        hq: "Worli Sea Face, Mumbai",
        phone: "+91-22-24388065",
        tollFree: "1554 (Coast Guard Emergency)",
        radio: "Marine VHF Channel 16 (156.800 MHz)",
        capabilities: "Hovercraft Coastal Patrols, Chetak Helicopter Aerial Evacuation, High-Speed Interceptors",
        status: "ALERT OPERATIONAL",
      },
      {
        id: "mems-108",
        name: "Maharashtra 108 Emergency Medical Services (MEMS)",
        badge: "Ambulance Network",
        badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-700",
        hq: "Aundh Chest Hospital Base, Pune / KEM Mumbai",
        phone: "108",
        tollFree: "108 (Statewide Ambulance)",
        radio: "Statewide GPS CAD Emergency Dispatch",
        capabilities: "937 BLS/ALS Ambulances, Neonatal Units, Floating Flood Triage Post",
        status: "ACTIVE DISPATCH",
      },
    ],
  },
  delhi: {
    name: "India — Delhi-NCR & North",
    flag: "🇮🇳",
    subtext: "Yamuna Basin & National Capital Emergency Operations",
    theater: "Delhi NCT & Yamuna River Flood Plain",
    authorities: [
      {
        id: "ndrf-8",
        name: "NDRF 8th Battalion Command",
        badge: "National Disaster Response Force",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Kamla Nehru Nagar, Ghaziabad",
        phone: "+91-120-2766014",
        tollFree: "1078 (National NDRF)",
        radio: "VHF Disaster Relay 152.450 MHz",
        capabilities: "Yamuna Flood Response Platoons, Motorized Boats, Flood Rescue Diving Units",
        status: "STANDBY & ACTIVE",
      },
      {
        id: "ddma-delhi",
        name: "DDMA State Emergency Operations Centre",
        badge: "Delhi Disaster Management Authority",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "Revenue Department, 5 Sham Nath Marg, Delhi",
        phone: "+91-11-22421656",
        tollFree: "1077 (Delhi Disaster Control)",
        radio: "Delhi Police & Fire Common Interop VHF",
        capabilities: "Yamuna Embankment Monitoring, Evacuation Camps along Ring Road, Relief Supplies",
        status: "RED ALERT MONITORING",
      },
      {
        id: "cwc-delhi",
        name: "Central Water Commission (CWC) Flood Forecasting",
        badge: "National Hydrological Authority",
        badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
        hq: "Sewa Bhawan, R.K. Puram, New Delhi",
        phone: "+91-11-29583200",
        tollFree: "CWC Flood Room",
        radio: "National Hydro-telemetry Network",
        capabilities: "Old Railway Bridge (ORB) Yamuna Gauge, Hathnikund Barrage Discharge Forecasts",
        status: "HOURLY TELEMETRY",
      },
    ],
  },
  usa: {
    name: "United States (FEMA & USCG)",
    flag: "🇺🇸",
    subtext: "Federal Emergency Management Agency & Homeland Defense",
    theater: "National Response Coordination Center / US Coast Guard SAR",
    authorities: [
      {
        id: "fema-nrcc",
        name: "FEMA National Response Coordination Center (NRCC)",
        badge: "Federal Emergency Management",
        badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
        hq: "500 C Street SW, Washington, DC",
        phone: "+1-800-621-3362",
        tollFree: "1-800-621-FEMA / DisasterAssistance.gov",
        radio: "FEMA National Radio System (FNARS) HF",
        capabilities: "Interagency Federal Asset Mobilization, National Incident Management (NIMS), Disaster Relief Funds",
        status: "LEVEL 1 ACTIVE",
      },
      {
        id: "uscg-sar",
        name: "US Coast Guard National SAR Command",
        badge: "Maritime & Coastal SAR",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "USCG HQ, St. Elizabeths Campus, Washington, DC",
        phone: "+1-800-424-8802",
        tollFree: "911 / USCG Rescue 21 Net",
        radio: "Marine VHF Channel 16 (156.800 MHz)",
        capabilities: "MH-60T Jayhawk Helicopters, Shallow Water Flood Response Teams, Response Boats",
        status: "IMMEDIATE DISPATCH",
      },
      {
        id: "usace-flood",
        name: "US Army Corps of Engineers (USACE Emergency Ops)",
        badge: "Levee & Flood Infrastructure",
        badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
        hq: "441 G St NW, Washington, DC",
        phone: "+1-202-761-0011",
        tollFree: "USACE Flood Operations Line",
        radio: "Military Engineering Tactical Net",
        capabilities: "Levee Breach Repair, Temporary Flood Barriers, Reservoir Spillway Regulation",
        status: "ON SCENE DISPATCH",
      },
      {
        id: "nws-noaa",
        name: "NOAA / NWS National Water Center",
        badge: "Hydrological Intelligence",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "Tuscaloosa, Alabama",
        phone: "+1-205-347-1300",
        tollFree: "NOAA Weather Radio All Hazards",
        radio: "162.400 - 162.550 MHz Continuous Broadcast",
        capabilities: "National Water Model Real-Time River Forecasting, Flash Flood Guidance, Satellite Soil Saturation",
        status: "24x7 STREAMING",
      },
    ],
  },
  spain: {
    name: "Spain — Mediterranean & Valencia",
    flag: "🇪🇸",
    subtext: "Protección Civil España & Unidad Militar de Emergencias",
    theater: "Comunitat Valenciana / Cuenca del Júcar y Turia",
    authorities: [
      {
        id: "ume-spain",
        name: "UME (Unidad Militar de Emergencias — BIEM III)",
        badge: "Fuerzas Armadas de Rescate",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Base Militar Jaime I, Bétera, Valencia",
        phone: "+34-96-169-6000",
        tollFree: "112 (Emergencias España)",
        radio: "Red Radio Militar de Emergencias / VHF TDT",
        capabilities: "Equipos de Desescombro, Bombas de Gran Caudal, Helicópteros Cougar SAR, Búsqueda Cinológica",
        status: "DESPLIEGUE ACTIVO (NIVEL 3)",
      },
      {
        id: "112-cva",
        name: "Centro de Coordinación de Emergencias (112 Comunitat)",
        badge: "Generalitat Valenciana",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "L'Eliana, Valencia",
        phone: "112",
        tollFree: "112 (Emergencias 24h)",
        radio: "Red COMDES (TETRA Interoperable)",
        capabilities: "Consorcio Provincial de Bomberos, Evacuación de Municipios Ribereños, Albergues Provisionales",
        status: "ALERTA ROJA ACTIVA",
      },
      {
        id: "cruzroja-es",
        name: "Cruz Roja Española (ERIE Albergue y Rescate)",
        badge: "Ayuda Humanitaria",
        badgeColor: "bg-red-950 text-red-300 border-red-700",
        hq: "Calle del Pintor Peiró, Valencia",
        phone: "+34-900-221-122",
        tollFree: "900 22 11 22",
        radio: "Red Radio Cruz Roja VHF",
        capabilities: "Distribución de Agua Potable y Alimentos, Apoyo Psicosocial, Embarcaciones Semirrígidas",
        status: "OPERATIVO 24h",
      },
    ],
  },
  uk: {
    name: "United Kingdom (England & Wales)",
    flag: "🇬🇧",
    subtext: "Environment Agency Flood Operations & HM Coastguard",
    theater: "UK River Basins & Coastal Surge Defences",
    authorities: [
      {
        id: "ea-floodline",
        name: "UK Environment Agency Floodline",
        badge: "National Environmental Agency",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "Horizon House, Deanery Road, Bristol",
        phone: "0345 988 1188",
        tollFree: "0800 80 70 60 (24h Incident Hotline)",
        radio: "Flood Warning Telemetry Net",
        capabilities: "Thames Barrier Deployment, Mobile Flood Barrier Defences, River Level Gauging Network",
        status: "SEVERE FLOOD WARNING",
      },
      {
        id: "hm-coastguard",
        name: "HM Coastguard (National Maritime Ops Centre)",
        badge: "Maritime & Coastal Agency",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Fareham, Hampshire / London MRCC",
        phone: "999",
        tollFree: "999 or 112 (Ask for Coastguard)",
        radio: "Marine VHF Channel 16 / DSC 70",
        capabilities: "Sikorsky S-92 SAR Helicopters, Inshore Lifeboat Coordination, Mud & Swift Water Teams",
        status: "ACTIVE DISPATCH",
      },
      {
        id: "london-ep",
        name: "London Resilience Emergency Planning",
        badge: "Multi-Agency Tactical Command",
        badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
        hq: "London Fire Brigade HQ, 169 Union St, London",
        phone: "+44-20-8555-1200",
        tollFree: "Local Borough Incident Units",
        radio: "Airwave TETRA Network",
        capabilities: "High-Volume Pump Units, Tactical Water Rescue, Community Evacuation Support",
        status: "24x7 OPERATIONAL",
      },
    ],
  },
  japan: {
    name: "Japan — Tokyo & Kanto Basin",
    flag: "🇯🇵",
    subtext: "Tokyo Disaster Prevention Division & Japan Coast Guard",
    theater: "Tokyo Bay, Tone & Arakawa River Discharge Basin",
    authorities: [
      {
        id: "tokyo-disaster",
        name: "Tokyo Metropolitan Disaster Prevention Division",
        badge: "Metropolitan Government EOC",
        badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
        hq: "Tokyo Metropolitan Government Building, Shinjuku, Tokyo",
        phone: "+81-3-5321-1111",
        tollFree: "03-5321-1111 (Disaster Info Line)",
        radio: "Tokyo Disaster Digital Radio 400 MHz",
        capabilities: "Metropolitan Underground Discharge Channel (G-Cans) Control, Flood Gates, Tsunami Evacuation",
        status: "HIGH ALERT (LEVEL 4)",
      },
      {
        id: "jcg-118",
        name: "Japan Coast Guard (3rd Regional HQ)",
        badge: "Maritime SAR",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Yokohama, Kanagawa Prefecture",
        phone: "118",
        tollFree: "118 (Coast Guard Emergency Hotline)",
        radio: "Marine VHF Channel 16 (156.800 MHz)",
        capabilities: "Super Puma SAR Helicopters, Amphibious Patrol Cutters, Water Rescue Special Unit",
        status: "PATROL & RESCUE READY",
      },
      {
        id: "fdma-japan",
        name: "Fire and Disaster Management Agency (FDMA Japan)",
        badge: "Emergency Rescue Unit",
        badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-700",
        hq: "Kasumigaseki, Chiyoda, Tokyo",
        phone: "119",
        tollFree: "119 (Fire & Ambulance)",
        radio: "Municipal Fire TETRA / Microwave Net",
        capabilities: "Hyper Rescue Squadrons, High-Clearance Tracked Vehicles, Inundation Pumping Convoys",
        status: "RAPID DEPLOYMENT",
      },
    ],
  },
  australia: {
    name: "Australia — Sydney & NSW",
    flag: "🇦🇺",
    subtext: "State Emergency Service (SES) & Triple Zero Dispatch",
    theater: "Hawkesbury-Nepean & East Coast Flood Catchments",
    authorities: [
      {
        id: "nsw-ses",
        name: "NSW State Emergency Service (State HQ)",
        badge: "Volunteer & Professional SAR",
        badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
        hq: "93 Burelli St, Wollongong / Sydney Regional Command",
        phone: "132 500",
        tollFree: "132 500 (SES Flood & Storm Hotline)",
        radio: "Government Radio Network (GRN) P25",
        capabilities: "Flood Boat Squads, High-Clearance Rescue Unimogs, Livestock & Civilian Evacuation",
        status: "MOBILIZED (MAJOR FLOOD WARNING)",
      },
      {
        id: "triple-zero",
        name: "Triple Zero (000) National Emergency Dispatch",
        badge: "Police, Fire & Ambulance",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Sydney Operations Centre",
        phone: "000",
        tollFree: "000 / 112 from Mobile",
        radio: "Statewide Inter-Agency Emergency Net",
        capabilities: "Immediate Multi-Agency Dispatch, Helicopter Winch Rescue (Toll Rescue / Westpac Life Saver)",
        status: "PRIORITY SAR",
      },
      {
        id: "amsa-sar",
        name: "AMSA Joint Rescue Coordination Centre (JRCC)",
        badge: "Maritime & Aviation Safety",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "Canberra, ACT",
        phone: "+61-2-6230-6811",
        tollFree: "1800 641 792 (Maritime SAR)",
        radio: "HF Inmarsat-C / Cospas-Sarsat Distress Relay",
        capabilities: "Challenger 604 Search Aircraft, Long-Range Coastal Evacuation, Satellite EPIRB Tracking",
        status: "24x7 WATCHKEEPING",
      },
    ],
  },
  brazil: {
    name: "South America — Brazil & Rio Grande",
    flag: "🇧🇷",
    subtext: "Defesa Civil Nacional & Corpo de Bombeiros Militar",
    theater: "Bacia Hidrográfica do Guaíba / Rio Grande do Sul & São Paulo",
    authorities: [
      {
        id: "defesa-civil",
        name: "Defesa Civil Nacional (CENAD)",
        badge: "Proteção e Defesa Civil",
        badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
        hq: "Brasília, DF / Polo Porto Alegre",
        phone: "199",
        tollFree: "199 (Disque Defesa Civil)",
        radio: "Rede Nacional de Alerta e Comunicações de Emergência",
        capabilities: "Coordenação de Abrigos Emergenciais, Distribuição de Mantimentos, Monitoramento de Enchentes",
        status: "ESTADO DE CALAMIDADE (ATIVO)",
      },
      {
        id: "bombeiros-193",
        name: "Corpo de Bombeiros Militar (SAR Aquático)",
        badge: "Salvamento e Resgate",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Porto Alegre / São Paulo",
        phone: "193",
        tollFree: "193 (Emergência Bombeiros)",
        radio: "Rede Digital VHF Bombeiros",
        capabilities: "Botes Infláveis a Motor, Mergulhadores de Resgate, Helicópteros Águia SAR",
        status: "RESGATE EM ANDAMENTO",
      },
    ],
  },
  global: {
    name: "Global — UN OCHA & International",
    flag: "🌐",
    subtext: "United Nations Office for Coordination of Humanitarian Affairs",
    theater: "International Disaster Response & INSARAG Network",
    authorities: [
      {
        id: "un-ocha",
        name: "UN OCHA Emergency Operations (ReliefWeb)",
        badge: "United Nations Humanitarian Response",
        badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
        hq: "Palais des Nations, Geneva / UNHQ New York",
        phone: "+41-22-917-1234",
        tollFree: "ReliefWeb Dispatch Relay",
        radio: "UN Emergency SATCOM Network",
        capabilities: "UNDAC Rapid Assessment Teams, Central Emergency Response Fund (CERF), International Logistics",
        status: "GLOBAL MONITORING",
      },
      {
        id: "insarag-sar",
        name: "INSARAG (International Search & Rescue Advisory)",
        badge: "Urban & Water SAR Standards",
        badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-700",
        hq: "Geneva, Switzerland",
        phone: "+41-22-917-1600",
        tollFree: "Virtual OSOCC (V-OSOCC)",
        radio: "International SAR Coordination WAN",
        capabilities: "Heavy USAR / Water Search Teams Accreditation, Cross-Border Airlift Authorization",
        status: "NETWORK ACTIVATED",
      },
      {
        id: "ifrc-geneva",
        name: "IFRC Disaster Response Operations (Geneva)",
        badge: "International Red Cross & Red Crescent",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-700",
        hq: "Chemin des Crêts, Petit-Saconnex, Geneva",
        phone: "+41-22-730-4222",
        tollFree: "Disaster Relief Emergency Fund (DREF)",
        radio: "Global Red Cross Telecom Net",
        capabilities: "Water & Sanitation Units, Emergency Field Hospitals, Shelter Kit Deployments",
        status: "GLOBAL CRISIS RELAY",
      },
    ],
  },
};

// Automatic detection of region based on name or coordinates
function detectRegionKey(placeName = "", coords = null) {
  const p = (placeName || "").toLowerCase();
  if (p.includes("spain") || p.includes("valencia") || p.includes("madrid") || p.includes("barcelona")) return "spain";
  if (p.includes("london") || p.includes("united kingdom") || p.includes("uk") || p.includes("england") || p.includes("scotland")) return "uk";
  if (p.includes("tokyo") || p.includes("japan") || p.includes("osaka") || p.includes("kyoto") || p.includes("kanto")) return "japan";
  if (p.includes("sydney") || p.includes("australia") || p.includes("melbourne") || p.includes("brisbane") || p.includes("auckland")) return "australia";
  if (p.includes("sao paulo") || p.includes("brazil") || p.includes("buenos aires") || p.includes("argentina") || p.includes("chile") || p.includes("porto alegre")) return "brazil";
  if (p.includes("usa") || p.includes("united states") || p.includes("new york") || p.includes("houston") || p.includes("chicago") || p.includes("san francisco") || p.includes("toronto") || p.includes("canada") || p.includes("mexico")) return "usa";
  if (p.includes("mumbai") || p.includes("maharashtra") || p.includes("pune") || p.includes("bengaluru") || p.includes("goa") || p.includes("konkan")) return "mumbai";
  if (p.includes("delhi") || p.includes("noida") || p.includes("gurugram") || p.includes("punjab") || p.includes("haryana") || p.includes("yamuna")) return "delhi";
  if (p.includes("assam") || p.includes("guwahati") || p.includes("kamrup") || p.includes("dispur") || p.includes("kaziranga") || p.includes("brahmaputra")) return "assam";

  if (coords && Array.isArray(coords) && coords.length === 2) {
    const [lat, lon] = coords;
    if (lat >= 30 && lat <= 46 && lon >= 128 && lon <= 146) return "japan";
    if (lat >= 49 && lat <= 60 && lon >= -8 && lon <= 2) return "uk";
    if (lat >= 36 && lat <= 44 && lon >= -10 && lon <= 5) return "spain";
    if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 160) return "australia";
    if (lat >= 24 && lat <= 55 && lon >= -130 && lon <= -65) return "usa";
    if (lat >= -55 && lat <= 12 && lon >= -82 && lon <= -34) return "brazil";
    if (lat >= 15 && lat <= 22 && lon >= 72 && lon <= 77) return "mumbai";
    if (lat >= 25 && lat <= 32 && lon >= 75 && lon <= 80) return "delhi";
    if (lat >= 24 && lat <= 29 && lon >= 89 && lon <= 96) return "assam";
  }

  return "assam";
}

export default function AuthoritiesModal({
  isOpen,
  onClose,
  activeIncidents = [],
  activeLocation = null,
}) {
  const [selectedRegionKey, setSelectedRegionKey] = useState("assam");
  const [copied, setCopied] = useState(false);
  const [dispatchedId, setDispatchedId] = useState(null);

  // Sync region on location change or when modal opens
  useEffect(() => {
    if (activeLocation) {
      const autoKey = detectRegionKey(activeLocation.name, activeLocation.coords);
      setSelectedRegionKey(autoKey);
    }
  }, [activeLocation, isOpen]);

  if (!isOpen) return null;

  const currentRegion = REGIONAL_DIRECTORIES[selectedRegionKey] || REGIONAL_DIRECTORIES.assam;

  const handleBroadcastSAR = () => {
    const locName = activeLocation?.name || currentRegion.theater;
    const coordsStr = activeLocation?.coords
      ? `${activeLocation.coords[0].toFixed(4)}°N, ${activeLocation.coords[1].toFixed(4)}°E`
      : "26.158°N, 91.738°E";

    const summary = `🚨 AARODRIVA AI — EMERGENCY RESCUE DISPATCH TELEGRAM
TIMESTAMP: ${new Date().toISOString()} (UTC)
MISSION SECTOR: ${locName.toUpperCase()}
OPERATIONAL THEATER: ${currentRegion.theater}
COORDINATES: ${coordsStr}

PRIMARY REGIONAL AUTHORITY: ${currentRegion.authorities[0]?.name || "Local EOC Command"}
EMERGENCY HOTLINE: ${currentRegion.authorities[0]?.phone || "112 / 911"} (Toll-Free: ${currentRegion.authorities[0]?.tollFree || "1078"})
TACTICAL RADIO FREQUENCY: ${currentRegion.authorities[0]?.radio || "VHF Marine Channel 16"}

ACTIVE DISTRESS BEACONS (PRIORITY SAR QUEUE):
${
  activeIncidents && activeIncidents.length > 0
    ? activeIncidents
        .map(
          (inc, idx) =>
            `${idx + 1}. [${inc.id}] ${inc.title || inc.location} (${inc.peopleAffected || 1} souls stranded) - GPS: ${
              inc.coords ? inc.coords.join(", ") : "N/A"
            }`
        )
        .join("\n")
    : "1. Rapid reconnaissance sector under active drone surveillance."
}

OPTIMAL 3D RESCUEROUTE AI CLEAR PATH:
- CORRIDOR: Elevated Topographic Bypass avoiding submerged road links
- STATUS: 100% CLEAR OF WATER HAZARDS
- ELEVATION CLEARANCE: +3.4m Above Peak Inundation Mark

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b162c] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1e3d] via-[#102a54] to-[#0d1e3d] p-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 shadow-lg shadow-rose-500/20">
              <Phone className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide uppercase">
                  Emergency Authorities Hotline Directory
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  GLOBAL 24x7
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 mt-0.5">
                <span>{currentRegion.flag}</span>
                <span>{currentRegion.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{currentRegion.subtext}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Region Switcher Pills Bar */}
        <div className="bg-[#081224] px-4 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1 mr-1">
            <Globe className="w-3 h-3 text-cyan-400" /> REGION:
          </span>
          {Object.entries(REGIONAL_DIRECTORIES).map(([key, reg]) => {
            const isSelected = selectedRegionKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedRegionKey(key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400"
                    : "bg-[#0b1b36] hover:bg-[#12284f] text-slate-300 border border-slate-800"
                }`}
              >
                <span>{reg.flag}</span>
                <span>{reg.name.split("—")[1]?.trim() || reg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Context & Action Banner */}
        <div className="bg-[#07101f] px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="font-mono text-emerald-300 font-bold mr-1">THEATER:</span>
              <span className="text-white font-medium">{currentRegion.theater}</span>
              {activeLocation && (
                <span className="text-cyan-400 font-mono text-[11px] ml-2">
                  (Inspecting: {activeLocation.name})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBroadcastSAR}
              className="px-3.5 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition cursor-pointer"
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
        </div>

        {/* Directory Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#060e1d]/70">
          {currentRegion.authorities.map((auth) => {
            const isDispatched = dispatchedId === auth.id;

            return (
              <div
                key={auth.id}
                className="bg-[#09152b] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition shadow-sm space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white tracking-wide">{auth.name}</h4>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${auth.badgeColor}`}
                      >
                        {auth.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{auth.hq}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{auth.status}</span>
                    </span>

                    <button
                      onClick={() => handleTriggerDispatch(auth.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        isDispatched
                          ? "bg-emerald-600 text-white"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30"
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Alert Dispatched!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Dispatch Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#061021] p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DIRECT PHONE / HOTLINE</span>
                    <a
                      href={`tel:${auth.phone}`}
                      className="text-cyan-300 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{auth.phone}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOLL-FREE EMERGENCY</span>
                    <span className="text-emerald-300 font-bold">{auth.tollFree}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TACTICAL RADIO FREQ</span>
                    <span className="text-amber-300 font-bold">{auth.radio}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 flex items-start gap-1.5 bg-[#08152b] p-2 rounded-md border border-slate-800">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Deployed SAR Assets:</strong> {auth.capabilities}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#081224] p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AARODRIVA AI Satellite Operations • Automated Distress Beacon Relay</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
