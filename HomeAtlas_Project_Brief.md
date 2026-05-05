# HomeAtlas — Project Brief (paste this into any new Claude chat to resume)

> **How to use this doc:**
> Copy everything between the `--- BEGIN BRIEF ---` and `--- END BRIEF ---` markers below into a new Claude conversation as your first message, followed by your actual ask. Claude will have full project context within seconds. Works in claude.ai, Claude Code, Claude Cowork, mobile app, or via API.

---

## --- BEGIN BRIEF ---

I'm continuing work on **HomeAtlas**, a personal side-project I started building with you in a previous Claude conversation. Here's everything you need to know to pick up where we left off.

### What HomeAtlas is

A free public website where anyone enters their US home address and gets, in one view: who their electric utility is (with CCA breakdown for IOU customers), internet/TV/security provider options, schools (public/private/other × elementary/middle/high), parks & lifestyle (kid/pet/me sorted), USDA hardiness zone with seasonal "today's action" plant tips, and climate risks. Eventual vision: single-stop home knowledge platform spanning house anatomy by year built, HVAC, materials, civic data, and beyond.

**Live site:** https://homeatlas.satyabhanuv.workers.dev/
**Hosting:** Cloudflare Workers/Pages, deployed via GitHub auto-deploy.
**Owner:** Satya Bhanu (currently using corporate PayPal Claude; may continue from personal account).

### Current version: v0.22

Most recent ships, newest first:
- **v0.22** — De-duplicated headers (one big section header per topic, no inner card title repeats), info-button popovers replacing inline disclaimers, compact service cards, "Most used in neighborhood" pills (Cable for ISP, Streaming for TV, DIY for security)
- **v0.21** — Page-wide redesign: 6 big section headers with accent colors, climate risks collapsed-by-default, "Right now in your garden" today-hero in yard card based on current month + zone, parks regrouped into For-kids/For-pet/For-you, mobile-responsive (no horizontal scroll on phones), reordered sections (services → schools → parks → yard → risks)
- **v0.20** — Visual restyle: address-resolved card uses icon-tile grid; school rows use colored circle badges (green <0.5mi, blue <1.5mi, gray >1.5mi) with level letter inside
- **v0.19** — NEW Climate risks card (Flood/Fire/Heat/Air heuristics + deep-links), NEW Parks card (Overpass: parks/dog parks/playgrounds/trails), NEW Home details placeholder with editable year-built (saves to localStorage, will unlock house-anatomy module), watering tile promoted
- **v0.18** — Census Bureau reverse-geocode added as Nominatim fallback (resolves county everywhere, fixes "Unknown" utility for towns where OSM lacks county data)
- **v0.17** — Removed Nominatim from autocomplete (was violating their 1-req/sec policy and getting users IP-blocked); added resilient fallback in `runLookupFromFeature`
- **v0.16** — Two-phase autocomplete (Photon fast + Census deep-search merge); smart-upgrade on selection if Census has the exact house
- **v0.15** — Census Bureau Geocoder added as 4th-tier submit-time geocoder
- **v0.14** — Address parser, structured Nominatim search, house-number ranking
- **v0.13** — Phase 2 begins: Yard & Garden module (USDA zones for all 50 states, 39-plant DB, seasonal soil + watering tips)
- **v0.12** — Per-row dual icon links (Reach them globe + Map pin), top-5 cap per tile, schools restructured to 3×3 grid
- **v0.11** — Nominatim fallback geocoder for small towns (Phoenixville-style addresses)
- **v0.10** — Added depth for PA, NY, TX, WA, NJ alongside CA (utilities, cable, fiber, school districts)
- **v0.9** — Removed CA-only gate, opened to all US with national fallbacks
- **v0.1–v0.8** — Initial CA-only MVP, autocomplete, providers, schools via Overpass, structured address card, deployment polish

(Full release notes in `HomeAtlas_Release_Notes.md`.)

### Architecture & data sources (all free, no API keys)

**Frontend:** single-file HTML/CSS/JS (`index.html`, ~225 KB). No build step. Hand-styled (CSS custom properties, light theme). No frameworks. Vanilla JS only.

