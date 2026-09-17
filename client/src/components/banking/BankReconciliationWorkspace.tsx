import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Landmark,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Calendar,
  Printer,
  Download,
  Search,
  SlidersHorizontal,
  Info,
  Clock,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface BankLedger {
  id: string;
  name: string;
  code?: string;
  bankAccount?: string;
  ifscCode?: string;
  openingBalance: number;
  currentBalance?: number;
}

interface BankTransaction {
  id: string;
  voucherId: string;
  voucherType: string;
  voucherNumber: string;
  date: string;
  narration: string;
  referenceNumber: string;
  debitAmount: number;   // Inward (Deposit)
  creditAmount: number;  // Outward (Payment)
  clearedDate: string | null;
  isReconciled: boolean;
  bankRef: string | null;
}

interface BrsReportData {
  asOfDate: string;
  ledger: {
    id: string;
    name: string;
    code?: string;
    bankAccount?: string;
    ifscCode?: string;
  };
  summary: {
    balanceAsPerBooks: number;
    totalUnpresentedCheques: number;
    totalUncreditedCheques: number;
    calculatedBalanceAsPerBank: number;
    actualStatementBalance: number;
    variance: number;
    isFullyReconciled: boolean;
  };
  unpresentedCheques: any[];
  uncreditedCheques: any[];
}

