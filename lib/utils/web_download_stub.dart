import 'dart:typed_data';

/// Fetches raw bytes from a URL (e.g. a blob: URL on web).
Future<Uint8List> fetchBytes(String url) async => Uint8List(0);

/// Triggers a file download in the browser.
Future<void> downloadBytes(
  Uint8List bytes,
  String filename,
  String mimeType,
) async {}

/// Creates a temporary object URL from bytes (web only). Returns empty string on non-web.
Future<String> bytesToBlobUrl(Uint8List bytes, String mimeType) async => '';
