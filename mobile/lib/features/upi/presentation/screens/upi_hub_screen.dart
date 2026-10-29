import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/amount_display.dart';
import '../../../../core/widgets/finstaq_pill_tabs.dart';
import '../../../../services/api_service.dart';

class UpiTabBus {
  final ValueNotifier<int> ticks = ValueNotifier<int>(0);
  String tab = 'qr';

  void open(String next) {
    tab = next;
    ticks.value++;
  }

  void dispose() => ticks.dispose();
}

class UpiHubScreen extends StatefulWidget {
  final UpiTabBus? tabRequest;

  const UpiHubScreen({Key? key, this.tabRequest}) : super(key: key);

  @override
  State<UpiHubScreen> createState() => _UpiHubScreenState();
}

class _UpiHubScreenState extends State<UpiHubScreen> {
  String _selectedTab = 'qr';
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _txns = [];
  List<Map<String, dynamic>> _vpas = [];
  String? _upiUri;
  String? _payeeVpa;
  String? _reference;

  final List<PillTabItem> _tabs = [
    PillTabItem(id: 'qr', label: 'Dynamic QR Generator', icon: Icons.qr_code_2),
    PillTabItem(id: 'collect', label: 'Instant Collect', icon: Icons.call_received),
    PillTabItem(id: 'payout', label: 'Vendor Payout', icon: Icons.call_made),
    PillTabItem(id: 'directory', label: 'VPA Directory', icon: Icons.contacts),
  ];

  @override
  void initState() {
    super.initState();
    widget.tabRequest?.ticks.addListener(_applyRequestedTab);
    _load();
  }

  @override
  void dispose() {
    widget.tabRequest?.ticks.removeListener(_applyRequestedTab);
    super.dispose();
  }

  void _applyRequestedTab() {
    final next = widget.tabRequest?.tab;
    if (next == null || next == _selectedTab) return;
    setState(() => _selectedTab = next);
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final txns = await ApiService.getData('/upi/transactions');
      final vpas = await ApiService.getData('/upi/vpa-directory');
      final qr = await ApiService.postData('/upi/generate-qr', {
        'payeeVpa': 'finstaq.enterprises@hdfcbank',
        'payeeName': 'FINSTAQ ENTERPRISES LTD',
        'amount': 0,
        'narration': 'FINSTAQ B2B Payment',
      });
      final payload = qr is Map ? qr['qrPayload'] : null;
      setState(() {
        _txns = _asMaps(txns);
        _vpas = _asMaps(vpas);
        _upiUri = qr is Map ? qr['upiUri']?.toString() : null;
        _reference = qr is Map ? qr['displayReference']?.toString() : null;
        _payeeVpa = payload is Map ? payload['payeeVpa']?.toString() : null;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _asMaps(dynamic data) {
    if (data is! List) return [];
    return data.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('UPI Payments & Collections'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
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
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!, textAlign: TextAlign.center)))
                    : _selectedTab == 'qr'
                        ? _qrCard(isDark)
                        : _selectedTab == 'directory'
                            ? _partyList(_vpas, (m) => m['partyName']?.toString() ?? '', (m) => m['vpa']?.toString() ?? '')
                            : _txnList(_selectedTab == 'collect' ? 'COLLECTION' : 'PAYOUT'),
          ),
        ],
      ),
    );
  }

  Widget _qrCard(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? FinstaqColors.darkCard : Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: _upiUri == null
                    ? const Icon(Icons.qr_code_2, size: 160, color: FinstaqColors.primaryBlue)
                    : QrImageView(data: _upiUri!, size: 180, backgroundColor: Colors.white),
              ),
              const SizedBox(height: 16),
              Text(
                _payeeVpa ?? '',
                style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text('Ref ${_reference ?? ''}', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _txnList(String type) {
    final rows = _txns.where((t) => t['type'] == type).toList();
    if (rows.isEmpty) return const Center(child: Text('No UPI transactions yet.'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: rows.length,
      itemBuilder: (context, index) {
        final t = rows[index];
        final amount = (t['amount'] as num?)?.toDouble() ?? 0;
        final name = t['payeeOrPayerName']?.toString() ?? '';
        return _UpiCard(
          title: name,
          subtitle: t['vpa']?.toString() ?? '',
          trailing: AmountDisplay(amount: amount, isCredit: type == 'COLLECTION', isDebit: type == 'PAYOUT'),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => _UpiDetailScreen(
                title: name,
                rows: [
                  ['UPI ID', t['vpa']],
                  ['Amount', '₹ ${amount.toStringAsFixed(2)}'],
                  ['Status', t['status']],
                  ['Type', t['type']],
                  ['Channel', t['channel']],
                  ['Invoice', t['invoiceNumber']],
                  ['Reference', t['transactionRef']],
                  ['Bank RRN', t['bankRrn']],
                  ['Voucher', t['voucherNumber']],
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _partyList(List<Map<String, dynamic>> rows, String Function(Map) title, String Function(Map) subtitle) {
    if (rows.isEmpty) return const Center(child: Text('No UPI IDs saved.'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: rows.length,
      itemBuilder: (context, index) {
        final row = rows[index];
        final name = title(row);
        return _UpiCard(
          title: name,
          subtitle: subtitle(row),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => _UpiDetailScreen(
                title: name,
                rows: [
                  ['UPI ID', row['vpa']],
                  ['Party type', row['partyType']],
                  ['Default', row['isDefault'] == true ? 'Yes' : 'No'],
                  ['Verified', row['isVerified'] == true ? 'Yes' : 'No'],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _UpiCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const _UpiCard({required this.title, required this.subtitle, this.trailing, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: isDark ? FinstaqColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      if (subtitle.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                      ],
                    ],
                  ),
                ),
                if (trailing != null) ...[
                  const SizedBox(width: 8),
                  trailing!,
                ],
                Icon(Icons.chevron_right, size: 18, color: Colors.grey.shade500),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _UpiDetailScreen extends StatelessWidget {
  final String title;
  final List<List<dynamic>> rows;

  const _UpiDetailScreen({required this.title, required this.rows});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final visible = rows.where((row) => row[1] != null && row[1].toString().trim().isNotEmpty).toList();
    return Scaffold(
      appBar: AppBar(title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final row in visible)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? FinstaqColors.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(width: 110, child: Text(row[0].toString(), style: TextStyle(fontSize: 12, color: Colors.grey.shade500))),
                  const SizedBox(width: 12),
                  Expanded(child: Text(row[1].toString().replaceAll('_', ' '), textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w700, height: 1.35))),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
