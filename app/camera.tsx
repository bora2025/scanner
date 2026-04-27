import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.78;
const ACCENT = '#FF6B35';
const OVERLAY = 'rgba(0,0,0,0.65)';
const CORNER = 24;
const CORNER_W = 3;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: FRAME_SIZE - 2,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permScreen}>
        <View style={styles.permContent}>
          <Text style={styles.permEmoji}>📷</Text>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permText}>
            Allow camera access to scan documents and photos
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permBtnText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.permBack}>
            <Text style={styles.permBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92, skipProcessing: false });
      router.push({ pathname: '/review', params: { imageUris: [photo.uri] } });
    } catch {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera fills entire screen */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        enableTorch={flash}
      />

      {/* 3-row overlay layout */}
      <View style={StyleSheet.absoluteFill}>

        {/* ROW 1: dark top — contains top bar */}
        <View style={[styles.overlayBlock, { flex: 1 }]}>
          <SafeAreaView>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                <Text style={styles.iconBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Scan Document</Text>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(f => !f)}>
                <Text style={styles.iconBtnText}>{flash ? '⚡' : '🔦'}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ROW 2: frame row */}
        <View style={{ height: FRAME_SIZE, flexDirection: 'row' }}>
          <View style={[styles.overlayBlock, { flex: 1 }]} />

          {/* Scan frame — transparent, shows camera through */}
          <View style={{ width: FRAME_SIZE, overflow: 'hidden' }}>
            {/* Corner brackets */}
            <View style={[styles.cb, styles.cbTL]} />
            <View style={[styles.cb, styles.cbTR]} />
            <View style={[styles.cb, styles.cbBL]} />
            <View style={[styles.cb, styles.cbBR]} />
            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
          </View>

          <View style={[styles.overlayBlock, { flex: 1 }]} />
        </View>

        {/* ROW 3: dark bottom — hint + capture button */}
        <View style={[styles.overlayBlock, { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' }]}>
          <Text style={styles.hintText}>Align document within the frame</Text>

          {/* Capture button */}
          <TouchableOpacity
            style={[styles.captureBtn, isCapturing && styles.captureBtnActive]}
            onPress={takePicture}
            disabled={isCapturing}
            activeOpacity={0.85}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          {/* Safe area spacer */}
          <SafeAreaView />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Permission screen
  permScreen: { flex: 1, backgroundColor: '#0A0A0F' },
  permContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  permEmoji: { fontSize: 64, marginBottom: 20 },
  permTitle: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 10 },
  permText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  permBtn: {
    backgroundColor: ACCENT, paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: 14, marginBottom: 12, width: '100%', alignItems: 'center',
  },
  permBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  permBack: { paddingVertical: 10 },
  permBackText: { color: '#8E8E93', fontSize: 14 },

  // Overlay
  overlayBlock: { backgroundColor: OVERLAY },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  iconBtnText: { fontSize: 17 },

  // Corner brackets
  cb: { position: 'absolute', width: CORNER, height: CORNER, borderColor: ACCENT },
  cbTL: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderTopLeftRadius: 6 },
  cbTR: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 6 },
  cbBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderBottomLeftRadius: 6 },
  cbBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 6 },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: CORNER,
    right: CORNER,
    height: 2,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
    opacity: 0.85,
  },

  // Hint
  hintText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },

  // Capture button
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureBtnActive: { opacity: 0.6 },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },
});
