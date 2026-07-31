/**
 * EventCard — displays a single upcoming event from the events API.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { NearbyEvent } from '../types';
import { Colors } from '../constants/colors';

const SOURCE_LABELS: Record<string, string> = {
  ticketmaster: 'Ticketmaster',
  seatgeek: 'SeatGeek',
  civic: 'City',
};

const CATEGORY_ICONS: Record<string, string> = {
  music: '🎵', sports: '🏟️', arts: '🎭', family: '👨‍👩‍👧',
  comedy: '😄', film: '🎬', food: '🍽️', community: '🤝',
  general: '📅',
};

interface Props { event: NearbyEvent; }

export function EventCard({ event }: Props) {
  const icon = CATEGORY_ICONS[event.category?.toLowerCase()] ?? CATEGORY_ICONS.general;
  const sourceLabel = SOURCE_LABELS[event.source] ?? event.source;

  const dateStr = event.starts
    ? formatEventDate(event.starts)
    : 'Date TBD';

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{dateStr}</Text>
          {event.free && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          )}
        </View>
        {event.venue ? (
          <Text style={styles.venue} numberOfLines={1}>📍 {event.venue}</Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.source}>{sourceLabel}</Text>
          {event.url ? (
            <TouchableOpacity onPress={() => Linking.openURL(event.url)}>
              <Text style={styles.link}>Tickets / Info →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.line,
    padding: 12, marginHorizontal: 16, marginBottom: 8,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.eventsBg,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  icon: { fontSize: 20 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.ink, marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  date: { fontSize: 12, fontWeight: '600', color: Colors.blueMid },
  freeBadge: {
    backgroundColor: Colors.greenLight, borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 1,
  },
  freeText: { fontSize: 10, fontWeight: '800', color: Colors.green },
  venue: { fontSize: 12, color: Colors.inkSoft, marginBottom: 5 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  source: { fontSize: 11, color: Colors.inkFaint },
  link: { fontSize: 12, fontWeight: '600', color: Colors.blueDark },
});
