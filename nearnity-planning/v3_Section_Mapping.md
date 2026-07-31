# v3 Section Mapping — v2 → v3 port plan

_Written 2026-07-21. Source of truth for what maps to what during the v3 rewrite. Update as sections land._

**Working file:** `/Personal/index_v3.html` (forked from `index_v3_prototype.html` on 2026-07-21).
**Prototype:** `/Personal/index_v3_prototype.html` (Jun 25, DO NOT EDIT — reference only).
**Production v2:** `/Personal/index.html` (v2.8.2a currently on nearnity.com, keeps serving live traffic until v3 ready).

---

## v3 layout inventory (what the prototype gives us)

```
911 emergency strip (top)
  ├─ 911 · 988 · 211 chips

Site header
  ├─ Brand logo + wordmark
  └─ About · How it works nav

Hero
  ├─ H1 + lead
  ├─ 2 primary CTA cards ("Urgent care nearest me", "This weekend events")
  ├─ Search bar (Looking-for + Near-address 2-field form)
  └─ 7 quick-chip shortcuts

Shell (grid: sidebar 260px + content flex)
  ├─ Sidebar cat-tabs:
  │   1. Around me  (default)
  │   2. My home
  │   3. Help
  │   4. Govt functions
  │   5. Emergency
  │   6. Saved
  └─ Content:
      ├─ Content-header (h2 + description)
      ├─ Address bar (📍 chip strip: coverage, electric, schools, climate)
      ├─ Subnav (per cat-tab; Around me shows Events/Businesses/Schools/Parks)
      └─ Results grid (auto-fit cards, one per row on mobile)

Card component (5 tiers via border-color)
  ├─ Teal    → Federal source        (--tier-authoritative)
  ├─ Indigo  → Public dataset        (--tier-public)
  ├─ Coral   → Community-reviewed    (--tier-community)
  ├─ Slate   → Third-party linked    (--tier-third-party)
  └─ Red     → Active alert          (--tier-emergency)

Tier color legend
Privacy summary (collapsed <details>)
Footer + FAB feedback button
```

---

## v2 → v3 mapping

### Cat-tab 1: Around me (default)
Subnav: Events · Local businesses · Schools · Parks & rec

| Subnav slot | v2 rendering function | v2 API path used | Card tier |
|---|---|---|---|
| Events | `renderEventsListings(geo, arg)` — merges curated + `/api/events` + farm + `/api/events-radius` | `/api/events-radius` (v2.7.13) + `/api/events` + `/api/farm-experiences` | Public + Third-party (Ticketmaster=Slate) |
| Local businesses | `renderLocalBusinesses(geo)` via Overpass | `/api/overpass` | Third-party (OSM) |
| Schools | `loadNearbySchools(geo)` — NCES district + SABS assigned + OSM | `/api/school-zone` + `/api/school-assignment` (v2.8.2a) | Federal (NCES) + Public (OSM) |
| Parks & rec | `renderParks(geo)` — OSM + NPS + RIDB | `/api/parks-nps` + `/api/recreation` + Overpass | Federal (NPS/RIDB) + Public (OSM) |

### Cat-tab 2: My home
Subnav: Utilities · Trash & recycling · Weather & risk · Home services

| Subnav slot | v2 rendering function | v2 API path used | Card tier |
|---|---|---|---|
| Utilities | `renderUtilities(geo)` — HIFLD electric provider | `/api/electric-hifld` | Federal |
| Trash & recycling | curated per-city hauler | (curated only, no API) | Public |
| Weather & risk | `renderRiskCards(geo)` — AirNow AQI + NWS alerts + USGS quakes | `/api/aqi` + `/api/alerts` + `/api/quakes` | Federal |
| Home services | `renderHomeServices(geo)` — CSLB + curated + OSM | `/api/cslb` + Overpass | Federal + Public |

### Cat-tab 3: Help
Subnav: Food resources · Free/low-cost health · Housing · Family/child services · Legal aid

| Subnav slot | v2 rendering function | v2 API path used | Card tier |
|---|---|---|---|
| Food resources | curated food-bank list + SAMHSA overlap | curated + `/api/samhsa` | Community + Federal |
| Free/low-cost health | HRSA HDCC + SAMHSA + NPPES sliding-scale filter | `/api/nppes` (income) + `/api/samhsa` | Federal |
| Housing | curated shelter + HUD data | curated (2026-launch scope) | Community |
| Family/child services | curated + WIC + state DSS | curated (2026-launch scope) | Community |
| Legal aid | curated by county | curated | Community |

### Cat-tab 4: Govt functions
Subnav: Elected officials · DMV / vehicle · Court / civic · Voting

