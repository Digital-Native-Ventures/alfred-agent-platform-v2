from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
# Note: This import may need adjustment based on how the module is structured
# For now, we'll use a relative import approach
import importlib.util
spec = importlib.util.spec_from_file_location("planner_app", "/app/services/planner-api/planner_app.py")
planner_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(planner_module)
app = planner_module.app

client = TestClient(app)

def test_plan_endpoint_happy_path():
    r = client.post("/plan", json={"issue": 123})
    assert r.status_code == 201
    assert r.json()["ok"] is True

def test_plan_endpoint_validation():
    r = client.post("/plan", json={"issue": 0})
    assert r.status_code == 422
