/**
 * OpenStreetMap Overpass API queries.
 *
 * Native apps have no CORS, so we call Overpass mirrors directly
 * (same as the web app). We try mirrors in sequence and return the
 * first successful response.
 *
 * Three separate query functions cover the three tabs that need OSM:
 *   - fetchNearbyGeneral  → "Nearby" tab (parks, libraries, groceries, etc.)
 *   - fetchNearbyHealth   → "Health" tab (hospitals, clinics, pharmacies)
 *   - fetchNearbyCivic    → "Civic" tab (gov buildings, fire/police, post)
 */

import { NearbyPlace } from '../types';
import { Config } from '../constants/config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function milesToMeters(miles: number): number {
  return Math.round(miles * 1609.34);
}

export function haversineMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

async function runOverpassQuery(qlBody: string): Promise<any[]> {
  for (const mirror of Config.OVERPASS_MIRRORS) {
    try {
      const res = await fetch(
        `${mirror}?data=${encodeURIComponent(qlBody)}`,
        { signal: AbortSignal.timeout(Config.OVERPASS_TIMEOUT_MS) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (typeof data.remark === 'string' && data.remark.includes('error')) continue;
      return data.elements || [];
    } catch {
      continue;
    }
  }
  return [];
}

/** Convert an OSM element (node or way-with-center) to a NearbyPlace. */
function osmToPlace(
  e: any,
  lat: number,
  lon: number,
  category: string,
  source: 'osm' = 'osm'
): NearbyPlace | null {
  const eLat = e.lat ?? e.center?.lat;
  const eLon = e.lon ?? e.center?.lon;
  if (!eLat || !eLon || !e.tags?.name) return null;

  return {
    id: `osm-${e.id}`,
    name: e.tags.name,
    category,
    lat: eLat,
    lon: eLon,
    distanceMi: haversineMiles(lat, lon, eLat, eLon),
    phone: e.tags?.phone ?? e.tags?.['contact:phone'],
    hours: e.tags?.opening_hours,
    website: e.tags?.website ?? e.tags?.['contact:website'],
    address: [
      e.tags?.['addr:housenumber'],
      e.tags?.['addr:street'],
      e.tags?.['addr:city'],
    ].filter(Boolean).join(' '),
    source,
    tags: e.tags,
  };
}

function sortByDistance(places: NearbyPlace[]): NearbyPlace[] {
  return places.sort((a, b) => (a.distanceMi ?? 99) - (b.distanceMi ?? 99));
}

// ─── Public fetch functions ───────────────────────────────────────────────────

/**
 * "Nearby" tab — general POIs: parks, libraries, groceries, pharmacies, etc.
 */
export async function fetchNearbyGeneral(
  lat: number,
  lon: number,
  radiusMi = Config.DEFAULT_RADIUS_MI
): Promise<NearbyPlace[]> {
  const r = milesToMeters(radiusMi);
  const query = `
[out:json][timeout:15];
(
  node["amenity"~"^(library|pharmacy|supermarket|convenience|bank|atm|post_office|community_centre|social_facility|recycling)$"](around:${r},${lat},${lon});
  node["leisure"~"^(park|garden|nature_reserve|pitch|sports_centre|playground|dog_park)$"](around:${r},${lat},${lon});
  node["amenity"="place_of_worship"](around:${r},${lat},${lon});
  way["leisure"~"^(park|garden|nature_reserve)$"](around:${r},${lat},${lon});
);
out body center 80;
`;

  const elements = await runOverpassQuery(query);
  const places: NearbyPlace[] = [];

  for (const e of elements) {
    const cat = classifyGeneral(e.tags);
    const place = osmToPlace(e, lat, lon, cat);
    if (place) places.push(place);
  }

  // Deduplicate by name+category (ways and nodes can overlap)
  const seen = new Set<string>();
  const deduped = places.filter(p => {
    const key = `${p.name.toLowerCase()}|${p.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return sortByDistance(deduped);
}

/**
 * "Health" tab — OSM hospitals, clinics, pharmacies.
 * Merged upstream with HRSA results (HRSA takes priority, OSM fills gaps).
 */
export async function fetchNearbyHealth(
  lat: number,
  lon: number,
  radiusMi = Config.DEFAULT_RADIUS_MI
): Promise<NearbyPlace[]> {
  const r = milesToMeters(radiusMi);
  const query = `
[out:json][timeout:15];
(
  node["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy|veterinary)$"](around:${r},${lat},${lon});
  way["amenity"~"^(hospital|clinic)$"](around:${r},${lat},${lon});
);
out body center 40;
`;

  const elements = await runOverpassQuery(query);
  const places: NearbyPlace[] = [];

  for (const e of elements) {
    const place = osmToPlace(e, lat, lon, e.tags?.amenity || 'health');
    if (place) places.push(place);
  }

  return sortByDistance(places);
}

/**
 * "Civic" tab — government buildings, fire, police, libraries, DMV, courts.
 */
export async function fetchNearbyCivic(
  lat: number,
  lon: number,
  radiusMi = Config.DEFAULT_RADIUS_MI
): Promise<NearbyPlace[]> {
  const r = milesToMeters(radiusMi);
  const query = `
[out:json][timeout:15];
(
  node["amenity"~"^(library|post_office|courthouse|fire_station|police|townhall|community_centre|social_facility|ranger_station)$"](around:${r},${lat},${lon});
  node["government"](around:${r},${lat},${lon});
  node["office"~"^(government|diplomatic|administrative)$"](around:${r},${lat},${lon});
  way["amenity"~"^(townhall|courthouse|fire_station|police)$"](around:${r},${lat},${lon});
);
out body center 40;
`;

  const elements = await runOverpassQuery(query);
  const places: NearbyPlace[] = [];

  for (const e of elements) {
    const cat = classifyCivic(e.tags);
    const place = osmToPlace(e, lat, lon, cat);
    if (place) places.push(place);
  }

  return sortByDistance(places);
}

// ─── Category classifiers ────────────────────────────────────────────────────

function classifyGeneral(tags: Record<string, string>): string {
  const a = tags?.amenity || '';
  const l = tags?.leisure || '';

  if (['park', 'garden', 'nature_reserve', 'playground', 'dog_park'].includes(l)) return 'park';
  if (l === 'pitch' || l === 'sports_centre') return 'sports';
  if (a === 'library') return 'library';
  if (a === 'pharmacy') return 'pharmacy';
  if (a === 'supermarket' || a === 'convenience') return 'grocery';
  if (a === 'post_office') return 'post_office';
  if (a === 'bank' || a === 'atm') return 'bank';
  if (a === 'community_centre') return 'community';
  if (a === 'social_facility') return 'social_services';
  if (a === 'place_of_worship') return 'worship';
  if (a === 'recycling') return 'recycling';
  return a || l || 'place';
}

function classifyCivic(tags: Record<string, string>): string {
  const a = tags?.amenity || '';
  const o = tags?.office || '';
  const g = tags?.government || '';

  if (a === 'library') return 'library';
  if (a === 'post_office') return 'post_office';
  if (a === 'courthouse') return 'courthouse';
  if (a === 'fire_station') return 'fire_station';
  if (a === 'police') return 'police';
  if (a === 'townhall') return 'city_hall';
  if (a === 'community_centre') return 'community';
  if (a === 'social_facility') return 'social_services';
  if (a === 'ranger_station') return 'ranger_station';
  if (o === 'government' || g) return 'government';
  return 'civic';
}
