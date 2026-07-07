# Nearnity — Architecture & Block View

**Last updated:** 2026-06-23 · Current version: **v2.7**

Hand this to any developer making a change to nearnity.com. It maps every UI section back to the code, the Worker endpoint it calls, and the data source it pulls from — without anyone having to grep the codebase.

---

## 1. System overview

Three moving parts.

```
                      ┌─────────────────────────────────────┐
                      │   nearnity.com (Cloudflare Pages)    │
USER  ───── HTTPS ─►  │   - index.html (single-file SPA)     │
                      │   - og-image.png                     │
                      └────────────┬────────────────────────┘
                                   │
                                   │ /api/* requests
                                   ▼
                      ┌─────────────────────────────────────┐
                      │   Cloudflare Worker:                │
                      │   nearnity-events                   │
                      │   - 20+ /api/* endpoints            │
                      │   - Calls federal/state/OSM APIs    │
                      │   - Cloudflare edge cache (cf opts) │
                      │   - KV namespace: nearnity_events_  │
                      │     cache (digest signups, feedback,│
                      │     unmatched searches)             │
                      └────────────┬────────────────────────┘
                                   │
                                   ▼
              ┌───────────────────────────────────────────────┐
              │  External data sources (free public APIs):     │
              │  • Overpass (OpenStreetMap)                    │
              │  • Ticketmaster + SeatGeek                     │
              │  • Federal: NPPES, HRSA, NCES, SAMHSA,         │
              │    Medicare, FEMA, USGS, NWS, AirNow, NPS      │
              │  • State: CSLB (CA contractors)                │
              │  • City open-data portals (SF, Oakland, etc.)  │
              │  • Resend (email delivery)                     │
              └───────────────────────────────────────────────┘
```

**The user's browser never talks directly to OSM or any third-party API.** Everything routes through our Worker which adds caching, rate-limit safety, and a uniform card shape.

---

## 2. File map

| File | Lines | Purpose |
|---|---|---|
| `index.html` | ~19,800 | Single-file frontend SPA. HTML + inline CSS + inline JS. Auto-deployed by Cloudflare Pages when pushed to GitHub. |
| `nearnity-events-worker.js` | ~3,900 | Cloudflare Worker. All `/api/*` endpoints + scheduled digest cron. Paste-deployed via Cloudflare dashboard. |
| `og-image.png` | — | 1200×630 social-share image. Lives at repo root, pushed alongside index.html. |
| `HomeAtlas_Release_Notes.md` | — | Running changelog, newest on top. Update with every release. |
| `Nearnity_Architecture_Block_View.md` | this doc | Architecture reference. |
| `Resend_Domain_And_Digest_Setup.md` | — | Step-by-step Resend + Friday digest setup. |
| `USPTO_Trademark_Filing.md` | — | Trademark filing walkthrough. |
| `Bay_Area_Lawyer_Finder.md` | — | Privacy/ToS lawyer-finding guide. |
| `Launch_Invite_Drafts.md` | — | Instagram + LinkedIn + DM templates for launch. |
| `Launch_Timeline_Jul13.md` | — | Day-by-day launch checklist. |

**Naming convention reminder:** `HomeAtlas_*` prefix is legacy from before the Nearnity rename. The content is current; only the filename is dated.

---

## 3. Top-level UI structure

The page is divided into **six cat-tab groups**, each containing 1-4 section cards.

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER  [logo] nearnity · Source-linked · No paid placement   │
├────────────────────────────────────────────────────────────────┤
│  HERO    "Find what's around you — from trusted public sources"│
│          [Looking for____] [Near me____] [Search]              │
│          Popular pills: ER · Urgent care · Hospitals · ...     │
│          "Showing results near you in San Jose, CA"            │
│          [Around you ▾] [My home ▾] [Help ▾] [Official ▾]      │
│                [Safety ▾] [Saved ▾]                            │
│          Quick searches: Free clinic · Farmers market · ...    │
├────────────────────────────────────────────────────────────────┤
│  SECTIONS (one card per tab — see section catalog below)       │
│   ─ sec-events             ─ sec-myhome / card-home            │
│   ─ sec-schools            ─ sec-services (4 sub-cards)        │
│   ─ sec-parks              ─ sec-yard                          │
│   ─ sec-businesses         ─ sec-home-services                 │
│   ─ sec-community-help     ─ sec-civic                         │
│   ─ sec-health             ─ sec-safety-guide                  │
│                            ─ sec-public-services               │
│                            ─ sec-risks                         │
│                            ─ sec-saved                         │
├────────────────────────────────────────────────────────────────┤
│  FOOTER  Privacy & data · Explore · Data sources · Project     │
│          © Nearnity v2.7                                       │
├────────────────────────────────────────────────────────────────┤
│  FLOATING  [💬 Feedback]  (always visible, bottom-right)        │
└────────────────────────────────────────────────────────────────┘
```

The "cat-tab" sidebar (`SHELL_V95_SECTIONS` registry) gates which section card is visible at any moment. Click "Safety" → only safety sections show; the rest are hidden via CSS rule `body.shell-v95.shell-active-mode #card-X { display: none !important }` unless that card belongs to the active cat-tab.

