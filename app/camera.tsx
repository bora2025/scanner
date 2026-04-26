import { View, TouchableOpacity, Text, Alert } from 'react-native';

import { router } from 'expo-router';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { useRef } from 'react';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text>We need camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        router.push({ pathname: '/review', params: { imageUris: [photo.uri] } });
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} />
      <TouchableOpacity onPress={takePicture} style={{ position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'white', padding: 20, borderRadius: 50 }}>
        <Text>Take Picture</Text>
      </TouchableOpacity>
    </View>
  );
}