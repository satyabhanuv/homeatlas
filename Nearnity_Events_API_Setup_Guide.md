# Nearnity Events API — Tomorrow Morning Deployment Guide

**For:** Satya
**Goal:** Deploy `nearnity-events-worker.js` so every US city automatically gets concerts, sports, theater, family entertainment (Ticketmaster + SeatGeek) plus civic/parks events for known cities (iCal scraping). No more per-city manual seed entry.
**Total time:** ~30 minutes of clicking through dashboards + 2 free API signups.

---

## Step 1 — Get the two free API keys (10 min)

### Ticketmaster Discovery API
1. Go to https://developer.ticketmaster.com and create a free developer account.
2. Once logged in, go to **My Apps** → **Add New App** → name it `Nearnity` → submit.
3. You'll be shown two keys: **Consumer Key** and **Consumer Secret**. **You only need the Consumer Key.** Copy it.
4. The free tier allows **5,000 API calls/day** — more than enough for V1.

### SeatGeek API
1. Go to https://platform.seatgeek.com and create a free developer account.
2. Go to **Account → API Access** → click **Create a new client**.
3. Name it `Nearnity` → submit.
4. Copy the **Client ID** (the long alphanumeric string). You don't need the Client Secret.
5. Free tier is generous — no hard daily limit for personal use.

**Park both keys in a notes file for the next steps.**

---

## Step 2 — Create a Cloudflare KV namespace for caching (3 min)

KV is Cloudflare's key-value store. The Worker uses it to cache API responses for 1 hour, so repeated queries from the same area don't hammer the upstream APIs.

