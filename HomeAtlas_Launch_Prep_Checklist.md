# HomeAtlas — Launch Preparation Checklist

**For:** Satya
**Prepared:** 2026-05-13 (paused for MLO exam, resume **Saturday May 23rd**)
**Status:** Pre-launch readiness package

This is everything you should review before our Saturday session so we can hit the ground running on real-world pilots, deployment hardening, and the business-side work that has to happen *before* a public launch.

---

## 1. State of the union — where HomeAtlas is today

You've shipped **31 iterations** (v0.30 → v0.49.8). The product currently does:

- **Search by service**, with a 45-entry curated query list (farmers market, hospital, food bank, library, DMV, free clinic, etc.) — autocomplete maps each to the right section.
- **Location resolution** via address autocomplete, Near Me geolocation, or ZIP entry.
- **5 top-level categories** (Around me · My home · Help · Civic · Safety & risks) with about 20 services across them.
- **Curated event calendar** with 56 seed events (markets, festivals, concerts, art walks, kids events) across SJ, Milpitas, Sunnyvale, SF, Phoenixville, KOP, Philly. Distance-based filter — calendar and venue subtabs now show the same things.
- **Persistent emergency rail** — 911 / 988 / 211 with descriptions of when to call each.
- **HRSA Find a Health Center API** integration for federally-qualified free clinics (live federal data).
- **Quality-tier badges** (Verified / OSM / Fallback dots) on every row.
- **Calendar view** for events with month grid + selected-day agenda side-by-side.
- **Browser back/forward** via URL params + history API.
- **Click logo to reset** to clean landing.

**Already deployed:** `https://homeatlas.satyabhanuv.workers.dev/` (Cloudflare Workers, free tier, auto-deploys from GitHub push to `index.html`).

**Codebase:** single-file static HTML+CSS+JS, ~566 KB compressed. No backend, no database, no user accounts. Privacy-by-default.

---

## 2. Pre-launch technical checklist

Tick these before the public launch (target: ~2 weeks after Saturday session, so early June).

