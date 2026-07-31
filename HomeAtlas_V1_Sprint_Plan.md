# HomeAtlas — V1 Launch Sprint Plan

> 4-week sprint to public launch. Today: 2026-05-06. **Target: 2026-06-02.**

---

## The constraint

27 days. One developer. Public launch on a domain that doesn't exist yet, with deeper data for 6 new states than we have today, plus new categories, plus a trust layer, plus 3-city open-data integration, plus polish.

Every feature decision has to clear a single bar: **does this advance the V1 launch?** If not, defer.

---

## Locked decisions (per 2026-05-06)

1. **Launch date:** 2026-06-02
2. **Model:** Freemium. V1 ships free. Paid services introduced post-launch after traction + validation.
3. **Coverage:** Top 10 populated US states get granular curated data; everywhere else gets OSM-level coverage with a "deeper data coming" badge.
4. **Platform:** Desktop + mobile-web (no native app).
5. **Brand:** HomeAtlas. Domain: `homeatlas.io`.

### Top 10 populated states (granular data target)
| # | State | Status today |
|---|---|---|
| 1 | California | ✅ Granular |
| 2 | Texas | ✅ Granular |
| 3 | Florida | ❌ Need to add |
| 4 | New York | ✅ Granular |
| 5 | Pennsylvania | ✅ Granular |
| 6 | Illinois | ❌ Need to add |
| 7 | Ohio | ❌ Need to add |
| 8 | Georgia | ❌ Need to add |
| 9 | North Carolina | ❌ Need to add |
| 10 | Michigan | ❌ Need to add |

Bonus existing: Washington, New Jersey (keep their depth — total 6 + 6 = ~12 states with granular data at launch).

**Granular data per state means:**
- Counties → primary IOU/electric utility
- Major cities → POU (publicly-owned utility) overrides
- Counties → primary cable provider
- Major cities → fiber availability (AT&T Fiber, Verizon FiOS, Sonic, Optimum Fiber, etc.)
- City → county fallback (when reverse-geocoding fails)
- City → school district

---

## The 4-week schedule

### Week 1 — May 6 to May 12: Filter + 3 new states

**Goal:** Radial-distance filter shipped. Florida + Illinois + Ohio granular data merged.

- **Days 1-2 (May 6-7):** Radial distance filter
  - 4-button selector above section nav: 5mi · 10mi · 20mi · 60mi
  - Default 10mi (good for both metros and suburbs)
  - Persists in localStorage + URL hash (`?radius=10`)
  - All Overpass queries respect chosen radius
  - "Showing within X mi" badge on every section header
  - Re-fetch on radius change (no full reload)

- **Days 3-5 (May 8-10):** State data — Florida
  - 67 FL counties → IOU lookup (Florida Power & Light, Duke Energy FL, TECO, FPU, OUC)
  - Major cities: Miami-Dade, Orlando, Tampa, Jacksonville, Fort Lauderdale, St. Petersburg
  - Cable: Xfinity (Comcast in central/west FL), Spectrum (south FL), Cox (NW FL)
  - Fiber: AT&T Fiber, Verizon FiOS (small footprint), Frontier, Hotwire
  - School districts: 67 county-based districts (FL is unique — districts ARE counties)

- **Days 6-7 (May 11-12):** State data — Illinois + Ohio
  - **IL:** 102 counties; ComEd (Chicago metro), Ameren IL (downstate), MidAmerican (Quad Cities). Spectrum (Charter) is dominant cable; AT&T Fiber + RCN (Astound) + Comcast in metro Chicago. School districts vary city-by-city.
  - **OH:** 88 counties; AEP Ohio, FirstEnergy (Ohio Edison/Cleveland Electric/Toledo Edison), Duke Energy OH, AES Ohio. Spectrum + Xfinity dominate; AT&T Fiber + WOW! in metros. School districts.

### Week 2 — May 13 to May 19: 3 more states + new categories

**Goal:** Georgia + NC + Michigan added. +5 new OSM categories live.

- **Days 8-9 (May 13-14):** State data — Georgia + North Carolina
  - **GA:** Georgia Power (covers most state, IOU), Walton EMC + Cobb EMC + Sawnee EMC + others (60 EMCs serve ~60% of land area). Cable: Xfinity, Spectrum, Mediacom. Fiber: AT&T, Google Fiber (Atlanta).
  - **NC:** Duke Energy Carolinas + Duke Energy Progress (state split). Cable: Spectrum + Xfinity. Fiber: Google Fiber (Charlotte/Triangle), AT&T, Brightspeed.

