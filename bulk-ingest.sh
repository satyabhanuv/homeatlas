#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# Nearnity 50-state bulk ingest — Tier 1 launch requirement
# ─────────────────────────────────────────────────────────────────────────
# Hits every /api/admin/*-ingest endpoint for all 51 states/DC across all
# working sources. Sequential + throttled to be nice to Cloudflare Workers
# (50 subrequest cap per invocation → split-source pattern from v2.7.11.4
# ensures each call stays under it). Logs each response to a timestamped
# directory. Prints a coverage summary at the end.
#
# ── PREREQUISITES ─────────────────────────────────────────────────────
#   • bash 4+ (Mac's default 3.2 works too, but arrays require quoting)
#   • curl (built-in)
#   • jq (brew install jq) — optional, used only for the summary
#   • ADMIN_TOKEN exported in the shell
#
# ── USAGE ─────────────────────────────────────────────────────────────
#   export ADMIN_TOKEN="your-token-here"
#   ./bulk-ingest.sh                    # default: nearnity.com, all 51 states
#   NEARNITY_DOMAIN=https://preview.pages.dev ./bulk-ingest.sh
#   STATES="CA NY TX" ./bulk-ingest.sh   # subset for testing
#
# ── WHAT IT DOES ──────────────────────────────────────────────────────
# Per state:
#   1. /api/admin/geo-ingest           → medical KV (CMS + NPPES)
#   2. /api/admin/events-ingest?source=nps           → NPS events
#   3. /api/admin/events-ingest?source=usda          → USDA farmers markets
#   4. /api/admin/events-ingest?source=ticketmaster  → Ticketmaster
#   5. /api/admin/events-ingest?source=libraries     → BiblioCommons libs
#   6. /api/admin/events-ingest?source=socrata       → City Socrata datasets
#
# Estimated runtime: ~15-25 min for all 51 states (varies with network + CF
# cold-start). Safe to run in a `tmux` / `screen` session and detach.
# ─────────────────────────────────────────────────────────────────────────

set -u   # strict undefined-var (not -e — we want to continue past failures)

DOMAIN="${NEARNITY_DOMAIN:-https://nearnity.com}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"
if [ -z "$ADMIN_TOKEN" ]; then
  echo "ERROR: ADMIN_TOKEN env var required. Run: export ADMIN_TOKEN='...'" >&2
  exit 1
fi

# All 50 states + DC. Overridable via STATES env var (space-separated).
DEFAULT_STATES="AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY"
STATES="${STATES:-$DEFAULT_STATES}"

# Sources to run per state. Overridable via SOURCES env var.
DEFAULT_SOURCES="geo nps usda ticketmaster libraries socrata"
SOURCES="${SOURCES:-$DEFAULT_SOURCES}"

# Pause between requests (seconds) to be polite to Cloudflare
SLEEP_BETWEEN="${SLEEP_BETWEEN:-3}"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_DIR="./ingest-logs-${TIMESTAMP}"
mkdir -p "$LOG_DIR"
SUMMARY_FILE="${LOG_DIR}/_summary.tsv"
printf "state\tsource\thttp_status\tfetched\tgeocoded\terror\n" > "$SUMMARY_FILE"

echo "═══════════════════════════════════════════════════════════════════"
echo "Nearnity bulk ingest"
echo "  Domain:      $DOMAIN"
echo "  States:      $(echo $STATES | wc -w | tr -d ' ') states"
echo "  Sources:     $SOURCES"
echo "  Log dir:     $LOG_DIR"
echo "  Started:     $(date)"
echo "═══════════════════════════════════════════════════════════════════"

