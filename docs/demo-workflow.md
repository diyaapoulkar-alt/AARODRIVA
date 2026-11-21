# AARODRIVA AI — 3-Minute Hackathon Demo Script & Workflow

Use this exact chronological script during judging evaluation:

---

## ⏱️ Minute 0:00 – 0:45: The Problem & The ISRO Grounding
* **Speaker:** *"Respected judges, during annual monsoon floods like in Assam's Brahmaputra basin, satellite cameras capture the disaster from orbit, but NDRF rescue commanders on the ground face a critical blind spot: Which villages have been completely cut off? Which road bridges are under 1.5 meters of water? And how do we safely reach stranded citizens without getting trapped?*
* *Introducing **AARODRIVA AI** — an integrated Satellite-to-Rescue Intelligence platform that bridges ISRO space data with tactical ground-level disaster dispatch."*

---

## ⏱️ Minute 0:45 – 1:30: Detect & Locate (GIS + Marooned Villages)
* **Action:** Point to the Tactical GIS Command Center.
* **Speaker:** *"Here in our EOC Command Dashboard, we are ingesting Earth Observation data from **ISRO Bhoonidhi** and **Bhuvan**. This cyan polygon shows our 142.8 sq km radar flood mask derived from RISAT-1A SAR.*
* *Notice these two pulsing red village markers: our spatial engine has evaluated the road network and flagged **Dhansiri Riverbank** and **Kaziranga North Hamlet** as 'Marooned' — over 1,020 citizens whose direct access has been severed."*

---

## ⏱️ Minute 1:30 – 2:15: Citizen NavIC Beacon & Incident Queue
* **Action:** Click **"Citizen SOS (NavIC)"** to open the distress modal.
* **Speaker:** *"Now imagine a citizen stranded in Dhansiri. Using our offline-capable PWA, they transmit an emergency beacon. Notice the simulated NavIC indicator: 7 locked satellites over the Indian subcontinent providing high-accuracy L5/S-Band coordinates.*
* *We submit the beacon — watch the Incident Queue update in real-time. Our Priority Engine scores it at 95/100 due to an elderly patient needing urgent medical intervention."*

---

## ⏱️ Minute 2:15 – 2:45: RescueRoute AI (Dijkstra Flood-Bypass Pathfinding)
* **Action:** Click **"Route Rescue (AI)"** on SOS-101.
* **Speaker:** *"The commander clicks 'Route Rescue.' Watch the map: State Highway 4 is submerged under 1.4m of water (shown in red dashed line). Instead of leading rescue teams into a drowned causeway, **RescueRoute AI** runs Dijkstra's algorithm across our transport graph, discovering a 30.9 km safe bypass along the high-ground southern ridge.*
* *The green neon path highlights the exact, passable trajectory from NDRF Battalion 12 Base to the victims."*

---

## ⏱️ Minute 2:45 – 3:00: Executive SITREP & Closing
* **Action:** Click **"EOC SITREP"** and show the briefing summary.
* **Speaker:** *"Finally, with one click, our EOC generates the official Situation Briefing for the District Collector and NDRF commanders, ready to export as a formatted dispatch.*
* *AARODRIVA AI transforms Indian satellite observations into life-saving rescue logistics. Detect. Locate. Rescue. Protect. Thank you!"*
