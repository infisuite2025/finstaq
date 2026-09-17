class DashboardSummary {
  final double cashBalance;
  final double bankBalance;
  final double pendingReceivables;
  final double pendingPayables;
  final double todaySales;
  final double monthSales;
  final int pendingBillsCount;

  DashboardSummary({
    required this.cashBalance,
    required this.bankBalance,
    required this.pendingReceivables,
    required this.pendingPayables,
    required this.todaySales,
    required this.monthSales,
    required this.pendingBillsCount,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      cashBalance: (json['cashBalance'] as num?)?.toDouble() ?? 0.0,
      bankBalance: (json['bankBalance'] as num?)?.toDouble() ?? 0.0,
      pendingReceivables: (json['pendingReceivables'] as num?)?.toDouble() ?? 0.0,
      pendingPayables: (json['pendingPayables'] as num?)?.toDouble() ?? 0.0,
      todaySales: (json['todaySales'] as num?)?.toDouble() ?? 0.0,
      monthSales: (json['monthSales'] as num?)?.toDouble() ?? 0.0,
      pendingBillsCount: (json['pendingBillsCount'] as num?)?.toInt() ?? 0,
    );
  }

  factory DashboardSummary.mock() {
    return DashboardSummary(
      cashBalance: 48500.0,
      bankBalance: 342000.0,
      pendingReceivables: 185000.0,
      pendingPayables: 64200.0,
      todaySales: 78500.0,
      monthSales: 1420000.0,
      pendingBillsCount: 3,
    );
  }
}
