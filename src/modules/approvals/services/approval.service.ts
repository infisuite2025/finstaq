// @ts-nocheck
import { ApprovalRequest, ApprovalStats, DocumentType, MakerCheckerRule } from '../types/approval.types';
import { AuditService } from '../../audit/services/audit.service';
import { AppError } from '../../../core/errors/app-error';
import { prisma } from '../../../core/database/prisma';

/**
 * 90% Out-of-the-box Best Practice Defaults for 3-Role Standard SME RBAC:
 * - DATA_ENTRY (Ramesh): Pure Maker for day-to-day operations
 * - ACCOUNTANT (Priya): Checker for Clerk operations; Maker for Accounting JVs & Payments
 * - OWNER (Vikram): Ultimate Checker for JVs/Payments created by Accountant & High-Value Cap
 */
const DEFAULT_RULES: Omit<MakerCheckerRule, 'id' | 'tenantId' | 'updatedAt'>[] = [
  {
    docType: 'VENDOR_BILL',
    docTitle: 'Vendor Bill (Purchase Invoice)',
    module: 'Accounts Payable',
    description: 'Supplier invoices with GST ITC, TDS and payment liability',
    workflowSummary: 'Data Entry creates bill -> Accountant verifies GST & 3-Way Match',
    isEnabled: true,
    thresholdAmount: 25000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'PO',
    docTitle: 'Purchase Order',
    module: 'Procurement',
    description: 'Vendor Purchase Orders & Procurement commitments',
    workflowSummary: 'Data Entry creates PO -> Accountant / Owner checks price & supplier contract',
    isEnabled: true,
    thresholdAmount: 50000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'GRN',
    docTitle: 'Goods Receipt Note',
    module: 'Inventory & Stores',
    description: 'Store goods inward inspection & quantity receipt against PO',
    workflowSummary: 'Data Entry logs inward -> Accountant verifies against PO tolerances',
    isEnabled: true,
    thresholdAmount: 50000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'JV',
    docTitle: 'Journal Voucher (Manual JV)',
    module: 'General Ledger',
    description: 'Manual adjusting entries, depreciation & year-end provisions',
    workflowSummary: 'Accountant creates JV -> Owner authorizes (Strict 4-Eyes)',
    isEnabled: true,
    thresholdAmount: 25000,
    requireDistinctChecker: true,
    allowedRoles: ['OWNER'],
    defaultMakerRole: 'ACCOUNTANT',
  },
  {
    docType: 'DEBIT_NOTE',
    docTitle: 'Debit Note (Purchase)',
    module: 'Accounts Payable',
    description: 'GST Sec 34 supplier debit adjustments & rate difference',
    workflowSummary: 'Data Entry creates -> Accountant / Owner verifies vendor agreement',
    isEnabled: true,
    thresholdAmount: 20000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'CREDIT_NOTE',
    docTitle: 'Credit Note (Sales)',
    module: 'Accounts Receivable',
    description: 'GST Sec 34 customer credit adjustments & discounts',
    workflowSummary: 'Data Entry creates -> Accountant / Owner checks approval note',
    isEnabled: true,
    thresholdAmount: 20000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'PURCHASE_RETURN',
    docTitle: 'Purchase Return (Outward)',
    module: 'Procurement',
    description: 'Material return to supplier with debit stock reversal',
    workflowSummary: 'Data Entry creates return -> Accountant authorizes lot debit',
    isEnabled: true,
    thresholdAmount: 25000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'SALES_RETURN',
    docTitle: 'Sales Return (Inward)',
    module: 'Sales',
    description: 'Customer rejection inwards & replacement credit',
    workflowSummary: 'Data Entry logs return -> Accountant checks QC rejection note',
    isEnabled: true,
    thresholdAmount: 25000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'SALES_INVOICE',
    docTitle: 'Sales Invoice',
    module: 'Accounts Receivable',
    description: 'Commercial GST tax invoices sent to customers',
    workflowSummary: 'Routine invoices auto-post; high-value invoices verified by Accountant / Owner',
    isEnabled: true,
    thresholdAmount: 100000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'PAYMENT',
    docTitle: 'Bank & Cash Payments',
    module: 'Treasury & Banking',
    description: 'Outward vendor payments and cash disbursements',
    workflowSummary: 'Accountant prepares payment voucher -> Owner signs off / authorizes bank debit',
    isEnabled: true,
    thresholdAmount: 25000,
    requireDistinctChecker: true,
    allowedRoles: ['OWNER'],
    defaultMakerRole: 'ACCOUNTANT',
  },
  {
    docType: 'SO',
    docTitle: 'Sales Order',
    module: 'Sales',
    description: 'Customer order contracts & pricing commitments',
    workflowSummary: 'Fast-track enabled for SME agility (Threshold > ₹2L for review)',
    isEnabled: false,
    thresholdAmount: 200000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
  {
    docType: 'DO',
    docTitle: 'Delivery Order (Challan)',
    module: 'Logistics',
    description: 'Goods outward dispatch gate pass and delivery notes',
    workflowSummary: 'Fast-track enabled for prompt warehouse dispatch',
    isEnabled: false,
    thresholdAmount: 200000,
    requireDistinctChecker: true,
    allowedRoles: ['ACCOUNTANT', 'OWNER'],
    defaultMakerRole: 'DATA_ENTRY',
  },
];


async function getTenantRules(tenantId: string): Promise<MakerCheckerRule[]> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'APPROVAL_RULES' } }
  });
  if (record && record.value) {
    return record.value as any;
  }
  const rules = DEFAULT_RULES.map((r, idx) => ({
    ...r,
    id: `rule-${idx}`,
    tenantId,
    updatedAt: new Date().toISOString(),
  }));
  await prisma.keyValueStore.create({
    data: { tenantId, key: 'APPROVAL_RULES', value: rules as any }
  });
  return rules;
}

