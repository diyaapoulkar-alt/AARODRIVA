import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Globe, AlertTriangle, Crosshair, ChevronRight } from "lucide-react";

// Instant Offline City & Disaster Hotspot Dictionary (Zero Network Latency)
const CURATED_LOCATIONS = [
  // Active Mission Theater
  {
    name: "Guwahati, Assam (Active Disaster Zone)",
    coords: [26.158, 91.738],
    zoom: 13,
    type: "active_disaster",
    desc: "Brahmaputra Flood Basin • Severe Inundation • Rescue Operations Active",
  },
  {
    name: "Kharghuli, Guwahati",
    coords: [26.182, 91.744],
    zoom: 15,
    type: "disaster_cluster",
    desc: "Brahmaputra River Bank • 12 Civilians Trapped on Rooftop",
  },
  {
    name: "Pandu Ghat, Guwahati",
    coords: [26.168, 91.725],
    zoom: 15,
    type: "disaster_cluster",
    desc: "School Shelter Water Rising • Evacuation in Progress",
  },
  {
    name: "Amingaon Lowlands, Assam",
    coords: [26.188, 91.718],
    zoom: 14,
    type: "disaster_cluster",
    desc: "Submerged Power Substation • Food Shortage",
  },
  {
    name: "Majuli Island, Assam",
    coords: [26.950, 94.200],
    zoom: 12,
    type: "disaster_cluster",
    desc: "Brahmaputra River Island • High Flood Risk Zone",
  },
  {
    name: "Dibrugarh, Assam",
    coords: [27.472, 94.912],
    zoom: 13,
    type: "city",
    desc: "Upper Assam Brahmaputra Flood Plain",
  },
  {
    name: "Silchar, Assam",
    coords: [24.833, 92.778],
    zoom: 13,
    type: "city",
    desc: "Barak Valley Flood Vulnerable Zone",
  },
  {
    name: "Kaziranga National Park, Assam",
    coords: [26.577, 93.171],
    zoom: 12,
    type: "city",
    desc: "Wildlife Corridor Flood Crossing",
  },

  // Major Indian Metros & Flood Zones
  { name: "Mumbai, Maharashtra", coords: [19.076, 72.877], zoom: 12, type: "city", desc: "Coastal Financial Capital" },
  { name: "Delhi, National Capital Region", coords: [28.613, 77.209], zoom: 12, type: "city", desc: "Yamuna Flood Basin & Capital" },
  { name: "Bengaluru, Karnataka", coords: [12.971, 77.594], zoom: 12, type: "city", desc: "Southern Tech Hub" },
  { name: "Kolkata, West Bengal", coords: [22.572, 88.363], zoom: 12, type: "city", desc: "Hooghly River & Delta Region" },
  { name: "Chennai, Tamil Nadu", coords: [13.082, 80.270], zoom: 12, type: "city", desc: "Bay of Bengal Coastal Belt" },
  { name: "Hyderabad, Telangana", coords: [17.385, 78.486], zoom: 12, type: "city", desc: "Musiriver Urban Center" },
  { name: "Patna, Bihar", coords: [25.594, 85.137], zoom: 12, type: "city", desc: "Ganga River Flood Inundation Zone" },
  { name: "Cuttack, Odisha", coords: [20.462, 85.882], zoom: 12, type: "city", desc: "Mahanadi River Delta" },
  { name: "Ahmedabad, Gujarat", coords: [23.022, 72.571], zoom: 12, type: "city", desc: "Sabarmati River Basin" },
  { name: "Pune, Maharashtra", coords: [18.520, 73.856], zoom: 12, type: "city", desc: "Mula-Mutha Basin" },
  { name: "Jaipur, Rajasthan", coords: [26.912, 75.787], zoom: 12, type: "city", desc: "Pink City, Rajasthan" },
  { name: "Kochi, Kerala", coords: [9.931, 76.267], zoom: 12, type: "city", desc: "Backwaters & Coastal Arabian Sea" },
  { name: "Srinagar, Jammu & Kashmir", coords: [34.083, 74.797], zoom: 12, type: "city", desc: "Jhelum River Valley" },
  { name: "Kedarnath, Uttarakhand", coords: [30.735, 79.067], zoom: 13, type: "city", desc: "Mandakini Valley Alpine Zone" },

  // Global Metros
  { name: "Tokyo, Japan", coords: [35.676, 139.650], zoom: 12, type: "global", desc: "Greater Tokyo Bay Area" },
  { name: "London, United Kingdom", coords: [51.507, -0.127], zoom: 12, type: "global", desc: "Thames River Basin" },
  { name: "New York, United States", coords: [40.712, -74.006], zoom: 12, type: "global", desc: "Hudson River Estuary" },
  { name: "Paris, France", coords: [48.856, 2.352], zoom: 12, type: "global", desc: "Seine River Basin" },
  { name: "Singapore", coords: [1.352, 103.819], zoom: 12, type: "global", desc: "Island City-State" },
  { name: "Dubai, United Arab Emirates", coords: [25.204, 55.270], zoom: 12, type: "global", desc: "Persian Gulf Metropolitan" },
  { name: "Sydney, Australia", coords: [-33.868, 151.209], zoom: 12, type: "global", desc: "Sydney Harbour Basin" },
];

