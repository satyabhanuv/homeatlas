# v3 Roadmap — new UI (nearnity.com/index_v3.html)

_Fresh-start Airbnb-warm rectangle-layout redesign. Ships incrementally, targets Sep 15 cutover to serve as canonical `nearnity.com`._

**Current v3 version:** v3.0.0-alpha.2 (`index_v3.html`)
**Backend:** shares Worker with v2 (`nearnity-events-worker.js` at v3.0.1)
**Design decisions locked:** see `v3_Section_Mapping.md` — Airbnb aesthetic, rectangle layout, 4 trust-tier card borders (Teal/Indigo/Coral/Slate + Emergency red)

---

## 🟢 Shipped in v3.0.0-alpha.2

- Site skeleton: header, hero, sidebar (6 cat-tabs), content shell, results grid, tier legend, footer
- **Search + geocoding**: Nominatim primary + Census fallback, populates `NRNY.geo` global
- **Cat-tab navigation**: all 6 tabs switchable, subnav updates per tab
- **Emergency subnav**:
  - Hospitals ✅ wired to `/api/medical-radius?taxonomy=hospital`
  - Urgent care ✅ wired to `/api/medical-radius?taxonomy=urgent`
  - Poison control ✅ static 1-800-222-1222 card
  - Fire station ⏳ placeholder ("coming soon")
  - Alerts ⏳ placeholder
- **Empty-state anchor cards** (D3 choice): 911 red + Poison federal + Google Maps fallback shown when a state has no data
- **Leaflet map per section** (D1 choice): teal 🏥 pins for medical results, Voyager tile layer
- Hero primary CTAs + quick chips wired to jump directly to correct cat-tab + subnav

---

## 🚨 v3.0.1 batch (in progress — ship next)

### Backend (chain adapters)
Research done — only 2 chains viable (Kaiser + MinuteClinic are SPA-blocked, skip):
- [ ] **Concentra** — sitemap crawl of `/sitemap.xml` → per-URL fetch → regex extract address + hours + services + geocode (630 US urgent care locations)
- [ ] **Sutter Health + PAMF** — `sutterhealth.org/yext-sitemap.html` → per-URL JSON-LD extraction (220+ NorCal locations)
- [ ] Merge chain results into `/api/medical-radius` with dedupe by name+coord proximity

### Frontend (cat-tab port)
- [ ] Around me → **Events** subnav — wire `/api/events-radius`, tier-color by source (Ticketmaster=Slate, USDA=Indigo, BiblioCommons=Indigo, NPS=Teal)
- [ ] Around me → **Schools** subnav — wire `/api/school-zone` + `/api/school-assignment` (SABS). Teal only when `_sabs_assigned:true`, gray for rest + district-finder link (matches v2.8.1 palette).
- [ ] Around me → **Parks & rec** — wire NPS + Overpass parks
- [ ] Emergency → **Fire station** — Overpass query for fire stations
- [ ] Emergency → **Alerts** — `/api/alerts` (NWS active alerts)

### Bonus (opportunistic)
- [ ] Add `data.sanjoseca.gov` Socrata event dataset (unlocks Music in the Glen / SoFA Pocket Park hyperlocal events)

**v3.0.1 ships as `index_v3.html` = v3.0.1.**

---

## 🚨 v3.0.2 batch (launch-ready, Sep 15)

### Frontend
- [ ] **My home cat-tab**:
  - Utilities → HIFLD electric provider
  - Trash & recycling → curated per-city
  - Weather & risk → AirNow AQI + NWS alerts + USGS quakes
  - Home services → CSLB + Overpass
- [ ] **Saved cat-tab** — read localStorage `nearnity-saved-v3`, render cards, allow delete
- [ ] **Mobile breakpoints** — 375px / 768px / 1440px. Sidebar collapses to bottom-nav on <768px.
- [ ] **Info popovers** on section headers (`ⓘ` button matches v2 pattern)
- [ ] **Section map card-hover sync** — hover a card, its pin highlights; hover a pin, card scrolls into view

### Cutover
- [ ] Full regression across 10+ fixture addresses (dense urban, suburban, rural, national park)
- [ ] Rename `index_v3.html` → `index.html`, move current `index.html` → `index_v2.html` (graceful fallback)
- [ ] Update DNS/Pages routing so `nearnity.com` serves v3
- [ ] Announcement copy for launch

---

## 🟡 v3.1 batch (post-launch, October 2026)

- Help cat-tab (food resources, health, housing, family, legal) — Tier 2 per launch tier framework
- Govt functions cat-tab — Tier 2
- **Community submission form** — "Suggest a missing location" button + community-overlay KV tier (coral cards). Deferred per Satya's "build data + community together" principle — we need a real community first.
- Chain adapters phase 2 — if any additional viable chains emerge (retail clinics via Walgreens/Walmart, HCA if their API opens up)

---

## Reference

- Design decisions: `v3_Section_Mapping.md`
- v2 line status: `Production_Roadmap.md`
- Section-by-section v2→v3 mapping table in Section_Mapping doc
