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

  factory DashboardSummary.empty() {
    return DashboardSummary(
      cashBalance: 0,
      bankBalance: 0,
      pendingReceivables: 0,
      pendingPayables: 0,
      todaySales: 0,
      monthSales: 0,
      pendingBillsCount: 0,
    );
  }
}
