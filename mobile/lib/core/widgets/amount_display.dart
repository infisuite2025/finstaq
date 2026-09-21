import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AmountDisplay extends StatelessWidget {
  final double amount;
  final TextStyle? style;
  final bool showCurrency;
  final bool isCredit;
  final bool isDebit;

  const AmountDisplay({
    Key? key,
    required this.amount,
    this.style,
    this.showCurrency = true,
    this.isCredit = false,
    this.isDebit = false,
  }) : super(key: key);

  String _formatIndianCurrency(double val) {
    final format = NumberFormat.currency(
      locale: 'en_IN',
      symbol: showCurrency ? '₹ ' : '',
      decimalDigits: 2,
    );
    return format.format(val);
  }

  @override
  Widget build(BuildContext context) {
    Color? color = style?.color;
    if (isCredit) color = const Color(0xFF10B981);
    if (isDebit) color = const Color(0xFFEF4444);

    return Text(
      _formatIndianCurrency(amount),
      style: (style ?? const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)).copyWith(
        color: color,
        fontFamily: 'monospace',
      ),
    );
  }
}