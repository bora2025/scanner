import 'dart:js_interop';
import 'dart:typed_data';
import 'package:web/web.dart' as web;

/// Fetches raw bytes from a URL using the Fetch API.
/// Throws a [StateError] if the server returns a non-2xx status code,
/// preventing corrupt or adversarial response bodies from being processed.
Future<Uint8List> fetchBytes(String url) async {
  final response = await web.window.fetch(url.toJS).toDart;
  if (!response.ok) {
    throw StateError('fetchBytes: server returned ${response.status}');
  }
  final buffer = await response.arrayBuffer().toDart;
  return buffer.toDart.asUint8List();
}

/// Triggers a PDF download in the browser.
Future<void> downloadBytes(
  Uint8List bytes,
  String filename,
  String mimeType,
) async {
  final blob = web.Blob(
    [bytes.toJS].toJS,
    web.BlobPropertyBag(type: mimeType),
  );
  final url = web.URL.createObjectURL(blob);
  (web.document.createElement('a') as web.HTMLAnchorElement)
    ..href = url
    ..download = filename
    ..click();
  web.URL.revokeObjectURL(url);
}

/// Creates a temporary object URL from bytes for display in the browser.
Future<String> bytesToBlobUrl(Uint8List bytes, String mimeType) async {
  final blob = web.Blob(
    [bytes.toJS].toJS,
    web.BlobPropertyBag(type: mimeType),
  );
  return web.URL.createObjectURL(blob);
}
