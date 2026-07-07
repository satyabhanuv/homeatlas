# Nearnity — Session Summary, 2026-07-07

_What was discussed, what options were on the table, what got decided, and the timeline out from here. Kept plain — this is the bookkeeping ledger, not a strategy essay._

---

## Context walking in

- v2.7.4 → v2.7.7 all deployed to production the week of Jun 25 (search-input undo/paste + recent-history, ER + Hospitals resource callouts with Charity Care / Patient Advocate / 211 / HRSA / 988, Safety Guide audience toggle Resident/Traveler + insurance branch, walk-in clinic added, schools zoning via Census + NCES, schools map fit-to-top-N zoom, healthcare radius cap).
- **Current production version: v2.7.7** (live on nearnity.com the week of Jun 25).
- Satya used the July 4 long weekend as the extended real-usage test window against production.
- Today's session (2026-07-07) is the QA debrief for the holiday-window test.
- All four holiday tests failed:
  1. Fireworks — only the San Jose Discovery Meadow seed showed; 0.5-mile local fireworks event visible on Instagram / school WhatsApp not in Nearnity.
  2. Oakland Zoo — no result at all. Not in event data, not in parks data, not in venues.
  3. Hospitals + urgent care near Oakland while driving — "Searching…" hang / no matches, even though v2.7.7 was live with the healthcare radius cap.
  4. Mission Peak (regional preserve) — never surfaced; Yosemite (4hr drive) shown instead as "worth the drive."

---

## The honest diagnosis

The v2.7.7 radius cap was a partial fix — one leg of a three-legged stool. Even where the cap held, Overpass public mirrors were holiday-overloaded. But the deeper problem is not Overpass reliability. It's that Nearnity's data layer is composed of federal + OSM + curated seeds — that combination cannot answer hyper-local questions like *"what's happening at the park 0.5 miles from my house on July 4th"* or *"when does Oakland Zoo open."*

Root causes per failure:

| Failure | Root cause |
|---|---|
| Fireworks (1 of many) | v2.7.1 seed under-covered South Bay. No aggregator crawls per-city rec calendars. |
| Oakland Zoo | Zoos not in Nearnity's data model. Not queried in parks / venues / events. |
| Hospitals near Oakland | Overpass timeout AND no federal fallback wired (Medicare + NPPES endpoints exist in the Worker but never called from frontend). |
| Mission Peak vs. Yosemite | NPS returns only National Parks. Regional parks come from OSM but aren't classified/promoted. Result: correct-but-useless federal data drowns out actually-nearby regional parks. |

---

## Options presented + rejected

**A. Buy Google Places API** — ~$200/mo above free tier. Solves all four failures in one integration.
- **Rejected by founder.** Reasons: (1) dilutes the "source-linked free public data" positioning, (2) if the user could just use Google Maps, Nearnity is redundant, (3) fireworks / zoos / parks / events all have public data at the city / county / state / federal / institutional level — the correct answer is to aggregate that data, not to relay Google.

**B. Ship narrow product** — kill events + attractions from V1; ship only schools + utilities + climate + civic. Ship this to friends this week.
- **Rejected by founder.** Reasons: (1) narrow product doesn't match the traveler persona (hub travelers need parks + attractions + events, not just civic data), (2) undermines pre-committed positioning of "one page for wherever you are."

**C. Build the public-data aggregation layer ourselves — 5-tier data model** — sequence federal → state → metro → institutional → community capture. Zero paid APIs. Zero Google. Every source cited.
- **✅ SELECTED.** Reasons: (1) aligns with brand promise ("source-linked, free, no paid placement"), (2) creates a real moat — nobody has aggregated this data because it's boring engineering work, (3) works better in rural + park-heavy states than Google actually does, (4) fits Sep 15 launch timeline per Founder Notes.

---

## Decisions finalized this session

1. **Data strategy: 5-tier public-data model.** No Google Places. No Yelp. No paid APIs. All sources federal / state / county / city / nonprofit-directory.
2. **Launch date confirmed: September 15, 2026** (with Sep 29 buffer). The July 13 target was already softened in Founder Notes on 2026-06-30 → confirmed today with data-layer buildout justification.
3. **Persona alignment stays** — three personas from 2026-06-30 planning session are unchanged:
   - **Long-weekend hub travelers** (flagship — Yellowstone, Vegas, Anaheim, Orlando, San Diego, Bay Area, etc.)
   - **Family-visit guests** (built-in via existing traveler + insurance toggles, language-of-care filter, cultural grocery finder)
   - **Racers / backcountry / day-packers** (waitlist for launch, full features in V2)
4. **v2.7.7 is the last v2.x release with new features.** v2.7.8+ is data-layer only, all cross-version reusable. v3 rectangle layout ships as the launch shell.
5. **Sprint sequencing: Tier 1 (federal wiring + fallback) first, then Tier 2 (state parks), then Institutional (zoos/museums), then Tier 3 (metro-level) last.** This orders work by highest population coverage per hour of engineering, which also happens to serve the flagship traveler persona first (federal covers national parks, state covers CA hubs, institutional covers zoos + museums, metro covers tourist cities).

---

## The 5-Tier Data Model — what it means

Full definitions in `Nearnity_Architecture_Block_View.md` (updated this session). Summary:

