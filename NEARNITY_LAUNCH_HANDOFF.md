# Nearnity — Launch Handoff (Aug 19, 2026)

**Purpose:** Everything you need to keep Nearnity running and continue development, whether or not you retain your PayPal access after next Monday.

Launch target: **Sunday Aug 31, 2026**. Current shipping version: **v2.9.0-c5** (locally; not yet deployed).

---

## Section 1 — Ownership audit (do TODAY, 30 min)

### ✅ Already verified personal
- **GitHub repo** `github.com/satyabhanuv/homeatlas` — personal account (satyabhanuv). Confirmed 2026-08-05.
- **Cloudflare account** `Satyabhanuv@gmail.com's Account` — personal. Confirmed 2026-08-18 during token creation.

### ⚠️ Verify TODAY

- [ ] **Domain: nearnity.com** — log into your registrar. Common: Cloudflare Registrar (most likely if bought at CF), Namecheap, Squarespace Domains, GoDaddy. Confirm:
  - Registrant email = personal (satyabhanuv@gmail.com)
  - Billing card = personal
  - Auto-renew = ON
  - 2FA = ON

- [ ] **API keys inventory** — for each, log into the developer portal and confirm the account email is personal. If any are on `svelivela@paypal.com`, regenerate under personal email:
  - USDA_KEY — usdalocalfoodportal.com
  - TICKETMASTER_KEY — developer.ticketmaster.com
  - NPS_KEY — developer.nps.gov
  - RIDB_KEY — ridb.recreation.gov
  - AIRNOW_KEY — docs.airnowapi.org
  - RESEND_API_KEY — resend.com (email digest, low urgency)

- [ ] **Cloudflare Worker secrets** — Cloudflare dashboard → your Worker → Settings → Variables → confirm all secret names present:
  - `ADMIN_TOKEN` (value: `2347a88b99662db238e552b8d061fdc56bd638f25731028839dd7889d6db4c5e`)
  - `USDA_KEY`, `TICKETMASTER_KEY`, `NPS_KEY`, `RIDB_KEY`, `AIRNOW_KEY`, `RESEND_API_KEY`

- [ ] **GitHub Actions secrets** — repo → Settings → Secrets and variables → Actions:
  - `CF_ACCOUNT_ID` = `0bae25dae8aa391a8f6cb691419eb814`
  - `CF_KV_NAMESPACE_ID` = `54f8815a584a40129b0745713b30f3f4`
  - `CF_API_TOKEN` = fresh token created 2026-08-18 (Workers KV Storage: Edit scope, no expiry)

---

## Section 2 — Save to password manager (15 min)

Put all of these in 1Password / Bitwarden / iCloud Keychain, in a folder called **Nearnity**:

