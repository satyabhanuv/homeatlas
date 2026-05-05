# HomeAtlas — Backup Workflow

How to back up your HomeAtlas project files (code + docs) to GitHub on a sustainable cadence.

**TL;DR:** add the markdown docs to your existing GitHub repo. One-time setup ~10 min. Ongoing weekly backup ~2 min. You keep version history of every doc + the deploy-ready code in one place.

---

## What you have today

Two locations:

1. **Your Personal folder on your computer** — contains everything we've created:
   - `index.html` (the deploy-ready site)
   - `homeatlas.html` (working copy)
   - `HomeAtlas_Project_Brief.md`, `HomeAtlas_Release_Notes.md`, `HomeAtlas_Deployment_Guide.md`, `HomeAtlas_Tooling_Hosting_Roadmap.md`, `HomeAtlas_Domain_Names.md`, `HomeAtlas_Chat_History.md`, `HomeAtlas_Backup_Workflow.md`, `CA_Zoning_Lookup_Plan.md`
2. **Your GitHub repo** — currently has `index.html` only (since that's what Cloudflare auto-deploys from)

Goal: get the markdown docs into the GitHub repo so you have one source of truth + version history.

---

## One-time setup (10 minutes)

### Option A: GitHub web UI — easiest, no command line

This works entirely in the browser. Repeat once for each `.md` file.

1. Open your existing HomeAtlas repo on github.com (the one that has `index.html`).
2. Click **Add file → Upload files**.
3. **Drag the `.md` files** from your Personal folder into the upload area. You can do all 8 docs in one go.
4. Optionally: drag them into a `docs/` subfolder by typing `docs/` before the filename in the upload area, but root-level is fine.
5. Scroll down. Commit message: `Add project docs`. Click **Commit changes**.

That's it. Repo now has both code and docs.

### Option B: git CLI — if you're comfortable with terminal

If you have git installed on your computer:

```bash
# One-time: clone your repo to your computer
cd ~  # or wherever you want it
git clone https://github.com/<your-username>/<your-repo-name>.git homeatlas-repo
cd homeatlas-repo

# Copy your docs into the repo folder
cp ~/path/to/Personal/*.md .
cp ~/path/to/Personal/index.html .

# Stage, commit, push
git add .
git commit -m "Add project docs"
git push
```

Replace `<your-username>` and `<your-repo-name>` with your actual values, and `~/path/to/Personal/` with the actual path on your computer. (On Mac, the Cowork "Personal" folder is wherever you selected it — likely Documents or a Cowork-named folder.)

---

## Weekly backup workflow

After the one-time setup, here's the simple weekly motion:

### Web UI version (no command line)

Once a week, set a reminder. When it fires:

1. Open your GitHub repo on github.com.
2. Click each file you've changed, then the pencil ✏️ to edit.
3. Paste the latest content from your Personal folder.
4. Commit.

Works for a few changed files. Tedious for many — switch to CLI if it gets unwieldy.

### CLI version — recommended once it's set up

```bash
cd ~/homeatlas-repo  # wherever you cloned it

# Copy any updated files from your Personal folder
cp ~/path/to/Personal/index.html .
cp ~/path/to/Personal/*.md .

# Check what changed
git status
git diff

# Stage and commit
git add .
git commit -m "Weekly snapshot $(date +%Y-%m-%d)"
git push
```

### "Make me a script" version

If you want one-command weekly backup, save this as `~/homeatlas-backup.sh`:

```bash
#!/bin/bash
set -e
PERSONAL_FOLDER="$HOME/path/to/Personal"   # ← edit this to your actual path
REPO_FOLDER="$HOME/homeatlas-repo"          # ← edit this to your repo path

cd "$REPO_FOLDER"
cp "$PERSONAL_FOLDER"/*.html .
cp "$PERSONAL_FOLDER"/*.md .
git add .
git commit -m "Weekly snapshot $(date +%Y-%m-%d)" || echo "Nothing to commit"
git push
echo "Backup complete: $(date)"
```

Then make it executable and run weekly:

```bash
chmod +x ~/homeatlas-backup.sh
~/homeatlas-backup.sh
```

You can also add it to your calendar or set up a `cron` job to remind you.

---

## What to back up vs what NOT to

### Always back up
- `index.html` (the deploy-ready code — also what Cloudflare auto-deploys from)
- `homeatlas.html` (working copy, slightly out of sync sometimes; helpful to keep as a snapshot)
- All `*.md` planning/handoff/release-note docs

### Don't back up to a public repo
- Anything with secrets (API keys, etc.) — we don't have any in the codebase yet, but as Phase 3+ adds Eventbrite / Mapbox / paid APIs, those keys go in Cloudflare Worker secrets, NEVER in the repo
- `CHANGE-ME@example.com` is fine; an actual email is fine; passwords/tokens are not

### Optional but nice
- Screenshots of milestones (`v0.13_yard_card_first_render.png`)
- A `tickets/` folder with notes for individual feature ideas

---

## What this gets you

- **Version history** — diff any two weeks, see what changed
- **Disaster recovery** — your laptop dies, your work is in GitHub
- **Account portability** — clone the repo from any computer, any account
- **Public artifact** — if you want to open-source the docs eventually, they're already there
- **Auto-deploy continues to work** — Cloudflare keeps deploying from the same `index.html`

---

## When you switch to personal Claude

Recovery is simple: clone the repo on the new computer/account, point your new Claude conversation at it (Claude Code reads `*.md` files automatically; claude.ai Projects can have files uploaded). You'll have everything: code + history + decisions + brief.

If your laptop dies tomorrow, the recovery cost is one `git clone` and one Cloudflare deploy.

---

## Cadence advice

- **Weekly backup is the right rhythm** for friends-and-family scale. Daily is overkill; monthly leaves too much in flux.
- **Right after each "shipped" iteration** is also fine — that's how you set up the previous Cloudflare auto-deploy on `index.html`. The other docs can wait until weekly.
- **Set a recurring calendar reminder** for, say, Sunday evenings: "HomeAtlas weekly backup — 5 min."
- **Don't backup mid-iteration.** Better to wait until a feature is shipped and the release-notes block is appended before snapshotting.

That's it. Going back to building.
