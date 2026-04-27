import 'dart:typed_data';
import 'package:image/image.dart' as img;

/// Maximum pixel dimension (width or height) accepted for processing.
/// Images exceeding this are rejected to prevent OOM-based DoS attacks.
const _maxDimension = 8000;

class ImageEnhancer {
  /// Processes a captured document image:
  /// - Boosts contrast for clean black text on white background
  /// - Desaturates (document-style appearance)
  /// - Sharpens edges
  static Future<Uint8List> enhanceDocument(Uint8List bytes) async {
    final img.Image? decoded;
    try {
      decoded = img.decodeImage(bytes);
    } catch (_) {
      return bytes;
    }
    if (decoded == null) return bytes;
    if (decoded.width > _maxDimension || decoded.height > _maxDimension) {
      return bytes; // reject oversized image
    }

    // Boost contrast + brightness, reduce saturation for document look
    final adjusted = img.adjustColor(
      decoded,
      contrast: 1.5,
      brightness: 1.08,
      saturation: 0.4,
    );

    // Sharpen edges so text is crisp
    final sharpened = img.convolution(
      adjusted,
      filter: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    );

    return Uint8List.fromList(img.encodeJpg(sharpened, quality: 92));
  }

  /// Fast whole-page processing: center-crops to A4 ratio (1:√2), then
  /// applies a lighter enhancement pipeline for minimum latency.
  /// Suitable for office reports, bulk scanning, and books.
  static Future<Uint8List> fastPageEnhance(Uint8List bytes) async {
    final img.Image? decoded;
    try {
      decoded = img.decodeImage(bytes);
    } catch (_) {
      return bytes;
    }
    if (decoded == null) return bytes;
    if (decoded.width > _maxDimension || decoded.height > _maxDimension) {
      return bytes; // reject oversized image
    }

    // Center-crop to A4 aspect ratio (width : height = 1 : √2 ≈ 1 : 1.4142)
    const a4Ratio = 1.4142135;
    int cropW, cropH;
    if (decoded.height / decoded.width > a4Ratio) {
      cropW = decoded.width;
      cropH = (decoded.width * a4Ratio).round().clamp(1, decoded.height);
    } else {
      cropH = decoded.height;
      cropW = (decoded.height / a4Ratio).round().clamp(1, decoded.width);
    }
    final x = (decoded.width - cropW) ~/ 2;
    final y = (decoded.height - cropH) ~/ 2;
    final cropped =
        img.copyCrop(decoded, x: x, y: y, width: cropW, height: cropH);

    // Lighter contrast boost — keep colour for office docs and books
    final adjusted = img.adjustColor(
      cropped,
      contrast: 1.3,
      brightness: 1.05,
    );

    // Single-pass sharpen for crisp text
    final sharpened = img.convolution(
      adjusted,
      filter: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    );

    // Lower JPEG quality (85) for faster encode / smaller output
    return Uint8List.fromList(img.encodeJpg(sharpened, quality: 85));
  }
}
