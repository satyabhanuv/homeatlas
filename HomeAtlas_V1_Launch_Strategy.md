# HomeAtlas — V1 Launch Strategy

> Research on what's possible, what's not, and what to build next.
> Last updated: 2026-05-06.

---

## The repositioned thesis

You're shifting from "single-page home info" to **"the one-stop public-data layer for every service a resident has access to."** That's a real product, and it competes against:

| Competitor | Their strength | Their weakness | HomeAtlas advantage |
|---|---|---|---|
| **Nextdoor** | Neighbor community, real names, hyper-local | Account required, ads, drama, walled-off | No login, no community to join, structured public data |
| **Neighbors by Ring** | Crime/safety alerts, real-time | Crime-only focus, requires Ring account, doom-scroll | Broader than crime, address-only entry |
| **Facebook Groups** | Personal recommendations | Fragmented, no structure, requires FB | Neutral data sources, structured, no algorithm |
| **Yelp** | Reviews, ratings, photos | Pay-to-play ranking, ads, reviews aren't representative | Free public data, no paid placement |
| **Google Maps** | Universal coverage | Not address-curated, profile-tracked, ad-driven | Address-first, privacy-first, no profile build |
| **Zillow / Redfin** | Real estate data | Selling you a house, not the place around it | We're not the listing — we're the surroundings |

**Your positioning sentence (nail this):**
> *Owner-approved, publicly-available information that today takes 47 tabs and 3 logins to find. Enter your address. Done.*

That sentence is the V1 north star. Every feature decision should be measured against "does this make that sentence more true?"

---

## What's actually possible with free / public data

### Tier 1 — already wired up (OSM-driven, works today)
- ✅ Schools (public, private, charter, colleges)
- ✅ Hospitals, clinics, urgent care, doctors, dentists, pharmacies
- ✅ Fire stations, police
- ✅ Parks, playgrounds, dog parks, trails, libraries, pools, community centers
- ✅ Plumbers, electricians, HVAC, painters, carpenters, roofers, cleaners, locksmiths, hardware stores
- ✅ Post offices, town halls
- ✅ Electric utility (state lookup tables, 6 states deep)
- ✅ Internet, TV, security providers
- ✅ Climate (USDA hardiness zone), plant recommendations
- ✅ Climate risks (flood/fire/heat/air heuristics, deep-links to FEMA/Cal Fire/AirNow)

### Tier 2 — easy additions from OSM (1 week of work)
These are already in OpenStreetMap with decent coverage; we just haven't queried them yet:

- **Grocery stores** (`shop=supermarket`, `shop=convenience`, `shop=greengrocer`)
- **Banks & ATMs** (`amenity=bank`, `amenity=atm`)
- **Gas stations** (`amenity=fuel`)
- **Restaurants & cafes** (`amenity=restaurant`, `amenity=cafe`, `amenity=fast_food`)
- **Public transit** — bus stops, train stations, light rail (`highway=bus_stop`, `railway=station`, `public_transport=*`)
- **Veterinarians & animal shelters** (`amenity=veterinary`, `amenity=animal_shelter`)
- **Childcare / daycares** (`amenity=childcare`, `amenity=kindergarten`)
- **Religious institutions** (`amenity=place_of_worship`)
- **DMV / government offices** (`office=government`)
- **Courthouses** (`amenity=courthouse`)
- **Farmers markets** (`amenity=marketplace`)
- **Public Wi-Fi locations** (`internet_access=yes` or `wifi=*` on cafes/libraries)
- **Recycling / bottle return** (`amenity=recycling`)
- **EV charging** (`amenity=charging_station`)
- **Auto repair / mechanics** (`shop=car_repair`, `craft=auto_mechanic`)

