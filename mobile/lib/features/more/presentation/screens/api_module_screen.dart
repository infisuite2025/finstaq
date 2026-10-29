import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../services/api_service.dart';

/// Lists whatever the same web API returns. Used by More and the + actions.
class ApiModuleScreen extends StatefulWidget {
  final String title;
  final String path;

  const ApiModuleScreen({Key? key, required this.title, required this.path}) : super(key: key);

  @override
  State<ApiModuleScreen> createState() => _ApiModuleScreenState();
}

class _ApiModuleScreenState extends State<ApiModuleScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _rows = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.getData(widget.path);
      var rows = _flatten(data);
      if (widget.path.contains('attendance')) {
        rows = await _withEmployeeNames(rows);
      }
      setState(() {
        _rows = rows;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _flatten(dynamic data) {
    if (data is List) {
      return data.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    }
    if (data is Map) {
      for (final key in ['vouchers', 'items', 'employees', 'challans', 'ledgers', 'sections', 'records']) {
        final value = data[key];
        if (value is List) {
          return value.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        }
      }
      return [Map<String, dynamic>.from(data)];
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> _withEmployeeNames(List<Map<String, dynamic>> rows) async {
    try {
      final employees = _flatten(await ApiService.getData('/payroll/employees'));
      final byId = {for (final employee in employees) employee['id']?.toString(): employee};
      return rows.map((row) {
        final employee = byId[row['employeeId']?.toString()];
        final calendar = (row['totalCalendarDays'] as num?)?.toInt() ?? 0;
        final lop = (row['lopDays'] as num?)?.toInt() ?? 0;
        return {
          ...row,
          'name': employee?['name'] ?? row['employeeId'],
          'department': employee?['department'],
          'netPayableDays': calendar - lop,
        };
      }).toList();
    } catch (_) {
      return rows;
    }
  }

  static const _hiddenKeys = {
    'id',
    'tenantId',
    'partyId',
    'createdAt',
    'updatedAt',
    'group',
    'autoSequenceNumber',
    'emergencyContact',
    'currentAddress',
    'permanentAddress',
  };

  static const _moneyKeys = {
    'amount',
    'billAmount',
    'paidAmount',
    'outstandingAmount',
    'calculatedInterestAmount',
    'openingBalance',
    'currentBalance',
    'singleThreshold',
    'aggregateThreshold',
    'taxableValue',
  };

  List<String> get _preferredKeys {
    final path = widget.path;
    if (path.contains('tds')) {
      return ['description', 'defaultRateIndHuf', 'defaultRateCorporate', 'singleThreshold', 'aggregateThreshold', 'defaultPayableLedgerName'];
    }
    if (path.contains('pdc')) {
      return ['pdcNumber', 'chequeNumber', 'chequeDate', 'bankName', 'voucherType', 'partyType', 'amount', 'status', 'purposeOrNarration'];
    }
    if (path.contains('interest')) {
      return ['billNumber', 'billDate', 'dueDate', 'partyType', 'outstandingAmount', 'overdueDays', 'annualInterestRate', 'calculatedInterestAmount', 'debitNoteStatus'];
    }
    if (path.contains('jobwork')) {
      return ['challanNumber', 'challanDate', 'jobWorkerGstin', 'natureOfProcessing', 'expectedReturnDate', 'status'];
    }
    if (path.contains('attendance')) {
      return ['department', 'totalCalendarDays', 'presentDays', 'paidLeaves', 'lopDays', 'netPayableDays'];
    }
    if (path.contains('payroll')) {
      return ['empCode', 'designation', 'department', 'phone', 'workLocation', 'status', 'dateOfJoining'];
    }
    if (path.contains('bank')) {
      return ['bankName', 'bankAccount', 'ifscCode', 'branch', 'accountType', 'currentBalance', 'isActive'];
    }
    return [];
  }

  String _titleOf(Map<String, dynamic> row) {
    final titleKeys = widget.path.contains('bank')
        ? ['name', 'bankName']
        : ['sectionCode', 'partyName', 'jobWorkerName', 'name', 'employeeName', 'challanNumber', 'billNumber', 'bankName', 'voucherNumber'];
    for (final key in titleKeys) {
      final value = row[key];
      if (value != null && value.toString().trim().isNotEmpty) return value.toString();
    }
    return 'Record';
  }

  String _label(String key) {
    const names = {
      'defaultRateIndHuf': 'Individual / HUF rate',
      'defaultRateCorporate': 'Company rate',
      'singleThreshold': 'Single bill limit',
      'aggregateThreshold': 'Yearly limit',
      'defaultPayableLedgerName': 'Payable ledger',
      'pdcNumber': 'PDC number',
      'chequeNumber': 'Cheque number',
      'chequeDate': 'Cheque date',
      'bankName': 'Bank',
      'voucherType': 'Type',
      'partyType': 'Party',
      'purposeOrNarration': 'Narration',
      'billNumber': 'Bill',
      'billDate': 'Bill date',
      'dueDate': 'Due date',
      'outstandingAmount': 'Outstanding',
      'overdueDays': 'Overdue days',
      'annualInterestRate': 'Interest rate',
      'calculatedInterestAmount': 'Interest',
      'debitNoteStatus': 'Debit note',
      'challanNumber': 'Challan',
      'challanDate': 'Challan date',
      'jobWorkerGstin': 'GSTIN',
      'natureOfProcessing': 'Work',
      'expectedReturnDate': 'Expected return',
      'empCode': 'Employee code',
      'dateOfJoining': 'Joined',
      'workLocation': 'Location',
      'totalCalendarDays': 'Calendar days',
      'presentDays': 'Present days',
      'paidLeaves': 'Paid leaves',
      'lopDays': 'LOP days',
      'netPayableDays': 'Net payable days',
      'bankAccount': 'Account',
      'ifscCode': 'IFSC',
      'accountType': 'Account type',
      'currentBalance': 'Balance',
      'isActive': 'Active',
    };
    return names[key] ?? key;
  }

  String _format(String key, dynamic value) {
    if (value is bool) return value ? 'Yes' : 'No';
    if (value is num && (_moneyKeys.contains(key) || key.toLowerCase().contains('amount') || key.toLowerCase().contains('balance'))) {
      return '₹ ${value.toStringAsFixed(value is int ? 0 : 2)}';
    }
    if (value is num && key.toLowerCase().contains('rate')) return '$value%';
    return value.toString().replaceAll('_', ' ');
  }

  List<MapEntry<String, String>> _facts(Map<String, dynamic> row) {
    final facts = <MapEntry<String, String>>[];
    final used = <String>{};
    void add(String key) {
      if (used.contains(key) || _hiddenKeys.contains(key)) return;
      final value = row[key];
      if (value == null || value is Map || value is List) return;
      final text = _format(key, value).trim();
      if (text.isEmpty) return;
      used.add(key);
      facts.add(MapEntry(_label(key), text));
    }

    for (final key in _preferredKeys) {
      add(key);
    }
    if (facts.isEmpty) {
      for (final key in row.keys) {
        add(key);
        if (facts.length == 6) break;
      }
    }
    final items = row['items'];
    if (items is List && items.isNotEmpty) {
      facts.add(MapEntry('Items', '${items.length} line${items.length == 1 ? '' : 's'}'));
    }
    return facts;
  }

  String? _highlight(Map<String, dynamic> row) {
    for (final key in ['amount', 'currentBalance', 'outstandingAmount', 'calculatedInterestAmount']) {
      final value = row[key];
      if (value == null) continue;
      return _format(key, value);
    }
    final ind = row['defaultRateIndHuf'];
    final corp = row['defaultRateCorporate'];
    if (ind != null && corp != null) return '$ind% / $corp%';
    return null;
  }

  String _summary(Map<String, dynamic> row) {
    for (final key in ['description', 'purposeOrNarration', 'natureOfProcessing', 'designation', 'department', 'branch']) {
      final value = row[key];
      if (value != null && value.toString().trim().isNotEmpty) return value.toString();
    }
    final bank = row['bankName'];
    final cheque = row['chequeNumber'];
    if (bank != null && cheque != null) return '$cheque • $bank';
    final bill = row['billNumber'];
    if (bill != null) return bill.toString();
    final code = row['empCode'];
    if (code != null) return code.toString();
    return '';
  }

  void _openDetails(Map<String, dynamic> row) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _ModuleDetailScreen(
          title: _titleOf(row),
          facts: _facts(row),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!, textAlign: TextAlign.center)))
              : _rows.isEmpty
                  ? const Center(child: Text('No records from the API.'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _rows.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final row = _rows[index];
                        final isDark = Theme.of(context).brightness == Brightness.dark;
                        final summary = _summary(row);
                        final highlight = _highlight(row);
                        return Material(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => _openDetails(row),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(_titleOf(row), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                        if (summary.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          Text(summary, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, height: 1.3, color: Colors.grey.shade500)),
                                        ],
                                      ],
                                    ),
                                  ),
                                  if (highlight != null) ...[
                                    const SizedBox(width: 12),
                                    Text(highlight, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                                  ],
                                  const SizedBox(width: 4),
                                  Icon(Icons.chevron_right, size: 18, color: Colors.grey.shade500),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}

class _ModuleDetailScreen extends StatelessWidget {
  final String title;
  final List<MapEntry<String, String>> facts;

  const _ModuleDetailScreen({
    required this.title,
    required this.facts,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final fact in facts)
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
                  SizedBox(
                    width: 118,
                    child: Text(fact.key, style: TextStyle(fontSize: 12, height: 1.35, color: Colors.grey.shade500)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(fact.value, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w700, height: 1.35)),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
