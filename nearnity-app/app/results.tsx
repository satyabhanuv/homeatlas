/**
 * Results Screen — the main content view after location is resolved.
 *
 * Layout:
 *   [Emergency bar]
 *   [Location chip + Back button]
 *   [Map — 38% height, shows current location + nearby pins]
 *   [Category tabs]
 *   [Scrollable results list for active tab]
 *
 * All 5 data sources load in parallel (see useNearby).
 * Each tab shows its own loading/empty state independently.
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Linking, Platform, Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '../constants/colors';
import { EmergencyBar } from '../components/EmergencyBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { PlaceCard } from '../components/PlaceCard';
import { EventCard } from '../components/EventCard';
import {
  WeatherAlertCard, AqiCard, QuakeCard, EmptyState,
} from '../components/AlertCard';
import { useNearby } from '../hooks/useNearby';
import { GeoPoint, CategoryTab, NearbyPlace, NearbyEvent } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.32);

// ─── Params from router ───────────────────────────────────────────────────────

interface RouteParams {
  lat: string;
  lon: string;
  city?: string;
  stateCode?: string;
  postcode?: string;
  display?: string;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { id: 'nearby' as CategoryTab, label: 'Nearby',  icon: '🌳' },
  { id: 'health' as CategoryTab, label: 'Health',  icon: '🏥' },
  { id: 'alerts' as CategoryTab, label: 'Alerts',  icon: '⚠️' },
  { id: 'civic'  as CategoryTab, label: 'Civic',   icon: '🏛️' },
  { id: 'events' as CategoryTab, label: 'Events',  icon: '🎵' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const [activeTab, setActiveTab] = useState<CategoryTab>('nearby');
  const mapRef = useRef<MapView>(null);

  const geo: GeoPoint = {
    lat: parseFloat(params.lat ?? '0'),
    lon: parseFloat(params.lon ?? '0'),
    address: {
      city: params.city,
      stateCode: params.stateCode,
      postcode: params.postcode,
      display: params.display,
    },
  };

  const { data, loadAll } = useNearby();

  // Kick off all parallel data fetches on mount
  useEffect(() => {
    if (geo.lat && geo.lon) {
      loadAll(geo);
    }
  }, []);

  // Build tab array with live counts
  const tabs = useMemo(() => TAB_CONFIG.map(t => ({
    ...t,
    count:
      t.id === 'nearby' ? data.nearby.length :
      t.id === 'health' ? data.health.length :
      t.id === 'alerts' ? (data.alerts.weather.length + (data.alerts.aqi ? 1 : 0) + data.alerts.quakes.length) :
      t.id === 'civic'  ? data.civic.length :
      t.id === 'events' ? data.events.length : 0,
    loading: data.loading,
  })), [data]);

  // Map markers — show pins for active tab results that have coordinates
  const mapMarkers = useMemo(() => {
    const places: NearbyPlace[] = activeTab === 'nearby' ? data.nearby :
                                  activeTab === 'health'  ? data.health :
                                  activeTab === 'civic'   ? data.civic  : [];
    return places.slice(0, 30); // limit pins for performance
  }, [activeTab, data]);

  // ── Location label ──────────────────────────────────────────────────────────
  const locationLabel = useMemo(() => {
    const city = params.city;
    const st = params.stateCode;
    if (city && st) return `${city}, ${st}`;
    if (city) return city;
    if (params.display) return params.display.split(',')[0];
    return `${geo.lat.toFixed(3)}, ${geo.lon.toFixed(3)}`;
  }, [params]);

  // ── Render list items ───────────────────────────────────────────────────────

  const renderTabContent = () => {
    if (data.loading) {
      return (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading nearby data…</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'nearby':
        return data.nearby.length > 0
          ? <FlatList
              data={data.nearby}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <PlaceCard place={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          : <EmptyState icon="🌳" message="No results found nearby. Try searching from a different location." />;

      case 'health':
        return data.health.length > 0
          ? <FlatList
              data={data.health}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <PlaceCard place={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🏥 Free & Low-Cost Clinics</Text>
                  <Text style={styles.sectionSub}>FQHCs from HRSA + hospitals from OpenStreetMap</Text>
                </View>
              }
            />
          : <EmptyState icon="🏥" message="No clinics found within 5 miles. Try the HRSA locator at findahealthcenter.hrsa.gov" />;

      case 'alerts': {
        const { weather, aqi, quakes } = data.alerts;
        const hasData = weather.length > 0 || aqi !== null || quakes.length > 0;
        if (!hasData) {
          return <EmptyState icon="✅" message={`No active weather alerts, and no M2.5+ earthquakes within 200 km in the last 30 days.`} />;
        }
        return (
          <FlatList
            data={[]}  // header-only list
            keyExtractor={() => ''}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                {/* Weather */}
                {weather.length > 0 && (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>🌪️ Active Weather Alerts</Text>
                      <Text style={styles.sectionSub}>National Weather Service</Text>
                    </View>
                    {weather.map(a => <WeatherAlertCard key={a.id} alert={a} />)}
                  </View>
                )}

                {/* AQI */}
                {aqi && (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>💨 Air Quality</Text>
                      <Text style={styles.sectionSub}>EPA AirNow</Text>
                    </View>
                    <AqiCard aqi={aqi} />
                  </View>
                )}

                {/* Quakes */}
                {quakes.length > 0 && (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>🌍 Recent Earthquakes</Text>
                      <Text style={styles.sectionSub}>M2.5+ within 200 km · last 30 days · USGS</Text>
                    </View>
                    <View style={styles.quakeList}>
                      {quakes.map(q => <QuakeCard key={q.id} quake={q} />)}
                    </View>
                  </View>
                )}
              </>
            }
          />
        );
      }

      case 'civic':
        return data.civic.length > 0
          ? <FlatList
              data={data.civic}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <PlaceCard place={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🏛️ Government & Public Services</Text>
                  <Text style={styles.sectionSub}>Libraries, post offices, fire stations, and more</Text>
                </View>
              }
            />
          : <EmptyState icon="🏛️" message="No civic services found nearby in OpenStreetMap." />;

      case 'events':
        return data.events.length > 0
          ? <FlatList
              data={data.events}
              keyExtractor={(item, i) => `evt-${i}`}
              renderItem={({ item }) => <EventCard event={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🎵 Upcoming Events</Text>
                  <Text style={styles.sectionSub}>Ticketmaster · SeatGeek · City calendars</Text>
                </View>
              }
            />
          : (
            <EmptyState
              icon="🎵"
              message="No events found nearby right now. Try Ticketmaster or Eventbrite for your city."
            />
          );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmergencyBar />

      {/* Location header */}
      <View style={styles.locationBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Search new location"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.locationChip}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
        </View>
        {data.loading && (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />
        )}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={[styles.map, { height: MAP_HEIGHT }]}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: geo.lat,
          longitude: geo.lon,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* You-are-here pin */}
        <Marker
          coordinate={{ latitude: geo.lat, longitude: geo.lon }}
          title="You are here"
          pinColor={Colors.primary}
          zIndex={100}
        />
        {/* Nearby result pins */}
        {mapMarkers.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lon }}
            title={place.name}
            description={place.distanceMi !== undefined ? `${place.distanceMi.toFixed(1)} mi` : undefined}
          />
        ))}
      </MapView>

      {/* Tabs */}
      <CategoryTabs active={activeTab} tabs={tabs} onSelect={setActiveTab} />

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },

  locationBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
    gap: 8,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.line2,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: Colors.ink, lineHeight: 22 },
  locationChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bg,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.line,
  },
  locationPin: { fontSize: 13 },
  locationText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.ink },

  map: { width: '100%' },

  content: { flex: 1, backgroundColor: Colors.bg },

  loadingCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60,
  },
  loadingText: {
    marginTop: 12, fontSize: 14, color: Colors.inkSoft,
  },

  listContent: { paddingTop: 8, paddingBottom: 32 },

  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 11.5, color: Colors.inkFaint, marginTop: 2,
  },

  quakeList: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.line,
    marginHorizontal: 16, marginBottom: 8, overflow: 'hidden',
  },
});
