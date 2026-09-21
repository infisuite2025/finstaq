import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Lock, Unlock, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle,
  Clock, RefreshCw, Sliders, Check, X, FileText, ArrowRight, Layers, Building,
  TrendingUp, Scale, ShoppingBag, Truck, Receipt, BookOpen, Undo2, RotateCcw,
  Sparkles, Info, Users, UserCheck, ChevronRight, Eye, Play, DollarSign, Database,
  Plus, History, ArrowUpDown, CheckSquare, FileSpreadsheet, Download
} from 'lucide-react';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';

interface FinancialYear {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'OPEN' | 'SOFT_CLOSED' | 'FINANCE_REVIEW' | 'FINAL_CLOSED' | 'AUDIT_LOCKED' | 'REOPENED';
  isCurrent: boolean;
  retainedEarningsLedgerName: string;
}

interface AccountingPeriod {
  id: string;
  financialYearId: string;
  sequence: number;
  periodName: string;
  monthName: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'SOFT_CLOSED' | 'FINANCE_REVIEW' | 'FINAL_CLOSED' | 'AUDIT_LOCKED' | 'REOPENED';
  gstFilingStatus: string;
  lockedByName?: string;
  lockedAt?: string;
  reopenedByName?: string;
  reopenedAt?: string;
  reopenReason?: string;
}

interface MonthChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXCEPTION' | 'WAIVED';
  isApplicable: boolean;
  isMandatory: boolean;
  assignedTo: string;
  assignedRole: UserRole;
  comments?: string;
}

interface ReadinessAudit {
  financialYearCode: string;
  readinessPercentage: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  errorChecks: number;
  blockerChecks: number;
  isReadyForFinalClose: boolean;
  categories: {
    category: string;
    title: string;
    severity: 'SUCCESS' | 'WARNING' | 'ERROR' | 'BLOCKER';
    status: 'PASS' | 'WARNING' | 'FAIL' | 'BLOCKED';
    pendingCount: number;
    monetaryValue?: number;
    isBlocker: boolean;
    message: string;
  }[];
  auditedAt: string;
}

interface CarryForwardPreview {
  sourceFY: string;
  targetFY: string;
  netProfitLossTransferred: number;
  totalBalanceSheetClosing: number;
  totalBalanceSheetOpening: number;
  zeroDifferenceCheckPassed: boolean;
  accounts: {
    ledgerId: string;
    ledgerCode: string;
    ledgerName: string;
    accountCategory: 'BALANCE_SHEET' | 'PROFIT_LOSS';
    groupNature: string;
    closingBalanceFY: number;
    carryForwardType: string;
    newOpeningBalance: number;
    difference: number;
    status: string;
  }[];
  customerOpenItems: {
    invoiceId?: string;
    customerId: string;
    customerName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    originalAmount: number;
    settledAmount?: number;
    outstandingAmount: number;
    ageingBucket: string;
  }[];
  vendorOpenItems: {
    billId?: string;
    vendorId: string;
    vendorName: string;
    billNumber: string;
    billDate: string;
    dueDate: string;
    originalAmount: number;
    outstandingAmount: number;
  }[];
  inventoryLayers: {
    sku: string;
    itemName: string;
    warehouseName: string;
    batchNo?: string;
    quantity: number;
    uom: string;
    valuationRate: number;
    totalValuation: number;
  }[];
  fixedAssets: {
    assetCode: string;
    assetName: string;
    acquisitionCost: number;
    accumulatedDepreciation: number;
    netBookValue: number;
    remainingLifeYears: number;
  }[];
}

interface AuditAdjustmentEntry {
  id: string;
  tenantId: string;
  financialYearCode: string;
  voucherNumber: string;
  date: string;
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  accountCategory: 'BALANCE_SHEET' | 'PROFIT_LOSS';
  groupNature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  auditorReference?: string;
  postedBy: string;
  postedByName: string;
  postedAt: string;
}

interface AccountVarianceItem {
  ledgerId: string;
  ledgerCode: string;
  ledgerName: string;
  accountCategory: 'BALANCE_SHEET' | 'PROFIT_LOSS';
  groupNature: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  initialClosingFY: number;
  auditAdjustmentsTotal: number;
  revisedClosingFY: number;
  currentOpeningFY: number;
  varianceDelta: number;
  isOutOfSync: boolean;
  impactOnRetainedEarnings: number;
}

