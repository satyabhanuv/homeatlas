/**
 * CategoryTabs — horizontal scrollable tabs matching Nearnity's 5 categories.
 * Active tab shows a bottom indicator. Count badges show data availability.
 */

import React from 'react';
import {
  ScrollView, TouchableOpacity, Text, View, StyleSheet,
} from 'react-native';
import { CategoryTab } from '../types';
import { Colors } from '../constants/colors';

interface Tab {
  id: CategoryTab;
  label: string;
  icon: string;
  count?: number;
  loading?: boolean;
}

interface Props {
  active: CategoryTab;
  tabs: Tab[];
  onSelect: (tab: CategoryTab) => void;
}

export function CategoryTabs({ active, tabs, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.tabInner}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {tab.loading ? (
                <View style={styles.dot} />
              ) : tab.count !== undefined && tab.count > 0 ? (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              ) : null}
            </View>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  container: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    gap: 2,
  },
  tab: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 0,
    position: 'relative',
    minWidth: 72,
    alignItems: 'center',
  },
  tabActive: {},
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: 10,
  },
  tabIcon: {
    fontSize: 15,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.inkSoft,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    color: Colors.blueDark,
  },
  badge: {
    backgroundColor: Colors.line2,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: Colors.blueLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkFaint,
  },
  badgeTextActive: {
    color: Colors.blueDark,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.blueMid,
    opacity: 0.7,
  },
  indicator: {
    position: 'absolute',
    bottom: 0, left: 10, right: 10,
    height: 2.5,
    backgroundColor: Colors.blueDark,
    borderRadius: 2,
  },
});
