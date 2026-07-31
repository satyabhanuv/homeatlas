/**
 * Safety & Risks data fetching.
 *
 * KEY IMPROVEMENT over the web app:
 * - NWS alerts → called DIRECTLY from the device (api.weather.gov is open)
 * - USGS quakes → called DIRECTLY from the device (no proxy needed)
 * - AirNow → still proxied through nearnity.com/api/aqi (requires API key)
 *
 * This eliminates proxy hops for 2 of 3 feeds, making them faster and
 * reducing Cloudflare Worker usage.
 */

import { WeatherAlert, AqiReading, Earthquake, RisksData, AlertSeverity } from '../types';
import { Config } from '../constants/config';

// ─── NWS Weather Alerts ───────────────────────────────────────────────────────

export async function fetchNwsAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  try {
    // api.weather.gov supports CORS and is free — call directly
    const res = await fetch(
      `${Config.NWS_API}/alerts/active?point=${lat},${lon}&status=actual&limit=10`,
      {
        headers: {
          'User-Agent': 'Nearnity/1.0 (https://nearnity.com)',
          Accept: 'application/geo+json',
        },
        signal: AbortSignal.timeout(Config.API_TIMEOUT_MS),
      }
    );

    if (!res.ok) throw new Error(`NWS ${res.status}`);
    const data = await res.json();

    return (data.features || []).map((f: any): WeatherAlert => {
      const p = f.properties || {};
      const sev = (p.severity || '') as string;
      const severity: AlertSeverity =
        sev === 'Extreme'  ? 'Extreme'  :
        sev === 'Severe'   ? 'Severe'   :
        sev === 'Moderate' ? 'Moderate' :
        sev === 'Minor'    ? 'Minor'    : 'Unknown';

      return {
        id: f.id || p.id || String(Math.random()),
        event: p.event || 'Weather Alert',
        severity,
        urgency: p.urgency || '',
        area: p.areaDesc || '',
        headline: p.headline || '',
        expires: p.expires,
        url: p.web || 'https://www.weather.gov',
      };
    });
  } catch {
    return [];
  }
}

// ─── USGS Earthquakes ─────────────────────────────────────────────────────────

export async function fetchUsgsQuakes(lat: number, lon: number): Promise<Earthquake[]> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // earthquake.usgs.gov is open — call directly
    const params = new URLSearchParams({
      format: 'geojson',
      latitude: String(lat),
      longitude: String(lon),
      maxradiuskm: '200',
      minmagnitude: '2.5',
      starttime: thirtyDaysAgo,
      orderby: 'magnitude',
      limit: '10',
    });

    const res = await fetch(
      `${Config.USGS_API}?${params}`,
      { signal: AbortSignal.timeout(Config.API_TIMEOUT_MS) }
    );

    if (!res.ok) throw new Error(`USGS ${res.status}`);
    const data = await res.json();

    return (data.features || []).map((f: any): Earthquake => ({
      id: f.id || String(Math.random()),
      magnitude: f.properties?.mag ?? 0,
      place: f.properties?.place || 'Unknown location',
      time: new Date(f.properties?.time || 0).toISOString(),
      depthKm: f.geometry?.coordinates?.[2],
      url: f.properties?.url,
    }));
  } catch {
    return [];
  }
}

// ─── AirNow AQI (via Worker — needs API key) ─────────────────────────────────

export async function fetchAqi(
  lat: number,
  lon: number,
  zip?: string
): Promise<AqiReading | null> {
  try {
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    if (zip) params.set('zip', zip);

    const res = await fetch(
      `${Config.NEARNITY_API}/aqi?${params}`,
      { signal: AbortSignal.timeout(Config.API_TIMEOUT_MS) }
    );

    if (!res.ok) return null;
    const data = await res.json();

    // Worker returns { status: 'no_key' } if AirNow key not configured
    if (data.status === 'no_key' || !data.primary?.aqi) return null;

    const p = data.primary;
    return {
      aqi: p.aqi,
      category: p.category || '',
      parameter: p.parameter || 'PM2.5',
      reportingArea: p.reporting_area || '',
      state: p.state || '',
      date: p.date || '',
      hour: p.hour,
    };
  } catch {
    return null;
  }
}

// ─── Aggregate all three in parallel ─────────────────────────────────────────

export async function fetchAllRisks(
  lat: number,
  lon: number,
  zip?: string
): Promise<RisksData> {
  const [weatherResult, aqiResult, quakesResult] = await Promise.allSettled([
    fetchNwsAlerts(lat, lon),
    fetchAqi(lat, lon, zip),
    fetchUsgsQuakes(lat, lon),
  ]);

  return {
    weather: weatherResult.status === 'fulfilled' ? weatherResult.value : [],
    aqi:     aqiResult.status    === 'fulfilled' ? aqiResult.value    : null,
    quakes:  quakesResult.status === 'fulfilled' ? quakesResult.value : [],
  };
}