---

## 4. Section catalog — one block per UI tab

Each entry tells you: the HTML IDs, the JS loader, the Worker endpoint(s) called, and the external data source. Use the **search anchors** column to jump directly to that code (Cmd-F / Ctrl-F).

### 4.1 Around me cat-group

#### 📅 Events
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-events">` |
| **Card** | `<div id="card-events">` |
| **Subnav** | `.subnav[data-subnav-for="card-events"]` — 13 tabs: WHEN (Today / Tonight / This weekend / This month) · TYPE (Free & community / Kids & family / Markets / Farm & u-pick / Volunteer) · TICKETED (Ticketed / Sports / Where to watch) · External sites |
| **Frontend loader** | `loadNearbyEvents(geo)` — search anchor: `async function loadNearbyEvents` |
| **Worker endpoint** | `GET /api/events?lat=&lon=&radius=&city=&state=` |
| **Data sources** | Ticketmaster Discovery API · SeatGeek Events API · City iCal/RSS feeds (`CITY_CALENDAR_FEEDS` — 40 cities) · Library RSS feeds (`LIBRARY_CALENDAR_FEEDS` — 43 city→library mappings) · Seed events (`SEED_BAY_AREA_EVENTS` — ~50 hand-curated rows) · Foodieland + Off the Grid + Yerba Buena (v2.2 specific-date seeds) |
| **Trust labels** | "Ticketed event source" / "Official source" / "Community submitted" / "Source-linked" |
| **Special features** | Add-on partitioning (v2.1) · Hard radius enforcement (v2.1) · Per-tab count badges (v2.1) · Watch-status (confirmed / candidate / ticketed_sports) (v2.1) |

#### 🏫 Schools
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-schools">` |
| **Card** | `<div id="card-school">` |
| **Subnav** | `.subnav[data-subnav-for="card-school"]` — Public / Private / Other / Higher ed / Enrichment (libraries) |
| **Frontend loader** | `loadNearbySchools(geo)` |
| **Worker endpoint** | Direct frontend call: `fetchNearbyEducation(lat, lon)` → calls `/api/overpass` |
| **Data sources** | OpenStreetMap via Overpass: `amenity=school`, `amenity=kindergarten`, `amenity=university`, `amenity=library`, `amenity=community_centre` |
| **Future** | v2.4 worker endpoint `/api/nces-schools` exists for federal NCES data — frontend integration not yet wired |

#### 🌳 Parks & rec
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-parks">` |
| **Card** | `<div id="card-parks">` |
| **Subnav** | Park / Dog park / Playground / Trail / Federal lands (NPS + RIDB) |
| **Frontend loader** | `loadNearbyParks(geo)` + `loadNpsAndRidb(lat, lon)` |
| **Worker endpoints** | `/api/overpass` · `/api/parks-nps?lat=&lon=` · `/api/recreation?lat=&lon=&radius=` |
| **Data sources** | OpenStreetMap (`leisure=park`, `leisure=dog_park`, etc.) · National Park Service API · Recreation.gov RIDB |

#### 🏪 Local businesses (v2.2)
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-businesses">` |
| **Card** | `<div id="card-businesses">` |
| **Subnav** | None (single-mode: search-results view) |
| **Frontend loader** | `loadNearbyBusinesses(geo, keyword)` → races OSM + city-license registry in parallel |
| **Worker endpoints** | `/api/overpass` (OSM name search) · `/api/city-businesses?city=&state=&q=&lat=&lon=` (city open-data) |
| **Data sources** | OpenStreetMap POI names (`shop=*`, `craft=*`, `amenity=*`, `office=*`) · City open-data business-license registries (SF, Oakland, San Jose, Berkeley, Fremont in v2.5) |
| **Trigger** | Automatic when search query matches the `businesses` intent regex (repair / shop / store / salon / tailor / tutor / music / instrument / etc.) — see `INTENT_KEYWORDS.businesses` |

---

### 4.2 My home cat-group

#### 🏠 Property links / saved notes
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-myhome">` |
| **Card** | `<div id="card-home">` (resolved-address pin) + per-address tiles |
| **Frontend loader** | `renderHome(addr)` |
| **Data sources** | Nominatim (geocoder) · Census Geocoder fallback · Local computation (no external call) |

#### ⚡ Utilities
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-services">` |
| **Cards** | 4 sub-cards: `card-electric` · `card-internet` · `card-tv` · `card-security` |
| **Frontend loaders** | `renderElectricUtility(geo)` · `renderBroadbandProviders(geo)` · TV/security are static |
| **Worker endpoints** | `/api/electric-hifld?lat=&lon=` (HIFLD electric retail territories) · FCC Broadband Map lookup (browser direct) |
| **Data sources** | HIFLD electric utility territories (federal) · FCC National Broadband Map · Static curated lists for TV / security |

#### 🌱 Gardening
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-yard">` |
| **Card** | `<div id="card-yard">` |
| **Frontend loader** | `renderYard(yard)` — synchronous (zone lookup is in-memory) |
| **Data sources** | USDA Plant Hardiness Zone Map 2023 (encoded in-page as `USDA_ZONE_BY_CITY` + state fallback + latitude approximation) · Curated plant DB filtered by zone |

