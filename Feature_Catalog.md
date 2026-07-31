# Nearnity — Feature Catalog

_What's actually built and shippable, in plain English, organized by user journey. Update after every ship. Read weekly — if you can't explain a feature in 1-2 sentences, spend 5 minutes with it before moving on._

**Current version:** v2.7.7 (pending deploy)

---

## For visitors — family-visit guests

- **Search any US address → one-page brief** — enter an address, get a consolidated page of what's around
- **"I'm a traveler" toggle** in the Safety Guide — reveals tailored ER + urgent care flow
- **Insurance Y/N sub-toggle** — different call scripts and cost-saving paths for insured vs uninsured
- **EMTALA reassurance callout** on ER results — any ER must treat you regardless of insurance/citizenship
- **Charity Care + Patient Advocate + itemized-bill guide** — expandable resource card on ER and Hospitals
- **Walk-in / retail clinic** info surfaced on Primary Care tile — CVS MinuteClinic, Walgreens Healthcare Clinic ($99-$150 flat)
- **HRSA sliding-scale clinic finder** — federally-funded community health centers
- **Post-visit billing guide** — "Never ignore the bill" + how to negotiate, incl. visa-impact warning

## For long-weekend hub travelers _(flagship — most features in-flight)_

- **Search hotel/Airbnb address → what's around** — same one-page brief pattern
- **Nearby ER + hospital + urgent care** — with insurance-aware guidance
- **Parks + national park sections** — OSM + NPS RIDB data
- **Local events** — Ticketmaster + SeatGeek + city iCal feeds
- **Farm experiences** — U-pick, farm fairs, seasonal
- **Farmers markets** — weekly recurring markets by city
- **Climate risk overlay** — FEMA flood, Cal Fire zones, NOAA weather, EPA AirNow
- **Save / star places** — localStorage, no account needed

## For racers / backcountry _(waitlist — content only in Safety Guide)_

- **Remote / national park emergency scenario** — 4-step action card in Safety Guide
- **Roadside crisis scenario** — pull-over + mile marker + 911 flow
- **Helping a remote friend scenario** — non-emergency local dispatch instead of your-tower 911

_Data-heavy racer features (cell coverage, wildfire real-time, satellite SOS, offline cache) are on the v2 waitlist._

---

## Cross-cutting features

### Search & input
- Dual-search: "Looking for" + "Near" — service intent routing + address geocoding
- **Recent addresses dropdown** (last 3) on Near-focus (localStorage-backed)
- **Recent searches dropdown** (last 3) on Looking-For focus
- Custom undo/redo — Cmd+Z survives programmatic input changes (suggestion clicks, chip picks)
- **Intent-first routing** — INTENT_KEYWORDS regex maps queries to the right section
- **Quick-search chips** — Emergency rooms, urgent care, events, farmers market, food bank, library, DMV
- Near-me geolocation button

### Content honesty
- **Assignment-model chips** under every section title — 12-entry registry classifies each service as "Open to anyone" / "Your assignment" / "Choice with constraints"
  - E.g. ER = 🟢 Open to anyone (EMTALA) · Public schools = 🔵 Your district · Urgent care = ⚪ Insurance varies
- **Tooltip explainers** — 1-sentence honest microcopy per chip, tap-to-pin on mobile
- **Source-link tier** — every card labeled with tier: Authoritative (federal) / Public dataset / Community / Third-party
- **No paid placement** — commitment displayed in brand tag

### Data reliability (v2.7.7)
- Schools by **assigned district** (Census geographies → NCES CCD LEA roster) not distance
- Healthcare radius **capped at 16km** to stop Overpass timeouts in Bay Area
- 3-tier Overpass fetch: Worker proxy (4-mirror race + edge cache) → direct browser mirrors → federal fallback (in-flight)
- Universal load guard: 15s soft hint + 45s hard Retry button on every section
- Skeleton loaders on every section during fetch

### Public data sources wired

| Source | Coverage | Section |
|---|---|---|
| OpenStreetMap (Overpass) | Global; density varies | Schools, parks, healthcare, home services, businesses |
| NPPES (CMS NPI Registry) | All US healthcare providers | Doctors, dentists, urgent care (fallback) |
| Medicare Care Compare (CMS) | All US hospitals | Hospitals (fallback) |
| NCES CCD (US Dept of Ed) | All US public schools | Schools |
| Census Geocoder + geographies | All US addresses | Address resolution, school district assignment |
| HRSA Health Center Finder | All FQHCs nationwide | Community health |
| SAMHSA Find Treatment | All US treatment facilities | Community help |
| FEMA NFHL | All US flood zones | Climate risk |
| Cal Fire FHSZ | California only | Fire risk (CA) |
| NOAA / NWS | National | Weather + alerts |
| EPA AirNow | National | Air quality |
| USGS Earthquakes | Global | Seismic alerts |
| Recreation.gov RIDB + NPS API | US federal recreation lands | Parks / national parks |
| Ticketmaster + SeatGeek | Metros; sparse in small cities | Events (ticketed) |
| City iCal feeds | 5 Bay Area cities configured | Events (civic) |
| CSLB (CA Contractors Board) | California only | Home services (CA) |

### Trust + transparency
- **Every card links to its authoritative source** — "Source: HRSA" / "Source: NCES CCD" / "Source: Medicare Care Compare"
- **Coverage disclosure** — HIGH / MEDIUM / LOW badge per address based on data-source density
- **Correction / submit-missing flows** — user can flag wrong data or submit a missing place; writes to KV, emails admin
- **Verify a facility tab** in Safety Guide — links to Medicare Compare, DocInfo, NPPES, SAMHSA, Poison Control

### Feedback loops (v2.7 tester infra)
- **Floating feedback widget** (bottom-right on every page) — structured form, captures page section + search context, writes to KV + emails admin
- **Auto-captured zero-result searches** — silent logging so we know what users searched that returned empty

### Privacy posture
- No accounts, no login
- Saved places stay on user's device (localStorage)
- No third-party tracking, no ads
- Email digest is opt-in only
- Address not stored server-side (worker doesn't persist user-typed addresses)
