# HomeAtlas — Tooling, Hosting & Roadmap Plan

A reference doc covering: UI design tools to make the site look polished, affordable hosting options as the site grows, and the phased roadmap with backend requirements for each feature tier.

**Live site:** https://homeatlas.satyabhanuv.workers.dev/
**Current state:** Phase 2 in progress — US-wide service provider data, Yard & Garden module, visual UI overhaul.

---

## Part 1 — UI Design Tools

### What you actually need

The site today is hand-styled HTML/CSS. To make it look truly polished, you need one of three approaches:

1. **Component library** (drop-in pre-styled components — fastest)
2. **AI design tool** (generate a new look from a prompt — fastest "wow")
3. **Hand design in Figma** (most control — slowest)

### Free options to use right now

| Tool | What it is | Why use it |
|---|---|---|
| **[shadcn/ui](https://ui.shadcn.com/)** | Copy-paste React components, beautiful by default | Free, well-designed, used by Vercel/Cal.com/etc. Good if we move to React. |
| **[Mantine](https://mantine.dev/)** | React component library — full design system | Free, very polished, dark mode built-in. Alternative to shadcn. |
| **[HeroUI](https://www.heroui.com/)** (was NextUI) | React + Tailwind components | Free, opinionated and modern. |
| **[DaisyUI](https://daisyui.com/)** | Tailwind plugin — pre-styled components | Free, no JS needed. Works with current vanilla approach. |
| **[Lucide Icons](https://lucide.dev/)** | Icon set | Free, ~1500 clean SVG icons. Better than emoji for a polished look. |
| **[Phosphor Icons](https://phosphoricons.com/)** | Icon set | Free, multiple weights (thin/regular/bold/fill). |
| **[Coolors](https://coolors.co/)** | Color palette generator | Free, exports CSS variables. |
| **[Figma](https://www.figma.com/)** (free tier) | Design tool | Free for 3 files. Use for mockups before coding. |
| **[Penpot](https://penpot.app/)** | Open-source Figma alternative | Free, unlimited files, self-hostable. |

### AI design tools — fastest "wow" if you want a redesign

| Tool | Free tier? | Cost | Best for |
|---|---|---|---|
| **[V0 by Vercel](https://v0.dev/)** | Yes (limited) | $20/mo | Generate React components from prompts. Paste a screenshot, get code. |
| **[Lovable](https://lovable.dev/)** | Yes (5 msgs/day) | $25/mo | Full-stack apps from prompts. Includes backend. |
| **[Bolt.new](https://bolt.new/)** | Yes (limited) | $20/mo | Similar to Lovable. StackBlitz-powered. |
| **[Galileo AI](https://www.usegalileo.ai/)** | Limited free | Paid | Generates Figma designs from text. |
| **[Uizard](https://uizard.io/)** | Yes | $19/mo | Wireframe-to-mockup AI. |

### Paid options worth the money (when you launch publicly)

| Tool | Cost | What you get |
|---|---|---|
| **[Tailwind UI](https://tailwindui.com/)** | **$299 lifetime** | Premium components: marketing pages, app shells, e-commerce. Used by 80% of Y Combinator startups. |
| **[Tailwind UI Templates](https://tailwindui.com/templates)** | $149-299 each | Pre-designed full apps and landing pages. Salient, Spotlight, Studio templates are gorgeous. |
| **[Cruip Templates](https://cruip.com/)** | $59-89 | Tailwind templates, lighter than Tailwind UI. |
| **[ThemeForest](https://themeforest.net/)** | $20-60 | Older but huge library. Quality varies. |
| **[Mobbin](https://mobbin.com/)** | $40/mo | Browse real-world apps for design inspiration. Worth a 1-month sub during redesign. |

### My recommendation for HomeAtlas right now

**Pick one of these three paths based on how much time you want to spend:**

**Path A — Quick AI redesign (2-3 hours):** Use [V0](https://v0.dev/) (free trial covers it). Paste your current `index.html` and a screenshot, ask for "make this feel like Zillow with cleaner sections." Get React components back. Either fold them in piecemeal or rewrite as React.

**Path B — Component library swap (1-2 days):** Migrate the markup to use [shadcn/ui](https://ui.shadcn.com/) (if going React) or [DaisyUI](https://daisyui.com/) (stays vanilla). Get instant polish. No design skills needed.

**Path C — Buy a template (~$150, half a day):** Get a [Tailwind UI Spotlight or Studio template](https://tailwindui.com/templates) and adapt the section layouts to HomeAtlas's data. Best "production-ready" look without designing from scratch.

I'd recommend Path A first since it's free and gives you a sense of direction before committing.

---

## Part 2 — Affordable Hosting Options

### What you have today

Cloudflare Workers — free tier, ~100K requests/day, generous CPU. You could stay here forever for the static site.

### Static hosting (current need — Phase 1-2)

| Service | Free tier | Paid tier | Best for |
|---|---|---|---|
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/mo | $20/mo Pro | Best free static host. Pair with Workers when you add backend. |
| **GitHub Pages** | 100GB bandwidth/mo | n/a | Simplest. Just push to a branch. |
| **Netlify** | 100GB bandwidth/mo, 300 build min | $19/mo Pro | Drag-and-drop deploy. Great DX. |
| **Vercel** | Hobby tier | $20/mo Pro | Best for Next.js / React. |
| **Render** | Free static, paid for backend | $7/mo backend | Cheaper than Vercel for backend. |

### Backend hosting (Phase 3-4 when you add events, corrections, accounts)

| Service | Free tier | When you'd pay | Cost at scale |
|---|---|---|---|
| **Cloudflare Workers** | 100K req/day, 10ms CPU | After 10M req/mo | $5/mo (10M req) |
| **Cloudflare Workers KV** | 100K reads/day, 1K writes | At scale | $5/mo |
| **Vercel Functions** | 100GB-hours/mo | After free | $20/mo Pro |
| **Netlify Functions** | 125K invocations/mo | After free | $19/mo |
| **Railway** | $5 credit/mo | Pay-as-you-go | ~$5-20/mo |
| **Fly.io** | Free 3 micro VMs | At scale | ~$5-20/mo |

### Database (Phase 4 when you add user accounts)

| Service | Free tier | Paid tier | Notes |
|---|---|---|---|
| **Supabase** | 500MB Postgres + Auth + Storage | $25/mo Pro | Best all-in-one. Free tier handles MVPs easily. |
| **Cloudflare D1** | 5GB SQLite, 5M reads/day | $5/mo at scale | If you're already on Cloudflare. SQLite-based. |
| **Neon** | 0.5GB Postgres + branching | $19/mo | Modern Postgres. Branching is great for prod/staging. |
| **PlanetScale** | Free dev branches | $39/mo | MySQL. Was free, paid now for prod. |
| **Firebase Firestore** | 1GB + generous reads | $25/mo+ | NoSQL. Good for documents, not joins. |

### Authentication (Phase 4)

| Service | Free tier | Paid tier | Notes |
|---|---|---|---|
| **Supabase Auth** | Unlimited users | Included with $25 Pro | Bundled with database. Easiest for our case. |
| **Clerk** | 5,000 MAU | $25/mo + $0.02/MAU | Best UI/UX. Pre-built sign-in components. |
| **Auth0** | 7,500 MAU | $35/mo | Enterprise-grade. Overkill for v1. |
| **Firebase Auth** | Generous | Pay-per-call | Google's auth. Free tier huge. |

### Domain registration

| Registrar | .com price | Notes |
|---|---|---|
| **Cloudflare Registrar** | **$9-10/yr at-cost** | Best price, no markup. Pair with Cloudflare Pages. |
| **Namecheap** | ~$13/yr | Solid choice. Free WHOIS privacy. |
| **Porkbun** | ~$9/yr | Cheapest after Cloudflare. |
| **Google Domains** | (Discontinued — moved to Squarespace) | Avoid. |

### Email (when you need to send/receive)

| Service | Free tier | Paid | Best for |
|---|---|---|---|
| **Resend** | 3,000 emails/mo, 100/day | $20/mo for 50K | Sending transactional emails (welcome, password reset). |
| **Cloudflare Email Routing** | Unlimited forwarding | Free | Forward `hi@homeatlas.com` to your Gmail. |
| **Mailgun** | None now | $35/mo | If you outgrow Resend. |
| **SendGrid** | 100/day | $20/mo for 50K | Established, reliable. |

### Monitoring (Phase 4+)

| Service | Free tier | Paid | Notes |
|---|---|---|---|
| **Cloudflare Analytics** | Included with Pages | Free | Page views, no PII, privacy-first. |
| **Plausible** | n/a | $9/mo | Privacy-focused alternative to Google Analytics. |
| **PostHog** | 1M events/mo | $0.00045/event | Best for product analytics + funnels. |
| **Sentry** | 5K errors/mo | $26/mo | Error tracking. Critical when you go to prod. |

### My cost roadmap for HomeAtlas

| Stage | Total monthly | What you get |
|---|---|---|
| **Phase 1-2 (now)** | **$0** + $10/yr domain | Cloudflare Pages, free tier covers everything |
| **Phase 3 (events feed)** | **$0-5/mo** + domain | Add Cloudflare Workers ($0 free tier) for API caching |
| **Phase 4 (accounts + corrections)** | **$25-30/mo** + domain | Supabase Pro ($25) + Cloudflare Workers ($5) |
| **Phase 5 (social, comments)** | **$30-50/mo** | Same + email (Resend) + monitoring (Sentry) |
| **Production scale (10K+ users)** | **$50-150/mo** | Same plus paid analytics, CDN bandwidth |

---

## Part 3 — Roadmap & Phases

A condensed view of where we've been and where we're going. Backend requirements called out for each phase.

### ✅ Phase 1 — California-only MVP (DONE)

**Goal:** Validate the core idea — address-based home knowledge, all from free data.

- Single-file static HTML
- Photon + Nominatim geocoding (free)
- Service providers (electric, internet, TV, security) for CA
- Schools via OpenStreetMap Overpass
- Climate zone, basic info

**Backend:** None.
**Cost:** $0 + domain.

### 🔄 Phase 2 — US-wide depth + Yard & Garden (IN PROGRESS, ~80% done)

**Goal:** Expand beyond CA, add the Yard & Garden module, make it look polished.

- Per-state lookup tables for CA, PA, NY, TX, WA, NJ
- Fallback geocoding (Nominatim → Census Bureau)
- Census reverse-geocode (resolves county everywhere)
- Yard & Garden module (USDA hardiness, plants, soil, watering)
- Visual UI overhaul (section headers, info popovers, compact cards, mobile responsive)

**Backend:** None.
**Cost:** $0 + domain.

**Remaining:** Add depth for top 10 more states, more plants in DB, polish edge cases.

### ⏳ Phase 3 — Lifestyle layer (NEXT — 1-2 weeks)

**Goal:** Add the "what to do this weekend" angle. Kids activities, home photo.

- Kids activities & events feed (Eventbrite API)
- City rec center events scraping (where available)
- Home image (Mapillary — free OSM photos)
- "Plan my weekend" mode

**Backend needed:** Tiny — for caching API responses + storing API keys server-side (don't expose Eventbrite key in client).

**Stack:** Cloudflare Workers (free tier) + Workers KV for caching.

**Cost:** Still **$0/mo** at this scale.

**APIs used:**
- Eventbrite API — free, requires registration
- Mapillary API — free, requires registration  
- City rec calendars — case by case, often RSS

### 🚧 Phase 4 — Personalization & corrections (3-6 months out)

**Goal:** Users can save addresses, correct data, see their history.

- Sign-in with Google or email magic-link
- Save searched addresses to user profile
- Saved-home dashboard ("My homes")
- Data correction submissions (user reports "this utility is wrong" — we update lookup tables)
- Personalized recommendations based on saved homes

**Backend needed:** Real backend.

**Stack:**
- Auth: **Supabase Auth** (free for low MAU)
- Database: **Supabase Postgres** (free 500MB)
- API: **Cloudflare Workers** ($0-5/mo)
- Frontend: still static HTML

**Cost:** $0-5/mo while in free tiers; $25-30/mo when scaling.

**Schema sketch:**
```sql
users (id, email, created_at)
saved_addresses (id, user_id, address, lat, lon, label, created_at)
data_corrections (id, user_id, address, field, current_value, suggested_value, status)
```

### 🚀 Phase 5 — Community & social (6-12 months)

**Goal:** Friends-and-family becomes a community. Users invite each other and share home/neighborhood discoveries.

- Invite-a-friend (shareable links)
- Public neighborhood posts ("New playground opened on 5th St!")
- Comments, ratings
- Notification system
- Moderation tools (we will need this)

**Backend needed:** Significantly more.

**Stack:**
- Real-time: **Supabase Realtime** (included with Pro)
- Email: **Resend** for notifications ($0-20/mo)
- Storage: **Supabase Storage** for user photos
- Moderation: **OpenAI Moderation API** (free for content checks)
- Analytics: **PostHog** for product analytics

**Cost:** $25-50/mo.

**New schema:**
```sql
neighborhood_posts (id, author_id, lat, lon, body, created_at)
post_comments (id, post_id, author_id, body, created_at)
notifications (id, user_id, type, payload, read_at)
```

### 💰 Phase 6 — Premium tier & monetization (12+ months)

**Goal:** Sustainable revenue. Power users pay for premium data; the basics stay free.

- **Free tier:** what we have today + saved addresses + community
- **Premium ($9/mo or $79/yr):** 
  - Real GreatSchools ratings inline (paid API)
  - Real First Street climate scores ($150/mo just for the data — would need price/scale)
  - Mapbox Address autocomplete (better house-number coverage)
  - PDF report export
  - Real estate insights (Zillow-style estimates via Estated/RentCast — paid)
  - Year-built unlocks the full house-anatomy module

**Backend needed:**
- Stripe Billing — $0 + 2.9% + 30¢/txn
- Webhook handlers for subscription events

**Stack:** all of Phase 5 plus Stripe.

**Cost:** ~$50-100/mo infrastructure + variable revenue offsets it.

**Pricing model worth testing:**
- $9/mo or $79/yr (annual ~30% discount)
- 7-day free trial
- Discount for friends & family ($5/mo first year)

---

## Quick decision framework

If you're asking yourself **"what should I do next week?"**, here's the prioritized list:

1. **Spend 2 hours on V0** to see what an AI-redesigned HomeAtlas could look like. If you love it, that's your roadmap. If not, no time wasted.
2. **Buy your domain** ($10/yr at Cloudflare Registrar). Even if you don't move off `*.workers.dev` yet, you own it. Examples: `homeatlas.app`, `homeatlas.io`, `myhomeatlas.com`.
3. **Decide on the data corrections feature** — it's small and high-value. Even a `mailto:` link is fine for v1.
4. **Set up Cloudflare Analytics** on the existing site. Free, gives you "did anyone use it this week" signal.
5. **Pick one Phase 3 feature** to ship next: kids activities, home photo, or invite-a-friend share link. All small enough for one weekend each.

---

## Resources & references

- **Hosting comparison:** https://benhoyt.com/writings/jamstack-hosting/
- **Free-tier startup stack:** https://github.com/ripienaar/free-for-dev
- **shadcn/ui showcase:** https://ui.shadcn.com/examples
- **Tailwind UI demo:** https://tailwindui.com/components/preview
- **Cloudflare Pages docs:** https://developers.cloudflare.com/pages/
- **Supabase quickstart:** https://supabase.com/docs/guides/getting-started

Last updated: 2026-04-30