- **Day 10 (May 15):** State data — Michigan
  - Consumers Energy, DTE Energy, Indiana Michigan Power. Cable: Xfinity + Spectrum. Fiber: AT&T, WOW!, 123Net.

- **Days 11-14 (May 16-19):** Five new OSM categories
  - **Daily essentials section (NEW):**
    - Grocery stores (`shop=supermarket`, `shop=convenience`)
    - Banks & ATMs (`amenity=bank`, `amenity=atm`)
    - Gas stations + EV charging (`amenity=fuel`, `amenity=charging_station`)
    - Restaurants (`amenity=restaurant`, `amenity=cafe`)
    - Public transit (bus stops + rail stations)
  - Goes between Recreation and Gardening
  - Same 2-per-row card pattern, same icon-bubble + distance-tag
  - Each gets its own subnav

### Week 3 — May 20 to May 26: Civic + Trust layer

**Goal:** Civic data live. Ranking is transparent. "Coming soon" UX for non-top-10 states.

- **Days 15-16 (May 20-21):** Civic & gov't section (NEW)
  - Elected officials at federal/state/local level via Google Civic Information API
    - Free tier: 25K queries/day, plenty for V1
    - Need a Google Cloud key — get free, restrict to homeatlas.io referer
  - Polling place lookup (uses same Civic Info API)
  - State legislator detail via Open States (free, no key)
  - Voter registration deep-link per state
  - DMV / courthouse from existing OSM amenity tags
  - Goes between Education and Recreation, OR replace the "Civic" subsection inside Emergency

- **Days 17-18 (May 22-23):** OSM completeness ranking
  - Score every place: phone (+25), website (+25), opening_hours (+20), email (+10), address tagged (+20)
  - Sort within each subsection by `score desc, then distance asc`
  - "Verified contact info" badge on cards with full tagging
  - Transparent ranking: hover over any card shows "Why ranked here: 2 mi · phone, website, hours all listed"
  - This is the key differentiator vs Yelp's pay-to-play

- **Days 19-20 (May 24-25):** "Deeper data coming" treatment for non-top-10 states
  - When user's state isn't in the granular list, show a soft banner at the top of Utility Services:
    *"You're in [State]. We're showing nationwide fallbacks for utilities. Granular [State] data is coming soon — until then, FCC Broadband Map links below give you the most accurate availability."*
  - Same pattern for school districts (link to state DOE), property records (link to county assessor)
  - Honest about what we have and what we don't

- **Day 21 (May 26):** Buffer / catchup / fixes from real-use testing

### Week 4 — May 27 to Jun 2: City data + Launch

**Goal:** 3-city deep open-data integration. Domain live. Launch.

- **Days 22-23 (May 27-28):** Top 3 metros open data
  - **NYC** — `data.cityofnewyork.us` (Socrata SODA API, no auth)
    - 311 complaints by location (past 12 months)
    - Restaurant inspection grades
  - **Chicago** — `data.cityofchicago.org`
    - 311 service requests
    - Food inspections
    - Active business licenses
  - **LA** — `data.lacity.org`
    - MyLA311 service requests
    - LAPD reported crimes (zip-level)
  - "0 complaints filed at this address" badge where available
  - "[N] complaints filed in past year" warning where high

- **Day 24 (May 29):** Domain + deployment
  - Register `homeatlas.io` via Cloudflare Registrar (~$50/yr — `.io` is more expensive than `.app`)
  - Configure DNS → Cloudflare Pages
  - Update OG metadata, footer mailto (need a real personal email — NOT svelivela@paypal.com), canonical URLs
  - SSL auto via Cloudflare
  - Set the existing `homeatlas.satyabhanuv.workers.dev` to redirect to homeatlas.io

- **Day 25 (May 30):** Performance + polish
  - Lazy-load distant categories (don't fetch Daily Essentials if user hasn't scrolled near it)
  - Empty states everywhere — no broken-looking blanks
  - 404 / error states (Overpass mirror down, CORS issue, etc.)
  - Mobile-web walkthrough at 375px / 414px / 768px
  - Skeleton loaders consistent

- **Day 26 (May 31):** Analytics + feedback
  - Privacy-respecting analytics — Plausible (self-hostable) or Cloudflare Web Analytics (free, no cookies)
  - Real feedback widget: small floating "Send feedback" button → mailto, optionally a Tally.so form
  - Plausible goal events: search submitted, radius changed, sub-tab clicked, sources clicked
  - This is the validation infrastructure for the freemium decision

