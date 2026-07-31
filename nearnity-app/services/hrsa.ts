/**
 * HRSA Find a Health Center — Federally Qualified Health Centers (FQHCs).
 *
 * Free federal API, no auth key required.
 * In the web app this sometimes gets blocked by CORS in certain browsers.
 * In native apps there's no CORS, so this is fully reliable.
 *
 * FQHCs offer sliding-scale primary care, dental, and mental health regardless
 * of insurance status. This is one of Nearnity's highest-value data points.
 */

import { NearbyPlace } from '../types';
import { Config } from '../constants/config';
import { haversineMiles } from './overpass';

export async function fetchHrsaClinics(
  lat: number,
  lon: number,
  radiusMi = Config.DEFAULT_RADIUS_MI
): Promise<NearbyPlace[]> {
  try {
    const url =
      `${Config.HRSA_API}/?latitude=${lat}&longitude=${lon}&radius=${radiusMi}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(Config.API_TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`HRSA ${res.status}`);

    const raw = await res.json();

    // HRSA returns one of several shapes depending on version:
    // - Array directly
    // - { features: [...] }   (GeoJSON)
    // - { results: [...] }
    // - { centers: [...] }
    const list: any[] = Array.isArray(raw)
      ? raw
      : raw.features || raw.results || raw.centers || [];

    return list
      .slice(0, 20)
      .map(c => normalizeCenter(c, lat, lon))
      .filter((c): c is NearbyPlace => c !== null)
      .sort((a, b) => (a.distanceMi ?? 99) - (b.distanceMi ?? 99));
  } catch {
    return [];
  }
}

function normalizeCenter(c: any, userLat: number, userLon: number): NearbyPlace | null {
  // GeoJSON feature shape
  const props = c.properties ?? c;
  const coords = c.geometry?.coordinates;

  const cLat = coords ? parseFloat(coords[1]) : parseFloat(props.latitude ?? props.lat ?? '0');
  const cLon = coords ? parseFloat(coords[0]) : parseFloat(props.longitude ?? props.lon ?? '0');

  if (!cLat || !cLon || isNaN(cLat) || isNaN(cLon)) return null;

  const name =
    props.site_name ??
    props.name ??
    props.organization_name ??
    'Health Center';

  const address = [
    props.street_address ?? props.address,
    props.city,
    props.state,
    props.zipcode ?? props.zip,
  ].filter(Boolean).join(', ');

  return {
    id: `hrsa-${props.id ?? props.bphcid ?? Math.random()}`,
    name,
    category: 'fqhc',
    subcategory: 'Federally Qualified Health Center',
    lat: cLat,
    lon: cLon,
    distanceMi: haversineMiles(userLat, userLon, cLat, cLon),
    phone: props.phone ?? props.main_phone ?? props.telephone,
    address,
    website: props.web_address ?? props.website,
    source: 'hrsa',
    verified: true,
    tags: {},
  };
}
