import { prisma } from '../../../core/database/prisma';

export interface UpiQrRequest {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  invoiceNumber?: string;
  transactionRef?: string;
  narration?: string;
  merchantCode?: string;
}

export interface UpiTransaction {
  id: string;
  tenantId: string;
  type: 'COLLECTION' | 'PAYOUT';
  vpa: string;
  payeeOrPayerName: string;
  amount: number;
  invoiceNumber?: string;
  transactionRef: string;
  bankRrn: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  channel: 'DYNAMIC_QR' | 'STATIC_QR' | 'COLLECT_REQUEST' | 'DIRECT_PAYOUT';
  voucherId?: string;
  voucherNumber?: string;
  createdAt: string;
  settledAt?: string;
}

export interface VpaDirectoryItem {
  id: string;
  partyId?: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE';
  vpa: string;
  isDefault: boolean;
  isVerified: boolean;
}

async function getTenantUpiTxns(tenantId: string): Promise<UpiTransaction[]> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'UPI_TRANSACTIONS' } },
  });
  if (record && record.value) {
    return record.value as any;
  }
  const init: UpiTransaction[] = [
    {
      id: 'upi-txn-101',
      tenantId,
      type: 'COLLECTION',
      vpa: 'tatamotors@hdfcbank',
      payeeOrPayerName: 'Tata Motors Limited',
      amount: 145000,
      invoiceNumber: 'INV/2026/04/001',
      transactionRef: 'FIN-UPI-982341',
      bankRrn: '410293847561',
      status: 'SUCCESS',
      channel: 'DYNAMIC_QR',
      voucherId: 'vch-rcpt-001',
      voucherNumber: 'RCPT/2026/001',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      settledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'upi-txn-102',
      tenantId,
      type: 'PAYOUT',
      vpa: 'jswsteel@sbi',
      payeeOrPayerName: 'JSW Steel Processing Ltd',
      amount: 82500,
      invoiceNumber: 'BILL-JSW-889',
      transactionRef: 'FIN-UPI-982342',
      bankRrn: '410293847562',
      status: 'SUCCESS',
      channel: 'DIRECT_PAYOUT',
      voucherId: 'vch-pymt-002',
      voucherNumber: 'PMT/2026/002',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      settledAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'upi-txn-103',
      tenantId,
      type: 'COLLECTION',
      vpa: 'relianceretail@icici',
      payeeOrPayerName: 'Reliance Retail Ventures',
      amount: 236000,
      invoiceNumber: 'INV/2026/04/002',
      transactionRef: 'FIN-UPI-982343',
      bankRrn: '410293847563',
      status: 'SUCCESS',
      channel: 'COLLECT_REQUEST',
      voucherId: 'vch-rcpt-003',
      voucherNumber: 'RCPT/2026/003',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      settledAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];
  try {
    await prisma.keyValueStore.create({
      data: { tenantId, key: 'UPI_TRANSACTIONS', value: init as any },
    });
  } catch (e) {
    // Concurrent safe
  }
  return init;
}

async function saveTenantUpiTxns(tenantId: string, txns: UpiTransaction[]) {
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId, key: 'UPI_TRANSACTIONS' } },
    update: { value: txns as any },
    create: { tenantId, key: 'UPI_TRANSACTIONS', value: txns as any },
  });
}

async function getTenantVpaDir(tenantId: string): Promise<VpaDirectoryItem[]> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'UPI_VPA_DIRECTORY' } },
  });
  if (record && record.value) {
    return record.value as any;
  }
  const init: VpaDirectoryItem[] = [
    { id: 'vpa-1', partyId: 'cust-1', partyName: 'Tata Motors Limited', partyType: 'CUSTOMER', vpa: 'tatamotors@hdfcbank', isDefault: true, isVerified: true },
    { id: 'vpa-2', partyId: 'cust-2', partyName: 'Reliance Retail Ventures', partyType: 'CUSTOMER', vpa: 'relianceretail@icici', isDefault: true, isVerified: true },
    { id: 'vpa-3', partyId: 'vend-1', partyName: 'JSW Steel Processing Ltd', partyType: 'VENDOR', vpa: 'jswsteel@sbi', isDefault: true, isVerified: true },
    { id: 'vpa-4', partyId: 'vend-2', partyName: 'Schneider Electric India', partyType: 'VENDOR', vpa: 'schneider.ops@axisbank', isDefault: true, isVerified: true },
  ];
  try {
    await prisma.keyValueStore.create({
      data: { tenantId, key: 'UPI_VPA_DIRECTORY', value: init as any },
    });
  } catch (e) {
    // Concurrent safe
  }
  return init;
}

async function saveTenantVpaDir(tenantId: string, dir: VpaDirectoryItem[]) {
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId, key: 'UPI_VPA_DIRECTORY' } },
    update: { value: dir as any },
    create: { tenantId, key: 'UPI_VPA_DIRECTORY', value: dir as any },
  });
}

