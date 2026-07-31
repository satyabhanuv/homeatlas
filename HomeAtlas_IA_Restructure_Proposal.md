# HomeAtlas — IA Restructure (v2, priority-ranked)

**Status:** Draft for validation. Re-written after feedback to prioritize by user-need, not taxonomy.

## The framing

The first IA draft sorted services by topic (Home / Neighborhood / Civic / Help / Safety). That's how a librarian organizes things, not how a person in need uses a site.

Real users land here in one of three moods:

| Mood | What they want | How they search elsewhere today |
|---|---|---|
| **Crisis / urgent need** | The right phone number or nearest building, fast | Google: "free clinic near me", "food bank near me", "rent help" — keyword search |
| **Exploring what's around** | What's local, what's happening | Yelp browsing by category, Nextdoor scrolling, "things to do near me" |
| **Practical home admin** | Who's my electric utility, who runs my internet, etc. | Random Google searches, calling the utility, asking neighbors |

The persistent header + tab order need to mirror this priority. Crisis stuff always reachable in one tap. Local life prominent. Property/home admin deepest because the user already knows their address.

## Step 1 — Importance ranking of every service we offer

Ranked from **most-urgent / highest-stakes** to **least-urgent / nice-to-have**:

| # | Service | Why this rank | Surface |
|---|---|---|---|
| 1 | **911 / fire / police** | Life-threatening, no time for clicks | Persistent strip |
| 2 | **988 — Suicide & Crisis Lifeline** | Life-threatening, immediate | Persistent strip |
| 3 | **211 — Social services hotline** | Connects to any urgent need: food, shelter, utility shut-off, mental health | Persistent strip |
| 4 | **Nearest ER / urgent care / hospital** | Acute medical need | Persistent strip (with live distance) |
| 5 | **Free clinics & FQHCs** | Sliding-scale healthcare for the uninsured | Tab |
| 6 | **Food assistance** (food banks, SNAP) | Food insecurity | Tab |
| 7 | **Housing & utility help** (shelter, rent assist, LIHEAP) | Housing instability | Tab |
| 8 | **Mental health & crisis** (beyond 988) | Ongoing support | Tab |
| 9 | **Substance use support** | Recovery / treatment | Tab |
| 10 | **Financial & legal aid** | VITA, Legal Aid, benefits enrollment | Tab |
| 11 | **Events near me** (what's happening) | Civic/community engagement, daily life | Tab |
| 12 | **Farmers markets** | Food access + community | Tab |
| 13 | **Schools** | Major decision for families | Tab |
| 14 | **Parks & recreation** | Daily life | Tab |
| 15 | **Libraries / community centers** | Free services many residents don't know exist | Tab |
| 16 | **Voting / elected officials** | Civic participation | Tab |
| 17 | **DMV / permits** | Annual-ish admin | Tab |
| 18 | **Climate risks** (wildfire, flood, quake zones) | Awareness — affects insurance, buying decisions | Tab |
| 19 | **Air quality / crime stats** (when available) | Daily awareness | Tab |
| 20 | **Utilities** (electric, gas, water) | One-time setup when moving in | Tab |
| 21 | **Internet & TV providers** | Shopping decision | Tab |
| 22 | **Home services** (plumber, handyman, electrician) | Commercial referral | Tab |
| 23 | **Gardening** (zone, plants) | Specific interest | Tab |
| 24 | **Property summary** (address, year built, lot size) | They already know this — confirmation only | Bottom of Home tab |

The line that matters: **services 1–4 are persistent-strip material** (always visible). Everything else can live in tabs.

## Step 2 — Persistent emergency strip (always visible, above the tabs)

Sits between the address bar and the section nav. Stays visible when scrolling (sticky). Compact, scannable, mobile-friendly.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Need help right now?    🚨 911    🆘 988    📞 211    🏥 Nearest ER (1.2 mi → tap)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Behavior:
- **🚨 911** — `tel:911` link (calls when tapped on mobile; on desktop, opens a confirm dialog).
- **🆘 988** — `tel:988`.
- **📞 211** — `tel:211`.
- **🏥 Nearest ER** — runs once on results render: closest `amenity=hospital` or `amenity=clinic` with `emergency=yes`. Shows distance. Tap → opens Apple/Google Maps directions.
- On narrow screens, labels drop to just emojis with phone numbers below as text.

This strip is **the single most important UX change** — it answers the urgent-need case in 0 clicks, regardless of which tab is active.

## Step 3 — Recommended: 4 top-level tabs

Ordered by descending user urgency (highest urgency on left):

| # | Tab | Icon | Services inside | Default landing |
|---|---|---|---|---|
| 1 | **Help** | 🆘 | Community help · Free clinics · Mental health · Substance use · Financial & legal | Helplines (deep page with all crisis hotlines + curated nonprofits) |
| 2 | **Around me** | 🗺️ | Events · Schools · Parks & libraries · Farmers markets · Civic life (voting, officials, DMV) | Events (most-discoverable) |
| 3 | **My home** | 🏠 | Utilities · Internet & TV · Gardening · Home services · Climate risks · Property summary | Utilities (most-asked when first visiting) |
| 4 | **Safety & risks** | ⚠️ | Emergency services (fire/police/hospitals) · Climate risks · Air quality · Crime stats | Closest emergency services (fire/police/hospital) |

**Why 4 not 5:** Civic isn't its own urgent-mood — it lives naturally in "Around me" since voting, officials, and DMV are all *local* civic life. Risk awareness (climate risks, crime, air) clusters cleanly under Safety. Property-admin stuff goes in Home as the deepest layer.

**Why this order:** scanning left-to-right matches the urgency ladder. Anyone in distress lands on **Help**. Someone exploring lands on **Around me**. Someone setting up a new house lands on **My home**. Someone worried about their area lands on **Safety**.

## Alternative — 5 tabs (if you want Civic visually separate)

| # | Tab | Icon | Services inside |
|---|---|---|---|
| 1 | **Help** | 🆘 | Community help · Free clinics · Mental health · Substance · Financial & legal |
| 2 | **Around me** | 🗺️ | Events · Schools · Parks & libraries · Farmers markets |
| 3 | **Civic** | 🏛️ | Voting · Elected officials · DMV · Courts · Public records |
| 4 | **My home** | 🏠 | Utilities · Internet & TV · Gardening · Home services · Property summary |
| 5 | **Safety & risks** | ⚠️ | Emergency services · Climate risks · Air quality |

Pros: Civic is more discoverable for voters / engaged residents. Cons: 5 tabs, slightly more to scan, Civic competes with Help for the "look here" attention.

## Within each tab — Level 2 (services) ordering

Each tab's services are also priority-ranked. Examples:

**Help tab — services in this order:**
1. Helplines (211 / 988 / SAMHSA / NDVH / etc.) — most universal
2. Free clinics & FQHCs — most-asked physical service
3. Food assistance — pantries, SNAP
4. Housing & utility help — shelter, rent, LIHEAP
5. Mental health (beyond 988)
6. Substance use support
7. Financial & legal aid

**Around me tab — services in this order:**
1. Events (what's happening this month) — most temporally relevant
2. Schools — high-stakes for families
3. Parks & libraries — daily life
4. Farmers markets — already a popular section
5. Civic life — voting, officials (only if we went with 4-tab option)

**My home tab — services in this order:**
1. Utilities (electric / gas / water)
2. Internet & TV providers
3. Gardening
4. Home services (handyman, plumber, etc.)
5. Property summary  *(stays at the bottom — user already knows their address)*

**Safety & risks — services in this order:**
1. Emergency services (fire / police / hospital / pharmacy / dentist / DMV — current Public Services subtabs)
2. Climate risks (wildfire, flood, quake zones — current Risks section)
3. Air quality / crime stats (when integrated)

## Level 3 — sub-services (the existing subtabs)

Stay exactly as they are today inside each service. No changes there. So Community help still has Helplines / Food / Housing / Financial subtabs; Events still has Happening this month / Farmers markets / Churches / Community centers / Find events online; etc.

## Updated competitive distinction

The persistent emergency strip + this tab ordering make a clear statement on first impression:

| What we lead with | Why it's distinct |
|---|---|
| Persistent **911 / 988 / 211 / nearest ER** strip | No neighborhood app, no maps app, no Yelp puts these one-tap from anywhere on the page. |
| **Help** as the leftmost tab | Sends a signal: this site is *for* you when you need help, not just for browsing. Nextdoor leads with chat; Yelp with shopping; Google with search. We lead with "we know you might be in a tough moment." |
| **Around me** instead of "Neighborhood" | Action-oriented framing. Matches the user mood "what should I do today" vs. abstract "what's my neighborhood like." |
| **My home** as a secondary tab, not the front door | Honest acknowledgment: users already know their address. Surface this only when they want practical setup info. |
| **Safety & risks** as a discrete tab | Carves out climate/hazard info as a coherent thing. Insurance shoppers, prospective buyers, families care about this. Nobody else surfaces it cleanly. |

## What I need from you

1. **4 tabs or 5 tabs?** (I lean 4 — Civic folds well into "Around me" since voting is a local activity.)
2. **Persistent strip — do you want the "Nearest ER" piece in v0.47 or hold for later?** It needs a quick Overpass call on results-render. ~1 day of work. Without it, the strip is just three phone numbers (easier).
3. **Default landing tab on first search.** I'd open on **Around me → Events** since that's the exploratory mood that matches most arrivals. But if you want everyone to see Help first, we can lead with that. (Trade-off: leading with Help may feel alarming for casual visitors.)
4. **Naming sanity check.** Are these terms intuitive? 
   - **🆘 Help** (vs. "Get help", "Find support", "Resources")
   - **🗺️ Around me** (vs. "Local", "Nearby", "Neighborhood")
   - **🏠 My home** (vs. "Home", "Your home", "Property")
   - **⚠️ Safety & risks** (vs. "Safety", "Risks", "Hazards & risks")
5. **Anything you'd move differently?** (e.g. should Schools live in Help since "education" is a key public service for families? I say no — schools is more of an Around-me browse than a Help-when-stressed surface, but worth your read.)

Once you pick, v0.47 implements:
- Add persistent emergency strip
- Build the 2-tier nav (categories + services)
- Migrate existing sections under their new parent (no data deleted)
- URL hash redirects for backwards-compat (`#sec-events` → `#around-me/events`)

Estimated work: 1 focused iteration, ~1 day. Low risk because section content / subtabs don't change — only nav.
