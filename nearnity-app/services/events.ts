/**
 * Events — calls the Nearnity Cloudflare Worker at /api/events.
 * The Worker aggregates Ticketmaster + SeatGeek + city iCal feeds.
 * API keys live in the Worker as secrets — the app never touches them.
 */

import { NearbyEvent } from '../types';
import { Config } from '../constants/config';

export async function fetchNearbyEvents(
  lat: number,
  lon: number,
  radiusMi = 25
): Promise<NearbyEvent[]> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius: String(radiusMi),
    });

    const res = await fetch(
      `${Config.NEARNITY_API}/events?${params}`,
      { signal: AbortSignal.timeout(Config.API_TIMEOUT_MS + 2000) } // events can be slower
    );

    if (!res.ok) throw new Error(`Events API ${res.status}`);
    const data = await res.json();

    const events: any[] = data.events || [];
    return events.slice(0, 40).map(e => ({
      title: e.title || 'Event',
      venue: e.venue || '',
      city: e.city || '',
      state: e.state || '',
      starts: e.starts || '',
      ends: e.ends,
      category: e.category || 'general',
      url: e.url || '',
      source: e.source || 'unknown',
      free: Boolean(e.free),
      lat: e.lat ? parseFloat(e.lat) : undefined,
      lon: e.lon ? parseFloat(e.lon) : undefined,
    }));
  } catch {
    return [];
  }
}
