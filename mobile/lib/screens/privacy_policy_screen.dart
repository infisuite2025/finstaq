import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text('Privacy Policy', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 36),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.shield_outlined, color: Color(0xFF60A5FA), size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Infisuite Finance',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                SizedBox(height: 10),
                Text('Last updated: 3 November 2026', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                SizedBox(height: 12),
                Text(
                  'Infisuite Finance is an accounting app for a company workspace. This policy explains what the app stores and why.',
                  style: TextStyle(color: Color(0xFFE2E8F0), height: 1.45, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          const _Section(
            icon: Icons.person_outline,
            title: 'Information we store',
            body:
                'Account details you enter to sign in: email address, password, and optional company code or GSTIN. The password is stored as a hash, not as plain text.\n\nWork you save in the app: vouchers, invoices, ledgers, payroll, bank, tax, and other company records.\n\nA session token on this phone so you stay signed in until you log out.',
          ),
          const _Section(
            icon: Icons.photo_camera_outlined,
            title: 'Camera',
            body: 'If you use Scan UPI, the phone camera is used only to read a QR code. The app does not keep a photo library from that scan.',
          ),
          const _Section(
            icon: Icons.lock_outline,
            title: 'How it is used',
            body: 'This information is used to sign you in, show your company’s books, and save the records you create. It is not sold. It is not used for advertising.',
          ),
          const _Section(
            icon: Icons.groups_outlined,
            title: 'Who can see it',
            body:
                'People in your company workspace can see records according to their role. The app operator can access the server that stores this data in order to run the service.',
          ),
          const _Section(
            icon: Icons.schedule_outlined,
            title: 'How long it is kept',
            body:
                'Company records stay until a company owner or the operator deletes them. Logging out removes the session token from this phone. It does not delete the company books.',
          ),
          const _Section(
            icon: Icons.mail_outline,
            title: 'Contact',
            body: 'To ask about this data or request a correction, contact the Infisuite administrator who created your login.',
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  const _Section({required this.icon, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF60A5FA), size: 18),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 10),
          Text(body, style: const TextStyle(color: Color(0xFFCBD5E1), height: 1.45, fontSize: 14)),
        ],
      ),
    );
  }
}
