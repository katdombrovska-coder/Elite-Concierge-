# Elite Concierge — Landing Page PRD

## Original problem statement
Build a single landing page for "Elite Concierge" — an AI voice & chat agent service — following the supplied build recipe. The page is a self-contained `public/index.html` (vanilla HTML + embedded CSS + module JS), React is a no-op. The backend is a small FastAPI service with 4 endpoints (health, contact create, contact list, Retell web-call proxy).

## User personas
- **SMB owner / ops lead** — wants to stop missing inbound calls; lands on page, hears live demo, books a strategy call.
- **Mid-market revenue lead** — wants to know plans, integrations, compliance; opens a quote modal from pricing.
- **Engineering buyer** — wants 31 languages, CRM, 600ms latency, SOC2 — scans features grid and stats.

## Architecture
```
/app/
├── backend/
│   ├── server.py         FastAPI: /api/health, /api/contact, /api/contacts, /api/create-web-call
│   ├── requirements.txt  fastapi, uvicorn, motor, pydantic[email], httpx, python-dotenv
│   ├── .env              MONGO_URL, DB_NAME, RETELL_API_KEY, RETELL_AGENT_ID
│   └── tests/test_elite_concierge.py  (pytest, 14 cases — created by testing agent)
└── frontend/
    ├── public/index.html       Entire landing page (~950 lines, self-contained)
    ├── src/App.js              Returns null (recipe)
    ├── src/index.js            Mounts hidden React root
    ├── src/index.css           Empty (Tailwind base intentionally removed)
    ├── .env                    REACT_APP_BACKEND_URL
    └── package.json            CRA shell (react-scripts 5)
```

### Backend endpoints
- `GET  /api/health` → `{ok, retell_configured}`
- `POST /api/contact` → 201 `{id, name, email, company, phone, message, intent, created_at}` (intent ∈ {demo,sales,quote,strategy,message}; invalid → 'message')
- `GET  /api/contacts?limit=N` → `{count, items}` sorted desc, `_id` excluded
- `POST /api/create-web-call` → proxies to `https://api.retellai.com/v2/create-web-call` with Bearer key + agent_id, returns `{access_token, call_id}`

### Frontend behavior
- Sticky navbar adds `.scrolled` (translucent cream + blur) on scroll > 8px
- IntersectionObserver (threshold 0.08) toggles `.in` on `.reveal` elements for fade+slide entry
- Marquee duplicates children once in JS for seamless CSS scroll
- One contact modal, 5 intents wired via `data-intent` on 7 trigger buttons (nav-sales, nav-demo, hero-demo, plan-voice, plan-chat, plan-full, strategy, strip-strategy, strip-message, footer-contact)
- Retell flow: mic permission → POST `/api/create-web-call` → dynamic ESM import of `retell-client-js-sdk@2.0.7` → `startCall({accessToken})` with event handlers

## What's implemented (Jan 2026)
- ✅ Full FastAPI backend with all 4 endpoints, Pydantic validation, MongoDB storage
- ✅ Retell AI web-call integration (verified end-to-end with provided API key + agent ID)
- ✅ Complete landing page: navbar, hero, demo card with waveform, marquee, How It Works, 12-feature grid (clean SVG icons), stats, 3-tier pricing with featured center, CTA strip, footer
- ✅ Sticky navbar shading, reveal-on-scroll, marquee loop, contact modal with intent-aware copy, voice demo wiring
- ✅ Data-testid coverage on all interactive elements
- ✅ Backend test suite (14 pytest cases) at `/app/backend/tests/test_elite_concierge.py`

## Test status
- Backend: 100% (14/14)
- Frontend: 100% (22+ UI/integration assertions)
- No bugs found by testing agent

## Backlog / next tasks
- **P1** Email forwarding for contact submissions (Resend/SendGrid) — user said "email will setup later"
- **P2** Admin dashboard to browse `/api/contacts` (currently public JSON)
- **P2** Mobile menu drawer (hamburger) — desktop-only nav links collapse to nothing on <900px
- **P2** Real `/privacy` and `/terms` pages
- **P3** Sitemap + meta OG/Twitter cards for SEO
- **P3** Anti-spam: rate limit on `/api/contact` + optional honeypot field