#### 🛠️ Home services
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-home-services">` |
| **Card** | `<div id="card-home-services">` |
| **Subnav** | Handyman / Plumber / Electrician / HVAC / Painter / Carpenter / Roofer / Landscaper / Cleaner / Locksmith / Hardware |
| **Frontend loaders** | `loadNearbyHomeServices(geo)` · `loadCSLBContractors(geo)` (v2.4 — CA only, appends a panel) |
| **Worker endpoints** | `/api/overpass` (OSM craft/shop tags) · `/api/cslb?zip=&trade=` (v2.4, CA Contractors State License Board) |
| **Data sources** | OpenStreetMap `craft=*` and `shop=*` tags · CSLB licensed contractor registry (CA) |
| **CTAs on card** | Recommend a pro · Claim a business · Request help · Report issue |

---

### 4.3 Help & wellness cat-group

#### 💚 Community help
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-community-help">` |
| **Card** | `<div id="card-community-help">` |
| **Subnav** | Helplines · Food assistance · Housing & utility · Financial & legal |
| **Frontend loader** | `renderCommunityHelp(geo)` |
| **Data sources** | `COMMUNITY_HELPLINES` (in-page static: 211, 988, SAMHSA, Crisis Text Line) · `COMMUNITY_RESOURCES` (in-page curated city-by-city food banks, housing aid, legal aid) · Fallback to Feeding America / 211.org / LSC lookups |

#### 🩺 Health & wellness
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-health">` |
| **Card** | `<div id="card-health">` |
| **Subnav** | Free clinics · Mental health · Substance use |
| **Frontend loaders** | `loadHealthWellness(geo)` · `renderHealthStatic(geo)` · `renderHealthClinics(geo)` · `loadNPPESProviders(geo)` (v2.4) · `loadSAMHSATreatment(geo)` (v2.4) |
| **Worker endpoints** | `/api/nppes?lat=&lon=&postal=&state=&taxonomy=` (v2.4) · `/api/samhsa?lat=&lon=&radius=` (v2.4) · Direct HRSA call from browser |
| **Data sources** | HRSA Find a Health Center (federal FQHC registry) · NPPES NPI Registry (federal, all US healthcare providers — dentists, therapists, family medicine) · SAMHSA Treatment Locator (federal mental health + substance use) · 988 + SAMHSA static |

---

### 4.4 Official links cat-group

#### 🏛️ Official links / Civic
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-civic">` |
| **Card** | `<div id="card-civic">` |
| **Subnav** | Voting & elections · Officials · Property records · DMV · Permits & courts |
| **Frontend loader** | `renderCivicSection(addr)` — synchronous (state-keyed lookup of `CIVIC_DEEP_LINKS`) + appends nearby DMV offices from public-services Overpass data |
| **Worker endpoints** | None (all static state-keyed lookups) |
| **Data sources** | `CIVIC_DEEP_LINKS` in-page registry (per-state voter reg, state reps, property records, DMV portals) · OSM DMV office locations via the public-services Overpass query (cross-reference) |

---

### 4.5 Safety cat-group

#### 📋 Emergency & safety guide (v2.6)
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-safety-guide">` |
| **Card** | `<div id="card-safety-guide">` (always-visible — overrides empty-state hiding) |
| **Subnav** | Triage: where to go · Scenario actions · Verify a facility |
| **Frontend loader** | None — pure static reference content |
| **Data sources** | None (all in-page HTML) · Links out to: Medicare Hospital Compare · HRSA · DocInfo · NPPES · SAMHSA · Poison Control |

#### 🚨 Emergency services
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-public-services">` |
| **Card** | `<div id="card-public-services">` |
| **Subnav** | Emergency rooms · Hospitals · Urgent care · Clinics · Pharmacies · Fire · Police · Dentists · Civic offices |
| **Frontend loader** | `loadNearbyPublicServices(geo)` |
| **Worker endpoint** | `/api/overpass` (called via `fetchPublicServices`) |
| **Data sources** | OpenStreetMap: `amenity=hospital` · `emergency=*` · `amenity=clinic` · `amenity=pharmacy` · `amenity=fire_station` · `amenity=police` · `amenity=dentist` · `amenity=townhall` · `amenity=post_office` |
| **Future** | v2.4 `/api/medicare-quality` exists — hospital quality ratings overlay not yet wired |

#### ⚠️ Climate risks (also embedded in My Home)
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-risks">` (within My Home page) |
| **Card** | `<div id="card-risks">` |
| **Frontend loader** | `renderRisks(risks)` · `loadLiveRisks(geo)` (NWS / AirNow / USGS) |
| **Worker endpoints** | `/api/alerts?lat=&lon=` (NWS) · `/api/aqi?lat=&lon=&zip=` (AirNow) · `/api/quakes?lat=&lon=` (USGS) |
| **Data sources** | FEMA NFHL flood zones (in-page logic) · Cal Fire FHSZ (CA-specific) · NWS active alerts · USGS earthquakes · EPA AirNow AQI |
| **Specificity tiers** | Address-specific (FEMA flood, Cal Fire FHSZ in CA) · Area estimate · General guidance |

