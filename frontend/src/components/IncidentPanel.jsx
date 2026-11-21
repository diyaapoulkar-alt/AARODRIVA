import React from 'react';

export default function IncidentPanel({ 
  sosList, 
  onSelectIncident, 
  selectedIncident, 
  onCalculateRoute, 
  onUpdateStatus,
  loadingRoute 
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Emergency Distress Queue
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
          {sosList.length} Incidents
        </span>
      </div>

      {/* Incident List */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[560px]">
        {sosList.map((sos) => {
          const isSelected = selectedIncident?.id === sos.id;
          const isCritical = sos.urgency?.toLowerCase() === 'critical';

          return (
            <div
              key={sos.id}
              onClick={() => onSelectIncident(sos)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-800/95 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: ID, village, status */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">{sos.id}</span>
                  <h4 className="text-sm font-semibold text-white leading-tight">{sos.village_name}</h4>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                    isCritical
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {sos.urgency}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-300 mb-2 line-clamp-2 italic">
                "{sos.message || 'Distress signal received from rooftop shelter.'}"
              </p>

              {/* Badges: People & Needs */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-3">
                <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono border border-slate-700">
                  👥 {sos.people_count} Stranded
                </span>
                {Array.isArray(sos.needs) && sos.needs.map((need, i) => (
                  <span key={i} className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded capitalize">
                    {need.replace('_', ' ')}
                  </span>
                ))}
                {sos.priority_score && (
                  <span className="bg-purple-950 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded font-mono ml-auto">
                    Score: {sos.priority_score}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCalculateRoute(sos);
                  }}
                  disabled={loadingRoute}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-xs py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
                >
                  <span>🛣️</span>
                  <span>{loadingRoute && isSelected ? 'Routing...' : 'Route Rescue (AI)'}</span>
                </button>

                {sos.status === 'pending' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(sos.id, 'dispatched');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 px-2.5 rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    Deploy
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-1 rounded">
                    ✓ En Route
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
