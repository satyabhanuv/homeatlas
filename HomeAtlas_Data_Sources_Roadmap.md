# HomeAtlas — Free Public Data Sources Roadmap

A catalog of free, public, structured information that residents currently have to hunt for across Google, Yelp, city websites, and 47 random tabs. Each source is graded by effort to integrate vs. user-impact, with a recommended sequence for the next 3–5 iterations.

---

## Why this matters

HomeAtlas's value proposition is "structured public/owner-approved information that today takes 47 tabs and 3 logins to find." We can only deliver on that if we aggregate broadly and credibly. The map is:

- **Comprehensive aggregation of free sources** → trust + competing with Google
- **Curated quality tiers** → signal what's verified vs. community-edited vs. fallback
- **Honest escape hatches** to Google/Yelp for the long tail → don't lose users who need exhaustive search

This doc maps the free-source landscape so we can sequence integrations by leverage.

---

## Source matrix

Format: **Source** — what it unlocks · auth required? · coverage · effort

### Tier 1 — ship next (highest leverage, low-medium effort)

| Source | What it gives us | Auth | Coverage | Effort |
|---|---|---|---|---|
| **USDA Local Food Directory** (`usdalocalfoodportal.com`) | ~8,000 USDA-registered farmers markets with lat/lon, hours, products, EBT/WIC eligibility. Plus food hubs, on-farm stores, CSA programs. | Free API key | US nationwide | 1–2 days |
| **211 / Findhelp** (`api.211.org` or aiUnited Way) | Social services: food pantries, homeless shelters, utility assistance, free clinics, addiction recovery, domestic-violence resources, senior support, free tax help (VITA). The single biggest "I didn't know this existed" surface. | Free API key | US nationwide (state coverage varies) | 2–3 days |
| **HRSA Find a Health Center** (`findahealthcenter.hrsa.gov/api`) | Federally Qualified Health Centers — free / sliding-scale primary care, dental, mental health. Massively underused. | None / public JSON | US nationwide | 1 day |
| **Google Civic Information API** | Elected officials at federal/state/local, polling locations, voter registration URLs. We already have placeholders for this in the Civic tab. | Free API key | US | 1 day |
| **GTFS public transit feeds** (`transit.land`) | Every US transit agency publishes free schedule + stop data. Lets us answer "what bus/train serves my house?" | None / public | US (most agencies) | 2–3 days |
| **Library LibCal feeds** | Storytimes, author events, computer classes, tax help, ESL classes, makerspace hours. Already prototyped in v0.37 scraper. | None / public iCal | Wherever a library uses LibCal/BiblioCommons (most US public libraries) | 1 day (scraper exists) |

### Tier 2 — second wave (medium effort, strong narrative wins)

| Source | What it gives us | Auth | Coverage | Effort |
|---|---|---|---|---|
| **SAMHSA Mental Health Treatment Locator** | Find substance abuse + mental health facilities by service type, insurance, sliding scale. | Public API | US nationwide | 1–2 days |
| **NPI Registry** (`npiregistry.cms.hhs.gov`) | Look up any healthcare provider — name, address, specialty, accepting Medicare. | None | US nationwide | 1 day |
| **CMS Hospital Compare** | Hospital quality ratings, infection rates, patient experience, mortality. | Public CSV/API | US | 1–2 days |
| **VA Facility Locator** | Medical, benefits, cemetery facilities for veterans. | Free API | US | 1 day |
| **HHS Find Local Help** | ACA insurance enrollment assisters near me. | None | US | 1 day |
| **WIC clinic locator** (state DOH APIs) | Free formula, food vouchers, prenatal care for low-income families. | Varies by state | US (state-by-state) | 2–4 days |
| **State agricultural depts** (CDFA, etc.) | Certified farmers markets, agritourism, CSA registries — fills USDA gaps. | Free CSV/PDF | State-specific | 1 day per state |
| **Cooperative Extension office finder** (USDA NIFA) | Master gardener help, 4-H, agricultural advice, food preservation classes. County-level free expertise. | Public | US | 1 day |
| **Aggregator scraping** — CFMA, Foodwise, WCFMA | More farmers markets the USDA + PCFMA scrape misses. | None / public sites | Bay Area | 1 day per aggregator |
| **NPS / state park APIs** | Trails, ranger programs, campsites, fees. NPS has a free API. | NPS: free key; state: varies | US | 2 days |

### Tier 3 — long tail (lower priority but still useful)

| Source | What it gives us | Auth |
|---|---|---|
| **FNS SNAP retailer locator** | Stores that accept EBT — visible in maps with a badge | Public CSV |
| **Federal Register / Regulations.gov** | Open comment periods that affect your area (rezoning, EPA, etc.) | Public API |
| **City open-data portals** (DataSF, NYC OD, Chicago OD, etc.) | Per-city specifics: noise complaints, restaurant inspections, building permits, tree census. | Per-city, mostly free |
| **City council agendas + iCal** | Upcoming votes, hearings, public input opportunities. | Per-city |
| **HUD Section 8 / subsidized housing** | Find affordable housing units. | Public | 
| **AED / defibrillator locators** | Where to find an AED in an emergency. | Varies | 
| **Goodwill / Salvation Army / Habitat ReStore** | Donation drop-offs, second-hand stores. | Public site lists |
| **Bike-share station APIs** | Real-time station availability. GBFS standard. | Public | 
| **Sex offender registry** (state-by-state) | Required by law in most states; some have public APIs. | Per-state |
| **OpenStates API** | State legislators + bills affecting your district. | Free API |

