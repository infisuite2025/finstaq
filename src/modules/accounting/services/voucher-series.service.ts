import { VoucherType } from '@prisma/client';
import { prisma } from '../../../core/database/prisma';

export interface VoucherSeriesConfig {
  id: string;
  tenantId: string;
  voucherType: VoucherType | string;
  seriesName: string;
  prefix: string;
  suffix: string;
  startNumber: number;
  currentNumber: number;
  paddingDigits: number;
  restartFrequency: 'NEVER' | 'DAILY' | 'MONTHLY' | 'YEARLY';
  isDefault: boolean;
  isActive: boolean;
  lastUsedDate?: string;
}

const SERIES_KEY = 'voucher_series_config';

function getInitialSeries(tenantId: string): VoucherSeriesConfig[] {
  return [
    {
      id: 'series-sales-default',
      tenantId,
      voucherType: 'SALES',
      seriesName: 'Main Sales Tax Invoice',
      prefix: 'INV/2026-27/',
      suffix: '',
      startNumber: 1,
      currentNumber: 142,
      paddingDigits: 4,
      restartFrequency: 'YEARLY',
      isDefault: true,
      isActive: true,
      lastUsedDate: new Date().toISOString(),
    },
    {
      id: 'series-purchase-default',
      tenantId,
      voucherType: 'PURCHASE',
      seriesName: 'Standard Purchase Bill',
      prefix: 'PUR/2026/',
      suffix: '',
      startNumber: 1,
      currentNumber: 88,
      paddingDigits: 4,
      restartFrequency: 'YEARLY',
      isDefault: true,
      isActive: true,
      lastUsedDate: new Date().toISOString(),
    },
    {
      id: 'series-payment-default',
      tenantId,
      voucherType: 'PAYMENT',
      seriesName: 'Bank & Cash Payment',
      prefix: 'PV/26-27/',
      suffix: '',
      startNumber: 1,
      currentNumber: 215,
      paddingDigits: 4,
      restartFrequency: 'YEARLY',
      isDefault: true,
      isActive: true,
      lastUsedDate: new Date().toISOString(),
    },
    {
      id: 'series-receipt-default',
      tenantId,
      voucherType: 'RECEIPT',
      seriesName: 'Official Receipt',
      prefix: 'REC/26-27/',
      suffix: '',
      startNumber: 1,
      currentNumber: 189,
      paddingDigits: 4,
      restartFrequency: 'YEARLY',
      isDefault: true,
      isActive: true,
      lastUsedDate: new Date().toISOString(),
    },
    {
      id: 'series-journal-default',
      tenantId,
      voucherType: 'JOURNAL',
      seriesName: 'General Journal Voucher',
      prefix: 'JV/2026/',
      suffix: '',
      startNumber: 1,
      currentNumber: 94,
      paddingDigits: 4,
      restartFrequency: 'YEARLY',
      isDefault: true,
      isActive: true,
      lastUsedDate: new Date().toISOString(),
    },
    {
      id: 'series-contra-default',
      tenantId,
      voucherType: 'CONTRA',
      seriesName: 'Contra Fund Transfer',
      prefix: 'CNT/26-27/',
      suffix: '',
      startNumber: 1,
      currentNumber: 42,
      paddingDigits: 4,
      restartFrequency: 'YEARLY',
      isDefault: true,
      isActive: true,
      lastUsedDate: new Date().toISOString(),
    },
  ];
}

async function getTenantSeriesStore(tenantId: string): Promise<VoucherSeriesConfig[]> {
  const row = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: SERIES_KEY } },
  });
  if (row && row.value) {
    return row.value as unknown as VoucherSeriesConfig[];
  }
  const defaultList = getInitialSeries(tenantId);
  await saveTenantSeriesStore(tenantId, defaultList);
  return defaultList;
}

async function saveTenantSeriesStore(tenantId: string, list: VoucherSeriesConfig[]): Promise<void> {
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId, key: SERIES_KEY } },
    create: { tenantId, key: SERIES_KEY, value: list as any },
    update: { value: list as any },
  });
}

export class VoucherSeriesService {
  public static async listSeries(tenantId: string, voucherType?: string): Promise<VoucherSeriesConfig[]> {
    const all = await getTenantSeriesStore(tenantId);
    if (voucherType) {
      return all.filter((s) => s.voucherType.toUpperCase() === voucherType.toUpperCase());
    }
    return all;
  }

  public static async getSeriesById(tenantId: string, seriesId: string): Promise<VoucherSeriesConfig | undefined> {
    const all = await getTenantSeriesStore(tenantId);
    return all.find((s) => s.id === seriesId);
  }

  public static async saveSeries(tenantId: string, payload: Partial<VoucherSeriesConfig>): Promise<VoucherSeriesConfig> {
    const list = await getTenantSeriesStore(tenantId);
    if (payload.id) {
      const idx = list.findIndex((s) => s.id === payload.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...payload };
        await saveTenantSeriesStore(tenantId, list);
        return list[idx];
      }
    }

    const newSeries: VoucherSeriesConfig = {
      id: `series-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId,
      voucherType: (payload.voucherType || 'JOURNAL') as VoucherType,
      seriesName: payload.seriesName || 'Custom Series',
      prefix: payload.prefix ?? '',
      suffix: payload.suffix ?? '',
      startNumber: payload.startNumber ?? 1,
      currentNumber: payload.startNumber ? payload.startNumber - 1 : 0,
      paddingDigits: payload.paddingDigits ?? 4,
      restartFrequency: payload.restartFrequency ?? 'YEARLY',
      isDefault: payload.isDefault ?? false,
      isActive: payload.isActive ?? true,
      lastUsedDate: new Date().toISOString(),
    };

    if (newSeries.isDefault) {
      list.forEach((s) => {
        if (s.voucherType === newSeries.voucherType) {
          s.isDefault = false;
        }
      });
    }

    list.push(newSeries);
    await saveTenantSeriesStore(tenantId, list);
    return newSeries;
  }

  public static async getNextVoucherNumber(
    tenantId: string,
    voucherType: string,
    seriesId?: string,
    increment: boolean = false
  ): Promise<{ seriesId: string; seriesName: string; voucherNumber: string; nextSequence: number }> {
    const list = await getTenantSeriesStore(tenantId);
    let series = seriesId ? list.find((s) => s.id === seriesId) : undefined;

    if (!series) {
      series = list.find((s) => s.voucherType.toUpperCase() === voucherType.toUpperCase() && s.isDefault);
    }
    if (!series) {
      series = list.find((s) => s.voucherType.toUpperCase() === voucherType.toUpperCase());
    }

    if (!series) {
      const defaultNo = `${voucherType.slice(0, 3)}/2026/0001`;
      return {
        seriesId: 'default',
        seriesName: 'Default Series',
        voucherNumber: defaultNo,
        nextSequence: 1,
      };
    }

    const nextSeq = series.currentNumber + 1;
    const formattedNum = String(nextSeq).padStart(series.paddingDigits, '0');
    const voucherNumber = `${series.prefix}${formattedNum}${series.suffix}`;

    if (increment) {
      series.currentNumber = nextSeq;
      series.lastUsedDate = new Date().toISOString();
      await saveTenantSeriesStore(tenantId, list);
    }

    return {
      seriesId: series.id,
      seriesName: series.seriesName,
      voucherNumber,
      nextSequence: nextSeq,
    };
  }
}

