import React from "react";
import { MapPin, Users, Clock, Send, CheckCircle2 } from "lucide-react";

const SEVERITY_BADGE = {
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/40",
  HIGH: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  WARNING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
};

export default function IncidentPanel({
  incidents,
  selectedIncident,
  onSelectIncident,
  onDispatch,
}) {
  return (
    <aside className="w-80 bg-[#0a1428] border-l border-slate-800 flex flex-col shrink-0">
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Live Incident Queue
        </h2>
        <span className="text-[11px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
          {incidents.filter((i) => i.status !== "DISPATCHED").length} Pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {incidents.map((inc) => {
          const isSelected = selectedIncident?.id === inc.id;
          const isDispatched = inc.status === "DISPATCHED";

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/50"
                  : "bg-[#0d1930] border-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-cyan-400">{inc.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    SEVERITY_BADGE[inc.severity] || SEVERITY_BADGE.WARNING
                  }`}
                >
                  {inc.severity}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white leading-snug">{inc.title}</h3>

              <div className="mt-2 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{inc.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {inc.peopleAffected} affected
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {inc.timestamp}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-end">
                {isDispatched ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Rescue Dispatched
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatch(inc.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    <Send className="w-3 h-3" />
                    Dispatch Unit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}