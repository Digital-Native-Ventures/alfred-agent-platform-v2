import datetime
import os
from typing import Optional

from fastapi import FastAPI
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@app.get("/healthz")
def health():
    return {"status": "ok"}


class PRSummaryRequest(BaseModel):
    pr_title: str
    pr_description: Optional[str] = ""
    merged_at: Optional[str] = str(datetime.datetime.utcnow())


@app.post("/summarise")
def summarise(req: PRSummaryRequest):
    prompt = f"""
You are a summariser AI. Summarise the merged GitHub Pull Request titled:
"{req.pr_title}"

Description:
{req.pr_description}

It was merged at: {req.merged_at}

Return a one-line summary suitable for a project log.
"""

    result = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": prompt}],
        temperature=0.5,
        max_tokens=150,
    )

    return {"summary": result.choices[0].message.content.strip()}
