# Resend Domain + Weekly Digest Setup

Step-by-step to get Nearnity sending email from `feedback@nearnity.com` and `digest@nearnity.com`, then turn on the Friday-morning weekly digest cron.

**Total time:** ~45 minutes, with two waits for DNS propagation (each 5-15 min).

**What you'll have at the end:**
- Verified sending domain `nearnity.com` in Resend
- Outgoing email from `feedback@nearnity.com` (tester feedback replies) and `digest@nearnity.com` (weekly events)
- Weekly digest fires every Friday at 7am in each subscriber's local timezone
- Test confirmation that everything works

---

## Step 1 — Create Resend account (5 min)

1. Open https://resend.com in a fresh tab. Click **Sign up**.
2. Use `svelivela@paypal.com` or a personal Gmail — whichever you'll check more often. Resend will send all delivery / bounce notifications here.
3. After signup, you'll land in the dashboard. **Skip** the onboarding "send your first email" walkthrough — we'll do that programmatically through the Worker.

## Step 2 — Add nearnity.com as a sending domain (5 min)

1. Resend dashboard → left sidebar → **Domains** → click **Add Domain**.
2. Domain: `nearnity.com` (just the apex, no subdomain prefix).
3. Region: **US East (N. Virginia)** — closest to your Cloudflare edge and your audience.
4. Click **Add**.

Resend will show you 3-4 DNS records to add:
- 1× MX record (for receiving bounces)
- 1× TXT (SPF) — authorizes Resend to send on your behalf
- 1× TXT (DKIM) — cryptographic signature
- 1× TXT (DMARC) — policy on what to do with unauthenticated mail

**Leave this tab open.** Don't close until you've completed Step 3.

## Step 3 — Add the DNS records in Cloudflare (10 min)

1. New tab → `dash.cloudflare.com` → click **nearnity.com** zone.
2. Left sidebar → **DNS** → **Records**.
3. For each record Resend showed you, click **Add record** and fill in:

| Record # | Type | Name | Content | Proxy status |
|---|---|---|---|---|
| 1 (MX) | MX | `send` (or as Resend shows) | `feedback-smtp.resend.com` priority 10 | DNS only (grey cloud) |
| 2 (SPF) | TXT | `send` | `v=spf1 include:amazonses.com ~all` | DNS only |
| 3 (DKIM) | TXT | `resend._domainkey` | `p=MIGfMA0G...` (long string from Resend) | DNS only |
| 4 (DMARC) | TXT | `_dmarc` | `v=DMARC1; p=none;` | DNS only |

**Copy each value EXACTLY from Resend** — even one missing character breaks DKIM signing.

**Important:** Set proxy status to "DNS only" (grey cloud, not orange). Cloudflare's orange-cloud proxy breaks SMTP-related records.

4. After all four records are added in Cloudflare, go back to the Resend tab and click **Verify DNS**.
5. Resend will check the records. Usually verifies in 1-3 minutes; can take up to 15. If it fails, double-check you typed each record exactly as Resend showed.

When all four show ✅ green: your domain is verified.

## Step 4 — Create the API key (2 min)

1. Resend dashboard → left sidebar → **API Keys** → **Create API Key**.
2. Name: `nearnity-worker-prod`
3. Permission: **Sending access** (full sending; not "Full Access" which is risky).
4. Domain: `nearnity.com` (only).
5. Click **Add**. **Copy the key immediately** — Resend only shows it once. Format: `re_xxxxxxxxxxxxxxxxxxxxxxx`.

## Step 5 — Add the API key to the Cloudflare Worker (3 min)

The Worker code already references `env.RESEND_API_KEY` — it just needs the value bound.

1. Cloudflare dashboard → **Workers & Pages** → click **nearnity-events**.
2. **Settings** tab → scroll to **Variables and secrets** section.
3. Click **+ Add** → choose **Secret** (NOT plaintext variable — secrets are encrypted).
4. Variable name: `RESEND_API_KEY`
5. Value: paste the `re_xxxxxx` key from Step 4.
6. Click **Save and deploy**.

The Worker will redeploy in ~10 seconds. Once redeployed, all future feedback-form submits AND the weekly digest cron will be able to send email.

## Step 6 — Test the email send (2 min)

1. Open `nearnity.com` in your browser.
2. Click the **💬 Feedback** button bottom-right.
3. Fill in:
   - Type: "General comment"
   - Severity: "Normal"
   - Message: "Test feedback after Resend setup — please ignore."
   - Email: (leave blank)
4. Click **Send feedback**.
5. Within 30 seconds, check `svelivela@paypal.com`. You should receive an email with subject `[Nearnity feedback · normal] Test feedback...`.