---

### 4.6 Saved cat-group

#### ⭐ Saved places
| Property | Value |
|---|---|
| **Section header** | `<div id="sec-saved">` |
| **Card** | rendered into `#saved-view-body` |
| **Frontend loader** | `renderSavedView()` |
| **Data sources** | `localStorage` key `nearnity:saved:v1` (no server storage; per-device only) |
| **Workflow** | Star button on any card adds it · Saved view shows full list · Digest signup widget at bottom (`digestSignupWidgetHtml()`) · Preview digest button · Unsubscribe button |
| **Worker endpoint for digest** | `POST /api/digest-signup` (writes email + saved place to KV `nearnity:digest_signups:v1`) · scheduled cron sends weekly Friday |

---

## 5. Worker endpoint catalog

All endpoints live in `nearnity-events-worker.js`. Search for `if (url.pathname.endsWith("/X"))` to find the dispatch.

### Core
| Endpoint | Purpose | Cache TTL |
|---|---|---|
| `/api/health` | Status JSON — used to verify the Worker is up | none |
| `/api/events` | Main events aggregator (Ticketmaster + SeatGeek + city iCal + seed). Hard radius filtering + add-on partition + group buckets | 1h KV (events:v4:) |
| `/api/sources` | Adapter introspection (which sources are enabled, last status, count) | none |

### v2.2 — Map performance
| Endpoint | Purpose | Cache TTL |
|---|---|---|
| `/api/overpass?q=...` | Overpass QL proxy. Races all 4 public mirrors via Promise.any. Used by Schools / Parks / Emergency services / Home services / Local businesses for OSM queries. | 1h CF edge cache |

### v2.4 — Federal data adapters
| Endpoint | Purpose | Cache TTL |
|---|---|---|
| `/api/nppes?lat=&lon=&postal=&state=&taxonomy=` | NPPES National Provider Identifier registry. Returns doctors, dentists, therapists, etc. | 24h |
| `/api/cslb?zip=&trade=` | CA Contractors State License Board. Returns licensed contractors. CA-only. | 24h |
| `/api/samhsa?lat=&lon=&radius=` | SAMHSA Behavioral Health Treatment Services Locator. Mental health + substance use facilities. | 24h |
| `/api/medicare-quality?zip=&state=` | Medicare Care Compare hospital quality data (star ratings, ER wait times). | 24h |
| `/api/nces-schools?zip=` | NCES Common Core of Data K-12 school directory. | 7 days |

### v2.5 — City business licenses
| Endpoint | Purpose | Cache TTL |
|---|---|---|
| `/api/city-businesses?city=&state=&q=&lat=&lon=` | Generic adapter — pulls from `CITY_BUSINESS_LICENSE_FEEDS` declarative config. Currently configured: San Francisco, Oakland, San Jose, Berkeley, Fremont. | 3 days |

### v2.7 — Feedback infrastructure
| Endpoint | Purpose | Storage |
|---|---|---|
| `POST /api/feedback` | Structured tester feedback submission. Validates, emails to svelivela@paypal.com via Resend, writes to KV. | KV `nearnity:feedback:v1:*` + email |
| `POST /api/unmatched-search` | Auto-captures zero-result searches (background, no user action needed). Aggregated per-query counter in KV. | KV `nearnity:unmatched_searches:v1:*` + `nearnity:unmatched_counters:v1:*` |

### Pre-existing (v0.x to v2.0)
| Endpoint | Purpose |
|---|---|
| `/api/alerts?lat=&lon=` | National Weather Service active alerts |
| `/api/aqi?lat=&lon=&zip=` | AirNow Air Quality Index |
| `/api/quakes?lat=&lon=&radius_km=&min_mag=` | USGS earthquakes |
| `/api/parks-nps?lat=&lon=&radius=` | National Park Service parks |
| `/api/recreation?lat=&lon=&radius=` | Recreation.gov RIDB sites |
| `/api/electric-hifld?lat=&lon=` | HIFLD electric utility territories |
| `/api/farm-experiences?lat=&lon=&radius=` | Farm & u-pick directory |
| `/api/watch-candidates?lat=&lon=` | OSM bars/pubs that may show sports |
| `POST /api/correction` | Card-level correction reports (legacy; v2.7 feedback supersedes for general use) |
| `POST /api/digest-signup` | Weekly digest email subscription |
| `POST /api/submit-event` | Community event submission to admin KV queue |
| `POST /api/claim-organizer` | Event organizer claim |
| `POST /api/recommend-pro` | Home services "recommend a pro" form |
| `POST /api/request-help` | Home services "request help" form |
| `GET /api/admin/queue` | Admin: pending community submissions |
| `POST /api/admin/approve` | Admin: approve/reject pending |

---

## 6. Data source catalog