| Tier | What it is | # of adapters | US population served |
|---|---|---|---|
| 1. Federal | HRSA, NPPES, Medicare, NCES, NPS, Rec.gov, USFS, BLM, Census, USDA, FEMA, NOAA, EPA, USGS, USPS, FCC | ~17 | 100% (baseline for every address) |
| 2. State | State park systems + state open-data portals (50 adapters, one per state) | 50 | 100% at state granularity |
| 3. Metro | Top 25 US metros (~40% pop) then top 75 (~55% pop) | 25 → 75 | 40% → 55% |
| 4. Institutional | AZA, AAM, USDA APHIS, IMLS, state library directories | ~8 | Category-complete nationwide (zoos, museums, libraries) |
| 5. Community capture | v0.92 framework already built; users submit; we moderate | ongoing | Long-tail fill-in |

Key insight from today: rural / park-heavy states (WY, MT, ID, AK) get excellent coverage from Tier 1 + institutional alone. High-city-count states (TX with 254 counties, Arkansas) get good coverage from Tier 1 + Tier 2 + top-metro Tier 3. **Linear "50 cities per state × 50 states" is not the plan.** Diminishing returns kick in hard after ~100 metros; community capture handles the tail.

---

## Timeline out from 2026-07-07 → 2026-09-15 (10 weeks)

Aligned with existing Roadmap_Checklist phases:

| Weeks | Phase | Deliverable |
|---|---|---|
| Jul 7 - Jul 14 | Phase A + Tier 1 finish | Federal medical fallback wired. All Tier 1 adapters exercised in v3 shell. Search-never-fails harness first pass. |
| Jul 15 - Jul 28 | Phase B + Tier 2 | v3 data-wiring complete. State parks: CA (280 parks), UT, CO, FL, AZ, WY, MT, TX, NY. Tourist-mode auto-hide. |
| Jul 29 - Aug 11 | Phase C + Tier 4 | PWA offline mode. AZA (240 zoos), AAM (4,500 museums), IMLS, USDA APHIS wired. Capacitor iOS shell started. |
| Aug 12 - Aug 25 | Phase D + Tier 3 | Top 25 US metros — city rec calendars + business licenses via existing v0.92 adapter framework. Cross-country coverage QA. |
| Aug 26 - Sep 8 | Phase E prep | Landing pages per persona. Reddit + IG drafts. Demo video. Uptime monitoring. |
| Sep 9 - Sep 15 | Launch execution | Final QA sweep across 20 fixture addresses. Ship. |

---

## Immediate next actions

**Status check (nothing pending for founder on deploy front):**
- ✅ v2.7.4–v2.7.7 shipped week of Jun 25. Production is at v2.7.7.
- ✅ Holiday QA window (Jul 3–6) completed. Outcomes captured in this document.
- ✅ Strategic decisions made this session (5-tier data, Sep 15 launch confirmed, no Google Places).

**Founder (open items, not new work from this session):**
1. File CA LLC + EIN + business bank (post-MLO exam — carried over from Roadmap Phase F).
2. Confirm no Google Places integration in future planning conversations (recorded in auto-memory).

**Code sprint kicks off in the OTHER Cowork session — Phase A (per Roadmap):**
- Session split rule stands: this strategy session logs decisions, the code session executes.
- Phase A carries the Tier 1 completion work directly:
  1. Wire Medicare + NPPES + HRSA federal endpoints into `loadNearbyPublicServices` fallback (fixes hospitals/ER/urgent care empty state).
  2. Add BLM + USFS adapters to complete Tier 1.
  3. Search-never-fails harness: permanent "🚑 Call 911 + Google Maps deep link" anchor card on any empty emergency state.
  4. v3 Phase 2 data wiring — port v2.x data logic into `index_v3_prototype.html` rectangle layout (in parallel).
  5. Bump to v2.7.8 (first release of data-layer buildout).
- After Tier 1: Phase B / Tier 2 (state parks + CA regional districts) → fixes Mission Peak.
- Then Tier 4 institutional (AZA/AAM) → fixes Oakland Zoo.

**Docs updated this session:**
- ✅ `Nearnity_Session_2026-07-07_Summary.md` (this file — new)
- ✅ `Nearnity_Architecture_Block_View.md` — added 5-tier section
- ✅ `nearnity-planning/Founder_Notes.md` — new decision row
- ✅ `nearnity-planning/Roadmap_Checklist.md` — Phase D enriched with per-tier adapter list
- ✅ Auto-memory — 5-tier commitment + traveler persona alignment recorded

---

## What we did NOT decide today (intentionally deferred)

- Which specific Bay Area address becomes the QA anchor for tier validation. Options: 1757 Horner Way (Fremont — used in v2.7.2), 401 Ellicott Loop (San Jose — used in v2.7.7), Satya's actual home. Deferred to next code session.
- Whether the v3 rectangle layout gets QA'd in Bay Area first before national rollout. Assumed yes; will formalize when v3 Phase 2 wiring begins.
- Marketing niche wedge language ("national parks hub travel guide" vs "wherever you're staying"). Deferred to Phase E landing page work.

---

## Sources cited today (all free, all public)

Federal: hrsa.gov/apis · npiregistry.cms.hhs.gov · data.cms.gov · nces.ed.gov · nps.gov/apps · ridb.recreation.gov · fs.usda.gov · blm.gov/apps · census.gov · usda.gov · fema.gov · noaa.gov · epa.gov · usgs.gov · usps.com · fcc.gov · irs.gov (§501(r)) · cms.gov (EMTALA)

State (Bay Area subset): data.ca.gov · ebparks.org · sccgov.org/sites/parks · openspace.org · marincountyparks.org

Institutional: aza.org · aamd.org · imls.gov · aphis.usda.gov · patientadvocate.org · 211.org · 988lifeline.org

Every source is either (a) an act of Congress, (b) a state or county open-data portal, or (c) a nonprofit federally-accredited directory. Zero paid, zero Google.
