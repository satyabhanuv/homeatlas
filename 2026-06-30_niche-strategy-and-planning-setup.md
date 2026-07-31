# 2026-06-30 — Niche strategy + planning infrastructure

**Session type:** Strategy / sounding board
**Duration:** Full working session
**Attendees:** Satya (solo founder), Claude

## Context going in

- v2.7.x buildout was continuing (assignment chips, ER billing help, Safety Guide audience toggle, radius fixes)
- Satya was mid-QA and hit a founder-doubt moment — "should this even be a company? anyone can google this? who am I helping? every change is getting bigger"
- Search reliability bug: Bay Area addresses returning "no results" for emergency services

## What was discussed

### 1. Founder doubt debrief
- Claude pushed back on each doubt honestly rather than reassure:
  - "Anyone can Google" is half-true — Nearnity is a different information architecture, but users don't see that on first touch
  - "Who am I helping" is the actual question — the product was serving too many personas at once
  - "Every change getting bigger" is a scope-creep signal — most recent shipments were polish, but v3 rewrite is legitimately big
  - "No marketing chops" is real but not fatal — narrow niche + word-of-mouth sidesteps it
- Conclusion Satya reached independently: the doubt is downstream of missing external data. Ship + get 10 real target-user data points before deciding anything final.

### 2. Niche finalization
- Rejected: emergency-first positioning. Retention math is terrible (one crisis = one-and-done), zero error tolerance, no word-of-mouth.
- Rejected: broad resident/mover niche. Competes head-on with Zillow/Google without a wedge.
- Chose: **traveler-focused, three sub-personas**:
  1. Long-weekend hub travelers (flagship) — Yellowstone, Vegas, Anaheim, Orlando trips
  2. Family-visit guests (built-in via existing traveler + insurance toggles)
  3. Racers / day-packers (waitlist only for now — safety-critical + poor coverage)

### 3. Coverage strategy
- Rejected: national coverage at September launch. Solo-founder can't handle QA + support load + data gaps for all 50 states.
- Chose: **Bay Area + California first, top 40 destination hubs nationwide** (national parks + theme park zones + tourist metros). Explicit "expanding" messaging elsewhere.

### 4. Timing + sequencing
- Rejected: v2.x public launch. All early feedback would be UI noise that v3 will overwrite.
- Chose: **v3-first launch**. Target September 15, 2026 with buffer to September 29.
- Realistic pace: ~160 hours of Satya's time over 10 weeks (evenings + weekends), fits before day-job MLO exam is done.

### 5. Working rhythm
- Per-feature cycle: code → deploy preview → QA on 3 test addresses → update catalog → move on
- Weekly: Mon-Thu build, Fri regression, Sat bigger feature, Sun review + plan
- Monthly: 15-min "elevator pitch" test — explain every feature aloud; stumble = relearn or cut

### 6. Docs + session split
- Split Cowork sessions: **this session = strategy only, other session = code/QA**
- Planning docs live in `/Personal/nearnity-planning/`:
  - `Roadmap_Checklist.md` — what's next
  - `Feature_Catalog.md` — what's built
  - `Founder_Notes.md` — decisions + rhythm
  - `Conversation_Log/` — portable session summaries

## Decisions made

1. Traveler niche (three sub-personas)
2. Bay Area + CA + top 40 hubs at launch, not full US
3. September 15 target, September 29 hard buffer
4. v3-first, no v2.x public launch
5. Session split established
6. Planning-doc structure established
7. v2.7.7 P0 hotfix shipped in code session: healthcare Overpass radius capped at 16km

## Action items for Satya

- Deploy v2.7.4+v2.7.5+v2.7.6+v2.7.7 bundle from the code session
- QA the deployed bundle (emergency search returns results, cut/copy/paste works, chips visible)
- Start Phase A1 (v3 Phase 2 data wiring) in the code session as soon as ready
- File CA LLC + EIN + business bank after MLO exam

## Action items for Claude

- Maintain `Roadmap_Checklist.md` — update after every feature ship or feedback
- Maintain `Feature_Catalog.md` — update after every ship
- Log strategic conversations here in `Conversation_Log/`
- Redirect coding asks in this session back to the other session
- Save memory entries for session split + no-softening feedback

## Open questions parked for later

- Monetization model (donations vs B2B licensing vs embedded widget) — post-launch decision
- Full native app vs Capacitor wrap — post-PMF decision
- Co-founder / marketing hire — only if post-launch traction supports it
- International expansion — deferred to 2027+

## Emotional / process notes

Satya's doubt today was rational, not spiraling. He was actually working through the strategy correctly and reached the right conclusion (pick a narrower niche, don't rush launch) independently. Reinforced that his product instincts are sound; the marketing gap is real but bridgeable via focused positioning. Ended session confident, not shaken.
