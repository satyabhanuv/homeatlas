// ─── Core geo ────────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lon: number;
  address?: AddressInfo;
}

export interface AddressInfo {
  display?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  county?: string;
  postcode?: string;
  street?: string;
}

// ─── Places ──────────────────────────────────────────────────────────────────

export type PlaceSource = 'osm' | 'hrsa' | 'nps' | 'ridb';

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;         // e.g. 'park', 'library', 'hospital', 'fqhc'
  subcategory?: string;
  lat: number;
  lon: number;
  distanceMi?: number;      // computed from haversine
  address?: string;
  phone?: string;
  hours?: string;
  website?: string;
  source: PlaceSource;
  verified?: boolean;       // from official federal source
  tags?: Record<string, string>;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';

export interface WeatherAlert {
  id: string;
  event: string;
  severity: AlertSeverity;
  urgency: string;
  area: string;
  headline?: string;
  expires?: string;
  url: string;
}

export interface AqiReading {
  aqi: number;
  category: string;         // 'Good', 'Moderate', 'Unhealthy', etc.
  parameter: string;        // 'PM2.5', 'O3', etc.
  reportingArea: string;
  state: string;
  date: string;
  hour?: number;
}

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: string;             // ISO string
  depthKm?: number;
  url?: string;
}

export interface RisksData {
  weather: WeatherAlert[];
  aqi: AqiReading | null;
  quakes: Earthquake[];
}

// ─── Events ──────────────────────────────────────────────────────────────────

export interface NearbyEvent {
  title: string;
  venue: string;
  city: string;
  state: string;
  starts: string;           // ISO or human-readable
  ends?: string;
  category: string;
  url: string;
  source: string;           // 'ticketmaster', 'seatgeek', 'civic'
  free: boolean;
  lat?: number;
  lon?: number;
}

// ─── Aggregated data state ───────────────────────────────────────────────────

export type CategoryTab = 'nearby' | 'health' | 'alerts' | 'civic' | 'events';

export interface NearbyData {
  nearby: NearbyPlace[];
  health: NearbyPlace[];
  alerts: RisksData;
  civic: NearbyPlace[];
  events: NearbyEvent[];
  loading: boolean;
  loadingTabs: Set<CategoryTab>;
  error: string | null;
}

// ─── Location state ──────────────────────────────────────────────────────────

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'locating'
  | 'ready'
  | 'error';

export interface LocationState {
  status: LocationStatus;
  geo?: GeoPoint;
  error?: string;
}
