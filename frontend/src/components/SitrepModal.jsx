import React from 'react';

export default function SitrepModal({ isOpen, onClose, sitrepData }) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const text = sitrepData?.executive_summary || 'No summary available.';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SITREP_${sitrepData?.report_id || 'EOC'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Emergency Operations Situation Briefing</h3>
              <p className="text-[11px] font-mono text-cyan-400">Report ID: {sitrepData?.report_id || 'SITREP-LIVE'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl px-2 py-1 cursor-pointer">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">INUNDATION</span>
              <span className="text-base font-bold text-cyan-400">{sitrepData?.inundation_area_sqkm || 142.8} km²</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">MAROONED</span>
              <span className="text-base font-bold text-rose-400">{sitrepData?.marooned_settlements_count || 2} Villages</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">AT RISK</span>
              <span className="text-base font-bold text-amber-400">{sitrepData?.marooned_population || 1020} Souls</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">ACTIVE SOS</span>
              <span className="text-base font-bold text-emerald-400">{sitrepData?.total_active_sos || 3} Beacons</span>
            </div>
          </div>

          {/* Full Briefing Text Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line">
            {sitrepData?.executive_summary || 'Generating operational situation briefing...'}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span>
              <span>Download SITREP (.TXT)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
