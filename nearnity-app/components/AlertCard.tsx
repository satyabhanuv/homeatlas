/**
 * AlertCard — displays a single weather alert, AQI reading, or earthquake.
 * Color-coded by severity to match the web app's visual system.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { WeatherAlert, AqiReading, Earthquake } from '../types';
import { Colors } from '../constants/colors';

// ─── Weather Alert ────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { border: string; bg: string; label: string }> = {
  Extreme:  { border: '#991B1B', bg: 'rgba(153,27,27,0.06)',  label: '#991B1B' },
  Severe:   { border: '#C2410C', bg: 'rgba(194,65,12,0.06)',  label: '#C2410C' },
  Moderate: { border: '#CA8A04', bg: 'rgba(202,138,4,0.06)',  label: '#92651A' },
  Minor:    { border: Colors.green, bg: Colors.greenLight,    label: Colors.green },
  Unknown:  { border: '#6b7280', bg: 'rgba(15,23,42,0.03)',   label: '#6b7280' },
};

interface WeatherAlertCardProps { alert: WeatherAlert; }

export function WeatherAlertCard({ alert }: WeatherAlertCardProps) {
  const sev = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.Unknown;
  const expires = alert.expires
    ? new Date(alert.expires).toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : null;

  return (
    <View style={[styles.alertCard, { borderLeftColor: sev.border, backgroundColor: sev.bg }]}>
      <View style={styles.alertHeader}>
        <Text style={[styles.alertEvent, { color: Colors.ink }]}>{alert.event}</Text>
        <View style={[styles.severityBadge, { backgroundColor: sev.border }]}>
          <Text style={styles.severityText}>{alert.severity}</Text>
        </View>
      </View>
      {alert.area ? <Text style={styles.alertArea} numberOfLines={2}>{alert.area}</Text> : null}
      {expires ? <Text style={styles.alertMeta}>Expires {expires}</Text> : null}
      <TouchableOpacity onPress={() => Linking.openURL(alert.url)}>
        <Text style={styles.alertLink}>Details on weather.gov →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── AQI Card ─────────────────────────────────────────────────────────────────

const AQI_COLORS: Record<string, string> = {
  Good: '#00c400',
  Moderate: '#b0a000',
  'Unhealthy for Sensitive Groups': '#FF7E00',
  Unhealthy: '#FF0000',
  'Very Unhealthy': '#8F3F97',
  Hazardous: '#7E0023',
};

interface AqiCardProps { aqi: AqiReading; }

export function AqiCard({ aqi }: AqiCardProps) {
  const color = AQI_COLORS[aqi.category] || Colors.inkSoft;
  const areaLabel = [aqi.reportingArea, aqi.state].filter(Boolean).join(', ');

  return (
    <View style={styles.aqiCard}>
      <View style={styles.aqiTop}>
        <View style={styles.aqiNumberWrap}>
          <Text style={[styles.aqiNumber, { color }]}>{aqi.aqi}</Text>
          <Text style={[styles.aqiCategory, { color }]}>{aqi.category}</Text>
        </View>
        <View style={styles.aqiMeta}>
          <Text style={styles.aqiSource}>EPA AirNow</Text>
          {areaLabel ? <Text style={styles.aqiArea}>{areaLabel}</Text> : null}
          <Text style={styles.aqiParam}>Pollutant: {aqi.parameter}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => Linking.openURL('https://www.airnow.gov/')}>
        <Text style={styles.alertLink}>Details on airnow.gov →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Earthquake Card ──────────────────────────────────────────────────────────

interface QuakeCardProps { quake: Earthquake; }

export function QuakeCard({ quake }: QuakeCardProps) {
  const m = quake.magnitude;
  const isMajor = m >= 5.0;
  const isStrong = m >= 4.0;
  const magColor = isMajor ? '#991B1B' : isStrong ? '#C2410C' : Colors.inkSoft;
  const when = new Date(quake.time).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <View style={styles.quakeCard}>
      <View style={[styles.magBadge, { backgroundColor: isMajor ? 'rgba(153,27,27,0.12)' : isStrong ? 'rgba(194,65,12,0.10)' : Colors.line2 }]}>
        <Text style={[styles.magText, { color: magColor }]}>{m.toFixed(1)}</Text>
      </View>
      <View style={styles.quakeBody}>
        <Text style={styles.quakePlace} numberOfLines={2}>{quake.place}</Text>
        <Text style={styles.quakeMeta}>
          {when}{quake.depthKm != null ? ` · ${quake.depthKm.toFixed(0)} km deep` : ''}
        </Text>
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

interface EmptyProps { icon: string; message: string; }

export function EmptyState({ icon, message }: EmptyProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  alertCard: {
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 },
  alertEvent: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  severityBadge: {
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, flexShrink: 0,
  },
  severityText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  alertArea: { fontSize: 12, color: Colors.inkSoft, marginBottom: 3 },
  alertMeta: { fontSize: 11, color: Colors.inkFaint, marginBottom: 5 },
  alertLink: { fontSize: 12, fontWeight: '600', color: Colors.blueDark },

  aqiCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.line,
    padding: 14, marginHorizontal: 16, marginBottom: 8,
  },
  aqiTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  aqiNumberWrap: { alignItems: 'center' },
  aqiNumber: { fontSize: 42, fontWeight: '800', lineHeight: 46 },
  aqiCategory: { fontSize: 12, fontWeight: '700', marginTop: -2 },
  aqiMeta: { flex: 1 },
  aqiSource: { fontSize: 12, fontWeight: '700', color: Colors.ink, marginBottom: 2 },
  aqiArea: { fontSize: 12, color: Colors.inkSoft },
  aqiParam: { fontSize: 11, color: Colors.inkFaint },

  quakeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.line2,
  },
  magBadge: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  magText: { fontSize: 15, fontWeight: '800' },
  quakeBody: { flex: 1 },
  quakePlace: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  quakeMeta: { fontSize: 11, color: Colors.inkFaint, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, color: Colors.inkSoft, textAlign: 'center', lineHeight: 20 },
});
