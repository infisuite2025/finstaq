import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../core/widgets/finstaq_pill_tabs.dart';
import '../../../../models/approval_model.dart';

class ApprovalsScreen extends StatefulWidget {
  const ApprovalsScreen({super.key});

  @override
  State<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends State<ApprovalsScreen> {
  String _selectedTabId = 'pending';
  final List<ApprovalRequest> _pendingItems = [
    ApprovalRequest(
      id: 'APR-2026-089',
      docType: 'PAYMENT_VOUCHER',
      docTitle: 'Supplier Payout',
      docNumber: 'PAY-2026-089',
      amount: 650000.0,
      currency: 'INR',
      makerName: 'Ramesh Patel (Clerk)',
      makerRole: 'DATA_ENTRY',
      createdAt: '12 mins ago',
      status: ApprovalStatus.pending,
      reason: 'High-Value Payment > ₹5,00,000 threshold requirement',
    ),
    ApprovalRequest(
      id: 'APR-2026-090',
      docType: 'PURCHASE_BILL',
      docTitle: 'Raw Material Bill',
      docNumber: 'BILL-2026-442',
      amount: 420000.0,
      currency: 'INR',
      makerName: 'Ramesh Patel (Clerk)',
      makerRole: 'DATA_ENTRY',
      createdAt: '45 mins ago',
      status: ApprovalStatus.pending,
      reason: 'GRN Qty Match Variance exceeds 2% tolerance limit',
    ),
    ApprovalRequest(
      id: 'APR-2026-091',
      docType: 'JOURNAL_VOUCHER',
      docTitle: 'Backdated Adjustment',
      docNumber: 'JV-2026-018',
      amount: 175000.0,
      currency: 'INR',
      makerName: 'Priya Deshmukh (Accountant)',
      makerRole: 'ACCOUNTANT',
      createdAt: '2 hours ago',
      status: ApprovalStatus.pending,
      reason: 'Backdated entry by 4 days in closed sub-ledger',
    ),
  ];

  final List<ApprovalRequest> _historyItems = [
    ApprovalRequest(
      id: 'APR-2026-085',
      docType: 'PAYMENT_VOUCHER',
      docTitle: 'Vendor RTGS Transfer',
      docNumber: 'PAY-2026-085',
      amount: 890000.0,
      currency: 'INR',
      makerName: 'Ramesh Patel',
      makerRole: 'DATA_ENTRY',
      createdAt: 'Yesterday, 16:40',
      status: ApprovalStatus.approved,
      reason: 'Approved by Vikram Singhania (Owner) via Mobile Biometric',
      checkerName: 'Vikram Singhania',
    ),
    ApprovalRequest(
      id: 'APR-2026-082',
      docType: 'CREDIT_LIMIT_OVERRIDE',
      docTitle: 'Client Dispatch Clearance',
      docNumber: 'SO-2026-192',
      amount: 350000.0,
      currency: 'INR',
      makerName: 'Priya Deshmukh',
      makerRole: 'ACCOUNTANT',
      createdAt: '2 days ago',
      status: ApprovalStatus.rejected,
      reason: 'Rejected: Outstanding overdue exceeds 60 days limit',
      checkerName: 'Vikram Singhania',
      rejectionReason: 'Party overdue balance unpaid for 65 days',
    ),
  ];

  void _handleApprove(ApprovalRequest item) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text('Authorized ${item.docNumber} (${item.amount.toStringAsFixed(0)}) via 4-Eyes Principle'),
          ],
        ),
        backgroundColor: FinstaqColors.creditGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
    setState(() {
      _pendingItems.removeWhere((req) => req.id == item.id);
    });
  }

  void _handleReject(ApprovalRequest item) {
    showDialog(
      context: context,
      builder: (ctx) {
        String reason = '';
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Reject ${item.docNumber}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Please state the mandatory audit rejection reason:'),
              const SizedBox(height: 12),
              TextField(
                onChanged: (val) => reason = val,
                decoration: InputDecoration(
                  hintText: 'e.g. Rate discrepancy with Purchase Order',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: FinstaqColors.debitRed),
              onPressed: () {
                Navigator.pop(ctx);
                setState(() {
                  _pendingItems.removeWhere((req) => req.id == item.id);
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Rejected ${item.docNumber}: ${reason.isNotEmpty ? reason : "No reason given"}'),
                    backgroundColor: FinstaqColors.debitRed,
                  ),
                );
              },
              child: const Text('Confirm Rejection', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Maker-Checker Approval Hub', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: FinstaqPillTabs(
              tabs: [
                PillTabItem(id: 'pending', label: 'Pending Action', count: _pendingItems.length),
                PillTabItem(id: 'history', label: 'Audit Log', count: _historyItems.length),
              ],
              selectedTabId: _selectedTabId,
              onTabSelected: (tabId) => setState(() => _selectedTabId = tabId),
            ),
          ),
          Expanded(
            child: _selectedTabId == 'pending'
                ? _pendingItems.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.verified_user_outlined, size: 48, color: Colors.green.shade400),
                            const SizedBox(height: 12),
                            const Text('Zero Pending Approvals', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('All high-value vouchers authorized', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _pendingItems.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = _pendingItems[index];
                          return Card(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 1,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: FinstaqColors.primaryBlue.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          item.docType,
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: FinstaqColors.primaryBlue),
                                        ),
                                      ),
                                      Text(item.createdAt, style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(item.docTitle, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                  Text(item.docNumber, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                                  const SizedBox(height: 10),
                                  Text('₹ ${item.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: isDark ? Colors.grey.shade900 : Colors.amber.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.info_outline, size: 14, color: Colors.amber),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            item.reason,
                                            style: TextStyle(fontSize: 11, color: isDark ? Colors.amber.shade200 : Colors.amber.shade900),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: FinstaqColors.debitRed,
                                            side: const BorderSide(color: FinstaqColors.debitRed),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          icon: const Icon(Icons.close, size: 16),
                                          label: const Text('Reject'),
                                          onPressed: () => _handleReject(item),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: FinstaqColors.creditGreen,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          icon: const Icon(Icons.check, size: 16, color: Colors.white),
                                          label: const Text('Approve', style: TextStyle(color: Colors.white)),
                                          onPressed: () => _handleApprove(item),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _historyItems.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = _historyItems[index];
                      final isApproved = item.status == ApprovalStatus.approved;
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(item.docNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isApproved ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      isApproved ? 'AUTHORIZED' : 'REJECTED',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: isApproved ? FinstaqColors.creditGreen : FinstaqColors.debitRed,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text('₹ ${item.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(item.reason, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                            ],
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
