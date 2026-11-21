import React from "react";
import { MapPin, Users, Clock, Send, CheckCircle2, Sparkles, Download } from "lucide-react";

export default function IncidentPanel({
  incidents,
  selectedIncident,
  onSelectIncident,
  onDispatch,
  onExportSitRep,
  isDark,
}) {
  const getScoreColor = (score) => {
    if (score >= 80) return "bg-red-500 text-white";
    if (score >= 55) return "bg-amber-500 text-slate-950";
    return "bg-cyan-500 text-slate-950";
  };

  return (
    <aside
      className={`w-80 border-l flex flex-col shrink-0 transition-colors ${
        isDark
          ? "bg-[#0a1428] border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="p-3.5 border-b border-slate-700/20 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>AI-Ranked SOS Queue</span>
        </h2>
        <span className="text-[11px] bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-bold">
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
                  ? isDark
                    ? "bg-slate-800/90 border-cyan-400 shadow-lg"
                    : "bg-sky-50 border-sky-500 shadow-md"
                  : isDark
                  ? "bg-[#0d1930] border-slate-800 hover:border-slate-600"
                  : "bg-slate-50 border-slate-200 hover:border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-cyan-500">{inc.id}</span>
                {/* Feature #3: AI Triage Priority Score Badge */}
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getScoreColor(
                    inc.triageScore
                  )}`}
                >
                  AI SCORE: {inc.triageScore}/100
                </span>
              </div>

              <h3 className="text-sm font-bold leading-snug">{inc.title}</h3>

              <div className="mt-2 space-y-1 text-xs opacity-75">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{inc.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {inc.peopleAffected} affected
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {inc.timestamp}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/20 flex justify-end">
                {isDispatched ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {inc.assignedUnit ? `${inc.assignedUnit} En Route` : "Dispatched"}
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

      {/* Feature #6: One-Click District SitRep Export */}
      <div className="p-3 border-t border-slate-700/20">
        <button
          onClick={onExportSitRep}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-400"
              : "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white"
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export District SitRep (.CSV)</span>
        </button>
      </div>
    </aside>
  );
}