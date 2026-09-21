import 'package:flutter/material.dart';
import '../services/api_service.dart';

class QuickVoucherScreen extends StatefulWidget {
  final String defaultType;
  const QuickVoucherScreen({super.key, this.defaultType = 'RECEIPT'});

  @override
  State<QuickVoucherScreen> createState() => _QuickVoucherScreenState();
}

class _QuickVoucherScreenState extends State<QuickVoucherScreen> {
  final _formKey = GlobalKey<FormState>();
  late String _voucherType;
  final _partyController = TextEditingController(text: 'Acme Enterprises');
  final _amountController = TextEditingController();
  final _narrationController = TextEditingController();
  String _paymentMode = 'HDFC Bank';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _voucherType = widget.defaultType;
  }

  Future<void> _submitVoucher() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      await ApiService.postQuickVoucher({
        'type': _voucherType,
        'voucherNumber': 'MOB-${DateTime.now().millisecondsSinceEpoch % 10000}',
        'date': DateTime.now().toIso8601String().split('T')[0],
        'narration': _narrationController.text.trim(),
        'items': [
          {
            'ledgerId': '11111111-1111-1111-1111-111111111111',
            'debitAmount': double.parse(_amountController.text),
            'creditAmount': 0,
          },
          {
            'ledgerId': '22222222-2222-2222-2222-222222222222',
            'debitAmount': 0,
            'creditAmount': double.parse(_amountController.text),
          }
        ]
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF059669),
          content: Text('Voucher posted successfully!'),
        ),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving voucher: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Quick $_voucherType Entry'),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Voucher Type Toggle
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _voucherType = 'RECEIPT'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _voucherType == 'RECEIPT' ? const Color(0xFF059669) : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Receipt (Money In)',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _voucherType = 'SALES'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _voucherType == 'SALES' ? const Color(0xFF2563EB) : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Quick Sales Order',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Party / Customer Name
              TextFormField(
                controller: _partyController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Party / Customer Name',
                  labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
                validator: (v) => v!.isEmpty ? 'Party name is required' : null,
              ),
              const SizedBox(height: 16),

              // Amount
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  labelText: 'Amount (₹)',
                  labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  prefixText: '₹ ',
                  prefixStyle: const TextStyle(color: Color(0xFF34D399), fontSize: 20, fontWeight: FontWeight.bold),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
                validator: (v) => (double.tryParse(v ?? '') ?? 0) <= 0 ? 'Enter a valid amount' : null,
              ),
              const SizedBox(height: 16),

              // Payment Mode / Account
              DropdownButtonFormField<String>(
                value: _paymentMode,
                dropdownColor: const Color(0xFF1E293B),
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Account / Mode',
                  labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
                items: const [
                  DropdownMenuItem(value: 'HDFC Bank', child: Text('HDFC Bank Current A/c')),
                  DropdownMenuItem(value: 'Cash', child: Text('Cash in Hand')),
                  DropdownMenuItem(value: 'UPI / QR', child: Text('Instant UPI / QR')),
                ],
                onChanged: (v) => setState(() => _paymentMode = v!),
              ),
              const SizedBox(height: 16),

              // Narration
              TextFormField(
                controller: _narrationController,
                maxLines: 2,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Narration / Notes',
                  labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 28),

              // Save Button
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitVoucher,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text(
                        'Post Voucher Instantly',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
