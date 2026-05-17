"""Elite Concierge — FastAPI backend.

Endpoints:
  GET  /api/health           → service + Retell config status
  POST /api/contact          → store contact form submission
  GET  /api/contacts         → list submissions (admin)
  POST /api/create-web-call  → create a Retell web call, return access_token
"""
from __future__ import annotations

import logging
import os
import time
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Deque, Dict, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
RETELL_API_KEY = os.environ.get("RETELL_API_KEY", "").strip()
RETELL_AGENT_ID = os.environ.get("RETELL_AGENT_ID", "").strip()

logger = logging.getLogger("elite-concierge")
logging.basicConfig(level=logging.INFO)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Elite Concierge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

VALID_INTENTS = {"demo", "sales", "quote", "strategy", "message"}


class ContactIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default="", max_length=160)
    phone: Optional[str] = Field(default="", max_length=40)
    message: Optional[str] = Field(default="", max_length=4000)
    intent: str = Field(default="message")
    # Honeypot — real users never see/fill this. Bots fill all fields.
    website: Optional[str] = Field(default="", max_length=200)


class ContactOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    company: str = ""
    phone: str = ""
    message: str = ""
    intent: str
    created_at: str


class CreateCallOut(BaseModel):
    access_token: str
    call_id: str


# ---------- Helpers ----------

# In-memory rate limiter: max 3 contact submissions per IP per hour.
RATE_LIMIT_MAX = 3
RATE_LIMIT_WINDOW_SEC = 3600
_contact_hits: Dict[str, Deque[float]] = {}


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limited(ip: str) -> bool:
    now = time.time()
    cutoff = now - RATE_LIMIT_WINDOW_SEC
    bucket = _contact_hits.setdefault(ip, deque(maxlen=RATE_LIMIT_MAX * 4))
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_MAX:
        return True
    bucket.append(now)
    return False


def _to_out(doc: dict) -> ContactOut:
    return ContactOut(
        id=doc["id"],
        name=doc.get("name", ""),
        email=doc.get("email", ""),
        company=doc.get("company", "") or "",
        phone=doc.get("phone", "") or "",
        message=doc.get("message", "") or "",
        intent=doc.get("intent", "message"),
        created_at=doc.get("created_at", ""),
    )


# ---------- Routes ----------

@app.get("/api/health")
async def health():
    return {
        "ok": True,
        "retell_configured": bool(RETELL_API_KEY and RETELL_AGENT_ID),
    }


@app.post("/api/contact", response_model=ContactOut, status_code=201)
async def create_contact(payload: ContactIn, request: Request):
    # Honeypot — silently pretend success so bots don't retry.
    if payload.website and payload.website.strip():
        logger.info("honeypot hit ip=%s email=%s", _client_ip(request), payload.email)
        return ContactOut(
            id="hp-" + uuid.uuid4().hex[:8],
            name=payload.name, email=payload.email,
            company=payload.company or "", phone=payload.phone or "",
            message=payload.message or "", intent="message",
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    ip = _client_ip(request)
    if _rate_limited(ip):
        raise HTTPException(
            status_code=429,
            detail=f"Too many submissions. Limit is {RATE_LIMIT_MAX} per hour.",
        )

    intent = payload.intent if payload.intent in VALID_INTENTS else "message"
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": payload.email,
        "company": (payload.company or "").strip(),
        "phone": (payload.phone or "").strip(),
        "message": (payload.message or "").strip(),
        "intent": intent,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "ip": ip,
    }
    await db.contacts.insert_one(doc)
    logger.info("contact stored intent=%s email=%s ip=%s", intent, payload.email, ip)
    return _to_out(doc)


@app.get("/api/contacts")
async def list_contacts(limit: int = 200):
    limit = max(1, min(limit, 1000))
    cursor = db.contacts.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = [_to_out(doc).model_dump() for doc in await cursor.to_list(length=limit)]
    return {"count": len(items), "items": items}


@app.post("/api/create-web-call", response_model=CreateCallOut)
async def create_web_call():
    if not (RETELL_API_KEY and RETELL_AGENT_ID):
        raise HTTPException(
            status_code=503,
            detail="Retell not configured. Set RETELL_API_KEY and RETELL_AGENT_ID.",
        )

    async with httpx.AsyncClient(timeout=20.0) as http:
        try:
            r = await http.post(
                "https://api.retellai.com/v2/create-web-call",
                headers={
                    "Authorization": f"Bearer {RETELL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"agent_id": RETELL_AGENT_ID},
            )
        except httpx.HTTPError as exc:
            logger.exception("retell request failed")
            raise HTTPException(status_code=502, detail=f"Retell request failed: {exc}") from exc

    if r.status_code >= 400:
        logger.error("retell error %s: %s", r.status_code, r.text)
        raise HTTPException(status_code=502, detail=f"Retell error {r.status_code}: {r.text}")

    data = r.json()
    access_token = data.get("access_token")
    call_id = data.get("call_id")
    if not access_token or not call_id:
        raise HTTPException(status_code=502, detail=f"Malformed Retell response: {data}")
    return CreateCallOut(access_token=access_token, call_id=call_id)
