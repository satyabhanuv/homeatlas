/**
 * PlaceCard — displays a single NearbyPlace result.
 * Used across Nearby, Health, and Civic tabs.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { NearbyPlace } from '../types';
import { Colors } from '../constants/colors';

const CATEGORY_ICONS: Record<string, string> = {
  park: '🌳', library: '📚', pharmacy: '💊', grocery: '🛒',
  hospital: '🏥', clinic: '🏥', doctors: '👨‍⚕️', dentist: '🦷',
  fqhc: '🏥', pharmacy_health: '💊',
  post_office: '📬', fire_station: '🚒', police: '👮',
  city_hall: '🏛️', courthouse: '⚖️', government: '🏛️',
  library_civic: '📚', community: '🤝', social_services: '🤲',
  ranger_station: '🌲', civic: '🏛️',
  bank: '🏦', atm: '🏧', worship: '⛪', sports: '⚽',
  recycling: '♻️', default: '📍',
};

const VERIFIED_SOURCES = new Set(['hrsa', 'nps', 'ridb']);

interface Props {
  place: NearbyPlace;
}

export function PlaceCard({ place }: Props) {
  const icon = CATEGORY_ICONS[place.category] ?? CATEGORY_ICONS.default;
  const isVerified = place.verified || VERIFIED_SOURCES.has(place.source);
  const distLabel = place.distanceMi !== undefined
    ? place.distanceMi < 0.1
      ? '< 0.1 mi'
      : `${place.distanceMi.toFixed(1)} mi`
    : null;

  const handleCall = () => {
    if (place.phone) Linking.openURL(`tel:${place.phone.replace(/\D/g, '')}`);
  };

  const handleWeb = () => {
    if (place.website) Linking.openURL(place.website);
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{place.name}</Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {distLabel && (
            <Text style={styles.metaChip}>{distLabel}</Text>
          )}
          {place.subcategory ? (
            <Text style={styles.metaChip}>{place.subcategory}</Text>
          ) : (
            <Text style={styles.metaChip}>{formatCategory(place.category)}</Text>
          )}
          {place.source === 'hrsa' && (
            <Text style={[styles.metaChip, styles.metaChipVerified]}>Federal</Text>
          )}
        </View>

        {place.address ? (
          <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
        ) : null}

        {place.hours ? (
          <Text style={styles.hours} numberOfLines={1}>🕐 {place.hours}</Text>
        ) : null}

        {(place.phone || place.website) && (
          <View style={styles.actions}>
            {place.phone && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                <Text style={styles.actionBtnText}>📞 Call</Text>
              </TouchableOpacity>
            )}
            {place.website && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleWeb}>
                <Text style={styles.actionBtnText}>🌐 Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 20 },
  body: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 5 },
  name: {
    flex: 1, fontSize: 14, fontWeight: '700',
    color: Colors.ink, lineHeight: 19,
  },
  verifiedBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 4 },
  metaChip: {
    fontSize: 11, fontWeight: '600', color: Colors.inkFaint,
    backgroundColor: Colors.line2, borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  metaChipVerified: {
    backgroundColor: Colors.greenLight,
    color: Colors.green,
  },
  address: { fontSize: 12, color: Colors.inkSoft, marginBottom: 2 },
  hours: { fontSize: 12, color: Colors.inkSoft, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: Colors.blueDark },
});