export default function MapSearchBar({ onSelectLocation, currentFocusName }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter curated and fetch live Nominatim for arbitrary global locations
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const trimmed = query.trim().toLowerCase();
    
    // 1. Instant local filter
    const localMatches = CURATED_LOCATIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        (item.desc && item.desc.toLowerCase().includes(trimmed))
    ).slice(0, 6);

    setSuggestions(localMatches);
    setIsOpen(true);

    // 2. Debounced global Nominatim search if query >= 3 chars
    if (trimmed.length >= 3) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setIsLoading(true);

      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query.trim()
            )}&limit=5&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const formatted = data.map((item) => ({
              name: item.display_name.split(",").slice(0, 3).join(","),
              full_name: item.display_name,
              coords: [parseFloat(item.lat), parseFloat(item.lon)],
              zoom: item.type === "city" || item.type === "administrative" ? 12 : 14,
              type: "nominatim",
              desc: item.display_name,
            }));

            // Merge local and remote avoiding duplicate names
            setSuggestions((prev) => {
              const names = new Set(prev.map((p) => p.name.toLowerCase()));
              const filteredRemote = formatted.filter(
                (r) => !names.has(r.name.toLowerCase())
              );
              return [...prev, ...filteredRemote].slice(0, 8);
            });
          }
        } catch (err) {
          console.warn("[MapSearch] Nominatim lookup fallback:", err);
        } finally {
          setIsLoading(false);
        }
      }, 400);
    }
  }, [query]);

  const handleSelect = (item) => {
    onSelectLocation(item);
    setQuery(item.name);
    setIsOpen(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else if (query.trim()) {
      // Trigger instant Nominatim search on Enter
      setIsLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const item = {
              name: data[0].display_name.split(",")[0],
              full_name: data[0].display_name,
              coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
              zoom: 12,
              type: "nominatim",
            };
            handleSelect(item);
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md pointer-events-auto">
      {/* Search Bar Container */}
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center bg-[#081329]/95 backdrop-blur-md border border-cyan-500/50 rounded-xl px-3 py-2 shadow-2xl transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20"
      >
        <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-2.5" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() || suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search any city or country (e.g. Mumbai, Tokyo, Delhi)..."
          className="bg-transparent text-xs text-white placeholder-slate-400 w-full focus:outline-none font-medium"
        />

        {isLoading && (
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 ml-2" />
        )}

        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-white p-0.5 rounded ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className="ml-2 px-2.5 py-1 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shrink-0"
        >
          Go
        </button>
      </form>

      {/* Quick Navigation Chips */}
      <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[10px] pb-1 font-mono">
        <button
          onClick={() =>
            handleSelect({
              name: "Guwahati, Assam (Active Disaster Zone)",
              coords: [26.158, 91.738],
              zoom: 13,
              type: "active_disaster",
            })
          }
          className="px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/60 text-rose-300 font-bold hover:bg-rose-900 transition flex items-center gap-1 whitespace-nowrap shadow"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
          🚨 Assam Disaster
        </button>

        <button
          onClick={() =>
            handleSelect({
              name: "India (National View)",
              coords: [22.5937, 78.9629],
              zoom: 5,
              type: "country",
            })
          }
          className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition whitespace-nowrap"
        >
          🇮🇳 All India
        </button>

        <button
          onClick={() =>
            handleSelect({
              name: "World (Global View)",
              coords: [20.0, 0.0],
              zoom: 2,
              type: "world",
            })
          }
          className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition whitespace-nowrap flex items-center gap-1"
        >
          <Globe className="w-3 h-3 text-cyan-400" /> Whole World
        </button>

        {["Mumbai", "Delhi", "Bengaluru", "Tokyo"].map((city) => (
          <button
            key={city}
            onClick={() => {
              const found = CURATED_LOCATIONS.find((c) => c.name.startsWith(city));
              if (found) handleSelect(found);
            }}
            className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition whitespace-nowrap"
          >
            {city}
          </button>
        ))}
      </div>

      {/* Auto-suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#09152b]/98 backdrop-blur-lg border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl z-50 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <span>Locations & Cities</span>
            <span className="text-cyan-400 font-bold">{suggestions.length} Results</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {suggestions.map((item, idx) => {
              const isDisaster = item.type === "active_disaster" || item.type === "disaster_cluster";
              return (
                <div
                  key={`${item.name}-${idx}`}
                  onClick={() => handleSelect(item)}
                  className="px-3 py-2.5 hover:bg-cyan-950/50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    {isDisaster ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                    ) : item.type === "global" ? (
                      <Globe className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {item.name}
                        </span>
                        {isDisaster && (
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {item.desc || `Coords: ${item.coords[0].toFixed(3)}°N, ${item.coords[1].toFixed(3)}°E`}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
