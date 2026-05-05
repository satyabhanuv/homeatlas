# HomeAtlas — Conversation History

A narrative summary of the entire build conversation between Satya and Claude (corporate Cowork mode). Captures decisions, rationale, and context not stored elsewhere. Use alongside `HomeAtlas_Project_Brief.md` when resuming in a different Claude account.

**Scope:** v0.0 (project kickoff) through v0.22 (current).
**Format:** chronological by iteration. Each entry = the user's prompt theme + the response approach + what shipped + any rejected alternatives or feedback.

---

## Phase 0 — Project genesis

### Initial ask
Satya described wanting a public website where homeowners enter an address and see "everything about their home" — utility zones, internet provider, school district, and more. CA was the starting point but the vision was always US-wide and eventually global. Long-term scope: not just zoning, but house anatomy by year built (wiring, plumbing, materials), HVAC duct sizing, soil & native plants, and more.

### v0.0 — Architecture plan (`CA_Zoning_Lookup_Plan.md`)
Before writing code, I wrote a planning doc covering: what's buildable for free vs paid, free public data sources (CDE GIS for school districts, CEC GIS for utilities, FCC Broadband Map for ISPs, OpenStreetMap Nominatim for geocoding), MVP scope, hosting cost ($0–$15/yr), and the four-phase roadmap. Satya signed off on path "Both — plan first, then prototype" with answers locked in: (1) CA → US → global, (2) single-stop home knowledge platform, (3) working name **HomeAtlas**, (4) no accounts/storage in v1, (5) accounts opt-in when monetizing, (6) Phase 2 priority = all civic layers + house anatomy + yard.

---

## Phase 1 — California MVP

### v0.1 — Initial prototype
Single-file HTML/CSS/JS. Photon autocomplete + Nominatim reverse geocode. 3 cards: Electric utility (CA county lookup), Internet (FCC link only), School district. 6 "Coming soon" placeholder cards. Privacy-first, no backend.

### v0.2 — Autocomplete + ISP/TV/Security/CCA expansion
Major feature add. Photon dropdown with debouncing + keyboard nav. Internet card now lists named providers (cable, fiber, 5G, satellite). New TV providers card (8 streaming/satellite). New Security card (13 brands). **CCA breakdown on electric card** for IOU customers (PG&E/SCE/SDG&E) — Marin Clean Energy, Peninsula Clean Energy, Ava Community Energy, San Jose Clean Energy, CleanPowerSF, etc. Skipped for LADWP/SMUD/POU customers.

### v0.3 — Structured address + interactive provider tables
Replaced comma-string address with labeled grid. All cards converted to FCC-style tables (Provider | Tech | Down | Up | Visit). Internet shows typical max plan speeds. Fixed broken CDE link (replaced with Google search + GreatSchools + stable CDE landing).

### v0.4 — Real schools via OpenStreetMap Overpass API
Schools card moved to full-width section. Live Overpass query within 2.5 mi: schools, kindergartens, colleges, libraries, swimming pools, sports centers, community centers. Public/private classification via OSM tags + name patterns (Catholic/Christian/Montessori/Saint/Country Day).