1. Cloudflare dashboard → **Workers & Pages** (left sidebar) → **KV** (under "Storage")
2. Click **Create a namespace**
3. Name: `nearnity_events_cache`
4. Click **Add**
5. Copy the **Namespace ID** that appears (you'll bind it to the Worker in Step 3)

---

## Step 3 — Deploy the events Worker (10 min)

You have two options. Option A (dashboard) is fastest. Option B (wrangler CLI) is cleaner long-term.

### Option A — Dashboard deploy (recommended for first deploy)

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Create Worker**
2. Name: `nearnity-events`
3. Click **Deploy** (you'll edit the code next)
4. Once deployed, click **Edit code** (top-right)
5. **Delete all the default code** in the editor.
6. **Copy the entire contents** of `/sessions/.../Personal/nearnity-events-worker.js` (from your folder) and paste into the editor.
7. Click **Save and deploy**.

### Configure environment variables + KV binding

8. Back in the Worker's dashboard page, go to **Settings** tab → **Variables and Secrets**.
9. Click **Add variable** for each:
   - Type: **Secret**, Name: `TICKETMASTER_KEY`, Value: *paste your Ticketmaster Consumer Key*
   - Type: **Secret**, Name: `SEATGEEK_CLIENT_ID`, Value: *paste your SeatGeek Client ID*
10. Click **Save**.
11. Same Settings tab → scroll to **Bindings** → **KV Namespace Bindings** → **Add binding**:
    - Variable name: `EVENTS_KV`
    - KV namespace: select `nearnity_events_cache` (from Step 2)
12. Click **Save**.

### Test the Worker's default URL

13. The Worker is now live at `https://nearnity-events.YOUR-SUBDOMAIN.workers.dev` (Cloudflare shows you the URL on the Worker's overview page).
14. Open: `https://nearnity-events.YOUR-SUBDOMAIN.workers.dev/api/health`
    - Should return JSON: `{"status":"ok","ticketmaster":"configured","seatgeek":"configured","kv":"bound",...}`
    - If any say `missing`, recheck Step 9–11.
15. Test the events endpoint: `https://nearnity-events.YOUR-SUBDOMAIN.workers.dev/api/events?lat=37.32&lon=-122.03&radius=10&city=cupertino&state=CA`
    - Should return JSON with `events: [...]` and `sources: {ticketmaster: N, seatgeek: N, civic: N}`
    - If Cupertino works, the deploy is good.

---

## Step 4 — Route `nearnity.com/api/*` to the events Worker (5 min)

This is what makes the frontend's calls to `/api/events` route to the new Worker instead of trying to fetch a static file from the existing site.

1. Cloudflare dashboard → select the **`nearnity.com` zone** (not the Worker page)
2. Left sidebar → **Workers Routes** (might be under **Rules**)
3. Click **Add route**
4. Route pattern: `nearnity.com/api/*`
5. Worker: select `nearnity-events`
6. Click **Save**

Test by opening `https://nearnity.com/api/health` in a browser. Should return the same JSON as Step 3 #14. If it does, the route is wired up.

---

## Step 5 — Push the updated `index.html` (5 min)

The local copy at `/sessions/.../Personal/index.html` (v0.56) has the frontend code that calls `/api/events`. Push it to GitHub:

1. GitHub.dev → replace `index.html` with the local v0.56 copy.
2. Commit message: `v0.56 — Live event aggregator via /api/events Worker`
3. Push → Cloudflare Pages auto-deploys.
4. Hard-refresh `nearnity.com` on phone (Cmd-Shift-R / Ctrl-F5). Header should show **v0.56**.

---

## Step 6 — Verify end-to-end (3 min)

Test in your browser:

1. Open `nearnity.com` → enter a city in any of your 7 launched states (try **Cupertino, California** — the one that broke before)
2. Tap **Around me → Events → Happening this month**
3. Within ~3 seconds, you should see events appear. Concerts at Shoreline Amphitheatre, anything at SAP Center, theater at Flint Center if it's still operating — Ticketmaster results.
4. Try another: **Walnut Creek, CA** → should get concerts/comedy at Lesher Center, etc.
5. Try a city outside the 7 states: **Boise, ID** → should still work (Ticketmaster covers everywhere) — proves it scales.

If you see events: ✅ done.

If you see "No events" with the empty state:
- Open browser DevTools (F12) → Console — look for `[api/events]` errors
- Hit `https://nearnity.com/api/health` directly to verify the Worker is up
- Set `window.NEARNITY_DEBUG = true` in the console and re-search to see debug output

---

## What you now have

**For ANY US city in ANY of your 7 launched states (and beyond):**
- Concerts, sports, theater, comedy, family entertainment (Disney on Ice, etc.), big festivals — automatically. No manual seed entry. **This is the architecture pivot.**

**For 15 California cities you've pre-configured** in the `CITY_CALENDAR_FEEDS` map inside the Worker:
- Civic / parks / rec events scraped from official RSS or iCal feeds. Adding more cities = appending one line to the map and re-deploying.

**Cached for 1 hour per ~1km grid cell** in Cloudflare KV, so repeated queries from the same area are free and instant.

**Free tier headroom:**
- Ticketmaster: 5,000 calls/day → covers ~5,000 unique-location searches/day
- SeatGeek: no hard cap
- Cloudflare Worker: 100,000 requests/day on free plan
- Cloudflare KV: 100,000 reads/day, 1,000 writes/day on free plan

All well within free for V1 + beta traffic. If/when you blow past these, you upgrade per service.

---

## Adding more city iCal feeds later

When you discover a new city's iCal/RSS URL (or a tester reports one):

1. Open `nearnity-events-worker.js` in the Cloudflare Worker editor.
2. Find `const CITY_CALENDAR_FEEDS = {`
3. Add a new entry, e.g.:
   ```js
   "los altos,CA": {
     url: "https://www.losaltosca.gov/calendar.rss",
     fmt: "rss",
     fallback: "https://www.losaltosca.gov/calendar",
   },
   ```
4. Click **Save and deploy**. KV cache may take 1h to fully refresh.

For now I've seeded 15 California cities. You can expand by city or by state as feedback comes in.

---

## Known limitations (be honest about these)

- **CivicPlus RSS quality varies.** Many city RSS feeds list events with publish dates, not event dates, so my parser uses regex to extract dates from the title/description. For ~70-80% of CivicPlus cities this works; for the rest, events may appear without a date or get filtered out.
- **Ticketmaster doesn't index farmers markets, library story times, most civic stuff.** Those still need iCal or the curated seed.
- **First request to a city is slower** (~2-5 seconds) because all three APIs are queried in parallel. Subsequent requests within an hour are KV-cached and instant (~50ms).
- **The Worker has no auth.** If someone scrapes your endpoint heavily, you'll burn API quota. For V1 this is acceptable; if it becomes a problem, add a simple rate limit by IP using Cloudflare's built-in Rate Limiting rules.

---

## Rollback plan

If anything goes wrong post-deploy:
1. **Frontend**: revert `index.html` to v0.55 (without the API fetch) — `git revert` or push the previous commit.
2. **Worker**: Cloudflare keeps every deployment. Workers & Pages → your worker → **Deployments** tab → click the previous version → **Rollback**.
3. **Route**: if you only deployed the Worker without changing the frontend, deleting the route at `nearnity.com/api/*` reverts the frontend to its "fail gracefully, fallback to curated seed" behavior.

The frontend `fetchApiEventsForLocation` is designed to fail silently — if the Worker is down or 404s, the curated seed still renders. No user-visible breakage even if the Worker has bugs.

---

**Estimated total time from start to live: 30 minutes**, mostly waiting for forms to load and clicks in the Cloudflare dashboard.

Tell me when it's deployed and I'll do a full end-to-end test across multiple cities in your 7 states.
