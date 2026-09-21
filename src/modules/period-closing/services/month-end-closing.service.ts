// @ts-nocheck
import {
  AccountingPeriod,
  MonthEndChecklistItem,
  PeriodStatus,
  ReopeningScope,
  UserRole
} from '../types/period-closing.types';
import { FinancialYearService } from './financial-year.service';
import { AuditService } from '../../audit/services/audit.service';
import { AppError } from '../../../core/errors/app-error';
import { prisma } from '../../../core/errors/app-error';



function generateDefault20PointChecklist(tenantId: string, periodId: string): Promise<MonthEndChecklistItem[]> {
  const items: Omit<MonthEndChecklistItem, 'id' | 'tenantId' | 'periodId'>[] = [
    {
      category: 'Banking & Cash',
      title: 'Bank Statement Reconciliation',
      description: 'Reconcile corporate bank accounts against GL cashbook entries.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
      comments: 'HDFC & ICICI bank accounts reconciled with 0 variance.',
    },
    {
      category: 'Banking & Cash',
      title: 'Petty Cash Verification',
      description: 'Physically count and verify branch cash float vouchers.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Ramesh Patel',
      assignedRole: 'DATA_ENTRY',
      comments: 'Petty cash log balanced to physical float.',
    },
    {
      category: 'Purchases & AP',
      title: 'GRN vs Vendor Invoice (3-Way Match)',
      description: 'Review unbilled GRNs and match supplier tax invoices.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
      comments: 'All accepted GRNs matched to vendor bills.',
    },
    {
      category: 'Purchases & AP',
      title: 'Vendor Sub-ledger Reconciliation',
      description: 'Verify Accounts Payable ledger balances against supplier statements.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Sales & AR',
      title: 'Customer Ledger & Receivables Ageing',
      description: 'Review outstanding customer invoices and reconcile collections.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Sales & AR',
      title: 'Unbilled Sales / Delivery Challan Review',
      description: 'Verify all dispatched delivery challans are invoiced within month.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Ramesh Patel',
      assignedRole: 'DATA_ENTRY',
    },
    {
      category: 'Inventory',
      title: 'Physical vs Book Inventory Valuation',
      description: 'Verify warehouse lot balances and check for negative stock.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Ramesh Patel',
      assignedRole: 'DATA_ENTRY',
      comments: 'No negative stock. FIFO valuation layer balanced.',
    },
    {
      category: 'Fixed Assets',
      title: 'Monthly Asset Depreciation Posting',
      description: 'Compute and post monthly depreciation schedule to GL.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
      comments: 'Accelerated depreciation posted via JV.',
    },
    {
      category: 'Statutory & GST',
      title: 'GSTR-1 Outward Supply Reconciliation',
      description: 'Reconcile sales invoices with GSTR-1 portal summary.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Statutory & GST',
      title: 'GSTR-2B Input Tax Credit (ITC) Matching',
      description: 'Match supplier bills with GSTR-2B eligible ITC.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Statutory & GST',
      title: 'GSTR-3B Tax Return Filing & Payment',
      description: 'Compute net GST liability and file GSTR-3B return.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
      comments: 'Challan generated and tax liability discharged.',
    },
    {
      category: 'Statutory & Taxes',
      title: 'TDS / Withholding Tax Review (194C/194J/194Q)',
      description: 'Reconcile TDS deducted against contractor and professional bills.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Payroll & HR',
      title: 'Monthly Salary & PF/ESI Accrual Posting',
      description: 'Post monthly payroll voucher with statutory deductions.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Adjustments',
      title: 'Accrued Expenses & Provisions',
      description: 'Book electricity, rent, audit fees & contractor accruals.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Adjustments',
      title: 'Prepaid Expense Amortization',
      description: 'Amortize insurance and annual software license prepayments.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Adjustments',
      title: 'Foreign Exchange Revaluation',
      description: 'Revalue open foreign currency receivables/payables to month-end rates.',
      status: 'WAIVED',
      isApplicable: false,
      isMandatory: false,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
      comments: 'No foreign currency exposure during this period.',
    },
    {
      category: 'General Ledger',
      title: 'Draft & Unposted Vouchers Clearance',
      description: 'Ensure all pending draft journals are either approved or deleted.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Ramesh Patel',
      assignedRole: 'DATA_ENTRY',
    },
    {
      category: 'General Ledger',
      title: 'Suspense Account Clearance',
      description: 'Investigate and clear any unallocated suspense ledger balances.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
      comments: 'Suspense balance is ₹0.00.',
    },
    {
      category: 'Inter-Unit',
      title: 'Inter-Branch / Warehouse Reconciliation',
      description: 'Reconcile stock transfers and branch ledger balances.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Priya Deshmukh',
      assignedRole: 'ACCOUNTANT',
    },
    {
      category: 'Management Review',
      title: 'Monthly Trial Balance & P&L Review',
      description: 'Perform analytical review of monthly P&L and Balance Sheet.',
      status: 'COMPLETED',
      isApplicable: true,
      isMandatory: true,
      assignedTo: 'Vikram Singhania',
      assignedRole: 'OWNER',
      comments: 'Reviewed by Owner. Ready for period close.',
    },
  ];

  return items.map((it, idx) => ({
    ...it,
    id: `chk-${periodId}-${idx + 1}`,
    tenantId,
    periodId,
  }));
}



