// Central config — all API URLs and defaults
export const Config = {
  // Nearnity Cloudflare Worker API (for AirNow, NPS, RIDB, Events — need API keys)
  NEARNITY_API: 'https://nearnity.com/api',

  // Direct public APIs — no key needed, no proxy needed in native apps (no CORS)
  NWS_API: 'https://api.weather.gov',
  USGS_API: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
  HRSA_API: 'https://findahealthcenter.hrsa.gov/api/centers',
  NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',

  // Overpass mirrors — tried in order, first to respond wins
  OVERPASS_MIRRORS: [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.osm.ch/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ],

  // Defaults
  DEFAULT_RADIUS_MI: 5,
  OVERPASS_TIMEOUT_MS: 12000,
  API_TIMEOUT_MS: 8000,
};
