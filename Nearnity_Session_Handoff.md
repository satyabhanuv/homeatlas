# Nearnity — Session Handoff

**Read this first if you're resuming Nearnity work on a fresh chat, different laptop, or different Claude account.**

**Last updated:** 2026-05-28 (Thu — soft launch day)
**Current version (local, NOT YET PUSHED):** v0.68 in `/sessions/.../Personal/index.html`
**Last confirmed-deployed version:** v0.67 (push presumed; verify via footer on nearnity.com)
**Phase:** Soft launch day (Thu May 29 window). v0.68 ships Save/Star + chip UX fix.

---

## TL;DR — the 60-second context

Nearnity is Satya's location-first public-data side project. User taps "Near Me" on their phone (or types any address) → gets back verified info about wherever they are: schools, free clinics, utilities, events, civic resources, safety/risk data. Public sources only. No ads. No accounts.

Originally branded HomeAtlas (positioning: "everything about your home"). Renamed to Nearnity on 2026-05-23 after observing that the Near Me button gets way more use than address entry — product is fundamentally about *where you are*, not where you live.

Single-file static HTML+JS app (~580KB) hosted on Cloudflare Workers at `nearnity.com`. Separate Cloudflare Worker `nearnity-events` aggregates live events from Ticketmaster + SeatGeek + city iCal feeds.

**Soft launch: Thursday May 29, 2026** to 3-5 trusted testers. **Public launch: week of June 22, 2026.**

---

## What's working right now

- Site is live at https://nearnity.com (v0.57)
- All 5 main categories functional: Around me, My home, Help & wellness, Civic & gov't, Safety & risks
- Persistent red emergency bar at top with 911 / 988 / 211 (sticky)
- Side-by-side list+map on desktop for 5 sections (Events, Schools, Parks, Emergency services, Home services)
- OpenStreetMap-backed venue lookups (already integrated)
- HRSA federal clinic data, FCC broadband map, Census geocoder (already integrated)
- Curated event seed (~80 events) for major Bay Area + PA cities
- Cloudflare Worker `nearnity-events` deployed with Ticketmaster API integration
- `feedback@nearnity.com` email routing → svelivela@paypal.com

## What's actively in progress (Tickets 1-4)

| # | Ticket | Status |
|---|---|---|
| 4 | Visible cat-nav tabs (icons + labels) | ✅ Done in v0.58, pushed and confirmed |
| 1 | Tiered distance by event category | ✅ Done in v0.59 (local, needs push) |
| 2 | Real search (query reaches all sources) | ✅ Done in v0.59 (local, needs push) — Worker also updated |
| 3 | Separate Search Results vs Explore | 🟡 Partial in v0.59 (search banner ships, full section split deferred for tester feedback) |

Soft launch invites go out Thursday May 29 after Satya pushes v0.59 + Wednesday buffer testing.

**Next actions for Satya when laptop wakes:**
1. **Push v0.59** to GitHub (replace `index.html` AND paste the updated `nearnity-events-worker.js` into the Cloudflare Worker editor → Save and deploy).
2. **Re-test on phone:** type "football" near Cupertino → should now actually filter to football-related events. Type "concert" → should see regional-tier results. Leave search empty → see tiered groups (Right here / Nearby / Worth the drive).
3. **Verify the search banner appears** when a query is active and the "Clear search" button works.
4. Report back any issues.

---

## File inventory

In `/sessions/.../mnt/Personal/`:

| File | What |
|---|---|
| `index.html` | **The app.** Single file, HTML+CSS+JS. ~580KB. v0.57 as of 2026-05-26. Push this to GitHub to deploy. |
| `og-image.png` | 1200×630 OG image. Must live in GitHub repo root alongside index.html. |
| `nearnity-events-worker.js` | Cloudflare Worker code for the events aggregator. Deployed as Worker `nearnity-events`. |
| `Nearnity_Events_API_Setup_Guide.md` | Step-by-step deploy guide for the events Worker. |
| **`Nearnity_Session_Handoff.md`** | **This file.** Always update when major state changes. |
| `HomeAtlas_Release_Notes.md` | Running release notes (filename still HomeAtlas-prefixed, content current). Add new version on top. |
| `HomeAtlas_SoftLaunch_ThisWeek.md` | Soft-launch sprint plan. |
| `HomeAtlas_Launch_Prep_Checklist.md` | Pre-launch comprehensive checklist. |
| `make_og.py` | (in scratchpad `/sessions/blissful-amazing-hawking/make_og.py`) — regenerates OG image using Poppins font. |

