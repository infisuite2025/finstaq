import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  X,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Building2,
  Users,
} from 'lucide-react';
import { Employee, StaffLoanRecord } from './payrollTypes';
import { UI } from '../../theme/uiTheme';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface StaffLoansHubProps {
  employees: Employee[];
  loans: StaffLoanRecord[];
  onAddLoan: (loan: StaffLoanRecord) => void;
  onRecordRepayment: (loanId: string, amount: number) => void;
}

export function StaffLoansHub({
  employees,
  loans,
  onAddLoan,
  onRecordRepayment,
}: StaffLoansHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);

  // Form State for New Loan
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [loanType, setLoanType] = useState<StaffLoanRecord['loanType']>('SALARY_ADVANCE');
  const [principalAmount, setPrincipalAmount] = useState<number>(50000);
  const [tenureMonths, setTenureMonths] = useState<number>(5);
  const [reason, setReason] = useState<string>('Festival / Medical Advance');

  const monthlyEmi = Math.round(principalAmount / Math.max(1, tenureMonths));
  const activeEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const filteredLoans = loans.filter((ln) => {
    const matchesSearch =
      ln.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ln.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ln.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalDisbursedSum = loans.reduce((sum, ln) => sum + ln.principalAmount, 0);
  const outstandingSum = loans.reduce((sum, ln) => sum + ln.outstandingBalance, 0);
  const monthlyEmiRecovery = loans
    .filter((ln) => ln.status === 'ACTIVE')
    .reduce((sum, ln) => sum + ln.monthlyEmi, 0);
  const activeAccounts = loans.filter((ln) => ln.status === 'ACTIVE').length;

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmp) return;

    const newLoan: StaffLoanRecord = {
      id: `LN-${Date.now().toString().slice(-4)}`,
      employeeId: activeEmp.id,
      employeeName: activeEmp.name,
      department: activeEmp.department,
      loanType,
      principalAmount,
      interestRateAnnual: 0, // 0% for SME staff advances
      tenureMonths,
      monthlyEmi,
      disbursedDate: new Date().toISOString().split('T')[0],
      emiStartMonth: 'May 2026',
      totalRepaid: 0,
      outstandingBalance: principalAmount,
      status: 'ACTIVE',
      reason,
    };

    onAddLoan(newLoan);
    setIsDisburseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Staff Loans & Salary Advance Manager
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Disburse employee advances, track outstanding balances, and auto-deduct monthly EMIs during payroll runs.
          </p>
        </div>
        <button
          onClick={() => {
            if (employees.length > 0) setSelectedEmpId(employees[0].id);
            setIsDisburseModalOpen(true);
          }}
          className={UI.btn.primary}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Disburse Loan / Advance
        </button>
      </div>

      {/* Standard Executive KPI Scorecards */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Total Loans Disbursed"
          value={`₹${(totalDisbursedSum / 1000).toFixed(0)}k`}
          icon={DollarSign}
          badge="Staff Advances"
          badgeVariant="info"
          footer={{
            left: <span>Disbursed: <strong>₹{(totalDisbursedSum / 1000).toFixed(0)}k</strong></span>,
            right: <span>Active lending</span>
          }}
        />

        <KPIScorecard
          label="Outstanding Balance"
          value={`₹${(outstandingSum / 1000).toFixed(0)}k`}
          variant="amber"
          icon={TrendingDown}
          progress={{
            percentage: totalDisbursedSum > 0 ? Math.round(((totalDisbursedSum - outstandingSum) / totalDisbursedSum) * 100) : 0,
            targetLabel: 'Recovery Progress',
            targetValue: `${totalDisbursedSum > 0 ? Math.round(((totalDisbursedSum - outstandingSum) / totalDisbursedSum) * 100) : 0}% Repaid`
          }}
        />

        <KPIScorecard
          label="Monthly Payroll EMI Deduction"
          value={`₹${monthlyEmiRecovery.toLocaleString('en-IN')}`}
          variant="emerald"
          icon={Calendar}
          trend={{ value: 'Auto-Deduct', direction: 'up', label: 'Monthly' }}
          footer={{
            left: <span>Direct Payroll Recovery</span>,
            right: <span>Active Cycles</span>
          }}
        />

        <KPIScorecard
          label="Active Accounts"
          value={activeAccounts}
          variant="indigo"
          icon={CreditCard}
          badge="Active Borrowers"
          badgeVariant="indigo"
          footer={{
            left: <span>Borrowers: <strong>{activeAccounts}</strong></span>,
            right: <span>Closed: <strong>{loans.filter(l => l.status === 'CLOSED').length}</strong></span>
          }}
        />
      </KPIGrid>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'ACTIVE', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table */}
      <div className={UI.card.base}>
        <div className="overflow-x-auto">
          <table className={UI.table.table}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={UI.table.th}>Employee & ID</th>
                <th className={UI.table.th}>Loan Category</th>
                <th className={`${UI.table.th} text-right`}>Principal</th>
                <th className={`${UI.table.th} text-right`}>Monthly EMI</th>
                <th className={`${UI.table.th} text-right`}>Outstanding</th>
                <th className={UI.table.th}>Repayment Progress</th>
                <th className={`${UI.table.th} text-center`}>Status</th>
                <th className={`${UI.table.th} text-center`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No loan or advance records found.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((ln) => {
                  const repaidPct = Math.round((ln.totalRepaid / ln.principalAmount) * 100);
                  return (
                    <tr key={ln.id} className={UI.table.tr}>
                      <td className={UI.table.td}>
                        <span className="font-bold text-gray-900 dark:text-white block">{ln.employeeName}</span>
                        <span className="text-[11px] text-gray-500 block">{ln.department}</span>
                      </td>
                      <td className={UI.table.td}>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {ln.loanType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`${UI.table.td} text-right`}>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          ₹{(ln.principalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className={`${UI.table.td} text-right`}>
                        <span className="font-mono text-emerald-600 font-semibold">
                          ₹{(ln.monthlyEmi || 0).toLocaleString('en-IN')} / mo
                        </span>
                      </td>
                      <td className={`${UI.table.td} text-right`}>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          ₹{(ln.outstandingBalance || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className={UI.table.td}>
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                            <span>₹{ln.totalRepaid.toLocaleString('en-IN')}</span>
                            <span>{repaidPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${repaidPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={`${UI.table.td} text-center`}>
                        {ln.status === 'ACTIVE' ? (
                          <span className={UI.badge('warning')}>Active ({ln.tenureMonths} mos)</span>
                        ) : (
                          <span className={UI.badge('success')}>Closed</span>
                        )}
                      </td>
                      <td className={`${UI.table.td} text-center`}>
                        {ln.status === 'ACTIVE' && (
                          <button
                            onClick={() => onRecordRepayment(ln.id, ln.monthlyEmi)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800"
                            title="Record 1-Month EMI Repayment"
                          >
                            Deduct EMI
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Disburse Loan / Advance Modal */}
      {isDisburseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Disburse Staff Loan / Advance
                </h3>
                <p className="text-xs text-gray-500">Setup monthly EMI deduction schedule for payroll</p>
              </div>
              <button
                onClick={() => setIsDisburseModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Select Employee *
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
                  Loan / Advance Category
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="SALARY_ADVANCE">Salary Advance (Interest-Free)</option>
                  <option value="PERSONAL_LOAN">Staff Personal Loan</option>
                  <option value="EMERGENCY_MEDICAL">Emergency Medical Assistance</option>
                  <option value="EQUIPMENT_PURCHASE">Work Equipment Purchase</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Principal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Repayment Tenure (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Purpose / Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* EMI Calculation Card */}
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                    Calculated Monthly EMI Recovery
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ₹{principalAmount.toLocaleString('en-IN')} divided equally over {tenureMonths} months
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
                  ₹{monthlyEmi.toLocaleString('en-IN')} / mo
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisburseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
