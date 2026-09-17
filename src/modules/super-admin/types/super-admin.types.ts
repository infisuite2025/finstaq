export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';
export type SubscriptionTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BillingFrequency = 'MONTHLY' | 'ANNUAL';
export type InvoiceStatus = 'PAID' | 'DUE' | 'OVERDUE' | 'CANCELLED';

export interface TenantAccount {
  id: string;
  name: string;
  subdomain: string; // e.g. 'apex' for apex.finstaq.com
  gstin: string;
  contactEmail: string;
  contactPhone: string;
  status: TenantStatus;
  subscriptionTier: SubscriptionTier;
  billingFrequency: BillingFrequency;
  monthlyAmount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  userCount: number;
  voucherCount: number;
  lastActiveAt: string;
  createdAt: string;
  suspendedReason?: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  subdomain: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  billingPeriod: string;
  dueDate: string;
  paidAt?: string;
  paymentRef?: string;
  createdAt: string;
}

export interface HelpTopicItem {
  id: string;
  title: string;
  category: 'Vouchers' | 'Masters' | 'Reports' | 'Closing' | 'Purchases' | 'Sales' | 'Approvals' | 'Compliance' | 'General';
  keywords: string[];
  summary: string;
  steps: string[];
  shortcuts?: string[];
  tabTarget?: string;
  isCustom: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  trialTenants: number;
  mrr: number;
  totalCollected: number;
  overdueAmount: number;
  totalUsers: number;
  totalVouchersProcessed: number;
}