### Free public / federal / state (the brand promise)
| Source | What | Where used |
|---|---|---|
| OpenStreetMap (Overpass) | All POI lookups | Schools, Parks, Emergency services, Home services, Local businesses |
| HRSA Find a Health Center | FQHC clinics | Health & wellness |
| NPPES | All US healthcare providers | Health (v2.4) |
| SAMHSA Treatment Locator | Mental health / addiction facilities | Health (v2.4) |
| Medicare Care Compare | Hospital quality + ratings | Emergency services (v2.4, not yet wired in UI) |
| NCES Common Core of Data | K-12 school directory | Schools (v2.4 endpoint exists, not yet wired) |
| FEMA NFHL | Flood zones | Climate risks |
| Cal Fire FHSZ | Wildfire hazard zones (CA) | Climate risks |
| NWS | Live weather alerts | Live risks |
| USGS | Earthquakes | Live risks |
| EPA AirNow | Air quality | Live risks |
| NPS | National parks | Parks federal lands |
| Recreation.gov RIDB | Federal recreation sites | Parks federal lands |
| CSLB (CA state) | Licensed contractors | Home services (v2.4) |
| HIFLD | Electric utility territories | Utilities |
| FCC Broadband Map | Internet providers | Utilities |
| Census Geocoder | Address resolution fallback | Property |
| Nominatim (OSM) | Primary geocoder | Property |
| Ticketmaster Discovery API | Ticketed events (free tier) | Events |
| SeatGeek Events | Ticketed events | Events |
| City iCal/RSS feeds | 40 cities of civic events | Events |
| Library RSS feeds | County library systems | Events |
| City business license open data | SF, Oakland, San Jose, Berkeley, Fremont registered businesses | Local businesses (v2.5) |
| 211.org | Universal helpline | Community help |
| 988 Lifeline | Crisis helpline | Community help |
| USDA Local Food Portal | Farmers markets (stub adapter; primary is curated seed) | Events / Markets |

### NOT used (deliberate brand choices)
- ❌ Yelp Fusion (paid + ToS restrictions + brand misalignment)
- ❌ Google Places API (paid) — **reaffirmed 2026-07-07 after holiday testing failures** exposed hyper-local data gap. Google was the easy answer; instead we're building the public-data aggregation layer nobody else has because it's boring engineering. That IS the moat.
- ❌ Foursquare Places (rate-limited free tier)
- ❌ Any data broker / lead-gen aggregator

---

## 6.5. Five-Tier Data Model (adopted 2026-07-07)

The data layer is structured in five tiers by coverage geometry. Each tier's adapter count scales with a different growth curve; combined they cover 100% of US population with meaningful data for the launch personas (long-weekend hub travelers, family-visit guests). Rural / park-heavy states get excellent coverage from Tier 1 alone; population-dense metros benefit progressively from Tiers 2 → 4.

### Tier 1 — Federal (~17 adapters = 100% US coverage baseline)

Serves EVERY address in the US. Written once, works from Bay Area to rural Alaska.

| Adapter | Category | Endpoint |
|---|---|---|
| HRSA Find a Health Center | Free/low-cost clinics | findahealthcenter.hrsa.gov |
| NPPES | Every US healthcare provider | npiregistry.cms.hhs.gov |
| Medicare Care Compare | Every US hospital + quality ratings | data.cms.gov |
| SAMHSA Treatment Locator | Mental health + substance use | findtreatment.gov |
| NCES CCD | K-12 school directory | educationdata.urban.org |
| Census Geographies | Districts + precincts + admin boundaries | geocoding.geo.census.gov |
| NPS | 63 National Parks — hours, alerts, closures | nps.gov/apps |
| Recreation.gov RIDB | Federal camping / day-use / passes | ridb.recreation.gov |
| USFS API | 154 National Forests | fs.usda.gov |
| BLM API | 245M acres public land | blm.gov/apps |
| USDA Local Food Portal | Farmers markets | usda.gov |
| FEMA NFHL | Flood zones | fema.gov |
| NOAA / NWS | Weather + alerts | api.weather.gov |
| EPA AirNow | Air quality | airnow.gov |
| USGS | Earthquakes | earthquake.usgs.gov |
| USPS Locator | Post offices | usps.com |
| FCC Broadband Map | Internet speeds | fcc.gov |

**Coverage geometry:** 17 adapters = 100% of US at federal-authoritative quality. For WY, MT, ID, AK, HI, ND, SD — this tier alone answers ~80% of resident queries.

### Tier 2 — State (50 adapters = 100% US at state granularity)

Each state has its own park system + open-data portal. Written per-state; one adapter = one state.

| Bay Area / West Coast priority | What it unlocks |
|---|---|
| CA data.ca.gov | 280 state parks + CalFire zones + DMV locations |
| CA-specific park districts (EBRPD, SCC, Midpen, Marin, POST) | Regional parks — Mission Peak class |
| WA state parks | 100 state parks incl. Mt. Rainier context |
| OR state parks | 250 state parks + Willamette |
| AZ / NV / UT state parks | Vegas region, Zion access |
| CO / WY / MT state parks | Front Range + Yellowstone access |
| TX Parks & Wildlife | 89 state parks + Big Bend context |
| FL state parks | 175 state parks (Orlando region) |
| NY OPRHP | 180 state parks + NYC/Adirondack |

**Coverage geometry:** 50 adapters (one per state) = 100% at state granularity. Per adapter: 1-2 days. Total ~2 months for all 50.

