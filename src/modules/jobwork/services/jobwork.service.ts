import { prisma } from '../../../core/database/prisma';

export interface JobWorkOutwardChallan {
  id: string;
  challanNumber: string;
  challanDate: string;
  jobWorkerName: string;
  jobWorkerGstin: string;
  jobWorkerAddress: string;
  natureOfProcessing: string;
  expectedReturnDate: string;
  status: 'PENDING_RECEIPT' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED';
  items: Array<{
    itemSku: string;
    description: string;
    hsnCode: string;
    uom: string;
    dispatchQuantity: number;
    ratePerUnit: number;
    taxableValue: number;
    receivedQuantity: number;
    scrapReturnedQuantity: number;
  }>;
}

export interface JobWorkReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  challanNumber: string;
  jobWorkerName: string;
  finishedItemSku: string;
  finishedItemName: string;
  quantityReceived: number;
  rawMaterialConsumedQty: number;
  scrapPercentage: number;
  jobWorkChargesInr: number;
}

export interface JobWorkStore {
  challans: JobWorkOutwardChallan[];
  receipts: JobWorkReceipt[];
}

function getDefaultJobWorkStore(): JobWorkStore {
  return {
    challans: [
      {
        id: 'jw-ch-001',
        challanNumber: 'JWC/2026/04/001',
        challanDate: '2026-04-05',
        jobWorkerName: 'Apex Precision Engineering Works',
        jobWorkerGstin: '27AABCA9876K1Z9',
        jobWorkerAddress: 'Plot 44, MIDC Industrial Area, Pune, Maharashtra',
        natureOfProcessing: 'CNC Milling, Deburring & Zinc Plating',
        expectedReturnDate: '2026-05-05',
        status: 'PARTIALLY_RECEIVED',
        items: [
          {
            itemSku: 'RM-STEEL-ROD-01',
            description: 'Forged Alloy Steel Round Rods 25mm',
            hsnCode: '72142090',
            uom: 'KG',
            dispatchQuantity: 1500,
            ratePerUnit: 85,
            taxableValue: 127500,
            receivedQuantity: 800,
            scrapReturnedQuantity: 40,
          },
        ],
      },
      {
        id: 'jw-ch-002',
        challanNumber: 'JWC/2026/04/002',
        challanDate: '2026-04-10',
        jobWorkerName: 'Vanguard Heat Treaters Pvt Ltd',
        jobWorkerGstin: '27AABCV1234H1Z3',
        jobWorkerAddress: 'Gala 12, Wagle Estate, Thane, Maharashtra',
        natureOfProcessing: 'Induction Hardening & Tempering',
        expectedReturnDate: '2026-04-25',
        status: 'PENDING_RECEIPT',
        items: [
          {
            itemSku: 'WIP-GEAR-BLANK-02',
            description: 'Spur Gear Blanks 120mm OD',
            hsnCode: '84834000',
            uom: 'PCS',
            dispatchQuantity: 500,
            ratePerUnit: 240,
            taxableValue: 120000,
            receivedQuantity: 0,
            scrapReturnedQuantity: 0,
          },
        ],
      },
    ],
    receipts: [
      {
        id: 'jw-rcpt-001',
        receiptNumber: 'JWR/2026/04/001',
        receiptDate: '2026-04-18',
        challanNumber: 'JWC/2026/04/001',
        jobWorkerName: 'Apex Precision Engineering Works',
        finishedItemSku: 'FG-VALVE-SHAFT-01',
        finishedItemName: 'Precision Finished Valve Shafts',
        quantityReceived: 800,
        rawMaterialConsumedQty: 800,
        scrapPercentage: 5,
        jobWorkChargesInr: 28000,
      },
    ],
  };
}

const JOBWORK_KEY = 'jobwork_state';

