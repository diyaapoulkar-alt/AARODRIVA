import React, { useState } from "react";
import { X, AlertTriangle, Send, Waves, HeartPulse } from "lucide-react";

export default function CitizenSOSDrawer({ isOpen, onClose, onSubmitSOS, isDark }) {
  const [location, setLocation] = useState("");
  const [waterDepth, setWaterDepth] = useState("Waist");
  const [peopleAffected, setPeopleAffected] = useState(5);
  const [medicalEmergency, setMedicalEmergency] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitSOS({
      location: location.trim() || "Riverbank Sector 7",
      waterDepth,
      peopleAffected: Number(peopleAffected) || 1,
      medicalEmergency,
    });
    setLocation("");
    setPeopleAffected(5);
    setMedicalEmergency(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex justify-end">
      <div
        className={`w-full max-w-sm h-full p-5 flex flex-col justify-between shadow-2xl border-l ${
          isDark
            ? "bg-[#0a1428] border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Citizen Flood & SOS Report</span>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-slate-500/20">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form id="citizen-sos-form" onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1 opacity-80">
                Locality / Landmark
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Fancy Bazar Ward 9"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-cyan-500 ${
                  isDark
                    ? "bg-[#060d1f] border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold flex items-center gap-1.5 mb-1.5 opacity-80">
                <Waves className="w-3.5 h-3.5 text-cyan-500" />
                Current Water Depth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Knee", "Waist", "Roof"].map((depth) => (
                  <button
                    type="button"
                    key={depth}
                    onClick={() => setWaterDepth(depth)}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      waterDepth === depth
                        ? "bg-cyan-500 text-slate-950 border-cyan-500"
                        : isDark
                        ? "bg-slate-900 border-slate-700 text-slate-300"
                        : "bg-slate-100 border-slate-300 text-slate-700"
                    }`}
                  >
                    {depth} Level
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 opacity-80">
                People Stranded
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-cyan-500 ${
                  isDark
                    ? "bg-[#060d1f] border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                medicalEmergency
                  ? "bg-red-500/15 border-red-500/50"
                  : isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                checked={medicalEmergency}
                onChange={(e) => setMedicalEmergency(e.target.checked)}
                className="accent-red-500 w-4 h-4"
              />
              <div className="text-xs">
                <p className="font-bold flex items-center gap-1 text-red-500">
                  <HeartPulse className="w-3.5 h-3.5" /> Medical Emergency Present
                </p>
                <p className="opacity-70">Boosts AI Triage Score by +25 points</p>
              </div>
            </label>
          </form>
        </div>

        <button
          type="submit"
          form="citizen-sos-form"
          className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-red-600/25 transition"
        >
          <Send className="w-4 h-4" />
          <span>Submit Live SOS to Command</span>
        </button>
      </div>
    </div>
  );
}