### What we're explicitly *not* doing for V1

Paid or restrictive APIs — kept out of V1 because they break the freemium promise:

- **Google Places API** — $0.017/query, $50–500/month at modest traffic. Revisit when monetizing.
- **Yelp Fusion** — ToS forbids caching outside Yelp branding. Useless for what we want to do.
- **Foursquare Places** — similar restrictions.
- **Eventbrite / Meetup / Facebook Events** — 3rd-party APIs all sunset since 2018–2020. We use public deep-links as fallback (already done).

---

## Recommended sequence

### v0.42 — Public services trust upgrade (1–2 weeks)

The single highest-impact set of additions. Plug three Tier-1 sources that fundamentally change what HomeAtlas is for:

1. **USDA Local Food Directory** integration → 10–20× the farmers market coverage, plus food hubs + on-farm stores. Direct continuation of v0.40–0.41.
2. **211 / Findhelp** integration → adds a whole new section: **Community help** (food pantries, utility assistance, free clinics, free tax help, homeless services, domestic-violence resources). This is the *biggest* surface where users currently have to "goose hunt." Most residents don't know 211 exists.
3. **HRSA Health Centers** + **SAMHSA Mental Health** → adds Free clinics + Mental health to Public services or a new Health tab.

Why this set first: each is one API integration with massive surface area. Combined, they answer questions users currently search Google for like "free clinic near me", "food pantry near me", "rent assistance near me", "mental health crisis line near me" — and almost no aggregator handles all of them well.

### v0.43 — Civic substance (1 week)

1. **Google Civic Information API** → real elected officials by address (currently we only have voter-registration deep-links). Adds the most-asked civic question: "Who represents me?"
2. **OpenStates API** → state legislators + active bills.
3. **City council agenda scraping** for the top-10 cities — RSS/iCal where available.

### v0.44 — Transit + transportation (1 week)

1. **GTFS aggregation** via Transit.land → bus/train stops near me, with next-departure times if real-time available.
2. **Bike-share GBFS** for cities that have it.

### v0.45 — Healthcare deepening (1 week)

1. **NPI Registry** → find a doctor by specialty.
2. **CMS Hospital Compare** → hospital quality ratings on existing hospital entries.
3. **VA Facility Locator** → veterans' services.

### v0.46 — Quality-tier system (1 week)

Once we have multiple sources per category, add the badge UI:

- ✓ **Verified** — USDA / state / CMS / SAMHSA / aggregator
- 🔵 **OSM** — community-edited
- ⚫ **Yelp/Google fallback** — broad, displayed only as deep-link

Plus a "Source" filter on every subtab so users can sort/hide by trust.

---

## Implementation patterns we already have to reuse

- **Scraper pipeline** (`scraper/scrape_events.py`) — adapter-per-source. Already handles iCal (LibCal) and HTML (BiblioCommons, CivicPlus). Add a JSON-API adapter for USDA + HRSA + 211.
- **ZIP → cities map** + multi-source candidate resolution (v0.39).
- **Runtime recurrence expander** (v0.40) — reuse for any weekly/monthly source.
- **OSM-shape normalization** (v0.40.1) — drop new sources into existing subtabs without writing a custom row renderer.
- **Sparse-results CTA** (v0.41) — pattern to apply across every subtab.

---

## Open questions for V1 launch (June 2)

1. **Do we want a separate "Community help" top-level section** or fold it into Public services? My vote: separate section. The 211 surface is too important to bury inside Emergency/DMV.
2. **Health information** — should we add a "Health" top-level section (free clinics, hospitals, mental health, doctors) or keep it under Public services? Probably a separate section once we have enough.
3. **API key management** — USDA, 211, Google Civic all require free signups. For V1 we can embed keys in `homeatlas.html` (low risk, all free tier). Long-term: move to a Cloudflare Worker that proxies + caches.
4. **State-by-state expansion** — should we add new states only with manual seed data, or have the USDA + 211 sources auto-populate any address? My vote: auto-populate from federal sources; per-state seed only for things the federal sources miss.

---

## TL;DR for v0.42

**Pick three integrations** that maximally change what HomeAtlas can answer:

1. USDA Local Food Directory (farmers markets US-wide)
2. 211 / Findhelp (social services / community help)
3. HRSA Find a Health Center (free clinics)

Combined: ~2 weeks of work, dramatically reduces the "goose hunt" problem for the highest-emotional-weight categories (food access, free healthcare, financial help).