### v0.5 — Grouped providers + county fallback + schools fix
Internet/TV/Security cards show sub-sections (Cable/Fiber/5G/Satellite). Added CA city→county fallback map (~120 cities) — fixed San Francisco missing-county issue. Help-callout when utility resolves to "Unknown". Schools fetch: switched Overpass POST→GET (CORS fix on file:// origins), added 3-mirror fallback chain. Retry button on failure.

### v0.6 — Deployment polish + guide
Inline SVG favicon (green house). Open Graph + Twitter meta tags. Theme color. Mailto feedback link with placeholder email `CHANGE-ME@example.com` (Satya needs to swap before public launch). Wrote `HomeAtlas_Deployment_Guide.md` — step-by-step GitHub + Cloudflare Pages walkthrough. Created `index.html` as deploy-ready copy.

**User decisions during this iteration:**
- Deploy path: GitHub + Cloudflare Pages (recommended), free `*.pages.dev` subdomain for now
- Custom domain deferred to post-validation
- Friends-and-family scale; corporate email NOT used as public feedback address
- Result: deployed to https://homeatlas.satyabhanuv.workers.dev/ (Cloudflare Workers)

### v0.7 — Parallel Overpass queries + map embed
Schools fetch reliability: split single heavy Overpass query into 2 parallel (schools + amenities) using `Promise.allSettled`. Added 4th mirror (overpass.osm.ch). Per-mirror timeout 40s → 20s. **OpenStreetMap iframe embed inside resolved-address card** showing the home with marker.

### v0.8 — Schools restructure (closest-by-level + better classifier)
**Bug fix:** previous `slice(0, 12)` on sorted-by-level list let elementary fill all slots before middle/high were considered. Replaced with per-level grouping. Tier 1 = closest in each level. Tier 2 = next 2 in each level. Strengthened classifier (reads OSM `grades` attribute, `isced:level`, stricter name patterns for "Junior High"/"JHS"/"Intermediate"). Filter non-K-12 schools (driving schools, music schools, tutoring centers).

---

## Phase 1.5 — US-wide expansion

### v0.9 — Open to all US states with national fallbacks
Removed CA-only gate. Photon autocomplete opened US-wide. Non-CA addresses still get nationwide options (5G, satellite, streaming TV, security brands, OSM schools). State-aware empty-state callouts pointing to U.S. Energy Atlas + Google search fallback for unsupported states.

### v0.10 — Depth for PA, NY, TX, WA, NJ
Five new states with same depth as CA. Per-state lookup tables (counties→primary IOU, city POU overrides, cable, fiber, school district). **NYC borough handling** (Brooklyn=Kings, Queens=Queens, Manhattan=New York, Bronx=Bronx, Staten Island=Richmond). **TX retail-choice indicator** for ERCOT TDU customers (PowerToChoose.org row alongside their TDU). 30+ new utility/ISP URLs in PROVIDER_URL.

**Verified with 20 regression tests** across all 6 states + Boston "unloaded state" fallback.

---

## Phase 1.5 — Address resolution iterations

### v0.11 — Nominatim fallback geocoder
Fix for missing addresses in smaller towns (Phoenixville PA case). Photon → Nominatim fallback chain. Removed US-center lat/lon bias (was hurting east-coast searches). "No matches" empty state in dropdown. Debounce 280→350ms.

### v0.12 — Dual icons + top-5 cap + schools 3×3
Per-row dual icon links (🌐 Reach them + 📍 Map to Google Maps near user). Top-5 cap per tile (3 if fewer). Schools restructured to 3×3 grid: Public/Private/Other × Elementary/Middle/High. Charter/magnet detection added.

### v0.13 — Phase 2 begins: Yard & Garden module
First Phase 2 deliverable. New full-width card. USDA Plant Hardiness Zone via 3-level fallback (~150 cities → 50-state default → latitude approx). 39-plant DB filtered by zone, 4 categories (Trees/Shrubs/Perennials/Edibles). Soil descriptions for 9 major states + USDA Web Soil Survey link. Watering tips by climate type.

### v0.14 — Better address resolution + house-number ranking
Re-rank suggestions by house-number presence. Aggressive submit-time geocoding (Photon → Nominatim free-text → Nominatim structured). "Street level" yellow pill badge in dropdown. Notice in resolved-address card when only street-level was found. Address parser handles 7 input shapes.

### v0.15 — Census Bureau Geocoder (4th tier)
Added US Census Bureau Geocoder as 4th submit-time fallback. Public-domain TIGER/Line address-range data, no API key, browser-CORS friendly. Catches addresses present in federal data but missing from OSM (newer subdivisions, rural).

### v0.16 — Two-phase autocomplete + smart selection upgrade
**Bug fix realization:** v0.15's Census fallback only fired on form submit, not when picking from autocomplete. Most users never triggered it. Added Phase 2 deep search (Census + Nominatim merge into dropdown when Photon lacks HN). Smart-upgrade on selection: clicking street-level suggestion runs full chain on typed text and silently swaps in HN match if found. `HOMEATLAS_DEBUG = true` flag for DevTools console logging.

### v0.17 — Regression fix
**v0.16 broke things.** Phase 2 fired 2 simultaneous Nominatim calls per pause, violating their 1-req/sec policy and getting users IP-blocked. Even basic reverseGeocode broke. Fix: removed Nominatim from Phase 2 entirely (Census-only there). Smart-upgrade also Census-only. `runLookupFromFeature` now falls back to feature properties if reverseGeocode fails.

### v0.18 — Census reverse-geocode fallback
Found another v0.17 limitation: feature-properties fallback didn't include county, breaking resolveElectric. Added Census Bureau reverse-geocode (`/geocoder/geographies/coordinates`) as 2nd-tier reverse source. Returns Counties/States/Places for any lat/lon. Even when Nominatim is fully blocked, county still resolves. Fixed Photon property mapping (street name from `name` field if `street` missing).

**User explicitly stated frustration with the back-to-back regressions during this period.** I owned the mistakes and emphasized testing the full lookup flow, not just autocomplete.

---

## Phase 1.5 — UI iterations

### v0.19 — Visual UI overhaul: climate risks + parks card
**User showed 3 reference screenshots** (Climate risks rows, Home details tiles, Schools rating circles) — I initially interpreted as content specs (built actual climate risks card with heuristic data) before learning they were visual references.

What shipped: NEW Climate risks card (4 score rows: Flood/Fire/Heat/Air heuristics + deep-links to FEMA/Cal Fire/AirNow). NEW Parks & places card (Overpass: parks/dog parks/playgrounds/trails). NEW Home details placeholder (6 icon tiles, Year Built editable + persists in localStorage). Watering tile promoted.

### v0.20 — Visual restyle (the "I meant visual references" correction)
**User clarified** that the screenshots from v0.19 were UI inspiration, not content specs. Restyled existing UI to match. Address-resolved card → icon-tile grid (matching home-details visual). Schools rows → colored circle badges (green <0.5mi, blue <1.5mi, gray >1.5mi) with level letter inside. Parks card uses same badge-row visual.

### v0.21 — Page-wide redesign (3-page-scroll target)
**User asked for substantial redesign** to fit in 3 page-scrolls, big distinct headings, less text density, time/season-aware tips, "for kids" pop, collapsible risks, responsive design.

What shipped: 6 big distinctive section headers (color-accented bands per topic). Reordered sections (Home → Services → Schools → Parks → Yard → Risks-collapsed). Climate risks **collapsed by default** with click-to-expand. **"Right now in your garden" hero** in yard card — current month + zone-specific tip (12 months × 4 zone groups). Parks regrouped: For-kids/For-pet/For-you. Mobile responsive (no horizontal scroll on phones).

### v0.22 — De-duplicate headers + info popovers + compact services
**User pointed out** that the new section headers + inner card headers were redundant.

Removed all inner card headers (`.schools-head`, `.yard-head`, `.parks-head`, `.home-head`, and icon+h3 from each of 4 service cards). Added `.card-context-bar` slim line + `(i)` info-button pattern. Disclaimers (Note: nearest schools…, About speeds…) hidden by default in popovers; click `(i)` to reveal. Compact service cards (saved ~50px each). "Most used in neighborhood" pill on Cable (internet), Streaming (TV), DIY (security).

---

## Side iterations — planning docs

### Tooling, Hosting & Roadmap doc
Satya asked for guidance on UI tools (free + paid), hosting options across phases, and backend requirements per phase. I wrote `HomeAtlas_Tooling_Hosting_Roadmap.md` covering: free options (shadcn/ui, Mantine, DaisyUI, V0, Lovable, Lucide icons), paid options (Tailwind UI $299, templates $149-299), hosting cost roadmap from $0 (now) → $25-30/mo (Phase 4 with auth+DB) → $50-150/mo at scale, full 6-phase roadmap with stack details per phase.

**My single biggest recommendation in that doc:** buy domain now (~$10/yr at Cloudflare Registrar), set up Cloudflare Analytics free, try V0 to preview AI redesign for free.

### Domain names doc
Satya asked for many domain options. I brainstormed ~50 names + checked availability via web search. Key findings: most plain `.com` names are taken or parked (homeatlas.com, homecompass.com on marketplaces; homefile/homestack/myhomeiq/atlasly all active). My top recommendation: **`homeatlas.app`** (~$15/yr, modern TLD, almost certainly available, brand continuity). Backups: `homedossier.com`, `knowmyhome.com`, `homeatlas.io`.

---

## Key technical decisions (don't relitigate)

- **No paid APIs in core flow.** Mapbox/Google/GreatSchools/First Street are premium-tier features for later.
- **Privacy-first.** No accounts, no address storage in v1. Transparent about geocoding traffic going to OSM/Census.
- **Static-only frontend.** Single HTML file, no build step, no framework.
- **Hosting:** Cloudflare Pages free tier indefinitely; small Worker added at Phase 3.
- **Architecture is location-agnostic from day one.** Add a state by adding to STATE_DATA, not by changing the engine.
- **Geocoder chain order:** Photon (fast type-ahead) → Nominatim free-text → Nominatim structured → Census Bureau. Submit-time only for the latter three.
- **Reverse-geocode order:** Nominatim primary → Census reverse fallback → feature properties last resort.
- **Schools = nearest, not assigned.** We're explicit about this. Free attendance-boundary data isn't reliable.
- **Climate risk scores are heuristics.** Honest disclaimer; deep-links to authoritative free sources for exact data.
- **Section headers always pop.** Per v0.21 redesign, every major section has its own colored accent header. No inner card heading repeats it.

---

## Lessons learned (worth preserving)

- **Test the full flow, not just the change.** v0.16 fixed autocomplete but broke reverse-geocode. v0.17 fix introduced another gap that v0.18 had to address. Quick changes near the geocoder chain need integration verification.
- **Respect API policies.** Nominatim's 1-req/sec autocomplete ban is real; violating it gets user IPs soft-blocked. Census doesn't have this issue.
- **Visual refs are different from content specs.** When user shows a screenshot, ASK whether they want the visual style applied to existing content, or whether they want the actual data shown.
- **Less text > more text.** v0.22 collapsed disclaimers behind (i) buttons because users couldn't find the actual info under the noise.
- **Check your section reorder doesn't lose IDs.** v0.21 had two `card-parks` IDs briefly when I moved the parks card without deleting the original.
- **Honest about limits.** OSM has 30-90% US house-number coverage by area. Don't pretend Census Geocoder has 100%. Don't show fake school ratings — link to GreatSchools.

---

## Pending items / open questions

These are NOT in the project brief but worth carrying to the next account:

1. **Footer mailto** still says `CHANGE-ME@example.com` — Satya planned to swap to a personal feedback email (NOT his work `svelivela@paypal.com`) before public launch.
2. **Domain not yet purchased.** Top recommendation `homeatlas.app` (~$15/yr at Cloudflare Registrar). Currently using `homeatlas.satyabhanuv.workers.dev`.
3. **GreatSchools real ratings** considered but deferred (paid API). Alternative: link out per school (current behavior).
4. **Year Built input** saves to localStorage but doesn't yet trigger a "house anatomy" module — that's deferred Phase 2 work.
5. **Eventbrite API key** needed for Phase 3 kids-activities feed — Satya needs to register at eventbrite.com/platform when ready.
6. **No analytics yet.** Recommended Cloudflare Analytics (free) or Plausible ($9/mo) once friends/family start using.
7. **Mobile device testing** — responsive breakpoints written in CSS but not actually tested on real phones. Should be done before public launch.
8. **CCAs only loaded for CA.** NY/NJ/PA have community choice programs too; each is its own research project.
9. **Hawaii zone tropical plants** — added in v0.13 follow-up after Honolulu test came back with 0 plants (now has 10+).
10. **Phoenixville PA / Cast Iron Way address case** — represents the tail of OSM coverage gaps. Census Geocoder fallback (v0.18) handles most but not all.

---

## How to use this document

When resuming HomeAtlas in a different Claude account / session:

1. Read `HomeAtlas_Project_Brief.md` first — that's the daily-driver context (what's shipped, conventions).
2. Reference THIS file when you need historical context (why X was decided, what was tried and rejected).
3. Don't paste this entire history into a chat — it's reference material. The Project Brief is the chat-paste version.

Last updated: 2026-04-30 · v0.22
