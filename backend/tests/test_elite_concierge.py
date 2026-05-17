"""Backend tests for Elite Concierge FastAPI service.

Covers: /api/health, /api/contact (validation + intent normalization),
/api/contacts (list, sort, no _id), /api/create-web-call (real Retell).
"""
from __future__ import annotations

import os
import re
import time
import uuid

import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- /api/health ----------

class TestHealth:
    def test_health_ok_and_retell_configured(self, session):
        r = session.get(f"{API}/health", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert data.get("retell_configured") is True


# ---------- /api/contact ----------

class TestContactCreate:
    def test_create_valid_contact_returns_201_no_underscore_id(self, session):
        payload = {
            "name": "TEST_Alice Tester",
            "email": "test_alice@example.com",
            "company": "TEST Co",
            "phone": "555-0100",
            "message": "Hello from pytest",
            "intent": "demo",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "_id" not in data, f"_id leaked in response: {data}"
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["intent"] == "demo"
        assert data["company"] == "TEST Co"
        assert data["phone"] == "555-0100"
        assert "created_at" in data and data["created_at"]

    def test_invalid_intent_normalized_to_message(self, session):
        payload = {
            "name": "TEST_Bob",
            "email": "test_bob@example.com",
            "intent": "not-a-real-intent",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 201, r.text
        assert r.json()["intent"] == "message"

    @pytest.mark.parametrize("intent", ["demo", "sales", "quote", "strategy", "message"])
    def test_all_valid_intents_accepted(self, session, intent):
        r = session.post(
            f"{API}/contact",
            json={
                "name": f"TEST_{intent}",
                "email": f"test_{intent}@example.com",
                "intent": intent,
            },
            timeout=15,
        )
        assert r.status_code == 201, r.text
        assert r.json()["intent"] == intent

    def test_invalid_email_returns_422(self, session):
        r = session.post(
            f"{API}/contact",
            json={"name": "TEST_BadEmail", "email": "not-an-email", "intent": "demo"},
            timeout=15,
        )
        assert r.status_code == 422, r.text

    def test_missing_name_returns_422(self, session):
        r = session.post(
            f"{API}/contact",
            json={"email": "test_noname@example.com", "intent": "demo"},
            timeout=15,
        )
        assert r.status_code == 422, r.text

    def test_empty_name_returns_422(self, session):
        r = session.post(
            f"{API}/contact",
            json={"name": "", "email": "test_emptyname@example.com", "intent": "demo"},
            timeout=15,
        )
        assert r.status_code == 422, r.text


# ---------- /api/contacts ----------

class TestContactsList:
    def test_list_sorted_desc_and_no_underscore_id(self, session):
        # Create a fresh contact so we know one exists
        unique = f"TEST_list_{uuid.uuid4().hex[:8]}"
        cr = session.post(
            f"{API}/contact",
            json={"name": unique, "email": f"{unique.lower()}@example.com", "intent": "sales"},
            timeout=15,
        )
        assert cr.status_code == 201
        created_id = cr.json()["id"]

        r = session.get(f"{API}/contacts?limit=10", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "count" in data and "items" in data
        assert isinstance(data["items"], list)
        assert data["count"] == len(data["items"])
        assert data["count"] >= 1

        # _id must NOT leak
        for item in data["items"]:
            assert "_id" not in item, f"_id leaked: {item}"
            assert "id" in item
            assert "created_at" in item

        # The freshly-created contact should be present (likely first since desc sort)
        ids = [it["id"] for it in data["items"]]
        assert created_id in ids

        # Sorted descending by created_at
        timestamps = [it["created_at"] for it in data["items"]]
        assert timestamps == sorted(timestamps, reverse=True), "items not sorted desc by created_at"

    def test_list_respects_limit(self, session):
        r = session.get(f"{API}/contacts?limit=2", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data["items"]) <= 2


# ---------- /api/create-web-call ----------

class TestCreateWebCall:
    def test_create_web_call_returns_real_retell_tokens(self, session):
        r = session.post(f"{API}/create-web-call", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 10
        assert "call_id" in data and isinstance(data["call_id"], str)
        assert len(data["call_id"]) > 0