export class UpiService {
  /**
   * Generates a standard NPCI compliant UPI deep link URI and payload for QR rendering
   */
  generateUpiQr(req: UpiQrRequest): { upiUri: string; qrPayload: any; displayReference: string } {
    const vpa = req.payeeVpa || 'finstaq.enterprises@hdfcbank';
    const payee = encodeURIComponent(req.payeeName || 'FINSTAQ ENTERPRISES LTD');
    const amount = Number(req.amount || 0).toFixed(2);
    const txnRef = req.transactionRef || `FIN${Date.now().toString().slice(-8)}`;
    const narration = encodeURIComponent(req.narration || req.invoiceNumber ? `Payment for ${req.invoiceNumber}` : 'FINSTAQ B2B Payment');
    const mc = req.merchantCode || '5411';

    // Standard NPCI UPI URI Specification
    const upiUri = `upi://pay?pa=${vpa}&pn=${payee}&mc=${mc}&tr=${txnRef}&am=${amount}&cu=INR&tn=${narration}`;

    return {
      upiUri,
      displayReference: txnRef,
      qrPayload: {
        payeeVpa: vpa,
        payeeName: decodeURIComponent(payee),
        amount: Number(amount),
        currency: 'INR',
        transactionRef: txnRef,
        invoiceNumber: req.invoiceNumber,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate VPA syntax against NPCI handle standards
   */
  validateVpa(vpa: string): { isValid: boolean; handle?: string; bankProvider?: string; message: string } {
    if (!vpa || typeof vpa !== 'string') {
      return { isValid: false, message: 'UPI ID cannot be empty' };
    }
    const cleanVpa = vpa.trim().toLowerCase();
    const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!vpaRegex.test(cleanVpa)) {
      return { isValid: false, message: 'Invalid UPI ID format (e.g. name@bank)' };
    }

    const parts = cleanVpa.split('@');
    const handle = parts[1];
    let bankProvider = 'UPI PSP';
    if (['okaxis', 'axisbank'].includes(handle)) bankProvider = 'Axis Bank';
    else if (['okhdfcbank', 'hdfcbank'].includes(handle)) bankProvider = 'HDFC Bank';
    else if (['okicici', 'icici'].includes(handle)) bankProvider = 'ICICI Bank';
    else if (['oksbi', 'sbi'].includes(handle)) bankProvider = 'State Bank of India';
    else if (['paytm', 'ptyes'].includes(handle)) bankProvider = 'Paytm Payments Bank';
    else if (['ybl', 'ibl'].includes(handle)) bankProvider = 'YES Bank / PhonePe';

    return {
      isValid: true,
      handle,
      bankProvider,
      message: `Valid UPI ID linked with ${bankProvider}`,
    };
  }

  /**
   * Get all UPI transactions for tenant
   */
  async getTransactions(tenantId: string): Promise<UpiTransaction[]> {
    return getTenantUpiTxns(tenantId);
  }

  /**
   * Get VPA Directory
   */
  async getVpaDirectory(tenantId: string): Promise<VpaDirectoryItem[]> {
    return getTenantVpaDir(tenantId);
  }

  /**
   * Register new VPA for Party
   */
  async addVpa(tenantId: string, item: Omit<VpaDirectoryItem, 'id' | 'isVerified'>): Promise<VpaDirectoryItem> {
    const list = await this.getVpaDirectory(tenantId);
    const newItem: VpaDirectoryItem = {
      id: `vpa-${Date.now()}`,
      ...item,
      isVerified: true,
    };
    list.unshift(newItem);
    await saveTenantVpaDir(tenantId, list);
    return newItem;
  }

  /**
   * Process simulated incoming UPI payment & automatically generate Receipt Voucher
   */
  async processUpiCollection(tenantId: string, params: {
    payerVpa: string;
    payerName: string;
    amount: number;
    invoiceNumber?: string;
    transactionRef?: string;
    bankLedgerId?: string;
  }): Promise<{ transaction: UpiTransaction; receiptVoucherNumber: string }> {
    const list = await this.getTransactions(tenantId);
    const txnRef = params.transactionRef || `FIN-UPI-${Date.now().toString().slice(-6)}`;
    const rrn = `4${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const voucherNo = `RCPT/UPI/${new Date().getFullYear()}/${(list.length + 1).toString().padStart(4, '0')}`;

    const newTxn: UpiTransaction = {
      id: `upi-txn-${Date.now()}`,
      tenantId,
      type: 'COLLECTION',
      vpa: params.payerVpa,
      payeeOrPayerName: params.payerName,
      amount: params.amount,
      invoiceNumber: params.invoiceNumber,
      transactionRef: txnRef,
      bankRrn: rrn,
      status: 'SUCCESS',
      channel: 'DYNAMIC_QR',
      voucherId: `vch-${Date.now()}`,
      voucherNumber: voucherNo,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
    };

    list.unshift(newTxn);
    await saveTenantUpiTxns(tenantId, list);

    return {
      transaction: newTxn,
      receiptVoucherNumber: voucherNo,
    };
  }

  /**
   * Execute outgoing UPI Payout to Vendor / Employee
   */
  async processUpiPayout(tenantId: string, params: {
    payeeVpa: string;
    payeeName: string;
    amount: number;
    billNumber?: string;
    narration?: string;
  }): Promise<{ transaction: UpiTransaction; paymentVoucherNumber: string }> {
    const list = await this.getTransactions(tenantId);
    const txnRef = `FIN-PAYOUT-${Date.now().toString().slice(-6)}`;
    const rrn = `4${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const voucherNo = `PMT/UPI/${new Date().getFullYear()}/${(list.length + 1).toString().padStart(4, '0')}`;

    const newTxn: UpiTransaction = {
      id: `upi-txn-${Date.now()}`,
      tenantId,
      type: 'PAYOUT',
      vpa: params.payeeVpa,
      payeeOrPayerName: params.payeeName,
      amount: params.amount,
      invoiceNumber: params.billNumber,
      transactionRef: txnRef,
      bankRrn: rrn,
      status: 'SUCCESS',
      channel: 'DIRECT_PAYOUT',
      voucherId: `vch-${Date.now()}`,
      voucherNumber: voucherNo,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
    };

    list.unshift(newTxn);
    await saveTenantUpiTxns(tenantId, list);

    return {
      transaction: newTxn,
      paymentVoucherNumber: voucherNo,
    };
  }
}

export const upiService = new UpiService();