| Item | Value / Where to get it |
|---|---|
| GitHub login | github.com/satyabhanuv — password + 2FA recovery codes |
| Cloudflare login | dash.cloudflare.com — Satyabhanuv@gmail.com + 2FA recovery codes |
| Domain registrar login | Wherever nearnity.com is registered |
| CF Account ID | `0bae25dae8aa391a8f6cb691419eb814` |
| CF KV Namespace ID | `54f8815a584a40129b0745713b30f3f4` |
| CF API Token (KV write) | Regenerate + save; can only see value once at creation |
| ADMIN_TOKEN | `2347a88b99662db238e552b8d061fdc56bd638f25731028839dd7889d6db4c5e` |
| Worker admin URL prefix | `https://nearnity.com/api/admin/` |
| USDA_KEY | Look up in CF Worker Settings → Variables (can't read value, but note it exists there) |
| TICKETMASTER_KEY | Same |
| NPS_KEY | Same |
| RIDB_KEY | Same |
| AIRNOW_KEY | Same |
| feedback@nearnity.com | Email forwarding — check where it goes and confirm you own that address |

**After 6-month check-in:** rotate ADMIN_TOKEN (it's been visible in shared screenshots).

---

## Section 3 — Full backup (10 min)

Everything on your Mac at `~/Documents/Claude/Projects/Personal/` needs to live in **at least 3 places** — GitHub, your Mac, and a personal cloud.

### 3a. Push everything to GitHub NOW (uncommitted local changes = future work lost)
```bash
cd ~/Documents/Claude/Projects/Personal
git status                      # eyeball what's uncommitted
git add -A
git commit -m "Full snapshot pre-Aug 19 handoff"
git push
```

### 3b. Zip local folder → personal cloud
```bash
cd ~
zip -r ~/Desktop/nearnity-full-backup-20260819.zip Documents/Claude/Projects/Personal/ -x "*.DS_Store" -x "*/node_modules/*"
```
Then drag the zip from Desktop into iCloud Drive / Dropbox / Google Drive (via personal browser, not corp).

### 3c. Verify the zip is readable
Download the zip back from iCloud on a personal device (phone works). Unzip. Confirm you can open `NEARNITY_LAUNCH_HANDOFF.md` and `index.html`.

---

## Section 4 — What's live right now vs pending

### ✅ Live on nearnity.com
- Worker (`nearnity-events-worker.js`) — PCFMA parser + USDA URL fallback + Overpass mirror rotation
- SABS attendance zones for 51 states loaded to KV (Aug 18, 2026)
- `index.html` at whatever version you last deployed (possibly still an earlier c-version)

### ⏳ Pending local (NOT deployed — DO TODAY):
- `scripts/sabs-preprocess.mjs` — WGS84 projection fix (`-proj wgs84` added). **Push + re-run SABS Action.** Fixes the "bbox_survivors=0" issue.
- `index.html` v2.9.0-c5 — name-first school classifier. **Push** so K-6 elementaries land in Elementary column.

### 🔨 Coming from Claude session TODAY:
- Phase 5 — Emergency medical UX retrofit (hospitals / urgent care / clinics / pharmacies with v3 tier cards)
- Accessibility basics (skip link, aria-labels on icon buttons, contrast check)
- This handoff document

---

## Section 5 — Deploy sequence for pending changes (TODAY)

**Step A — Push local changes to GitHub:**
```bash
cd ~/Documents/Claude/Projects/Personal
git add scripts/sabs-preprocess.mjs index.html NEARNITY_LAUNCH_HANDOFF.md
git commit -m "v2.9.0-c5: WGS84 SABS projection + name-first school classifier"
git push
```

**Step B — Re-run SABS Action** (loads corrected WGS84 zones):
- GitHub → Actions → Load NCES SABS → Run workflow
- Wait ~12 min → verify green ✓
- Sanity check:
  ```
  https://nearnity.com/api/school-assignment?lat=37.4144&lon=-121.8991&state=CA
  ```
  Expected: `"available": true, "assigned": {"E": {name: "..."}, "M": {...}, "H": {...}}`

**Step C — Worker deploy (only if you've made Worker code changes):**
- Cloudflare dashboard → your Worker → paste updated `nearnity-events-worker.js` → Save and Deploy
- If nothing changed in Worker code, skip

**Step D — Verify UI:**
- Load `nearnity.com` in Incognito
- Search: `401 Ellicott Loop, San Jose, CA 95123`
- Schools tab → should show teal "Your assigned school" hero cards + K-6 elementaries in Elementary column
- Events, Parks, other tabs — should all render as before

---

## Section 6 — How to resume dev work from a personal machine

**Constraint:** corp Mac cannot access personal cloud drives per org policy. GitHub is the ONLY bridge. Every file the next Claude session needs is committed to `github.com/satyabhanuv/homeatlas` under `Personal/` — including memory/context files at `Personal/.claude-context/`.

### 6a. First-time setup on personal Mac (~15 min)

1. Install git + Claude Code / Cowork on your personal Mac (if not already):
   - Git: comes with Xcode Command Line Tools — `xcode-select --install`
   - Cowork: download from Anthropic (same setup as corp Mac had)
   - Sign in with your personal Anthropic/Claude account (not corp)

2. Clone the repo:
   ```bash
   mkdir -p ~/Documents/Nearnity && cd ~/Documents/Nearnity
   git clone https://github.com/satyabhanuv/homeatlas.git .
   ```

3. Point Cowork at the repo folder. When Cowork asks which folder to work in, pick `~/Documents/Nearnity`.

### 6b. Bootstrap Claude's memory in the new session

The `Personal/.claude-context/memory/` folder holds all the context files (feedback, project state, architectural decisions) that a fresh Claude session normally wouldn't have. To load them into the new Cowork's auto-memory:

**Option 1 — automatic (preferred):** open Cowork → new session → paste this as the first message:
```
Please load the memory context from Personal/.claude-context/memory/ into your auto-memory. Then read Personal/NEARNITY_LAUNCH_HANDOFF.md and Personal/nearnity-planning/V3_Roadmap.md for full project context before we start.
```

Claude will read each file and either import them into its `.auto-memory/` OR keep them in conversation context. Either way, all prior feedback + project state carries forward.

**Option 2 — manual copy:** find where Cowork stores auto-memory (usually `/sessions/<id>/mnt/.auto-memory/`), then:
```bash
cp Personal/.claude-context/memory/*.md /sessions/<current-session-id>/mnt/.auto-memory/
```

### 6c. What the next session should read first

Once memory is loaded, the assistant has full context on:
- **Feedback preferences** (naming, empty states, aggregators, backup rule, value prop, etc.)
- **Project state** (launch tiers, source network, architecture, consolidation decision)
- **Personal context** (Spartan race history, session split preferences)

Point it to these files for anything specific:
- `Personal/NEARNITY_LAUNCH_HANDOFF.md` — this doc; state of everything
- `Personal/nearnity-planning/V3_Roadmap.md` — what's shipped + what's coming
- `Personal/nearnity-planning/v3_Section_Mapping.md` — design decisions
- `Personal/nearnity-planning/Production_Roadmap.md` — v2 lineage
- `Personal/.claude-context/memory/MEMORY.md` — index of all memories

### 6d. Edit + deploy loop from personal Mac

- Edit files locally with any editor (Cowork edits directly, or use VS Code / Sublime)
- Test static frontend: open `Personal/index.html` in browser
- Deploy: `git add . && git commit -m "..." && git push` — Cloudflare Pages auto-builds from `main` and goes live in 2-3 min
- Worker changes: either paste updated `nearnity-events-worker.js` into CF dashboard (Workers → your worker → Edit code → Save and Deploy), OR set up wrangler CLI: `npm install -g wrangler && wrangler login && cd Personal && wrangler deploy`

### 6e. Refresh Personal/.claude-context/memory/ periodically

Whenever this session (or future ones) updates auto-memory files at `/sessions/.../mnt/.auto-memory/`, sync them back into the repo so the personal-mac setup has the latest:
```bash
cd /sessions/blissful-amazing-hawking/mnt
cp .auto-memory/*.md Personal/.claude-context/memory/
```
Then commit + push. **Done today (2026-08-19) — 23 memory files synced.**

---

## Section 7 — Emergency contacts (things to know if I forget)

**Domain expires:** check registrar for date. Enable auto-renew.

**CF Workers KV free tier limits:** 1000 writes/day, unlimited reads. Nearnity uses ~500/day (per-state ingest + occasional writes). Well under.

**CF Pages bandwidth:** 100k requests/day free, then $0.50/million. Nearnity traffic ~1k/day currently.

**Legal/ADA:** post-launch WCAG 2.1 AA audit needed (see V3_Roadmap.md v3.1 section). Not a launch blocker but real long-term risk exposure.

**Insurance/liability:** Nearnity presents public data. Add a small "Data may be inaccurate — verify with source" disclaimer in the footer (already exists in v2's footer copyright line). Reduces liability exposure vs. giving advice.

**If nearnity.com goes down:**
- Cloudflare Pages status: dashboard → Pages → Deployments (should show green Success)
- Cloudflare Worker status: dashboard → Workers → your worker → Logs
- If Worker throws errors: check CF Worker Analytics for error rate
- Roll back: dashboard → Pages → Deployments → pick previous → Rollback

---

_This document is the canonical "if something happens to me tomorrow" reference. Update it after each major change. Keep the latest copy in your password manager or personal cloud._
