import React, { useState } from "react";
import { Megaphone, X, CheckCircle2 } from "lucide-react";

export default function BroadcastModal({ isOpen, onClose, floodZones = [] }) {
  const [zone, setZone] = useState(floodZones[0]?.name || "North Bank Inundation Zone A");
  const [lang, setLang] = useState("BOTH");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a1428] border border-slate-700 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Megaphone className="w-4 h-4" />
            <span>Mass Evacuation Broadcast</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Alert Dispatched via SMS & IVR</p>
            <p className="text-xs text-slate-400">Target: {zone}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Flood Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-[#060d1f] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {floodZones.map((fz) => (
                  <option key={fz.id} value={fz.name}>
                    {fz.name} ({fz.severity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Broadcast Language</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {["EN", "HI", "BOTH"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setLang(opt)}
                    className={`py-2 rounded-lg border font-semibold transition ${
                      lang === opt
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {opt === "BOTH" ? "EN + हिन्दी" : opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              {(lang === "EN" || lang === "BOTH") && (
                <p>
                  <strong className="text-amber-400">EN:</strong> URGENT: Water levels rising in {zone}. Move to District Stadium Shelter immediately.
                </p>
              )}
              {(lang === "HI" || lang === "BOTH") && (
                <p>
                  <strong className="text-amber-400">हिन्दी:</strong> चेतावनी: {zone} में जलस्तर बढ़ रहा है। कृपया तुरंत नज़दीकी राहत शिविर में पहुँचें।
                </p>
              )}
            </div>

            <button
              onClick={handleSend}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition"
            >
              Broadcast Emergency Alert Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}