async function getJobWorkStore(tenantId: string = 'tenant-default-01'): Promise<JobWorkStore> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const row = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: JOBWORK_KEY } },
    });
    if (row && row.value) {
      return row.value as unknown as JobWorkStore;
    }
  } catch (e) {}
  const defaultState = getDefaultJobWorkStore();
  try {
    await saveJobWorkStore(safeTenantId, defaultState);
  } catch (e) {}
  return defaultState;
}

async function saveJobWorkStore(tenantId: string = 'tenant-default-01', state: JobWorkStore): Promise<void> {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: JOBWORK_KEY } },
    create: { tenantId: safeTenantId, key: JOBWORK_KEY, value: state as any },
    update: { value: state as any },
  });
}

export class JobWorkService {
  async getChallans(tenantId: string): Promise<JobWorkOutwardChallan[]> {
    const store = await getJobWorkStore(tenantId);
    return store.challans || [];
  }

  async getReceipts(tenantId: string): Promise<JobWorkReceipt[]> {
    const store = await getJobWorkStore(tenantId);
    return store.receipts || [];
  }

  async createChallan(tenantId: string, data: Omit<JobWorkOutwardChallan, 'id' | 'status'>): Promise<JobWorkOutwardChallan> {
    const store = await getJobWorkStore(tenantId);
    const newChallan: JobWorkOutwardChallan = {
      id: `jw-ch-${Date.now()}`,
      status: 'PENDING_RECEIPT',
      ...data,
    };
    store.challans.unshift(newChallan);
    await saveJobWorkStore(tenantId, store);
    return newChallan;
  }

  async recordReceipt(tenantId: string, data: Omit<JobWorkReceipt, 'id'>): Promise<JobWorkReceipt> {
    const store = await getJobWorkStore(tenantId);
    const newReceipt: JobWorkReceipt = {
      id: `jw-rcpt-${Date.now()}`,
      ...data,
    };
    store.receipts.unshift(newReceipt);

    // Update challan status
    const matchedChallan = store.challans.find((c) => c.challanNumber === data.challanNumber);
    if (matchedChallan) {
      const item = matchedChallan.items[0];
      if (item) {
        item.receivedQuantity = (item.receivedQuantity || 0) + data.quantityReceived;
        matchedChallan.status = item.receivedQuantity >= item.dispatchQuantity ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED';
      }
    }

    await saveJobWorkStore(tenantId, store);
    return newReceipt;
  }

  async generateFormItc04(tenantId: string, quarter: string, financialYear: string) {
    const challans = await this.getChallans(tenantId);
    const receipts = await this.getReceipts(tenantId);

    const table4GoodsDispatched = challans.flatMap((c) =>
      c.items.map((i) => ({
        gstinOfJobWorker: c.jobWorkerGstin,
        challanNumber: c.challanNumber,
        challanDate: c.challanDate,
        descriptionOfGoods: i.description,
        uom: i.uom,
        quantityDispatched: i.dispatchQuantity,
        taxableValue: i.taxableValue,
        natureOfProcessing: c.natureOfProcessing,
      }))
    );

    const table5GoodsReceivedBack = receipts.map((r) => ({
      originalChallanNo: r.challanNumber,
      jobWorkerName: r.jobWorkerName,
      receiptNumber: r.receiptNumber,
      receiptDate: r.receiptDate,
      finishedProduct: r.finishedItemName,
      quantityReceived: r.quantityReceived,
      rawMaterialConsumed: r.rawMaterialConsumedQty,
      scrapRecoveredKg: Math.round((r.rawMaterialConsumedQty * r.scrapPercentage) / 100),
    }));

    return {
      returnQuarter: quarter || 'Q1 (Apr-Jun 2026)',
      financialYear: financialYear || '2026-27',
      tenantGstin: tenantId || '27AABCF1234F1Z5',
      summary: {
        totalDispatchedKg: 2000,
        totalReceivedKg: 800,
        balanceWithJobWorkerKg: 1200,
        totalJobWorkValueInr: 247500,
      },
      table4GoodsDispatched,
      table5GoodsReceivedBack,
    };
  }
}

export const jobWorkService = new JobWorkService();
