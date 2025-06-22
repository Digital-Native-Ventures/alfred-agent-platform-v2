import logging
import os
from datetime import datetime

import aiocron
from fastapi import FastAPI

app = FastAPI(title="Summariser-API")

@app.get("/healthz")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

@aiocron.crontab('*/60 * * * *')   # hourly
async def hourly_summary():
    now = datetime.utcnow().isoformat()
    logging.info("Hourly summary stub @ %s", now)