/**
 * useLocation — wraps expo-location with a clean state machine.
 *
 * States:
 *   idle       → initial, nothing requested yet
 *   requesting → asking OS for permission
 *   locating   → permission granted, getting GPS fix
 *   ready      → geo available
 *   error      → permission denied or GPS failed
 *
 * The hook is intentionally manual (call requestLocation() to start).
 * This gives the Home screen control over when to trigger the flow.
 */

import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { GeoPoint, LocationState } from '../types';
import { reverseGeocode } from '../services/geocoding';

export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  const requestLocation = useCallback(async () => {
    setState({ status: 'requesting' });

    // ── Step 1: Permission ─────────────────────────────────────────────────
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setState({
        status: 'error',
        error:
          'Location permission denied. Go to Settings → Nearnity → Location and set it to "While Using the App".',
      });
      return;
    }

    // ── Step 2: GPS fix ────────────────────────────────────────────────────
    setState({ status: 'locating' });

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        // Balanced is a good trade-off: ~100m accuracy, fast, low battery
        // Use Location.Accuracy.High for sub-10m if ever needed
      });

      const { latitude: lat, longitude: lon } = position.coords;

      // ── Step 3: Reverse geocode ──────────────────────────────────────────
      // Don't block on this — if Nominatim fails, we still have lat/lon
      const geo: GeoPoint = await reverseGeocode(lat, lon);

      setState({ status: 'ready', geo });
    } catch (e: any) {
      setState({
        status: 'error',
        error: e?.message || 'Could not determine your location. Make sure GPS is enabled.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, requestLocation, reset };
}
