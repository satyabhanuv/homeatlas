# HomeAtlas — Architecture & Build Plan

**Working name:** HomeAtlas (alternatives: HomeLens, HomeFile, MyHomeIQ, HomeBlueprint — pick after domain check)
**Version:** v0.2
**Date:** 2026-04-30
**Owner:** Satya Bhanu

---

## 0. The bigger picture

Zoning is **Phase 1**. The product is a **single-stop home knowledge platform** — everything a homeowner or renter wants to know about *their specific home*, retrieved by entering one address. Future modules:

- **House anatomy by year built** — likely framing, electrical (knob-and-tube, aluminum, copper), plumbing (galvanized, copper, PEX), insulation type, roofing materials based on era + region + permit history
- **HVAC & ducts** — duct sizing standards (e.g., 4-inch dryer vent, 6-inch supply trunks per ACCA Manual D), what's likely in your house, what current code requires
- **Materials & connectors** — what works with what's in your walls; latest tech upgrades that are compatible (e.g., heat pump retrofit options for a 1965 home with a 100A panel)
- **Yard & garden** — USDA hardiness zone, Sunset zone, soil type (USDA SSURGO), native + drought-tolerant plants, watering schedule
- **Risk profile** — fire, flood, earthquake, sea-level rise
- **Civic** — voting precinct, sales tax, water district, gas utility

The MVP geographic scope is **California**, but the architecture is location-agnostic — the same address-to-polygon mechanic powers US-wide and eventual global expansion. Each module is a swappable data layer.



---

## 1. What we're building

A free public website where any California resident enters their home address and instantly sees:

1. **Electric utility zone** — which utility serves them (PG&E, SCE, SDG&E, LADWP, SMUD, or one of ~40 publicly-owned utilities)
2. **Internet service zone** — which ISPs are reported to serve their address, and at what speeds
3. **School zone** — which public school district their address falls in (and, later, which elementary/middle/high attendance area)

Long-term this becomes a generic "what zone am I in?" platform — fire hazard severity zones, water districts, voting precincts, FEMA flood zones, Census tracts, sales tax jurisdictions, etc. all share the same underlying mechanic: **address → point → polygon lookup**.

## 2. Why this is feasible as a free, public site

The mechanic is the same in every case: convert the address to a `(latitude, longitude)` point, then test which polygon in a reference map contains that point. California publishes most of the polygons we need under open licenses, and OpenStreetMap publishes the geocoder for free. The whole MVP can run as a static website with no backend — meaning hosting cost approaches $0 and there is nothing to break in production.

## 3. Architecture

```
[ User browser ]
      │
      ├─► (1) Address input (street, city, ZIP)
      │
      ├─► (2) Geocode via Nominatim (OpenStreetMap)
      │       returns lat/lon + bounding box
      │
      ├─► (3) Point-in-polygon lookup against bundled GeoJSON layers:
      │       • CDE school district boundaries
      │       • CEC electric utility service territories
      │       • FCC broadband coverage (deferred — see §5)
      │
      └─► (4) Render results card (utility name, ISPs, district)
```

Everything except geocoding happens client-side. The GeoJSON files are bundled into the site as static assets. Point-in-polygon is a few lines of JS using `turf.js` or hand-rolled ray-casting.

## 4. Data sources (verified 2026-04-30)

### 4.1 School districts ✅ Open and ready

- **California Department of Education GIS Hub** — `gis.data.ca.gov` / `data-cdegis.opendata.arcgis.com`
- **Dataset:** "California School District Areas" (2024-25 release available)
- **Format:** GeoJSON, KML, Shapefile — direct download
- **License:** Public, attribution to CDE
- **Size:** ~10–20 MB GeoJSON for the full state; we will simplify polygons (`mapshaper` Douglas–Peucker at ~0.0001°) to ship ~2–4 MB

### 4.2 Electric utility service territories ✅ Open and ready

- **California Energy Commission GIS Open Data** — `cecgis-caenergy.opendata.arcgis.com`
- **Dataset:** "California Electric Utility Service Territories & Balancing Authorities"
- **Format:** GeoJSON / Shapefile direct download
- **License:** Public domain / CEC attribution
- **Coverage:** All IOUs (PG&E, SCE, SDG&E), POUs, irrigation districts, federal areas
- **Size:** ~1–3 MB after simplification

### 4.3 Internet / ISP coverage ⚠️ Requires extra step

- **FCC National Broadband Map** — `broadbandmap.fcc.gov`
- **API:** Public API spec available, but requires an FCC user account + generated API token
- **Bulk data:** Downloadable per state as CSV (Broadband Data Collection)
- **Approach for MVP:** Bundle the latest CA bulk extract as a precomputed lookup keyed by Census block. Geocoder returns lat/lon → derive Census block → lookup ISP list. Refresh quarterly when FCC publishes new BDC data.
- **Caveat:** ISP-reported coverage is known to be optimistic. We will display this disclaimer on every result.

