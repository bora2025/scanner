import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

const ACCENT = '#FF6B35';

function SettingRow({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIconWrap}>
        <Text style={styles.rowIconEmoji}>{icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

export default function SettingsScreen() {
  const [hdQuality, setHdQuality] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [flashAuto, setFlashAuto] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Configure your scanner</Text>
        </View>

        {/* Scan Quality */}
        <SectionHeader title="SCAN QUALITY" />
        <View style={styles.card}>
          <SettingRow
            icon="🔲"
            title="HD Quality"
            subtitle="Higher quality, larger file size"
            right={
              <Switch
                value={hdQuality}
                onValueChange={setHdQuality}
                trackColor={{ false: '#2C2C3E', true: ACCENT }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="⚡"
            title="Auto Flash"
            subtitle="Enable flash automatically"
            right={
              <Switch
                value={flashAuto}
                onValueChange={setFlashAuto}
                trackColor={{ false: '#2C2C3E', true: ACCENT }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="💾"
            title="Auto Save to Gallery"
            subtitle="Save scans automatically"
            right={
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: '#2C2C3E', true: ACCENT }}
                thumbColor="#FFF"
              />
            }
          />
        </View>

        {/* Export */}
        <SectionHeader title="EXPORT" />
        <View style={styles.card}>
          <SettingRow
            icon="📄"
            title="Default Format"
            right={<Text style={styles.valueText}>PDF</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🗜️"
            title="Compression"
            right={<Text style={styles.valueText}>Medium</Text>}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.card}>
          <SettingRow
            icon="📱"
            title="App Version"
            right={<Text style={styles.valueText}>1.0.0</Text>}
          />
          <View style={styles.divider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SettingRow
              icon="⭐"
              title="Rate App"
              subtitle="Help us improve"
              right={<Text style={styles.chevron}>›</Text>}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity activeOpacity={0.7}>
            <SettingRow
              icon="🔒"
              title="Privacy Policy"
              right={<Text style={styles.chevron}>›</Text>}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>DocScan — Fast & Smart Scanner</Text>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#8E8E93', marginTop: 4 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#16161E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2C2C3E',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2C2C3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowIconEmoji: { fontSize: 18 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  rowSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2C2C3E', marginLeft: 68 },
  valueText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },
  chevron: { color: '#8E8E93', fontSize: 22, fontWeight: '300', lineHeight: 24 },

  footer: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  footerText: { color: '#3C3C4E', fontSize: 12 },
});
