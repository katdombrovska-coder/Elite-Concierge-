# Elite Concierge — Landing Page PRD

## Original problem statement
Build a single landing page for "Elite Concierge" — an AI voice & chat agent service — following the supplied build recipe. The page is a self-contained `public/index.html` (vanilla HTML + embedded CSS + module JS), React is a no-op. The backend is a small FastAPI service with 4 endpoints (health, contact create, contact list, Retell web-call proxy).

## User personas
- **SMB owner / ops lead** — wants to stop missing inbound calls; lands on page, hears the sample call clip, plays with the Revenue Recovery Calculator, books a strategy call.
- **Mid-market revenue lead** — wants to know plans, integrations, compliance; opens a quote modal from pricing.
- **Engineering buyer** — wants 31 languages, CRM, 600ms latency, SOC2 — scans the features grid.

## Architecture
```
/app/
├── backend/
│   ├── server.py         FastAPI: /api/health, /api/contact, /api/contacts, /api/create-web-call
│   │                     + in-memory IP rate limiter (3/hr) + honeypot 'website' field
│   ├── requirements.txt
│   ├── .env              MONGO_URL, DB_NAME, RETELL_API_KEY, RETELL_AGENT_ID
│   └── tests/test_elite_concierge.py  pytest, 18 cases
└── frontend/
    ├── public/index.html ~1320 lines, self-contained
    ├── src/App.js        Returns null (recipe)
    ├── src/index.js      Mounts hidden React root
    ├── src/index.css     Empty (Tailwind base intentionally removed)
    ├── .env              REACT_APP_BACKEND_URL
    └── package.json      CRA shell (react-scripts 5)
```

### Backend endpoints
- `GET  /api/health` → `{ok, retell_configured}`
- `POST /api/contact` → 201 `{id, name, email, company, phone, message, intent, created_at}`
  - Honeypot field `website`: if filled, returns 201 with `id` prefixed `hp-`, **not stored** in DB
  - Rate limit: max **3 successful** submissions per IP per 3600s window → 429 on 4th
  - Trusted IP source: `X-Forwarded-For` header (first value) falls back to `request.client.host`
- `GET  /api/contacts?limit=N` → `{count, items}` sorted desc, `_id` excluded
- `POST /api/create-web-call` → proxies to `https://api.retellai.com/v2/create-web-call` → `{access_token, call_id}`

### Frontend behavior
- Sticky navbar with `.scrolled` blur on scroll > 8px
- Mobile hamburger (≤900px): brand + burger only in top bar; drawer with 3 links + 2 CTAs; closes on link/CTA click
- IntersectionObserver fade-in on `.reveal` elements
- Marquee duplicates children once for seamless CSS scroll
- Contact modal with 5 intents (demo/sales/quote/strategy/message); intent-aware copy
- **Sample call widget**: animated equalizer + autoplay-muted `<audio>` + click-to-unmute button; rolling captions update via `timeupdate`
- **Revenue Recovery Calculator**: 3 range sliders, animated $/year + $/month figures, formula `missed × 52 × close% × value × 0.80` (80% recovery rate)
- Retell flow: mic permission → `/api/create-web-call` → ESM `import` of `retell-client-js-sdk@2.0.7` → `startCall({accessToken})`

## What's implemented
**v1 (Jan 2026)**
- ✅ All 4 backend endpoints, Pydantic validation, MongoDB storage
- ✅ Retell AI web-call integration (verified end-to-end)
- ✅ Complete landing page: navbar, hero, demo card, marquee, How It Works, 12-feature grid (SVG icons), pricing, CTA strip, footer
- ✅ Sticky navbar, reveal-on-scroll, modal, voice demo, data-testid coverage

**v2 (Jan 2026)**
- ✅ "Listen to a real call" sample-call widget under the demo card (animated equalizer + captioned audio + autoplay muted + click-to-unmute)
- ✅ Stats section **replaced** with interactive Revenue Recovery Calculator (3 sliders → big animated $/year aubergine result card with pink glows + "Stop the bleeding" CTA)
- ✅ Mobile hamburger menu (drawer with 3 links + 2 CTAs)
- ✅ Anti-spam: honeypot `website` field + IP rate limit 3/hr → 429

## Test status
- Backend: 18/18 (100%)
- Frontend: all UI/interaction assertions pass (100%)
- Zero JS errors, zero failing assertions

## Backlog / next tasks
- **P1** Email forwarding for contact submissions (Resend/SendGrid) — user said "email will setup later"
- **P1** Replace sample-call.mp3 placeholder (currently a jsDelivr 3rd-party URL) with a real Elite Concierge call recording self-hosted at `/sample-call.mp3`
- **P2** Admin dashboard for `/api/contacts` (currently public JSON)
- **P2** Real `/privacy` and `/terms` pages
- **P2** Move rate limiter from in-memory to Redis when scaling beyond one worker
- **P3** SEO: OG/Twitter cards, sitemap
- **P3** Consider splitting `public/index.html` (~1320 lines) into `index.html` + `public/calc.js` + `public/contact.js` for maintainability
