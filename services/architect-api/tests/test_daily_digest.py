from fastapi.testclient import TestClient
from services.architect_api.main import app   # adjust if module path differs

client = TestClient(app)

def test_daily_digest_route():
    resp = client.post("/daily-digest", json={"thread_id":"x","messages":[]})
    assert resp.status_code == 200
    body = resp.json()
    assert set(body.keys()) == {"prd_summary","architect_reflection","next_prd"}