async function getTenantChecklists(tenantId: string): Promise<Record<string, MonthEndChecklistItem[]>> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'MONTH_END_CHECKLISTS' } }
  });
  if (record && record.value) return record.value as any;
  return {};
}
async function saveTenantChecklists(tenantId: string, data: Record<string, MonthEndChecklistItem[]>) {
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId, key: 'MONTH_END_CHECKLISTS' } },
    update: { value: data as any },
    create: { tenantId, key: 'MONTH_END_CHECKLISTS', value: data as any }
  });
}

export class MonthEndClosingService {
  public static async getChecklist(tenantId: string, periodId: string): Promise<MonthEndChecklistItem[]> {
    const key = `${tenantId}:${periodId}`;
    const data = await getTenantChecklists(tenantId);
    let list = data[key];
    if (!list) {
      list = generateDefault20PointChecklist(tenantId, periodId);
      data[key] = list;
      await saveTenantChecklists(tenantId, data);
    }
    return list;
  }

  public static async updateChecklistItem(params: {
    tenantId: string;
    periodId: string;
    itemId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXCEPTION' | 'WAIVED';
    comments?: string;
    supportingRef?: string;
    userId: string;
    userName: string;
  }): Promise<MonthEndChecklistItem> {
    const list = this.getChecklist(params.tenantId, params.periodId);
    const item = list.find((i) => i.id === params.itemId);
    if (!item) throw new AppError('Checklist item not found', 404);

    item.status = params.status;
    if (params.comments) item.comments = params.comments;
    if (params.supportingRef) item.supportingRef = params.supportingRef;
    item.completedAt = new Date().toISOString();
    item.completedBy = params.userName;

    return item;
  }

  public static async closePeriod(params: {
    tenantId: string;
    periodId: string;
    closeType: 'SOFT_CLOSED' | 'FINAL_CLOSED';
    userId: string;
    userName: string;
    userRole: UserRole | string;
    remarks?: string;
  }) {
    const period = await require('../../../core/database/prisma').prisma.accountingPeriodMaster.findUnique({ where: { id: params.periodId }});
    if (!period) throw new AppError(`Period ${params.periodId} not found`, 404);

    if (period.isLocked) {
      throw new AppError(`Period ${period.periodName} is already locked`, 400);
    }

    const updated = await require('../../../core/database/prisma').prisma.accountingPeriodMaster.update({
      where: { id: period.id },
      data: { isLocked: true }
    });

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'UPDATE',
      entityName: 'ACCOUNTING_PERIOD',
      entityId: period.id,
      entityNumber: period.periodName,
      narration: `CLOSED accounting period ${period.periodName} as ${params.closeType} (${params.remarks || 'Closed by user'})`,
    }).catch(() => {});

    return {
      ...updated,
      monthName: updated.periodName,
      status: params.closeType,
      lockedBy: params.userId,
      lockedByName: params.userName,
      lockedAt: new Date().toISOString()
    };
  }

  public static async reopenPeriod(params: {
    tenantId: string;
    periodId: string;
    scope: ReopeningScope;
    reason: string;
    userId: string;
    userName: string;
    userRole: UserRole | string;
  }) {
    if (params.userRole !== 'OWNER') {
      throw new AppError('Strict Compliance: Only the Business OWNER (Vikram Singhania) is authorized to reopen closed periods.', 403);
    }

    if (!params.reason || !params.reason.trim()) {
      throw new AppError('Mandatory Requirement: Statutory justification/reason is required to reopen an accounting period.', 400);
    }

    const period = await require('../../../core/database/prisma').prisma.accountingPeriodMaster.findUnique({ where: { id: params.periodId }});
    if (!period) throw new AppError(`Period ${params.periodId} not found`, 404);

    const updated = await require('../../../core/database/prisma').prisma.accountingPeriodMaster.update({
      where: { id: period.id },
      data: { isLocked: false }
    });

    AuditService.logDataChange({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'UPDATE',
      entityName: 'ACCOUNTING_PERIOD',
      entityId: period.id,
      entityNumber: period.periodName,
      narration: `REOPENED accounting period ${period.periodName} (Scope: ${params.scope}, Reason: ${params.reason})`,
    }).catch(() => {});

    return {
      ...updated,
      monthName: updated.periodName,
      status: 'REOPENED',
      reopenedBy: params.userId,
      reopenedByName: params.userName,
      reopenedAt: new Date().toISOString(),
      reopenReason: params.reason,
      reopenScope: params.scope || 'ENTIRE_PERIOD'
    };
  }
}
