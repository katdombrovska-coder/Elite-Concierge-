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


@pytest.fixture
def fresh_ip_headers() -> dict:
    """Unique X-Forwarded-For per test so the in-memory rate limiter
    (3/hour/IP) doesn't bleed across cases."""
    octet_a = uuid.uuid4().int % 250 + 1
    octet_b = uuid.uuid4().int % 250 + 1
    octet_c = uuid.uuid4().int % 250 + 1
    return {"X-Forwarded-For": f"172.{octet_a}.{octet_b}.{octet_c}"}


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
    def test_create_valid_contact_returns_201_no_underscore_id(self, session, fresh_ip_headers):
        payload = {
            "name": "TEST_Alice Tester",
            "email": "test_alice@example.com",
            "company": "TEST Co",
            "phone": "555-0100",
            "message": "Hello from pytest",
            "intent": "demo",
        }
        r = session.post(f"{API}/contact", json=payload, headers=fresh_ip_headers, timeout=15)
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

    def test_invalid_intent_normalized_to_message(self, session, fresh_ip_headers):
        payload = {
            "name": "TEST_Bob",
            "email": "test_bob@example.com",
            "intent": "not-a-real-intent",
        }
        r = session.post(f"{API}/contact", json=payload, headers=fresh_ip_headers, timeout=15)
        assert r.status_code == 201, r.text
        assert r.json()["intent"] == "message"

    @pytest.mark.parametrize("intent", ["demo", "sales", "quote", "strategy", "message"])
    def test_all_valid_intents_accepted(self, session, fresh_ip_headers, intent):
        r = session.post(
            f"{API}/contact",
            json={
                "name": f"TEST_{intent}",
                "email": f"test_{intent}@example.com",
                "intent": intent,
            },
            headers=fresh_ip_headers,
            timeout=15,
        )
        assert r.status_code == 201, r.text
        assert r.json()["intent"] == intent

    def test_invalid_email_returns_422(self, session, fresh_ip_headers):
        r = session.post(
            f"{API}/contact",
            json={"name": "TEST_BadEmail", "email": "not-an-email", "intent": "demo"},
            headers=fresh_ip_headers,
            timeout=15,
        )
        assert r.status_code == 422, r.text

    def test_missing_name_returns_422(self, session, fresh_ip_headers):
        r = session.post(
            f"{API}/contact",
            json={"email": "test_noname@example.com", "intent": "demo"},
            headers=fresh_ip_headers,
            timeout=15,
        )
        assert r.status_code == 422, r.text

    def test_empty_name_returns_422(self, session, fresh_ip_headers):
        r = session.post(
            f"{API}/contact",
            json={"name": "", "email": "test_emptyname@example.com", "intent": "demo"},
            headers=fresh_ip_headers,
            timeout=15,
        )
        assert r.status_code == 422, r.text


# ---------- /api/contacts ----------

