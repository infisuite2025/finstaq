import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/finstaq_pill_tabs.dart';
import '../../../../core/widgets/amount_display.dart';

class BooksScreen extends StatefulWidget {
  const BooksScreen({Key? key}) : super(key: key);

  @override
  State<BooksScreen> createState() => _BooksScreenState();
}

class _BooksScreenState extends State<BooksScreen> {
  String _selectedTab = 'all';

  final List<PillTabItem> _tabs = [
    PillTabItem(id: 'all', label: 'All Vouchers', count: 48),
    PillTabItem(id: 'sales', label: 'Sales (Tax Invoices)', count: 18),
    PillTabItem(id: 'purchase', label: 'Purchases (3-Way)', count: 14),
    PillTabItem(id: 'receipt', label: 'UPI & Bank Receipts', count: 9),
    PillTabItem(id: 'payment', label: 'Vendor Payouts', count: 7),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Books & Registers'),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () {}),
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          FinstaqPillTabs(
            tabs: _tabs,
            selectedTabId: _selectedTab,
            onTabSelected: (id) => setState(() => _selectedTab = id),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: 10,
              itemBuilder: (context, index) {
                final isSale = index % 2 == 0;
                final amount = 45000.0 * (index + 1);

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? FinstaqColors.darkCard : Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isSale ? FinstaqColors.creditGreenLight : FinstaqColors.debitRedLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          isSale ? Icons.receipt_long : Icons.shopping_bag,
                          color: isSale ? FinstaqColors.creditGreen : FinstaqColors.debitRed,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isSale ? 'Tata Motors Ltd.' : 'JSW Steel Processing',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isSale ? 'INV/2026/04/00${index + 1} • GST 18%' : 'PUR/2026/04/00${index + 1} • TDS 194Q',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          AmountDisplay(
                            amount: amount,
                            isCredit: isSale,
                            isDebit: !isSale,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 2),
                          Text('14 Sep 2026', style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}