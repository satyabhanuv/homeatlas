/**
 * EmergencyBar — persistent red bar at the top of every screen.
 * 911 / 988 / 211 — always visible, one tap to call.
 * Matches the web app's permanent emergency header.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Colors } from '../constants/colors';

const LINES = [
  { label: '🚨 911', number: '911', hint: 'Emergency' },
  { label: '🧠 988', number: '988', hint: 'Mental health crisis' },
  { label: '🤝 211', number: '211', hint: 'Community services' },
] as const;

export function EmergencyBar() {
  return (
    <View style={styles.bar}>
      {LINES.map(({ label, number, hint }) => (
        <TouchableOpacity
          key={number}
          style={styles.btn}
          onPress={() => Linking.openURL(`tel:${number}`)}
          accessibilityLabel={`Call ${number} — ${hint}`}
          accessibilityRole="button"
        >
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.emergency,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
