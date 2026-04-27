import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import '../utils/doc_scanner.dart';
import '../utils/image_enhancer.dart';
import '../utils/web_download.dart';
import 'review_screen.dart';

const _accent = Color(0xFFFF6B35);

/// Scanning modes exposed to callers.
enum ScanMode {
  /// Standard mode — square crop frame, full enhancement pipeline.
  standard,

  /// Fast Scan Whole Page — A4-ratio frame, center-crop, lighter pipeline.
  /// Primary induction mode for office reports, bulk scanning, and books.
  fastPage,
}

class CameraScreen extends StatefulWidget {
  final ScanMode mode;

  const CameraScreen({super.key, this.mode = ScanMode.standard});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen>
    with SingleTickerProviderStateMixin {
  CameraController? _controller;
  bool _isCapturing = false;
  bool _isEnhancing = false;

  // True when running on Windows / macOS / Linux (camera plugin not supported).
  bool _isDesktop = false;

  late AnimationController _scanAnim;
  late Animation<double> _scanLine;

  @override
  void initState() {
    super.initState();
    _scanAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
    _scanLine = Tween<double>(begin: 0, end: 1).animate(_scanAnim);

    if (kIsWeb) {
      _initWebCamera();
    } else if (defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS) {
      // Mobile: auto-launch ML Kit native scanner
      WidgetsBinding.instance.addPostFrameCallback((_) => _startNativeScan());
    } else {
      // Desktop (Windows/macOS/Linux): camera plugin has no desktop implementation.
      _isDesktop = true;
    }
  }

  // ── Mobile: ML Kit ──────────────────────────────────────────────────────

  Future<void> _startNativeScan() async {
    try {
      final images = await scanDocumentNative();
      if (!mounted) return;
      if (images.isNotEmpty) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ReviewScreen(imagePaths: images),
          ),
        );
      } else {
        Navigator.pop(context); // user cancelled
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Scanner unavailable. Please try again.')),
      );
      Navigator.pop(context);
    }
  }

  // ── Web: manual camera + enhancement ────────────────────────────────────

  Future<void> _initWebCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return;
    _controller = CameraController(
      cameras.first,
      // Fast page mode captures at max resolution so the A4 crop is sharp.
      widget.mode == ScanMode.fastPage
          ? ResolutionPreset.max
          : ResolutionPreset.high,
      enableAudio: false,
    );
    await _controller!.initialize();
    if (mounted) setState(() {});
  }

  Future<void> _takePicture() async {
    if (_controller == null ||
        !_controller!.value.isInitialized ||
        _isCapturing ||
        _isEnhancing) {
      return;
    }

    setState(() => _isCapturing = true);
    try {
      final photo = await _controller!.takePicture();
      setState(() {
        _isCapturing = false;
        _isEnhancing = true;
      });

      // Fetch bytes, enhance, and handle based on platform
      Uint8List raw;
      if (kIsWeb) {
        raw = await fetchBytes(photo.path);
      } else {
        raw = await File(photo.path).readAsBytes();
      }

      final Uint8List enhanced = widget.mode == ScanMode.fastPage
          ? await ImageEnhancer.fastPageEnhance(raw)
          : await ImageEnhancer.enhanceDocument(raw);

      String resultPath;
      if (kIsWeb) {
        resultPath = await bytesToBlobUrl(enhanced, 'image/jpeg');
      } else {
        final dir = await getTemporaryDirectory();
        final file = File(
          '${dir.path}/enhanced_${DateTime.now().millisecondsSinceEpoch}.jpg',
        );
        await file.writeAsBytes(enhanced);
        resultPath = file.path;
      }

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ReviewScreen(imagePaths: [resultPath]),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Capture failed. Please try again.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCapturing = false;
          _isEnhancing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    _scanAnim.dispose();
    super.dispose();
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    // Desktop: camera plugin not supported — show informative message.
    if (_isDesktop) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          leading: IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.no_photography_outlined,
                    color: Colors.white38, size: 72),
                SizedBox(height: 24),
                Text(
                  'Camera not supported on desktop',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 12),
                Text(
                  'Use the Android or iOS app, or open in a web browser, to scan documents with your camera.',
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Mobile: show loading while ML Kit scanner opens automatically
    final isMobile = !kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.android ||
            defaultTargetPlatform == TargetPlatform.iOS);

    if (isMobile) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: _accent),
              SizedBox(height: 20),
              Text(
                'Opening scanner…',
                style: TextStyle(color: Colors.white70, fontSize: 15),
              ),
            ],
          ),
        ),
      );
    }

    final size = MediaQuery.of(context).size;
    final bool isFastPage = widget.mode == ScanMode.fastPage;

    // Frame dimensions: A4 ratio (1 : √2) for fastPage, square for standard.
    double frameW, frameH;
    if (isFastPage) {
      frameW = size.width * 0.88;
      frameH = frameW * 1.4142;
      if (frameH > size.height * 0.78) {
        frameH = size.height * 0.78;
        frameW = frameH / 1.4142;
      }
    } else {
      final s = size.width * 0.78;
      frameW = s;
      frameH = s;
    }

    if (_controller == null || !_controller!.value.isInitialized) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: _accent)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Camera preview — fill entire screen
          SizedBox.expand(
            child: FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _controller!.value.previewSize?.height ?? size.width,
                height: _controller!.value.previewSize?.width ?? size.height,
                child: CameraPreview(_controller!),
              ),
            ),
          ),

          // Dark overlay with cutout frame
          Positioned.fill(
            child: CustomPaint(
              painter:
                  _OverlayPainter(frameW: frameW, frameH: frameH, screenSize: size),
            ),
          ),

          // Animated scan line
          Positioned(
            left: (size.width - frameW) / 2,
            top: (size.height - frameH) / 2,
            child: SizedBox(
              width: frameW,
              height: frameH,
              child: AnimatedBuilder(
                animation: _scanLine,
                builder: (_, __) => CustomPaint(
                  painter: _ScanLinePainter(
                    progress: _scanLine.value,
                    frameW: frameW,
                    frameH: frameH,
                  ),
                ),
              ),
            ),
          ),

          // Top bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _IconBtn(
                    icon: Icons.close,
                    onTap: () => Navigator.pop(context),
                  ),
                  Text(
                    isFastPage ? '⚡ Fast Scan' : 'Scan Document',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),
          ),

          // Enhancement hint
          Positioned(
            bottom: 140,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isFastPage
                      ? '⚡ Align full page · auto-crop · fast PDF'
                      : '✨ Auto-enhance: contrast · sharpen · denoise',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ),
          ),

          // Shutter button
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 40),
                child: Center(
                  child: GestureDetector(
                    onTap: _takePicture,
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                      child: Center(
                        child: Container(
                          width: 54,
                          height: 54,
                          decoration: const BoxDecoration(
                            color: _accent,
                            shape: BoxShape.circle,
                          ),
                          child: (_isCapturing || _isEnhancing)
                              ? const Padding(
                                  padding: EdgeInsets.all(14),
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(
                                  Icons.camera_alt,
                                  color: Colors.white,
                                  size: 28,
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // "Enhancing…" full-screen overlay
          if (_isEnhancing)
            Container(
              color: Colors.black87,
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const CircularProgressIndicator(color: _accent),
                    const SizedBox(height: 20),
                    Text(
                      isFastPage
                          ? '⚡ Processing page…'
                          : 'Enhancing document…',
                      style: const TextStyle(
                          color: Colors.white, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isFastPage
                          ? 'Cropping · adjusting · fast PDF'
                          : 'Adjusting contrast · sharpening · preparing PDF',
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _IconBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.black38,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }
}

class _OverlayPainter extends CustomPainter {
  final double frameW;
  final double frameH;
  final Size screenSize;

  _OverlayPainter(
      {required this.frameW,
      required this.frameH,
      required this.screenSize});

  @override
  void paint(Canvas canvas, Size size) {
    final overlayPaint = Paint()
      ..color = Colors.black.withAlpha(166);

    final cx = size.width / 2;
    final cy = size.height / 2;
    final frameRect = Rect.fromCenter(
      center: Offset(cx, cy),
      width: frameW,
      height: frameH,
    );

    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height)),
        Path()
          ..addRRect(
            RRect.fromRectAndRadius(frameRect, const Radius.circular(12)),
          ),
      ),
      overlayPaint,
    );

    // Corner markers
    final cornerPaint = Paint()
      ..color = _accent
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    const cornerLen = 24.0;
    final l = cx - frameW / 2;
    final r = cx + frameW / 2;
    final t = cy - frameH / 2;
    final b = cy + frameH / 2;

    // Top-left
    canvas.drawLine(Offset(l, t + cornerLen), Offset(l, t), cornerPaint);
    canvas.drawLine(Offset(l, t), Offset(l + cornerLen, t), cornerPaint);
    // Top-right
    canvas.drawLine(Offset(r - cornerLen, t), Offset(r, t), cornerPaint);
    canvas.drawLine(Offset(r, t), Offset(r, t + cornerLen), cornerPaint);
    // Bottom-left
    canvas.drawLine(Offset(l, b - cornerLen), Offset(l, b), cornerPaint);
    canvas.drawLine(Offset(l, b), Offset(l + cornerLen, b), cornerPaint);
    // Bottom-right
    canvas.drawLine(Offset(r - cornerLen, b), Offset(r, b), cornerPaint);
    canvas.drawLine(Offset(r, b), Offset(r, b - cornerLen), cornerPaint);
  }

  @override
  bool shouldRepaint(_OverlayPainter old) => false;
}

class _ScanLinePainter extends CustomPainter {
  final double progress;
  final double frameW;
  final double frameH;

  _ScanLinePainter(
      {required this.progress,
      required this.frameW,
      required this.frameH});

  @override
  void paint(Canvas canvas, Size size) {
    final y = progress * frameH;
    final paint = Paint()
      ..shader = const LinearGradient(
        colors: [Colors.transparent, _accent, Colors.transparent],
      ).createShader(Rect.fromLTWH(0, 0, frameW, 1))
      ..strokeWidth = 2;
    canvas.drawLine(Offset(0, y), Offset(frameW, y), paint);
  }

  @override
  bool shouldRepaint(_ScanLinePainter old) => old.progress != progress;
}
