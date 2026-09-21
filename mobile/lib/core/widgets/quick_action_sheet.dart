import 'package:flutter/material.dart';
import '../constants/colors.dart';

class QuickActionSheet extends StatelessWidget {
  final Function(String actionId) onActionSelected;

  const QuickActionSheet({Key? key, required this.onActionSelected}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final actions = [
      {'id': 'upi_scan', 'label': 'Scan UPI & Pay', 'icon': Icons.qr_code_scanner, 'color': FinstaqColors.primaryBlue},
      {'id': 'upi_qr', 'label': 'My Dynamic QR', 'icon': Icons.qr_code_2, 'color': FinstaqColors.indigoAccent},
      {'id': 'quick_invoice', 'label': 'Sales Invoice', 'icon': Icons.receipt_long, 'color': FinstaqColors.creditGreen},
      {'id': 'quick_expense', 'label': 'Expense Entry', 'icon': Icons.account_balance_wallet, 'color': FinstaqColors.debitRed},
      {'id': 'stock_scan', 'label': 'Stock Barcode', 'icon': Icons.inventory_2, 'color': FinstaqColors.warningAmber},
      {'id': 'geo_punch', 'label': 'Attendance Punch', 'icon': Icons.fingerprint, 'color': FinstaqColors.violetAccent},
    ];

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      decoration: BoxDecoration(
        color: isDark ? FinstaqColors.darkCard : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.grey.shade700 : Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '⚡ Quick ERP Actions',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close, size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.95,
            ),
            itemCount: actions.length,
            itemBuilder: (context, index) {
              final item = actions[index];
              final color = item['color'] as Color;

              return InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () {
                  Navigator.pop(context);
                  onActionSelected(item['id'] as String);
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: color.withOpacity(isDark ? 0.15 : 0.08),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: color.withOpacity(0.2)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(item['icon'] as IconData, color: Colors.white, size: 22),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        item['label'] as String,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}