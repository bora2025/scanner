import 'package:google_mlkit_document_scanner/google_mlkit_document_scanner.dart';

/// Launches the ML Kit Document Scanner UI.
/// Handles edge detection, perspective correction, and image enhancement natively.
/// Returns a list of enhanced JPEG file paths.
Future<List<String>> scanDocumentNative() async {
  final scanner = DocumentScanner(
    options: DocumentScannerOptions(
      documentFormat: DocumentFormat.jpeg,
      mode: ScannerMode.full, // full = auto-detect + auto-capture
      pageLimit: 10,
      isGalleryImport: false,
    ),
  );
  try {
    final result = await scanner.scanDocument();
    return result.images;
  } finally {
    scanner.close();
  }
}
