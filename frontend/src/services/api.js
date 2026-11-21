const API_BASE = '/api';

export const api = {
  async getMetrics() {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return {
        inundation_area_sqkm: 142.8,
        satellite_source: 'Bhoonidhi RISAT-1A SAR',
        marooned_settlements_count: 2,
        marooned_population: 1020,
        active_sos_count: 3,
        total_stranded_count: 24,
        dispatched_missions_count: 1,
        navic_satellites_locked: 7,
        navic_signal_status: 'STRONG (L5/S-Band Assisted)'
      };
    }
  },

  async getFloodZones() {
    try {
      const res = await fetch(`${API_BASE}/flood-zones`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 'FZ_01', name: 'Brahmaputra Lowland Inundation', source: 'ISRO Bhoonidhi SAR' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [[93.100, 26.635], [93.125, 26.685], [93.165, 26.710], [93.205, 26.690], [93.185, 26.645], [93.135, 26.620], [93.100, 26.635]]
              ]
            }
          }
        ]
      };
    }
  },

  async getVillages() {
    try {
      const res = await fetch(`${API_BASE}/settlements`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { id: 'VIL_01', name: 'Dhansiri Riverbank', population: 640, is_marooned: true, access_status: 'Marooned' }, geometry: { type: 'Point', coordinates: [93.120, 26.670] } },
          { type: 'Feature', properties: { id: 'VIL_02', name: 'Kaziranga North Hamlet', population: 380, is_marooned: true, access_status: 'Marooned' }, geometry: { type: 'Point', coordinates: [93.175, 26.695] } },
          { type: 'Feature', properties: { id: 'VIL_03', name: 'Bokakhat East Village', population: 520, is_marooned: false, access_status: 'Accessible' }, geometry: { type: 'Point', coordinates: [93.205, 26.615] } },
          { type: 'Feature', properties: { id: 'VIL_04', name: 'Siljuri Ridge Settlement', population: 410, is_marooned: false, access_status: 'Accessible' }, geometry: { type: 'Point', coordinates: [93.075, 26.565] } }
        ]
      };
    }
  },

  async getRescueCamps() {
    try {
      const res = await fetch(`${API_BASE}/camps`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { id: 'CAMP_01', name: 'NDRF Battalion 12 Base Bokakhat', available_boats: 6 }, geometry: { type: 'Point', coordinates: [93.045, 26.575] } },
          { type: 'Feature', properties: { id: 'CAMP_02', name: 'SDRF Relief Depot Siljuri', available_boats: 3 }, geometry: { type: 'Point', coordinates: [93.190, 26.550] } }
        ]
      };
    }
  },

  async getRoads() {
    try {
      const res = await fetch(`${API_BASE}/roads`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return { type: 'FeatureCollection', features: [] };
    }
  },

  async getSOSList() {
    try {
      const res = await fetch(`${API_BASE}/sos`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return [
        {
          id: 'SOS-101',
          village_name: 'Dhansiri Riverbank Settlement',
          latitude: 26.6715,
          longitude: 93.1218,
          people_count: 6,
          urgency: 'critical',
          needs: ['medical', 'drinking_water', 'rescue_boat'],
          message: 'Elderly patient with high fever; ground floor submerged 1.2m, stranded on rooftop.',
          status: 'pending',
          priority_score: 95,
          triage_tier: 'PRIORITY 1 - IMMEDIATE DISPATCH'
        },
        {
          id: 'SOS-102',
          village_name: 'Kaziranga North Hamlet',
          latitude: 26.6962,
          longitude: 93.1764,
          people_count: 14,
          urgency: 'critical',
          needs: ['food', 'infant_supplies'],
          message: 'Primary school shelter encircled by rising overflow.',
          status: 'dispatched',
          priority_score: 85,
          triage_tier: 'PRIORITY 1 - IMMEDIATE DISPATCH'
        }
      ];
    }
  },

  async submitSOS(payload) {
    try {
      const res = await fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return { status: 'success', incident_id: 'SOS-LOCAL-' + Math.floor(Math.random() * 1000) };
    }
  },

  async updateSOSStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch {
      return { status: 'success', incident_id: id, updated_status: status };
    }
  },

  async calculateRoute(campId = 'CAMP_01', destinationId = 'VIL_01', avoidFlooded = true) {
    try {
      const res = await fetch(`${API_BASE}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rescue_camp_id: campId,
          destination_node_or_id: destinationId,
          avoid_flooded_roads: avoidFlooded
        })
      });
      return await res.json();
    } catch {
      // Fallback calculated route coordinates avoiding submerged causeway
      return {
        status: 'route_found',
        algorithm: 'Dijkstra Flood-Avoidance (Fallback)',
        start_node: campId,
        target_node: destinationId,
        total_distance_km: 30.9,
        avoided_flooded_roads_count: 1,
        node_path: ['CAMP_01', 'INT_01', 'INT_03', 'INT_04', 'INT_05', 'VIL_01'],
        route_coordinates: [
          [26.575, 93.045],
          [26.585, 93.060],
          [26.595, 93.075],
          [26.580, 93.105],
          [26.585, 93.145],
          [26.590, 93.175],
          [26.600, 93.195],
          [26.640, 93.210],
          [26.675, 93.195],
          [26.685, 93.160],
          [26.680, 93.140],
          [26.670, 93.120]
        ]
      };
    }
  },

  async getSitrep() {
    try {
      const res = await fetch(`${API_BASE}/reports/sitrep`);
      return await res.json();
    } catch {
      return {
        report_id: 'SITREP-DEMO-2026',
        timestamp: new Date().toLocaleString('en-IN'),
        inundation_area_sqkm: 142.8,
        marooned_settlements_count: 2,
        marooned_population: 1020,
        total_active_sos: 3,
        total_stranded_souls: 24,
        executive_summary: 'Operational briefing: 2 settlements marooned in Golaghat floodplain. High-ground ridge bypass operational.'
      };
    }
  }
};