hit_endpoint() {
  local url="$1" label="$2" out_file="$3"
  local http_code
  # v2.7.14: send browser UA + Accept-Language so Cloudflare's Bot Fight Mode
  # doesn't return the JS challenge page instead of the Worker response.
  # If CF still challenges even with a browser UA, add a WAF skip rule for
  # /api/admin/* (see README section "Cloudflare WAF bypass for admin endpoints").
  http_code=$(curl -sS -o "$out_file" -w "%{http_code}" --max-time 180 \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    -H "Accept: application/json, text/plain, */*" \
    -H "Accept-Language: en-US,en;q=0.9" \
    -H "Referer: https://nearnity.com/" \
    "$url" || echo "curl_err")
  # Parse fetched/geocoded/error from response if it's JSON
  local fetched geocoded err
  if command -v jq >/dev/null 2>&1 && [ -s "$out_file" ]; then
    fetched=$(jq -r '.total_events // .cms_fetched // .nppes_fetched // "?"' "$out_file" 2>/dev/null | head -1)
    geocoded=$(jq -r '.geocoded_events // .cms_geocoded // .nppes_geocoded // "?"' "$out_file" 2>/dev/null | head -1)
    err=$(jq -r '.error // .geocode_error // ""' "$out_file" 2>/dev/null | head -1 | tr '\t' ' ' | cut -c1-80)
  else
    fetched="?"; geocoded="?"; err=""
  fi
  printf "%s\t%s\t%s\t%s\t%s\t%s\n" \
    "${label%%-*}" "${label#*-}" "$http_code" "$fetched" "$geocoded" "$err" \
    >> "$SUMMARY_FILE"
  printf "  [HTTP %s] fetched=%-6s geocoded=%-6s %s\n" \
    "$http_code" "$fetched" "$geocoded" "$err"
}

STATE_COUNT=0
for STATE in $STATES; do
  STATE_COUNT=$((STATE_COUNT + 1))
  echo ""
  echo "─── [$STATE_COUNT] $STATE ─────────────────────────────────────────"
  for SRC in $SOURCES; do
    LABEL="${STATE}-${SRC}"
    OUT_FILE="${LOG_DIR}/${LABEL}.json"
    if [ "$SRC" = "geo" ]; then
      URL="${DOMAIN}/api/admin/geo-ingest?state=${STATE}&admin_token=${ADMIN_TOKEN}"
      printf "  %-14s " "medical-geo"
    else
      URL="${DOMAIN}/api/admin/events-ingest?state=${STATE}&source=${SRC}&admin_token=${ADMIN_TOKEN}"
      printf "  %-14s " "events-${SRC}"
    fi
    hit_endpoint "$URL" "$LABEL" "$OUT_FILE"
    sleep "$SLEEP_BETWEEN"
  done
done

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "Done. Full logs: $LOG_DIR/"
echo "TSV summary:    $SUMMARY_FILE"
echo "Finished:       $(date)"
echo ""

# Coverage-per-source summary
if command -v jq >/dev/null 2>&1; then
  echo "─── Coverage rollup ────────────────────────────────────────────────"
  for SRC in $SOURCES; do
    if [ "$SRC" = "geo" ]; then LABEL="geo"; else LABEL="events-$SRC"; fi
    TOTAL=$(awk -F'\t' -v s="$SRC" 'NR>1 && $2==s {sum+=$5+0} END {print sum+0}' "$SUMMARY_FILE")
    STATES_HIT=$(awk -F'\t' -v s="$SRC" 'NR>1 && $2==s && $5+0>0 {n++} END {print n+0}' "$SUMMARY_FILE")
    printf "  %-14s total geocoded=%-8s states w/ data=%s\n" "$LABEL" "$TOTAL" "$STATES_HIT"
  done
  echo ""
  # States with least coverage (candidates for followup investigation)
  echo "─── States with 0 total events (excluding medical) ─────────────────"
  awk -F'\t' 'NR>1 && $2!="geo" {sum[$1]+=$5+0} END {for (s in sum) if (sum[s]==0) print "  "s}' "$SUMMARY_FILE"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "Verify populated state via: ${DOMAIN}/api/geo-index-info"
echo "                            ${DOMAIN}/api/events-sources"
echo "═══════════════════════════════════════════════════════════════════"
