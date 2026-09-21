import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock, Unlock, Calendar, ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  RefreshCw, RotateCcw, Sliders, Check, X, FileText, ArrowRight, Info,
  AlertCircle, Sparkles, UserCheck, CalendarDays, KeyRound, Building, CheckCircle
} from 'lucide-react';
import { StandardTabs } from '../common/StandardTabs';
import { KPIGrid, KPIScorecard } from '../common/KPIScorecard';

type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';

interface MonthlyPeriod {
  periodKey: string;
  fiscalYear: string;
  monthIndex: number;
  monthName: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  gstFilingStatus: 'NOT_APPLICABLE' | 'PENDING' | 'GSTR_1_FILED' | 'GSTR_3B_FILED' | 'RECONCILED';
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  closedByRole?: string;
  closingRemarks?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
}

interface YearEndClosure {
  fiscalYear: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  isYearClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  closingRemarks?: string;
  retainedEarningsTransferred: boolean;
}

interface HardFreezeSettings {
  booksClosedDate: string;
  isHardFreezeActive: boolean;
  freezeReason: string;
  updatedAt: string;
  updatedBy: string;
}

interface BackdatingPolicy {
  enabled: boolean;
  maxBackdateDaysDefault: number;
  roleBackdateLimits: {
    DATA_ENTRY: number;
    ACCOUNTANT: number;
    OWNER: number;
  };
  allowFutureDating: boolean;
  maxFutureDays: number;
  updatedAt: string;
  updatedBy: string;
}

interface PeriodLockMatrix {
  tenantId: string;
  currentFiscalYear: string;
  hardFreeze: HardFreezeSettings;
  backdatingPolicy: BackdatingPolicy;
  months: MonthlyPeriod[];
  years: YearEndClosure[];
}

interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

const tenantUsers: CurrentUser[] = [
  { id: 'usr-001', name: 'Vikram Singhania', role: 'OWNER', email: 'owner@apexindustries.com' },
  { id: 'usr-002', name: 'Priya Deshmukh', role: 'ACCOUNTANT', email: 'accountant@apexindustries.com' },
  { id: 'usr-003', name: 'Ramesh Patel', role: 'DATA_ENTRY', email: 'clerk@apexindustries.com' },
];

