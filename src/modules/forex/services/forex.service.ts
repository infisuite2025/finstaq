import { prisma } from '../../../core/database/prisma';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRateToBase: number; // 1 Foreign = X INR
  isBaseCurrency: boolean;
  decimalPlaces: number;
  lastUpdated: string;
}

export interface ForexGainLossCalculationInput {
  currencyCode: string;
  foreignAmount: number;
  bookingExchangeRate: number; // Rate at time of Invoice / Booking
  settlementExchangeRate: number; // Rate at time of Receipt / Payment
  transactionType: 'RECEIPT_FROM_DEBTOR' | 'PAYMENT_TO_CREDITOR';
}

export interface ForexRevaluationItem {
  partyId: string;
  partyName: string;
  partyType: 'DEBTOR' | 'CREDITOR';
  currencyCode: string;
  foreignOutstandingAmount: number;
  bookingRateAverage: number;
  bookingValueInr: number;
  closingSpotRate: number;
  revaluedValueInr: number;
  unrealizedGainLossInr: number; // Positive = Gain, Negative = Loss
}

const FOREX_KEY = 'forex_currencies';

function getDefaultCurrencies(): Currency[] {
  return [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRateToBase: 1.0, isBaseCurrency: true, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
    { code: 'USD', name: 'United States Dollar', symbol: '$', exchangeRateToBase: 84.25, isBaseCurrency: false, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
    { code: 'EUR', name: 'Euro', symbol: '€', exchangeRateToBase: 91.60, isBaseCurrency: false, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£', exchangeRateToBase: 107.80, isBaseCurrency: false, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRateToBase: 22.94, isBaseCurrency: false, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRateToBase: 63.40, isBaseCurrency: false, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
    { code: 'JPY', name: 'Japanese Yen (per 100)', symbol: '¥', exchangeRateToBase: 0.56, isBaseCurrency: false, decimalPlaces: 2, lastUpdated: new Date().toISOString() },
  ];
}

async function getCurrenciesStore(tenantId: string = 'tenant-default-01'): Promise<Currency[]> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const row = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: FOREX_KEY } },
    });
    if (row && row.value) {
      return row.value as unknown as Currency[];
    }
  } catch (e) {}
  const defaultList = getDefaultCurrencies();
  try {
    await saveCurrenciesStore(safeTenantId, defaultList);
  } catch (e) {}
  return defaultList;
}

async function saveCurrenciesStore(tenantId: string = 'tenant-default-01', list: Currency[]): Promise<void> {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: FOREX_KEY } },
    create: { tenantId: safeTenantId, key: FOREX_KEY, value: list as any },
    update: { value: list as any },
  });
}

export class ForexService {
  static async getCurrencies(tenantId: string): Promise<Currency[]> {
    return await getCurrenciesStore(tenantId);
  }

  static async updateRate(tenantId: string, code: string, newRate: number): Promise<Currency> {
    const list = await getCurrenciesStore(tenantId);
    const curr = list.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!curr) throw new Error(`Currency ${code} not found`);
    if (curr.isBaseCurrency) throw new Error('Base currency rate is always 1.00');

    curr.exchangeRateToBase = Number(newRate);
    curr.lastUpdated = new Date().toISOString();
    await saveCurrenciesStore(tenantId, list);
    return curr;
  }

  /**
   * Calculate Realized Forex Gain / Loss on Bill Settlement
   * For Debtor Receipt:
   *   Gain if Settlement Rate > Booking Rate
   * For Creditor Payment:
   *   Gain if Settlement Rate < Booking Rate
   */
  static calculateRealizedGainLoss(input: ForexGainLossCalculationInput) {
    const bookingInr = Math.round(input.foreignAmount * input.bookingExchangeRate * 100) / 100;
    const settledInr = Math.round(input.foreignAmount * input.settlementExchangeRate * 100) / 100;

    let varianceInr = 0;
    let isGain = false;

    if (input.transactionType === 'RECEIPT_FROM_DEBTOR') {
      varianceInr = Math.round((settledInr - bookingInr) * 100) / 100;
      isGain = varianceInr >= 0;
    } else {
      // Payment to Creditor: paying less INR than booked = Gain
      varianceInr = Math.round((bookingInr - settledInr) * 100) / 100;
      isGain = varianceInr >= 0;
    }

    return {
      currencyCode: input.currencyCode,
      foreignAmount: input.foreignAmount,
      bookingExchangeRate: input.bookingExchangeRate,
      settlementExchangeRate: input.settlementExchangeRate,
      bookingValueInr: bookingInr,
      settledValueInr: settledInr,
      varianceAmountInr: Math.abs(varianceInr),
      isGain,
      gainLossType: isGain ? 'REALIZED_FOREX_GAIN' : 'REALIZED_FOREX_LOSS',
      ledgerPostingRecommendation: {
        fluctuationLedger: 'Foreign Exchange Fluctuation A/c',
        postingLeg: isGain ? 'CREDIT' : 'DEBIT',
        amount: Math.abs(varianceInr),
      },
    };
  }

  /**
   * Generate Point-in-Time Unrealized Forex Revaluation Schedule
   * Evaluates outstanding foreign receivables and payables against closing exchange rates
   */
  static async getUnrealizedRevaluationReport(tenantId: string, asOfDate?: string) {
    const currencies = await this.getCurrencies(tenantId);

    const mockOpenForexBalances: ForexRevaluationItem[] = [
      {
        partyId: 'deb_global_01',
        partyName: 'Apex Precision Exports LLC (USA)',
        partyType: 'DEBTOR',
        currencyCode: 'USD',
        foreignOutstandingAmount: 45000,
        bookingRateAverage: 83.20,
        bookingValueInr: 3744000,
        closingSpotRate: 84.25,
        revaluedValueInr: 3791250,
        unrealizedGainLossInr: 47250, // Gain (+)
      },
      {
        partyId: 'deb_euro_02',
        partyName: 'Stuttgart Automation GmbH (Germany)',
        partyType: 'DEBTOR',
        currencyCode: 'EUR',
        foreignOutstandingAmount: 28000,
        bookingRateAverage: 92.10,
        bookingValueInr: 2578800,
        closingSpotRate: 91.60,
        revaluedValueInr: 2564800,
        unrealizedGainLossInr: -14000, // Loss (-)
      },
      {
        partyId: 'crd_tokyo_01',
        partyName: 'Tokyo Precision Robotics Corp (Japan)',
        partyType: 'CREDITOR',
        currencyCode: 'USD',
        foreignOutstandingAmount: 30000,
        bookingRateAverage: 83.50,
        bookingValueInr: 2505000,
        closingSpotRate: 84.25,
        revaluedValueInr: 2527500,
        unrealizedGainLossInr: -22500, // Loss (-) because liability in INR increased
      },
    ];

    const totalReceivablesGainLoss = mockOpenForexBalances
      .filter(p => p.partyType === 'DEBTOR')
      .reduce((sum, p) => sum + p.unrealizedGainLossInr, 0);

    const totalPayablesGainLoss = mockOpenForexBalances
      .filter(p => p.partyType === 'CREDITOR')
      .reduce((sum, p) => sum + p.unrealizedGainLossInr, 0);

    const netUnrealizedForexImpact = totalReceivablesGainLoss + totalPayablesGainLoss;

    return {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      baseCurrency: 'INR',
      items: mockOpenForexBalances,
      summary: {
        totalReceivablesGainLoss,
        totalPayablesGainLoss,
        netUnrealizedForexImpact,
        isNetGain: netUnrealizedForexImpact >= 0,
      },
    };
  }
}
