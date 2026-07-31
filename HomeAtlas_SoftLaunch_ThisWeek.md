# HomeAtlas — Soft Launch This Week

**Date:** 2026-05-23
**Goal:** Share `homeatlas.satyabhanuv.workers.dev` (or `homeatlas.io` if we buy it today) with a 3–5 person trusted circle this week. Get real feedback. Iterate. Defer LLC, trademark, formal beta program.

---

## P0 — must fix before any link goes out (Sat–Sun)

| # | Item | Effort | Owner |
|---|------|--------|-------|
| 1 | **Feedback email** — either patch the mailto to a real address, OR buy `homeatlas.io` + set up Cloudflare Email Routing so `feedback@homeatlas.io` forwards somewhere you'll read. | 30 sec (patch) or 45 min (domain+routing) | Satya |
| 2 | **OG image + Twitter large card** — generate a 1200×630 PNG, host it (Cloudflare or inline data URI), add `<meta property="og:image">` and switch `twitter:card` to `summary_large_image`. | 30 min | Claude drafts, Satya approves |
| 3 | **Deploy** the two fixes above to the live URL. | 5 min | Satya |

---

## P1 — fix this week, OK if first 2-3 testers see them

| # | Item | Effort |
|---|------|--------|
| 4 | Coverage callout currently says "Coming soon: GA, NC, MI." Either ship those three states' depth or rewrite the callout to stop advertising gaps. | 30 min rewrite / ~3 hrs to ship the data |
| 5 | Add `<link rel="canonical">` + `<meta name="robots" content="index, follow">`. | 2 min |
| 6 | Add "Last updated: 2026-05-XX" to the footer (auto-render from build date). | 10 min |
| 7 | One-pass mobile smoke test on your own phone — Near Me, farmers market, free clinic, DMV, browser back, logo reset. Log anything that surprises you. | 15 min |

---

## P2 — post soft-launch backlog

LLC + EIN, trademark filing, Termly ToS/Privacy, Cloudflare Web Analytics, UptimeRobot, Sentry, sitemap.xml, robots.txt, CSP header, Show HN / ProductHunt prep, Reddit / hyperlocal press outreach.

---

## This week's calendar

| Day | Move |
|---|---|
| **Sat May 23** | Kill P0s (#1–#3). Deploy. Test on your phone. |
| **Sun May 24** | P1s (#4–#7). Write the 4-sentence invite message (Claude drafts). Pick 3–5 testers by name. |
| **Mon May 25** | Send the invite to your 3–5 people. Open a feedback note doc to triage incoming. |
| **Tue–Thu** | Read every reply within 12 hours. Ship fixes same-day. |
| **Fri May 29** | Retro with yourself: what surprised you? Decide whether to expand to 15-20 testers next week or hold and fix more. |

---

## What we're explicitly NOT doing this week

- No LLC formation (run in parallel starting next week, doesn't block soft launch)
- No trademark filing (same)
- No legal pages (acceptable risk for a 3–5 person trusted circle; lock down before public Show HN)
- No analytics setup (small-N feedback comes from people talking to you, not dashboards)
- No press / Show HN / ProductHunt (those are public launch, ~3 weeks out)

---

## One decision Satya owes Claude before we start

**Buy `homeatlas.io` today, or patch the mailto and defer the domain?**

- **Buy now:** $33/yr on Cloudflare Registrar. Lets us set up `feedback@homeatlas.io` properly. Brand looks more legit when you share the link. ~45 min total including DNS + email routing.
- **Patch now, buy later:** swap the footer mailto to a real address you already control (e.g., a fresh Gmail). 30-second code change. Domain can come next weekend.
