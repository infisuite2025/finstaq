import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock, Unlock, Calendar, ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  RefreshCw, RotateCcw, Sliders, Check, X, FileText, ArrowRight, Info,
  AlertCircle, Sparkles, UserCheck, CalendarDays, KeyRound, Building
} from 'lucide-react';
import { StandardTabs } from '../common/StandardTabs';

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
  const { getAuthHeaders } = useAuth();
  const [matrix, setMatrix] = useState<PeriodLockMatrix | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(tenantUsers[1]); // Priya (Accountant)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal actions
  const [selectedMonth, setSelectedMonth] = useState<MonthlyPeriod | null>(null);
  const [modalAction, setModalAction] = useState<'CLOSE' | 'REOPEN' | null>(null);
  const [modalText, setModalText] = useState<string>('');

  // Year End Modal
  const [selectedYear, setSelectedYear] = useState<YearEndClosure | null>(null);
  const [yearRemarks, setYearRemarks] = useState<string>('');

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
      const res = await fetch('/api/v1/period-lock/matrix?tenantId=27AABCF1234F1Z5');
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

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
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

  const handleSaveHardFreeze = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/period-lock/hard-freeze', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
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
      const res = await fetch('/api/v1/period-lock/backdate-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
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
      const res = await fetch('/api/v1/period-lock/validate-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
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
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">OWNER</span>;
      case 'ACCOUNTANT':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">ACCOUNTANT</span>;
      case 'DATA_ENTRY':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">DATA_ENTRY</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  const closedCount = matrix?.months.filter(m => m.status === 'CLOSED').length || 0;
  const openCount = matrix?.months.filter(m => m.status === 'OPEN').length || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Persona Switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-lg shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Period Locking & Backdated Entry Controls
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                  Financial Integrity & Audit Shield
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Lock accounting months after GST/Audit, set hard books freeze dates, and enforce role-based backdating limits.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Persona Switcher */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <UserCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Active Acting User:</div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = tenantUsers.find(x => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-4"
            >
              {tenantUsers.map(u => (
                <option key={u.id} value={u.id}>
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
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <div className="text-sm font-medium">{feedback.text}</div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{closedCount} Months</div>
            <div className="text-xs text-slate-500 font-medium">Locked & Finalized (FY 25-26)</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{openCount} Months</div>
            <div className="text-xs text-slate-500 font-medium">Open for Posting</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 truncate">
              {matrix?.hardFreeze.booksClosedDate ? new Date(matrix.hardFreeze.booksClosedDate).toLocaleDateString() : 'None'}
            </div>
            <div className="text-xs text-slate-500 font-medium">Hard Books Freeze Date</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">
              Clerk: {clerkDays}d | Acct: {accountantDays}d
            </div>
            <div className="text-xs text-slate-500 font-medium">Role Backdate Grace Limit</div>
          </div>
        </div>
      </div>

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
            label: 'Year-End Lock & Books Hard Freeze',
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
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-4 shadow-sm -mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Period Closure Matrix (FY 2025-26)</h2>
              <p className="text-xs text-slate-500">
                Locking an accounting month freezes all sub-ledgers, GST returns, and vouchers for that period. Reopening requires Owner authorization.
              </p>
            </div>
            <button
              onClick={fetchMatrix}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100">
                {matrix?.months.map((m) => {
                  const isClosed = m.status === 'CLOSED';
                  return (
                    <tr key={m.periodKey} className={`hover:bg-slate-50 transition-colors ${isClosed ? 'bg-slate-50/40' : 'bg-white'}`}>
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {isClosed ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                        <span>{m.monthName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {m.startDate} to {m.endDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            <Lock className="w-3 h-3" /> Locked & Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <Unlock className="w-3 h-3" /> Open
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {m.gstFilingStatus === 'GSTR_3B_FILED' ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[11px]">
                            GSTR-3B Filed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium text-[11px]">
                            Pending Filing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {m.closedByName ? (
                          <div>
                            <div className="font-semibold text-slate-800">{m.closedByName}</div>
                            <div className="text-[11px] text-slate-400">{m.closedAt ? new Date(m.closedAt).toLocaleDateString() : ''}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate text-slate-600">
                        {m.reopenReason ? (
                          <span className="text-indigo-600 font-medium">[Reopened: {m.reopenReason}]</span>
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
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 mx-auto"
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
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors flex items-center gap-1 mx-auto"
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
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-6 shadow-sm -mt-6">
          {/* Hard Freeze Cutoff Date Section */}
          <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 p-6 rounded-xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Statutory Books Hard Freeze Date</h3>
                <p className="text-xs text-slate-500">
                  Absolute hard freeze date. Under no circumstances can any user (even the Owner) post, adjust, or backdate entries on or before this date.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Freeze Cutoff Date</label>
                <input
                  type="date"
                  value={freezeDate}
                  onChange={(e) => setFreezeDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hard Freeze Status</label>
                <div className="flex items-center gap-3 h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFreezeActive}
                      onChange={(e) => setIsFreezeActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-800">
                    {isFreezeActive ? 'Enforced (Active)' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Freeze Reason / Audit Note</label>
                <input
                  type="text"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="e.g., Statutory MCA audit signed off."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-rose-500"
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
            <h3 className="text-base font-bold text-slate-900 mb-3">Fiscal Year Finalization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matrix?.years.map((y) => (
                <div key={y.fiscalYear} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-base font-bold text-slate-900">Fiscal Year {y.fiscalYear}</div>
                    {y.isYearClosed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Audited & Finalized
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Current Active Year
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    Period: <span className="font-mono text-slate-700 font-semibold">{y.startDate} to {y.endDate}</span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex justify-between">
                      <span>P&L Retained Earnings Rollover:</span>
                      <span className="font-semibold text-emerald-700">
                        {y.retainedEarningsTransferred ? '✓ Transferred to Reserves' : 'Pending Year-End'}
                      </span>
                    </div>
                    {y.closedByName && (
                      <div className="flex justify-between">
                        <span>Signed off by:</span>
                        <span className="font-semibold text-slate-800">{y.closedByName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backdating & Role Grace Policy */}
      {activeTab === 'backdating' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-6 shadow-sm -mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Backdating & Role Grace Windows</h2>
              <p className="text-xs text-slate-500">
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
            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-900 text-sm">DATA_ENTRY (Clerk)</span>
                {getRoleBadge('DATA_ENTRY')}
              </div>
              <p className="text-xs text-slate-600">
                Short grace period for high-speed clerk data entry to fix daily typing mistakes.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Allowed Backdate (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={clerkDays}
                    onChange={(e) => setClerkDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-500">Days into past</span>
                </div>
              </div>
            </div>

            {/* ACCOUNTANT Grace Limit */}
            <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900 text-sm">ACCOUNTANT (Lead)</span>
                {getRoleBadge('ACCOUNTANT')}
              </div>
              <p className="text-xs text-slate-600">
                Standard window to permit month-end supplier bill reconciliation and adjusting entries.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Allowed Backdate (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={accountantDays}
                    onChange={(e) => setAccountantDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-500">Days into past</span>
                </div>
              </div>
            </div>

            {/* OWNER Grace Limit */}
            <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-900 text-sm">OWNER (Management)</span>
                {getRoleBadge('OWNER')}
              </div>
              <p className="text-xs text-slate-600">
                Full administrative flexibility across any open fiscal month up to the hard books freeze date.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Allowed Backdate (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ownerDays}
                    onChange={(e) => setOwnerDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-medium text-slate-500">Days into past</span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Dating Settings */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Post-Dated Cheques & Future Dating</h4>
              <p className="text-xs text-slate-500">Allow vouchers to be dated up to N days in the future for Post-Dated Cheques (PDC).</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={futureAllowed}
                  onChange={(e) => setFutureAllowed(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Allow Future Dating
              </label>
              <input
                type="number"
                disabled={!futureAllowed}
                value={futureDays}
                onChange={(e) => setFutureDays(Number(e.target.value))}
                className="w-20 px-2.5 py-1 text-sm border border-slate-300 rounded font-bold text-slate-900 disabled:bg-slate-100"
              />
              <span className="text-xs text-slate-500">Days limit</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Date Validator */}
      {activeTab === 'validator' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-6 shadow-sm -mt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Transaction Date Validator & Policy Tester</h2>
            <p className="text-xs text-slate-500">
              Test any voucher date and role against active Hard Freeze, Monthly Period Locks, and Backdate limits in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Transaction Date</label>
              <input
                type="date"
                value={valDate}
                onChange={(e) => setValDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Testing Role</label>
              <select
                value={valRole}
                onChange={(e) => setValRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DATA_ENTRY">DATA_ENTRY (Ramesh Patel - 3d Grace)</option>
                <option value="ACCOUNTANT">ACCOUNTANT (Priya Deshmukh - 15d Grace)</option>
                <option value="OWNER">OWNER (Vikram Singhania - Full Access)</option>
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
              valResult.allowed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                {valResult.allowed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`text-base font-bold ${valResult.allowed ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {valResult.allowed ? 'Transaction Date ALLOWED' : 'Transaction Date BLOCKED'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${valResult.allowed ? 'text-emerald-700' : 'text-rose-700 font-medium'}`}>
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
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                {modalAction === 'CLOSE' ? <Lock className="w-5 h-5 text-rose-600" /> : <Unlock className="w-5 h-5 text-amber-600" />}
                <span>{modalAction === 'CLOSE' ? 'Lock & Close Period' : 'Reopen Accounting Period'}</span>
              </div>
              <button onClick={() => { setSelectedMonth(null); setModalAction(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Month:</span>
                <span className="font-bold text-slate-900">{selectedMonth.monthName} ({selectedMonth.periodKey})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Action Authority:</span>
                <span className="font-semibold text-indigo-700">{currentUser.name} ({currentUser.role})</span>
              </div>
            </div>

            {modalAction === 'REOPEN' && currentUser.role !== 'OWNER' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Only Vikram Singhania (OWNER) can reopen closed accounting periods.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {modalAction === 'CLOSE' ? 'Closing Remarks (Optional)' : 'Mandatory Statutory Justification for Reopening'}
              </label>
              <textarea
                rows={3}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                placeholder={modalAction === 'CLOSE' ? 'e.g., GSTR-3B filed, bank reconciled.' : 'e.g., Authorized adjustment for auditor query.'}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setSelectedMonth(null); setModalAction(null); }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMonthAction}
                disabled={modalAction === 'REOPEN' && currentUser.role !== 'OWNER'}
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
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
    </div>
  );
};