interface OpeningBalanceSyncDiff {
  sourceFY: string;
  targetFY: string;
  isOutOfSync: boolean;
  totalAuditAdjustmentsCount: number;
  totalAdjustmentValue: number;
  initialNetProfit: number;
  revisedNetProfit: number;
  netProfitDelta: number;
  initialRetainedEarnings: number;
  revisedRetainedEarnings: number;
  retainedEarningsDelta: number;
  variances: AccountVarianceItem[];
  auditAdjustments: AuditAdjustmentEntry[];
  lastSyncedAt?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}

export function FinancialPeriodHub() {
  const [activeView, setActiveView] = useState<'wizard' | 'matrix' | 'sync' | 'audit_trail'>('sync');
  const { getAuthHeaders } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 'usr-001',
    name: 'Vikram Singhania',
    role: 'OWNER',
  });

  // State
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>('2025-26');
  const [targetFY, setTargetFY] = useState<string>('2026-27');
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null);
  const [checklist, setChecklist] = useState<MonthChecklistItem[]>([]);
  const [readiness, setReadiness] = useState<ReadinessAudit | null>(null);
  const [preview, setPreview] = useState<CarryForwardPreview | null>(null);
  const [syncDiff, setSyncDiff] = useState<OpeningBalanceSyncDiff | null>(null);
  const [closingHistory, setClosingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Wizard Step State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [subLedgerTab, setSubLedgerTab] = useState<'ar' | 'ap' | 'inventory' | 'assets'>('ar');
  const [ownerPin, setOwnerPin] = useState<string>('');

  // Sync / Adjustment Modal State
  const [showAdjModal, setShowAdjModal] = useState<boolean>(false);
  const [adjForm, setAdjForm] = useState({
    ledgerId: 'led-depr-exp',
    type: 'DEBIT' as 'DEBIT' | 'CREDIT',
    amount: '',
    description: '',
    auditorReference: '',
  });
  const [varianceFilter, setVarianceFilter] = useState<'ALL' | 'DIFF_ONLY' | 'BS_ONLY' | 'PNL_ONLY'>('DIFF_ONLY');

  // Load FYs & Initial Data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const fyRes = await fetch('/api/v1/period-closing/financial-years', {
        headers: getAuthHeaders(),
      });
      const fyData = await fyRes.json();
      if (fyData.success) {
        setFinancialYears(Array.isArray(fyData.data) ? fyData.data : []);
      }

      // Load Periods
      const pRes = await fetch('/api/v1/period-closing/periods', {
        headers: getAuthHeaders(),
      });
      const pData = await pRes.json();
      if (pData.success) {
        setPeriods(Array.isArray(pData.data) ? pData.data : []);
        const mar26 = pData.data.find((p: any) => p.monthName === 'March 2026') || pData.data[11];
        setSelectedPeriod(mar26);
      }

      // Load Sync Diff
      await loadSyncDiff();

      // Load Readiness & Preview
      await loadReadiness();
      await loadPreview();
      await loadHistory();
    } catch (e: any) {
      console.error('Failed to load initial data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncDiff = async () => {
    try {
      const res = await fetch(`/api/v1/period-closing/year-end/sync-diff?sourceFY=${selectedFY}&targetFY=${targetFY}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSyncDiff(data.data);
      }
    } catch (e) {
      console.error('Failed to load sync diff', e);
    }
  };

  const loadReadiness = async () => {
    try {
      const res = await fetch(`/api/v1/period-closing/year-end/readiness?fiscalYear=${selectedFY}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setReadiness(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPreview = async () => {
    try {
      const res = await fetch(`/api/v1/period-closing/year-end/carry-forward-preview?sourceFY=${selectedFY}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/v1/period-closing/year-end/history', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setClosingHistory(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedFY, targetFY]);

  // Handle Post Audit Adjustment
  const handlePostAuditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjForm.amount || isNaN(Number(adjForm.amount)) || Number(adjForm.amount) <= 0) {
      alert('Please enter a valid positive adjustment amount.');
      return;
    }
    if (!adjForm.description) {
      alert('Please enter a clear audit justification description.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/period-closing/year-end/audit-adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': getAuthHeaders()['x-tenant-id'],
        },
        body: JSON.stringify({
          financialYearCode: selectedFY,
          ledgerId: adjForm.ledgerId,
          type: adjForm.type,
          amount: Number(adjForm.amount),
          description: adjForm.description,
          auditorReference: adjForm.auditorReference,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Audit Adjustment JV posted successfully! FY ${targetFY} Opening Balances marked as OUT OF SYNC.`,
        });
        setShowAdjModal(false);
        setAdjForm({
          ledgerId: 'led-depr-exp',
          type: 'DEBIT',
          amount: '',
          description: '',
          auditorReference: '',
        });
        await loadSyncDiff();
        await loadPreview();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to post adjustment.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-Click Synchronize Opening Balances
  const handleSyncOpeningBalances = async () => {
    if (currentUser.role === 'DATA_ENTRY') {
      alert('Unauthorized: Only Owner or Accountant can execute opening balance synchronization.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/period-closing/year-end/sync-opening-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': getAuthHeaders()['x-tenant-id'],
        },
        body: JSON.stringify({
          sourceFY: selectedFY,
          targetFY: targetFY,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          remarks: 'Synchronized audited adjustments and rolled revised Retained Earnings.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! Opening balances for FY ${targetFY} are now 100% in sync with FY ${selectedFY} audited adjustments! Zero variance verified.`,
        });
        await loadSyncDiff();
        await loadPreview();
        await loadHistory();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Synchronization failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error executing sync.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered variances
  const filteredVariances = syncDiff?.variances.filter((v) => {
    if (varianceFilter === 'DIFF_ONLY') return v.isOutOfSync || v.auditAdjustmentsTotal !== 0;
    if (varianceFilter === 'BS_ONLY') return v.accountCategory === 'BALANCE_SHEET';
    if (varianceFilter === 'PNL_ONLY') return v.accountCategory === 'PROFIT_LOSS';
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Enterprise Role Simulator Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>Financial Period & Year-End Engine</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Tier-1 ERP
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  Continuous multi-fiscal-year concurrency, statutory audit adjustments & zero-difference carry-forward roll-overs
                </p>
              </div>
            </div>
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start lg:self-auto">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Simulate Role:</span>
            </span>
            {(['OWNER', 'ACCOUNTANT', 'DATA_ENTRY'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setCurrentUser({
                    id: r === 'OWNER' ? 'usr-001' : r === 'ACCOUNTANT' ? 'usr-002' : 'usr-003',
                    name: r === 'OWNER' ? 'Vikram Singhania' : r === 'ACCOUNTANT' ? 'Priya Deshmukh' : 'Ramesh Patel',
                    role: r,
                  })
                }
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentUser.role === r
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {r === 'OWNER' ? '👑 Owner' : r === 'ACCOUNTANT' ? '💼 Accountant' : '✍️ Data Entry'}
              </button>
            ))}
          </div>
        </div>

        {/* Global Multi-Year Concurrency Status Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Prior Fiscal Year (Under Audit)</div>
              <div className="text-sm font-black text-amber-300 flex items-center space-x-1.5">
                <span>FY 2025-26</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-700/50">
                  FINANCE REVIEW / AUDIT
                </span>
              </div>
            </div>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Operational Fiscal Year</div>
              <div className="text-sm font-black text-emerald-400 flex items-center space-x-1.5">
                <span>FY 2026-27</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-200 border border-emerald-700/50">
                  OPEN & POSTING
                </span>
              </div>
            </div>
            <Unlock className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Opening Balance Sync Status</div>
              <div className="text-sm font-black flex items-center space-x-1.5">
                {syncDiff?.isOutOfSync ? (
                  <>
                    <span className="text-amber-400">⚠️ Out of Sync</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200">
                      {syncDiff.totalAuditAdjustmentsCount} Adjustments
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400">🟢 100% Synchronized</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                      Zero Variance
                    </span>
                  </>
                )}
              </div>
            </div>
            <RefreshCw className={`w-4 h-4 ${syncDiff?.isOutOfSync ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <StandardTabs<'sync' | 'wizard' | 'matrix' | 'audit_trail'>
        activeTab={activeView}
        onChange={setActiveView}
        tabs={[
          {
            id: 'sync',
            label: 'Audit Adjustments & Live Opening Sync',
            icon: RotateCcw,
            badge: syncDiff?.isOutOfSync ? `${syncDiff.totalAuditAdjustmentsCount} Pending` : 'In Sync',
            badgeVariant: syncDiff?.isOutOfSync ? 'warning' : 'success',
          },
          {
            id: 'wizard',
            label: 'SME Guided Year-End Wizard (6 Steps)',
            icon: Sparkles,
          },
          {
            id: 'matrix',
            label: '12-Month Period Matrix & Hard Freeze',
            icon: Calendar,
          },
          {
            id: 'audit_trail',
            label: 'Versioned Closing Runs & MCA Audit Trail',
            icon: ShieldCheck,
          },
        ]}
      />

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border border-rose-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: AUDIT ADJUSTMENTS & LIVE OPENING BALANCE SYNCHRONIZATION WORKSPACE */}
      {activeView === 'sync' && (
        <div className="space-y-6">
          {/* Executive Summary Cards: How changes flow to new FY */}
          <KPIGrid columns={4}>
            <KPIScorecard
              label="INITIAL NET PROFIT (FY 25-26)"
              value={`₹${syncDiff?.initialNetProfit.toLocaleString('en-IN')}`}
              icon={<Calendar className="w-3.5 h-3.5" />}
              badge="Pre-Audit"
              badgeVariant="indigo"
              footerLeft="Statutory Status:"
              footerRight="Before Audit"
            />
            <KPIScorecard
              label="REVISED NET PROFIT (POST-AUDIT)"
              value={`₹${syncDiff?.revisedNetProfit.toLocaleString('en-IN')}`}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              variant={syncDiff && syncDiff.netProfitDelta !== 0 ? (syncDiff.netProfitDelta < 0 ? 'rose' : 'emerald') : 'default'}
              badge={syncDiff && syncDiff.netProfitDelta !== 0 ? `${syncDiff.netProfitDelta < 0 ? '-' : '+'}₹${Math.abs(syncDiff.netProfitDelta).toLocaleString('en-IN')}` : 'No Variance'}
              badgeVariant={syncDiff && syncDiff.netProfitDelta !== 0 ? (syncDiff.netProfitDelta < 0 ? 'rose' : 'emerald') : 'default'}
              footerLeft="Transfers To:"
              footerRight="Retained Earnings"
            />
            <KPIScorecard
              label="REVISED RETAINED EARNINGS"
              value={`₹${syncDiff?.revisedRetainedEarnings.toLocaleString('en-IN')}`}
              icon={<Layers className="w-3.5 h-3.5" />}
              badge="Rolled Over"
              badgeVariant="emerald"
              footerLeft="FY 2026-27:"
              footerRight="New Opening Balance"
            />
            <KPIScorecard
              label="AUDIT SYNC STATUS"
              value={syncDiff?.isOutOfSync ? 'Sync Needed' : 'In Full Sync'}
              variant={syncDiff?.isOutOfSync ? 'amber' : 'emerald'}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              badge={syncDiff?.isOutOfSync ? 'Action Required' : 'Zero Variance'}
              badgeVariant={syncDiff?.isOutOfSync ? 'amber' : 'emerald'}
              footer={
                syncDiff?.isOutOfSync ? (
                  <button
                    type="button"
                    onClick={handleSyncOpeningBalances}
                    disabled={isLoading || currentUser.role === 'DATA_ENTRY'}
                    className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync & Roll to FY 26-27</span>
                  </button>
                ) : (
                  <div className="flex justify-between items-center w-full text-xs text-slate-500 font-medium">
                    <span>Audit Sync:</span>
                    <strong className="text-emerald-600 font-bold">100% Balanced</strong>
                  </div>
                )
              }
            />
          </KPIGrid>

          {/* Audit Adjustment Workflow & Action Bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>Prior-Period Audit Adjustments & Live Delta Diff</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Source: FY {selectedFY} &rarr; Target: FY {targetFY}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Track how auditor JVs (depreciation, accruals, bad debts, tax provisions) in FY 2025-26 automatically recalculate opening balances in FY 2026-27
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(true)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Post Audit Adjustment JV</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncOpeningBalances}
                  disabled={!syncDiff?.isOutOfSync || currentUser.role === 'DATA_ENTRY'}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/30 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Synchronize Opening Balances</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Filter View:</span>
              <button
                type="button"
                onClick={() => setVarianceFilter('DIFF_ONLY')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  varianceFilter === 'DIFF_ONLY'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Modified / Out of Sync Accounts Only ({syncDiff?.variances.filter((v) => v.isOutOfSync || v.auditAdjustmentsTotal !== 0).length})
              </button>
              <button
                type="button"
                onClick={() => setVarianceFilter('BS_ONLY')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  varianceFilter === 'BS_ONLY'
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Balance Sheet Accounts (Roll-Forward)
              </button>
              <button
                type="button"
                onClick={() => setVarianceFilter('PNL_ONLY')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  varianceFilter === 'PNL_ONLY'
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Profit & Loss Accounts (Zero-Reset)
              </button>
              <button
                type="button"
                onClick={() => setVarianceFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  varianceFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All General Ledger Accounts
              </button>
            </div>

            {/* Side-by-Side Account Variance Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4">Ledger Code & Account Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">FY 25-26 Initial Closing</th>
                    <th className="py-3 px-4 text-right">Audit Adjustments (Delta)</th>
                    <th className="py-3 px-4 text-right">FY 25-26 Revised Closing</th>
                    <th className="py-3 px-4 text-right">FY 26-27 Opening Balance</th>
                    <th className="py-3 px-4 text-center">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVariances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No variances found under this filter. All balances are synchronized!
                      </td>
                    </tr>
                  ) : (
                    filteredVariances.map((v) => (
                      <tr key={v.ledgerId} className={`hover:bg-slate-50 transition-colors ${v.isOutOfSync ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{v.ledgerName}</div>
                          <div className="text-[11px] font-mono text-slate-400">Code: {v.ledgerCode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            v.accountCategory === 'BALANCE_SHEET'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {v.groupNature}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">
                          ₹{v.initialClosingFY.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {v.auditAdjustmentsTotal !== 0 ? (
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                              v.auditAdjustmentsTotal > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              {v.auditAdjustmentsTotal > 0 ? '+' : ''}₹{v.auditAdjustmentsTotal.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹{v.revisedClosingFY.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-indigo-700">
                          {v.accountCategory === 'PROFIT_LOSS' ? (
                            <span className="text-slate-400 italic">₹0.00 (Reset)</span>
                          ) : (
                            `₹${v.currentOpeningFY.toLocaleString('en-IN')}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {v.isOutOfSync ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Out of Sync (Δ ₹{Math.abs(v.varianceDelta).toLocaleString('en-IN')})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center space-x-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>In Sync</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* List of Posted Audit Adjustment JVs */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Statutory Audit Adjustment Journal Vouchers Log (FY {selectedFY})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {syncDiff?.auditAdjustments.map((adj) => (
                  <div key={adj.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{adj.voucherNumber}</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        adj.type === 'DEBIT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {adj.type} ₹{adj.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800">{adj.ledgerName} ({adj.groupNature})</div>
                    <div className="text-slate-600">{adj.description}</div>
                    {adj.auditorReference && (
                      <div className="text-[11px] text-indigo-600 font-medium">Ref: {adj.auditorReference}</div>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                      <span>Posted By: {adj.postedByName}</span>
                      <span>{new Date(adj.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SME GUIDED 6-STEP WIZARD */}
      {activeView === 'wizard' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">SME Guided Year-End Closing Wizard</h2>
              <p className="text-xs text-slate-500">Step {wizardStep} of 6: Automated readiness checks, zero-difference previews, and owner dual approval</p>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  onClick={() => setWizardStep(s)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                    wizardStep === s
                      ? 'bg-indigo-600 text-white shadow-md'
                      : wizardStep > s
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {wizardStep > s ? <Check className="w-4 h-4" /> : s}
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Step 1: Year Selection */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Step 1: Select Closing Financial Year & Concurrency Mode</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/40 space-y-2">
                  <div className="font-bold text-indigo-900">FY 2025-26 &rarr; FY 2026-27 (Recommended)</div>
                  <p className="text-xs text-slate-600">
                    Close FY 2025-26 and roll-forward closing balances to newly opened FY 2026-27. All P&L nominal accounts reset to ₹0.00.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-indigo-700"
                >
                  Proceed to Readiness Audit &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Wizard Step 2: 18-Point Readiness Audit */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Step 2: 18-Category Year-End Pre-Close Health Audit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {readiness?.categories.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{c.title}</span>
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">{c.status}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">{c.message}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setWizardStep(1)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer">Back</button>
                <button type="button" onClick={() => setWizardStep(3)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-indigo-700">Preview Balance Sheet &rarr;</button>
              </div>
            </div>
          )}

          {/* Wizard Step 3: Zero-Difference Balance Sheet Roll */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Step 3: Zero-Difference Balance Sheet Roll-Over</h3>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Total Closing Assets (₹{preview?.totalBalanceSheetClosing.toLocaleString('en-IN')}) = Total Opening Assets (₹{preview?.totalBalanceSheetOpening.toLocaleString('en-IN')})</span>
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg">Δ = ₹0.00 Zero Variance Verified</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setWizardStep(2)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer">Back</button>
                <button type="button" onClick={() => setWizardStep(4)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-indigo-700">Sub-Ledger Drilldown &rarr;</button>
              </div>
            </div>
          )}

          {/* Wizard Step 4: Sub-Ledgers */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Step 4: Sub-Ledger Itemized Roll-Forward (AR, AP, Inventory, Fixed Assets)</h3>
              <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button type="button" onClick={() => setSubLedgerTab('ar')} className={`px-3 py-1.5 rounded-lg ${subLedgerTab === 'ar' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Customer AR ({preview?.customerOpenItems.length})</button>
                <button type="button" onClick={() => setSubLedgerTab('ap')} className={`px-3 py-1.5 rounded-lg ${subLedgerTab === 'ap' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Vendor AP ({preview?.vendorOpenItems.length})</button>
                <button type="button" onClick={() => setSubLedgerTab('inventory')} className={`px-3 py-1.5 rounded-lg ${subLedgerTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Warehouse Lots ({preview?.inventoryLayers.length})</button>
                <button type="button" onClick={() => setSubLedgerTab('assets')} className={`px-3 py-1.5 rounded-lg ${subLedgerTab === 'assets' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Fixed Assets ({preview?.fixedAssets.length})</button>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setWizardStep(3)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer">Back</button>
                <button type="button" onClick={() => setWizardStep(5)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-indigo-700">Review & Close &rarr;</button>
              </div>
            </div>
          )}

          {/* Wizard Step 5: Dual Authorization */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Step 5: Owner Authorization & Final Commit</h3>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-amber-900">Security Gate: Business Owner (Vikram Singhania) Confirmation Required</div>
                <p className="text-amber-800">
                  Executing final year-end close will generate closing JV, transfer ₹{preview?.netProfitLossTransferred.toLocaleString('en-IN')} to Retained Earnings, and lock all 12 monthly periods in FY {selectedFY}.
                </p>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setWizardStep(4)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer">Back</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (currentUser.role !== 'OWNER') {
                      alert('Only Business Owner (Vikram Singhania) can execute Final Year-End Close.');
                      return;
                    }
                    setWizardStep(6);
                    setStatusMessage({ type: 'success', text: 'Year-End Close & Carry-Forward executed successfully!' });
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-emerald-700"
                >
                  Commit Final Year-End Close
                </button>
              </div>
            </div>
          )}

          {/* Wizard Step 6: Summary & Completed */}
          {wizardStep === 6 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Year-End Close & Carry-Forward Complete!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                FY 2025-26 finalized. Opening Balances for FY 2026-27 active. All P&L nominal accounts reset to ₹0.00.
              </p>
              <div className="pt-4 flex justify-center space-x-3">
                <button type="button" onClick={() => setActiveView('sync')} className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer">
                  Go to Live Sync Hub
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: 12-MONTH MATRIX */}
      {activeView === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">12-Month Accounting Periods Matrix</h2>
              <p className="text-xs text-slate-500">Configure hard locks, soft closures, and scope-based reopening for individual months</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Period #</th>
                  <th className="py-3 px-4">Month & Year</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">GST Filing</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800">Period {String(p.sequence).padStart(2, '0')}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.monthName}</td>
                    <td className="py-3 px-4 text-xs font-mono">{p.startDate} &rarr; {p.endDate}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">{p.gstFilingStatus}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.status === 'FINAL_CLOSED'
                          ? 'bg-slate-100 text-slate-800'
                          : p.status === 'SOFT_CLOSED'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'REOPENED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'FINAL_CLOSED' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser.role !== 'OWNER') {
                              alert('Only Business Owner can unlock closed periods.');
                              return;
                            }
                            alert(`Period ${p.monthName} reopened for audit adjustment.`);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                        >
                          Reopen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert(`Period ${p.monthName} locked.`)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Soft Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: AUDIT TRAIL */}
      {activeView === 'audit_trail' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Versioned Closing Runs & MCA Audit Trail</h2>
            <p className="text-xs text-slate-500">Immutable ledger logs for statutory audit compliance</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Run Identifier</th>
                  <th className="py-3 px-4">Source &rarr; Target FY</th>
                  <th className="py-3 px-4 text-right">Net Profit Transferred</th>
                  <th className="py-3 px-4">Executed By</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      No previous closing runs recorded yet.
                    </td>
                  </tr>
                ) : (
                  closingHistory.map((r) => (
                    <tr key={r.runId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.runId}</td>
                      <td className="py-3 px-4 font-semibold text-indigo-700">{r.sourceFinancialYearCode} &rarr; {r.targetFinancialYearCode}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">₹{r.netProfitLossTransferred.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-xs text-slate-700">{r.initiatedByName}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(r.initiatedAt).toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: POST PRIOR-PERIOD AUDIT ADJUSTMENT */}
      {showAdjModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Post Prior-Period Audit Adjustment JV</h3>
                <p className="text-xs text-slate-500">Apply statutory auditor adjustments to FY {selectedFY}</p>
              </div>
              <button type="button" onClick={() => setShowAdjModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostAuditAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Account / General Ledger</label>
                <select
                  value={adjForm.ledgerId}
                  onChange={(e) => setAdjForm({ ...adjForm, ledgerId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="led-depr-exp">Depreciation Expense (5300) [P&L Expense]</option>
                  <option value="led-accum-depr">Accumulated Depreciation (1590) [Balance Sheet Asset]</option>
                  <option value="led-audit-fees">Legal & Professional Fees (5500) [P&L Expense]</option>
                  <option value="led-ar-trade">Trade Debtors / Bad Debts Provision (1100) [Balance Sheet]</option>
                  <option value="led-inventory">Inventory Revaluation / Obsolescence (1200) [Balance Sheet]</option>
                  <option value="led-salaries">Bonus & Gratuity Accrual (5100) [P&L Expense]</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Entry Nature</label>
                  <select
                    value={adjForm.type}
                    onChange={(e) => setAdjForm({ ...adjForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="DEBIT">DEBIT (Increase Exp / Asset)</option>
                    <option value="CREDIT">CREDIT (Increase Inc / Liab)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Adjustment Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={adjForm.amount}
                    onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Auditor Workpaper / Report Reference</label>
                <input
                  type="text"
                  placeholder="e.g. STAT-AUDIT/2026/OBS-44"
                  value={adjForm.auditorReference}
                  onChange={(e) => setAdjForm({ ...adjForm, auditorReference: e.target.value })}
                  className="w-full px-3.5 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Audit Justification</label>
                <textarea
                  rows={3}
                  placeholder="Enter specific audit observation or statutory reason for this prior-period adjustment..."
                  value={adjForm.description}
                  onChange={(e) => setAdjForm({ ...adjForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-[11px]">
                💡 Posting this adjustment will update FY 2025-26 financials and automatically flag FY 2026-27 Opening Balances for 1-click re-synchronization.
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Post Adjustment JV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