async function getTenantApprovals(tenantId: string): Promise<ApprovalRequest[]> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'APPROVAL_REQUESTS' } }
  });
  if (record && record.value) {
    return record.value as any;
  }
  await prisma.keyValueStore.create({
    data: { tenantId, key: 'APPROVAL_REQUESTS', value: [] }
  });
  return [];
}

async function saveTenantRules(tenantId: string, rules: MakerCheckerRule[]) {
  await prisma.keyValueStore.update({
    where: { tenantId_key: { tenantId, key: 'APPROVAL_RULES' } },
    data: { value: rules as any }
  });
}

async function saveTenantApprovals(tenantId: string, approvals: ApprovalRequest[]) {
  await prisma.keyValueStore.update({
    where: { tenantId_key: { tenantId, key: 'APPROVAL_REQUESTS' } },
    data: { value: approvals as any }
  });
}

export class ApprovalService {
  public static async getRules(tenantId: string): MakerCheckerRule[] {
    return getTenantRules(tenantId);
  }

  public static async resetToDefaults(tenantId: string, userId?: string): MakerCheckerRule[] {
    const rules = DEFAULT_RULES.map((r, idx) => ({
      ...r,
      id: `rule-${tenantId}-${idx + 1}`,
      tenantId,
      updatedAt: new Date().toISOString(),
    }));
    await saveTenantRules(tenantId, rules);
    AuditService.logDataChange({
      tenantId,
      userId: userId || 'usr-001',
      action: 'UPDATE',
      entityName: 'MAKER_CHECKER_RULES',
      entityId: `matrix-${tenantId}`,
      entityNumber: 'POLICY-MATRIX-RESET',
      narration: 'Reset Maker-Checker matrix to standard 90% Best Practice Defaults',
    }).catch(() => {});
    return rules;
  }

  public static async updateRulesBulk(tenantId: string, updatedRules: MakerCheckerRule[], userId?: string): Promise<MakerCheckerRule[]> {
    await saveTenantRules(tenantId, updatedRules.map(r => ({ ...r, tenantId, updatedAt: new Date().toISOString() })));
    AuditService.logDataChange({
      tenantId,
      userId: userId || 'usr-001',
      action: 'UPDATE',
      entityName: 'MAKER_CHECKER_RULES',
      entityId: `matrix-${tenantId}`,
      entityNumber: 'POLICY-MATRIX',
      narration: `Updated maker-checker matrix with ${updatedRules.length} policy rules`,
    }).catch(() => {});
    return getTenantRules(tenantId);
  }

  public static async updateRule(
    tenantId: string,
    docType: DocumentType,
    updates: Partial<MakerCheckerRule>,
    userId?: string
  ): MakerCheckerRule {
    const rules = await getTenantRules(tenantId);
    const index = rules.findIndex((r) => r.docType === docType);
    if (index === -1) throw new AppError(`Rule for ${docType} not found`, 404);

    const updated = {
      ...rules[index],
      ...updates,
      docType,
      tenantId,
      updatedAt: new Date().toISOString(),
    };

    rules[index] = updated;
    await saveTenantRules(tenantId, rules);

    AuditService.logDataChange({
      tenantId,
      userId: userId || 'usr-001',
      action: 'UPDATE',
      entityName: 'MAKER_CHECKER_RULE',
      entityId: updated.id,
      entityNumber: docType,
      narration: `Updated ${docType} policy: enabled=${updated.isEnabled}, threshold=₹${updated.thresholdAmount}`,
    }).catch(() => {});

    return updated;
  }

