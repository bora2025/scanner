import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ label, focused, children }: { label: string; focused: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.tabIconWrapper}>
      <View style={[styles.tabIconBg, focused && styles.tabIconBgActive]}>
        <Text style={[styles.tabIconEmoji, { opacity: focused ? 1 : 0.5 }]}>{children}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Scan" focused={focused}>📋</TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Settings" focused={focused}>⚙️</TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#16161E',
    borderTopColor: '#2C2C3E',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIconWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  tabIconBg: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconBgActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  tabIconEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#FF6B35',
    fontWeight: '700',
  },
});
