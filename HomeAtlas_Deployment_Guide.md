# HomeAtlas — Deployment Guide

**Goal:** Get HomeAtlas live on a public URL you can share with friends and family. Free, ~15 minutes, no command line required.

**Path:** GitHub (hosts the file) → Cloudflare Pages (serves the website with a free `*.pages.dev` URL).

**Why this combo:** Free, fast (Cloudflare's global CDN), free SSL, and most importantly — every time you edit the file in GitHub, Cloudflare auto-redeploys in ~30 seconds. No more uploading anything.

---

## Step 0 — One-time edit before deploying

Open `index.html` in any text editor and **find this line in the footer:**

```
<a href="mailto:CHANGE-ME@example.com?subject=HomeAtlas%20feedback" ...
```

Replace `CHANGE-ME@example.com` with the email where you want to receive feedback.

**Recommendation:** create a free Gmail like `homeatlas.feedback@gmail.com` instead of using your work email. Friends-and-family is one thing; the public address of a public website is another.

If you'd rather skip feedback for now, delete that whole `<a>...</a>` tag.

---

## Step 1 — Create a GitHub account (skip if you have one)

1. Go to **https://github.com/signup**
2. Sign up with your email. Free.
3. Verify your email when GitHub asks.

## Step 2 — Create the repo

1. Click the **+** icon (top-right) → **New repository**
2. Repository name: `homeatlas` (any name works, but lowercase is conventional)
3. Description (optional): "Everything about your home, by address"
4. Set to **Public** (required for free Cloudflare Pages tier)
5. Check **"Add a README file"**
6. Click **Create repository**

## Step 3 — Upload `index.html`

1. On your new repo page, click **Add file → Upload files**
2. Drag-and-drop `index.html` from your Personal folder into the upload area
3. Scroll down. Commit message: `Initial HomeAtlas v0.6` (or whatever — doesn't matter)
4. Click **Commit changes**

That's it — your code is now on GitHub. You should see `index.html` and `README.md` listed.

---

## Step 4 — Create a Cloudflare account

1. Go to **https://dash.cloudflare.com/sign-up**
2. Sign up with your email. Free.
3. Verify your email.

You don't need to add a domain or change DNS. We're only using their Pages product.

## Step 5 — Connect Cloudflare Pages to your GitHub repo

1. In the Cloudflare dashboard, find **Workers & Pages** in the left sidebar
2. Click the **Pages** tab (next to Workers)
3. Click **Create application** → **Pages** tab → **Connect to Git**
4. Click **Connect GitHub** — authorize Cloudflare to read your repos (Cloudflare only needs read access to the repo you'll point it at)
5. Pick **Only select repositories** → choose `homeatlas` → **Install & Authorize**
6. Back in Cloudflare, select the `homeatlas` repo → **Begin setup**

## Step 6 — Build settings (most important)

You'll see a "Set up builds and deployments" page. Use **exactly** these values:

| Field | Value |
|---|---|
| Project name | `homeatlas` (this becomes your URL — `homeatlas.pages.dev`) |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | *leave empty* |
| Build output directory | `/` |
| Root directory | *leave empty* |

Then click **Save and Deploy**.

Wait about 60 seconds. You'll see green checkmarks and a URL like:

> **https://homeatlas.pages.dev**

Click it. Your site is live. Share that URL with friends and family.

---

## Step 7 — Iterating going forward

You have two options for editing:

**Option A: Edit in GitHub's web UI (no tools needed)**
1. Go to your repo on github.com → click `index.html` → click the pencil ✏️ icon
2. Make changes, scroll down, write a commit message, click **Commit changes**
3. Cloudflare auto-redeploys in ~30 seconds. Refresh the live URL.

**Option B: Edit in Cowork (with me), then upload**
1. We edit `index.html` in your Personal folder as usual
2. You go to GitHub → click `index.html` → click the pencil ✏️ → paste the new content → commit
3. Same auto-redeploy.

I can help you with either path going forward — just tell me what you want to change.

---

## Step 8 — Custom domain (optional, do this later)

Once you've validated the site works for friends/family and want a memorable URL like `homeatlas.app` or `myhomeatlas.com`:

1. Buy the domain. Recommended: **Cloudflare Registrar** (at-cost pricing, no markup). Or Namecheap/Porkbun if you have a preference.
2. In your Cloudflare Pages project: **Custom domains** tab → **Set up a custom domain** → enter your domain.
3. Cloudflare walks you through DNS. If you bought from Cloudflare Registrar, this is one click.
4. Free SSL automatic. Live in 5–10 minutes.

---

## What to share with friends/family

Send them a short message:

> Hey — I'm building a side project called HomeAtlas. Type your home address and it tells you who your electric utility is (including your CCA), what internet/TV/security providers you have, and the schools and educational places near you. California-only for now. Would love your feedback if you find time:
>
> https://homeatlas.pages.dev
>
> Hit "Report an issue or suggest a feature" at the bottom — even one-line reactions help.

---

## Troubleshooting

**"Cloudflare deploy failed"** — most common cause is the `Build output directory` field. Make sure it's just `/` (or empty), not `dist` or `build`. Re-trigger from the Cloudflare deployments tab.

**"Site shows 404 at the URL"** — check that the file in GitHub is named exactly `index.html` (lowercase, no extra extension).

**"Schools section keeps spinning"** — this happens when the public Overpass API is overloaded. The site will auto-retry through 3 mirrors. If you want this to be more reliable for the public site, we'll talk about hosting your own Overpass instance later (free, on a small VPS, ~$5/month).

**"Edits aren't showing up"** — Cloudflare caches aggressively. Hard-refresh with Cmd+Shift+R (Mac) or Ctrl+F5 (Windows). Or wait a few minutes.

---

## Roadmap reminders

After launch, things we discussed earlier:
- Real GIS polygon lookup (replace city/county heuristics with point-in-polygon against CEC + CDE GeoJSON)
- Phase 2 modules: house anatomy by year built, HVAC + ducts, materials/upgrades, yard/plants
- Phase 3: fire/flood/quake risk, voting precinct, water + gas utilities
- US-wide expansion (currently CA-only)
- User accounts (opt-in) for saving addresses + personalization
- Self-hosted Overpass for reliability

Just open Cowork and tell me what to tackle next.
