import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ACCENT = '#FF6B35';

async function generatePdf(imageUris: string[]): Promise<string | null> {
  const imageTags = imageUris
    .map(uri => `<img src="${uri}" style="width:100%; page-break-after: always;" />`)
    .join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>body { margin: 0; } img { display: block; }</style>
    </head><body>${imageTags}</body></html>`;
  try {
    const { uri } = await Print.printToFileAsync({ html });
    const dest = `${FileSystem.documentDirectory}scan_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return null;
  }
}

export default function ReviewScreen() {
  const { imageUris } = useLocalSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const uris = Array.isArray(imageUris) ? imageUris : [imageUris].filter(Boolean);

  const handleExport = async () => {
    setIsExporting(true);
    const pdfUri = await generatePdf(uris);
    setIsExporting(false);
    if (!pdfUri) {
      Alert.alert('Error', 'PDF generation failed. Please try again.');
      return;
    }
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Share PDF' });
    } else {
      Alert.alert('Saved', 'PDF saved to device successfully.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Review</Text>
            <Text style={styles.headerSub}>{uris.length} {uris.length === 1 ? 'page' : 'pages'}</Text>
          </View>
          <TouchableOpacity style={styles.addMoreBtn} onPress={() => router.push('/camera')}>
            <Text style={styles.addMoreText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Image list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {uris.map((uri, index) => (
          <View key={index} style={styles.pageCard}>
            <View style={styles.pageHeader}>
              <View style={styles.pageNumBadge}>
                <Text style={styles.pageNumText}>Page {index + 1}</Text>
              </View>
            </View>
            <Image
              source={{ uri }}
              style={styles.pageImage}
              resizeMode="contain"
            />
          </View>
        ))}

        {/* Add another page */}
        <TouchableOpacity style={styles.addPageCard} onPress={() => router.push('/camera')} activeOpacity={0.75}>
          <Text style={styles.addPageIcon}>＋</Text>
          <Text style={styles.addPageText}>Add Another Page</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom action bar */}
      <SafeAreaView style={styles.bottomSafe}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.85}
          >
            {isExporting ? (
              <View style={styles.exportingRow}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.exportBtnText}>Generating PDF...</Text>
              </View>
            ) : (
              <View style={styles.exportingRow}>
                <Text style={styles.exportBtnIcon}>📤</Text>
                <Text style={styles.exportBtnText}>Export as PDF</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  headerSafe: { backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#16161E',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#16161E',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { color: '#FFF', fontSize: 20, lineHeight: 22 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  addMoreBtn: {
    backgroundColor: '#16161E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  addMoreText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Image list
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  pageCard: {
    backgroundColor: '#16161E',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  pageNumBadge: {
    backgroundColor: '#2C2C3E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pageNumText: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  pageImage: {
    width: width - 32,
    height: (width - 32) * 1.38,
    backgroundColor: '#0A0A0F',
  },

  // Add page card
  addPageCard: {
    backgroundColor: '#16161E',
    borderRadius: 20,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2C2C3E',
    borderStyle: 'dashed',
    gap: 6,
  },
  addPageIcon: { fontSize: 24, color: '#8E8E93' },
  addPageText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },

  // Bottom bar
  bottomSafe: { backgroundColor: '#0A0A0F' },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#16161E',
  },
  exportBtn: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exportBtnDisabled: { opacity: 0.65 },
  exportingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exportBtnIcon: { fontSize: 20 },
  exportBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
