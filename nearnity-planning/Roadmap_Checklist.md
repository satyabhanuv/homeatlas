# Nearnity — Roadmap Checklist

_Running checklist of what's next + what QA is needed. Update after every feature ship, every piece of feedback, every pivot. Kept brief on purpose — details live in code + release notes._

**Current live version:** v2.7.13 (Worker v2.7.12 + frontend v2.7.13 — Ticketmaster/Socrata adapters + Events tab wired to /api/events-radius)
**Target public launch:** September 2026 (aim: Sep 15, buffer to Sep 29)
**Primary personas at launch:** Long-weekend hub travelers (flagship) · Family-visit guests (built-in) · Racers/day-packers (waitlist)

**Tier framework (confirmed 2026-07-20 — see `~/.auto-memory/project_nearnity_launch_tiers.md`):**
- **Tier 1** — must be 100% nationwide at launch: Safety/Emergency · Events · Libraries · National Parks
- **Tier 2** — defer + track adoption post-launch: Home · Local Parks · Everything else
- **Principle:** aggregators over point solutions (no per-city custom scrapers)

---

## 🔥 v2.7.9 → v2.7.13 recap (Jul 8 – Jul 20)

- [x] v2.7.9 — pre-geocoded medical KV pipeline (CMS + NPPES → /api/medical-radius). Solves boundary + city-scale failures from v2.7.8.5 rollback.
- [x] v2.7.9.1-.4 — CMS field mapping fix (citytown), Census batch retries, per-taxonomy NPPES queries, `/api/geo-index-info` observability
- [x] v2.7.10 — generic events data layer (schema.org + iCal parsers + KV source registry)
- [x] v2.7.11 — auto-discovery + federal aggregators + sitemap crawler (later confirmed .gov TLS-blocked)
- [x] v2.7.11.1-.3 — bot-UA + Googlebot fallback + registry pivot to bot-friendly sources
- [x] v2.7.11.4 — BiblioCommons gateway API (SPA workaround, verified sjpl returns 6877 events) + USDA_KEY wiring + per-source split ingest
- [x] v2.7.11.5-.6 — SDPL/SFPL/Berkeley/LACL dropped (tenant-disable or different platform); PCFMA diag
- [x] v2.7.12 — Ticketmaster into events-radius pipeline (999 geocoded for CA) + Socrata generic adapter (Chi/NYC/Sea/Aus)
- [x] v2.7.13 — frontend Events tab wired to `/api/events-radius` (Task #19 done)

**CA cumulative events (verified 2026-07-20):** ~5,614 events fetched · ~3,255 geocoded · 5 sources (Ticketmaster + NPS + USDA + BiblioCommons + Chicago-style Socrata)

---

## 🎯 Launch punchlist (blocking Sep 15 → Sep 29)

- [ ] **Bulk-ingest all 50 states + DC** for medical + events (Tier 1 requirement)
  - Script: `~/Personal/bulk-ingest.sh` (built 2026-07-20)
  - Run: `export ADMIN_TOKEN='…' && ./bulk-ingest.sh` — ~15-25 min sequential
  - Verify: `/api/geo-index-info` shows 51 states; `/api/events-sources` meta shows 51 states
- [ ] **QA Events tab across metros + rural** — verify /api/events-radius merges cleanly with legacy sources, no double-count
- [ ] **QA medical tab across states** — spot check 5 states beyond CA (NY, TX, WA, FL, WY)
- [ ] **Cron for weekly refresh** (v2.7.9 step 3 = Task #9) — scheduled Worker that runs bulk-ingest weekly to keep KV fresh
- [ ] **Verify per-tenant BiblioCommons drops don't leave metro gaps** — SF/Berkeley/LACL/SDPL. Check that Ticketmaster + NPS + USDA fill those metros; if not, need Communico adapter (v2.8)
- [ ] **Trademark + LLC confirmations** (outside code, Satya)
- [ ] **Domain + email deliverability check** — nearnity.com sender reputation for launch announcement

**→ Next dev session priority: Bulk-ingest run, then Events-tab QA on nearnity.com.**

---

## 🏗️ Phase A — Foundation (Weeks 1-2, target Jul 1-14)

- [ ] **v3 Phase 2: data wiring** — port v2.x data logic into `index_v3_prototype.html` rectangle layout
  - [ ] QA: every section renders inside v3 shell with real data
  - [ ] QA: mobile responsiveness at 375px + 768px + 1440px
- [ ] **v3 Phase 3: polish** — tier-color-code cards, sidebar+subnav interactions, empty states
  - [ ] QA: visual consistency across sections
- [ ] **Search-never-fails defense-in-depth**
  - [ ] Frontend fallback: when Overpass returns 0 for ER/hospital/urgent care, auto-fetch Medicare + NPPES
  - [ ] Seed dataset: top 200 US hospitals with ER (hardcoded in worker)
  - [ ] "🚑 Call 911 + Search Google Maps" anchor card on every empty state
  - [ ] Same fallback pattern for parks + schools (already partially wired)
  - [ ] QA: test 5 addresses per region (dense urban, suburban, rural) — no empty states
- [ ] **National coverage QA harness**
  - [ ] Cron Worker that geocodes 50 fixture addresses weekly, logs which sections empty
  - [ ] Dashboard showing coverage % per section per state

---

## 🎯 Phase B — Persona features (Weeks 3-5, target Jul 15 - Aug 4)

### B1. Category 3: Long-weekend hub travelers (flagship)
- [ ] NPS API full integration — park alerts, hours, closures, weather for all 63 national parks
- [ ] "Tourist mode" — auto-hide DMV/schools/utilities when address = hotel/campground/lodge
- [ ] Multi-day trip planner — save 3-10 addresses per trip in localStorage
- [ ] Radius auto-adjust — default 30mi in tourist mode
- [ ] Destination hub landing pages — top 40 destinations (SEO surface)
  - [ ] QA: Yellowstone, Vegas, Anaheim, Orlando, San Diego addresses

### B2. Category 1: Family-visit guests (built-in)
- [ ] Language-of-care filter — NPPES taxonomy filter for Spanish/Hindi/Vietnamese/Chinese/Korean/Arabic
- [ ] Places of worship section — OSM place_of_worship + religion sub-filter
- [ ] Cultural grocery finder — OSM shop=supermarket + name patterns (Patel, H Mart, 99 Ranch, Halal)
- [ ] Kid-safe / accessibility filter — OSM wheelchair + kids_area tags
  - [ ] QA: 3 non-English-primary addresses (SF Chinatown, Fremont Little Kabul, NYC Jackson Heights)

### B3. Category 2: Racers / backcountry (waitlist for now)
- [ ] Public waitlist landing page + email capture ("Nearnity V2 for racers")
- [ ] Content-only additions to existing Safety Guide scenarios (satellite SOS setup, cell dead-zone tips)

---

## 📦 Phase C — PWA + mobile foundation (Weeks 4-5, target Jul 22 - Aug 4)

- [ ] Full PWA offline mode — service worker, IndexedDB, install-to-home-screen prompt
- [ ] iOS "Add to Home Screen" walkthrough
- [ ] Capacitor iOS + Android shells (submissions start early September)

---

## 🗺️ Phase D — 5-Tier Data buildout (Jul 7 → Sep 8, tier-sequenced)

Each tier below has a **holiday-QA failure it explicitly resolves** + a **ship criterion** (the QA test that must pass before moving to the next tier). Order is fixed and non-negotiable: Tier 1 → Tier 2 → Tier 4 → Tier 3 → Tier 5. Highest population-coverage per hour of engineering, sequenced to serve the flagship traveler persona earliest.

---

### Tier 1 — Federal completion · **Jul 7 – Jul 14** · 1 week
_Fixes: **hospitals/ER/urgent-care empty state in Bay Area** (July 4 QA failure #3, Oakland driving scenario)_

- [x] v2.7.8: `handleMedicareQuality` → frontend `loadNearbyPublicServices` parallel merge (Medicare hospitals populate even when Overpass fails)
- [x] v2.7.8: `handleNPPES` (taxonomy=Emergency Medicine + Urgent Care) → merged into ER / Urgent tabs
- [x] v2.7.8: "🚑 Call 911 + Search Google Maps" anchor card — permanent on ER / Urgent / Hospital tabs
- [x] v2.7.8.1 hotfix: string→number coercion in `renderPublicServices`
- [ ] `handleHRSA` → also wire into Health & Wellness clinics tab (currently only in Community help)
- [ ] BLM API adapter (new endpoint `/api/blm`) — 245M acres public land, critical for WY/NV/UT/AK
- [ ] USFS API adapter (new endpoint `/api/usfs`) — 154 National Forests, ID/MT/OR/WA/CO

**Ship criterion (Tier 1 → Tier 2):** Search "ER" or "urgent care" from Bay Area, Oakland, LA, and rural WY addresses → all four populate with at least 5 real results + anchor card visible. Zero empty states.

---

### Tier 2 — State parks + CA regional districts · **Jul 15 – Jul 28** · 2 weeks
_Fixes: **Mission Peak absent, Yosemite wrongly shown as "worth the drive"** (July 4 QA failure #4)_

- [ ] EBRPD (East Bay Regional Park District) — 73 parks incl. Mission Peak, Coyote Hills, Chabot
- [ ] Santa Clara County Parks — 28 parks incl. Alum Rock, Almaden Quicksilver, Uvas Canyon
- [ ] Midpen (Midpeninsula Regional Open Space) — 26 preserves incl. Rancho San Antonio, Skyline
- [ ] Marin County Parks — Marin Headlands, Mount Tamalpais
- [ ] POST (Peninsula Open Space Trust) — Peninsula trails
- [ ] CA State Parks via data.ca.gov — 280 parks (Big Basin, Henry Coe, Mt Diablo, Angel Island, etc.)
- [ ] Ranking fix in Parks section: prefer OSM + regional-district results near home OVER NPS federal-parks-only when nearby options exist
- [ ] Top 9 additional tourist-heavy states: TX (89 parks), FL (175), NY (180), CO, WA, OR, UT, AZ, WY, MT
- [ ] Weekly cron: refresh state park data from state open-data portals

**Ship criterion (Tier 2 → Tier 4):** Search from Fremont / Niles / Union City → Mission Peak Regional Preserve shows up in top-3 parks. Yosemite drops out of "worth the drive" for Bay Area addresses (only shown for addresses within 60 mi). Alum Rock, Coyote Hills, Almaden Quicksilver all visible for San Jose addresses.

---

### Tier 4 — Institutional (zoos, museums, aquariums, libraries) · **Jul 29 – Aug 4** · 1 week
_Fixes: **Oakland Zoo not found, museums/aquariums missing entirely** (July 4 QA failure #2)_

- [ ] AZA (Association of Zoos & Aquariums) — 240 accredited institutions incl. Oakland Zoo, SF Zoo, Monterey Bay Aquarium
- [ ] USDA APHIS Licensed Exhibitors — federal license DB, all US wildlife parks (even non-AZA)
- [ ] AAM (American Alliance of Museums) — 4,500 accredited museums directory
- [ ] IMLS Museum + Library Directory — federal registry (fills state / smaller-institution gaps)
- [ ] Schema.org JSON-LD scraper for institution homepages — pulls hours, ticket prices, phone directly from the venue's own site
- [ ] New "Attractions" section on the site (or extend Recreation subnav) — Zoos · Aquariums · Museums · Gardens · Historic sites
- [ ] Chip: `Open to anyone` for institutions (with ticket-price notes where the schema provides them)

**Ship criterion (Tier 4 → Tier 3):** Search "Oakland Zoo" or "SF museums" or "aquarium near me" from any Bay Area address → correct results with hours + phone + address + Google Maps link + source link (aza.org or the institution homepage).

---

### Tier 3 — Top-25 US metros city rec + business + local events · **Aug 5 – Aug 25** · 3 weeks
_Fixes: **local July 4 fireworks 0.5mi from house not surfacing** (July 4 QA failure #1) + South Bay farmer's markets + community parades_

- [ ] Existing adapters already live: SF, Oakland, San Jose, Berkeley, Fremont
- [ ] Add tier-3A: LA, NYC (5 boroughs), Chicago, Houston, Phoenix, Philly, San Antonio, San Diego, Dallas, Austin
- [ ] Add tier-3B: Jacksonville, Fort Worth, Columbus, Charlotte, Indianapolis, Seattle, Denver, DC, Boston, Nashville, Baltimore, Portland (OR), Las Vegas, Detroit
- [ ] Universal city rec calendar (iCal/RSS) adapter — one handler serves any city with standardized iCal exports
- [ ] **BiblioCommons adapter (library events)** — HIGH VALUE, ONE ADAPTER SERVES ~200 US LIBRARIES:
  - SJPL, SFPL, Berkeley PL, Oakland PL, LA County, NYPL, Boston, King County (Seattle), and dozens more
  - URL pattern: `{library-slug}.bibliocommons.com/events/{event-id}` — parseable via schema.org JSON-LD embedded on each event page
  - Fills the gap surfaced 2026-07-07 (kids magic show at SJPL not found)
  - Field-confirmed 2026-07-13: Satya explicitly asked about library events → `sanjoselibrary/events` gap
  - Ideal early Tier 3 win — build this FIRST since a single adapter covers most Bay Area library events
- [ ] **PCFMA adapter (Pacific Coast Farmers Market Association)** — scrapes pcfma.org for all their managed markets. Currently we have ~10 hand-curated PCFMA markets in seed data; the actual roster is ~60 markets across the Bay Area. Missing Kaiser Santa Clara Friday market, others.
  - Field-confirmed 2026-07-13: Satya was at Kaiser SJC farmers market Friday, Nearnity showed only 1 nearby pin (missed Kaiser's)
  - URL: https://pcfma.org/markets/ — all markets listed with schedule + location
  - One adapter covers most Bay Area free/community farmers markets
- [ ] Chamber of Commerce event feeds where they exist (secondary source, deprioritize on brand grounds)
- [ ] Local events dedup + normalize (Ticketmaster / SeatGeek / city iCal / BiblioCommons often show the same event 3 ways)
- [ ] Firework-specific seed for Jul 4 2027: pre-load all top-100 metro fireworks events one month before the holiday (bounded seed refresh via cron)

**Ship criterion (Tier 3 → Tier 5):** Search "fireworks" or "July 4" from your Willow Glen / Almaden / Niles address → at least 3 results within 5 miles, sourced to city rec calendars. Repeat for Halloween parades in October, farmer's markets weekly.

---

### Tier 5 — Community capture activation · **Aug 26 – Sep 8** · 2 weeks · parallel with Phase E
_Fills the long tail — small towns, rural areas, tribal lands, block parties, HOA events_

- [ ] Admin moderation UI for submitted events (currently console-only via v0.92)
- [ ] Rate limiting on `/api/submit-event` (KV counter per IP per day)
- [ ] Public "know something we missed?" CTA on every empty state — always visible, tap → submit form
- [ ] Email trigger: any submitted event goes to `feedback@nearnity.com` for review
- [ ] Weekly digest of submissions to Satya (Cloudflare cron already scaffolded in v0.98)

**Ship criterion (Tier 5 → Phase E launch prep):** Submit a test event as a normal user → shows up in the admin queue within 30 seconds → approve it → visible on the public site within 5 minutes. Round-trip works.

---

### Cross-tier tooling (runs alongside all tiers)

- [ ] **Weekly coverage QA cron** — Worker geocodes 50 fixture addresses every Sunday, logs which sections empty out. Dashboard shows coverage % per section per state. Escalates to email if any fixture regresses.
- [ ] **10 western fire-prone states — wildfire zone adapters** (Cal Fire, Texas A&M, CSFS, ODF, DNR-WA, NDF, UDF, AZDFFM, DNRC-MT, IDL). Extends climate risks beyond CA.
- [ ] **Top 40 destination-hub seed data** — hospitals + ER + urgent care + attractions per hub. Fills gaps until Tier 3 lands. Also feeds Phase E destination landing pages.
- [ ] **Console error logging** — add `console.error("[section] failed:", err)` inside every `try/catch` swallow across index.html so future silent failures show up in DevTools instead of hiding behind hidden loaders (habit adopted after v2.7.8 silent-TypeError incident).

---

## 🚀 Phase E — Launch execution (Weeks 8-11, target Aug 19 - Sep 15)

- [ ] Landing pages per persona (3 pages) + tagline + FAQ
- [ ] Reddit posts (drafts) — r/travel, r/roadtrip, r/nationalparks, r/vegaslocals, r/immigration, r/backpacking, r/spartanrace, r/AskAnAmerican
- [ ] Screenshot pack + 2-min demo video
- [ ] Sitemap.xml with 40 hub destination URLs
- [ ] OpenGraph metadata per destination page
- [ ] schema.org JSON-LD
- [ ] Cloudflare Web Analytics wired
- [ ] Uptime monitoring (UptimeRobot)

---

## 🏢 Phase F — Legal + business (parallel)

- [ ] File CA LLC + EIN + business bank account (Satya, after MLO exam)
- [ ] USPTO trademark filing (file after launch as 1A use-in-commerce)
- [ ] Privacy Policy + ToS (Termly $99 or Bay Area lawyer $300-500)
- [ ] Apple Developer Program enrollment ($99/yr, only when Capacitor is ready)
- [ ] Google Play Console enrollment ($25 one-time)

---

## 💤 Waitlist / v2 / deferred (post-launch)

- [ ] Category 2 racer features full build — cell coverage maps (FCC), wildfire real-time (InciWeb/NIFC), ranger station finder, satellite SOS integration, offline cache
- [ ] **Ski resort + event medical layer** — field gap confirmed 2026-07-13: Satya at Snowbasin UT Spartan event, medical services on-mountain not surfaced. Requires: (a) ski-resort ski patrol data (scraped from resort websites — snowbasin.com/mountain-safety pattern), (b) event medical (Spartan / Ironman / Ragnar publish medical stations on their event pages), (c) Ranger station finder (USFS + BLM). All racer/backcountry persona work.
- [ ] Coverage validation for all 100+ US metros (currently top 40)
- [ ] Multi-user trip sharing (currently single-user localStorage only)
- [ ] Native push notifications (post Capacitor submit)
- [ ] International coverage — non-US

---

## ✂️ Cut from scope

- [ ] ~~Emergency-first positioning~~ — retention model doesn't work (one crisis = one-and-done)
- [ ] ~~v2.x UI patches~~ — v3 will overwrite; only cross-version data/reliability fixes ship in v2.x
- [ ] ~~Full national coverage at launch~~ — top 40 hubs only; explicit "expanding" messaging elsewhere

---

## 📝 Recent decisions log

| Date | Decision |
|---|---|
| 2026-07-07 | v2.7.8.1 hotfix shipped — string→number coercion for geo.lat/lon in `renderPublicServices` fixed the silent TypeError that was hiding v2.7.8's federal fallback + anchor cards. |
| 2026-07-07 | v2.7.8 shipped — federal medical (Medicare + NPPES × 2) parallel merge into `loadNearbyPublicServices` + permanent 911/Google Maps anchor cards on ER/UC/Hospital tabs. First release of 5-tier data-layer buildout. |
| 2026-07-07 | `wrangler.jsonc` committed to repo root — resolves Cloudflare Pages Wrangler-migration deploy error ("Worker named 'homeatlas' already exists"). |
| 2026-07-07 | Corrected session-split memory — THIS session (blissful-amazing-hawking) = code / QA / deployment. Other session = strategy / founder-doubts sounding-board. Was inverted in prior memory. |
| 2026-07-07 | Committed to 5-tier public-data model. No paid APIs, no Google Places, no Yelp. Full breakdown in `Nearnity_Architecture_Block_View.md` §6.5. |
| 2026-07-07 | Adapter sequencing: **Tier 1 federal → Tier 2 state → Tier 4 institutional → Tier 3 top-25 metros → Tier 5 community capture**. Highest population-coverage per hour of engineering + serves flagship persona first. Each tier has an explicit ship criterion in Phase D block above. |
| 2026-07-07 | Confirmed Sep 15, 2026 launch. July 13 target officially killed. Session summary in `Nearnity_Session_2026-07-07_Summary.md`. |
| 2026-07-07 | v2.7.7 is the last v2.x release with new UI features. v2.7.8+ ships data-layer only, cross-version reusable. |
| 2026-06-30 | Chose traveler-focused niche over resident/planning-mode broad appeal. Three sub-personas: family-visit / racers / hub travelers. |
| 2026-06-30 | Confirmed v3-first sequencing: no v2.x public launch. Wait for v3 as launch baseline. |
| 2026-06-30 | Split work across two Cowork sessions (see 2026-07-07 correction above). |
| 2026-06-30 | v2.7.7 P0 hotfix: capped healthcare Overpass radius at 16km to stop Bay Area timeouts. |
| 2026-06-25 | Committed to v3 prototype (rectangle layout) as future foundation. |
| 2026-06-25 | Trust-tier chip colors: Teal / Indigo / Coral / Slate + Emergency red. |
