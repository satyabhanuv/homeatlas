#!/usr/bin/env python3
"""
HomeAtlas event scraper — quick-validation pipeline.

Reads a list of source adapters (LibCal iCal feeds, BiblioCommons HTML,
CivicPlus calendars), normalizes each event into a common shape, and
writes events.json.

Run locally (sandbox blocks outbound to most public sites):
    cd scraper/
    pip install -r requirements.txt
    python3 scrape_events.py

Then inline the resulting events.json into homeatlas.html (search for the
HOMEATLAS_EVENTS_SEED const).

Output schema (per event):
{
  "city":     "phoenixville",          # lowercase city key, must match HomeAtlas getCityKey
  "state":    "PA",
  "title":    "Phoenixville Farmers Market",
  "venue":    "200 Mill St, Phoenixville, PA",
  "lat":      40.131,                  # optional
  "lon":     -75.515,                  # optional
  "starts":   "2026-05-09T09:00",      # ISO 8601 local
  "ends":     "2026-05-09T13:00",      # optional
  "category": "market",                # one of: market, music, kids, civic,
                                       # sports, art, festival, library, other
  "url":      "https://phoenixvillefarmersmarket.org/",
  "source":   "phoenixvillefarmersmarket.org",   # human-readable origin
  "verified": True,                    # True = pulled from official source
  "free":     True
}

The HomeAtlas UI groups by city and filters by date range (next 30 days).
"""
from __future__ import annotations
import json, re, sys, time
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, List, Dict, Iterable

try:
    import requests
    from bs4 import BeautifulSoup
    from icalendar import Calendar
