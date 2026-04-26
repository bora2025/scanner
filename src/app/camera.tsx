import { View, TouchableOpacity, Text, Alert } from 'react-native';

import { router } from 'expo-router';

import DocumentScanner from 'react-native-document-scanner-plugin';

export default function CameraScreen() {
  const scanDocument = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();
      if (scannedImages.length > 0) {
        // Navigate to review screen, passing the URIs
        router.push({ pathname: '/review', params: { imageUris: scannedImages } });
      }
    } catch (error) {
      Alert.alert('Scanning failed', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Camera Viewfinder</Text>
      <TouchableOpacity onPress={scanDocument} style={{ backgroundColor: 'blue', padding: 20, borderRadius: 10 }}>
        <Text style={{ color: 'white' }}>Scan Document</Text>
      </TouchableOpacity>
    </View>
  );
}