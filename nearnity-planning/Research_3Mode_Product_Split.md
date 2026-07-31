# 3-Mode Product Split — Dual Surface Strategy

_Status: **DECIDED 2026-07-08 (form-factor-scoped).** The split is a mobile-app UX pattern; the website stays a comprehensive directory with a cleanup pass. Both surfaces share the same underlying data layer and Worker endpoints._

---

## The decision (Satya 2026-07-08)

**Web (nearnity.com):** stays a comprehensive directory. No mode gating on landing. Users research addresses casually — should see everything available at once, cleanly organized. Web needs a REORG pass in v3 to cleanup redundant tabs + better information flow, but no mode-picker.

**App (iOS + Android via Capacitor):** mode selector on the landing screen. App usage skews toward urgent needs + pressure decisions. Mode picker = faster time-to-answer. Retention loop through Events + Home discovery after initial urgent-care use.

**Same data underneath.** Every section belongs to one of the three modes as metadata. The web ignores that metadata (renders everything). The app respects it (shows only the picked mode). One backend, two presentation surfaces.

---

## Section → mode mapping (canonical)

---

## The section→mode taxonomy (used by both surfaces)

| Mode | User intent | Sections shown | Sections hidden |
|---|---|---|---|
| **🚨 Emergency / Safety** | "I need help now" or "know where to go for emergencies" | ER · Urgent care · Hospitals · Clinics · Pharmacies · 911/988/211 · Safety guide · Fire · Police · Dentists (24/7 subset) | Everything else |
| **🎉 Events** | "What's happening around me" | Local events · Farmers markets · Fireworks · Parades · Kids activities · Community programs · Worship services · Attractions (zoos/museums) | Everything else |
| **🏠 Home** | "What's my address's civic profile" | Property links · Utilities · Schools · Climate risks · DMV · Official links · Yard / garden · Home services | Everything else |

Landing page becomes a mode picker. Search results only fire APIs for the selected mode.

---

## Why this might be right

- **Cognitive clarity** — user's intent is different per mode. Cluttering emergency-search results with farmers markets is confusing at best, dangerous at worst.
- **Query budget economy** — currently every visit fires 10+ API calls (Overpass × 3, Medicare, NPPES × 2, HRSA, NCES, NPS, etc.) even if the user only wanted urgent care. 3-mode split fires 1-3 calls per mode.
- **Cloudflare free-tier headroom** — reduced query count keeps us well within limits at scale (100K reqs/day KV free tier, Workers 100K/day). Kitchen-sink hits limits by ~1K daily active users; mode-split by ~5-10K.
- **Persona alignment** — each mode maps cleanly to a launch persona:
  - Emergency ↔ Family-visit guests + Racers/backcountry (waitlisted)
  - Events ↔ Long-weekend hub travelers (flagship)
  - Home ↔ Resident/planning use case (deprioritized as niche, but STILL served without dominating positioning)
- **Mobile app UX** — 3 tabs at bottom nav is a canonical native pattern. Ports directly to iOS + Android.
- **Marketing wedges** — three distinct pitches. "Nearnity for emergencies" (ER credibility) / "Nearnity for weekend plans" (events discovery) / "Nearnity when you move" (civic profile). Each targets a Reddit/subreddit differently.

## Why we might NOT do this (open questions)

