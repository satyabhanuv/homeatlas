# Nearnity — Founder Notes

_Strategic decisions, pivots, working rhythm. Update at every strategic inflection point. Keep prose brief — investor-readable, no war stories._

---

## Positioning (as of 2026-06-30)

**One-liner:** *Nearnity — one clean page for wherever you're staying. Honest, source-linked, no paid placement.*

**Primary niche:** Traveler-focused, three sub-personas
1. **Long-weekend hub travelers** — flagship. National parks, theme parks, tourist metros. Drive 4-8hr to a hub, spend 3-7 days.
2. **Family-visit guests** — built-in via existing traveler + insurance toggles. Visiting relatives for 2-6 weeks.
3. **Racers / day-packers / backcountry** — waitlist. Founder's own niche, but hardest data-coverage problem, deferred to v2.

**Explicitly NOT the niche (rejected):**
- Emergency-first — bad retention (one crisis = one-and-done), zero error tolerance, no word-of-mouth
- Residents / homebuyers — competes head-on with Zillow / Google Maps / Nextdoor without clear wedge
- Universal "everyone" — dilutes positioning, exceeds solo-founder marketing bandwidth

---

## Why the sequencing works

- Hub travelers have **high retention** (3-10 trips/year, always a new location)
- Word-of-mouth is **social** — families plan trips together, share tools
- Coverage is **concentrated** at 40ish hub destinations, achievable by solo founder
- Failure mode is **annoyance, not danger** — one missing pin doesn't kill trust
- Family-visit guests are **served free** by same product + insurance toggle
- Racer waitlist **captures the founder's own tribe** without launch dependency

---

## Key decisions log

| Date | Decision | Reason |
|---|---|---|
| 2026-07-08 | **DECIDED (form-factor split):** 3-mode selector (Emergency / Events / Home) is a MOBILE-APP UX pattern only. Web stays a comprehensive directory with a v3 cleanup pass — sections visible + grouped, not gated. Same backend, two presentation surfaces. Full detail in `Research_3Mode_Product_Split.md`. | Web usage = casual research (comprehensive directory serves it). App usage = urgent-needs pressure decisions (mode picker cuts time-to-answer). Different form factors, different UX. |
| 2026-07-08 | Committed to KV storage (not D1) for pre-geocoded medical index in v2.7.9. Simple get/put by state, ~10ms reads, plenty within free tier. | Level 4 architecture (radius search via haversine on pre-geocoded arrays) chosen over city-based (fails at boundaries) or client-time geocoding (latency). KV is the simplest fit; migrate to D1 later only if cross-state radius needs spatial indexing. |
| 2026-07-08 | Rolled back v2.7.8.5 city-based filtering. Boundary failures + national-scale infeasibility called out by Satya. Interim behavior = v2.7.8.4 (ZIP→state fallback for Medicare, NPPES 400 fix). Real fix = v2.7.9. | City filter picks San Jose but misses Santa Clara side of the street. Manual NEARBY_METRO map for 500+ US metros is unsustainable. |
| 2026-07-07 | Committed to 5-tier public-data model. Zero paid APIs, zero Google Places, zero Yelp. All sources federal / state / county / city / nonprofit-directory. | July 4 weekend testing exposed hyper-local data gaps (Oakland Zoo, Mission Peak, local fireworks, hospitals near Oakland). Google would have fixed it fast but diluted the source-linked-free positioning. Aggregating public data ourselves IS the moat — nobody else has done it because it's boring engineering, no ad inventory in it. |
| 2026-07-07 | Launch confirmed Sep 15, 2026 (buffer Sep 29). July 13 target officially killed. | 5-tier data layer needs ~5-10 focused weeks. Sep 15 = 10 weeks out at sustainable pace. |
| 2026-07-07 | Adapter sequencing: Tier 1 (federal wiring completion) → Tier 2 (state parks incl. CA regional districts) → Tier 4 (institutional AZA/AAM/IMLS) → Tier 3 (top-25 metros). | Ranked by population coverage per hour of engineering AND by flagship traveler persona (national parks + zoos + tourist metros served earliest). |
| 2026-07-07 | v2.7.7 is the last v2.x release with new UI features. v2.7.8+ ships data-layer only. | Consolidate all UI investment into v3 rectangle shell; avoid throwaway work. |
| 2026-06-30 | Split Cowork sessions: this session = strategy only, other = code/QA | Prevent context pollution; enable investor-ready docs |
| 2026-06-30 | Traveler niche over resident/planning niche | Retention math: hub travelers repeat 3-10x/yr, residents don't |
| 2026-06-30 | v3-first launch (no v2.x public launch) | v2 launch → UI feedback noise → panic v3 rebuild → burnout |
| 2026-06-30 | September 2026 target public launch (Sep 15, buffer to Sep 29) | 10-week timeline at sustainable pace; fits ambition without burnout |
| 2026-06-30 | Bay Area + California first, expanding US | Data coverage + marketing surface + support-load reality for solo founder |
| 2026-06-30 | Racer features → v2 waitlist, not launch scope | Safety-critical failure mode + poor OSM coverage in remote areas |
| 2026-06-25 | Committed to v3 rectangle-layout redesign as future baseline | Airbnb-warm aesthetic; sidebar+subnav+results structure; Satya loved prototype |
| 2026-06-25 | v2.x UI patches pushed back; only cross-version data/reliability fixes ship | Avoid throwaway work; v3 will restyle everything |
| 2026-06-24 | Trust-tier chip palette: Teal / Indigo / Coral / Slate + Emergency red | Modern, not govt-portal look, honest source classification |
| 2026-06-17 | Intent-first search routing (query → section) | Users think in services, not sections |
| 2026-05-29 | Soft launch completed | Handful of testers; feedback loop wired |
| 2026-05 | Renamed HomeAtlas → Nearnity | Domain, LLC name, trademark clearance |

