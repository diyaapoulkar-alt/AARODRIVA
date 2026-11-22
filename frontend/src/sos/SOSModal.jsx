import React, { useState } from 'react';

export default function SOSModal({ isOpen, onClose, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    village_name: 'Dhansiri Riverbank',
    latitude: 26.6715,
    longitude: 93.1218,
    people_count: 4,
    urgency: 'critical',
    needs: ['medical', 'drinking_water'],
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [offlineQueued, setOfflineQueued] = useState(false);

  if (!isOpen) return null;

  const toggleNeed = (need) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter((n) => n !== need)
        : [...prev.needs, need]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      village_id: 'VIL_01',
      gnss_source: 'NavIC-compatible L5/S-Band (Simulated)',
      offline_queued: !navigator.onLine
    };

    if (!navigator.onLine) {
      // Offline queue simulation
      const queue = JSON.parse(localStorage.getItem('aarodriva_offline_sos') || '[]');
      queue.push(payload);
      localStorage.setItem('aarodriva_offline_sos', JSON.stringify(queue));
      setOfflineQueued(true);
      setTimeout(() => {
        setSubmitting(false);
        onSubmitSuccess({ ...payload, id: 'SOS-LOCAL-OFFLINE' });
        onClose();
      }, 1200);
      return;
    }

    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSubmitting(false);
      onSubmitSuccess({ ...payload, id: data.incident_id || 'SOS-NEW' });
      onClose();
    } catch {
      setSubmitting(false);
      onSubmitSuccess({ ...payload, id: 'SOS-FALLBACK-' + Date.now().toString().slice(-4) });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header: NavIC Simulation Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 p-4 border-b border-rose-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🛰️</span>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Citizen Distress Beacon</h3>
                <p className="text-[11px] font-mono text-rose-200">NavIC-Compatible Emergency PWA</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl leading-none px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* GNSS / NavIC lock indicator badge */}
          <div className="mt-3 bg-black/40 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              NavIC Lock: 7 Satellites
            </span>
            <span className="text-slate-300">Accuracy: ±1.8m</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Coordinates & Village */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Latitude (NavIC)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Longitude (NavIC)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Settlement Name */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Nearest Settlement</label>
            <select
              value={formData.village_name}
              onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Dhansiri Riverbank">Dhansiri Riverbank (Marooned Sector)</option>
              <option value="Kaziranga North Hamlet">Kaziranga North Hamlet (Cut Off)</option>
              <option value="Bokakhat East Village">Bokakhat East Village</option>
              <option value="Siljuri Ridge Settlement">Siljuri Ridge Settlement</option>
            </select>
          </div>

          {/* Stranded People Count & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">People Stranded</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.people_count}
                onChange={(e) => setFormData({ ...formData, people_count: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Urgency Level</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="critical">Critical (Water rising / Medical)</option>
                <option value="high">High (No drinking water)</option>
                <option value="moderate">Moderate (Sheltered but stranded)</option>
              </select>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-mono">Immediate Requirements</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'medical', label: '🩺 Medical Assistance' },
                { id: 'rescue_boat', label: '🚤 Rescue Boat / Raft' },
                { id: 'drinking_water', label: '💧 Drinking Water' },
                { id: 'infant_supplies', label: '🍼 Infant / Baby Food' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleNeed(item.id)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    formData.needs.includes(item.id)
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Ground Situation Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. 2 senior citizens, ground floor submerged, waiting on rooftop..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-500 focus:outline-none"
            ></textarea>
          </div>

          {offlineQueued && (
            <div className="bg-amber-950/80 border border-amber-700 text-amber-300 p-2.5 rounded-lg text-center font-mono">
              ⚡ Network unavailable: Beacon stored in offline queue. Auto-syncing when connected!
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📡</span>
              <span>{submitting ? 'Transmitting...' : 'Transmit SOS Beacon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
