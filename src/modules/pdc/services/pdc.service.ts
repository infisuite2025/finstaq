import { prisma } from '../../../core/database/prisma';

export interface PostDatedCheque {
  id: string;
  tenantId: string;
  voucherType: 'PDC_RECEIPT' | 'PDC_PAYMENT' | 'MEMORANDUM' | 'OPTIONAL_VOUCHER';
  pdcNumber: string;
  chequeNumber: string;
  chequeDate: string; // maturity date
  partyName: string;
  partyType: 'CUSTOMER' | 'VENDOR';
  bankName: string;
  amount: number;
  purposeOrNarration: string;
  status: 'PENDING' | 'CLEARED_ACTIVE' | 'CANCELLED' | 'BOUNCED';
  promotedVoucherNumber?: string;
  promotedAt?: string;
  createdAt: string;
}

const PDC_KEY = 'pdc_records';

function getDefaultPdcList(tenantId: string): PostDatedCheque[] {
  return [
    {
      id: 'pdc-001',
      tenantId,
      voucherType: 'PDC_RECEIPT',
      pdcNumber: 'PDC-IN-2026-001',
      chequeNumber: '554201',
      chequeDate: '2026-09-25',
      partyName: 'Tata Motors Limited',
      partyType: 'CUSTOMER',
      bankName: 'HDFC Bank Ltd',
      amount: 350000,
      purposeOrNarration: 'Advance cheque against Sales Order #SO-2026-089',
      status: 'PENDING',
      createdAt: '2026-09-10T10:00:00Z',
    },
    {
      id: 'pdc-002',
      tenantId,
      voucherType: 'PDC_PAYMENT',
      pdcNumber: 'PDC-OUT-2026-002',
      chequeNumber: '204560',
      chequeDate: '2026-09-30',
      partyName: 'JSW Steel Processing Ltd',
      partyType: 'VENDOR',
      bankName: 'State Bank of India',
      amount: 180000,
      purposeOrNarration: 'Post-dated payment for Raw Material Batch #RM-441',
      status: 'PENDING',
      createdAt: '2026-09-12T14:30:00Z',
    },
    {
      id: 'pdc-003',
      tenantId,
      voucherType: 'MEMORANDUM',
      pdcNumber: 'MEMO-2026-001',
      chequeNumber: 'N/A',
      chequeDate: '2026-09-20',
      partyName: 'Schneider Electric India',
      partyType: 'VENDOR',
      bankName: 'Axis Bank',
      amount: 95000,
      purposeOrNarration: 'Estimated engineering commission contingent upon sign-off',
      status: 'PENDING',
      createdAt: '2026-09-13T09:15:00Z',
    },
  ];
}

async function getPdcStore(tenantId: string = 'tenant-default-01'): Promise<PostDatedCheque[]> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const row = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: PDC_KEY } },
    });
    if (row && row.value) {
      return row.value as unknown as PostDatedCheque[];
    }
  } catch (e) {}
  const defaultList = getDefaultPdcList(safeTenantId);
  try {
    await savePdcStore(safeTenantId, defaultList);
  } catch (e) {}
  return defaultList;
}

async function savePdcStore(tenantId: string = 'tenant-default-01', list: PostDatedCheque[]): Promise<void> {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: PDC_KEY } },
    create: { tenantId: safeTenantId, key: PDC_KEY, value: list as any },
    update: { value: list as any },
  });
}

export class PdcService {
  async getPdcList(tenantId: string): Promise<PostDatedCheque[]> {
    return await getPdcStore(tenantId);
  }

  async createPdc(tenantId: string, data: Omit<PostDatedCheque, 'id' | 'status' | 'createdAt' | 'tenantId'>): Promise<PostDatedCheque> {
    const list = await getPdcStore(tenantId);
    const newItem: PostDatedCheque = {
      id: `pdc-${Date.now()}`,
      tenantId,
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    await savePdcStore(tenantId, list);
    return newItem;
  }

  async promoteToActiveVoucher(tenantId: string, pdcId: string): Promise<{ success: boolean; voucherNumber: string; pdc: PostDatedCheque }> {
    const list = await getPdcStore(tenantId);
    const item = list.find((p) => p.id === pdcId);
    if (!item) {
      throw new Error('PDC item not found');
    }

    const prefix = item.voucherType === 'PDC_RECEIPT' ? 'RCPT' : item.voucherType === 'PDC_PAYMENT' ? 'PMT' : 'JV';
    const voucherNumber = `${prefix}/AUTO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    item.status = 'CLEARED_ACTIVE';
    item.promotedVoucherNumber = voucherNumber;
    item.promotedAt = new Date().toISOString();

    await savePdcStore(tenantId, list);

    return { success: true, voucherNumber, pdc: item };
  }
}

export const pdcService = new PdcService();