export function BankReconciliationWorkspace() {
  const toast = useToast();
  const [bankLedgers, setBankLedgers] = useState<BankLedger[]>([]);
  const { getAuthHeaders } = useAuth();
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('');
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  
  // Cutoff date for BRS calculation (Default: current date)
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statementBalanceInput, setStatementBalanceInput] = useState<string>('');
  const [brsReport, setBrsReport] = useState<BrsReportData | null>(null);

  // Active subtab: 'reconciler' | 'statement-upload' | 'brs-statement'
  const [activeTab, setActiveTab] = useState<'reconciler' | 'statement-upload' | 'brs-statement'>('reconciler');
  const [filterType, setFilterType] = useState<'ALL' | 'UNRECONCILED' | 'RECONCILED'>('UNRECONCILED');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Statement Upload State
  const [csvText, setCsvText] = useState<string>(`Date,Narration,RefNumber,Withdrawal,Deposit,Balance
2026-03-08,NEFT Clrg TechnoKraft Solutions UTR987654321,UTR987654321,0,125000,525000
2026-03-11,CHQ WDL 554432 Acme Vendors Ltd,554432,45000,0,480000
2026-03-20,Bank Charges Q4 2026,CHG8877,1500,0,478500`);

  // Load Bank Ledgers on mount
  useEffect(() => {
    fetchBankLedgers();
  }, []);

  // When selected ledger changes, fetch transactions & BRS
  useEffect(() => {
    if (selectedLedgerId) {
      fetchTransactions(selectedLedgerId);
      fetchBrsReport(selectedLedgerId, asOfDate);
    }
  }, [selectedLedgerId, asOfDate]);

  const fetchBankLedgers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/banking/bank-ledgers', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setBankLedgers(Array.isArray(data.data) ? data.data : []);
        setSelectedLedgerId(data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch bank ledgers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (ledgerId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/banking/transactions?ledgerId=${ledgerId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrsReport = async (ledgerId: string, cutoff: string) => {
    try {
      const balParam = statementBalanceInput ? `&statementBalance=${statementBalanceInput}` : '';
      const res = await fetch(`/api/v1/banking/brs-report?ledgerId=${ledgerId}&asOfDate=${cutoff}${balParam}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setBrsReport(data.data);
        if (!statementBalanceInput && data.data.summary) {
          setStatementBalanceInput(String(data.data.summary.calculatedBalanceAsPerBank));
        }
      }
    } catch (err) {
      console.error('Failed to fetch BRS report', err);
    }
  };

  const handleManualReconcile = async (voucherItemId: string, clearedDate: string | null) => {
    try {
      const res = await fetch('/api/v1/banking/manual-reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({ voucherItemId, clearedDate }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(clearedDate ? 'Transaction cleared & reconciled.' : 'Cleared date removed.');
        fetchTransactions(selectedLedgerId);
        fetchBrsReport(selectedLedgerId, asOfDate);
      }
    } catch (err) {
      toast.error('Failed to update reconciliation status');
    }
  };

  const handleAutoReconcile = async () => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/v1/banking/auto-reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({ ledgerId: selectedLedgerId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Automated matching completed! ${data.matchedCount} transaction(s) reconciled.`);
        fetchTransactions(selectedLedgerId);
        fetchBrsReport(selectedLedgerId, asOfDate);
      }
    } catch (err) {
      toast.error('Auto reconciliation failed');
    } finally {
      setIsMatching(false);
    }
  };

  const handleUploadCsvStatement = async () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        toast.error('Please enter at least header + 1 row of statement data');
        return;
      }
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 4) {
          rows.push({
            date: parts[0],
            narration: parts[1],
            refNumber: parts[2],
            debit: parseFloat(parts[3]) || 0,
            credit: parseFloat(parts[4]) || 0,
            balance: parseFloat(parts[5]) || 0,
          });
        }
      }

      const res = await fetch('/api/v1/banking/statement/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({ ledgerId: selectedLedgerId, statement: rows }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setActiveTab('reconciler');
        handleAutoReconcile();
      }
    } catch (err) {
      toast.error('Failed to parse bank statement');
    }
  };

  const selectedLedger = bankLedgers.find(l => l.id === selectedLedgerId);

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'UNRECONCILED' && t.isReconciled) return false;
    if (filterType === 'RECONCILED' && !t.isReconciled) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (t.voucherNumber || '').toLowerCase().includes(q) ||
        (t.narration || '').toLowerCase().includes(q) ||
        (t.referenceNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreconciledCount = transactions.filter(t => !t.isReconciled).length;
  const reconciledCount = transactions.filter(t => t.isReconciled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/50">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bank Reconciliation Statement (BRS)</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                Rule-Based Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated multi-bank statement parsing, instant rule-matching, and point-in-time statutory BRS report.
            </p>
          </div>
        </div>

        {/* Bank Ledger Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Bank A/c:</span>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {bankLedgers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAutoReconcile}
            disabled={isMatching}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
            <span>Auto-Reconcile</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards (Executive 360° Benchmark) */}
      {brsReport && (
        <KPIGrid columns={4}>
          <KPIScorecard
            label="BOOK BALANCE"
            value={`₹ ${brsReport.summary.balanceAsPerBooks.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<Landmark className="w-3.5 h-3.5" />}
            badge="Ledger"
            badgeVariant="indigo"
            footerLeft="Source:"
            footerRight="Company Books"
          />
          <KPIScorecard
            label="UNPRESENTED CHEQUES (+)"
            value={`+ ₹ ${brsReport.summary.totalUnpresentedCheques.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            badge="Pending Debit"
            badgeVariant="amber"
            footerLeft="Issued Cheques:"
            footerRight={`${brsReport.unpresentedCheques.length} Cheques`}
          />
          <KPIScorecard
            label="UNCREDITED CHEQUES (-)"
            value={`- ₹ ${brsReport.summary.totalUncreditedCheques.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
            badge="Pending Credit"
            badgeVariant="indigo"
            footerLeft="Pending Deposits:"
            footerRight={`${brsReport.uncreditedCheques.length} Items`}
          />
          <KPIScorecard
            label="STATEMENT BALANCE"
            value={`₹ ${brsReport.summary.calculatedBalanceAsPerBank.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            variant={brsReport.summary.isFullyReconciled ? 'emerald' : 'amber'}
            badge={brsReport.summary.isFullyReconciled ? 'RECONCILED' : 'VARIANCE'}
            badgeVariant={brsReport.summary.isFullyReconciled ? 'emerald' : 'amber'}
            footerLeft="Variance:"
            footerRight={brsReport.summary.isFullyReconciled ? '₹ 0.00 (Zero Drift)' : `₹ ${brsReport.summary.variance}`}
          />
        </KPIGrid>
      )}

      {/* Tabs Navigation via StandardTabs */}
      <StandardTabs<'reconciler' | 'statement-upload' | 'brs-statement'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'reconciler',
            label: 'Transaction Reconciler',
            icon: SlidersHorizontal,
            badge: unreconciledCount > 0 ? `${unreconciledCount} Unreconciled` : null,
            badgeVariant: 'warning',
          },
          {
            id: 'statement-upload',
            label: 'Statement Upload',
            icon: UploadCloud,
          },
          {
            id: 'brs-statement',
            label: 'Formal BRS Statement',
            icon: FileSpreadsheet,
          },
        ]}
        rightElement={
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">As of Cutoff:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>
        }
      />

      {/* TAB 1: TRANSACTION RECONCILER MATRIX */}
      {activeTab === 'reconciler' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('UNRECONCILED')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                  filterType === 'UNRECONCILED'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Unreconciled ({unreconciledCount})
              </button>
              <button
                onClick={() => setFilterType('RECONCILED')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                  filterType === 'RECONCILED'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Reconciled ({reconciledCount})
              </button>
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                  filterType === 'ALL'
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Entries ({transactions.length})
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search voucher, cheque #, or narration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Voucher Date</th>
                  <th className="py-3 px-4">Type & No</th>
                  <th className="py-3 px-4">Narration / Particulars</th>
                  <th className="py-3 px-4">Cheque / Ref No</th>
                  <th className="py-3 px-4 text-right">Debit (Deposit)</th>
                  <th className="py-3 px-4 text-right">Credit (Payment)</th>
                  <th className="py-3 px-4 text-center">Reconciliation State</th>
                  <th className="py-3 px-4 text-center">Bank Cleared Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No transactions found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{t.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white">{t.voucherNumber}</span>
                        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {t.voucherType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">{t.narration}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {t.referenceNumber || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {t.debitAmount > 0 ? `₹${t.debitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                        {t.creditAmount > 0 ? `₹${t.creditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {t.isReconciled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Unreconciled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="date"
                            defaultValue={t.clearedDate || ''}
                            onBlur={(e) => {
                              const val = e.target.value;
                              if (val !== (t.clearedDate || '')) {
                                handleManualReconcile(t.id, val || null);
                              }
                            }}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-2 py-1 rounded text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
                          />
                          {t.isReconciled && (
                            <button
                              onClick={() => handleManualReconcile(t.id, null)}
                              title="Clear reconciliation"
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BANK STATEMENT UPLOADER & PARSER */}
      {activeTab === 'statement-upload' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bank Statement Import & Rule Matcher</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Paste or import CSV / Excel statement rows. The auto-matcher maps transaction dates, amounts, and cheque / UTR numbers.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300">
              Target Bank: {selectedLedger?.name}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              CSV Statement Data (Format: Date, Narration, RefNumber, Withdrawal/Debit, Deposit/Credit, Balance):
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Supports HDFC, ICICI, SBI, Axis, Kotak standard MT940 and CSV exports.</span>
            </div>

            <button
              onClick={handleUploadCsvStatement}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Auto-Reconcile Now</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: FORMAL BRS STATEMENT */}
      {activeTab === 'brs-statement' && brsReport && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bank Reconciliation Statement</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                For: <span className="font-semibold text-slate-800 dark:text-slate-200">{brsReport.ledger.name}</span> | As on: <span className="font-semibold text-blue-600">{asOfDate}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print BRS</span>
              </button>
            </div>
          </div>

          {/* Statement Math Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 font-semibold text-sm">
              <span className="text-slate-900 dark:text-white">Balance as per Company Books</span>
              <span className="font-mono text-slate-900 dark:text-white">
                ₹{brsReport.summary.balanceAsPerBooks.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Section: Add Unpresented Cheques */}
            <div className="space-y-2 pl-4 border-l-2 border-amber-500">
              <div className="flex justify-between items-center text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <span>Add: Cheques Issued but not Presented in Bank (Unpresented Cheques)</span>
                <span className="font-mono">
                  + ₹{brsReport.summary.totalUnpresentedCheques.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {brsReport.unpresentedCheques.length === 0 ? (
                <p className="text-xs text-slate-400 italic">None</p>
              ) : (
                <div className="space-y-1">
                  {brsReport.unpresentedCheques.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 px-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg text-slate-600 dark:text-slate-400">
                      <span>{item.date} — {item.voucherNumber} (Ref: {item.referenceNumber || 'N/A'}) {item.narration}</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Less Uncredited Cheques */}
            <div className="space-y-2 pl-4 border-l-2 border-purple-500">
              <div className="flex justify-between items-center text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                <span>Less: Cheques Deposited but not yet Credited by Bank (Uncredited Cheques)</span>
                <span className="font-mono">
                  - ₹{brsReport.summary.totalUncreditedCheques.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {brsReport.uncreditedCheques.length === 0 ? (
                <p className="text-xs text-slate-400 italic">None</p>
              ) : (
                <div className="space-y-1">
                  {brsReport.uncreditedCheques.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 px-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg text-slate-600 dark:text-slate-400">
                      <span>{item.date} — {item.voucherNumber} (Ref: {item.referenceNumber || 'N/A'}) {item.narration}</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Balance as per Bank */}
            <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-base text-emerald-900 dark:text-emerald-300">
              <span>Balance as per Bank Statement</span>
              <span className="font-mono">
                ₹{brsReport.summary.calculatedBalanceAsPerBank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
