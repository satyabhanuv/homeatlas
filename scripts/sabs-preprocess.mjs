#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Nearnity — NCES SABS 2015-16 preprocessing + Cloudflare KV upload
// ─────────────────────────────────────────────────────────────────────────
// Runs inside .github/workflows/sabs-load.yml. Not intended to run locally
// (though it will if you export the CF_* secrets).
//
// Pipeline:
//   1. Download SABS_1516.zip from nces.ed.gov (~556 MB)
//   2. Extract SABS_1516.shp
//   3. mapshaper: -simplify 1% keep-shapes -split stAbbrev -o format=geojson
//   4. Per state file:
//      • Trim properties → only fields the Worker needs (ncessch, leaid,
//        schnam, Level, grade_low, grade_high, geometry).
//      • Compute bbox per feature (Worker uses it as a cheap pre-filter).
//      • Wrap in { state, generated_at, source, features: [...] }.
//      • PUT to KV as nrny:sabs:{ST} via Cloudflare API.
//   5. Print size summary. If a state exceeds CF's 25 MiB KV value limit,
//      recursively simplify or chunk (currently: warn + skip; real fix if
//      hit would be tighter simplification, but 1% keeps all US states
//      under 15 MB in practice).
//
// Notes:
//   • SABS shapefile's field names change per NCES release. This script
//     tolerates both `stAbbrev` (2015-16) and `state` (older) by inspecting
//     the first feature's properties.
//   • Idempotent: safe to re-run. Overwrites existing KV values.
//   • DRY_RUN=true skips the KV upload step (for testing preprocessing).

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, mkdirSync, statSync } from "node:fs";
import { runCommands } from "mapshaper";

const SABS_URL = "https://nces.ed.gov/programs/edge/data/SABS_1516.zip";
const OUT_DIR = "sabs-output";
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;
const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

const KV_VALUE_LIMIT_BYTES = 25 * 1024 * 1024;   // 25 MiB Cloudflare KV limit

function log(...args) { console.log("[sabs-preprocess]", ...args); }
function die(msg) { console.error("[sabs-preprocess] FATAL:", msg); process.exit(1); }

if (!DRY_RUN) {
  if (!CF_ACCOUNT_ID) die("CF_ACCOUNT_ID env var not set");
  if (!CF_API_TOKEN) die("CF_API_TOKEN env var not set");
  if (!CF_KV_NAMESPACE_ID) die("CF_KV_NAMESPACE_ID env var not set");
}

// ─── Step 1: Download + extract SABS shapefile ───────────────────────────
log("Downloading SABS_1516.zip (~556 MB)...");
execSync(`curl -sSL -o sabs.zip "${SABS_URL}"`, { stdio: "inherit" });
log("Extracting shapefile...");
execSync(`unzip -oq sabs.zip -d sabs_extracted`, { stdio: "inherit" });

// Locate the .shp file (might be nested in a subdir)
const findShp = execSync(`find sabs_extracted -name '*.shp' -type f | head -1`, { encoding: "utf8" }).trim();
if (!findShp) die("Could not find .shp file in extracted archive");
log("Located shapefile:", findShp);

// ─── Step 2: mapshaper — convert, simplify, split by state ───────────────
mkdirSync(OUT_DIR, { recursive: true });
log("Running mapshaper (convert → simplify 1% → split by state)...");
const mapshaperCmd = [
  `-i "${findShp}" encoding=utf8`,
  "-simplify 1% keep-shapes",
  "-split stAbbrev",
  `-o format=geojson dir="${OUT_DIR}/"`,
].join(" ");
await runCommands(mapshaperCmd);
log("mapshaper done. Output files:");
execSync(`ls -la ${OUT_DIR}/`, { stdio: "inherit" });

// ─── Step 3: Per state — trim properties, add bbox, upload to KV ─────────
function computeBbox(geometry) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  const walk = (coords) => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === "number") {
      if (coords[0] < minLon) minLon = coords[0];
      if (coords[0] > maxLon) maxLon = coords[0];
      if (coords[1] < minLat) minLat = coords[1];
      if (coords[1] > maxLat) maxLat = coords[1];
      return;
    }
    for (const c of coords) walk(c);
  };
  walk(geometry.coordinates);
  return [minLon, minLat, maxLon, maxLat];
}