### 4.4 Geocoding ⚠️ MVP-grade, not production-scale

- **Nominatim** (OpenStreetMap Foundation hosted instance)
- **Free, no API key**
- **Hard limit: 1 request per second per app, must send `User-Agent` header**
- **For a real public site this will not scale.** See §7 for the upgrade path.

## 5. MVP scope (what ships first)

| Capability | MVP | Phase 2 |
|---|---|---|
| Address geocoding | OSM Nominatim (rate-limited) | Self-hosted Nominatim or paid Mapbox/Google |
| School district lookup | ✅ District-level | School attendance boundaries (LAUSD, SFUSD, SDUSD have these published) |
| Electric utility | ✅ | Add gas utility, water district |
| ISP / broadband | ✅ Bundled FCC BDC extract | Live FCC API + speed-test integration |
| Results UI | Address bar + results card, mobile-first | Map view, share link, save address |
| Data freshness | Quarterly manual refresh | Automated pipeline |
| Hosting | GitHub Pages or Cloudflare Pages (free) | Same — static site stays free at scale |

## 6. Tech stack

- **Frontend:** Single-file HTML + vanilla JS for the prototype. Migrate to React + Vite once scope grows past one page.
- **Geometry:** [`@turf/boolean-point-in-polygon`](https://turfjs.org/) (~5 KB gzipped)
- **Map preview (Phase 2):** Leaflet + OSM tiles
- **Hosting:** Cloudflare Pages (free tier, global CDN, no backend needed)
- **Domain:** Suggest `cazones.org` or similar — purchase ~$12/year

## 7. Risks and mitigations

1. **Nominatim rate limit (1 req/s)** — Will throttle real usage. Mitigation: ship MVP with Nominatim, add a "request count" indicator, and switch to Mapbox ($0.50 / 1000 requests, 100K free/month) before going viral.
2. **GeoJSON bundle size** — Simplification with `mapshaper` brings the full state down to a few MB; lazy-load per layer.
3. **Stale FCC data** — FCC BDC updates twice yearly. Show a "data as of" footer.
4. **ISP coverage accuracy** — Display disclaimer; encourage users to confirm with the provider.
5. **Edge cases on territory boundaries** — A point on a boundary may be ambiguous. Use small buffer + show "borders X and Y" when within 50m of an edge.
6. **Address privacy** — Geocoding sends the address to OSM. We will state this clearly. No address is stored server-side — there is no server.

## 8. Cost model

| Item | MVP cost | At 100K monthly users |
|---|---|---|
| Hosting (Cloudflare Pages) | $0 | $0 |
| Domain | $12 / year | $12 / year |
| Geocoding (Nominatim) | $0 (rate-limited) | Replace with Mapbox: ~$0–50 / month |
| Data refreshes | manual time | manual time, ~2 hrs / quarter |

The MVP is buildable and runnable for under $15/year.

## 9. Roadmap

- **Week 1:** MVP prototype (this conversation) — sample data for 5–10 ZIP codes, full UI, deployable
- **Week 2:** Wire up real CDE school district GeoJSON, real CEC utility GeoJSON
- **Week 3:** Bundle FCC BDC California extract, ZIP/block lookup
- **Week 4:** Polish UI, add disclaimers, set up `cazones.org` + Cloudflare Pages
- **Phase 2 (month 2+):** School attendance boundaries for the 3 largest districts, gas/water utility, fire hazard zones (Cal Fire FHSZ), legislative districts
- **Phase 3:** User accounts to save addresses, public API, embeddable widget, statewide expansion to other state-specific layers

## 10. Decisions locked in (2026-04-30)

1. **Scope:** CA → US → global. Architecture must be location-agnostic from day one.
2. **Bigger vision:** Single-stop home knowledge platform (see §0). Zoning is Phase 1.
3. **Domain:** Working name **HomeAtlas**. Final name TBD — needs `.com` availability check. Backup options: HomeLens, HomeFile, HomeBlueprint, HouseAtlas, MyHomeIQ.
4. **Privacy v1:** No accounts, no address storage. Geocoding traffic goes to OSM (disclosed clearly).
5. **Privacy v2 (when monetizing):** Optional accounts → save addresses → personalized recommendations and ads.
6. **Phase 2 priorities:** All civic layers (fire, water, gas, voting, sales tax) plus house-anatomy module (year built, materials, HVAC, ducts) and yard module (soil, plants).
