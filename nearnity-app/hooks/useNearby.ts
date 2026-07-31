/**
 * useNearby — fires all data fetches in parallel and manages loading state.
 *
 * All 5 tabs load concurrently. Each tab has its own loading indicator
 * so the user sees results appear progressively — fast ones (OSM, NWS)
 * show up before slower ones (events with Ticketmaster).
 *
 * Promise.allSettled ensures one failing API never blocks the others.
 */

import { useState, useCallback } from 'react';
import { GeoPoint, NearbyData, CategoryTab } from '../types';
import { fetchNearbyGeneral, fetchNearbyHealth, fetchNearbyCivic } from '../services/overpass';
import { fetchHrsaClinics } from '../services/hrsa';
import { fetchAllRisks } from '../services/risks';
import { fetchNearbyEvents } from '../services/events';
import { Config } from '../constants/config';

const EMPTY_STATE: NearbyData = {
  nearby: [],
  health: [],
  alerts: { weather: [], aqi: null, quakes: [] },
  civic: [],
  events: [],
  loading: false,
  loadingTabs: new Set(),
  error: null,
};

export function useNearby() {
  const [data, setData] = useState<NearbyData>(EMPTY_STATE);

  const loadAll = useCallback(async (geo: GeoPoint) => {
    const { lat, lon } = geo;
    const zip = geo.address?.postcode;
    const radius = Config.DEFAULT_RADIUS_MI;

    // Mark all tabs as loading
    setData({
      ...EMPTY_STATE,
      loading: true,
      loadingTabs: new Set<CategoryTab>(['nearby', 'health', 'alerts', 'civic', 'events']),
    });

    // ── Fire all fetches in parallel ──────────────────────────────────────
    // Each uses Promise.allSettled so individual failures don't cascade.

    const [
      nearbyResult,
      osmHealthResult,
      hrsaResult,
      civicResult,
      risksResult,
      eventsResult,
    ] = await Promise.allSettled([
      fetchNearbyGeneral(lat, lon, radius),
      fetchNearbyHealth(lat, lon, radius),
      fetchHrsaClinics(lat, lon, radius),
      fetchNearbyCivic(lat, lon, radius),
      fetchAllRisks(lat, lon, zip),
      fetchNearbyEvents(lat, lon),
    ]);

    // ── Merge health: HRSA (verified, priority) + OSM (fills gaps) ────────
    const hrsaItems = hrsaResult.status === 'fulfilled' ? hrsaResult.value : [];
    const osmHealthItems = osmHealthResult.status === 'fulfilled' ? osmHealthResult.value : [];
    const hrsaNames = new Set(hrsaItems.map(h => h.name.toLowerCase()));
    const mergedHealth = [
      ...hrsaItems,
      ...osmHealthItems.filter(h => !hrsaNames.has(h.name.toLowerCase())),
    ];

    setData({
      nearby:  nearbyResult.status  === 'fulfilled' ? nearbyResult.value  : [],
      health:  mergedHealth,
      alerts:  risksResult.status   === 'fulfilled' ? risksResult.value   : EMPTY_STATE.alerts,
      civic:   civicResult.status   === 'fulfilled' ? civicResult.value   : [],
      events:  eventsResult.status  === 'fulfilled' ? eventsResult.value  : [],
      loading: false,
      loadingTabs: new Set(),
      error: null,
    });
  }, []);

  const reset = useCallback(() => {
    setData(EMPTY_STATE);
  }, []);

  return { data, loadAll, reset };
}
