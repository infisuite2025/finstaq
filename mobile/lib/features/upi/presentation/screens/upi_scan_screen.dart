import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../services/api_service.dart';

class UpiScanScreen extends StatefulWidget {
  const UpiScanScreen({super.key});

  @override
  State<UpiScanScreen> createState() => _UpiScanScreenState();
}

class _UpiScanScreenState extends State<UpiScanScreen> {
  final _scanner = MobileScannerController();
  bool _handled = false;

  @override
  void dispose() {
    _scanner.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_handled) return;
    String? raw;
    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue;
      if (value != null && value.isNotEmpty) {
        raw = value;
        break;
      }
    }
    if (raw == null) return;
    final parsed = _parse(raw);
    if (parsed == null) return;
    _handled = true;
    await _scanner.stop();
    if (!mounted) return;
    final paid = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (context) => _PaySheet(vpa: parsed.vpa, name: parsed.name, amount: parsed.amount),
    );
    if (!mounted) return;
    if (paid == null) {
      _handled = false;
      await _scanner.start();
      return;
    }
    Navigator.pop(context, paid);
  }

  _ParsedUpi? _parse(String raw) {
    final text = raw.trim();
    final uri = Uri.tryParse(text);
    if (uri != null && uri.scheme == 'upi') {
      final vpa = uri.queryParameters['pa']?.trim() ?? '';
      if (vpa.isEmpty) return null;
      final amount = double.tryParse(uri.queryParameters['am'] ?? '');
      final name = Uri.decodeComponent(uri.queryParameters['pn'] ?? vpa);
      return _ParsedUpi(vpa, name, amount != null && amount > 0 ? amount : null);
    }
    if (RegExp(r'^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$').hasMatch(text)) {
      return _ParsedUpi(text, text, null);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan UPI & Pay')),
      body: Stack(
        children: [
          MobileScanner(controller: _scanner, onDetect: _onDetect),
          IgnorePointer(
            child: Center(
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 3),
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text(
                'Fit the UPI QR inside the box',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ParsedUpi {
  final String vpa;
  final String name;
  final double? amount;
  _ParsedUpi(this.vpa, this.name, this.amount);
}

class _PaySheet extends StatefulWidget {
  final String vpa;
  final String name;
  final double? amount;
  const _PaySheet({required this.vpa, required this.name, required this.amount});

  @override
  State<_PaySheet> createState() => _PaySheetState();
}

class _PaySheetState extends State<_PaySheet> {
  late final TextEditingController _amount = TextEditingController(
    text: widget.amount == null ? '' : widget.amount!.toStringAsFixed(2),
  );
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  Future<void> _pay() async {
    final amount = double.tryParse(_amount.text.trim()) ?? 0;
    if (amount <= 0) {
      setState(() => _error = 'Enter an amount greater than 0');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final check = await ApiService.getData('/upi/validate-vpa?vpa=${Uri.encodeQueryComponent(widget.vpa)}');
      if (check is Map && check['isValid'] == false) {
        throw ApiException(check['message']?.toString() ?? 'Invalid UPI ID');
      }
      await ApiService.postData('/upi/payout', {
        'payeeVpa': widget.vpa,
        'payeeName': widget.name,
        'amount': amount,
        'narration': 'Scanned UPI payment',
      });
      if (!mounted) return;
      Navigator.pop(context, 'Paid ₹ ${amount.toStringAsFixed(2)} to ${widget.vpa}');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 16 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(widget.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 4),
          Text(widget.vpa),
          const SizedBox(height: 16),
          TextField(
            controller: _amount,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'Amount (₹)', prefixText: '₹ '),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _busy ? null : _pay,
            child: _busy
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Pay'),
          ),
        ],
      ),
    );
  }
}