- **Day 27 (Jun 1):** Soft launch
  - Push to homeatlas.io
  - Personal feedback round: 5-10 people manually
  - Last fixes
  - Schedule social posts for Jun 2

- **Day 28 (Jun 2):** **PUBLIC LAUNCH** 🚀
  - HN "Show HN" post
  - Reddit r/sideproject, r/homeowners, r/RealEstate
  - Personal LinkedIn / Twitter
  - Cool Tools newsletter pitch
  - Track first-hour metrics

---

## What we're explicitly NOT building for V1

Everything below is post-launch. They're great ideas; they don't ship June 2.

- ❌ User accounts / saved homes
- ❌ Resident reviews (locked behind Phase 5 auth)
- ❌ Real GreatSchools / Yelp / Google ratings (paid APIs)
- ❌ Map-style visualization (current map embed is enough)
- ❌ Comparison view ("compare two addresses side by side")
- ❌ Email digest of new permits/issues nearby
- ❌ Mobile app
- ❌ Spanish localization
- ❌ Voice / chatbot interface
- ❌ City open data beyond NYC/Chicago/LA (Boston, SF, DC etc come Phase 1.5)
- ❌ State licensing API integrations (deep-links only for V1)
- ❌ Sex offender registry (sensitive, defer indefinitely)

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Overpass API rate-limited under launch traffic | Medium | We already use 4-mirror fallback. Add request caching (15-min) in Cloudflare Workers. |
| Wikipedia plant photo API blocked | Low | Already have localStorage cache + emoji fallback. Worst case, photos disappear, page still works. |
| Florida / Illinois / etc. data quality issues | Medium | Pre-launch: 5 sample addresses per state, manual verification. Honest "data quality varies by state" footer. |
| Cloudflare Pages traffic limit (100K req/day on free tier) | Low at first | Move to Workers Paid ($5/mo flat) when we cross threshold. Already on Workers, just check current tier. |
| Personal feedback email exposed in source | Medium | Don't use real email; use a Tally.so form or a forwarding address (`feedback@homeatlas.io`). Never `svelivela@paypal.com`. |
| Domain `homeatlas.io` not available | Low (we believe it's free) | Verify at Cloudflare Registrar **today**. Backup: `homeatlas.app` (verified available, ~$15/yr cheaper). |
| Civic Info API requires API key + rate limits | Low | 25K/day free tier is comfortable. Rotate key if hit. Cache 24h per zip. |
| OSM data quality in non-top-10 states | High | Empty-state copy: "OSM coverage in your area is improving — [link to add data]". Real talk, not fake-coverage. |

---

## Day-1 actions (do today, 2026-05-06)

Three things to lock in *before writing any code* this week:

1. **Verify `homeatlas.io` is registrable** — go to [Cloudflare Registrar](https://dash.cloudflare.com/?to=/:account/domains/register) and search. If available, register it today (~$50/yr). If not, fall back to `homeatlas.app` and update this doc.

2. **Set up a real feedback address** — register a forwarding email like `feedback@homeatlas.io` (free, comes with the domain) that forwards to your personal Gmail. Never expose `svelivela@paypal.com` in production.

3. **Get a Google Cloud Civic Info API key** — free, no card required, 25K queries/day. Restrict to `homeatlas.io` referer. Save in Cloudflare Workers secret store.

These three unblock Week 3. Don't start coding until they're done.

---

## Success metrics for V1 launch (June 2 → June 30)

What "validation" actually means before we introduce paid tiers:

- **1,000 unique visitors in first week** (modest, organic)
- **30% complete the search flow** (enter address + view results)
- **15% scroll to a 3rd section** (i.e., engage past Emergency + Utility services)
- **5% click a "Send feedback" / mailto** (any kind of engagement)
- **2 organic traction signals:** HN front page, viral tweet, blog mention, Reddit upvote storm. Even one strong signal is meaningful.

If by June 30 we hit 3 of those 5, we're in good shape to start the paid-tier conversation. If we miss most, the thesis needs revisiting before more building.

---

## Versioning scheme through launch

- **v0.30** — Radial filter (this week)
- **v0.31** — FL + IL + OH state data
- **v0.32** — GA + NC + MI state data + Daily essentials section
- **v0.33** — Civic & gov't + OSM ranking
- **v0.34** — Top-3-metros open data
- **v0.35** — Performance + analytics + feedback widget
- **v0.36** — Domain cutover + soft launch
- **v1.0** — Public launch June 2 🎉
