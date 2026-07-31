# Production Roadmap — v2 line (nearnity.com)

_Live at nearnity.com — currently serving all real traffic. Kept working until v3 fully cuts over on Sep 15._

**Current live version:** v2.8.2a (`index.html`) + Worker `v3.0.1` (backend fixes just landed)
**Launch target:** Sep 15, 2026 (buffer to Sep 29)
**Tier framework:** Tier 1 must be 100% nationwide (Safety/Emergency, Events, Libraries, NPS)

---

## 🟢 Shipped in production

- v2.7.9 → v2.8.2a: medical KV pipeline, events data layer (Ticketmaster + NPS + USDA + BiblioCommons + Socrata), school-map color coding, SABS assignment plumbing.
- Worker v3.0.1 (just built): per-source KV keys (fixes overwrite bug), past-event filter (kills stale cache like Trevor Noah), reactive on-demand ingest (`ctx.waitUntil` populates empty states without admin URLs).

---

## 🚨 Blocking launch (must ship before Sep 15)

### Data population — Tier 1
- [ ] **Bulk-ingest all 51 states for medical** (CMS + NPPES → `/api/medical-radius`)
- [ ] **Bulk-ingest all 51 states for events** (Ticketmaster + NPS + USDA — nationwide adapters)
- [ ] **SABS attendance-zone data loaded to KV** — v2.8.2b GitHub Action needs to RUN. Code is ready; just needs manual trigger from Actions tab + 3 secrets (CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN).
- [ ] **Cron trigger back on** (throttled `*/15 * * * *` to fit under 1000-writes/day KV limit) OR rely on reactive ingest.

### QA after Worker v3.0.1 deploys
- [ ] Confirm `/api/health` shows `worker_version: v3.0.1`
- [ ] `/api/events-radius` for San Jose: expect USDA + TM + NPS merged results (no more USDA-only)
- [ ] Trevor Noah stale event gone (past-date filter working)
- [ ] Hit `/api/events-radius?state=NY` → should return empty with `reactive_ingest: true` first time, then populate on retry

### Known bugs still open
- [ ] Cards on v2 index.html sometimes show `ticketmaster.com/event/{id}` URLs that 404 — v3.0.1 past-event filter should mask this by dropping past shows before render. Verify.
- [ ] Some events don't have proper `start_date` (e.g. TM legacy records) — dedupe key might collide. Monitor after v3.0.1 deploy.

---

## 🟡 Deferred to post-launch (v2.9+ or v3.1)

- Task #17: Racer waitlist (ski-resort medical + event medical). Niche persona, defer.
- Task #16: PCFMA farmers market adapter — USDA already covers markets; kill this line item.
- Task #3: BiblioCommons library events adapter — DONE in v2.7.11.4, close this task.
- Chain adapters (Concentra, Sutter, PAMF) — belong in v3.0.1 chain-adapter batch (see V3_Roadmap).

---

## Deployment path for v2 line

v2 doesn't need any more feature ships. The only remaining work is **data population** (bulk-ingest + SABS GHA) and QA. Once v3 is ready, we swap the Cloudflare Pages root file from `index.html` to `index_v3.html` (or rename v3 → index.html + move v2 → index_v2.html for graceful rollback).

Post-launch: v2 stays as a legacy fallback URL for ~30 days while we monitor v3 metrics.