### Tier 3 — Metro / big-county (top 25 = 40% pop, top 75 = 55% pop)

Only the largest metros publish city-level open data at usable structure. Per-adapter cost is 4-8 hours for cities with clean open-data portals.

| Priority | Metros | Population served |
|---|---|---|
| Top 10 | NYC, LA, Chicago, Houston, Phoenix, Philly, SA, SD, Dallas, Austin | ~25% of US |
| Next 15 | Jacksonville, FW, Columbus, Charlotte, SF, Indy, Seattle, Denver, DC, Boston, Nashville, Baltimore, Portland, Vegas, Detroit | ~40% of US |
| Next 50 | Regional secondary cities | ~55% of US |

Diminishing returns kick in HARD after top 75. Long tail handled by Tier 5.

### Tier 4 — Institutional (~8 adapters = category-complete nationwide)

Nonprofit / federal directories that cover a full category nationally.

| Adapter | Category |
|---|---|
| AZA (Association of Zoos & Aquariums) | 240 accredited institutions incl. Oakland Zoo |
| USDA APHIS Licensed Exhibitors | Every US zoo, wildlife park, aquarium |
| AAM (American Alliance of Museums) | 4,500 accredited museums |
| IMLS Museum + Library Directory | Federal registry |
| Public library systems (state directories × 50) | Every public library |
| Federation of State Medical Boards / DocInfo | Physician credentials |
| Patient Advocate Foundation | Bill negotiation help |
| Chambers of Commerce (per-metro, skipped — too fragmented) | — |

**Per adapter:** 4-6 hours. Total: ~1 week for the priority set.

### Tier 5 — Community capture (existing v0.92 framework)

For the long tail — small events, hyper-local venues, tribal areas, rural. Users submit → Nearnity moderates → data enters the KV pool. Framework already built (v0.92 submit-event + claim-organizer endpoints). Requires modest user base to be effective; enable at launch, scale with organic growth.

### Persona → Tier mapping

| Persona | Primary tiers | Coverage story |
|---|---|---|
| Long-weekend hub travelers (flagship) | Tier 1 (NPS, USFS, Rec.gov) + Tier 2 (state parks in top tourist states) + Tier 4 (AZA/AAM for hub attractions) | Federal covers national parks; state covers regional destinations; institutional covers zoos + museums travelers actually visit. Metro tier serves tourist metros. |
| Family-visit guests | Tier 1 (HRSA + NPPES for care in home language) + Tier 3 (metro cultural + religious venues) | Federal for healthcare fallback + Language-of-care filter; metro for cultural grocery + places of worship. |
| Racers / backcountry (waitlist) | Tier 1 (USFS + BLM + NPS + Rec.gov) — post-launch feature layer | Federal land + trails covers backcountry entirely without needing per-city work. |

### Scaling posture

- **Not** a "50 cities × 50 states" grind. Linear scaling doesn't work.
- Tier 1 gets a solid Wyoming resident to 80% of what they need. Tier 4 fills categorical gaps nationally.
- Tier 3 is where marginal work happens, but ROI drops off past top 75 metros. Tier 5 handles the rest.
- Total 6-month roadmap for full-US launch quality: ~4-5 focused months of adapter engineering.

**Reaffirmation of "no paid APIs":** This tier model was chosen 2026-07-07 explicitly to avoid Google Places / Yelp Fusion / Foursquare. The moat is that we're doing the aggregation work Google won't do (no ad inventory in it) and that Yelp can't do (review-model-locked).

---

## 7. Storage

### Browser-side (per device, no server)
| Key | Contents | Cleared by |
|---|---|---|
| `localStorage["nearnity:saved:v1"]` | Saved places array — user's stars | Browser cache clear |
| `localStorage["nearnity:events:window:v1"]` | Last-selected time-window chip (today/tonight/weekend/month) | Browser cache clear |
| `localStorage["nearnity:events:bucket:v1"]` | Last-selected source-bucket chip | Browser cache clear |
| `localStorage["nearnity:last_geo:v1"]` | Cached resolved geocode (returning-visitor fast path) | Browser cache clear |
| `localStorage["nearnity:digest:unsubscribed:v1"]` | Client-side unsubscribe flag | Browser cache clear |

### Server-side (Cloudflare KV, namespace `nearnity_events_cache`)
| Key prefix | Contents | TTL |
|---|---|---|
| `events:v4:LAT:LON:RADIUS:STATE:CITY` | Cached events response (per address+radius) | 1 hour |
| `nearnity:digest_signups:v1` | Weekly digest email subscribers (array of objects) | Forever |
| `nearnity:admin_events:v1` | Admin-approved community-submitted events | Forever |
| `nearnity:feedback:v1:KEY` | Individual v2.7 feedback row | 90 days |
| `nearnity:feedback:v1:index` | Index of recent feedback (newest 200) | 180 days |
| `nearnity:unmatched_searches:v1:KEY` | Auto-captured 0-result search event | 90 days |
| `nearnity:unmatched_counters:v1:QUERY` | Aggregate counter per query | 180 days |