### Performance + reliability
- [ ] **PageSpeed Insights** check on the live URL — target Performance ≥ 85 mobile, ≥ 95 desktop. (https://pagespeed.web.dev)
- [ ] **Lighthouse** full audit — Accessibility ≥ 90, SEO ≥ 90, Best Practices ≥ 95.
- [ ] **Mobile testing** on real devices — iOS Safari, Android Chrome. Try Near Me, autocomplete, calendar swipe, focus mode.
- [ ] **Slow-3G simulated load** in Chrome DevTools — make sure first paint < 2.5 s, search returns within 8 s.
- [ ] **Uptime monitoring** — set up **UptimeRobot free tier** (https://uptimerobot.com), 5-min interval, alert your email + SMS.
- [ ] **Error tracking** — set up **Sentry free tier** (5K events/month) (https://sentry.io). Wrap the main JS in a try/catch that reports.
- [ ] **Manual smoke test** of every service-query path (farmers market, free clinic, fire station, DMV, voter reg, food bank, school, library, mental health, hospital). Verify each lands on the right section.

### Browser support
- [ ] Test on **Chrome, Safari, Firefox, Edge** (latest)
- [ ] Test on **Safari iOS 16+** and **Chrome Android**
- [ ] **Don't promise IE 11 support** — drop a "modern browser required" notice in the footer

### Content / data
- [ ] Replace any **placeholder phone numbers / addresses** in the curated seed with verified entries (Sacred Heart, LifeMoves, Philabundance, etc.). Cross-check from each org's homepage that the listed number + URL is current.
- [ ] **Re-run the scraper** (`python3 scrape_events.py`) on your laptop the day before launch to refresh the event seed.
- [ ] **Add a "Last updated" footer** showing when the data was refreshed.

### SEO + sharing
- [ ] **OG tags** — open the HTML, find the `<meta property="og:*">` block and set:
  - `og:title` = "HomeAtlas — Everything about your home, your neighborhood, your community."
  - `og:description` = "County-verified data on utilities, schools, parks, free clinics, events, and civic services. No paid placement."
  - `og:image` = 1200×630 PNG (you'll need to design or generate this — Canva free, 1200×630)
- [ ] **Twitter cards** — `twitter:card`, `twitter:image` same dimensions
- [ ] **Favicon** — already have the blue house logo; export as `favicon.ico` (16×16 + 32×32) and `apple-touch-icon.png` (180×180)
- [ ] **robots.txt** — allow everything: `User-agent: *\nDisallow:`
- [ ] **sitemap.xml** — just the one URL for now: `https://homeatlas.io/`

### Privacy + security
- [ ] **HTTPS enforced** — Cloudflare handles this automatically; verify the lock icon
- [ ] **CSP header** — add via Cloudflare Rules: `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src * data:; style-src 'self' 'unsafe-inline'; connect-src *;`
- [ ] **No tracking cookies** (we have none — verify with browser DevTools)
- [ ] **localStorage audit** — we use one key (`homeatlas:radius:v2`). Document it.

---

## 3. Domain + DNS

### Buy `homeatlas.io`

Three options, in order of recommendation:

| Registrar | Price/year | Privacy | Notes |
|---|---|---|---|
| **Cloudflare Registrar** | **$33/yr** | Free WHOIS privacy | Cheapest. Domain + DNS in one place. Recommended. |
| Namecheap | ~$45/yr | Free privacy | Good UX. |
| Google Domains → Squarespace | discontinued | n/a | Don't. |

**Steps with Cloudflare Registrar:**
1. Log in to dash.cloudflare.com → Domain Registration → Search "homeatlas.io"
2. Buy. ~10 min for the registration to settle.
3. DNS records → add `CNAME homeatlas.io → homeatlas.satyabhanuv.workers.dev` (or migrate to Pages — see below).
4. SSL/TLS → Full (strict).
5. Cloudflare auto-issues a free SSL cert.

### Consider migrating to **Cloudflare Pages** (vs Workers)

Currently you're on Workers. Pages is the better fit for a static site:
- Cleaner git-driven deploys (no `wrangler` CLI needed for non-Worker code)
- Custom domain UI is simpler
- Same free tier limits

To migrate (~30 min):
1. Cloudflare dash → Pages → "Connect to Git"
2. Pick your GitHub repo
3. Build command: blank. Output directory: `/` (root). Or wherever `index.html` lives.
4. Add custom domain `homeatlas.io` → Cloudflare auto-configures DNS.
5. Update homeatlas.io → CNAME points at the new `<project>.pages.dev`.

### Backup domains to grab while you're there (defensive)

- `homeatlas.com` — if available, ~$15/yr. Redirect to .io.
- `homeatlas.app` — ~$20/yr.

Total domain cost: **~$70/yr** for all three.

---

## 4. Business formation (LLC + EIN + bank)

### Why form an LLC

- **Limit personal liability** — if a user sues you because they relied on outdated info to drive to a closed clinic, the LLC absorbs the hit instead of your personal assets.
- **Cleaner tax filings** — keep business income/expenses separate from personal.
- **Required for opening a business bank account, getting business credit, signing API contracts.**

### Where to form

You're in California. Two real choices:

| Option | Setup cost | Annual cost | Notes |
|---|---|---|---|
| **California LLC** | **$70** filing | **$800 minimum franchise tax** | Required even if no revenue. Painful but legally cleanest if you live here. |
| Delaware LLC + register as foreign in CA | $90 + ~$200 = $290 | $800 CA franchise tax + $300 DE | Worse. Only sensible if you have outside investors. |

**Recommendation: California LLC.** $800/year is the cost of doing business here. Don't fight it.

**Steps (~2 hours of work, ~3 weeks elapsed):**
1. **Pick a name.** "HomeAtlas LLC" — check availability at https://bizfileonline.sos.ca.gov
2. **File Articles of Organization (Form LLC-1)** online at bizfileonline.sos.ca.gov → ~$70.
3. **Designate a Registered Agent.** Can be you (must have a CA street address — not a PO box). Or pay a service like Northwest Registered Agent (~$125/yr) if you don't want your home address on public records.
4. **Wait ~2-3 weeks** for the state to process.
5. **File Statement of Information (Form LLC-12)** within 90 days — $20.
6. **Get an EIN from IRS** — free, online, takes 5 minutes: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online. Pick "LLC" as entity type, "single-member" if it's just you. EIN issued immediately.
7. **Open a business bank account.** Recommended: **Mercury** (free for startups), **Relay** (free), or **Chase Business Complete** ($15/mo waivable). Bring your EIN + LLC formation docs.
8. **Operating Agreement** — even for a single-member LLC, draft one. Free templates: https://www.docracy.com or https://www.lawdepot.com (free trial). Sign it, keep on file.

**Total LLC startup cost: ~$100 first-year (not counting CA's $800 franchise tax which is due by month 4).**

### Trademark "HomeAtlas"

- **Search USPTO TESS** first: https://tmsearch.uspto.gov/search — see if "HomeAtlas" is already registered in your class (likely Class 42: software services).
- If clear: **file a TEAS Plus application** — $250/class. Self-filing is doable; or use **Trademarkia** / **LegalZoom** for ~$500-800 with attorney review.
- **Worth doing before public launch.** Otherwise someone else can register it after you make it visible.
- Alternative: ™ (no registration) until revenue justifies the $250.

### DBAs

Not needed if you operate under "HomeAtlas LLC." If you want to operate under just "HomeAtlas" without the LLC suffix, file a **Fictitious Business Name (DBA)** with Santa Clara County — ~$50 + ~$50 newspaper publication.

---

## 5. Legal pages

Two pages you need before launch:

### Terms of Service
- **Limitation of liability** — "data is provided as-is, verify directly before relying on it"
- **Permitted use** — personal, non-commercial. No scraping.
- **Indemnification**
- **Governing law** — California
- **Disclaimer specific to emergencies** — "If you have a medical, fire, or police emergency, call 911. HomeAtlas is not a substitute for emergency services."

### Privacy Policy
- **What we collect** — nothing personal. Geolocation (in-browser only, not stored). Address text (in-browser only, not stored). No accounts. No cookies (except `localStorage` for radius preference).
- **Third parties** — Nominatim (OpenStreetMap), Photon (Komoot), Census Geocoder, HRSA — link to each privacy policy.
- **Children** — site is general-audience but not directed at children under 13.
- **Contact** — `feedback@homeatlas.io` (set up below)

**Templates to start from:**
- **Termly** — free generator: https://termly.io/products/terms-and-conditions-generator/
- **iubenda** — paid (~$30/yr) but bulletproof for GDPR/CCPA. Worth it if you ever go international.

**My recommendation:** Termly's free generator → review by you → publish at `/terms` and `/privacy`. Total ~1 hour.

---

## 6. Email + feedback

You need a real address before launch. Options:

| Option | Cost | Setup time |
|---|---|---|
| **Email forwarding via Cloudflare** | Free | 5 min |
| **Google Workspace** | $6/mo | 15 min |
| **iCloud Custom Domain** | $0.99/mo (in iCloud+) | 10 min |

**Recommended for V1: Cloudflare Email Routing (free).**
- Cloudflare dash → Email → Email Routing → set `feedback@homeatlas.io → svelivela@paypal.com`
- Free. Done in 5 minutes.
- Upgrade to Workspace later when you want a real inbox at the domain.

Update HomeAtlas footer mailto link to `feedback@homeatlas.io` once configured.

---

## 7. Analytics + monitoring

### Analytics (privacy-first)

| Tool | Cost | Hosting | Notes |
|---|---|---|---|
| **Cloudflare Web Analytics** | Free | Cloudflare | Privacy-friendly. No cookies. Set up in 2 min on Cloudflare dash. **Start here.** |
| Plausible | $9/mo for 10K visitors | EU | Strong privacy, nice UX. |
| Fathom | $14/mo | Canada | Similar to Plausible. |
| GA4 | Free | Google | Powerful but adds tracking + cookies. **Don't use** — breaks our privacy posture. |

**Recommended: Cloudflare Web Analytics**. Toggle on in dash. Free, no JS to add (Cloudflare injects it). Privacy-friendly.

### Custom event tracking

Once analytics is on, track:
- Search submissions
- Service-query selections (which services are most-searched)
- Section views (which categories get the most clicks)
- "Call X" button clicks
- "Show all" / Browse-all click rate
- Average radius selected

This tells you what to invest in next.

### Performance monitoring

- **Cloudflare Pages built-in analytics** (free) — Core Web Vitals, error rates.
- **Sentry free tier** — JS errors. Wrap key flows in try/catch and `Sentry.captureException()`.

### Uptime + status

- **UptimeRobot** — free 50 monitors, 5-min interval. Alert email + SMS.
- **Statuspage** — overkill for now. Skip.

---

## 8. Pilot plan (the "before public launch" testing phase)

Run a **2-week beta** before the public launch. Target audience: 10-20 people.

### Recruit beta users

- **5 friends/family in CA** — Bay Area, mixed tech-savviness
- **3-5 in PA** (Phoenixville area) — different metro to test the second-region coverage
- **2-3 mobile-only** users to stress-test the mobile UX
- **2-3 with specific needs**: someone with a kid in school district, someone who recently moved, someone looking for community resources

### What each beta user should do (15-min scripted test)

1. Visit the URL on phone
2. Tap **Near me** → grant permission → see results
3. Search for **"farmers market"** → calendar view → click an event
4. Search for **"free clinic"** → focused view → click "Call" on the top result
5. Search for **"DMV"** → land on civic section
6. Tap browser back → confirm previous search returns
7. Tap **HomeAtlas** logo → confirm reset
8. Fill a 5-question feedback form

### Feedback form (Google Forms or Typeform)

- Did the page load in <3 seconds? (yes/no/varied)
- Was the dual search bar (Looking for / Near) obvious how to use? (1-5 scale)
- Could you find what you wanted in ≤2 actions? (yes/no/which thing)
- Did anything look broken or confusing? (free text)
- Would you use this again? (yes/no/maybe — why)
- One thing that surprised you (good or bad) (free text)

### Metrics to track during pilot

- **Bounce rate** — % who load and leave without clicking
- **Search submission rate** — % who actually type and search
- **Call/Directions/Open click rate** — % who take a primary action
- **Time to first action** — how long from load to first meaningful click
- **Browser distribution** — Chrome vs Safari vs Firefox split
- **Mobile vs desktop split**

### Iteration target

- 1 week of beta → triage feedback into bugs / UX issues / feature requests
- 1 week of fixes (could be multiple deploys per day)
- Then go public

---

## 9. Deployment workflow + dev-impact analysis

### Current state

- Single-file `index.html` in your GitHub repo
- Pushed via GitHub.dev (`.` keystroke on the repo page) because the file is too big for the web editor's commit button
- Cloudflare Workers picks up the change and deploys in ~30 seconds
- No staging — every push goes live

### What needs to change before launch

**1. Add a staging environment.**
- In Cloudflare Pages: every Git branch can be a "preview deployment" with its own URL.
- Workflow: work in `staging` branch → preview URL → manual smoke test → merge to `main` → production deploys.
- Setup: ~10 min after migrating to Pages.

**2. Add a smoke-test script.**
- Bash + curl that verifies: page loads, key text present, no JS errors in console (via Puppeteer or Playwright).
- Run automatically on every PR.
- ~1 hour to build.

**3. Document deploy frequency.**
- During pilots + first 30 days post-launch: deploy whenever needed, often multiple times per day.
- After that: 1-2 deploys per week is healthy.
- Avoid Friday afternoon deploys (no one to fix issues on the weekend).

**4. Rollback plan.**
- Cloudflare Pages keeps every deployment — one click to roll back.
- Document the exact steps so you don't have to figure it out at 11 PM with users complaining.

### Cost projection

| Traffic level | Cloudflare Pages | Domain | Email | Sentry | UptimeRobot | LLC | Total |
|---|---|---|---|---|---|---|---|
| Pre-launch (you + 10 testers) | $0 | $33/yr | $0 | $0 | $0 | $800/yr | **~$70/mo** |
| 1K visitors/mo | $0 | same | same | $0 | $0 | same | same |
| 10K visitors/mo | $0 | same | same | $0 | $0 | same | same |
| 100K visitors/mo | $0 (Pages handles this on free tier) | same | upgrade to Workspace $6/mo | $26/mo (10K events) | $7/mo (paid tier) | same | **~$110/mo** |
| 1M visitors/mo | ~$20/mo (over free tier requests) | same | same | $26/mo | same | same | **~$140/mo** |

**Cloudflare Pages free tier:** 500 builds/mo, unlimited requests, unlimited bandwidth. Generous.

**Most expensive line item: CA LLC franchise tax ($800/yr).** Everything else is cheap. The whole stack at modest traffic is **<$100/mo**.

---

## 10. Marketing / pre-launch outreach

You're not going to spend money on ads. Strategy = earned attention + word of mouth.

### Pre-launch (during pilot)
- Set up **Twitter/X** as `@HomeAtlasApp` (or similar) — claim the handle.
- Set up **LinkedIn page** — short description, link to live site.
- Optional: **Instagram** for screenshots (low priority).
- Buy `@homeatlas` handles on each platform anyway, to prevent squatting.

### Launch week
- **Show HN** post on news.ycombinator.com — title: "Show HN: HomeAtlas — Everything about your home in one tab". Pick a Tuesday or Wednesday morning EST. Tell the launch story in 2-3 paragraphs.
- **ProductHunt** launch (https://www.producthunt.com). Schedule for the same week. ~12 PM PT launch time.
- **Hyperlocal newspapers** — pitch to: San Jose Mercury News (Sal Pizarro for general SJ stories), San Francisco Chronicle, Phoenixville News (local interest). Subject: "New tool helps residents find local services in one place — built in [your home town]."
- **Reddit** — r/bayarea, r/sanjose, r/sanfrancisco, r/Pennsylvania, r/Philadelphia. Be honest you're the creator. Lead with the 211 / 988 / 211 emergency rail and free-clinic finder — that's the strongest "this is useful" hook.

### Tone
- "Public-data tool, no paid placement" — that line is your differentiator. Lead with it.
- Don't oversell coverage. Be specific: "Bay Area + Philadelphia metro for V1; adding states monthly."

---

## 11. Soft launch → public launch sequencing

```
Week of May 23 (when you're back)
├─ Day 1 (Sat May 23):  Saturday session — review this doc, set firm dates
├─ Day 2-3 (Sun-Mon):   Domain purchase, LLC filing, email setup
├─ Day 4-7:             Pilot user recruitment + onboarding
└─ Day 8-14:            Pilot runs, feedback collection

Week of Jun 1
├─ Triage feedback, fix top 5 issues
├─ Set up analytics + monitoring
└─ Draft ToS + Privacy

Week of Jun 8
├─ Legal pages live
├─ Trademark filing
├─ Final smoke tests on mobile + desktop
└─ Update OG tags + favicon + sitemap

Week of Jun 15
├─ Soft launch — share with extended network (LinkedIn, your immediate Bay Area circle)
├─ Monitor for 1 week, fix issues as they appear
└─ Make sure analytics are firing

Week of Jun 22  ← TARGET PUBLIC LAUNCH
├─ Show HN Tuesday morning
├─ ProductHunt Wednesday
├─ Reddit posts staggered through the week
└─ Press pitches
```

**Total: ~5 weeks from Saturday session to public launch.** Ambitious but doable.

---

## 12. Pre-Saturday homework for you

Before our session, please:

1. **Decide on the LLC name.** "HomeAtlas LLC" or something else?
2. **Decide if you want the trademark filed pre-launch.** $250 USPTO fee + ~2 hours of your time.
3. **Confirm `homeatlas.io` is still available.** Quick check at any registrar.
4. **Pick 8-10 beta users** in your head. We'll write the recruitment message together.
5. **Think about hard timelines.** Is end-of-June launch realistic with your other commitments? Or should we slip to mid-July?
6. **Personal questions** for the LLC:
   - What address will be on public LLC records? (Your home, or pay a registered agent ~$125/yr to use theirs?)
   - Will the LLC have any other owners, or is it just you?

---

## 13. Saturday session agenda

When you're back, we'll go in this order:

**Hour 1 — Real-world testing**
- Pull up the live URL on multiple devices
- Walk through the 15-min beta script ourselves
- Document any bugs we find that block pilots

**Hour 2 — Business setup decisions**
- LLC name + state confirmed
- Email setup walkthrough
- Domain purchase + DNS config (live)
- Termly account for ToS/Privacy

**Hour 3 — Pilot launch**
- Finalize the beta-user invitation message
- Set up feedback form (Google Forms or Typeform)
- Configure Cloudflare Web Analytics
- Set up UptimeRobot

**Hour 4 (if needed) — Roadmap calibration**
- Review v0.50 priorities (USDA Local Food Directory? Better matching for "kids events" filtering?)
- Sequence v0.50 → v1.0 in line with the launch timeline

---

## Quick reference — file inventory

Everything you've built so far lives in `/sessions/.../Personal/`:

- **`homeatlas.html`** + **`index.html`** — the app (565 KB each, identical)
- **`HomeAtlas_Release_Notes.md`** — every iteration documented
- **`HomeAtlas_V1_Sprint_Plan.md`** — original 4-week sprint plan (now superseded by this doc)
- **`HomeAtlas_Data_Sources_Roadmap.md`** — free-source integration priorities (USDA, 211, HRSA, etc.)
- **`HomeAtlas_IA_Restructure_Proposal.md`** — the 5-category nav decision doc
- **`scraper/scrape_events.py`** + **`scraper/events.json`** + **`scraper/README.md`** — event scraper pipeline
- **`HomeAtlas_Launch_Prep_Checklist.md`** — this document

---

**Good luck on the MLO Friday. See you Saturday May 23rd.**
