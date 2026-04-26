import { View, Text, TouchableOpacity, Alert, FlatList, Image } from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';

import * as Print from 'expo-print';

import * as FileSystem from 'expo-file-system';

import * as Sharing from 'expo-sharing';

async function generatePdf(imageUris) {
  const imageTags = imageUris.map(uri => `<img src="${uri}" style="width:100%; page-break-after: always;"/>`).join('');
  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><style>body { margin: 0; }</style></head>
  <body>${imageTags}</body>
</html>`;
  try {
    const { uri } = await Print.printToFileAsync({ html });
    const pdfName = `${FileSystem.documentDirectory}scanned_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: pdfName });
    return pdfName;
  } catch (error) {
    console.error('PDF generation failed:', error);
  }
}

export default function ReviewScreen() {
  const { imageUris } = useLocalSearchParams();
  const uris = Array.isArray(imageUris) ? imageUris : [imageUris];

  const handleExport = async () => {
    const pdfUri = await generatePdf(uris);
    if (pdfUri) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert('Sharing not available');
      }
    } else {
      Alert.alert('PDF generation failed');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>Review & Edit</Text>
      <FlatList
        data={uris}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width: 200, height: 300, margin: 10 }} />
        )}
      />
      <TouchableOpacity onPress={() => router.push('/camera')} style={{ backgroundColor: 'green', padding: 20, margin: 10 }}>
        <Text style={{ color: 'white' }}>Add More Pages</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleExport} style={{ backgroundColor: 'blue', padding: 20, margin: 10 }}>
        <Text style={{ color: 'white' }}>Export as PDF</Text>
      </TouchableOpacity>
    </View>
  );
}