| Subnav slot | v2 rendering function | v2 API path used | Card tier |
|---|---|---|---|
| Elected officials | Google Civic API OR curated | curated (Google Civic sunset) | Federal |
| DMV / vehicle | curated per-state | curated | Federal |
| Court / civic | curated per-county | curated | Federal |
| Voting | vote.org API or curated | curated | Federal |

### Cat-tab 5: Emergency
Subnav: Hospitals · Urgent care · Fire station · Poison control · Alerts

| Subnav slot | v2 rendering function | v2 API path used | Card tier |
|---|---|---|---|
| Hospitals | `fetchFederalMedicalDiag(geo, "hospital")` — v2.7.9 KV pipeline | `/api/medical-radius?taxonomy=hospital` | Federal (teal) |
| Urgent care | `fetchFederalMedicalDiag(geo, "urgent")` | `/api/medical-radius?taxonomy=urgent` | Federal |
| Fire station | Overpass query | `/api/overpass` | Public |
| Poison control | Static number: 1-800-222-1222 | (no API) | Emergency (red) |
| Alerts | `renderRiskCards(geo)` — NWS active alerts | `/api/alerts` | Emergency (red) |

### Cat-tab 6: Saved
Local storage of saved cards. No API. Loads from `localStorage` key `nearnity-saved-v3`.

---

## v3 needs that DON'T exist in prototype (must add during port)

The Jun 25 prototype is UI-only. These functional pieces from v2 have to be reintroduced in v3:

1. **Leaflet map** per section (v2 has `setupSectionMap`) — v3 prototype shows cards-only, no map. Decision needed: add map back per subnav (my recommendation) OR keep v3 cards-only and defer maps to v3.1?
2. **Radius slider** (v2 has `CURRENT_RADIUS_MI` global + `TIER_CAPS`) — v3 has no radius control. Same decision.
3. **Section split-by-category subtabs** (v2 hospitals splits into ER/Urgent/Hospital; parks splits into Park/Playground/Trail) — v3's flat subnav doesn't support 2-level.
4. **Info popovers** (v2 has ⓘ button on every section header) — v3 has none.
5. **Search-never-fails anchor cards** (v2 shows "🚑 Call 911 + Google Maps" on empty ER results) — v3 prototype doesn't cover empty states.
6. **Correction flow** (v2 has `/api/correction`) — v3 prototype has "⚠ Report" links on every card but no form.
7. **Submit event flow** (v2 has `/api/submit-event`) — v3 prototype has FAB feedback button but no form.
8. **Saved trips (localStorage)** (v2 has multi-address trip planner) — v3 has "Saved" cat-tab but empty.
9. **Language-of-care filter** (Tier 1 launch: NPPES by taxonomy) — v3 has no filter chips.
10. **Assignment-model chips** (v2 has open/assigned/choice classification) — v3 hides this on cards.

---

## Port sequencing (Phase 3 detail)

Ranked by launch-blocking priority (Tier 1 from `project_nearnity_launch_tiers`):

1. **Emergency cat-tab** (Hospitals + Urgent care + Fire + Alerts) — Tier 1 launch requirement. Needs medical-radius wired. ~4 hrs.
2. **Around me → Events subnav** — Tier 1 retention driver. Needs events-radius + curated + farm. ~3 hrs.
3. **Around me → Schools subnav** — Tier 1. Needs school-zone + SABS. Trust color = teal only if `_sabs_assigned:true`. ~2 hrs.
4. **Around me → Parks & rec subnav** — Tier 1. Needs NPS + Overpass. ~2 hrs.
5. **My home → Weather & risk** — Emergency-critical, worth Tier 1 slot. ~2 hrs.
6. **All other subnavs** — Tier 2, defer to post-launch.

**Phase 4 (maps + rendering):** if we decide to add maps, they slot into each section as ~40 lines of Leaflet setup. Or defer to v3.1.

**Phase 5 (polish):** mobile, empty states, correction/submit forms, saved-trips localStorage.

---

## Open decisions (need Satya input)

**D1. Maps in v3?**
- Option A: Add Leaflet back to each section (mirror v2 experience)
- Option B: v3 launches as cards-only, maps come as v3.1 (faster launch, but reduces spatial context)

**D2. Section subtabs (2-level nav)?**
- Option A: Extend v3 subnav to support 2 levels (e.g., Emergency → ER/Urgent/Hospital)
- Option B: Split each 2-level v2 section into flat v3 subnav entries (more subnav clutter but simpler code)

**D3. Search-never-fails anchor?**
- v2 always shows a "call 911 + Google Maps" card even when data missing. Should v3 mirror this or trust the tier legend + empty state?

**D4. Ship threshold?**
- Full port before switch = safe, slower
- Cutover per cat-tab (e.g., ship Emergency in v3, keep others in v2) = phased rollout, requires 2 URLs
- Big-bang launch on Sep 15 = higher risk, cleaner UX story