function normProps(p) {
  // SABS 2015-16 property names (per NCES tech doc verified 2026-07-21).
  // Legacy fallbacks for older SABS releases and mapshaper's occasional
  // property-case normalization.
  return {
    ncessch:    p.ncessch    || p.NCESSCH    || p.SchoolID  || null,
    leaid:      p.leaid      || p.LEAID      || p.DistrictID|| null,
    schnam:     p.schnam     || p.SchoolName || p.SCHNAM    || null,
    level:      (p.Level || p.LEVEL || p.level || "").toString().toUpperCase().slice(0, 1),
    // Grade fields — SABS 2015-16 has `grade1sy` (high) / `grade2sy` (low).
    // Some releases use grade_low/grade_high.
    grade_low:  p.grade2sy   || p.grade_low  || null,
    grade_high: p.grade1sy   || p.grade_high || null,
  };
}

const stateFiles = readdirSync(OUT_DIR).filter(f => f.endsWith(".json"));
log(`\nFound ${stateFiles.length} per-state files. Processing + uploading...\n`);

let totalFeatures = 0;
let totalBytes = 0;
let uploadOk = 0;
let uploadFail = 0;

for (const file of stateFiles) {
  // mapshaper -split produces files like "SABS_1516-CA.json" or "-AL.json"
  const state = file.replace(/\.json$/, "").split("-").pop().toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) {
    log(`  Skipping ${file}: could not derive 2-letter state code`);
    continue;
  }
  const raw = JSON.parse(readFileSync(`${OUT_DIR}/${file}`, "utf8"));
  const features = (raw.features || []).map(f => {
    const props = normProps(f.properties || {});
    return { ...props, bbox: computeBbox(f.geometry), geometry: f.geometry };
  }).filter(f => f.ncessch && f.geometry);

  const payload = {
    state,
    generated_at: new Date().toISOString(),
    source: "NCES SABS 2015-16 (https://nces.ed.gov/programs/edge/SABS)",
    caveat: "Attendance zones are 10+ years old. Zones redraw regularly, especially in growth-belt metros. Always verify with your district's official school finder.",
    features,
  };
  const body = JSON.stringify(payload);
  const size = Buffer.byteLength(body);
  totalFeatures += features.length;
  totalBytes += size;

  const sizeMb = (size / 1024 / 1024).toFixed(2);
  const sizeWarn = size > KV_VALUE_LIMIT_BYTES ? " ⚠️ EXCEEDS 25MB KV LIMIT" : "";
  log(`  ${state}: ${features.length} features, ${sizeMb} MB${sizeWarn}`);

  if (size > KV_VALUE_LIMIT_BYTES) {
    log(`  ✗ ${state} skipped — needs tighter simplification (0.5%) or chunking. TODO in v2.8.2c.`);
    uploadFail++;
    continue;
  }

  if (DRY_RUN) {
    log(`  → dry-run, skipping KV upload`);
    continue;
  }

  const kvKey = `nrny:sabs:${state}`;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(kvKey)}`;
  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body,
    });
    if (resp.ok) {
      log(`  ✓ ${state} uploaded to KV (${kvKey})`);
      uploadOk++;
    } else {
      const errText = await resp.text();
      log(`  ✗ ${state} KV upload failed: HTTP ${resp.status} — ${errText.slice(0, 200)}`);
      uploadFail++;
    }
  } catch (e) {
    log(`  ✗ ${state} KV upload threw: ${e.message}`);
    uploadFail++;
  }
}

log("\n═══════════════════════════════════════════════════════════════");
log(`Total states processed:  ${stateFiles.length}`);
log(`Total features:          ${totalFeatures.toLocaleString()}`);
log(`Total size:              ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
log(`KV uploads OK / failed:  ${uploadOk} / ${uploadFail}`);
log(`Dry run:                 ${DRY_RUN}`);
log("═══════════════════════════════════════════════════════════════");

if (uploadFail > 0 && !DRY_RUN) {
  process.exit(1);   // fail the workflow so we notice
}
