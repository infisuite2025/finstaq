import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/amount_display.dart';
import '../../../../screens/login_screen.dart';
import '../../../../services/api_service.dart';
import '../../../more/presentation/screens/api_module_screen.dart';
import 'notifications_screen.dart';

class PulseScreen extends StatefulWidget {
  final void Function(String tab)? onOpenUpi;

  const PulseScreen({Key? key, this.onOpenUpi}) : super(key: key);

  @override
  State<PulseScreen> createState() => _PulseScreenState();
}

class _PulseScreenState extends State<PulseScreen> {
  double _cash = 0;
  List<String> _bankLines = [];
  double _interest = 0;
  int _interestBills = 0;
  double _upiIn = 0;
  int _upiInCount = 0;
  double _upiOut = 0;
  int _upiOutCount = 0;
  List<Map<String, String>> _events = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final banks = await _safe('/banking/bank-ledgers');
    final bills = await _safe('/interest/overdue');
    final txns = await _safe('/upi/transactions');
    final notes = await _safe('/communication/notifications?limit=20');
    final pdcs = await _safe('/pdc');
    final jobs = await _safe('/jobwork/challans');
    if (!mounted) return;

    final bankRows = _asList(banks);
    double cash = 0;
    final lines = <String>[];
    for (final row in bankRows) {
      final name = (row['name'] ?? 'Bank').toString();
      final bal = _num(row['currentBalance'] ?? row['balance']);
      cash += bal;
      if (lines.length < 2) lines.add('$name: ${_lakh(bal)}');
    }

    final billRows = _asList(bills);
    final interest = billRows.fold<double>(0, (s, b) => s + _num(b['calculatedInterestAmount']));

    final txnRows = _asList(txns);
    final inn = txnRows.where((t) => t['type'] == 'COLLECTION').toList();
    final out = txnRows.where((t) => t['type'] == 'PAYOUT').toList();

    final events = <Map<String, String>>[];
    final seen = <String>{};
    final noteRows = notes is Map ? _asList(notes['notifications']) : _asList(notes);
    void addEvent(Map<String, String> event) {
      final key = event['title'] ?? '';
      if (key.isEmpty || !seen.add(key) || events.length >= 3) return;
      events.add(event);
    }
    for (final n in noteRows) {
      addEvent({
        'title': (n['title'] ?? 'Notification').toString().split(':').first.trim(),
        'subtitle': (n['message'] ?? '').toString(),
        'time': '',
      });
    }
    for (final p in _asList(pdcs)) {
      addEvent({
        'title': 'PDC ${p['pdcNumber'] ?? ''}'.trim(),
        'subtitle': '${p['partyName'] ?? ''} · ₹ ${_num(p['amount']).toStringAsFixed(0)}',
        'time': (p['status'] ?? '').toString(),
      });
    }
    for (final j in _asList(jobs)) {
      addEvent({
        'title': (j['challanNumber'] ?? 'Job work').toString(),
        'subtitle': (j['jobWorkerName'] ?? '').toString(),
        'time': (j['status'] ?? '').toString(),
      });
    }

    setState(() {
      _cash = cash;
      _bankLines = lines;
      _interest = interest;
      _interestBills = billRows.length;
      _upiIn = inn.fold<double>(0, (s, t) => s + _num(t['amount']));
      _upiInCount = inn.length;
      _upiOut = out.fold<double>(0, (s, t) => s + _num(t['amount']));
      _upiOutCount = out.length;
      _events = events;
      _loading = false;
    });
  }

  Future<dynamic> _safe(String path) async {
    try {
      return await ApiService.getData(path);
    } catch (_) {
      return null;
    }
  }

  List<Map<String, dynamic>> _asList(dynamic data) {
    if (data is List) {
      return data.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    }
    if (data is Map && data['items'] is List) return _asList(data['items']);
    if (data is Map && data['challans'] is List) return _asList(data['challans']);
    return [];
  }

  double _num(dynamic v) => v is num ? v.toDouble() : double.tryParse('$v') ?? 0;

  String _lakh(double n) {
    if (n.abs() >= 100000) return '₹ ${(n / 100000).toStringAsFixed(2)} L';
    return '₹ ${n.toStringAsFixed(0)}';
  }

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
          const NotificationBell(),
          IconButton(
            tooltip: 'Log out',
            icon: const Icon(Icons.logout),
            onPressed: () async {
              final leave = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Log out'),
                  content: const Text('Sign out of this phone?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                    TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Log out')),
                  ],
                ),
              );
              if (leave != true || !context.mounted) return;
              await ApiService.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (_) => false,
              );
            },
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
                AmountDisplay(
                  amount: _cash,
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 16),
                Container(height: 1, color: Colors.white24),
                const SizedBox(height: 12),
                Text(
                  _loading ? 'Loading bank balances…' : (_bankLines.isEmpty ? 'No bank ledgers' : _bankLines.join('   ')),
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Overdue Radar & Interest Alert
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const ApiModuleScreen(
                    title: 'Overdue Interest Engine',
                    path: '/interest/overdue',
                  ),
                ),
              );
            },
            child: Container(
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
                      Text(
                        _loading ? 'Loading overdue interest…' : '₹ ${_interest.toStringAsFixed(0)} accrued across $_interestBills bills',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.grey),
              ],
            ),
          ),
          ),
          const SizedBox(height: 18),

          // Today's UPI Inflow / Outflow
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => widget.onOpenUpi?.call('collect'),
                  child: SizedBox(
                    height: 118,
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
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: AmountDisplay(amount: _upiIn, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                          ),
                          const Spacer(),
                          Text('$_upiInCount Collections', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () => widget.onOpenUpi?.call('payout'),
                  child: SizedBox(
                    height: 118,
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
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: AmountDisplay(amount: _upiOut, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                          ),
                          const Spacer(),
                          Text(_upiOutCount == 1 ? '1 Payout' : '$_upiOutCount Payouts', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          const Text('Live Operations Stream', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),

          // Activity cards
          if (_events.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(_loading ? 'Loading…' : 'No live events yet.', style: TextStyle(color: Colors.grey.shade500)),
            ),
          ..._events.map((act) => Container(
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
                    color: FinstaqColors.primaryBlue.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.notifications_none, color: FinstaqColors.primaryBlue, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(act['title'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      Text(act['subtitle'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
                Text(act['time'] ?? '', style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
              ],
            ),
          )),
        ],
      ),
    );
  }
}