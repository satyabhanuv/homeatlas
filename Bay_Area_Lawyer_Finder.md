# Finding an Affordable Lawyer for Privacy Policy + Terms of Service

You need a lawyer to look over Nearnity's Privacy Policy and Terms of Service before public launch. Target spend: **$300-800 one-time**, no ongoing retainer.

For Nearnity specifically you have an easy case:
- No paid users (no payment processing risk)
- No PII storage beyond email addresses (digest signups only)
- US-only, no GDPR exposure
- Free public-data aggregation (low IP risk)
- Single founder / no team / no investors

Most lawyers will quote this as "simple consumer SaaS launch" — should be 2-4 hours of their time max.

---

## Option 1 — DIY template + attorney review ($300-450 total) ⭐ Recommended

This is the cleanest path for your scope.

**Step 1 — Generate baseline documents from a reputable template service:**
- **Termly** (termly.io) — $99 one-time for both Privacy + ToS. Auto-fills based on a questionnaire. Generates documents that pass a baseline legal review.
- **iubenda** (iubenda.com) — €30/yr subscription for Privacy + Cookie + ToS. Slightly more polished output.
- **Free option:** TermsFeed (termsfeed.com) free generator — output is usable but less customized.

**Step 2 — Have a lawyer review the generated documents:**
- Tell the lawyer: "I generated these from [Termly/iubenda]. I need you to verify they accurately describe what my site does, flag any gaps, and recommend specific edits. Site is free, no payment processing, free public-data aggregation, email-only PII. Estimated 1-2 hours of your time."
- Typical quote: **$200-400** flat fee.

**Total:** $99 generator + $200-400 review = **$300-500**.

---

## Option 2 — UpCounsel or LegalMatch ($400-700)

Online legal marketplaces where you post a job and get bids from vetted attorneys.

- **UpCounsel** (upcounsel.com) — post project "Privacy Policy + ToS review for free consumer web app." Attorneys bid. Typical: $300-600 flat fee. You pick based on bid + profile + reviews.
- **LegalMatch** (legalmatch.com) — similar model. Slightly more focused on California.
- **Avvo** (avvo.com) — directory + free Q&A. Search "Privacy Policy / Internet law" + filter to Bay Area. Many offer free 30-min consults.

**Pros:** Vetted attorneys, transparent pricing, reviews visible.
**Cons:** A bit impersonal; some attorneys quote high.

---

## Option 3 — Local Bay Area solo attorneys ($500-800)

Working with a real Bay Area attorney has value if you might need ongoing legal help (incorporation, trademark, future contracts).

**How to find them:**
1. **Avvo search** → "Internet Law" + ZIP code 95035 (Milpitas) — sort by rating.
2. **California State Bar referral service** → 1-866-442-2529 — free referral to a local attorney; first 30 min is $30.
3. **Santa Clara County Bar Association** → sccba.com → Lawyer Referral & Information Service.
4. **Stanford Law's StartX Legal Services** — if you're affiliated with Stanford in any way, they offer reduced-rate legal help for early-stage founders.

**Names to check (Bay Area solo/small-firm tech-focused attorneys, well-reviewed on Avvo):**
- *Look these up yourself — I won't recommend a specific attorney without knowing their current availability/pricing.* The category is: "solo internet/tech attorney, 5+ years experience, flat-fee work, Bay Area."

**Vet criteria when calling:**
- Do they do flat-fee work for "simple consumer SaaS launch" engagements?
- Have they written Privacy/ToS before for free-data aggregator sites?
- Will they respond to one round of follow-up questions in the fee?
- What's their typical turnaround? (Should be 1-2 weeks max.)

---

## Option 4 — Stanford / Berkeley Law clinics (free or low-fee)

Both Stanford Law and Berkeley Law have **transactional law clinics** that take on real client work as part of their JD program. Supervised by experienced attorneys, work is pro bono or low-fee.

- **Stanford LLE (Law and Entrepreneurship)** — stanford.edu/group/law-entrepreneurship
- **Berkeley Startup@BerkeleyLaw** — law.berkeley.edu/startupcounsel

**Apply early** — they take limited clients per semester. Application typically opens late August / late January.

