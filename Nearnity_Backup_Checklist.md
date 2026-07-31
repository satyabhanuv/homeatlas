# Nearnity Backup Checklist — do these before Monday

_Written 2026-07-30 as a full-recovery guide. Every item is either "verify" (checkbox) or "action" (do it now)._

---

## Priority 1 — Ownership audit (do this FIRST, ~15 min)

Anything registered to a `paypal.com` email or corporate credit card is at risk if your PayPal account gets deactivated. Move everything to your personal email + card **before Monday**.

### 1a. GitHub — where does the Nearnity repo live?
- [ ] Open the repo URL. Is it under `github.com/svelivela/...` (personal) or `github.com/paypal/...` or an org?
- [ ] Personal → good, skip to 1b.
- [ ] If on a work org: **fork it to your personal account immediately.** GitHub → repo → top-right "Fork" → your personal namespace. Then verify your personal fork has all commits + branches.

### 1b. GitHub secrets
- [ ] Repo → Settings → Secrets → note the 3 CF_* secrets you added for the SABS Action. They're encrypted (can't export values). If you leave PayPal, GitHub keeps working (personal account is independent).
- [ ] Make sure the PAT / SSH key you use to push isn't tied to PayPal email. Personal profile → Settings → Emails → verify a non-PayPal address is your primary.

### 1c. Cloudflare account
- [ ] `dash.cloudflare.com` → top right → your name → is the login email personal? If it's `svelivela@paypal.com`, that account may be inaccessible when you're offboarded.
- [ ] If PayPal email: Settings → Members → invite your personal email as Super Admin → accept invite from personal address → verify you can log in there → remove PayPal email as admin.
- [ ] Billing: if any Cloudflare service is on a corporate card, swap to personal card now (Billing → Payment methods).

### 1d. Domain — nearnity.com
- [ ] Where is it registered? Common: Cloudflare Registrar, Namecheap, Google Domains (now Squarespace Domains), GoDaddy. Log in and check.
- [ ] Registrant email + billing card must be personal.
- [ ] Enable 2FA on the registrar account if not already.
- [ ] Enable auto-renew.

### 1e. Third-party API keys
- [ ] **USDA_KEY** — registered at usdalocalfoodportal.com. Login email = personal?
- [ ] **TICKETMASTER_KEY** — developer.ticketmaster.com. Personal email?
- [ ] **NPS_KEY** — developer.nps.gov. Personal email?
- [ ] **RIDB_KEY** — ridb.recreation.gov. Personal email?
- [ ] **AIRNOW_KEY** — docs.airnowapi.org. Personal email?
- [ ] **RESEND_API_KEY** — resend.com. Personal email?
- [ ] **ADMIN_TOKEN** — self-generated, you have the value: `2347a88b99662db238e552b8d061fdc56bd638f25731028839dd7889d6db4c5e`. Save it in your password manager.

---

## Priority 2 — Code + docs backup (~10 min)

Everything in `~/Personal/` needs to live in at least THREE places:
1. GitHub (source of truth)
2. Your Mac
3. A personal cloud (iCloud/Dropbox/Google Drive)

### 2a. Push everything to GitHub NOW
```
cd ~/Personal
git status               # verify no uncommitted work
git add -A               # stage everything (careful — reviews recommended)
git commit -m "Full snapshot pre-Aug 5 backup"
git push
```

### 2b. Verify on GitHub
- [ ] Every file in `~/Personal/` also appears in the GitHub repo web UI.
- [ ] `.github/workflows/sabs-load.yml`, `scripts/`, `nearnity-planning/`, `index_v3.html`, `nearnity-events-worker.js` all present.

### 2c. Local zip + cloud upload
```
cd ~
zip -r nearnity-full-backup-$(date +%Y%m%d).zip Personal/ -x "*.DS_Store"
```
- [ ] Upload the `.zip` to iCloud Drive, Dropbox, or Google Drive (personal account, not work)
- [ ] Verify it downloads back cleanly

### 2d. Cowork memory
- [ ] Your `~/Personal/.auto-memory/` folder contains all the strategic decisions, feedback, and project state we've built up. It's included in the zip if you use `-A` above. Double-check.

---

## Priority 3 — Data backup (Cloudflare KV) (~30 min)

KV data (medical + events + SABS) took hours to build. Export it in case Cloudflare account access is disrupted.

### 3a. Get a CF API token with KV read access
- Cloudflare dashboard → your profile → API Tokens → Create Token
- Template: "Workers KV Storage" (read-only is fine for backup)
- Save the token securely (password manager)

### 3b. Export each KV namespace to JSON
For each namespace (`EVENTS_KV` is the main one), run:
```
CF_ACCOUNT_ID="your_account_id"
CF_API_TOKEN="the_token_from_3a"
CF_KV_NS="events_kv_namespace_id"

# List keys
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$CF_KV_NS/keys" \
  -H "Authorization: Bearer $CF_API_TOKEN" > kv-keys.json

# For each key, dump value (a shell loop with jq)
```
(I can write you a full backup script if you want — say the word.)

### 3c. Alternative — just re-run the ingest
KV data can always be rebuilt by re-running the geo-ingest + bulk-ingest URLs. If time is short, focus on backing up CODE + credentials — data can be rehydrated in ~30 min after any account transition.

---

## Priority 4 — Ongoing access ledger (~5 min)

Keep this info in your password manager. Bare minimum:

| System | URL | Personal email? | 2FA? | Recovery codes saved? |
|---|---|---|---|---|
| GitHub | github.com | ☐ | ☐ | ☐ |
| Cloudflare | dash.cloudflare.com | ☐ | ☐ | ☐ |
| Domain registrar | ? | ☐ | ☐ | ☐ |
| USDA developer | usdalocalfoodportal.com | ☐ | — | — |
| Ticketmaster developer | developer.ticketmaster.com | ☐ | ☐ | ☐ |
| NPS developer | developer.nps.gov | ☐ | — | — |
| RIDB | ridb.recreation.gov | ☐ | — | — |
| AirNow | docs.airnowapi.org | ☐ | — | — |
| Resend | resend.com | ☐ | ☐ | ☐ |
| Feedback email | feedback@nearnity.com | ☐ | ☐ | ☐ |

---

## What to do if Monday goes sideways

1. **Deactivation is usually IT lockout, not domain loss.** Your GitHub / Cloudflare / registrar accounts don't care about PayPal's SSO — they only care about the login email you registered with. If step 1a-1e checked out clean, you're fine.
2. **First 24 hours**: log into each system from your personal machine + verify access. Rotate any password that used your PayPal SSO.
3. **First week**: rotate the ADMIN_TOKEN (regenerate a new hex string, update Cloudflare Worker secret + your scripts). Old one was in a screenshot you shared — safe to burn.
4. **Nearnity keeps running** unattended — Worker + Pages are already deployed, don't need daily attention. Cron for weekly KV refresh keeps it fresh.

---

## Session context (this working folder)

All the strategic decisions, project state, and technical rationale from our sessions live in:
- `~/Personal/nearnity-planning/*.md` (roadmaps, section mapping, tier framework)
- `~/Personal/.auto-memory/*.md` (feedback + project memories)
- `~/Personal/*_Release_Notes.md` (version history)
- `~/Personal/*_QA_Runbook.md` (deploy + QA procedures)

If you ever start a new Cowork session from a new machine, drop these back into `~/Personal/` and any future assistant will pick up right where we left off.

---

**Estimated time to complete the whole checklist: ~1 hour.**

Do steps 1a-1e today. Steps 2 + 4 tomorrow. Step 3 whenever.
