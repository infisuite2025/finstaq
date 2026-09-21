export type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';

export type DocumentType =
  | 'PO'
  | 'GRN'
  | 'VENDOR_BILL'
  | 'PURCHASE_INVOICE'
  | 'SO'
  | 'DO'
  | 'SALES_INVOICE'
  | 'JV'
  | 'DEBIT_NOTE'
  | 'CREDIT_NOTE'
  | 'PURCHASE_RETURN'
  | 'SALES_RETURN'
  | 'PAYMENT'
  | 'RECEIPT'
  | string;

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';

export interface MakerCheckerRule {
  id: string;
  tenantId: string;
  docType: DocumentType;
  docTitle: string;
  module: string;
  isEnabled: boolean;
  thresholdAmount: number;
  requireDistinctChecker: boolean;
  allowedRoles: UserRole[];
  defaultMakerRole: UserRole;
  description: string;
  workflowSummary: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  docType: DocumentType;
  docTitle: string;
  docNumber: string;
  docId: string;
  amount: number;
  currency: string;
  makerId: string;
  makerName: string;
  makerRole: UserRole | string;
  makerEmail?: string;
  status: ApprovalStatus;
  checkerId?: string;
  checkerName?: string;
  checkerRole?: UserRole | string;
  checkerEmail?: string;
  remarks?: string;
  rejectionReason?: string;
  decidedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ApprovalStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  autoApprovedCount: number;
  rulesConfiguredCount: number;
}
