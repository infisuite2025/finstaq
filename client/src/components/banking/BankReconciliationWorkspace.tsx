import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Link2,
  Zap,
  Building2,
  FileText,
  Check,
  X,
  Layers,
  History,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface BankLedger {
  id: string;
  name: string;
  code?: string;
  bankAccount?: string;
  bankName?: string;
  accountType?: string;
  ifscCode?: string;
  branch?: string;
  openingBalance: number;
  currentBalance?: number;
  isLinked?: boolean;
  linkProvider?: string | null;
  lastSyncedAt?: string | null;
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

interface StatementBatchMetadata {
  id: string;
  fileName: string;
  uploadDate: string;
  period: string;
  rowCount: number;
  totalDebits: number;
  totalCredits: number;
  openingBalance: number;
  closingBalance: number;
  status: 'PARSED' | 'RECONCILED' | 'PARTIALLY_MATCHED';
}

interface BrsReportData {
  asOfDate: string;
  ledger: {
    id: string;
    name: string;
    code?: string;
    bankAccount?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    accountType?: string;
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

const DEFAULT_BANKS: BankLedger[] = [
  {
    id: 'ldg_hdfc_01',
    name: 'HDFC Bank Current Account (A/c No: 50200012345678)',
    code: 'BANK_HDFC_01',
    bankAccount: '50200012345678',
    bankName: 'HDFC Bank Ltd',
    accountType: 'CURRENT',
    ifscCode: 'HDFC0000240',
    branch: 'Koregaon Park Branch, Pune',
    openingBalance: 350000.0,
    currentBalance: 525000.0,
    isLinked: true,
    linkProvider: 'HDFC Direct Corporate API',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'ldg_icici_02',
    name: 'ICICI Bank Escrow / Operating (A/c No: 000405012345)',
    code: 'BANK_ICICI_02',
    bankAccount: '000405012345',
    bankName: 'ICICI Bank Ltd',
    accountType: 'ESCROW',
    ifscCode: 'ICIC0000004',
    branch: 'Bund Garden Branch, Pune',
    openingBalance: 150000.0,
    currentBalance: 220000.0,
    isLinked: true,
    linkProvider: 'ICICI CIB Corporate NetBanking',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'ldg_sbi_03',
    name: 'SBI Cash Credit & OD Facility (A/c No: 33458921004)',
    code: 'BANK_SBI_03',
    bankAccount: '33458921004',
    bankName: 'State Bank of India',
    accountType: 'OVERDRAFT',
    ifscCode: 'SBIN0001234',
    branch: 'MIDC Chakan SME Branch, Pune',
    openingBalance: 500000.0,
    currentBalance: 680000.0,
    isLinked: false,
    linkProvider: null,
    lastSyncedAt: null,
  },
  {
    id: 'ldg_axis_04',
    name: 'Axis Bank Trade & Forex Account (A/c No: 918020054321)',
    code: 'BANK_AXIS_04',
    bankAccount: '918020054321',
    bankName: 'Axis Bank Ltd',
    accountType: 'CURRENT_FOREX',
    ifscCode: 'UTIB0000123',
    branch: 'Shivajinagar Branch, Pune',
    openingBalance: 280000.0,
    currentBalance: 345000.0,
    isLinked: true,
    linkProvider: 'Axis Corporate Connect',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'ldg_kotak_05',
    name: 'Kotak Mahindra Customer Collections (A/c No: 7711223344)',
    code: 'BANK_KOTAK_05',
    bankAccount: '7711223344',
    bankName: 'Kotak Mahindra Bank',
    accountType: 'COLLECTIONS',
    ifscCode: 'KKBK0000999',
    branch: 'Baner High Street, Pune',
    openingBalance: 120000.0,
    currentBalance: 195000.0,
    isLinked: false,
    linkProvider: null,
    lastSyncedAt: null,
  },
];

export function BankReconciliationWorkspace() {
  const toast = useToast();
  const { getAuthHeaders } = useAuth();

  const [bankLedgers, setBankLedgers] = useState<BankLedger[]>(DEFAULT_BANKS);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('ldg_hdfc_01');
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [statementBatches, setStatementBatches] = useState<StatementBatchMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [isSyncingFeed, setIsSyncingFeed] = useState<boolean>(false);

  // Modals
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isLinkBankModalOpen, setIsLinkBankModalOpen] = useState(false);

  // Cutoff date for BRS calculation (Default: current date)
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statementBalanceInput, setStatementBalanceInput] = useState<string>('');
  const [brsReport, setBrsReport] = useState<BrsReportData | null>(null);

  // Active subtab: 'reconciler' | 'statement-upload' | 'brs-statement'
  const [activeTab, setActiveTab] = useState<'reconciler' | 'statement-upload' | 'brs-statement'>('reconciler');
  const [filterType, setFilterType] = useState<'ALL' | 'UNRECONCILED' | 'RECONCILED'>('UNRECONCILED');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Statement Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('HDFC_Statement_March2026.csv');
  const [csvText, setCsvText] = useState<string>(`Date,Narration,RefNumber,Withdrawal,Deposit,Balance
2026-03-08,NEFT Clrg TechnoKraft Solutions UTR987654321,UTR987654321,0,125000,525000
2026-03-11,CHQ WDL 554432 Acme Vendors Ltd,554432,45000,0,480000
2026-03-25,CHQ WDL 889901 RealEstate Corp Rent,889901,85000,0,395000
2026-03-29,Customer Inward Wire 112233 Omega Retail,112233,0,60000,455000`);

  // New Bank Account Form Data
  const [newBankForm, setNewBankForm] = useState({
    name: 'Operations Account',
    bankName: 'HDFC Bank Ltd',
    bankAccount: '',
    ifscCode: 'HDFC0000123',
    branch: 'Shivaji Nagar, Pune',
    accountType: 'CURRENT',
    openingBalance: 100000,
  });

  // Link Bank Gateway Form Data
  const [linkBankForm, setLinkBankForm] = useState({
    provider: 'HDFC Direct Corporate API',
    clientId: 'CORP-HDFC-99120',
    secretKey: '••••••••••••••••',
    syncFrequency: 'HOURLY',
    autoReconcileOnSync: true,
  });

  // Load Bank Ledgers on mount
  useEffect(() => {
    fetchBankLedgers();
  }, []);

  // When selected ledger changes, fetch transactions & BRS & statement batches
  useEffect(() => {
    if (selectedLedgerId) {
      fetchTransactions(selectedLedgerId);
      fetchBrsReport(selectedLedgerId, asOfDate);
      fetchStatementBatches(selectedLedgerId);
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
        setBankLedgers(Array.isArray(data.data) ? data.data : DEFAULT_BANKS);
        if (!selectedLedgerId || !data.data.some((l: any) => l.id === selectedLedgerId)) {
          setSelectedLedgerId(data.data[0].id);
        }
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

  const fetchStatementBatches = async (ledgerId: string) => {
    try {
      const res = await fetch(`/api/v1/banking/statement/batches?ledgerId=${ledgerId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStatementBatches(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch statement batches', err);
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
        toast.success(clearedDate ? 'Transaction marked as cleared & reconciled.' : 'Cleared date removed.');
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
        toast.success(`Automated matching completed! ${data.matchedCount} transaction(s) reconciled with zero drift.`);
        fetchTransactions(selectedLedgerId);
        fetchBrsReport(selectedLedgerId, asOfDate);
      }
    } catch (err) {
      toast.error('Auto reconciliation failed');
    } finally {
      setIsMatching(false);
    }
  };

  // Direct Bank Feed Live Sync
  const handleSyncBankFeed = async () => {
    setIsSyncingFeed(true);
    try {
      const res = await fetch('/api/v1/banking/sync-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({ ledgerId: selectedLedgerId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchBankLedgers();
        fetchTransactions(selectedLedgerId);
        fetchBrsReport(selectedLedgerId, asOfDate);
        fetchStatementBatches(selectedLedgerId);
      } else {
        toast.error(data.message || 'Sync failed');
      }
    } catch (err) {
      toast.error('Direct Bank Feed sync failed');
    } finally {
      setIsSyncingFeed(false);
    }
  };

  // Upload Statement from CSV / Excel Text / File
  const handleUploadCsvStatement = async () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        toast.error('Please provide at least a header row + 1 row of statement data');
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
        body: JSON.stringify({
          ledgerId: selectedLedgerId,
          statement: rows,
          fileName: uploadedFileName || 'Imported_Statement.csv',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setActiveTab('reconciler');
        handleAutoReconcile();
        fetchStatementBatches(selectedLedgerId);
      }
    } catch (err) {
      toast.error('Failed to parse bank statement');
    }
  };

  // Handle File Input Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        toast.success(`Loaded file '${file.name}' (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.readAsText(file);
  };

  // Add Bank Ledger Handler
  const handleCreateBankLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankForm.bankAccount || !newBankForm.ifscCode) {
      toast.error('Account Number and IFSC Code are required');
      return;
    }

    try {
      const res = await fetch('/api/v1/banking/bank-ledgers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify(newBankForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Bank Account created successfully.');
        setIsAddBankModalOpen(false);
        fetchBankLedgers();
        setSelectedLedgerId(data.data.id);
      }
    } catch (err) {
      toast.error('Failed to create bank account');
    }
  };

  // Link Bank Gateway Handler
  const handleLinkBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/banking/link-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({
          ledgerId: selectedLedgerId,
          provider: linkBankForm.provider,
          credentials: { clientId: linkBankForm.clientId },
          syncFrequency: linkBankForm.syncFrequency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsLinkBankModalOpen(false);
        fetchBankLedgers();
      }
    } catch (err) {
      toast.error('Failed to link bank feed');
    }
  };

  // Download Sample Statement Template
  const handleDownloadSampleTemplate = (format: 'csv' | 'xlsx') => {
    const sample = `Date,Narration,RefNumber,Withdrawal,Deposit,Balance
2026-03-01,Opening Balance B/F,INIT,0,0,350000
2026-03-08,NEFT Clrg TechnoKraft Solutions,UTR987654321,0,125000,475000
2026-03-11,CHQ WDL 554432 Acme Vendors Ltd,554432,45000,0,430000
2026-03-25,CHQ WDL 889901 RealEstate Corp,889901,85000,0,345000
2026-03-29,Customer Inward Wire Omega Retail,112233,0,60000,405000`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sample_Bank_Statement_${selectedLedger?.bankName?.replace(/\s+/g, '_') || 'Bank'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample statement template downloaded.');
  };

  const selectedLedger = bankLedgers.find(l => l.id === selectedLedgerId) || bankLedgers[0];

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
      {/* Header with Multi-Bank Switcher, Add Bank & Link Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/50 shrink-0">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bank Reconciliation Statement (BRS)</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                Rule-Based Engine
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                {bankLedgers.length} Bank Account{bankLedgers.length > 1 ? 's' : ''} Configured
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated multi-bank statement parsing, Open Banking live feeds, instant rule-matching, and point-in-time statutory BRS report.
            </p>
          </div>
        </div>

        {/* Bank Account Selector, Link Feed & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bank Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">Bank A/c:</span>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100 py-1.5 px-3 rounded-lg border border-emerald-400 dark:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all max-w-[280px]"
            >
              {bankLedgers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.bankAccount ? `(..${l.bankAccount.slice(-4)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Add Bank Account Button */}
          <button
            type="button"
            onClick={() => setIsAddBankModalOpen(true)}
            title="Add New Bank Ledger"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>+ Add Bank</span>
          </button>

          {/* Link with Bank (Open Banking / Direct Feed) */}
          <button
            type="button"
            onClick={() => setIsLinkBankModalOpen(true)}
            title="Connect Direct Bank API Feed"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              selectedLedger?.isLinked
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>{selectedLedger?.isLinked ? 'Linked (Config)' : 'Link with Bank'}</span>
          </button>

          {/* Direct Live Feed Sync */}
          {selectedLedger?.isLinked && (
            <button
              type="button"
              onClick={handleSyncBankFeed}
              disabled={isSyncingFeed}
              title="Pull Live Statement Feeds from Bank"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isSyncingFeed ? 'animate-bounce' : ''}`} />
              <span>{isSyncingFeed ? 'Syncing...' : 'Sync Feeds'}</span>
            </button>
          )}

          {/* Auto Reconcile Button */}
          <button
            type="button"
            onClick={handleAutoReconcile}
            disabled={isMatching}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
            <span>Auto-Reconcile</span>
          </button>
        </div>
      </div>

      {/* Selected Bank Profile Banner */}
      {selectedLedger && (
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {selectedLedger.bankName || selectedLedger.name}
              </span>
              <span className="text-slate-400 mx-2">|</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">
                A/c: {selectedLedger.bankAccount || '50200012345678'}
              </span>
              <span className="text-slate-400 mx-2">|</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">
                IFSC: {selectedLedger.ifscCode || 'HDFC0000240'}
              </span>
              {selectedLedger.branch && (
                <>
                  <span className="text-slate-400 mx-2">|</span>
                  <span className="text-slate-500 dark:text-slate-400">{selectedLedger.branch}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 font-medium">
            {selectedLedger.isLinked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Connected via {selectedLedger.linkProvider || 'Direct API'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                <span>Direct Feed: Offline (Manual Upload)</span>
              </span>
            )}
            {selectedLedger.lastSyncedAt && (
              <span className="text-[10px] text-slate-400 font-mono">
                Synced: {new Date(selectedLedger.lastSyncedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
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
            label: 'Statement Upload & Batches',
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
              className="bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                type="button"
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
                type="button"
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
                type="button"
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                            className="bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 text-xs px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                          {t.isReconciled && (
                            <button
                              type="button"
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

      {/* TAB 2: BANK STATEMENT UPLOADER & MULTI-STATEMENT BATCHES */}
      {activeTab === 'statement-upload' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Bank Statement Import & Multi-File Uploader</span>
                  <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
                    Target: {selectedLedger?.bankName || selectedLedger?.name}
                  </span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload periodic bank statements (CSV, Excel, MT940, OFX) or paste rows directly. The smart auto-matcher correlates UTRs, Cheque numbers, and date windows.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSampleTemplate('csv')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Picker Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.ofx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to browse or drag & drop bank statement file
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports .CSV, .XLSX, .XLS, .OFX, .QIF, MT940 statement exports (Max 25 MB)
                  </p>
                </div>
                {uploadedFileName && (
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                    Selected: {uploadedFileName}
                  </span>
                )}
              </div>
            </div>

            {/* CSV Raw Text Editor & Mapping */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Parsed Statement Rows (Format: Date, Narration, RefNumber, Withdrawal/Debit, Deposit/Credit, Balance):
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-4 font-mono text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Supports HDFC, ICICI, SBI, Axis, Kotak, Standard Chartered, HSBC and Open Banking feeds.</span>
              </div>

              <button
                type="button"
                onClick={handleUploadCsvStatement}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Statement & Auto-Match</span>
              </button>
            </div>
          </div>

          {/* Statement Batch History */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Statement Upload History & Batches for {selectedLedger?.bankName || selectedLedger?.name}</span>
            </h4>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Batch File Name</th>
                    <th className="py-2.5 px-3">Upload Timestamp</th>
                    <th className="py-2.5 px-3">Statement Period</th>
                    <th className="py-2.5 px-3 text-center">Row Count</th>
                    <th className="py-2.5 px-3 text-right">Total Debits (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total Credits (₹)</th>
                    <th className="py-2.5 px-3 text-right">Closing Balance (₹)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {statementBatches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No previous statement files uploaded for this bank account.
                      </td>
                    </tr>
                  ) : (
                    statementBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {batch.fileName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {batch.uploadDate}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                          {batch.period}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {batch.rowCount} rows
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                          ₹{batch.totalDebits.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                          ₹{batch.totalCredits.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ₹{batch.closingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                            {batch.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORMAL BRS STATEMENT */}
      {activeTab === 'brs-statement' && brsReport && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bank Reconciliation Statement</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-semibold">
                  Section 34 / ICAI Format
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                For: <span className="font-semibold text-slate-800 dark:text-slate-200">{brsReport.ledger.name}</span> | As on: <span className="font-semibold text-blue-600">{asOfDate}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
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

      {/* MODAL 1: ADD NEW BANK ACCOUNT */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Add Bank Account / General Ledger
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBankModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBankLedger} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name *
                  </label>
                  <select
                    value={newBankForm.bankName}
                    onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium outline-none"
                  >
                    <option value="HDFC Bank Ltd">HDFC Bank Ltd</option>
                    <option value="ICICI Bank Ltd">ICICI Bank Ltd</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank Ltd">Axis Bank Ltd</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="HSBC India">HSBC India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={newBankForm.accountType}
                    onChange={(e) => setNewBankForm({ ...newBankForm, accountType: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium outline-none"
                  >
                    <option value="CURRENT">Current Account</option>
                    <option value="OVERDRAFT">Cash Credit / Overdraft (OD)</option>
                    <option value="ESCROW">Escrow / Special Account</option>
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT_FOREX">EEFC / Forex Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Name / Ledger Label *
                </label>
                <input
                  type="text"
                  required
                  value={newBankForm.name}
                  onChange={(e) => setNewBankForm({ ...newBankForm, name: e.target.value })}
                  placeholder="e.g. Operations A/c - Plant 1"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBankForm.bankAccount}
                    onChange={(e) => setNewBankForm({ ...newBankForm, bankAccount: e.target.value })}
                    placeholder="e.g. 50200098765432"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBankForm.ifscCode}
                    onChange={(e) => setNewBankForm({ ...newBankForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0000123"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name / Location
                  </label>
                  <input
                    type="text"
                    value={newBankForm.branch}
                    onChange={(e) => setNewBankForm({ ...newBankForm, branch: e.target.value })}
                    placeholder="e.g. Shivaji Nagar, Pune"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Ledger Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={newBankForm.openingBalance}
                    onChange={(e) => setNewBankForm({ ...newBankForm, openingBalance: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Bank Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LINK WITH BANK (OPEN BANKING / DIRECT API INTEGRATION) */}
      {isLinkBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Link2 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Connect Direct Bank Feed (Open Banking)
                  </h3>
                  <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    Target: {selectedLedger?.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkBankModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkBankSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Banking Integration Gateway / Provider *
                </label>
                <select
                  value={linkBankForm.provider}
                  onChange={(e) => setLinkBankForm({ ...linkBankForm, provider: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium outline-none"
                >
                  <option value="HDFC Direct Corporate API">HDFC SmartHub / Direct Corporate API</option>
                  <option value="ICICI CIB Corporate NetBanking">ICICI Corporate Internet Banking (CIB) API</option>
                  <option value="SBI e-Pay / Corporate API">State Bank of India (SBI) Corporate e-Banking</option>
                  <option value="Axis Corporate Connect">Axis Corporate Direct Connect</option>
                  <option value="Kotak NetIT">Kotak Mahindra NetIT Corporate</option>
                  <option value="Sahamati Account Aggregator">Sahamati / Setu Account Aggregator (AA Consent)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Client ID / User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={linkBankForm.clientId}
                    onChange={(e) => setLinkBankForm({ ...linkBankForm, clientId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Secret / Token Handle
                  </label>
                  <input
                    type="password"
                    value={linkBankForm.secretKey}
                    onChange={(e) => setLinkBankForm({ ...linkBankForm, secretKey: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Automatic Sync Frequency
                </label>
                <select
                  value={linkBankForm.syncFrequency}
                  onChange={(e) => setLinkBankForm({ ...linkBankForm, syncFrequency: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium outline-none"
                >
                  <option value="REALTIME">Real-Time Webhooks (Instant Push)</option>
                  <option value="HOURLY">Hourly Sync (Every 60 Minutes)</option>
                  <option value="DAILY_0600">Daily Nightly Sync (06:00 AM)</option>
                  <option value="MANUAL_ONLY">Manual On-Demand Sync Only</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bank-Grade 256-Bit TLS Encryption</span>
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Transactions are pulled securely via RBI-compliant Open Banking protocols. Finstaq never stores transactional passwords.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkBankModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Authorize & Connect Feed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