### Tier 3 — feasible with public APIs / open data (2-4 weeks)
- **Civic info** (elected officials, voting precincts, polling places)
  - Free via [Google Civic Information API](https://developers.google.com/civic-information) (requires API key, generous free tier)
  - Or free via [Open States](https://openstates.org/) for state legislators
  - Or free via [Vote.org](https://www.vote.org/state-elections-2024/) deep-links per state
- **Public transit schedules** via [GTFS feeds](https://gtfs.org/)
  - Free, federally mandated for most US transit agencies
  - Can show next bus arrival in real time for cities with GTFS-RT (≈60 metros)
- **FBI Crime Data Explorer** for state/county-level crime statistics (free, no auth)
- **Census Bureau ACS data** (median income, age distribution, demographics) — free, no auth
- **State legislator contact + bills** via Open States API (free, generous tier)
- **National Sex Offender Registry** — public-records, but the data is fragmented across 50 states; aggregator [NSOPW.gov](https://www.nsopw.gov) doesn't have a free API. Skip for V1.

### Tier 4 — possible per-city (open data portals, 1 week per top metro)
Most large US cities publish 311 / civic data. Pick top 10 metros for V1:

- **NYC** — `data.cityofnewyork.us` — 311 complaints, restaurant inspections, building violations, parking tickets
- **Chicago** — `data.cityofchicago.org` — 311, food inspections, business licenses
- **Los Angeles** — `data.lacity.org` — 311 (MyLA311), LAPD crime
- **San Francisco** — `data.sfgov.org` — 311, business locations, permits
- **Boston** — `data.boston.gov` — 311, restaurant inspections
- **DC** — `opendata.dc.gov` — crime, 311
- **Seattle** — `data.seattle.gov`
- **Austin** — `data.austintexas.gov`
- **Philadelphia** — `opendataphilly.org`
- **Denver** — `denvergov.org/opendata`

Each follows roughly the [Socrata SODA API](https://dev.socrata.com/) pattern. Can query: "complaints filed at this address in past 12 months", "active restaurant inspections", "active building permits", etc.

**Use case:** "0 complaints reported to the city" badge on a service provider's card. Ranking signal.

### Tier 5 — possible per-state (deep-link maps, 1 week)
Property records, contractor licensing, business registry are all per-state. Build a 50-state lookup table mapping `state → { assessor_url, contractor_license_lookup_url, business_lookup_url }` — then deep-link to the right portal with the user's address pre-filled where the URL supports it.

This is grunt work but achievable. Pre-bake the URL templates once.

Examples:
- **California State License Board (CSLB)** — `cslb.ca.gov` — verify contractor license number
- **NY DOS** — corporation/business search
- **Texas Comptroller** — taxable entity search
- **County assessors** — most have public address-search property record pages

---

## What's hard / expensive / out of scope for V1

### Paid APIs (defer to Phase 6 monetization)
- **Yelp Fusion API** — ratings, reviews, photos. Free tier is limited; commercial use requires paid.
- **Google Places API** — ratings, hours, photos. Pay-as-you-go, gets expensive at scale.
- **GreatSchools API** — actual school ratings. Paid, requires partnership.
- **First Street Foundation** — granular climate risk. Paid B2B.
- **Mapbox** — better geocoding, satellite imagery. Paid above free tier.

### Genuinely hard
- **Aggregating contractor licensing across 50 states** — every state has its own format and lookup interface. Can deep-link, can't federate without scraping. Estimate: 6+ months of state-by-state work to do properly.
- **HOA documents** — private, no public DB.
- **Real-time crime maps** — only some cities; most rely on voluntary disclosure.
- **Real-time bus arrivals** — GTFS-RT has good coverage in big metros; rural / mid-size cities lag.
- **Personal recommendations** — would require accounts (= Phase 4).

### Sensitive, defer to Phase 4+
- **Sex offender registry** — data is public but legally fraught to surface alongside other neighborhood data. Implementations need careful handling. NOT a V1 feature.
- **Crime "by the address"** — risks redlining / discriminatory outcomes; need careful UX, not a "score" but a link-out to authoritative sources (FBI, local PD).

---

## Ranking signals — what's actually available

You said: *"All these services ranked based on legit information, be it ratings, 0 complaints reported to the city."*

Here's what we can actually rank by, in order of trustworthiness:

| Signal | Where it comes from | Coverage | V1 ready? |
|---|---|---|---|
| **Distance from address** | Computed | 100% | ✅ Yes |
| **OSM completeness** (has phone + website + hours) | OSM tags | ~50-70% in metros, less in suburbs | ✅ Yes |
| **Verified entity** (has registered business address in OSM) | OSM | ~30-50% | ✅ Yes |
| **0 city complaints in past year** | City open-data portals | Top 10 metros | ⚠️ Partial (top metros only) |
| **Active state license** | State licensing boards | Per-state, varies | ⚠️ Deep-link only |
| **GreatSchools rating** | Paid API | Nationwide if subscribed | ❌ Phase 6 |
| **Yelp/Google ratings** | Paid API | Nationwide if subscribed | ❌ Phase 6 |
| **Verified neighbor reviews** | HomeAtlas users (auth required) | Whatever we build | ❌ Phase 4 |
| **BBB accreditation** | BBB.org (no free API; legal risk to scrape) | Nationwide | ❌ Skip |

**Recommended V1 ranking algorithm** (composite score):
1. Distance score (closer = higher) — 50% weight
2. OSM completeness (has phone, website, hours, address all filled) — 25% weight
3. City-data signal (0 complaints, active permits, valid license) — 15% weight, only when available
4. Default — 10% weight (everything else equal)

Each card shows **why** it ranks where it does ("0 complaints filed · Phone + website verified · 0.8 mi away") so the ranking is transparent, not magic.

---

## Suggested V1 scope (6-8 weeks of work)

### Week 1: Radial filter + scope
- Add radius selector (5 / 10 / 20 / 60 mi) above the section nav
- Persists in URL hash + localStorage
- All Overpass queries respect the chosen radius
- Default radius adapts: 5mi if metro (high density), 20mi if rural (low density)
- "Showing within X miles" badge on each section header

### Weeks 2-3: Expand OSM categories
- Grocery, banks, ATMs, gas stations, restaurants
- Public transit (bus stops, train stations) with GTFS schedule deep-links
- Vets, animal shelters, daycares, religious institutions
- DMV / courthouse / government offices
- Auto repair, EV charging, recycling
- Restructure Education / Recreation / Emergency to absorb new categories
- New top-level section: **"Daily essentials"** for grocery + bank + gas + restaurants?
- New section: **"Civic & gov't"** for DMV, courthouse, voting, elected reps?

### Weeks 4-5: Civic + transit layer
- Civic Information API integration (Google) — voting precinct, polling place, elected officials at federal/state/local level
- Public transit overlay (GTFS) — show nearest 5 stops with route names
- State legislator contacts via Open States
- Census ACS overlay (median income, age distribution) — optional, gated

### Week 6: Trust / ranking layer
- OSM completeness scoring + transparent badge on each card
- City open-data integration for top 10 metros (NYC, Chicago, LA, SF, Boston, DC, Seattle, Austin, Philly, Denver)
- "0 complaints filed" badge where data is available
- "Verified business" badge for OSM-complete entries

### Week 7: Per-state deep-link map
- State assessor URL map (50 states)
- State contractor licensing URL map (50 states)
- Property records section under "My home"
- License lookup deep-link from every Home services card

### Week 8: Launch hardening
- Performance: lazy-load distant categories (don't fetch parks if user is on Schools tab)
- Fallback / empty-state copy for low-coverage areas
- Mobile polish
- Analytics (privacy-respecting, e.g. Plausible)
- Domain (`homeatlas.app`)
- Landing-page copy + meta tags for organic SEO

---

## What gets us 80% of competitive value with 20% of effort

If you have to ship in 4 weeks, not 8, prioritize:

1. **Radial filter** (2 days) — gives the user control, signals "we mean serious coverage"
2. **+10 new categories from OSM** (1 week) — grocery, transit, banks, gas, restaurants, vets, daycares, DMV, recycling, EV charging
3. **Civic + voting via Google Civic Info API** (3 days) — instant differentiation; Nextdoor doesn't have this
4. **OSM completeness ranking** (2 days) — every card shows why it ranks where it does
5. **Property record deep-links per state** (3 days) — pre-baked URL map, no API needed
6. **Top-3-metros city open data** (1 week) — NYC, Chicago, LA — "0 complaints" badge as a real differentiator
7. **Launch with explicit "deep coverage in 3 cities, broad coverage everywhere" framing**

This is a 4-week MVP that ships with a real story. Everything else can be Phase 1.5 / Phase 2.

---

## Honest acknowledgments

A few things to face directly before launch:

1. **Coverage is uneven.** OSM is great in metros, weak in rural. We have to be honest about this in the UX — empty-state copy when results are thin should say *"OSM coverage in your area is limited; we're improving"* not pretend the data doesn't exist elsewhere.

2. **"Owner-approved" framing has limits.** Most public data isn't actually owner-approved — it's just public. Be careful not to imply governmental endorsement we don't have. A footer line like *"Data sources: OpenStreetMap (community-maintained), city open-data portals, federal agencies (Census, FBI, USDA)"* keeps us honest.

3. **Nextdoor's moat is the community, not the data.** We can't build community in V1, so we shouldn't try. Lean into "no community needed — just data." Different value prop, not lesser.

4. **Reviews remain the biggest gap.** A residence considering a plumber wants to know if they're trustworthy — and OSM doesn't tell us that. The "verified-resident review" system in Phase 4 is the answer, but until then we should be transparent: rankings reflect public data and proximity, not subjective quality.

5. **One-stop is a long-tail problem.** No matter how many categories we add, someone will need something we don't have. Plan for graceful "we don't have X yet — try [authoritative source link]" empty states. This is honest and builds trust.

---

## My specific recommendation: next 3 actions

If I were you, on Monday morning I'd do these in order:

### Action 1 — implement the radial filter (1-2 days)
Direct response to your stated V1 ask. Concrete, testable, immediately shippable. Sets up the "control panel" feel for the page.

### Action 2 — pick 3 pilot metros + 5 new OSM categories (1 week)
Go deep, not wide. Pick NYC, LA, Chicago. Add grocery, banks, gas, restaurants, transit. Real differentiation in those metros while broader coverage stays acceptable elsewhere.

### Action 3 — build the trust layer (3 days)
On every result card, show *why* it ranks: "Phone + website verified · 0 complaints filed · 1.2 mi away." Transparent ranking is what separates HomeAtlas from Yelp's pay-to-play.

After those three, evaluate. If users are using the radial filter and engaging with civic data, we're on a good path. If not, the thesis needs a rethink before more building.

---

## What I want to validate with you before building

A few decision points only you can make. Quick async-friendly answers:

1. **Account-required Phase 4 — when?** Reviews and "my saved homes" all gate on auth. If you want to compete with Nextdoor in 12 months, accounts come earlier. If you stay zero-friction, pricier moat to defend.

2. **Free forever, or freemium at scale?** Cloudflare hosting starts charging at ~100K visits/month. Domain + analytics + paid APIs for premium = ~$30-100/mo at modest scale. Comfortable with that, or is "completely free" a non-negotiable principle?

3. **Geographic launch strategy:** "Nationwide thin coverage" vs "3 deep cities + everywhere else as preview". I lean deep-cities; you?

4. **Mobile-first or desktop-first?** Most home buyers do this on a phone but read more on desktop. We're currently 50/50. A real launch needs a clear "yes, mobile is great" stance.

5. **Naming:** "HomeAtlas" still — or a brand name with stronger competitive framing? ("Knowmyhome" / "Homedossier" / "Homebrief" alternatives we found earlier are still available.)

---

Ship the radial filter this week. Pick 3 cities. Don't rebuild the model — extend it. The bones are right; we just need to add limbs.
