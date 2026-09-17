import { prisma } from '../../../core/database/prisma';
import {
  TenantAccount,
  SubscriptionInvoice,
  HelpTopicItem,
  PlatformMetrics,
  TenantStatus,
  SubscriptionTier,
  InvoiceStatus
} from '../types/super-admin.types';

interface SuperAdminState {
  tenants: TenantAccount[];
  invoices: SubscriptionInvoice[];
  helpTopics: HelpTopicItem[];
}

function getInitialSuperAdminData(): SuperAdminState {
  const initialTenants: TenantAccount[] = [
    {
      id: '27AABCF1234F1Z5',
      name: 'Apex Industries Ltd.',
      subdomain: 'apex',
      gstin: '27AABCF1234F1Z5',
      contactEmail: 'owner@apexindustries.com',
      contactPhone: '+91 98200 12345',
      status: 'ACTIVE',
      subscriptionTier: 'ENTERPRISE',
      billingFrequency: 'MONTHLY',
      monthlyAmount: 25000,
      currency: 'INR',
      currentPeriodStart: '2026-04-01',
      currentPeriodEnd: '2027-03-31',
      userCount: 18,
      voucherCount: 1420,
      lastActiveAt: new Date().toISOString(),
      createdAt: '2025-04-01T00:00:00.000Z'
    },
    {
      id: '29ABCDE5678G2Z3',
      name: 'Zenith Logistics & Supply Co.',
      subdomain: 'zenith',
      gstin: '29ABCDE5678G2Z3',
      contactEmail: 'accounts@zenithlogistics.in',
      contactPhone: '+91 98450 98765',
      status: 'ACTIVE',
      subscriptionTier: 'PROFESSIONAL',
      billingFrequency: 'MONTHLY',
      monthlyAmount: 12000,
      currency: 'INR',
      currentPeriodStart: '2026-04-01',
      currentPeriodEnd: '2026-09-30',
      userCount: 8,
      voucherCount: 650,
      lastActiveAt: new Date().toISOString(),
      createdAt: '2025-10-15T00:00:00.000Z'
    },
    {
      id: '06XYZPA9988H1Z1',
      name: 'Nova Retail Ventures',
      subdomain: 'novaretail',
      gstin: '06XYZPA9988H1Z1',
      contactEmail: 'finance@novaretail.com',
      contactPhone: '+91 99110 55443',
      status: 'SUSPENDED',
      subscriptionTier: 'STARTER',
      billingFrequency: 'MONTHLY',
      monthlyAmount: 5000,
      currency: 'INR',
      currentPeriodStart: '2026-01-01',
      currentPeriodEnd: '2026-03-31',
      userCount: 3,
      voucherCount: 210,
      lastActiveAt: '2026-03-28T14:30:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      suspendedReason: 'Subscription payment overdue (> 45 days)'
    }
  ];

  const initialInvoices: SubscriptionInvoice[] = [
    {
      id: 'INV-SUB-2026-001',
      invoiceNumber: 'FSQ/26-27/001',
      tenantId: '27AABCF1234F1Z5',
      tenantName: 'Apex Industries Ltd.',
      subdomain: 'apex',
      amount: 25000,
      taxAmount: 4500,
      totalAmount: 29500,
      status: 'PAID',
      billingPeriod: 'September 2026',
      dueDate: '2026-09-10',
      paidAt: '2026-09-08T14:22:10.000Z',
      paymentRef: 'HDFC_NEFT_991823',
      createdAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'INV-SUB-2026-002',
      invoiceNumber: 'FSQ/26-27/002',
      tenantId: '29ABCDE5678G2Z3',
      tenantName: 'Zenith Logistics & Supply Co.',
      subdomain: 'zenith',
      amount: 12000,
      taxAmount: 2160,
      totalAmount: 14160,
      status: 'PAID',
      billingPeriod: 'September 2026',
      dueDate: '2026-09-15',
      paidAt: '2026-09-12T11:05:30.000Z',
      paymentRef: 'ICICI_UPI_882910',
      createdAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'INV-SUB-2026-003',
      invoiceNumber: 'FSQ/26-27/003',
      tenantId: '06XYZPA9988H1Z1',
      tenantName: 'Nova Retail Ventures',
      subdomain: 'novaretail',
      amount: 5000,
      taxAmount: 900,
      totalAmount: 5900,
      status: 'OVERDUE',
      billingPeriod: 'August 2026',
      dueDate: '2026-08-10',
      createdAt: '2026-08-01T00:00:00.000Z'
    }
  ];

  const initialHelpTopics: HelpTopicItem[] = [
    {
      id: 'topic-voucher-entry',
      title: 'Tally-Style Fast Voucher Creation (Golden Rules)',
      category: 'Vouchers',
      keywords: ['voucher', 'payment', 'receipt', 'journal', 'contra', 'f7', 'f5', 'f6'],
      summary: 'Keyboard-accelerated double-entry accounting with real-time Dr/Cr validation and ledger balancing.',
      steps: [
        'Press F5 (Payment), F6 (Receipt), F7 (Journal), or F4 (Contra) to select the voucher mode instantly.',
        'Enter Debit / Credit ledger accounts with auto-complete typeahead.',
        'Verify that total Dr equals total Cr in real-time before submission.',
        'Press Alt+S or Ctrl+Enter to commit the transaction to General Ledger with immutable MCA-compliant audit logs.'
      ],
      shortcuts: ['F5 - Payment Voucher', 'F6 - Receipt Voucher', 'F7 - Journal Voucher', 'Alt+S - Post to Ledger'],
      tabTarget: 'voucher',
      isCustom: false,
      updatedAt: '2026-04-01T00:00:00.000Z',
      updatedBy: 'System Engine'
    },
    {
      id: 'topic-jv-01',
      title: 'How to create a Journal Voucher (JV)',
      category: 'Vouchers',
      keywords: ['jv', 'journal', 'voucher', 'adjustment', 'debit', 'credit', 'double entry'],
      summary: 'Record adjustment, non-cash, depreciation, or inter-account transfer entries.',
      steps: [
        'Navigate to Voucher Matrix in the left sidebar.',
        'Select voucher type Journal (JV) or press Alt+J.',
        'Enter posting date and select the Debit ledger.',
        'Enter the Credit ledger and verify zero difference (Debit = Credit).',
        'Add a descriptive narration and click Post Voucher (Ctrl+Enter).'
      ],
      shortcuts: ['Alt+J', 'Ctrl+Enter'],
      tabTarget: 'voucher',
      isCustom: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Platform Owner'
    },
    {
      id: 'topic-cost-center-01',
      title: 'Where can I change or assign a Department / Cost Center?',
      category: 'Masters',
      keywords: ['department', 'cost center', 'branch', 'allocation', 'segment', 'project'],
      summary: 'Configure multidimensional cost centers for departments, branches, and projects.',
      steps: [
        'Click on Master Data Hub in the left sidebar.',
        'Select Cost Centers & Departments from the master categories.',
        'Click + New Cost Center or click Edit on any existing department.',
        'Assign parent department, manager in-charge, and budget limit.',
        'Click Save Master to activate.'
      ],
      shortcuts: ['Alt+M'],
      tabTarget: 'masters',
      isCustom: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Platform Owner'
    },
    {
      id: 'topic-tb-01',
      title: 'How to view and export the Trial Balance?',
      category: 'Reports',
      keywords: ['trial balance', 'tb', 'ledger balance', 'financial statements', 'closing balances', 'reconciliation'],
      summary: 'View point-in-time Trial Balance with Debit/Credit checks and closed period historical archive.',
      steps: [
        'Navigate to Financial Reports in the sidebar.',
        'Click on Trial Balance tab.',
        'Select active or closed fiscal period (e.g. FY 2025-26 Closed Archive).',
        'Toggle Detailed / Condensed view to see child ledger breakdowns.',
        'Click Export Excel / PDF to download.'
      ],
      shortcuts: ['Alt+T'],
      tabTarget: 'financial-reports',
      isCustom: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Platform Owner'
    },
    {
      id: 'topic-closing-01',
      title: 'How to run Financial Period & Year-End Closing?',
      category: 'Closing',
      keywords: ['year end', 'month end', 'period close', 'roll forward', 'opening balance', 'retained earnings', 'audit sync'],
      summary: '6-step guided wizard for month-end reconciliation and zero-difference year-end roll-forward.',
      steps: [
        'Go to Financial Periods & Year-End tab.',
        'Select the current active period and click Run Closing Wizard.',
        'Complete the 18-point verification checklist (AR/AP reconciliation, Bank Rec, Stock valuation).',
        'Execute Year-End Roll-Forward to atomically roll P&L into Retained Earnings (zero-difference Δ = ₹0.00).',
        'If auditor adjustments arrive later, use Synchronize Opening Balances to auto-update opening journals.'
      ],
      shortcuts: ['Alt+Y'],
      tabTarget: 'financial-periods',
      isCustom: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Platform Owner'
    }
  ];

  return {
    tenants: initialTenants,
    invoices: initialInvoices,
    helpTopics: initialHelpTopics
  };
}

