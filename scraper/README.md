# HomeAtlas Event Scraper

Quick-validation pipeline for the "Happening this month" subtab.

## What it does

Pulls events from public library and city calendars in:

- **Bay Area** — San Jose, Milpitas, San Francisco, Sunnyvale
- **Philadelphia metro** — Philadelphia, King of Prussia, Phoenixville

Normalizes them into a single `events.json` keyed by lowercase city, then
that JSON gets inlined into `homeatlas.html` so the static site can show
real listings without a backend.

## Why it isn't run from the build sandbox

The Cowork sandbox blocks outbound HTTP to non-allowlisted hosts, so the
scraper has to run on a machine with normal internet access (your laptop).

## How to run

```bash
cd scraper/
pip install -r requirements.txt
python3 scrape_events.py
# writes events.json
```

Then open `homeatlas.html` and replace the `HOMEATLAS_EVENTS_SEED` const
near the bottom of the file with the contents of the new `events.json`,
and `cp homeatlas.html index.html`. Push, and Cloudflare auto-deploys.

## Source registry

`SOURCES` in `scrape_events.py` is the only thing you edit when adding a
city. Each entry is:

```python
{
  "adapter": "libcal" | "bibliocommons" | "civicplus",
  "name":    "Pretty source name",
  "city":    "lowercase city key",
  "state":   "PA",
  "url":     "https://...",
}
```

### Adapters

- **libcal** — used by most public libraries (Phoenixville Lib, Free Lib of
  Phila, Upper Merion Lib). To find the iCal URL: visit the calendar page,
  click "Subscribe via iCal" or "Add to my calendar", copy the .ics URL.
- **bibliocommons** — used by SJPL, SFPL, Santa Clara County Lib (Milpitas).
  HTML scrape, pass the search URL with `?days=30`.
- **civicplus** — used by most US municipal websites (Phoenixville Borough,
  Upper Merion Township). Look for `CalendarRSS.aspx?CID=N` and copy the URL
  with the right CID for the calendar you want.

## Adding a new city

1. Find the public calendar URL (library + city site).
2. Identify which adapter fits.
3. Append to `SOURCES`.
4. Run the scraper. Verify events appear with sane dates and venues.
5. Re-inline into `homeatlas.html`.

## Refresh cadence

Re-run weekly (Sunday night). Future: convert to a GitHub Action that
runs `scrape_events.py` and commits the updated `events.json` on a cron.
