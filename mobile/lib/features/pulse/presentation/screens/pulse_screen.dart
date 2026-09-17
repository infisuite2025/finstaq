import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/amount_display.dart';

class PulseScreen extends StatelessWidget {
  const PulseScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: FinstaqColors.primaryBlue,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text(
                  'F',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Apex Industries Ltd.', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                Text('FY 2026-27 • Live Core', style: TextStyle(fontSize: 11, color: isDark ? FinstaqColors.darkTextSecondary : FinstaqColors.lightTextSecondary)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Cash & Bank Position Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E3A8A), Color(0xFF2563EB), Color(0xFF3B82F6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2563EB).withOpacity(0.35),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'TOTAL LIQUID CASH & BANK',
                      style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.shield, color: Colors.white, size: 12),
                          SizedBox(width: 4),
                          Text('Reconciled', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const AmountDisplay(
                  amount: 14285400.00,
                  style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 16),
                Container(height: 1, color: Colors.white24),
                const SizedBox(height: 12),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('HDFC Bank: ₹ 84.50 L', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('ICICI Bank: ₹ 58.35 L', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Overdue Radar & Interest Alert
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? FinstaqColors.darkCard : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: FinstaqColors.warningAmberLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.percent, color: FinstaqColors.warningAmber, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Overdue Interest Radar', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text('₹ 84,250 accrued @18% p.a. across 8 customer invoices', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.grey),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Today's UPI Inflow / Outflow
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? FinstaqColors.darkCard : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.arrow_downward, color: FinstaqColors.creditGreen, size: 16),
                          SizedBox(width: 4),
                          Text('UPI INFLOW', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: FinstaqColors.creditGreen)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const AmountDisplay(amount: 345000, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                      Text('12 Collections', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? FinstaqColors.darkCard : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.arrow_upward, color: FinstaqColors.debitRed, size: 16),
                          SizedBox(width: 4),
                          Text('UPI OUTFLOW', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: FinstaqColors.debitRed)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const AmountDisplay(amount: 182000, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                      Text('6 Vendor Payouts', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          const Text('Live Operations Stream', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),

          // Activity cards
          ...[
            {'title': 'TCS u/s 206C(1H) Triggered', 'subtitle': 'Reliance Retail crossed ₹50L aggregate limit', 'time': '10 mins ago', 'icon': Icons.account_balance, 'color': FinstaqColors.indigoAccent},
            {'title': 'Job Work Challan Dispatched', 'subtitle': 'JWC/2026/04/001 to Precision Engineering', 'time': '1 hour ago', 'icon': Icons.local_shipping, 'color': FinstaqColors.primaryBlue},
            {'title': 'PDC Cheque Matured', 'subtitle': '₹1,50,000 from Tata Motors ready for promotion', 'time': '2 hours ago', 'icon': Icons.schedule, 'color': FinstaqColors.creditGreen},
          ].map((act) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? FinstaqColors.darkCard : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (act['color'] as Color).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(act['icon'] as IconData, color: act['color'] as Color, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(act['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      Text(act['subtitle'] as String, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
                Text(act['time'] as String, style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
              ],
            ),
          )),
        ],
      ),
    );
  }
}