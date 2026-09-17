import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final modules = [
      {'title': 'Statutory Tax Hub', 'desc': 'TCS 206C(1H), Form 27EQ, TDS 26Q, E-Way', 'icon': Icons.shield, 'color': FinstaqColors.primaryBlue},
      {'title': 'Post-Dated Cheques (PDC)', 'desc': 'Maturity radar & 1-click active voucher promotion', 'icon': Icons.schedule, 'color': FinstaqColors.indigoAccent},
      {'title': 'Overdue Interest Engine', 'desc': '18% p.a. automated calculation & Debit Notes', 'icon': Icons.percent, 'color': FinstaqColors.warningAmber},
      {'title': 'Job Work & Subcontracting', 'desc': 'Section 143 challans & GST Form ITC-04 return', 'icon': Icons.local_shipping, 'color': FinstaqColors.creditGreen},
      {'title': 'HR & Indian Statutory Payroll', 'desc': 'CTC breakdown, EPF/ESIC opt-out, Attendance', 'icon': Icons.people, 'color': FinstaqColors.violetAccent},
      {'title': 'Bank Reconciliation (BRS)', 'desc': 'Auto-matching engine with bank Calibrated print', 'icon': Icons.account_balance, 'color': FinstaqColors.primaryBlue},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Enterprise ERP Modules'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: modules.length,
        itemBuilder: (context, index) {
          final m = modules[index];
          final color = m['color'] as Color;

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
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(m['icon'] as IconData, color: color, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m['title'] as String, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(m['desc'] as String, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
              ],
            ),
          );
        },
      ),
    );
  }
}