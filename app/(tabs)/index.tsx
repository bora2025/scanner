import { View, Text, TouchableOpacity } from 'react-native';

import { router } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Scanner App</Text>
      <TouchableOpacity onPress={() => router.push('/camera')} style={{ backgroundColor: 'blue', padding: 20, borderRadius: 10, margin: 10 }}>
        <Text style={{ color: 'white' }}>Capture</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}