import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/amount_display.dart';
import '../../../../core/widgets/finstaq_pill_tabs.dart';
import '../../../../services/api_service.dart';

class BooksScreen extends StatefulWidget {
  const BooksScreen({Key? key}) : super(key: key);

  @override
  State<BooksScreen> createState() => _BooksScreenState();
}

class _BooksScreenState extends State<BooksScreen> {
  String _selectedTab = 'all';
  bool _loading = true;
  String? _error;
  String _search = '';
  List<Map<String, dynamic>> _vouchers = [];
  final _searchController = TextEditingController();

  static const _typeByTab = {
    'sales': 'SALES',
    'purchase': 'PURCHASE',
    'receipt': 'RECEIPT',
    'payment': 'PAYMENT',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      const path = '/accounting/vouchers?limit=50';
      final data = await ApiService.getData(path);
      final list = data is Map ? data['vouchers'] : null;
      setState(() {
        _vouchers = list is List
            ? list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList()
            : [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _openFilter() {
    const options = [
      ['all', 'All Vouchers'],
      ['sales', 'Sales'],
      ['purchase', 'Purchases'],
      ['receipt', 'Receipts'],
      ['payment', 'Payments'],
    ];
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final option in options)
                ListTile(
                  title: Text(option[1]),
                  trailing: _selectedTab == option[0] ? const Icon(Icons.check) : null,
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _selectedTab = option[0]);
                  },
                ),
            ],
          ),
        );
      },
    );
  }

  bool _matches(Map<String, dynamic> voucher, String query) {
    final parts = <String>[
      voucher['voucherNumber']?.toString() ?? '',
      voucher['narration']?.toString() ?? '',
      voucher['type']?.toString() ?? '',
      voucher['date']?.toString() ?? '',
    ];
    final items = voucher['items'];
    if (items is List) {
      for (final item in items) {
        if (item is Map) parts.add(item['ledgerName']?.toString() ?? '');
      }
    }
    return parts.join(' ').toLowerCase().contains(query);
  }

  List<Map<String, dynamic>> get _matched {
    final query = _search.trim().toLowerCase();
    if (query.isEmpty) return _vouchers;
    return _vouchers.where((voucher) => _matches(voucher, query)).toList();
  }

  int _count(String tab) {
    final rows = _matched;
    if (tab == 'all') return rows.length;
    final type = _typeByTab[tab];
    return rows.where((v) => v['type'] == type).length;
  }

  List<Map<String, dynamic>> get _visible {
    final type = _typeByTab[_selectedTab];
    final rows = _matched;
    if (type == null) return rows;
    return rows.where((v) => v['type'] == type).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final tabs = [
      PillTabItem(id: 'all', label: 'All Vouchers', count: _count('all')),
      PillTabItem(id: 'sales', label: 'Sales (Tax Invoices)', count: _count('sales')),
      PillTabItem(id: 'purchase', label: 'Purchases (3-Way)', count: _count('purchase')),
      PillTabItem(id: 'receipt', label: 'UPI & Bank Receipts', count: _count('receipt')),
      PillTabItem(id: 'payment', label: 'Vendor Payouts', count: _count('payment')),
    ];
    final rows = _visible;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Books & Registers'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: _openFilter),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _search = value),
              decoration: InputDecoration(
                hintText: 'Search voucher, ledger or narration',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _search.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _search = '');
                        },
                      ),
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: FinstaqColors.primaryBlue),
                ),
                isDense: true,
              ),
            ),
          ),
          FinstaqPillTabs(
            tabs: tabs,
            selectedTabId: _selectedTab,
            onTabSelected: (id) => setState(() => _selectedTab = id),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? _Message(text: _error!, onRetry: _load)
                    : rows.isEmpty
                        ? _Message(text: _search.trim().isEmpty ? 'No vouchers on this register.' : 'No vouchers match this search.')
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            itemCount: rows.length,
                            itemBuilder: (context, index) {
                              final v = rows[index];
                              final type = (v['type'] ?? '').toString();
                              final isSale = type == 'SALES' || type == 'RECEIPT';
                              final amount = (v['totalDebit'] as num?)?.toDouble() ?? 0;
                              final items = v['items'];
                              final party = items is List && items.isNotEmpty && items.first is Map
                                  ? (items.first['ledgerName'] ?? '').toString()
                                  : (v['narration'] ?? type).toString();

                              return Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(18),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => _VoucherDetailScreen(voucher: v)),
                                    );
                                  },
                                  child: Container(
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
                                          Text(party.isEmpty ? type : party, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${v['voucherNumber'] ?? ''} • $type',
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
                                        Text('${v['date'] ?? ''}', style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
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

class _VoucherDetailScreen extends StatelessWidget {
  final Map<String, dynamic> voucher;
  const _VoucherDetailScreen({required this.voucher});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final items = voucher['items'];
    final lines = items is List ? items.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList() : <Map<String, dynamic>>[];
    final type = (voucher['type'] ?? '').toString();
    final amount = (voucher['totalDebit'] as num?)?.toDouble() ?? 0;

    return Scaffold(
      appBar: AppBar(title: Text((voucher['voucherNumber'] ?? 'Voucher').toString())),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(type, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
          const SizedBox(height: 4),
          Text((voucher['date'] ?? '').toString(), style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
          const SizedBox(height: 12),
          AmountDisplay(amount: amount, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          if ((voucher['narration'] ?? '').toString().isNotEmpty) ...[
            const SizedBox(height: 16),
            Text((voucher['narration'] ?? '').toString()),
          ],
          const SizedBox(height: 20),
          const Text('Ledger lines', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          for (final line in lines)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? FinstaqColors.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text((line['ledgerName'] ?? '').toString(), style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text((line['ledgerGroup'] ?? '').toString(), style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (((line['debitAmount'] as num?) ?? 0) > 0)
                        Text('Dr ${((line['debitAmount'] as num?) ?? 0).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      if (((line['creditAmount'] as num?) ?? 0) > 0)
                        Text('Cr ${((line['creditAmount'] as num?) ?? 0).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _Message extends StatelessWidget {
  final String text;
  final VoidCallback? onRetry;
  const _Message({required this.text, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(text, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 12),
              TextButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ],
        ),
      ),
    );
  }
}