---

## Working rhythm

### Per-feature cycle (2-4 hr session)
1. Claude codes, Satya reviews as we go
2. Deploy to Cloudflare Pages preview URL
3. Satya QAs on laptop + phone across 3 pre-picked test addresses
4. Pass: update Feature_Catalog.md + Roadmap_Checklist.md; read the updated entry aloud
5. Fail: fix immediately, never move on with broken code

### Weekly rhythm
- Mon-Thu evenings: build 1 small feature per night (2-3 hr each)
- Fri: no new code. Full regression pass across everything shipped that week, on mobile too.
- Sat: bigger feature (4-8 hr). Same tight cycle.
- Sun: catalog review + next-week plan + rest.

### Monthly rhythm
- Last day of each month: 15-min "elevator pitch" test — explain every Nearnity feature to a friend, timed. Stumble on any feature = go relearn or cut it.

---

## Pivots

- **HomeAtlas → Nearnity** (name change, May 2026) — HomeAtlas suggested property/real estate; Nearnity emphasizes proximity + community
- **Emergency-first → Traveler-first** (Jun 30, 2026) — retention math forced the rethink; emergency stays as a supporting feature not the anchor
- **Distance-based schools → District-based schools** (Jun 25, 2026) — Census geographies + NCES CCD gives assigned-district roster instead of nearest-by-mile
- **v2.x public launch → v3-first public launch** (Jun 30, 2026) — chose to defer 6 weeks rather than launch on foundation that gets rebuilt

---

## Open strategic questions (not yet decided)

- **Monetization** — free for now, no paid placement is a hard rule. Options later: donations, B2B licensing to travel agencies / relocation firms, embedded widget for realtors. NOT ads, NOT paid placement, NOT selling user data.
- **App store strategy** — PWA first (Sep launch), Capacitor iOS/Android in October. Full native (React Native / Flutter) only after clear PMF.
- **International expansion** — deferred. US-only through 2027 minimum. Non-US would require full rewrite of data sources.
- **Co-founder / hire** — solo through launch. Consider bringing in a marketing partner post-launch if traction supports it.

---

## Metrics to watch at launch

Pre-defined so we don't kid ourselves later:
- **Week 1**: 100 unique addresses searched
- **Week 4**: 1,000 unique addresses; 20% return rate (users coming back within 30 days)
- **Month 3**: 5,000 unique addresses; 100 "save trip" localStorage entries recorded; 50 pieces of feedback via widget
- **Month 6**: 20% of traffic from organic (Reddit / referral / SEO), not paid
- **Kill signal**: If Month 3 shows <5% return rate → the product isn't sticky; pivot the niche again

---

## For future investor conversations

**One-line pitch:** Nearnity turns any US address into a source-linked page of what's around, engineered for travelers who want honest answers without ads or accounts.

**What's uniquely defensible:**
1. Assignment-model chips — honest classification of every service's relationship to a user's address (open / assigned / choice). No competitor does this.
2. Federal data layered as authoritative fallback below OSM — reliability where crowdsourced maps thin out.
3. Traveler-context toggle (resident/traveler + insurance Y/N) with actual call-scripts, not just links.
4. No accounts, no tracking, no paid placement — verifiable via inspecting the code (open-source-ish).

**What's not defensible (and we know it):**
- Data sources are all public — anyone can rebuild
- The moat is UX + integration + trust posture, not proprietary data
- Success depends on retention + word-of-mouth from a focused persona, not tech innovation
