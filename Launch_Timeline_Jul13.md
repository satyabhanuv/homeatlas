# Nearnity — Launch Timeline to July 13, 2026

Sequenced action list. Every item has: what to do, what doc to open, estimated time, and dependency status.

**Today:** Tuesday, June 23, 2026
**Public launch:** Monday, July 13, 2026 (3 weeks out)
**Spartan race:** July 11-12, 2026

---

## ⚡ This week (Jun 23-29) — soft-launch setup

You have your MLow exam on the 29th. Carve out 2-3 short evening blocks for these.

### Tuesday/Wednesday evening (1 hour)

- [ ] **Deploy v2.7** (feedback widget) — files ready in `/Personal/`. Same push procedure as v2.6.
  - `head -3 index.html` → confirms `<!DOCTYPE html>`
  - Push `index.html` + `HomeAtlas_Release_Notes.md` to GitHub → Pages auto-deploys
  - Paste `nearnity-events-worker.js` into Cloudflare Worker `nearnity-events` → Save & Deploy
  - Smoke test: open nearnity.com → click 💬 Feedback button bottom-right → confirm modal opens
  - Footer should show **v2.7**
- [ ] **Set up Resend** — follow `Resend_Domain_And_Digest_Setup.md` (45 min, has DNS wait)
  - This enables tester feedback emails AND weekly digest sending

### Wednesday/Thursday evening (30 min)