---

## Architecture summary

```
                                User browser
                                     │
                                     ▼
              ┌──────────────────────────────────────┐
              │ Cloudflare edge (nearnity.com zone)  │
              └──────┬───────────────────────────┬───┘
                     │                           │
            /api/*   │             everything    │
                     ▼                  else     ▼
        ┌─────────────────────────┐   ┌──────────────────────────┐
        │ nearnity-events Worker  │   │ static-site Worker        │
        │  (TS/JS)                │   │  serves index.html        │
        │  Bindings:              │   │  Custom Domains:          │
        │   - TICKETMASTER_KEY    │   │   nearnity.com            │
        │   - SEATGEEK_CLIENT_ID  │   │   www.nearnity.com        │
        │   - EVENTS_KV (KV)      │   │  Auto-deploys from GitHub │
        └─────┬─────────┬─────────┘   └──────────────────────────┘
              │         │
              ▼         ▼
        Ticketmaster  SeatGeek  + 15 city iCal feeds (in code)
```

**Frontend** (`index.html`) calls `/api/events?lat=...&lon=...&radius=...&city=...&state=...` after location resolves. Events from API merge with the existing curated seed.

**Caching:**
- Cloudflare KV namespace `nearnity_events_cache` — 1h TTL on API responses, keyed by ~1km grid cell
- Cloudflare edge may cache HTML 4h by default (add Cache Rule to bypass for `.html` if pushes don't go live fast)

---

## Deployment flow

1. Edit `index.html` in `/sessions/.../mnt/Personal/`
2. GitHub.dev (`.` keystroke on the repo page) → replace `index.html` with local copy
3. Commit: `vX.Y — Short headline` (matches release notes)
4. Push → Cloudflare auto-deploys in ~30 seconds
5. Hard-refresh `nearnity.com`. If stale: Cloudflare zone → Caching → **Purge Everything**.

---

## Critical operational notes

- **PayPal Zscaler corporate firewall blocks nearnity.com** as "newly-registered domain." Will auto-clear ~Jun 7-22. **Test from personal phone (cellular) or personal laptop only** until then.
- **Cloudflare edge cache** can serve stale HTML after pushes. Add a Cache Rule that bypasses cache on `.html` to prevent this.
- **The Workers Route `nearnity.com/api/*` → `nearnity-events`** MUST be configured for live events to flow. Verify by hitting `https://nearnity.com/api/health` — should return JSON. If 404/HTML, add the route via Cloudflare zone → Workers Routes.
- **Variable/binding changes on a Worker need a redeploy** (Edit code → Save and deploy) to take effect.
- **PayPal Zscaler blocks nearnity.com** for ~14-30 days post-registration. Test from personal devices only until ~Jun 7.

---

## Decisions locked

- **Brand:** Nearnity (renamed from HomeAtlas 2026-05-23). USPTO + CA SOS checks clean.
- **Domain:** `nearnity.com` on Cloudflare Registrar, $10.49/yr flat.
- **Tagline:** "Everything about here." Subtagline: "Public data. Right where you are."
- **Logo:** Pin-and-checkmark mark — blue gradient pin (#006aff→#0050c2) with green verified badge (#2d6a4f).
- **Color palette:** Blue + forest green primary, emergency red top bar (#A32D2D→#791F1F).
- **Business model:** Freemium. Free for V1.
- **Coverage:** Granular utility/school state data for CA, FL, IL, NY, OH, PA, TX (plus WA, NJ). Live events everywhere in US via Ticketmaster+SeatGeek.
- **Platform:** Desktop + mobile-web for soft launch. PWA starting wk of Jun 1. Native app deferred until traction proves it.
- **Soft launch date:** Thu May 29, 2026 (slipped from Wed May 27 for tickets 1-4).
- **Public launch date:** Week of Jun 22, 2026.
- **LLC formation:** Wk of Jun 1 (after soft launch validation). CA LLC + EIN + Mercury/Relay bank.

---

## How Satya wants to work (collaboration preferences)

- **Verification over brainstorming.** When converging on a decision (name, vendor, design direction), give 1 confident recommendation + 2-3 verified backups. Stop. Don't multiply options after he's tired of choosing.
- **Decisive recommendations.** Pick a path, defend it, ask for confirmation. Don't hedge with 5 equal options.
- **Honest scope estimates.** If something is 3 hours, say 3 hours. If something can't be done in 24 hours, say so. He's accepted slips when justified (tickets 1-4 → 2-day slip).
- **Push for closure when stuck.** If a decision loop is wasting time, frame the binary clearly ("you can pick any 3 of these 4 constraints, not all 4").
- **Field-test feedback is gold.** Bugs Satya finds while actually using the site are higher priority than synthetic improvements.
- **Release notes every iteration.** Format: `## vX.Y — YYYY-MM-DD — Headline` + 3-7 bullets, copy-pasteable to top of `HomeAtlas_Release_Notes.md`.

---

## Next session quickstart

If you're picking this up fresh:

1. Read this file (you're doing it).
2. Read `HomeAtlas_Release_Notes.md` for the latest version's changes.
3. Check `/api/health` to confirm the events Worker is healthy.
4. Check status of tickets 1-4 (see "What's actively in progress" above).
5. Ask Satya where he is in the workflow.

---

## Open questions / decisions pending Satya

- (none currently — tickets 1-4 are scoped and approved, executing now)

---

## Recent release-notes summary (last 7 versions)

- **v0.68** (2026-05-28) — Save/Star feature (localStorage) + flat-list chip mode (fixes "chips do nothing" bug). New "Saved" cat-nav tab. **Local; needs push.**
- **v0.67** (2026-05-28) — 3-bucket source taxonomy + 4 time-window chips + query-specific section hiding.
- **v0.66** (2026-05-28) — ChatGPT v0.65 P0 review batch: distance_miles, source_verified split, add-on filter, series grouping, string normalization.
- **v0.65** (2026-05-27) — 5 P0 fixes from ChatGPT review.
- **v0.64** (2026-05-27) — Stripped aggregator deep-link grid from empty states. Honest "we don't have it yet" copy.
- **v0.63** (2026-05-27) — Aggregator deep-links shipped + rolled back same day after Satya field-test feedback.
- **v0.62** (2026-05-26 night) — Phase 2 part 1: PWA. Installable on iOS/Android. **Local only; needs push (4 files).**
- **v0.61** (2026-05-26 PM) — Civic map fallback to lastGeo. Class-search "no match" banner now shows Google Maps + Yelp + Eventbrite + Meetup deep links pre-filled with query + city. **Local only.**
- **v0.60** (2026-05-26 PM) — 3 field-test fixes: pickService word-boundary regex (soccer no longer routes to ER), map fitBounds only includes pins within user radius (no more San Jose drift), events-value pill reflects filtered count. **Local only.**
- **v0.59** (2026-05-26 PM) — Tickets 1+2 (+partial 3): tiered distance + real search + search banner. **Local only.**
- **v0.58** (2026-05-26) — Ticket 4: unmissable cat-nav tabs (icon + label tiles). **Pushed + confirmed live.**
- **v0.57** (2026-05-26) — × clear buttons on search inputs.
- **v0.56** (2026-05-26) — Live event aggregator Worker (Ticketmaster + SeatGeek + city iCal).

See `HomeAtlas_Release_Notes.md` for full version history back to v0.30.