export const PeriodLockWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'months' | 'years' | 'backdating' | 'validator'>('months');
  const { getAuthHeaders, session } = useAuth();
  const [matrix, setMatrix] = useState<PeriodLockMatrix | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(tenantUsers[1]); // Priya (Accountant)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Month Modal actions
  const [selectedMonth, setSelectedMonth] = useState<MonthlyPeriod | null>(null);
  const [modalAction, setModalAction] = useState<'CLOSE' | 'REOPEN' | null>(null);
  const [modalText, setModalText] = useState<string>('');

  // Year End Modal actions
  const [selectedYear, setSelectedYear] = useState<YearEndClosure | null>(null);
  const [yearRemarks, setYearRemarks] = useState<string>('Statutory books audited, final balance sheet verified.');

  // Hard freeze form state
  const [freezeDate, setFreezeDate] = useState<string>('2025-03-31');
  const [isFreezeActive, setIsFreezeActive] = useState<boolean>(true);
  const [freezeReason, setFreezeReason] = useState<string>('Statutory audit for FY 2024-25 finalized and filed with MCA.');

  // Backdating form state
  const [backdatingEnabled, setBackdatingEnabled] = useState<boolean>(true);
  const [clerkDays, setClerkDays] = useState<number>(3);
  const [accountantDays, setAccountantDays] = useState<number>(15);
  const [ownerDays, setOwnerDays] = useState<number>(365);
  const [futureAllowed, setFutureAllowed] = useState<boolean>(true);
  const [futureDays, setFutureDays] = useState<number>(30);

  // Live Date Validator State
  const [valDate, setValDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [valRole, setValRole] = useState<UserRole>('DATA_ENTRY');
  const [valResult, setValResult] = useState<any>(null);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const tenant = session?.tenantId || '27AABCF1234F1Z5';
      const res = await fetch(`/api/v1/period-lock/matrix?tenantId=${tenant}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const m: PeriodLockMatrix = data.data;
        setMatrix(m);
        if (m.hardFreeze) {
          setFreezeDate(m.hardFreeze.booksClosedDate);
          setIsFreezeActive(m.hardFreeze.isHardFreezeActive);
          setFreezeReason(m.hardFreeze.freezeReason);
        }
        if (m.backdatingPolicy) {
          setBackdatingEnabled(m.backdatingPolicy.enabled);
          setClerkDays(m.backdatingPolicy.roleBackdateLimits.DATA_ENTRY);
          setAccountantDays(m.backdatingPolicy.roleBackdateLimits.ACCOUNTANT);
          setOwnerDays(m.backdatingPolicy.roleBackdateLimits.OWNER);
          setFutureAllowed(m.backdatingPolicy.allowFutureDating);
          setFutureDays(m.backdatingPolicy.maxFutureDays);
        }
      }
    } catch (err) {
      console.error('Error fetching period matrix:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthAction = async () => {
    if (!selectedMonth || !modalAction) return;

    if (modalAction === 'REOPEN') {
      if (currentUser.role !== 'OWNER') {
        showNotification('error', 'Only the Business OWNER (Vikram Singhania) is authorized to reopen a closed period.');
        return;
      }
      if (!modalText.trim()) {
        showNotification('error', 'Mandatory: Statutory justification/reason is required to reopen a closed period.');
        return;
      }
    }

    try {
      const endpoint = modalAction === 'CLOSE'
        ? `/api/v1/period-lock/months/${selectedMonth.periodKey}/close`
        : `/api/v1/period-lock/months/${selectedMonth.periodKey}/reopen`;

      const tenant = session?.tenantId || '27AABCF1234F1Z5';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tenantId: tenant,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          remarks: modalAction === 'CLOSE' ? modalText : undefined,
          reason: modalAction === 'REOPEN' ? modalText : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', `Period ${selectedMonth.monthName} has been ${modalAction === 'CLOSE' ? 'Locked & Closed' : 'Reopened'}!`);
        setSelectedMonth(null);
        setModalAction(null);
        setModalText('');
        fetchMatrix();
      } else {
        showNotification('error', data.message || 'Action failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Server error');
    }
  };

  const handleYearAction = async () => {
    if (!selectedYear) return;
    if (currentUser.role !== 'OWNER') {
      showNotification('error', 'Only the Business OWNER (Vikram Singhania) is authorized to lock fiscal years.');
      return;
    }

    try {
      const tenant = session?.tenantId || '27AABCF1234F1Z5';
      const res = await fetch(`/api/v1/period-lock/years/${selectedYear.fiscalYear}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tenantId: tenant,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          remarks: yearRemarks,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', `Fiscal Year ${selectedYear.fiscalYear} finalized and locked successfully!`);
        setSelectedYear(null);
        setYearRemarks('');
        fetchMatrix();
      } else {
        showNotification('error', data.message || 'Failed to finalize fiscal year');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Server error');
    }
  };

  const handleSaveHardFreeze = async () => {
    setIsLoading(true);
    try {
      const tenant = session?.tenantId || '27AABCF1234F1Z5';
      const res = await fetch('/api/v1/period-lock/hard-freeze', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tenantId: tenant,
          booksClosedDate: freezeDate,
          isHardFreezeActive: isFreezeActive,
          freezeReason: freezeReason,
          userId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', 'Statutory books hard freeze settings updated successfully!');
        fetchMatrix();
      } else {
        showNotification('error', data.message || 'Failed to update hard freeze');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error saving hard freeze');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBackdatingPolicy = async () => {
    setIsLoading(true);
    try {
      const tenant = session?.tenantId || '27AABCF1234F1Z5';
      const res = await fetch('/api/v1/period-lock/backdate-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tenantId: tenant,
          enabled: backdatingEnabled,
          maxBackdateDaysDefault: 7,
          roleBackdateLimits: {
            DATA_ENTRY: Number(clerkDays),
            ACCOUNTANT: Number(accountantDays),
            OWNER: Number(ownerDays),
          },
          allowFutureDating: futureAllowed,
          maxFutureDays: Number(futureDays),
          userId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', 'Backdating & grace window policy updated successfully!');
        fetchMatrix();
      } else {
        showNotification('error', data.message || 'Failed to update backdating policy');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error saving policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateDate = async () => {
    try {
      const tenant = session?.tenantId || '27AABCF1234F1Z5';
      const res = await fetch('/api/v1/period-lock/validate-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tenantId: tenant,
          transactionDate: valDate,
          userRole: valRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setValResult(data.data);
      } else {
        showNotification('error', data.message || 'Validation request failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error validating date');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">OWNER</span>;
      case 'ACCOUNTANT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">ACCOUNTANT</span>;
      case 'DATA_ENTRY':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">DATA_ENTRY</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{role}</span>;
    }
  };

  const closedCount = matrix?.months.filter(m => m.status === 'CLOSED').length || 0;
  const openCount = matrix?.months.filter(m => m.status === 'OPEN').length || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Persona Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-lg shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Period Locking & Backdated Entry Controls
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-full border border-rose-200 dark:border-rose-900">
                  Audit Shield
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Lock accounting months after GST/Audit, set hard books freeze dates, and enforce role-based backdating limits.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Persona Switcher */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Acting User:</div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = tenantUsers.find(x => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-4"
            >
              {tenantUsers.map(u => (
                <option key={u.id} value={u.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div className="ml-1">
            {getRoleBadge(currentUser.role)}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <div className="text-sm font-medium">{feedback.text}</div>
        </div>
      )}

      {/* KPI Stats */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Locked & Finalized"
          value={`${closedCount} Months`}
          badge="FY 2025-26"
          badgeVariant="rose"
          icon={<Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          variant="rose"
          footerLeft="Sub-ledgers frozen"
        />
        <KPIScorecard
          label="Open for Posting"
          value={`${openCount} Months`}
          badge="Active"
          badgeVariant="emerald"
          icon={<Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          variant="emerald"
          footerLeft="Open for entries"
        />
        <KPIScorecard
          label="Hard Books Freeze"
          value={matrix?.hardFreeze?.booksClosedDate ? new Date(matrix.hardFreeze.booksClosedDate).toLocaleDateString() : 'None'}
          badge={matrix?.hardFreeze?.isHardFreezeActive ? 'Enforced' : 'Disabled'}
          badgeVariant={matrix?.hardFreeze?.isHardFreezeActive ? 'danger' : 'default'}
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          variant="indigo"
          footerLeft="Statutory audit lock"
        />
        <KPIScorecard
          label="Role Backdate Limit"
          value={`C:${clerkDays}d | A:${accountantDays}d`}
          badge="Policy"
          badgeVariant="default"
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          variant="amber"
          footerLeft="Clerk vs Accountant"
        />
      </KPIGrid>

      {/* Navigation Tabs */}
      <StandardTabs<'months' | 'years' | 'backdating' | 'validator'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'months',
            label: 'Monthly Period Matrix (FY 2025-26)',
            icon: CalendarDays,
            badge: `${closedCount} Closed`,
            badgeVariant: 'default',
          },
          {
            id: 'years',
            label: 'Year-End Lock & Hard Freeze',
            icon: Building,
          },
          {
            id: 'backdating',
            label: 'Backdating & Role Grace Policy',
            icon: Sliders,
          },
          {
            id: 'validator',
            label: 'Live Date Validator & Tester',
            icon: ShieldCheck,
          },
        ]}
      />

      {/* Tab 1: Monthly Period Closure Matrix */}
      {activeTab === 'months' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm -mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Monthly Period Closure Matrix (FY 2025-26)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Locking an accounting month freezes all sub-ledgers, GST returns, and vouchers for that period. Reopening requires Owner authorization.
              </p>
            </div>
            <button
              onClick={fetchMatrix}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Period / Month</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">GST Filing Status</th>
                  <th className="py-3 px-4">Closed By & Date</th>
                  <th className="py-3 px-4">Remarks / Reopen Reason</th>
                  <th className="py-3 px-4 text-center">Period Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matrix?.months.map((m) => {
                  const isClosed = m.status === 'CLOSED';
                  return (
                    <tr key={m.periodKey} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isClosed ? 'bg-slate-50/40 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-900'}`}>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isClosed ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                        <span>{m.monthName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {m.startDate} to {m.endDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            <Lock className="w-3 h-3" /> Locked & Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <Unlock className="w-3 h-3" /> Open
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {m.gstFilingStatus === 'GSTR_3B_FILED' ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded font-semibold text-[11px]">
                            GSTR-3B Filed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded font-medium text-[11px]">
                            Pending Filing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {m.closedByName ? (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{m.closedByName}</div>
                            <div className="text-[11px] text-slate-400">{m.closedAt ? new Date(m.closedAt).toLocaleDateString() : ''}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {m.reopenReason ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">[Reopened: {m.reopenReason}]</span>
                        ) : (
                          m.closingRemarks || '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isClosed ? (
                          <button
                            onClick={() => {
                              setSelectedMonth(m);
                              setModalAction('REOPEN');
                              setModalText('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Unlock className="w-3 h-3" /> Reopen Month
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedMonth(m);
                              setModalAction('CLOSE');
                              setModalText('Monthly accounts & reconciliation finalized.');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Lock className="w-3 h-3" /> Close Month
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Year-End Lock & Books Hard Freeze */}
      {activeTab === 'years' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-6 shadow-sm -mt-6">
          {/* Hard Freeze Cutoff Date Section */}
          <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 dark:from-slate-800/40 dark:to-rose-950/20 p-5 sm:p-6 rounded-xl border border-rose-100 dark:border-rose-900/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Statutory Books Hard Freeze Date</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Absolute hard freeze date. Under no circumstances can any user (even the Owner) post, adjust, or backdate entries on or before this date.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Freeze Cutoff Date</label>
                <input
                  type="date"
                  value={freezeDate}
                  onChange={(e) => setFreezeDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Hard Freeze Status</label>
                <div className="flex items-center gap-3 h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFreezeActive}
                      onChange={(e) => setIsFreezeActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isFreezeActive ? 'Enforced (Active)' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Freeze Reason / Audit Note</label>
                <input
                  type="text"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="e.g., Statutory MCA audit signed off."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveHardFreeze}
                disabled={isLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" /> Save Hard Freeze Cutoff
              </button>
            </div>
          </div>

          {/* Fiscal Years Cards */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Fiscal Year Finalization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matrix?.years.map((y) => (
                <div key={y.fiscalYear} className="p-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-base font-bold text-slate-900 dark:text-white">Fiscal Year {y.fiscalYear}</div>
                    {y.isYearClosed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Audited & Finalized
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Current Active Year
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Period: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{y.startDate} to {y.endDate}</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span>P&L Retained Earnings:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {y.retainedEarningsTransferred ? 'Transferred to Reserves' : 'Pending Year-End'}
                      </span>
                    </div>
                    {y.closedByName && (
                      <div className="flex justify-between">
                        <span>Signed off by:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{y.closedByName}</span>
                      </div>
                    )}
                    {y.closingRemarks && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5 border-t border-slate-200/50 dark:border-slate-800">
                        "{y.closingRemarks}"
                      </div>
                    )}
                  </div>

                  {!y.isYearClosed && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => setSelectedYear(y)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" /> Finalize & Lock FY {y.fiscalYear}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backdating & Role Grace Policy */}
      {activeTab === 'backdating' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-6 shadow-sm -mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Backdating & Role Grace Windows</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define how many days into the past or future each user role can post transactions to avoid clerical errors and balance distortion.
              </p>
            </div>
            <button
              onClick={handleSaveBackdatingPolicy}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" /> Save Policy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DATA_ENTRY Grace Limit */}
            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">DATA_ENTRY (Clerk)</span>
                {getRoleBadge('DATA_ENTRY')}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Short grace period for high-speed clerk data entry to fix daily typing mistakes.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Allowed Backdate (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={clerkDays}
                    onChange={(e) => setClerkDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Days into past</span>
                </div>
              </div>
            </div>

            {/* ACCOUNTANT Grace Limit */}
            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900 dark:text-blue-200 text-sm">ACCOUNTANT (Lead)</span>
                {getRoleBadge('ACCOUNTANT')}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Standard window to permit month-end supplier bill reconciliation and adjusting entries.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Allowed Backdate (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={accountantDays}
                    onChange={(e) => setAccountantDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Days into past</span>
                </div>
              </div>
            </div>

            {/* OWNER Grace Limit */}
            <div className="p-5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-900 dark:text-purple-200 text-sm">OWNER (Management)</span>
                {getRoleBadge('OWNER')}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Full administrative flexibility across any open fiscal month up to the hard books freeze date.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Allowed Backdate (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ownerDays}
                    onChange={(e) => setOwnerDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Days into past</span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Dating Settings */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Post-Dated Cheques & Future Dating</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Allow vouchers to be dated up to N days in the future for Post-Dated Cheques (PDC).</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={futureAllowed}
                  onChange={(e) => setFutureAllowed(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
                />
                Allow Future Dating
              </label>
              <input
                type="number"
                disabled={!futureAllowed}
                value={futureDays}
                onChange={(e) => setFutureDays(Number(e.target.value))}
                className="w-20 px-2.5 py-1 text-sm border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">Days limit</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Date Validator */}
      {activeTab === 'validator' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-6 shadow-sm -mt-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Live Transaction Date Validator & Policy Tester</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test any voucher date and role against active Hard Freeze, Monthly Period Locks, and Backdate limits in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Transaction Date</label>
              <input
                type="date"
                value={valDate}
                onChange={(e) => setValDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Testing Role</label>
              <select
                value={valRole}
                onChange={(e) => setValRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DATA_ENTRY" className="dark:bg-slate-900">DATA_ENTRY (Ramesh Patel - 3d Grace)</option>
                <option value="ACCOUNTANT" className="dark:bg-slate-900">ACCOUNTANT (Priya Deshmukh - 15d Grace)</option>
                <option value="OWNER" className="dark:bg-slate-900">OWNER (Vikram Singhania - Full Access)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleValidateDate}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Run Date Validation
            </button>
          </div>

          {valResult && (
            <div className={`p-5 rounded-xl border ${
              valResult.allowed 
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
            }`}>
              <div className="flex items-center gap-3">
                {valResult.allowed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`text-base font-bold ${valResult.allowed ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'}`}>
                    {valResult.allowed ? 'Transaction Date ALLOWED' : 'Transaction Date BLOCKED'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${valResult.allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300 font-medium'}`}>
                    {valResult.allowed
                      ? 'The selected transaction date satisfies all Hard Freeze, Monthly Lock, and Role Backdating rules.'
                      : valResult.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Close / Reopen Month Modal */}
      {selectedMonth && modalAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
                {modalAction === 'CLOSE' ? <Lock className="w-5 h-5 text-rose-600" /> : <Unlock className="w-5 h-5 text-amber-600" />}
                <span>{modalAction === 'CLOSE' ? 'Lock & Close Period' : 'Reopen Accounting Period'}</span>
              </div>
              <button onClick={() => { setSelectedMonth(null); setModalAction(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Month:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMonth.monthName} ({selectedMonth.periodKey})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Action Authority:</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">{currentUser.name} ({currentUser.role})</span>
              </div>
            </div>

            {modalAction === 'REOPEN' && currentUser.role !== 'OWNER' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Only Vikram Singhania (OWNER) can reopen closed accounting periods.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {modalAction === 'CLOSE' ? 'Closing Remarks (Optional)' : 'Mandatory Statutory Justification for Reopening'}
              </label>
              <textarea
                rows={3}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                placeholder={modalAction === 'CLOSE' ? 'e.g., GSTR-3B filed, bank reconciled.' : 'e.g., Authorized adjustment for auditor query.'}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setSelectedMonth(null); setModalAction(null); }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMonthAction}
                disabled={modalAction === 'REOPEN' && currentUser.role !== 'OWNER'}
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors ${
                  modalAction === 'CLOSE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {modalAction === 'CLOSE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                Confirm {modalAction === 'CLOSE' ? 'Close Month' : 'Reopen Month'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Year Modal */}
      {selectedYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
                <Lock className="w-5 h-5 text-rose-600" />
                <span>Finalize & Lock Fiscal Year {selectedYear.fiscalYear}</span>
              </div>
              <button onClick={() => setSelectedYear(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fiscal Year Period:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedYear.startDate} to {selectedYear.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sign-off Authority:</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">{currentUser.name} ({currentUser.role})</span>
              </div>
            </div>

            {currentUser.role !== 'OWNER' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Only Vikram Singhania (OWNER) can finalize and lock fiscal years.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Audit Remarks & MCA Sign-off Notes
              </label>
              <textarea
                rows={3}
                value={yearRemarks}
                onChange={(e) => setYearRemarks(e.target.value)}
                placeholder="Statutory books audited, final balance sheet verified."
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedYear(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleYearAction}
                disabled={currentUser.role !== 'OWNER'}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Confirm Lock Fiscal Year
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

