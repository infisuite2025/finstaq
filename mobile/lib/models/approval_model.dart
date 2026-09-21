enum ApprovalStatus { pending, approved, rejected, autoApproved }

class ApprovalRequest {
  final String id;
  final String docType;
  final String docTitle;
  final String docNumber;
  final double amount;
  final String currency;
  final String makerName;
  final String makerRole;
  final String createdAt;
  final ApprovalStatus status;
  final String reason;
  final String? checkerName;
  final String? rejectionReason;

  ApprovalRequest({
    required this.id,
    required this.docType,
    required this.docTitle,
    required this.docNumber,
    required this.amount,
    required this.currency,
    required this.makerName,
    required this.makerRole,
    required this.createdAt,
    required this.status,
    required this.reason,
    this.checkerName,
    this.rejectionReason,
  });

  factory ApprovalRequest.fromJson(Map<String, dynamic> json) {
    return ApprovalRequest(
      id: json['id'] ?? '',
      docType: json['docType'] ?? 'PAYMENT',
      docTitle: json['docTitle'] ?? 'Payment Voucher',
      docNumber: json['docNumber'] ?? 'DOC-001',
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'INR',
      makerName: json['makerName'] ?? 'Ramesh Patel',
      makerRole: json['makerRole'] ?? 'DATA_ENTRY',
      createdAt: json['createdAt'] ?? 'Just now',
      status: json['status'] == 'APPROVED'
          ? ApprovalStatus.approved
          : json['status'] == 'REJECTED'
              ? ApprovalStatus.rejected
              : ApprovalStatus.pending,
      reason: json['metadata']?['triggerReason'] ?? 'Threshold > ₹50,000 (4-Eyes Principle)',
      checkerName: json['checkerName'],
      rejectionReason: json['rejectionReason'],
    );
  }
}
