import sys
import unittest
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.services.priority import calculate_incident_priority


class TestSOSPriority(unittest.TestCase):

    def test_critical_sos_priority(self):
        """Verify priority scoring for critical medical and stranded emergency."""
        incident = {
            "urgency": "critical",
            "people_count": 8,
            "needs": ["medical", "drinking_water", "rescue_boat"]
        }
        res = calculate_incident_priority(incident)
        self.assertGreaterEqual(res["priority_score"], 80)
        self.assertIn("PRIORITY 1", res["triage_tier"])


if __name__ == "__main__":
    unittest.main()