**Free tier limits:** 100k reads/day, 1k writes/day, 1 GB storage. At v1 traffic we're well within bounds.

---

## 8. Shared infrastructure (cross-section)

These are NOT tied to any single section — they are global behaviors.

### v2.1 — Intent-first search routing
| Element | Where |
|---|---|
| `INTENT_KEYWORDS` registry (regex per intent) | Top of inline JS, search `const INTENT_KEYWORDS =` |
| `INTENT_TO_SECTION` map (intent → section ID) | Same area |
| `INTENT_HEADING` map (intent → focused heading template) | Same area |
| `detectQueryIntent(query)` | Resolves query string → intent name (or null) |
| `applyIntentFocus(intent, geo, keyword)` | Hides full dashboard, focuses one section with a banner |
| Hook | Called from end of `renderResolved(geo)` |

Intents covered: `health`, `food_help`, `markets`, `farm_u_pick`, `events`, `utility`, `official_links`, `schools`, `parks`, `safety`, `home_services`, `property`, `businesses` (v2.2).

### v2.1 — Hard radius enforcement (Worker side)
- `events` array in API response only includes `distance_miles <= radius`
- Far events land in `regional_events` and `groups.regional_day_trip` / `groups.weekend_trip`
- Add-on partition removes `is_addon_or_package: true` from the main stream

### v2.2 — Universal load guard
| Element | Where |
|---|---|
| `nrnyLoadGuardStart(loadingElId, retryFn, opts)` | Search `function nrnyLoadGuardStart` |
| `nrnyLoadGuardSuccess(loadingElId)` | Same area |
| `nrnyLoadGuardFail(loadingElId, message)` | Same area |
| Hook pattern | Every section loader calls Start at top, Success/Fail in try/catch |

15-second soft hint ("Still working — upstream slow"), 45-second hard ceiling → forces a Retry button. No section can stay stuck on "Finding…".

### v2.2 — Eager parallel preload
- `nrnyEagerPreload(geo)` — runs in `renderResolved` 100ms after geo resolves
- Fires 10 section loaders in parallel with concurrency cap of 4
- Each task fail-silent; one failure doesn't block others

### v2.2 — Shared empty states
- `SECTION_EMPTY_STATES` registry — one entry per card
- `applyEmptyStates()` runs at DOMContentLoaded
- CSS hides everything in a card except its empty-state pre-search

### v2.2 — Saved-place callout
- `renderSavedPlaceCallout(geo)` fires inside `renderResolved`
- Yellow-accented callout under the resolved address
- Quick-jump to save / subscribe to digest / preview digest

### v2.4 — Federal data enrichment
- `_wireV24Enrichment(geo)` — orchestrator, called from `renderResolved`
- Staggered 800/1600/2400ms so federal endpoints aren't hit simultaneously
- Each enrichment appends a `<div class="*-panel">` to the relevant section card

### v2.5 — Local businesses merged search
- `loadNearbyBusinesses(geo, keyword)` races OSM + city-license registry
- `renderBusinessesMerged(cityItems, osmElements, keyword, geo)` dedupes by name and sorts by distance
- City-sourced cards get "City-licensed" trust pill; OSM cards get "Public map data"

