import { GeoPoint, AddressInfo } from '../types';
import { Config } from '../constants/config';

/**
 * Reverse geocode lat/lon → structured address using Nominatim (OSM).
 * Called immediately after GPS fix. Falls back gracefully — worst case
 * returns the raw coords as the display string.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoPoint> {
  try {
    const url =
      `${Config.NOMINATIM_REVERSE}` +
      `?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        // Nominatim requires a meaningful User-Agent to identify the app
        'User-Agent': 'Nearnity/1.0 (https://nearnity.com)',
      },
      signal: AbortSignal.timeout(Config.API_TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    const a = data.address || {};

    const city =
      a.city || a.town || a.village || a.municipality || a.suburb || '';
    const stateCode = stateNameToCode(a.state || '');

    const address: AddressInfo = {
      display: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city,
      state: a.state || '',
      stateCode,
      county: a.county || '',
      postcode: a.postcode || '',
      street: [a.house_number, a.road].filter(Boolean).join(' '),
    };

    return { lat, lon, address };
  } catch {
    // Graceful fallback — never crash the app on a geo failure
    return {
      lat,
      lon,
      address: {
        display: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      },
    };
  }
}

// Nominatim returns full state names. Convert to 2-letter code for display.
const STATE_MAP: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
  Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
};

function stateNameToCode(name: string): string {
  return STATE_MAP[name] || name.slice(0, 2).toUpperCase();
}