except ImportError as e:
    print(f"Missing dependency: {e}\nRun: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

OUT = Path(__file__).parent / "events.json"
HDRS = {"User-Agent": "HomeAtlas-Scraper/0.1 (+https://homeatlas.satyabhanuv.workers.dev)"}
WINDOW_DAYS = 30
NOW = datetime.now()
WINDOW_END = NOW + timedelta(days=WINDOW_DAYS)


# ---------------------------------------------------------------- adapters


def fetch_libcal_ical(name: str, url: str, city: str, state: str) -> List[Dict]:
    """LibCal exposes iCal at https://X.libcal.com/ical/?cid=... or events.ics."""
    print(f"[libcal] {name} -> {url}")
    out: List[Dict] = []
    try:
        r = requests.get(url, headers=HDRS, timeout=15)
        r.raise_for_status()
        cal = Calendar.from_ical(r.content)
        for c in cal.walk():
            if c.name != "VEVENT":
                continue
            try:
                start = c.decoded("dtstart")
                if isinstance(start, datetime):
                    start_local = start.astimezone() if start.tzinfo else start
                else:
                    start_local = datetime.combine(start, datetime.min.time())
                if start_local < NOW or start_local > WINDOW_END:
                    continue
                end_dec = c.decoded("dtend") if "dtend" in c else None
                end_local = None
                if isinstance(end_dec, datetime):
                    end_local = end_dec.astimezone() if end_dec.tzinfo else end_dec
                title = str(c.get("summary", "")).strip()
                if not title:
                    continue
                out.append({
                    "city": city,
                    "state": state,
                    "title": title,
                    "venue": str(c.get("location", "")).strip() or None,
                    "starts": start_local.strftime("%Y-%m-%dT%H:%M"),
                    "ends":   end_local.strftime("%Y-%m-%dT%H:%M") if end_local else None,
                    "category": "library",
                    "url": str(c.get("url", "")) or url,
                    "source": name,
                    "verified": True,
                    "free": True,
                })
            except Exception as e:
                print(f"  ! event skip: {e}")
    except Exception as e:
        print(f"  ! libcal fail: {e}")
    print(f"  + {len(out)} events")
    return out


def fetch_bibliocommons(name: str, url: str, city: str, state: str) -> List[Dict]:
    """
    BiblioCommons (sjpl, sfpl, sccld, etc.) — HTML scrape.
    Each event card has a heading link + a meta block with date/venue.
    """
    print(f"[bibliocommons] {name} -> {url}")
    out: List[Dict] = []
    try:
        r = requests.get(url, headers=HDRS, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        # Cards are <li class="cp-event"> or similar; the structure varies
        # by deployment. We look for any <a> whose href contains "/events/"
        # and grab the surrounding context.
        cards = soup.select("[class*='cp-event'], [class*='events-list-item'], li[class*='event']")
        for card in cards[:60]:
            link = card.find("a", href=re.compile(r"/events/[0-9]"))
            if not link:
                continue
            title = link.get_text(strip=True)
            href = link.get("href", "")
            if href.startswith("/"):
                href = url.split("/", 3)[0] + "//" + url.split("/", 3)[2] + href
            # Try to extract a date from time tags or text
            tt = card.find("time")
            iso = tt.get("datetime") if tt and tt.has_attr("datetime") else None
            try:
                starts = datetime.fromisoformat(iso) if iso else None
            except Exception:
                starts = None
            if not starts:
                continue
            if starts < NOW or starts > WINDOW_END:
                continue
            venue = ""
            ven = card.find(class_=re.compile(r"location|venue|branch", re.I))
            if ven:
                venue = ven.get_text(" ", strip=True)
            out.append({
                "city": city, "state": state, "title": title,
                "venue": venue or None,
                "starts": starts.strftime("%Y-%m-%dT%H:%M"),
                "ends": None,
                "category": "library",
                "url": href,
                "source": name,
                "verified": True,
                "free": True,
            })
    except Exception as e:
        print(f"  ! bibliocommons fail: {e}")
    print(f"  + {len(out)} events")
    return out


def fetch_civicplus_ical(name: str, url: str, city: str, state: str) -> List[Dict]:
    """CivicPlus (city sites) often expose iCal at /CalendarRSS.aspx?CID=N or
    /api/RSS/CalendarFeed?id=N. Pass the iCal URL directly here."""
    return fetch_libcal_ical(name, url, city, state)  # same parser


# ---------------------------------------------------------------- registry

# Source registry. Add an entry per city/source.  URLs marked TODO require the
# operator to find the real iCal/feed endpoint by visiting the calendar page
# and clicking "Subscribe / Export to iCal".
SOURCES = [
    # ---- Bay Area ----
    {"adapter": "libcal",        "name": "Sunnyvale Public Library", "city": "sunnyvale",     "state": "CA",
     "url": "https://sunnyvale.libcal.com/ical_subscribe.php?l=sunnyvale&cid=ALL"},  # TODO verify cid
    {"adapter": "bibliocommons", "name": "San Jose Public Library",  "city": "san jose",      "state": "CA",
     "url": "https://sjpl.bibliocommons.com/events/search/index?days=30"},
    {"adapter": "bibliocommons", "name": "SF Public Library",        "city": "san francisco", "state": "CA",
     "url": "https://sfpl.bibliocommons.com/events/search/index?days=30"},
    {"adapter": "bibliocommons", "name": "Santa Clara County Lib (Milpitas branch)", "city": "milpitas", "state": "CA",
     "url": "https://sccld.bibliocommons.com/events/search/index?days=30&locations=Milpitas+Library"},

    # ---- Philadelphia metro ----
    {"adapter": "libcal", "name": "Phoenixville Public Library", "city": "phoenixville", "state": "PA",
     "url": "https://phoenixvillelibrary.libcal.com/ical_subscribe.php?cid=ALL"},  # TODO verify cid
    {"adapter": "libcal", "name": "Free Library of Philadelphia", "city": "philadelphia", "state": "PA",
     "url": "https://libwww.freelibrary.org/api/calendar/all.ics"},  # TODO verify endpoint
    {"adapter": "civicplus", "name": "Phoenixville Borough", "city": "phoenixville", "state": "PA",
     "url": "https://www.phoenixville.org/CalendarRSS.aspx?CID=14"},  # TODO verify CID
    {"adapter": "civicplus", "name": "Upper Merion Township (KOP)", "city": "king of prussia", "state": "PA",
     "url": "https://www.umtownship.org/CalendarRSS.aspx?CID=14"},  # TODO verify CID
]


def main():
    all_events: List[Dict] = []
    for src in SOURCES:
        adapter = src["adapter"]
        if adapter == "libcal":
            events = fetch_libcal_ical(src["name"], src["url"], src["city"], src["state"])
        elif adapter == "bibliocommons":
            events = fetch_bibliocommons(src["name"], src["url"], src["city"], src["state"])
        elif adapter == "civicplus":
            events = fetch_civicplus_ical(src["name"], src["url"], src["city"], src["state"])
        else:
            print(f"!! unknown adapter {adapter}")
            continue
        all_events.extend(events)
        time.sleep(0.5)  # be polite

    # Deduplicate by (city, title, starts)
    seen = set()
    deduped = []
    for ev in all_events:
        key = (ev["city"], ev["title"], ev["starts"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(ev)

    deduped.sort(key=lambda e: (e["city"], e["starts"]))
    OUT.write_text(json.dumps({
        "generated": NOW.strftime("%Y-%m-%dT%H:%M"),
        "window_days": WINDOW_DAYS,
        "events": deduped,
    }, indent=2))
    print(f"\nWrote {len(deduped)} events to {OUT}")


if __name__ == "__main__":
    main()
