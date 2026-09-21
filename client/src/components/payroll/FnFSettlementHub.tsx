import React, { useState } from 'react';
import {
  LogOut,
  FileCheck,
  Award,
  DollarSign,
  Printer,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  X,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Briefcase,
  Layers,
  Calculator,
} from 'lucide-react';
import { Employee, FnFSettlementRecord } from './payrollTypes';
import { UI } from '../../theme/uiTheme';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface FnFSettlementHubProps {
  employees: Employee[];
  settlements: FnFSettlementRecord[];
  onCreateSettlement: (settlement: FnFSettlementRecord) => void;
  onUpdateSettlementStatus: (settlementId: string, status: FnFSettlementRecord['settlementStatus']) => void;
}

export function FnFSettlementHub({
  employees,
  settlements,
  onCreateSettlement,
  onUpdateSettlementStatus,
}: FnFSettlementHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedRecordForDoc, setSelectedRecordForDoc] = useState<{
    record: FnFSettlementRecord;
    docType: 'STATEMENT' | 'RELIEVING' | 'EXPERIENCE';
  } | null>(null);

  // Form State for F&F Calculation
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [dateOfResignation, setDateOfResignation] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [lastWorkingDay, setLastWorkingDay] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [exitReason, setExitReason] = useState<FnFSettlementRecord['exitReason']>('RESIGNATION');
  const [exitMonthDaysWorked, setExitMonthDaysWorked] = useState<number>(18);
  const [earnedLeavesBalance, setEarnedLeavesBalance] = useState<number>(14);
  const [noticeShortfallDays, setNoticeShortfallDays] = useState<number>(0);
  const [salaryAdvanceRecovery, setSalaryAdvanceRecovery] = useState<number>(0);
  const [unreturnedAssetDeduction, setUnreturnedAssetDeduction] = useState<number>(0);
  const [reimbursementsPending, setReimbursementsPending] = useState<number>(3500);
  const [remarks, setRemarks] = useState<string>('NOC cleared across IT, Finance, and HR departments.');

  const activeEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Derive Joining & Tenure
  const joiningDateStr = activeEmp?.dateOfJoining || '2021-06-01';
  const joiningDateObj = new Date(joiningDateStr);
  const exitDateObj = new Date(lastWorkingDay);
  const tenureYears = Math.max(
    0.5,
    Number(((exitDateObj.getTime() - joiningDateObj.getTime()) / (365.25 * 86400000)).toFixed(1))
  );

  // Salary Components for Calculation
  const monthlyBasic = activeEmp?.payStructure?.basicSalary || (activeEmp?.basicSalary ?? 35000);
  const monthlyGross = activeEmp?.payStructure?.grossSalaryMonthly || monthlyBasic * 2.1;

  // 1. Exit Month Salary (Pro-rated for 30 calendar days)
  const exitMonthGrossSalary = Math.round((monthlyGross / 30) * exitMonthDaysWorked);

  // 2. Leave Encashment (Basic / 26 * Earned Leaves)
  const leaveRatePerDay = Math.round(monthlyBasic / 26);
  const leaveEncashmentAmount = Math.round(leaveRatePerDay * earnedLeavesBalance);

  // 3. Gratuity (Payment of Gratuity Act 1972: 15 * Basic / 26 * Years if tenure >= 5)
  const isGratuityEligible = tenureYears >= 5.0;
  const gratuityAmount = isGratuityEligible
    ? Math.round(((15 * monthlyBasic) / 26) * tenureYears)
    : 0;

  // 4. Notice Period Shortfall Recovery (Gross / 30 * Shortfall Days)
  const noticeRecoveryAmount = Math.round((monthlyGross / 30) * noticeShortfallDays);

  // 5. Total Calculations
  const totalGrossPayable = exitMonthGrossSalary + leaveEncashmentAmount + gratuityAmount + reimbursementsPending;
  const totalDeductionsAndRecoveries = noticeRecoveryAmount + salaryAdvanceRecovery + unreturnedAssetDeduction;
  const netSettlementAmount = totalGrossPayable - totalDeductionsAndRecoveries;

  const filteredSettlements = settlements.filter((s) => {
    const matchesSearch =
      s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.empCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.settlementStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalFnFCount = settlements.length;
  const settledCount = settlements.filter((s) => s.settlementStatus === 'SETTLED').length;
  const totalDisbursed = settlements
    .filter((s) => s.settlementStatus === 'SETTLED')
    .reduce((sum, s) => sum + s.netSettlementAmount, 0);

  const handleCreateSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmp) return;

    const record: FnFSettlementRecord = {
      id: `FNF-${Date.now().toString().slice(-4)}`,
      employeeId: activeEmp.id,
      employeeName: activeEmp.name,
      empCode: activeEmp.empCode,
      department: activeEmp.department,
      designation: activeEmp.designation,
      dateOfJoining: joiningDateStr,
      dateOfResignation,
      lastWorkingDay,
      tenureYears,
      exitReason,
      exitMonthDaysWorked,
      exitMonthGrossSalary,
      earnedLeavesBalance,
      leaveEncashmentRatePerDay: leaveRatePerDay,
      leaveEncashmentAmount,
      isGratuityEligible,
      gratuityAmount,
      statutoryBonusPayable: 0,
      reimbursementsPending,
      noticePeriodShortfallDays: noticeShortfallDays,
      noticeRecoveryAmount,
      salaryAdvanceRecovery,
      unreturnedAssetDeduction,
      tdsDeduction: 0,
      totalGrossPayable,
      totalDeductionsAndRecoveries,
      netSettlementAmount,
      settlementStatus: 'DRAFT',
      settlementDate: new Date().toISOString().split('T')[0],
      settledBy: 'Finance & HR Payroll Admin',
      remarks,
    };

    onCreateSettlement(record);
    setIsProcessModalOpen(false);
    setSelectedRecordForDoc({ record, docType: 'STATEMENT' });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LogOut className="w-5 h-5 text-rose-600" />
            Full & Final (F&F) Exit Settlement Engine
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Automate Gratuity (Act 1972), Leave Encashment, Notice shortfall recoveries, General Ledger JV postings, and generate Relieving & Experience Letters.
          </p>
        </div>
        <button
          onClick={() => {
            if (employees.length > 0) setSelectedEmpId(employees[0].id);
            setIsProcessModalOpen(true);
          }}
          className={`flex items-center ${UI.btn.primary}`}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Process New F&F Exit Settlement
        </button>
      </div>

      {/* Standard Executive KPI Scorecards */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Total Exit Cases"
          value={totalFnFCount}
          icon={LogOut}
          badge="Separations"
          badgeVariant="danger"
          footer={{
            left: <span>Total Cases: <strong>{totalFnFCount}</strong></span>,
            right: <span>Logged</span>
          }}
        />

        <KPIScorecard
          label="Settled & Cleared"
          value={settledCount}
          variant="emerald"
          icon={CheckCircle2}
          trend={{ value: `${totalFnFCount > 0 ? Math.round((settledCount / totalFnFCount) * 100) : 0}%`, direction: 'up', label: 'Rate' }}
          footer={{
            left: <span>Settled: <strong>{settledCount}</strong></span>,
            right: <span>100% NOC Signed</span>
          }}
        />

        <KPIScorecard
          label="Total F&F Disbursed"
          value={`₹${(totalDisbursed / 100000).toFixed(1)}L`}
          icon={DollarSign}
          progress={{
            percentage: Math.min(100, Math.round((totalDisbursed / 500000) * 100)),
            targetLabel: 'Gratuity & Leave Pool',
            targetValue: `₹${(totalDisbursed / 100000).toFixed(1)}L / ₹5L`
          }}
        />

        <KPIScorecard
          label="Avg Settlement Turnaround"
          value="3.8 Days"
          variant="indigo"
          icon={FileCheck}
          badge="Target: 7 Days"
          badgeVariant="indigo"
          footer={{
            left: <span>Turnaround: <strong>Fast (3.8d)</strong></span>,
            right: <span>Benchmark: <strong>7d</strong></span>
          }}
        />
      </KPIGrid>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee, ID, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'DRAFT', 'SETTLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Settlements Table */}
      <div className={UI.card.base}>
        <div className="overflow-x-auto">
          <table className={UI.table.table}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={UI.table.th}>Employee & Code</th>
                <th className={UI.table.th}>Separation Reason</th>
                <th className={UI.table.th}>Last Working Day</th>
                <th className={`${UI.table.th} text-right`}>Gratuity (1972 Act)</th>
                <th className={`${UI.table.th} text-right`}>Leave Encashment</th>
                <th className={`${UI.table.th} text-right`}>Net F&F Payable</th>
                <th className={`${UI.table.th} text-center`}>Status</th>
                <th className={`${UI.table.th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No exit settlement records found.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((item) => (
                  <tr key={item.id} className={UI.table.tr}>
                    <td className={UI.table.td}>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {item.employeeName}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {item.empCode} • {item.department}
                        </span>
                      </div>
                    </td>
                    <td className={UI.table.td}>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {item.exitReason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`${UI.table.td} font-mono text-xs text-gray-600 dark:text-gray-400`}>
                      {item.lastWorkingDay}
                    </td>
                    <td className={`${UI.table.td} text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold`}>
                      ₹{(item.gratuityAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className={`${UI.table.td} text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold`}>
                      ₹{(item.leaveEncashmentAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className={`${UI.table.td} text-right`}>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{(item.netSettlementAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className={`${UI.table.td} text-center`}>
                      {item.settlementStatus === 'SETTLED' ? (
                        <span className={UI.badge('success')}>Settled</span>
                      ) : (
                        <span className={UI.badge('warning')}>Draft Review</span>
                      )}
                    </td>
                    <td className={`${UI.table.td} text-center`}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedRecordForDoc({ record: item, docType: 'STATEMENT' })}
                          className="px-2 py-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800"
                          title="F&F Settlement Voucher"
                        >
                          F&F Sheet
                        </button>
                        <button
                          onClick={() => setSelectedRecordForDoc({ record: item, docType: 'RELIEVING' })}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800"
                          title="Relieving Letter"
                        >
                          Relieving
                        </button>
                        <button
                          onClick={() => setSelectedRecordForDoc({ record: item, docType: 'EXPERIENCE' })}
                          className="px-2 py-1 text-[11px] font-semibold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-100 rounded border border-purple-200 dark:border-purple-800"
                          title="Experience Certificate"
                        >
                          Experience
                        </button>

                        {item.settlementStatus === 'DRAFT' && (
                          <button
                            onClick={() => onUpdateSettlementStatus(item.id, 'SETTLED')}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm"
                            title="Mark as Settled"
                          >
                            Mark Settled
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

      {/* MODAL 1: Process New F&F Settlement Wizard */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-rose-600" />
                  Full & Final (F&F) Exit Calculation Engine
                </h3>
                <p className="text-xs text-gray-500">Statutory Gratuity, Leave Encashment, Notice Recovery & Accounting Entry</p>
              </div>
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSettlement} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Select Resigning Employee *
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.empCode}) • {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Reason for Separation
                  </label>
                  <select
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="RESIGNATION">Voluntary Resignation</option>
                    <option value="TERMINATION">Company Involuntary Separation</option>
                    <option value="RETIREMENT">Superannuation / Retirement</option>
                    <option value="MUTUAL_SEPARATION">Mutual Separation Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Date of Resignation
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfResignation}
                    onChange={(e) => setDateOfResignation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Last Working Day (LWD)
                  </label>
                  <input
                    type="date"
                    required
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Exit Month Days Worked (out of 30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={exitMonthDaysWorked}
                    onChange={(e) => setExitMonthDaysWorked(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Earned / Privilege Leaves Balance (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={earnedLeavesBalance}
                    onChange={(e) => setEarnedLeavesBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Notice Shortfall (Days to Recover)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={noticeShortfallDays}
                    onChange={(e) => setNoticeShortfallDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Salary Advance / Loan Recovery (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salaryAdvanceRecovery}
                    onChange={(e) => setSalaryAdvanceRecovery(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Real-time F&F Summary Scorecard */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Separation Settlement Summary (Tenure: {tenureYears} Years)
                  </span>
                  {isGratuityEligible ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                      Gratuity Eligible (Tenure $\ge$ 5 Years)
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-gray-400">
                      Gratuity Ineligible (Tenure &lt; 5 Years)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Exit Month Pay ({exitMonthDaysWorked}d)</span>
                    <span className="font-mono font-semibold text-emerald-600">₹{exitMonthGrossSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Leave Encashment ({earnedLeavesBalance}d)</span>
                    <span className="font-mono font-semibold text-emerald-600">₹{leaveEncashmentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Statutory Gratuity</span>
                    <span className="font-mono font-semibold text-emerald-600">₹{gratuityAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Notice & Loan Recoveries</span>
                    <span className="font-mono font-semibold text-rose-600">₹{totalDeductionsAndRecoveries.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-emerald-100 dark:bg-emerald-950/40 p-3 rounded-lg flex items-center justify-between border border-emerald-300 dark:border-emerald-800">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                      Net Payable to Employee
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Total Earnings ₹{totalGrossPayable.toLocaleString('en-IN')} - Recoveries ₹{totalDeductionsAndRecoveries.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-xl font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                    ₹{netSettlementAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Accounting Journal Entry Preview */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-900 space-y-1.5">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Auto-Generated General Ledger Journal Voucher
                </span>
                <div className="text-[11px] font-mono text-gray-700 dark:text-gray-300 space-y-0.5">
                  <p>Dr. Salary & Final Settlement Expense: ₹{(exitMonthGrossSalary + leaveEncashmentAmount).toLocaleString('en-IN')}</p>
                  {gratuityAmount > 0 && <p>Dr. Gratuity Expense Account: ₹{gratuityAmount.toLocaleString('en-IN')}</p>}
                  {totalDeductionsAndRecoveries > 0 && (
                    <p>Cr. Employee Loan & Advance Recovery: ₹{totalDeductionsAndRecoveries.toLocaleString('en-IN')}</p>
                  )}
                  <p className="font-bold text-blue-700 dark:text-blue-400">
                    Cr. HDFC Bank (Settlement Payout): ₹{netSettlementAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProcessModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
                >
                  Generate F&F Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Exit Document (F&F Statement / Relieving / Experience) */}
      {selectedRecordForDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-4xl w-full p-8 max-h-[92vh] overflow-y-auto space-y-6 print:m-0 print:p-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecordForDoc({ ...selectedRecordForDoc, docType: 'STATEMENT' })}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    selectedRecordForDoc.docType === 'STATEMENT'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  F&F Statement
                </button>
                <button
                  onClick={() => setSelectedRecordForDoc({ ...selectedRecordForDoc, docType: 'RELIEVING' })}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    selectedRecordForDoc.docType === 'RELIEVING'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Relieving Letter
                </button>
                <button
                  onClick={() => setSelectedRecordForDoc({ ...selectedRecordForDoc, docType: 'EXPERIENCE' })}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    selectedRecordForDoc.docType === 'EXPERIENCE'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Experience Certificate
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedRecordForDoc(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document 1: F&F Settlement Statement */}
            {selectedRecordForDoc.docType === 'STATEMENT' && (
              <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans text-xs leading-relaxed">
                <div className="border-b-2 border-rose-600 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      FINSTAQ TECHNOLOGIES PRIVATE LIMITED
                    </h1>
                    <p className="text-[11px] text-gray-500">
                      Full & Final Settlement Statement • Ref: {selectedRecordForDoc.record.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-gray-500">Date: {selectedRecordForDoc.record.settlementDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Employee Name</span>
                    <span className="font-bold text-xs">{selectedRecordForDoc.record.employeeName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Employee ID</span>
                    <span className="font-mono font-bold text-xs">{selectedRecordForDoc.record.empCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Department & Role</span>
                    <span className="font-bold text-xs">{selectedRecordForDoc.record.designation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Tenure / Service</span>
                    <span className="font-bold text-xs">{selectedRecordForDoc.record.tenureYears} Years</span>
                  </div>
                </div>

                {/* Earnings vs Deductions Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Earnings Column */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-emerald-50 dark:bg-emerald-950 p-2 font-bold text-emerald-800 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-700">
                      A. Final Payable Entitlements
                    </div>
                    <table className="w-full text-xs font-mono">
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        <tr>
                          <td className="p-2">Exit Month Salary ({selectedRecordForDoc.record.exitMonthDaysWorked} days)</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.exitMonthGrossSalary.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Leave Encashment ({selectedRecordForDoc.record.earnedLeavesBalance} days)</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.leaveEncashmentAmount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Statutory Gratuity</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.gratuityAmount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Expense Reimbursements</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.reimbursementsPending.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="bg-emerald-100 dark:bg-emerald-900/30 font-bold text-emerald-900 dark:text-emerald-200">
                          <td className="p-2">Total Gross Earnings (A)</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.totalGrossPayable.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Deductions Column */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-rose-50 dark:bg-rose-950 p-2 font-bold text-rose-800 dark:text-rose-300 border-b border-gray-200 dark:border-gray-700">
                      B. Deductions & Recoveries
                    </div>
                    <table className="w-full text-xs font-mono">
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        <tr>
                          <td className="p-2">Notice Shortfall Recovery ({selectedRecordForDoc.record.noticePeriodShortfallDays} days)</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.noticeRecoveryAmount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Salary Advance / Loan Balance</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.salaryAdvanceRecovery.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Unreturned IT Assets / Loss</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.unreturnedAssetDeduction.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="p-2">Final TDS Deduction</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.tdsDeduction.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="bg-rose-100 dark:bg-rose-900/30 font-bold text-rose-900 dark:text-rose-200">
                          <td className="p-2">Total Deductions (B)</td>
                          <td className="p-2 text-right">₹{selectedRecordForDoc.record.totalDeductionsAndRecoveries.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Net Total Box */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300 block">
                      NET SETTLEMENT AMOUNT PAYABLE (A - B)
                    </span>
                    <span className="text-xs text-gray-500">To be credited via direct bank transfer / NEFT</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    ₹{selectedRecordForDoc.record.netSettlementAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Signatures */}
                <div className="pt-8 flex justify-between items-end border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-bold">Prepared & Verified By</p>
                    <div className="h-10 flex items-center">
                      <span className="font-mono italic text-blue-600 font-bold">HR & Payroll Dept</span>
                    </div>
                    <p className="text-gray-500">Finstaq Technologies Pvt Ltd</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Employee Acceptance & Full Settlement Release</p>
                    <div className="h-10 flex items-center justify-end">
                      <span className="text-gray-400 italic">Signature & Date</span>
                    </div>
                    <p className="text-gray-500">{selectedRecordForDoc.record.employeeName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document 2: Relieving Letter */}
            {selectedRecordForDoc.docType === 'RELIEVING' && (
              <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans text-xs leading-relaxed">
                <div className="border-b-2 border-emerald-600 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      FINSTAQ TECHNOLOGIES PRIVATE LIMITED
                    </h1>
                    <p className="text-[11px] text-gray-500">
                      Level 8, Tower B, Bandra Kurla Complex, Mumbai, Maharashtra - 400051
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Relieving Letter</span>
                    <p className="font-mono text-xs font-semibold">{selectedRecordForDoc.record.settlementDate}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-sm">To Whomsoever It May Concern</p>
                </div>

                <div className="space-y-3 text-justify">
                  <p>
                    This has reference to the resignation letter submitted by{' '}
                    <strong>{selectedRecordForDoc.record.employeeName}</strong> (Employee Code:{' '}
                    <strong>{selectedRecordForDoc.record.empCode}</strong>).
                  </p>
                  <p>
                    We hereby confirm that <strong>{selectedRecordForDoc.record.employeeName}</strong> was employed with{' '}
                    <strong>Finstaq Technologies Private Limited</strong> from{' '}
                    <strong>{selectedRecordForDoc.record.dateOfJoining}</strong> to{' '}
                    <strong>{selectedRecordForDoc.record.lastWorkingDay}</strong> as{' '}
                    <strong>{selectedRecordForDoc.record.designation}</strong> in the{' '}
                    <strong>{selectedRecordForDoc.record.department}</strong> department.
                  </p>
                  <p>
                    We confirm that the employee has been relieved from their duties at the close of working hours on{' '}
                    <strong>{selectedRecordForDoc.record.lastWorkingDay}</strong> after successfully completing the handover
                    and obtaining clearance certificates from all operational departments.
                  </p>
                  <p>
                    We wish {selectedRecordForDoc.record.employeeName} all the best and continued success in their future endeavors.
                  </p>
                </div>

                <div className="pt-12 flex justify-between items-end border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-bold">For Finstaq Technologies Pvt Ltd</p>
                    <div className="h-12 flex items-center">
                      <span className="font-mono italic text-emerald-600 font-bold text-sm">Authorized HR Signatory</span>
                    </div>
                    <p className="text-gray-500">VP - Human Resources</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document 3: Experience Certificate */}
            {selectedRecordForDoc.docType === 'EXPERIENCE' && (
              <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans text-xs leading-relaxed">
                <div className="border-b-2 border-purple-600 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      FINSTAQ TECHNOLOGIES PRIVATE LIMITED
                    </h1>
                    <p className="text-[11px] text-gray-500">
                      Level 8, Tower B, Bandra Kurla Complex, Mumbai, Maharashtra - 400051
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Experience Certificate</span>
                    <p className="font-mono text-xs font-semibold">{selectedRecordForDoc.record.settlementDate}</p>
                  </div>
                </div>

                <div className="text-center py-2">
                  <h2 className="text-base font-extrabold tracking-wider uppercase text-purple-900 dark:text-purple-400">
                    EXPERIENCE & SERVICE TESTIMONIAL
                  </h2>
                </div>

                <div className="space-y-4 text-justify">
                  <p>
                    This is to certify that <strong>{selectedRecordForDoc.record.employeeName}</strong> was an integral member of{' '}
                    <strong>Finstaq Technologies Private Limited</strong> from{' '}
                    <strong>{selectedRecordForDoc.record.dateOfJoining}</strong> to{' '}
                    <strong>{selectedRecordForDoc.record.lastWorkingDay}</strong>.
                  </p>
                  <p>
                    During their tenure of <strong>{selectedRecordForDoc.record.tenureYears} Years</strong>, they held the position
                    of <strong>{selectedRecordForDoc.record.designation}</strong> in our{' '}
                    <strong>{selectedRecordForDoc.record.department}</strong> division.
                  </p>
                  <p>
                    During their employment with us, we found them to be sincere, diligent, professional, and dedicated to their
                    responsibilities. Their conduct and character were exemplary throughout their association with the company.
                  </p>
                  <p>
                    We thank {selectedRecordForDoc.record.employeeName} for their valuable contributions and wish them immense success
                    in all their future career pursuits.
                  </p>
                </div>

                <div className="pt-12 flex justify-between items-end border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="font-bold">For Finstaq Technologies Pvt Ltd</p>
                    <div className="h-12 flex items-center">
                      <span className="font-mono italic text-purple-600 font-bold text-sm">Authorized Signatory</span>
                    </div>
                    <p className="text-gray-500">Head of People & Operations</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
