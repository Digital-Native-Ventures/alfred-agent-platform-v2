"""CRM sync service for syncing contacts to HubSpot."""

import osLFfrom datetime import datetime, timezoneLFLFfrom clients.hubspot_mock_client import Client, modelsLFfrom fastapi import FastAPI, HTTPExceptionLFfrom pydantic import BaseModel, EmailStrLFLFapp = FastAPI()LFhubspot = Client(base_url=os.getenv("HUBSPOT_URL", "http://hubspot-mock:8000"))


class ContactSyncEvent(BaseModel):
    """Contact synchronization event model."""

    email: EmailStr
    source: str
    timestamp: datetime
    payload: dict = {}


@app.get("/healthz")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "ts": datetime.now(tz=timezone.utc).isoformat()}


@app.get("/health")
async def health_standard():
    """Return health status for GA-Hardening standardization."""
    return {"status": "ok"}


@app.post("/sync", status_code=200)
async def sync(event: ContactSyncEvent):
    """Sync contact to HubSpot."""
    contact = models.Contact(
        email=event.email,
        first_name=event.payload.get("firstName"),
        last_name=event.payload.get("lastName"),
    )
    resp = await hubspot.contacts.create_contact_async(contact)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Upstream HubSpot-mock error")
    return resp.parsed