**If you don't get the email within 2 minutes:**
- Cloudflare → Worker `nearnity-events` → **Observability** → **Logs** → look for `Resend ...` errors.
- Common issue: DKIM record name wrong. Resend's record was `resend._domainkey.nearnity.com` so in Cloudflare the Name field should just be `resend._domainkey` (Cloudflare adds `.nearnity.com` automatically).

## Step 7 — Wire the weekly digest cron (10 min)

The Worker already has the digest-sending function. We need to:
1. Make sure subscribers can sign up
2. Configure the cron schedule
3. Confirm timezone-aware delivery

### 7a — Confirm the digest cron is wired

1. Cloudflare → Workers & Pages → `nearnity-events` → **Settings** → **Triggers**.
2. Look for a **Cron Triggers** section.
3. You should see something like `0 14 * * 5` (Fridays at 14:00 UTC — that's 7am Pacific, 10am Eastern).

**If there's no cron trigger yet:**
- Click **+ Add Cron Trigger** → enter: `0 14 * * 5`
- Save & deploy

The cron runs once a week (Friday 14:00 UTC). Inside the Worker, the digest function reads each subscriber's saved location, computes their LOCAL Friday morning, and only sends if their local time is between 6-8am. Subscribers in California get the email Friday 7am PT; subscribers in NYC get it Friday 7am ET (the cron runs again at 10am UTC Friday for east coast — see step 7c).

### 7b — Test the digest signup flow

1. Open `nearnity.com`.
2. Search any address (e.g. your home address).
3. After the page loads, scroll down to the bottom of the resolved area — there should be a "Save this place / Email me weekly updates" callout.
4. Click **📬 Email me weekly updates** → jumps to Saved tab → focuses the digest form.
5. Enter your email → Subscribe. You should see "Subscribed!" confirmation.

The subscription is stored in Cloudflare KV under `nearnity:digest_signups:v1`. You can verify by:
- Cloudflare → Workers & Pages → KV → `nearnity_events_cache` (your KV namespace) → search for `digest_signups`.

### 7c — Adjust cron for multi-timezone coverage (optional)

If you have subscribers across timezones (PT and ET), the single Friday 14:00 UTC trigger only catches PT 7am. To also catch ET 7am, add a second trigger:

- `0 11 * * 5` → Friday 11:00 UTC = 7am ET (Eastern Time)
- `0 14 * * 5` → Friday 14:00 UTC = 7am PT (Pacific Time)

The Worker's digest function should be smart enough to only send to subscribers whose local time is currently 6-8am (skipping those who already got it on the earlier run). If it isn't, that's a v2.8 task.

### 7d — Send a test digest immediately

To verify the digest content looks right BEFORE Friday arrives:

1. Cloudflare → Worker `nearnity-events` → **Quick Edit** (or use `wrangler tail` if you have wrangler CLI).
2. Open the Worker URL with a special test path: `https://nearnity-events.satyabhanuv.workers.dev/admin/send-test-digest?email=svelivela@paypal.com` (if this endpoint exists — check `Nearnity_Events_API_Setup_Guide.md`).
3. Or open the Worker's "Trigger event" tool in the Cloudflare dashboard and trigger the scheduled event manually.

## Step 8 — Verify Friday delivery (the first real send)

On the first Friday after setup:
1. Around 7am Pacific (or your local time), check your inbox.
2. You should see "Nearnity Digest — Week of MMM DD".
3. If you don't: check the Worker logs for that Friday. Common causes:
   - No subscribers in KV yet (you're the only one and you might not be in there)
   - Resend rate limit (free tier: 100 emails/day, 3000/month — you're nowhere near unless you go viral)
   - Wrong cron timezone math

---

## Troubleshooting

**"Domain verification failed in Resend"** → check that you set proxy to "DNS only" (grey cloud) on all Resend records. Cloudflare's proxy breaks TXT verification.

**Feedback emails arrive but go to spam** → add `feedback@nearnity.com` to your Gmail contacts. The first 50 emails are usually filtered until Resend's reputation is established with your inbox provider.

**No feedback emails at all** → Check Worker logs. If you see `RESEND_API_KEY not set`, you skipped Step 5. If you see HTTP 401 from Resend, the key is wrong/revoked. Recreate the key.

**Digest cron didn't fire** → Cloudflare → Worker → Observability → Logs → filter for "scheduled". Cron triggers need both a trigger configured AND a `scheduled` handler in the Worker — both are in place but worth verifying.

**Need to pause digest temporarily** → Cloudflare → Worker → Settings → Triggers → disable the cron. Re-enable later. Subscribers stay in KV; nothing else changes.

---

## Costs

- Resend free tier: 100 emails/day, 3,000 emails/month, unlimited domains. **$0/mo** at v1 launch traffic.
- Hits paid tier at 50K monthly emails → $20/mo.
- Realistic crossover: ~500 subscribers × 4 Friday sends = 2,000/month — still free tier.