**Geocoding chain (in order, fallback on failure):**
1. **Photon** (komoot.io) — fast type-ahead autocomplete
2. **Nominatim** (OpenStreetMap) — free-text search, single call per submit only (their policy forbids per-keystroke)
3. **Nominatim structured** — `?street=...&city=...&state=...&postalcode=...` for better US house-number hit rate
4. **U.S. Census Bureau Geocoder** — public-domain TIGER/Line interpolated, catches what OSM misses

**Reverse geocoding:** Nominatim primary → Census reverse fallback → feature-properties last resort.

**Per-state lookup tables (in `STATE_DATA`):** counties→primary IOU/utility, city POU overrides, counties→cable provider, cities→fiber, city→county fallback, city→school district. Currently 6 states deep: CA, PA, NY, TX, WA, NJ. CA also has CCA (Community Choice Aggregator) data — other states' CCAs deferred.

**Schools & parks:** OpenStreetMap Overpass API (4 mirrors with fallback chain) for schools, dog parks, playgrounds, trails, libraries, pools, community centers within 2.5–3 mi.

**USDA zones:** ~150 cities directly mapped + 50-state default + latitude-based fallback. Plant DB has 39 entries spanning zones 3–13, filtered by user's zone, categorized as Trees / Shrubs / Perennials / Edibles.

**Climate risks:** heuristic scoring by state + USDA zone + city overrides. Deep-links to FEMA Flood Map, Cal Fire FHSZ, AirNow.gov. Disclaimer that scores are rough estimates.

### Files in workspace

These all live in the user's "Personal" folder (also synced to local computer):

| File | Purpose |
|---|---|
| `index.html` | The deploy-ready production file. Push to GitHub for auto-deploy. |
| `homeatlas.html` | Working copy (we edit this, then `cp` to `index.html` to ship). |
| `HomeAtlas_Project_Brief.md` | **THIS FILE — paste into new Claude chats to resume.** |
| `HomeAtlas_Release_Notes.md` | Running changelog. New release notes go at the top. |
| `HomeAtlas_Deployment_Guide.md` | Step-by-step GitHub + Cloudflare Pages walkthrough. |
| `HomeAtlas_Tooling_Hosting_Roadmap.md` | UI tools, hosting cost roadmap by phase, backend requirements per phase. |
| `HomeAtlas_Domain_Names.md` | Domain shortlist with availability research. |
| `CA_Zoning_Lookup_Plan.md` | Original architecture plan from v0.1. Phased roadmap. |

### Decisions locked in (don't relitigate)

- **Privacy v1:** no accounts, no address storage, no server. Geocoding traffic goes to OSM/Census.
- **Privacy v2 (when monetizing):** opt-in accounts → saved addresses → personalized recs/ads.
- **Hosting:** Cloudflare Pages free tier; eventual paid tier ~$25-30/mo at Phase 4 scale.
- **Domain:** working name `HomeAtlas`. **Top recommendation: `homeatlas.app`** (~$15/yr at Cloudflare). `.com` likely parked.
- **Architecture stays location-agnostic from day one** — same address-to-polygon mechanic for everything; per-state data is just a lookup map.
- **No paid APIs in core flow.** Mapbox/Google/GreatSchools may come later as premium-tier features.
- **Footer mailto placeholder is `CHANGE-ME@example.com`** — Satya needs to swap to a personal/dedicated feedback email (NOT his work `svelivela@paypal.com`) before public launch.

### What's coming next (roadmap)

- **v0.23 (Phase 3 start):** kids activities & events feed (Eventbrite API + city rec departments). Needs free Eventbrite account & API key. First small backend (Cloudflare Worker for caching + key storage).
- **Phase 3 follow-ups:** home image (Mapillary), invite-a-friend share link, data corrections via mailto.
- **Phase 4 (3-6 months):** Supabase (auth + Postgres), saved addresses, "My homes" dashboard. ~$25/mo.
- **Phase 5:** community posts, comments, ratings. Email + moderation. ~$30-50/mo.
- **Phase 6:** premium tier ($9/mo) — paid GreatSchools API, First Street climate, Mapbox geocoding, full house-anatomy module unlocked by year-built input.

