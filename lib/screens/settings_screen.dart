import 'package:flutter/material.dart';

const _accent = Color(0xFFFF6B35);

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _hdQuality = true;
  bool _autoSave = false;
  bool _flashAuto = false;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            const Text(
              'Settings',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Configure your scanner',
              style: TextStyle(color: Colors.white54, fontSize: 14),
            ),
            const SizedBox(height: 28),

            // Scan Quality section
            const _SectionLabel('SCAN QUALITY'),
            _Card(
              children: [
                _SettingRow(
                  icon: '🔲',
                  title: 'HD Quality',
                  subtitle: 'Higher quality, larger file size',
                  right: Switch(
                    value: _hdQuality,
                    onChanged: (v) => setState(() => _hdQuality = v),
                    activeThumbColor: _accent,
                  ),
                ),
                const Divider(color: Colors.white12, height: 1),
                _SettingRow(
                  icon: '⚡',
                  title: 'Auto Flash',
                  subtitle: 'Enable flash automatically',
                  right: Switch(
                    value: _flashAuto,
                    onChanged: (v) => setState(() => _flashAuto = v),
                    activeThumbColor: _accent,
                  ),
                ),
                const Divider(color: Colors.white12, height: 1),
                _SettingRow(
                  icon: '💾',
                  title: 'Auto Save',
                  subtitle: 'Save scans to gallery automatically',
                  right: Switch(
                    value: _autoSave,
                    onChanged: (v) => setState(() => _autoSave = v),
                    activeThumbColor: _accent,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // About section
            const _SectionLabel('ABOUT'),
            const _Card(
              children: [
                _SettingRow(icon: '📱', title: 'Version', subtitle: '1.0.0'),
                Divider(color: Colors.white12, height: 1),
                _SettingRow(icon: '⭐', title: 'Rate the App'),
                Divider(color: Colors.white12, height: 1),
                _SettingRow(icon: '🔒', title: 'Privacy Policy'),
              ],
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String title;

  const _SectionLabel(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white38,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final List<Widget> children;

  const _Card({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(children: children),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final String icon;
  final String title;
  final String? subtitle;
  final Widget? right;

  const _SettingRow({
    required this.icon,
    required this.title,
    this.subtitle,
    this.right,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white10,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 20)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 15),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style:
                        const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ],
            ),
          ),
          if (right != null) right!,
        ],
      ),
    );
  }
}
