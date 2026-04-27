// Exports the native ML Kit scanner on mobile/desktop,
// or the web stub when running in a browser.
export 'doc_scanner_native.dart'
    if (dart.library.html) 'doc_scanner_web.dart';
