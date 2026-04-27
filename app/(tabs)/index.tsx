import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: '📄', label: 'Document' },
  { icon: '🪪', label: 'ID Card' },
  { icon: '🧾', label: 'Receipt' },
  { icon: '📸', label: 'Photo' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>DocScan</Text>
            <Text style={styles.headerSubtitle}>Fast & Smart Scanner</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRO</Text>
          </View>
        </View>

        {/* Main scan button */}
        <TouchableOpacity
          style={styles.mainScanBtn}
          onPress={() => router.push('/camera')}
          activeOpacity={0.88}
        >
          <View style={styles.mainScanBtnInner}>
            <View style={styles.cameraIconRing}>
              <Text style={styles.cameraIconEmoji}>📷</Text>
            </View>
            <Text style={styles.mainScanTitle}>Tap to Scan</Text>
            <Text style={styles.mainScanSub}>Document · ID · Receipt · Photo</Text>
          </View>
          {/* Corner decorators */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </TouchableOpacity>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Type</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => router.push('/camera')}
                activeOpacity={0.75}
              >
                <Text style={styles.actionEmoji}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>• Hold device steady while scanning</Text>
          <Text style={styles.tipText}>• Use flash in low-light conditions</Text>
          <Text style={styles.tipText}>• Align edges within the frame</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const ACCENT = '#FF6B35';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  badge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Main scan button
  mainScanBtn: {
    marginHorizontal: 24,
    marginBottom: 28,
    height: 220,
    borderRadius: 28,
    backgroundColor: '#16161E',
    borderWidth: 1.5,
    borderColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  mainScanBtnInner: {
    alignItems: 'center',
    gap: 10,
  },
  cameraIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,107,53,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cameraIconEmoji: {
    fontSize: 40,
  },
  mainScanTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainScanSub: {
    fontSize: 13,
    color: '#8E8E93',
  },
  // Corner decorators on scan button
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: ACCENT,
  },
  cornerTL: { top: 14, left: 14, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },

  // Quick actions
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#16161E',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  actionEmoji: {
    fontSize: 26,
  },
  actionLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },

  // Tips
  tipsCard: {
    marginHorizontal: 24,
    backgroundColor: '#16161E',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2C2C3E',
    gap: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