class TestContactsList:
    def test_list_sorted_desc_and_no_underscore_id(self, session, fresh_ip_headers):
        # Create a fresh contact so we know one exists
        unique = f"TEST_list_{uuid.uuid4().hex[:8]}"
        cr = session.post(
            f"{API}/contact",
            json={"name": unique, "email": f"{unique.lower()}@example.com", "intent": "sales"},
            headers=fresh_ip_headers,
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


# ---------- Anti-spam: honeypot + IP rate limit ----------

# These tests rely on the in-memory rate limiter being freshly reset
# (backend restarted) and use unique X-Forwarded-For IPs to isolate buckets.

class TestHoneypot:
    def test_honeypot_filled_returns_hp_id_and_not_stored(self, session):
        ip = f"10.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}"
        marker_email = f"test_hp_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(
            f"{API}/contact",
            json={
                "name": "TEST_Honeybot",
                "email": marker_email,
                "intent": "demo",
                "website": "http://spam.example",
            },
            headers={"X-Forwarded-For": ip},
            timeout=15,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["id"].startswith("hp-"), f"expected hp- prefix, got {data['id']}"
        assert re.match(r"^hp-[0-9a-f]{8}$", data["id"]), data["id"]

        # Verify NOT stored: should not appear in /api/contacts
        r2 = session.get(f"{API}/contacts?limit=1000", timeout=15)
        assert r2.status_code == 200
        emails = [it["email"] for it in r2.json()["items"]]
        assert marker_email not in emails, "honeypot submission leaked into DB"
        ids = [it["id"] for it in r2.json()["items"]]
        assert all(not i.startswith("hp-") for i in ids), "hp- id found in DB list"

    def test_honeypot_does_not_count_against_rate_limit(self, session):
        ip = f"10.55.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}"
        # 5 honeypot hits should all return 201
        for i in range(5):
            r = session.post(
                f"{API}/contact",
                json={
                    "name": f"TEST_hpbot_{i}",
                    "email": f"test_hpbot_{i}@example.com",
                    "intent": "demo",
                    "website": "spam",
                },
                headers={"X-Forwarded-For": ip},
                timeout=15,
            )
            assert r.status_code == 201, r.text
            assert r.json()["id"].startswith("hp-")
        # Then a real submission from same IP should still succeed (bucket empty)
        r = session.post(
            f"{API}/contact",
            json={
                "name": "TEST_hp_then_real",
                "email": f"test_hp_then_real_{uuid.uuid4().hex[:6]}@example.com",
                "intent": "demo",
                "website": "",
            },
            headers={"X-Forwarded-For": ip},
            timeout=15,
        )
        assert r.status_code == 201, r.text
        assert not r.json()["id"].startswith("hp-")

    def test_honeypot_empty_string_normal_flow(self, session):
        ip = f"10.66.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}"
        marker = f"TEST_emptyhp_{uuid.uuid4().hex[:6]}"
        r = session.post(
            f"{API}/contact",
            json={
                "name": marker,
                "email": f"{marker.lower()}@example.com",
                "intent": "sales",
                "website": "",
            },
            headers={"X-Forwarded-For": ip},
            timeout=15,
        )
        assert r.status_code == 201, r.text
        data = r.json()
        assert not data["id"].startswith("hp-")
        # Should be a UUID
        assert re.match(r"^[0-9a-f-]{36}$", data["id"]), data["id"]


class TestRateLimit:
    def test_4th_submission_same_ip_returns_429(self, session):
        ip = f"10.77.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}"
        for i in range(3):
            r = session.post(
                f"{API}/contact",
                json={
                    "name": f"TEST_rl_{i}",
                    "email": f"test_rl_{uuid.uuid4().hex[:6]}_{i}@example.com",
                    "intent": "demo",
                },
                headers={"X-Forwarded-For": ip},
                timeout=15,
            )
            assert r.status_code == 201, f"submission {i} should succeed, got {r.status_code}: {r.text}"
        # 4th submission should be rate-limited
        r4 = session.post(
            f"{API}/contact",
            json={
                "name": "TEST_rl_4",
                "email": f"test_rl_4_{uuid.uuid4().hex[:6]}@example.com",
                "intent": "demo",
            },
            headers={"X-Forwarded-For": ip},
            timeout=15,
        )
        assert r4.status_code == 429, r4.text
        body = r4.json()
        assert "Too many submissions" in body.get("detail", ""), body
        assert "3 per hour" in body.get("detail", ""), body

        # A fresh IP should still succeed (different bucket)
        fresh_ip = f"9.9.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}"
        r5 = session.post(
            f"{API}/contact",
            json={
                "name": "TEST_rl_freship",
                "email": f"test_rl_freship_{uuid.uuid4().hex[:6]}@example.com",
                "intent": "demo",
            },
            headers={"X-Forwarded-For": fresh_ip},
            timeout=15,
        )
        assert r5.status_code == 201, r5.text