- [ ] **Send tester invites** — use drafts in `Launch_Invite_Drafts.md`
  - Pick 3-5 trusted contacts (not random social posts yet — that's launch day)
  - Send via DM/Slack/email — short version
  - Goal: 2-3 reply with feedback by end of weekend

### Friday/Weekend

- [ ] **MLow exam prep** (focus here, this is your priority)
- [ ] (Optional, if 30 min free) Read tester feedback as it lands; jot down patterns

---

## Monday Jun 29 — exam day

- [ ] MLow exam ✅
- [ ] Sleep

---

## Tue Jun 30 - Sun Jul 5 — LLC + critical infra week

### Tuesday Jun 30 (1.5 hr)

- [ ] **File California LLC** — bizfileonline.sos.ca.gov
  - File LLC-1 form online
  - $70 filing fee
  - Name: "Nearnity LLC"
  - Member: yourself
  - Address: your home address (must be physical, not P.O. Box)
  - Save the LLC formation date — you'll need it for trademark filing
  - **Processing time: 5-10 business days for confirmation**
- [ ] **Get EIN** — irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
  - Free
  - Done in 5 min online — you get the EIN immediately
  - Save the EIN — you'll need it for the bank

### Wed Jul 1 - Fri Jul 3 (during waits)

- [ ] **Generate Privacy + ToS drafts** via Termly (or iubenda)
  - Follow `Bay_Area_Lawyer_Finder.md` — Option 1
  - $99 Termly subscription
  - Spend ~30 min filling out their questionnaire
  - Download PDFs as v1 drafts
- [ ] **Post UpCounsel job** for attorney review of the drafts
  - Use the copy-paste template in `Bay_Area_Lawyer_Finder.md` Option 2
  - Budget $300-500
  - Expect 2-3 bids by end of week
- [ ] **Confirm Nearnity name still clean on USPTO** — `USPTO_Trademark_Filing.md` Step 1
  - Quick search; should still be clean

### Sat Jul 4 - Sun Jul 5 (slow weekend)

- [ ] **Read all tester feedback that has accumulated** in:
  - Your inbox (svelivela@paypal.com from Nearnity Feedback sender)
  - Cloudflare → Workers KV → namespace `nearnity_events_cache` → browse keys starting with `nearnity:feedback:v1:` and `nearnity:unmatched_counters:v1:`
- [ ] **Triage feedback** into 3 buckets:
  - Must-fix-before-launch (P0)
  - Nice-to-have post-launch (v2.8+)
  - Won't fix / out of scope
- [ ] If P0 bugs surfaced, send them as a list — we'll fix as a v2.8 patch before launch

---

## Mon Jul 6 - Fri Jul 10 — final lockdown week

### Monday Jul 6

- [ ] **LLC should be confirmed by now** — check Secretary of State portal
- [ ] **Open business bank account** (LLC name + EIN required)
  - Recommended: Mercury (no fees, fast online setup) — mercury.com
  - Alternative: Bluevine, Chase Business Complete (~$15/mo)
- [ ] **Pick attorney from UpCounsel bids** — message them with site context

### Tue Jul 7 - Wed Jul 8

- [ ] **Implement any P0 fixes from tester feedback** (v2.8 patch deploy)
  - Send the feedback summary; we'll build the fix; you deploy
- [ ] **Lawyer should be reviewing Privacy/ToS** in parallel — should have draft back by Fri

### Thu Jul 9

- [ ] **Re-tighten Cloudflare security settings** for public launch
  - Cloudflare → nearnity.com zone → Security → Bots → turn Bot Fight Mode **ON**
  - Block AI Bots → **ON** (this blocks ChatGPT etc. from indexing post-launch; only do this if you don't want ChatGPT discovery for free SEO)
  - Cloudflare → Security → WAF → Managed rules → Free Managed Ruleset → **ON**
  - Security Level → **Medium**
  - **Decision point:** if you WANT ChatGPT / Claude / Gemini to discover and recommend nearnity.com in their answers, leave Block AI Bots **OFF**. This is free organic discovery.
- [ ] **Receive final Privacy/ToS from attorney**
  - Publish at `nearnity.com/privacy` and `nearnity.com/terms`
  - Add footer links to both pages

### Fri Jul 10

- [ ] **Final pre-launch QA**:
  - Open nearnity.com on 3 devices (your phone, partner's phone, desktop)
  - Test 5 search scenarios: your home address, your parents' address, downtown SF, Dublin CA, NYC
  - Verify feedback button works
  - Verify footer shows v2.7 (or v2.8 if patch deployed)
  - Verify Privacy + ToS links work
  - Run https://www.linkedin.com/post-inspector/ on nearnity.com → confirm OG preview looks good
  - Run https://cards-dev.twitter.com/validator on nearnity.com → confirm card preview

---

## Sat Jul 11 - Sun Jul 12 — Spartan race weekend 🏔️

- [ ] **No Nearnity work this weekend.** Race is your focus.
- [ ] Get phone photos of the race — these become your IG content for the marketing push.

---

## Mon Jul 13 — PUBLIC LAUNCH DAY 🚀

### Morning (before noon)

- [ ] Check overnight feedback / KV unmatched-searches one last time
- [ ] Pull a sanity-check screenshot of nearnity.com on phone → verify it loads fast

### Mid-day

- [ ] **LinkedIn post** — long version from `Launch_Invite_Drafts.md`
  - Include a Spartan race photo
  - Pin to your profile
- [ ] **Instagram post** (1 hr later) — short caption from drafts
  - Include 2-3 race photos in carousel
  - Story: "swipe up to nearnity.com" + sticker pointing to your bio link
- [ ] **Update IG bio** to include nearnity.com link
- [ ] **DM 10-15 close contacts directly** with the short version — these convert way better than feed posts

### Throughout the day

- [ ] **Check feedback inbox every 2-3 hours**
- [ ] **Reply within 24 hours** to every piece of feedback with at least an acknowledgment
- [ ] **Note patterns** — if 3+ people report the same thing, it's a P0 for v2.9

### Evening

- [ ] **File USPTO trademark** under your new LLC name
  - Follow `USPTO_Trademark_Filing.md` step by step
  - $250 to USPTO
  - Use launch-day screenshot of nearnity.com as the specimen of use
  - 1A basis (use in commerce, since you launched today)
  - Save the serial number you receive

---

## Week of Jul 14+ — post-launch monitoring

- [ ] **Daily for 2 weeks:** check feedback KV, respond to reports, triage into v2.9 list
- [ ] **End of week 1:** post a "thank you, here's what's coming" update on LinkedIn
- [ ] **End of week 2:** ship v2.9 patch with the most-requested fixes from launch traffic

---

## Cheat sheet — which doc to open at each step

| Phase | Open this doc |
|---|---|
| Deploying v2.7 feedback widget | `HomeAtlas_Release_Notes.md` (deploy steps section) |
| Setting up Resend + digest | `Resend_Domain_And_Digest_Setup.md` |
| Sending tester invites | `Launch_Invite_Drafts.md` |
| Filing LLC | (just the bizfileonline.sos.ca.gov instructions — no Nearnity doc needed) |
| Filing EIN | (just irs.gov instructions) |
| Finding a lawyer | `Bay_Area_Lawyer_Finder.md` |
| Generating Privacy/ToS drafts | `Bay_Area_Lawyer_Finder.md` Option 1 |
| Filing USPTO trademark | `USPTO_Trademark_Filing.md` |
| Cloudflare security re-tightening pre-launch | `HomeAtlas_Release_Notes.md` v2.2 section (lists the post-launch settings) |

---

## Budget summary

| Item | Cost | Required? |
|---|---|---|
| Termly subscription | $99 (one-time or annual cancel-anytime) | Yes |
| Attorney review (UpCounsel) | $300-500 | Yes |
| CA LLC filing | $70 | Yes |
| CA LLC franchise tax | $0 first year, $800/yr after | Yes (after year 1) |
| EIN | Free | Yes |
| Business bank (Mercury) | $0 | Yes |
| USPTO TEAS Plus filing | $250 | Optional but recommended |
| nearnity.com renewal | $10.49/yr (already paid this year) | Yes |
| Resend | $0 free tier (sufficient at v1) | Yes |

**Total cash through July 13:** ~$720-920 (depends on attorney bid + whether you trademark at launch or later).

**Recurring annual after year 1:** ~$810 (LLC franchise tax + domain).

---

## What I'm doing while you're at the Spartan race (Jul 11-12)

Nothing on my end is blocked by your absence. I can:
- Triage any feedback that lands while you're away (visible via Worker KV)
- Pre-stage any v2.9 fixes based on pre-race feedback
- Be ready to ship a launch-day hotfix if anything goes sideways

I don't need anything from you during the race — go run.
