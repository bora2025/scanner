import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;

import 'package:scanner_app/main.dart';
import 'package:scanner_app/screens/camera_screen.dart';
import 'package:scanner_app/utils/image_enhancer.dart';

// ── Helpers ──────────────────────────────────────────────────────────────────

/// Generates a solid-colour JPEG of the requested dimensions.
Uint8List _makeJpeg(int width, int height, {img.ColorRgb8? color}) {
  final src = img.Image(width: width, height: height);
  img.fill(src, color: color ?? img.ColorRgb8(200, 200, 200));
  return Uint8List.fromList(img.encodeJpg(src, quality: 90));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── App smoke test ──────────────────────────────────────────────────────────
  group('App smoke', () {
    testWidgets('DocScanApp renders home screen', (tester) async {
      await tester.pumpWidget(const DocScanApp());
      await tester.pump();
      // The main scaffold with a bottom nav bar should be present.
      expect(find.byType(NavigationBar), findsOneWidget);
      // Home label
      expect(find.text('Home'), findsOneWidget);
      // Settings label
      expect(find.text('Settings'), findsOneWidget);
    });

    testWidgets('Home screen shows primary Tap-to-Scan card', (tester) async {
      await tester.pumpWidget(const DocScanApp());
      await tester.pump();
      expect(find.text('Tap to Scan'), findsOneWidget);
    });

    testWidgets('Home screen shows Fast Scan hint text', (tester) async {
      await tester.pumpWidget(const DocScanApp());
      await tester.pump();
      expect(
        find.text('⚡ Whole page · auto-crop · fast PDF'),
        findsOneWidget,
      );
    });

    testWidgets('Quick-action grid contains Document tile', (tester) async {
      await tester.pumpWidget(const DocScanApp());
      await tester.pump();
      expect(find.text('Document'), findsOneWidget);
    });
  });

  // ── ScanMode enum ───────────────────────────────────────────────────────────
  group('ScanMode', () {
    test('default mode is standard', () {
      const screen = CameraScreen();
      expect(screen.mode, ScanMode.standard);
    });

    test('fastPage mode is accepted', () {
      const screen = CameraScreen(mode: ScanMode.fastPage);
      expect(screen.mode, ScanMode.fastPage);
    });

    test('ScanMode has exactly two values', () {
      expect(ScanMode.values.length, 2);
    });
  });

  // ── ImageEnhancer.enhanceDocument ───────────────────────────────────────────
  group('ImageEnhancer.enhanceDocument', () {
    test('returns non-empty bytes', () async {
      final input = _makeJpeg(200, 200);
      final result = await ImageEnhancer.enhanceDocument(input);
      expect(result, isNotEmpty);
    });

    test('returns valid JPEG', () async {
      final input = _makeJpeg(200, 200);
      final result = await ImageEnhancer.enhanceDocument(input);
      final decoded = img.decodeJpg(result);
      expect(decoded, isNotNull);
    });

    test('preserves approximate dimensions', () async {
      final input = _makeJpeg(300, 300);
      final result = await ImageEnhancer.enhanceDocument(input);
      final decoded = img.decodeJpg(result)!;
      expect(decoded.width, 300);
      expect(decoded.height, 300);
    });

    test('returns input unchanged when bytes are corrupt', () async {
      final bad = Uint8List.fromList([0, 1, 2, 3]);
      final result = await ImageEnhancer.enhanceDocument(bad);
      expect(result, equals(bad));
    });
  });

  // ── ImageEnhancer.fastPageEnhance ───────────────────────────────────────────
  group('ImageEnhancer.fastPageEnhance', () {
    test('returns non-empty bytes', () async {
      final input = _makeJpeg(400, 600);
      final result = await ImageEnhancer.fastPageEnhance(input);
      expect(result, isNotEmpty);
    });

    test('returns valid JPEG', () async {
      final input = _makeJpeg(400, 600);
      final result = await ImageEnhancer.fastPageEnhance(input);
      final decoded = img.decodeJpg(result);
      expect(decoded, isNotNull);
    });

    test('A4 crop: portrait source — output height ≈ width × √2', () async {
      // 400 × 800: height/width = 2.0 > 1.4142 → crop height to width×√2
      final input = _makeJpeg(400, 800);
      final result = await ImageEnhancer.fastPageEnhance(input);
      final decoded = img.decodeJpg(result)!;
      final ratio = decoded.height / decoded.width;
      expect(ratio, closeTo(1.4142, 0.02));
    });

    test('A4 crop: landscape source — output width ≈ height / √2', () async {
      // 800 × 400: height/width = 0.5 < 1.4142 → crop width to height/√2
      final input = _makeJpeg(800, 400);
      final result = await ImageEnhancer.fastPageEnhance(input);
      final decoded = img.decodeJpg(result)!;
      final ratio = decoded.height / decoded.width;
      expect(ratio, closeTo(1.4142, 0.02));
    });

    test('already-A4 source passes through without overshooting bounds',
        () async {
      // 595 × 842 (A4 at 72dpi)
      final input = _makeJpeg(595, 842);
      final result = await ImageEnhancer.fastPageEnhance(input);
      final decoded = img.decodeJpg(result)!;
      expect(decoded.width, lessThanOrEqualTo(595));
      expect(decoded.height, lessThanOrEqualTo(842));
    });

    test('returns input unchanged when bytes are corrupt', () async {
      final bad = Uint8List.fromList([0, 1, 2, 3]);
      final result = await ImageEnhancer.fastPageEnhance(bad);
      expect(result, equals(bad));
    });
  });
}