1. **Cross-mode search** — user is in "Events" mode planning a park trip but wants to know if there's a hospital nearby too. Do we require them to switch modes? That's friction. Solution: single top-of-page "always visible" strip with 3 emergency buttons (911, nearest ER on Google, urgent care) — no matter what mode.
2. **Mode picker onboarding** — first-time visitor lands on nearnity.com. What do they see? Mode-picker landing page OR default mode (which?). If mode-picker: adds a step. If default: contradicts the "let user choose" premise.
3. **v3 UI cost** — the v3 prototype (rectangle-layout, sidebar+subnav+results) was designed around the kitchen-sink model with the sidebar as the section navigator. Adopting 3-mode changes that: the sidebar becomes mode-selector OR mode-subsection-selector. Big v3 redesign implication.
4. **SEO / discoverability** — landing pages per persona already planned (Phase E). 3-mode makes landing pages easier (one per mode) but permalinks trickier ("share this ER search" — includes mode + address? just address? mode inferred?).
5. **Data-source overlap between modes** — Utilities include electric provider, which someone in Emergency mode might want (power outage safety). Hospitals feed both Emergency and Home (I want to know what's near my future home). Some sections cross-cut modes.

## Implications for the 5-tier data model

| Tier | Emergency mode | Events mode | Home mode |
|---|---|---|---|
| Tier 1 Federal | ✅ Primary (Medicare, NPPES, HRSA, SAMHSA) | Partial (Rec.gov, NPS for outdoor events) | ✅ Primary (NCES schools, FEMA flood, FCC broadband) |
| Tier 2 State | Partial (state health depts) | ✅ Primary (state parks + events) | ✅ Primary (state DMV, state open data) |
| Tier 3 Metro | Partial (city hospital directories) | ✅ Primary (city rec calendars + business licenses) | Partial (city utility lookups) |
| Tier 4 Institutional | Partial (Patient Advocate, DocInfo) | ✅ Primary (AZA, AAM, IMLS, BiblioCommons) | Partial (state library directories) |
| Tier 5 Community capture | Small (rare-event bug reports) | ✅ Primary (long-tail events) | Small |

**v2.7.9 KV geo-index is Emergency-mode data.** Sequencing lines up: Tier 1 build serves Emergency first (which the v2.7.9 KV work targets), Tier 2 + 4 serve Events (which comes next), Tier 3 metro rec calendars serve Events again.

## Query-budget math (rough)

Current per-search: ~12 API calls (3 Overpass, 3 federal, 2 city, 4 misc)
3-mode per-search: ~3-4 API calls (only the mode's tier subset)
Saving: **~70% fewer requests per user session.**

At 10K daily active users: current = 120K req/day (over free tier). Mode-split = 40K req/day (comfortable).

## Decision-point checklist (resolved 2026-07-08)

- [x] **Web mode picker** — NO. Web is comprehensive directory. Section-grouping visible but not gated.
- [x] **App mode picker** — YES. Native landing screen with 3 large tiles + a persistent 911 shortcut always available.
- [x] **URL structure** — Web is one URL with all sections. App uses native routes (`nearnity://emergency`, etc). No mode-in-URL for web.
- [x] **v3 web redesign impact** — Rectangle-layout still applies. Sidebar categories reorganize into 3 grouping headers (Emergency / Events / Home) so users can see the shape without being gated. No structural rebuild.
- [x] **Cross-mode emergency shortcut** — YES on both. Web keeps the existing top red "🚨 Need help now?" bar (911 / 988 / 211). App has a persistent-in-header 911 button regardless of mode.
- [ ] **Web section cleanup scope** — TBD. Which specific sections are redundant / consolidatable in v3? Draft coming with v3 Phase 2 wiring.
- [ ] **App: default mode on first launch** — Emergency, or last-used, or picker-shown-every-time? Decide during Capacitor Phase C build.

---

## Next step

Decide after v2.7.9 KV work is complete (2-3 days from 2026-07-08). No need to decide now. Meanwhile: v2.7.9 build proceeds with Emergency-mode data — it's the correct first tier regardless of whether we adopt 3-mode.

If we DO adopt 3-mode, v3 rectangle-layout wiring needs re-scoping (potentially significant). If we DON'T, v3 proceeds as originally sketched.

## Recorded

- Founder_Notes.md: research row added 2026-07-08
- Roadmap_Checklist.md: v3 wiring block flagged as "pending 3-mode decision"
- Auto-memory: research-only entry — not yet a decision