(Full roadmap in `HomeAtlas_Tooling_Hosting_Roadmap.md`.)

### Conventions to follow

- **Always update the release-notes block at the bottom of every iteration's response.** Format: `## vX.Y — YYYY-MM-DD — Headline` + 3-7 bullets focused on what visibly changed. Satya copies these to the top of `HomeAtlas_Release_Notes.md` and commits.
- **Sync `homeatlas.html` → `index.html` after every iteration.** `cp` is enough.
- **Verify changes** by lint-checking JS syntax + grep-checking that key markers (function names, IDs, CSS classes) are present in the file. Sandbox-eval resolvers when possible.
- **Be honest about limits.** Free data sources have gaps. Don't pretend Census Geocoder has 100% coverage when it has ~95%. Don't show fake school ratings; link to GreatSchools instead.
- **Mobile responsive matters.** Section headers, tables, and grids must collapse cleanly on phones. Test at 375px and 700px breakpoints mentally.
- **Skip emojis in code/files unless user requests them.** They're already used in the UI as icons; don't add gratuitously.

### How to resume

When the user gives you their next request, you should:
1. Acknowledge you have full context (don't re-summarize the brief unless asked)
2. Reference the relevant prior version if useful
3. If you need to edit `index.html`, ask the user to paste it OR have them re-upload it (since the Cowork sandbox is gone)
4. Output release notes block at the end

If you don't have file access (e.g., personal Claude.ai chat without Projects), the user can paste `index.html` content directly. For complex multi-file editing, they should use Claude Code or Claude Cowork.

## --- END BRIEF ---

---

## How to actually carry this to a new account / conversation

### Option 1: claude.ai (web/mobile, personal account) — easiest

1. Open https://claude.ai in your personal account.
2. Click **Projects** → **Create new project** → name it "HomeAtlas".
3. Upload these files to the project as knowledge: `HomeAtlas_Project_Brief.md` (this file) + `index.html` (the current site) + `HomeAtlas_Release_Notes.md`.
4. Set the project's "Custom instructions" to: *"I'm working on HomeAtlas, a single-page home-knowledge web app. Refer to the project knowledge for full context. Always provide release notes at the end of each iteration."*
5. Start a new chat in that project. Claude will have all the context automatically. Just say "let's continue — I want to add X" and you're back.

### Option 2: claude.ai without Projects (free tier)

1. Open a new chat in https://claude.ai.
2. Paste the **entire BEGIN BRIEF / END BRIEF** block above as your first message.
3. Then paste your `index.html` (or attach as a file).
4. Then ask your actual question.

### Option 3: Claude Code (CLI / IDE)

1. `cd` into your HomeAtlas working folder (where `index.html` lives).
2. Save this file (`HomeAtlas_Project_Brief.md`) in the same folder.
3. Run `claude` in the folder. Claude Code automatically reads `*.md` files in the project for context.
4. Optional: rename it to `CLAUDE.md` — that's the convention name Claude Code looks for first.

### Option 4: Continue in this same Cowork

If you keep using corporate Cowork: just keep going. The conversation thread is preserved. Files in your Personal folder persist on your computer.

### What you LOSE when switching

- The chat history of our prior 26 iterations (Claude doesn't see them in a new account)
- The auto-memory I've built up (tied to this Cowork environment)
- Any in-progress edits not saved to a file

### What you KEEP

- All files in your computer's Personal folder (your selected workspace folder)
- Your GitHub repo with the latest `index.html`
- Your live deployment at https://homeatlas.satyabhanuv.workers.dev/
- This brief, which encodes the conversation's most important state

### Practical tip

**Before switching accounts, take 2 minutes to:**

1. Make sure `index.html` is committed to GitHub (your code is safe)
2. Open this file (`HomeAtlas_Project_Brief.md`) — if it looks current, you're set
3. Note any decisions/ideas from the chat history that aren't captured here yet, and add them to the brief

The brief is the bridge. Keep it up to date and you can pick up wherever, in any Claude product, with any account.

Last updated: 2026-04-30 · v0.22 shipped
