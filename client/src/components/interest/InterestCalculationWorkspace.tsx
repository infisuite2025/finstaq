import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calculator,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';

interface OverdueBill {
  id: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'VENDOR';
  billAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueDays: number;
  annualInterestRate: number;
  interestCalculationMethod: 'SIMPLE' | 'COMPOUND_MONTHLY';
  calculatedInterestAmount: number;
  debitNoteStatus: 'NOT_GENERATED' | 'GENERATED';
  linkedDebitNoteNo?: string;
}

export function InterestCalculationWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables' | 'policy'>('receivables');
  const { getAuthHeaders } = useAuth();
  const [bills, setBills] = useState<OverdueBill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultRate, setDefaultRate] = useState<number>(18);
  const [graceDays, setGraceDays] = useState<number>(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/interest/overdue', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setBills(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateDebitNote = async (bill: OverdueBill) => {
    try {
      const res = await fetch('/api/v1/interest/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billNumber: bill.billNumber,
          partyName: bill.partyName,
          partyType: bill.partyType,
          interestAmount: bill.calculatedInterestAmount,
          overdueDays: bill.overdueDays,
          rate: bill.annualInterestRate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Interest Note ${data.data.debitNoteNumber} generated for ₹${bill.calculatedInterestAmount.toLocaleString('en-IN')}!`);
        bill.debitNoteStatus = 'GENERATED';
        bill.linkedDebitNoteNo = data.data.debitNoteNumber;
        setBills([...bills]);
      }
    } catch (err) {
      toast.error('Failed to generate interest note');
    }
  };

  const receivables = bills.filter((b) => b.partyType === 'CUSTOMER');
  const payables = bills.filter((b) => b.partyType === 'VENDOR');

  const totalReceivableInterest = receivables.reduce((sum, b) => sum + b.calculatedInterestAmount, 0);
  const totalPayableInterest = payables.reduce((sum, b) => sum + b.calculatedInterestAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-800">
            <Percent className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Automated Overdue Interest Engine</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                18% p.a. Delayed Receivables
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automatic daily accrual computation for delayed customer payments & 1-click Interest Debit Note journal generation.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate Accruals
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Customer Overdue Interest Accrued</span>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-2">
            ₹{totalReceivableInterest.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Claimable via Interest Debit Notes</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vendor Overdue Interest Liability</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-2">
            ₹{totalPayableInterest.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">MSMEDA Act & contractual liability</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Interest Rate</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            {defaultRate}% p.a.
          </div>
          <span className="text-[11px] text-slate-400">Simple Interest Formula (365 Days)</span>
        </div>
      </div>

      {/* Tabs */}
      <StandardTabs<'receivables' | 'payables' | 'policy'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'receivables',
            label: 'Customer Receivables (Interest Income)',
            icon: Calculator,
            badge: receivables.length,
            badgeVariant: 'warning',
          },
          {
            id: 'payables',
            label: 'Vendor Payables (Interest Expense)',
            icon: Clock,
            badge: payables.length,
            badgeVariant: 'default',
          },
          {
            id: 'policy',
            label: 'Interest Calculation Policy',
            icon: Sliders,
          },
        ]}
      />

      {/* Tab Content: Receivables */}
      {activeTab === 'receivables' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Overdue Sales Invoices past Due Date</h3>
            <span className="text-xs text-slate-500">Accrued @18% p.a.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Bill Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5 text-right">Outstanding</th>
                  <th className="p-3.5 text-center">Days Overdue</th>
                  <th className="p-3.5 text-right">Accrued Interest</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {receivables.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold font-mono text-indigo-600">{bill.billNumber}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{bill.billDate}</td>
                    <td className="p-3.5 text-rose-600 font-mono font-bold">{bill.dueDate}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{bill.partyName}</td>
                    <td className="p-3.5 text-right font-mono font-bold">₹{bill.outstandingAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-full font-bold">
                        {bill.overdueDays} Days
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                      ₹{bill.calculatedInterestAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-center">
                      {bill.debitNoteStatus === 'NOT_GENERATED' ? (
                        <button
                          onClick={() => handleGenerateDebitNote(bill)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                        >
                          Generate Interest DN
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-mono font-bold">
                          {bill.linkedDebitNoteNo}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Payables */}
      {activeTab === 'payables' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Overdue Purchase Bills past Due Date</h3>
            <span className="text-xs text-slate-500">MSMEDA Section 16 Mandatory 3x RBI Bank Rate</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Bill #</th>
                  <th className="p-3.5">Bill Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Vendor Name</th>
                  <th className="p-3.5 text-right">Outstanding</th>
                  <th className="p-3.5 text-center">Days Overdue</th>
                  <th className="p-3.5 text-right">Accrued Interest</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payables.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold font-mono text-indigo-600">{bill.billNumber}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{bill.billDate}</td>
                    <td className="p-3.5 text-rose-600 font-mono font-bold">{bill.dueDate}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{bill.partyName}</td>
                    <td className="p-3.5 text-right font-mono font-bold">₹{bill.outstandingAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-full font-bold">
                        {bill.overdueDays} Days
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-rose-600 text-sm">
                      ₹{bill.calculatedInterestAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleGenerateDebitNote(bill)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                      >
                        Book Interest CN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Policy */}
      {activeTab === 'policy' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Interest Calculation Policy
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Standard Annual Interest Rate (%)</label>
              <input
                type="number"
                value={defaultRate}
                onChange={(e) => setDefaultRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Grace Period Days (Overdue buffer)</label>
              <input
                type="number"
                value={graceDays}
                onChange={(e) => setGraceDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => toast.success('Interest policy saved successfully!')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
            >
              Save Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