  public static async evaluateTransaction(params: {
    tenantId: string;
    docType: DocumentType;
    docNumber: string;
    docId: string;
    amount: number;
    currency?: string;
    makerId: string;
    makerName: string;
    makerRole?: string;
    makerEmail?: string;
    remarks?: string;
    metadata?: Record<string, any>;
  }): { requiresApproval: boolean; status: 'AUTO_APPROVED' | 'PENDING'; request?: ApprovalRequest; ruleApplied?: MakerCheckerRule; message: string } {
    const rules = getTenantRules(params.tenantId);
    const rule = rules.find((r) => r.docType === params.docType);

    if (!rule || !rule.isEnabled) {
      return {
        requiresApproval: false,
        status: 'AUTO_APPROVED',
        ruleApplied: rule,
        message: `Maker-Checker is disabled for ${params.docType}. Transaction auto-approved.`,
      };
    }

    if (params.amount <= rule.thresholdAmount) {
      const autoApprovedRequest: ApprovalRequest = {
        id: 'apr-' + Date.now(),
        tenantId: params.tenantId,
        docType: params.docType,
        docTitle: rule.docTitle,
        docNumber: params.docNumber,
        docId: params.docId,
        amount: params.amount,
        currency: params.currency || 'INR',
        makerId: params.makerId,
        makerName: params.makerName,
        makerRole: params.makerRole || 'DATA_ENTRY',
        makerEmail: params.makerEmail,
        status: 'AUTO_APPROVED',
        remarks: params.remarks || `Auto-approved as amount ₹${params.amount.toLocaleString('en-IN')} ≤ threshold ₹${rule.thresholdAmount.toLocaleString('en-IN')}`,
        decidedAt: new Date().toISOString(),
        metadata: params.metadata,
        createdAt: new Date().toISOString(),
      };
      const approvals = await getTenantApprovals(params.tenantId);
      await saveTenantApprovals(params.tenantId, [autoApprovedRequest, ...approvals]);

      return {
        requiresApproval: false,
        status: 'AUTO_APPROVED',
        request: autoApprovedRequest,
        ruleApplied: rule,
        message: `Amount ₹${params.amount.toLocaleString('en-IN')} is within auto-approval threshold (≤ ₹${rule.thresholdAmount.toLocaleString('en-IN')}). Auto-approved.`,
      };
    }

    const pendingRequest: ApprovalRequest = {
      id: 'apr-' + Date.now(),
      tenantId: params.tenantId,
      docType: params.docType,
      docTitle: rule.docTitle,
      docNumber: params.docNumber,
      docId: params.docId,
      amount: params.amount,
      currency: params.currency || 'INR',
      makerId: params.makerId,
      makerName: params.makerName,
      makerRole: params.makerRole || 'DATA_ENTRY',
      makerEmail: params.makerEmail,
      status: 'PENDING',
      remarks: params.remarks || `Value ₹${params.amount.toLocaleString('en-IN')} exceeds threshold ₹${rule.thresholdAmount.toLocaleString('en-IN')}`,
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
    };

    const approvals = await getTenantApprovals(params.tenantId);
    await saveTenantApprovals(params.tenantId, [pendingRequest, ...approvals]);

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.makerId,
      action: 'CREATE',
      entityName: 'APPROVAL_REQUEST',
      entityId: pendingRequest.id,
      entityNumber: params.docNumber,
      narration: `Submitted ${params.docType} #${params.docNumber} for checker authorization (₹${params.amount.toLocaleString('en-IN')})`,
    }).catch(() => {});

    return {
      requiresApproval: true,
      status: 'PENDING',
      request: pendingRequest,
      ruleApplied: rule,
      message: `Transaction submitted to authorization queue. Awaiting checker approval by ${rule.allowedRoles.join('/')}.`,
    };
  }

  public static async getPendingApprovals(tenantId: string): ApprovalRequest[] {
    const list = getTenantApprovals(tenantId);
    return list.filter((a) => a.status === 'PENDING');
  }

  public static async getApprovalHistory(tenantId: string): ApprovalRequest[] {
    const list = getTenantApprovals(tenantId);
    return list.filter((a) => a.status !== 'PENDING');
  }

  public static async getStats(tenantId: string): ApprovalStats {
    const list = getTenantApprovals(tenantId);
    const rules = await getTenantRules(tenantId);
    return {
      pendingCount: list.filter((a) => a.status === 'PENDING').length,
      approvedCount: list.filter((a) => a.status === 'APPROVED').length,
      rejectedCount: list.filter((a) => a.status === 'REJECTED').length,
      autoApprovedCount: list.filter((a) => a.status === 'AUTO_APPROVED').length,
      rulesConfiguredCount: rules.filter((r) => r.isEnabled).length,
    };
  }

  public static async approveRequest(params: {
    tenantId: string;
    requestId: string;
    checkerId: string;
    checkerName: string;
    checkerRole?: string;
    checkerEmail?: string;
    remarks?: string;
  }): ApprovalRequest {
    const approvals = await getTenantApprovals(params.tenantId);
    const item = approvals.find((a) => a.id === params.requestId);
    if (!item) throw new AppError('Approval request not found', 404);

    if (item.status !== 'PENDING') {
      throw new AppError(`Request is already ${item.status}`, 400);
    }

    const rules = getTenantRules(params.tenantId);
    const rule = rules.find((r) => r.docType === item.docType);

    // Role check: Is checker authorized?
    if (rule?.allowedRoles && params.checkerRole && !rule.allowedRoles.includes(params.checkerRole as any)) {
      throw new AppError(
        `Role '${params.checkerRole}' is not authorized to approve ${item.docType}. Required: ${rule.allowedRoles.join(' or ')}`,
        403
      );
    }

    // STRICT ANTI-FRAUD: Maker cannot be Checker (Four-Eyes Principle)
    if (rule?.requireDistinctChecker && item.makerId === params.checkerId) {
      throw new AppError(
        `Four-Eyes Principle Violation: Maker cannot approve their own transaction (Submitted by ${item.makerName}). A distinct authorized Checker is required to prevent fraud.`,
        403
      );
    }

    item.status = 'APPROVED';
    item.checkerId = params.checkerId;
    item.checkerName = params.checkerName;
    item.checkerRole = params.checkerRole || 'ACCOUNTANT';
    item.checkerEmail = params.checkerEmail;
    item.remarks = params.remarks || item.remarks;
    item.decidedAt = new Date().toISOString();

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.checkerId,
      action: 'UPDATE',
      entityName: 'APPROVAL_REQUEST',
      entityId: item.id,
      entityNumber: item.docNumber,
      narration: `APPROVED ${item.docType} #${item.docNumber} (₹${item.amount.toLocaleString('en-IN')}) submitted by ${item.makerName}`,
    }).catch(() => {});

    return item;
  }

  public static async rejectRequest(params: {
    tenantId: string;
    requestId: string;
    checkerId: string;
    checkerName: string;
    checkerRole?: string;
    checkerEmail?: string;
    rejectionReason: string;
  }): ApprovalRequest {
    if (!params.rejectionReason || !params.rejectionReason.trim()) {
      throw new AppError('Rejection reason is mandatory for audit compliance', 400);
    }

    const approvals = await getTenantApprovals(params.tenantId);
    const item = approvals.find((a) => a.id === params.requestId);
    if (!item) throw new AppError('Approval request not found', 404);

    if (item.status !== 'PENDING') {
      throw new AppError(`Request is already ${item.status}`, 400);
    }

    const rules = getTenantRules(params.tenantId);
    const rule = rules.find((r) => r.docType === item.docType);

    if (rule?.requireDistinctChecker && item.makerId === params.checkerId) {
      throw new AppError(
        'Four-Eyes Principle Violation: Maker cannot reject their own submission through the checker workflow',
        403
      );
    }

    item.status = 'REJECTED';
    item.checkerId = params.checkerId;
    item.checkerName = params.checkerName;
    item.checkerRole = params.checkerRole || 'ACCOUNTANT';
    item.checkerEmail = params.checkerEmail;
    item.rejectionReason = params.rejectionReason;
    item.decidedAt = new Date().toISOString();

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.checkerId,
      action: 'UPDATE',
      entityName: 'APPROVAL_REQUEST',
      entityId: item.id,
      entityNumber: item.docNumber,
      narration: `REJECTED ${item.docType} #${item.docNumber} (Reason: ${params.rejectionReason})`,
    }).catch(() => {});

    return item;
  }
}