**Pros:** Free or near-free; high-quality work supervised by professors.
**Cons:** Slow (weeks-to-months turnaround); limited windows to apply; competitive selection.

---

## Option 5 — Just buy the LegalZoom bundle ($249-499)

LegalZoom sells a "Business Legal Plan" or one-off Privacy/ToS packages.

- **Privacy Policy + ToS** as a one-off: **~$249-499** depending on plan.
- They use a template + brief human review.
- Documents are functional but generic — not customized to Nearnity's specifics (federal data sources, no PII, etc.).

**Use this if:** You want the cheapest "good enough" path with zero attorney shopping. **Skip this if:** You want the documents to actually describe what Nearnity does.

---

## My recommendation for you specifically

**Go with Option 1.** Here's why:
- Your scope is genuinely small (free site, no payments, no PII beyond email).
- You want an attorney to give the work a real read so the documents accurately describe Nearnity — not generic boilerplate.
- $300-500 fits your budget.
- One-time engagement; no commitment to ongoing legal relationship.

**Concrete next steps:**

1. **Today / this week:** Sign up for Termly free trial → fill out their Privacy Policy + ToS questionnaire → download the PDF. Save as `Nearnity_Privacy_Draft_v1.pdf` and `Nearnity_ToS_Draft_v1.pdf`.

2. **Post a job on UpCounsel or Avvo:**
   - Title: "Review attorney-needed: Privacy Policy + ToS for free public-data consumer web app (pre-launch, ~2 hours)"
   - Description (copy-paste):
     > I have draft Privacy Policy and Terms of Service generated from Termly for nearnity.com — a free public-data aggregator (no paid users, no PII storage beyond optional email for weekly digest, no third-party data sharing). Site is pre-launch, soft-launching to ~5 testers next week, public launch July 13. I need an attorney to review the drafts, verify they accurately describe what the site does, flag gaps, and recommend edits. Estimated 1-2 hours of work. Flat-fee quote preferred. Targeting $300-500 total. I'm in the Bay Area but happy to work remotely.
   - Set budget: $300-500 flat
   - Wait 2-3 days for bids; pick the attorney with the best reviews + lowest reasonable bid.

3. **Send the drafts + a 5-bullet site summary** to the attorney once selected:
   - What Nearnity does (one paragraph)
   - Data sources (federal NPI registry, HRSA, OSM, Ticketmaster, etc.)
   - What we store (saved-places in localStorage on-device, email-only digest signups in our KV)
   - What we don't store (no addresses, no IP logs beyond Cloudflare's standard, no third-party sharing)
   - What's coming next (no PCI / no health PHI — important to call out so they don't over-engineer)

4. **One revision round** included in the fee — typical.

5. **Save final approved versions** to `/Personal/` as `Nearnity_Privacy_v1.md` and `Nearnity_ToS_v1.md`. Publish them at `nearnity.com/privacy` and `nearnity.com/terms`.

**Estimated timeline:** 1.5-2 weeks from today to having both docs published at nearnity.com. Comfortably before July 13.

---

## What you DON'T need a lawyer for (save the money for things that matter)

- **LLC formation** — California Secretary of State filing is well-documented; just follow the instructions OR pay LegalZoom $79 to file it for you.
- **EIN** — Free from IRS.gov, takes 5 minutes online.
- **Cookie consent banner** — Termly / iubenda include this. You don't need a separate attorney engagement.
- **GDPR review** — Nearnity is US-only. You don't need GDPR-specific work unless / until you expand to EU users.
- **Trademark filing** — see the separate `USPTO_Trademark_Filing.md` doc; you can file the Class 42 TEAS Plus application yourself for $250 without an attorney.

---

## Red flags if you talk to an attorney who tries to upsell

If any attorney quotes you above $1500 for this scope, it's because they're either (a) not used to working with bootstrapped solo founders or (b) padding because they think you'll pay it. Either way: keep shopping.

A real attorney for your scope will:
- Quote a flat fee (not hourly), because the work is bounded.
- Turn around drafts within 1-2 weeks.
- NOT push you to incorporate as a Delaware C-corp (unnecessary for a solo free side project).
- NOT push you to add liability insurance pre-launch.
- NOT ask you to retain them for ongoing work just to do this one piece.

If any of those red flags trigger, that's not your lawyer.
