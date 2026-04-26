import { View, Text, TouchableOpacity } from 'react-native';

import { router } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      router.push({ pathname: '/review', params: { imageUris: result.assets.map(a => a.uri) } });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Scanner App</Text>
      <TouchableOpacity onPress={() => router.push('/camera')} style={{ backgroundColor: 'blue', padding: 20, borderRadius: 10, margin: 10 }}>
        <Text style={{ color: 'white' }}>Capture</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage} style={{ backgroundColor: 'green', padding: 20, borderRadius: 10, margin: 10 }}>
        <Text style={{ color: 'white' }}>Import</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}