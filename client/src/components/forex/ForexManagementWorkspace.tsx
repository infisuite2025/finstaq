import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Coins,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calculator,
  Calendar,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRateToBase: number;
  isBaseCurrency: boolean;
  decimalPlaces: number;
}

interface RevaluationItem {
  partyId: string;
  partyName: string;
  partyType: 'DEBTOR' | 'CREDITOR';
  currencyCode: string;
  foreignOutstandingAmount: number;
  bookingRateAverage: number;
  bookingValueInr: number;
  closingSpotRate: number;
  revaluedValueInr: number;
  unrealizedGainLossInr: number;
}

export function ForexManagementWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'currencies' | 'calculator' | 'revaluation'>('currencies');
  const { getAuthHeaders } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Edit Rate Modal/Inline state
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editedRate, setEditedRate] = useState<number>(0);

  // Realized Gain/Loss Calculator State
  const [calcCurrency, setCalcCurrency] = useState<string>('USD');
  const [calcForeignAmt, setCalcForeignAmt] = useState<number>(10000);
  const [calcBookingRate, setCalcBookingRate] = useState<number>(83.00);
  const [calcSettlementRate, setCalcSettlementRate] = useState<number>(84.50);
  const [calcTxnType, setCalcTxnType] = useState<'RECEIPT_FROM_DEBTOR' | 'PAYMENT_TO_CREDITOR'>('RECEIPT_FROM_DEBTOR');
  const [calcResult, setCalcResult] = useState<any | null>(null);

  // Revaluation Report State
  const [revalCutoffDate, setRevalCutoffDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [revaluationData, setRevaluationData] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrencies();
    fetchRevaluationReport(revalCutoffDate);
  }, []);

  useEffect(() => {
    fetchRevaluationReport(revalCutoffDate);
  }, [revalCutoffDate]);

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/v1/forex/currencies', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setCurrencies(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Failed to fetch currencies', err);
    }
  };

  const fetchRevaluationReport = async (date: string) => {
    try {
      const res = await fetch(`/api/v1/forex/revaluation-report?asOfDate=${date}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setRevaluationData(data.data);
    } catch (err) {
      console.error('Failed to fetch revaluation', err);
    }
  };

  const handleUpdateRate = async (code: string) => {
    try {
      const res = await fetch('/api/v1/forex/rates/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({ code, exchangeRateToBase: editedRate }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Updated ${code} spot rate to ₹${editedRate}`);
        setEditingCode(null);
        fetchCurrencies();
        fetchRevaluationReport(revalCutoffDate);
      }
    } catch (err) {
      toast.error('Failed to update rate');
    }
  };

  const handleCalculateGainLoss = async () => {
    try {
      const res = await fetch('/api/v1/forex/calculate-gain-loss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({
          currencyCode: calcCurrency,
          foreignAmount: calcForeignAmt,
          bookingExchangeRate: calcBookingRate,
          settlementExchangeRate: calcSettlementRate,
          transactionType: calcTxnType,
        }),
      });
      const data = await res.json();
      if (data.success) setCalcResult(data.data);
    } catch (err) {
      toast.error('Calculation error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <Coins className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Multi-Currency & Forex Management</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                AS 11 / Ind AS 21
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live exchange rates, automatic realized Forex gain/loss on bill settlements, and period-end unrealized revaluations.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <StandardTabs<'currencies' | 'calculator' | 'revaluation'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'currencies',
            label: 'Currency Masters & Rates',
            icon: Coins,
            badge: currencies.length,
            badgeVariant: 'default',
          },
          {
            id: 'calculator',
            label: 'Settlement Fluctuation',
            icon: Calculator,
          },
          {
            id: 'revaluation',
            label: 'Unrealized Revaluation',
            icon: TrendingUp,
          },
        ]}
      />

      {/* TAB 1: CURRENCY MASTER & SPOT RATES */}
      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currencies.map((curr) => (
            <div key={curr.code} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    {curr.symbol}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{curr.name}</h3>
                    <span className="font-mono text-xs font-bold text-slate-400">{curr.code}</span>
                  </div>
                </div>

                {curr.isBaseCurrency ? (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    Base Currency
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCode(curr.code);
                      setEditedRate(curr.exchangeRateToBase);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Edit Rate
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Exchange Rate (to INR):</span>
                {editingCode === curr.code ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editedRate}
                      onChange={(e) => setEditedRate(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold"
                    />
                    <button
                      onClick={() => handleUpdateRate(curr.code)}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCode(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                    1 {curr.code} = ₹{curr.exchangeRateToBase.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REALIZED FOREX GAIN / LOSS CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Realized Settlement Fluctuation Calculator</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Currency</label>
                <select
                  value={calcCurrency}
                  onChange={(e) => setCalcCurrency(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {currencies.filter(c => !c.isBaseCurrency).map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Transaction Nature</label>
                <select
                  value={calcTxnType}
                  onChange={(e) => setCalcTxnType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="RECEIPT_FROM_DEBTOR">Receipt from Customer / Debtor (Export Sale)</option>
                  <option value="PAYMENT_TO_CREDITOR">Payment to Vendor / Creditor (Import Purchase)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Foreign Amount ({calcCurrency})</label>
                <input
                  type="number"
                  value={calcForeignAmt}
                  onChange={(e) => setCalcForeignAmt(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Booking Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcBookingRate}
                    onChange={(e) => setCalcBookingRate(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Settlement Spot Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcSettlementRate}
                    onChange={(e) => setCalcSettlementRate(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleCalculateGainLoss}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition-all cursor-pointer"
              >
                Calculate Realized Fluctuation
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Forex Fluctuation Accounting Impact</h3>

            {calcResult ? (
              <div className="space-y-4">
                <div className={`p-5 rounded-xl border flex items-center justify-between ${calcResult.isGain ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'}`}>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${calcResult.isGain ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {calcResult.isGain ? 'Realized Forex Gain (+)' : 'Realized Forex Loss (-)'}
                    </span>
                    <h4 className={`text-2xl font-bold font-mono ${calcResult.isGain ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'}`}>
                      ₹{calcResult.varianceAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h4>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>Booked Value: ₹{calcResult.bookingValueInr.toLocaleString('en-IN')}</p>
                    <p>Settled Value: ₹{calcResult.settledValueInr.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">Recommended Accounting Entry:</h5>
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-lg font-mono text-slate-700 dark:text-slate-300">
                    <div>{calcResult.ledgerPostingRecommendation.postingLeg === 'CREDIT' ? 'CR' : 'DR'}: {calcResult.ledgerPostingRecommendation.fluctuationLedger} ➔ ₹{calcResult.ledgerPostingRecommendation.amount.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Enter foreign transaction details and calculate to preview accounting impact.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: UNREALIZED REVALUATION SCHEDULE */}
      {activeTab === 'revaluation' && revaluationData && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Point-in-Time Unrealized Forex Revaluation Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark-to-market revaluation of open foreign receivables & payables as per AS 11.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={revalCutoffDate}
                onChange={(e) => setRevalCutoffDate(e.target.value)}
                className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Party & Type</th>
                  <th className="py-3 px-4 text-center">Foreign Bal</th>
                  <th className="py-3 px-4 text-right">Avg Book Rate</th>
                  <th className="py-3 px-4 text-right">Book Value (INR)</th>
                  <th className="py-3 px-4 text-right">Closing Spot Rate</th>
                  <th className="py-3 px-4 text-right">Revalued (INR)</th>
                  <th className="py-3 px-4 text-right">Unrealized Gain / (Loss)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {revaluationData.items.map((row: RevaluationItem, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.partyName}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${row.partyType === 'DEBTOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'}`}>
                        {row.partyType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {row.currencyCode} {row.foreignOutstandingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">₹{row.bookingRateAverage.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{row.bookingValueInr.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-blue-600">₹{row.closingSpotRate.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">₹{row.revaluedValueInr.toLocaleString('en-IN')}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${row.unrealizedGainLossInr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {row.unrealizedGainLossInr >= 0 ? '+' : ''}₹{row.unrealizedGainLossInr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Net Period-End Unrealized Forex Impact:</span>
            <span className={`text-lg font-bold font-mono ${revaluationData.summary.netUnrealizedForexImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {revaluationData.summary.netUnrealizedForexImpact >= 0 ? '+' : ''}₹{revaluationData.summary.netUnrealizedForexImpact.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
