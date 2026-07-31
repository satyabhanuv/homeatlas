/**
 * Home Screen — the "front door" of the Nearnity app.
 *
 * Single action: tap Near Me → request location → navigate to results.
 * No sign-up, no onboarding, no noise. One tap gets you everything.
 */

import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { EmergencyBar } from '../components/EmergencyBar';
import { useLocation } from '../hooks/useLocation';

export default function HomeScreen() {
  const router = useRouter();
  const { state, requestLocation } = useLocation();

  // Navigate to results once location is ready
  useEffect(() => {
    if (state.status === 'ready' && state.geo) {
      const { lat, lon, address } = state.geo;
      router.push({
        pathname: '/results',
        params: {
          lat: String(lat),
          lon: String(lon),
          city: address?.city ?? '',
          stateCode: address?.stateCode ?? '',
          postcode: address?.postcode ?? '',
          display: address?.display ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        },
      });
    }
  }, [state]);

  const isLoading = state.status === 'requesting' || state.status === 'locating';

  const buttonLabel =
    state.status === 'requesting' ? 'Requesting permission…' :
    state.status === 'locating'   ? 'Getting your location…' :
    '📍  Near Me';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <EmergencyBar />

      <View style={styles.content}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoPinOuter}>
            <Text style={styles.logoPinEmoji}>📍</Text>
          </View>
          <View style={styles.logoCheckBadge}>
            <Text style={styles.logoCheckText}>✓</Text>
          </View>
        </View>

        {/* Brand */}
        <Text style={styles.appName}>Nearnity</Text>
        <Text style={styles.tagline}>Everything about here.</Text>
        <Text style={styles.subTagline}>
          Public data · Right where you are{'\n'}
          No accounts · No ads · No paywalls
        </Text>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[styles.nearMeBtn, isLoading && styles.nearMeBtnLoading]}
          onPress={requestLocation}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            : null
          }
          <Text style={styles.nearMeBtnText}>{buttonLabel}</Text>
        </TouchableOpacity>

        {/* Error state */}
        {state.status === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{state.error}</Text>
            {(state.error ?? '').includes('Settings') && (
              <TouchableOpacity
                onPress={() => Linking.openSettings()}
                style={styles.errorAction}
              >
                <Text style={styles.errorActionText}>Open Settings →</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={requestLocation}
              style={[styles.errorAction, { marginTop: 4 }]}
            >
              <Text style={styles.errorActionText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* What's inside */}
        <View style={styles.categoryRow}>
          {[
            { icon: '🌳', label: 'Nearby' },
            { icon: '🏥', label: 'Health' },
            { icon: '⚠️', label: 'Alerts' },
            { icon: '🏛️', label: 'Civic' },
            { icon: '🎵', label: 'Events' },
          ].map(({ icon, label }) => (
            <View key={label} style={styles.categoryChip}>
              <Text style={styles.categoryIcon}>{icon}</Text>
              <Text style={styles.categoryLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Trust strip */}
        <View style={styles.trustRow}>
          {['HRSA', 'NWS', 'USGS', 'OSM', 'NPS', 'EPA'].map(src => (
            <View key={src} style={styles.trustChip}>
              <Text style={styles.trustText}>{src}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        No sign-up · Free forever · No location data stored
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // Logo
  logoWrap: { position: 'relative', marginBottom: 20 },
  logoPinOuter: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  logoPinEmoji: { fontSize: 38 },
  logoCheckBadge: {
    position: 'absolute', bottom: -5, right: -5,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.bg,
  },
  logoCheckText: { color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 15 },

  // Brand text
  appName: {
    fontSize: 38, fontWeight: '800', color: Colors.ink,
    letterSpacing: -1.2, marginBottom: 4,
  },
  tagline: {
    fontSize: 20, fontWeight: '700', color: Colors.ink,
    letterSpacing: -0.5, marginBottom: 10,
  },
  subTagline: {
    fontSize: 14, color: Colors.inkSoft, textAlign: 'center',
    lineHeight: 22, marginBottom: 32,
  },

  // CTA
  nearMeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 16, width: '100%', marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32, shadowRadius: 14, elevation: 7,
  },
  nearMeBtnLoading: { backgroundColor: Colors.blueMid, shadowOpacity: 0.15 },
  nearMeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },

  // Error
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 10, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(179,38,30,0.2)',
    width: '100%',
  },
  errorText: { color: Colors.error, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  errorAction: { marginTop: 8, alignItems: 'center' },
  errorActionText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },

  // Category chips row
  categoryRow: {
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    justifyContent: 'center', marginBottom: 16,
  },
  categoryChip: {
    alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.surface,
    minWidth: 56,
  },
  categoryIcon: { fontSize: 18 },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: Colors.inkSoft },

  // Trust strip
  trustRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    justifyContent: 'center',
  },
  trustChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  trustText: { fontSize: 10, fontWeight: '700', color: Colors.inkFaint },

  // Footer
  footer: {
    textAlign: 'center', color: Colors.inkFaint, fontSize: 11.5,
    paddingBottom: 16, paddingHorizontal: 24,
  },
});