### v2.6 — Emergency & safety guide
- Static reference content in `<div id="card-safety-guide">`
- Always visible (overrides v2.2's pre-search hide rule)
- Three tabs: Triage / Scenarios / Verify a facility

### v2.7 — Tester feedback widget
- `nrnyFeedbackInit()` self-runs at script load
- Injects floating "💬 Feedback" button bottom-right
- Click opens structured modal form
- Posts to `/api/feedback` → email + KV
- Also exposes `window.nrnyLogUnmatchedSearch(query, section, addr, count)` — called by zero-result paths to auto-log

---

## 9. Adding a new section — recipe

Say you want to add a "📚 Bookstores" section to the Around me cat-group.

1. **HTML** (in `index.html`):
   - Add a `<div class="page-section-header" id="sec-bookstores">` block + `<div class="parks-card" id="card-bookstores">`
   - Insert it after the Local businesses block (around the same area as other Around me sections)
   - Include a subnav if categorization makes sense
   - Include an empty tbody div like `<div id="bookstores-tbody"></div>`

2. **Register in shell** (search `SHELL_V95_SECTIONS`):
   ```js
   { id: "bookstores", label: "Bookstores", group: "around-me",
     cardId: "card-bookstores", mapId: null,
     subnavSel: '.subnav[data-subnav-for="card-bookstores"]',
     secHeaderId: "sec-bookstores" },
   ```

3. **Register empty state** (search `SECTION_EMPTY_STATES`):
   ```js
   { cardId: "card-bookstores", title: "Bookstores",
     desc: "Search to find independent bookstores near you." },
   ```

4. **Add a loader function**:
   ```js
   async function loadNearbyBookstores(geo) {
     // ... call /api/overpass with shop=books query
     // ... or call a new /api/bookstores worker endpoint
     // Wrap in nrnyLoadGuardStart / Success / Fail
   }
   ```

5. **Hook into eager preload** (search `nrnyEagerPreload`, add a task):
   ```js
   { name: "bookstores", fn: () => loadNearbyBookstores(geo) },
   ```

6. **(Optional) Add intent routing** if a keyword should auto-route here.

7. **Validate**: `node --check index.html JS` and `node --check nearnity-events-worker.js`.

8. **Document** in `HomeAtlas_Release_Notes.md` under a new version block.

---

## 10. Adding a new data source — recipe

Say USDA publishes a new "Free school meals" API.

1. **Worker side** (`nearnity-events-worker.js`):
   - Add a route dispatch: `if (url.pathname.endsWith("/free-school-meals")) { return await handleFreeSchoolMeals(url, env, ctx); }`
   - Add the handler function. Pattern:
     ```js
     async function handleFreeSchoolMeals(url, env, ctx) {
       const lat = parseFloat(url.searchParams.get("lat"));
       const lon = parseFloat(url.searchParams.get("lon"));
       if (!isFinite(lat) || !isFinite(lon)) return json({ error: "Missing lat/lon" }, 400);
       try {
         const u = new URL("https://api.usda.gov/free-meals?...");
         const resp = await fetch(u.toString(), { cf: { cacheTtl: 86400 } });
         if (!resp.ok) return json({ error: `USDA ${resp.status}` }, 502);
         const data = await resp.json();
         // Normalize to Nearnity card shape: name, address, phone, source, source_url, trust_label
         return json({ meals: normalized, count: normalized.length });
       } catch (e) { return json({ error: e.message }, 502); }
     }
     ```

2. **Frontend side**: add a `loadX(geo)` function that fetches `/api/free-school-meals` and renders into the relevant section.

3. **Brand-fit check**: is this data free, public, source-linked, no paid placement? If yes, ship. If no, don't.

---

## 11. Deploy + release flow

### Frontend deploy (Cloudflare Pages, GitHub-connected)
1. Edit `index.html` and/or `HomeAtlas_Release_Notes.md` locally.
2. Pre-flight: `head -3 index.html` → must show `<!DOCTYPE html>`.
3. Open GitHub.dev for `satyabhanuv/homeatlas` repo.
4. Replace files via drag-drop or paste.
5. Commit message: `vX.Y — short description`.
6. Push.
7. Cloudflare Pages auto-deploys in ~30 seconds.

### Worker deploy (Cloudflare dashboard, manual paste)
1. Cloudflare → Workers & Pages → `nearnity-events` → Edit code.
2. Paste entire contents of local `nearnity-events-worker.js`.
3. Save and Deploy.

### Validation before deploy
```bash
node --check index.html      # NOT valid — index.html is HTML, not JS
node --check nearnity-events-worker.js   # Valid — worker is pure JS
```

For index.html JS validation, extract the inline `<script>` blocks first (see release-notes deploy steps for the python snippet).

### Cache busting
Cloudflare edge caches HTML for 4 hours by default. To force a refresh:
- Cloudflare zone → Caching → Purge Everything.
- Or wait 4 hours; users see the new version on next refresh.

---

## 12. Quick reference — "where is X?"

| If you want to change... | Open this file at... |
|---|---|
| The wordmark / logo SVG | `index.html` line ~5915, search `class="brand-logo"` |
| Hero title or subtitle | `index.html` line ~6306, search `<section class="hero">` |
| Popular pill row | `index.html` line ~5970, search `id="popularCategories"` |
| Quick searches row | `index.html` line ~6005, search `class="quick-searches"` |
| Cat-tab labels / icons | Search `SHELL_V95_SECTIONS` in JS + CSS at line ~3547 (`.cat-nav .cat-tab[data-cat=...]::before` rules) |
| Section subnav tabs | Search `data-subnav-for="card-X"` in HTML |
| Trust pill colors | Search `.trust-pill-X` CSS rules |
| Worker endpoint dispatch | `nearnity-events-worker.js` top of `fetch` handler, search `url.pathname.endsWith` |
| Add a new city iCal feed | Search `CITY_CALENDAR_FEEDS` in worker, append entry |
| Add a new city business license feed | Search `CITY_BUSINESS_LICENSE_FEEDS` in worker, append entry with field mapping |
| Add a new seed event | Search `SEED_BAY_AREA_EVENTS` in worker, append a row |
| Add a new intent keyword | Search `INTENT_KEYWORDS` in JS, append a regex |
| Change feedback email recipient | Worker `handleFeedback`, change `to: "svelivela@paypal.com"` |
| Add an admin endpoint | Worker, follow pattern of existing `/api/admin/queue` |

---

## 13. Versioning convention

| Range | Meaning |
|---|---|
| v0.x | Pre-launch development (HomeAtlas era, then Nearnity rename) |
| v1.x | First public-launch-ready milestone (May 2026) |
| v2.x | Post-launch iteration with theme per minor version |
| v3.x | Public launch hardening + major UX evolution (planned) |

Each version's release notes live in `HomeAtlas_Release_Notes.md`, newest on top. v2.2 had multiple in-bundle additions; v2.7 is similar. When in doubt, bump the minor version and write notes.

---

**End of architecture doc.** If anything looks out of date, fix it as part of the change that broke it. Don't let architecture docs drift.
