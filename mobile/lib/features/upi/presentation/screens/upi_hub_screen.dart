import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/finstaq_pill_tabs.dart';

class UpiHubScreen extends StatefulWidget {
  const UpiHubScreen({Key? key}) : super(key: key);

  @override
  State<UpiHubScreen> createState() => _UpiHubScreenState();
}

class _UpiHubScreenState extends State<UpiHubScreen> {
  String _selectedTab = 'qr';

  final List<PillTabItem> _tabs = [
    PillTabItem(id: 'qr', label: 'Dynamic QR Generator', icon: Icons.qr_code_2),
    PillTabItem(id: 'collect', label: 'Instant Collect', icon: Icons.call_received),
    PillTabItem(id: 'payout', label: 'Vendor Payout', icon: Icons.call_made),
    PillTabItem(id: 'directory', label: 'VPA Directory', icon: Icons.contacts),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('UPI Payments & Collections'),
      ),
      body: Column(
        children: [
          FinstaqPillTabs(
            tabs: _tabs,
            selectedTabId: _selectedTab,
            onTabSelected: (id) => setState(() => _selectedTab = id),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: isDark ? FinstaqColors.darkCard : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16),
                          ],
                        ),
                        child: const Icon(Icons.qr_code_2, size: 160, color: FinstaqColors.primaryBlue),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'apexind@okhdfcbank',
                        style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text('Apex Industries Ltd • NPCI Verified Merchant', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.share, size: 18),
                        label: const Text('Share Payment Link / QR'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: FinstaqColors.primaryBlue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}