const GLOBAL_TENANT = 'SYSTEM_PLATFORM_SUPER_ADMIN';

async function getSuperAdminState(): Promise<SuperAdminState> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId: GLOBAL_TENANT, key: 'SUPER_ADMIN_STATE' } }
  });
  if (record && record.value) {
    return record.value as any;
  }
  const init = getInitialSuperAdminData();
  try {
    await prisma.keyValueStore.create({
      data: { tenantId: GLOBAL_TENANT, key: 'SUPER_ADMIN_STATE', value: init as any }
    });
  } catch (e) {
    // Concurrent safe
  }
  return init;
}

async function saveSuperAdminState(state: SuperAdminState) {
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: GLOBAL_TENANT, key: 'SUPER_ADMIN_STATE' } },
    update: { value: state as any },
    create: { tenantId: GLOBAL_TENANT, key: 'SUPER_ADMIN_STATE', value: state as any }
  });
}

class SuperAdminService {
  // --- Tenant Management ---
  public async listTenants(): Promise<TenantAccount[]> {
    const state = await getSuperAdminState();
    return [...state.tenants].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async getTenantById(id: string): Promise<TenantAccount | undefined> {
    const state = await getSuperAdminState();
    return state.tenants.find(t => t.id === id);
  }

  public async getTenantBySubdomain(subdomain: string): Promise<TenantAccount | undefined> {
    const clean = subdomain.toLowerCase().trim();
    const state = await getSuperAdminState();
    return state.tenants.find(t => t.subdomain.toLowerCase() === clean);
  }

  public async updateTenantStatus(id: string, status: TenantStatus, suspendedReason?: string): Promise<TenantAccount> {
    const state = await getSuperAdminState();
    const tenant = state.tenants.find(t => t.id === id);
    if (!tenant) {
      throw new Error(`Tenant ${id} not found`);
    }
    tenant.status = status;
    if (status === 'SUSPENDED' || status === 'INACTIVE') {
      tenant.suspendedReason = suspendedReason || 'Suspended by Platform Administrator';
    } else {
      tenant.suspendedReason = undefined;
    }
    await saveSuperAdminState(state);
    return tenant;
  }

  public async createTenant(data: {
    name: string;
    subdomain: string;
    gstin: string;
    contactEmail: string;
    contactPhone: string;
    subscriptionTier: SubscriptionTier;
    monthlyAmount: number;
  }): Promise<TenantAccount> {
    const state = await getSuperAdminState();
    const existing = state.tenants.find(t => t.subdomain.toLowerCase() === data.subdomain.toLowerCase().trim());
    if (existing) {
      throw new Error(`Subdomain '${data.subdomain}' is already assigned to ${existing.name}`);
    }

    const newTenant: TenantAccount = {
      id: data.gstin.trim().toUpperCase(),
      name: data.name.trim(),
      subdomain: data.subdomain.toLowerCase().trim(),
      gstin: data.gstin.trim().toUpperCase(),
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone.trim(),
      status: 'ACTIVE',
      subscriptionTier: data.subscriptionTier,
      billingFrequency: 'MONTHLY',
      monthlyAmount: data.monthlyAmount || 15000,
      currency: 'INR',
      currentPeriodStart: new Date().toISOString().slice(0, 10),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      userCount: 1,
      voucherCount: 0,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    state.tenants.push(newTenant);
    await saveSuperAdminState(state);
    return newTenant;
  }

  // --- Subscriptions & Invoicing ---
  public async listInvoices(tenantId?: string): Promise<SubscriptionInvoice[]> {
    const state = await getSuperAdminState();
    const all = [...state.invoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (tenantId) {
      return all.filter(i => i.tenantId === tenantId);
    }
    return all;
  }

  public async createInvoice(data: {
    tenantId: string;
    amount: number;
    billingPeriod: string;
    dueDate: string;
  }): Promise<SubscriptionInvoice> {
    const state = await getSuperAdminState();
    const tenant = state.tenants.find(t => t.id === data.tenantId);
    if (!tenant) throw new Error(`Tenant ${data.tenantId} not found`);

    const taxAmount = Math.round(data.amount * 0.18);
    const totalAmount = data.amount + taxAmount;
    const invId = `INV-SUB-${Date.now()}`;

    const invoice: SubscriptionInvoice = {
      id: invId,
      invoiceNumber: `FSQ/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      subdomain: tenant.subdomain,
      amount: data.amount,
      taxAmount,
      totalAmount,
      status: 'DUE',
      billingPeriod: data.billingPeriod,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString()
    };

    state.invoices.push(invoice);
    await saveSuperAdminState(state);
    return invoice;
  }

  public async recordPayment(invoiceId: string, paymentRef: string): Promise<SubscriptionInvoice> {
    const state = await getSuperAdminState();
    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

    invoice.status = 'PAID';
    invoice.paidAt = new Date().toISOString();
    invoice.paymentRef = paymentRef || 'MANUAL_BANK_TRANSFER';

    // If tenant was suspended for non-payment, reactivate automatically
    const tenant = state.tenants.find(t => t.id === invoice.tenantId);
    if (tenant && tenant.status === 'SUSPENDED') {
      tenant.status = 'ACTIVE';
      tenant.suspendedReason = undefined;
    }

    await saveSuperAdminState(state);
    return invoice;
  }

  // --- Dynamic Help Topics & Knowledge CMS ---
  public async listHelpTopics(query?: string, category?: string): Promise<HelpTopicItem[]> {
    const state = await getSuperAdminState();
    let topics = [...state.helpTopics];
    if (category && category !== 'All') {
      topics = topics.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      topics = topics.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.keywords.some(k => k.toLowerCase().includes(q)) ||
        t.steps.some(s => s.toLowerCase().includes(q))
      );
    }
    return topics.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public async upsertHelpTopic(data: Partial<HelpTopicItem> & { title: string; category: HelpTopicItem['category']; steps: string[] }): Promise<HelpTopicItem> {
    const state = await getSuperAdminState();
    const id = data.id || `topic-${Date.now()}`;
    const topic: HelpTopicItem = {
      id,
      title: data.title,
      category: data.category,
      keywords: data.keywords || [data.title.toLowerCase()],
      summary: data.summary || data.steps[0] || '',
      steps: data.steps,
      shortcuts: data.shortcuts || [],
      tabTarget: data.tabTarget || 'voucher',
      isCustom: true,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Platform Owner'
    };

    const existingIdx = state.helpTopics.findIndex(t => t.id === id);
    if (existingIdx >= 0) {
      state.helpTopics[existingIdx] = topic;
    } else {
      state.helpTopics.push(topic);
    }

    await saveSuperAdminState(state);
    return topic;
  }

  public async deleteHelpTopic(id: string): Promise<boolean> {
    const state = await getSuperAdminState();
    const initialLen = state.helpTopics.length;
    state.helpTopics = state.helpTopics.filter(t => t.id !== id);
    if (state.helpTopics.length !== initialLen) {
      await saveSuperAdminState(state);
      return true;
    }
    return false;
  }

  // --- Platform Metrics ---
  public async getPlatformMetrics(): Promise<PlatformMetrics> {
    const state = await getSuperAdminState();
    const tenants = state.tenants;
    const invoices = state.invoices;

    let mrr = 0;
    let totalUsers = 0;
    let totalVouchers = 0;
    let activeTenants = 0;
    let inactiveTenants = 0;
    let trialTenants = 0;

    for (const t of tenants) {
      totalUsers += t.userCount;
      totalVouchers += t.voucherCount;
      if (t.status === 'ACTIVE') {
        activeTenants++;
        mrr += t.monthlyAmount;
      } else if (t.status === 'TRIAL') {
        trialTenants++;
      } else {
        inactiveTenants++;
      }
    }

    let totalCollected = 0;
    let overdueAmount = 0;

    for (const inv of invoices) {
      if (inv.status === 'PAID') {
        totalCollected += inv.totalAmount;
      } else if (inv.status === 'OVERDUE') {
        overdueAmount += inv.totalAmount;
      }
    }

    return {
      totalTenants: tenants.length,
      activeTenants,
      inactiveTenants,
      trialTenants,
      mrr,
      totalCollected,
      overdueAmount,
      totalUsers,
      totalVouchersProcessed: totalVouchers
    };
  }
}

export const superAdminService = new SuperAdminService();
