import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  FileText,
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
} from 'lucide-react';
import { Employee, SalaryRevisionRecord } from './payrollTypes';
import { calculateIndianCtcBreakdown } from './ctcCalculator';
import { UI } from '../../theme/uiTheme';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface SalaryRevisionHubProps {
  employees: Employee[];
  revisions: SalaryRevisionRecord[];
  onApplyRevision: (revision: SalaryRevisionRecord) => void;
}

export function SalaryRevisionHub({
  employees,
  revisions,
  onApplyRevision,
}: SalaryRevisionHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedLetterForPreview, setSelectedLetterForPreview] = useState<SalaryRevisionRecord | null>(null);

  // Form State for Salary Revision
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [revisionType, setRevisionType] = useState<SalaryRevisionRecord['revisionType']>('ANNUAL_APPRAISAL');
  const [hikePercentage, setHikePercentage] = useState<number>(15);
  const [customNewCtc, setCustomNewCtc] = useState<number>(0);
  const [isCustomCtcMode, setIsCustomCtcMode] = useState<boolean>(false);
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-04-01');
  const [newDesignation, setNewDesignation] = useState<string>('');
  const [appraisalComments, setAppraisalComments] = useState<string>('Exceptional contribution towards enterprise scalability & client deliverables.');

  const activeEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const currentAnnualCtc = (activeEmp?.monthlyCtc || activeEmp?.basicSalary ? (activeEmp.monthlyCtc || activeEmp.basicSalary! * 2.5) * 12 : 900000);

  const calculatedNewCtc = isCustomCtcMode && customNewCtc > 0
    ? customNewCtc
    : Math.round(currentAnnualCtc * (1 + hikePercentage / 100));

  const actualHikePct = currentAnnualCtc > 0
    ? Number((((calculatedNewCtc - currentAnnualCtc) / currentAnnualCtc) * 100).toFixed(1))
    : 0;

  const currentPayStructure = activeEmp?.payStructure || calculateIndianCtcBreakdown(currentAnnualCtc);
  const revisedPayStructure = calculateIndianCtcBreakdown(calculatedNewCtc);

  // Retroactive arrears calculation (if effective date is in the past)
  const effDateObj = new Date(effectiveDate);
  const now = new Date();
  const monthsDiff = Math.max(0, (now.getFullYear() - effDateObj.getFullYear()) * 12 + (now.getMonth() - effDateObj.getMonth()));
  const monthlyGrossDiff = revisedPayStructure.grossSalaryMonthly - currentPayStructure.grossSalaryMonthly;
  const estimatedArrears = monthsDiff * Math.max(0, monthlyGrossDiff);

  const filteredRevisions = revisions.filter((rev) => {
    const matchesSearch =
      rev.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.newDesignation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || rev.revisionType === typeFilter;
    return matchesSearch && matchesType;
  });

  // KPI Metrics
  const totalRevisionsCount = revisions.length;
  const avgHike = revisions.length > 0
    ? (revisions.reduce((sum, r) => sum + r.hikePercentage, 0) / revisions.length).toFixed(1)
    : '14.5';
  const totalAnnualImpact = revisions.reduce((sum, r) => sum + (r.revisedAnnualCtc - r.previousAnnualCtc), 0);

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmp) return;

    const revisionObj: SalaryRevisionRecord = {
      id: `REV-${Date.now().toString().slice(-4)}`,
      employeeId: activeEmp.id,
      employeeName: activeEmp.name,
      empCode: activeEmp.empCode,
      department: activeEmp.department,
      previousDesignation: activeEmp.designation,
      newDesignation: newDesignation.trim() ? newDesignation.trim() : activeEmp.designation,
      previousAnnualCtc: currentAnnualCtc,
      revisedAnnualCtc: calculatedNewCtc,
      hikePercentage: actualHikePct,
      effectiveDate,
      revisionDate: new Date().toISOString().split('T')[0],
      revisionType,
      appraisalComments,
      revisedPayStructure,
      retroactiveArrearsEstimate: estimatedArrears,
      status: 'APPLIED',
    };

    onApplyRevision(revisionObj);
    setIsRevisionModalOpen(false);
    setSelectedLetterForPreview(revisionObj);
  };

  return (
    <div className="space-y-6">
      {/* Header & Initiate Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Salary Revision & Appraisal Cycles
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Execute performance hikes, promotions, retroactive arrears adjustments, and generate branded appraisal letters.
          </p>
        </div>
        <button
          onClick={() => {
            if (employees.length > 0) {
              setSelectedEmpId(employees[0].id);
              setNewDesignation(employees[0].designation);
            }
            setIsRevisionModalOpen(true);
          }}
          className={`flex items-center ${UI.btn.primary}`}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Initiate Salary Revision / Appraisal
        </button>
      </div>

      {/* Standard Executive KPI Scorecards */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Revisions Applied"
          value={totalRevisionsCount}
          icon={Award}
          badge="FY 2026-27"
          badgeVariant="info"
          footer={{
            left: <span>Applied: <strong>{totalRevisionsCount}</strong></span>,
            right: <span>Appraisal Cycle</span>
          }}
        />

        <KPIScorecard
          label="Average Increment %"
          value={`+${avgHike}%`}
          variant="emerald"
          icon={TrendingUp}
          trend={{ value: `+${avgHike}%`, direction: 'up', label: 'YoY' }}
          footer={{
            left: <span>Across all depts</span>,
            right: <span>Benchmark: 12%</span>
          }}
        />

        <KPIScorecard
          label="Annual Wage Bill Delta"
          value={`₹${(totalAnnualImpact / 100000).toFixed(1)}L`}
          icon={DollarSign}
          progress={{
            percentage: Math.min(100, Math.round((totalAnnualImpact / 2500000) * 100)),
            targetLabel: 'Budget Pool',
            targetValue: `₹${(totalAnnualImpact / 100000).toFixed(1)}L / ₹25L`
          }}
        />

        <KPIScorecard
          label="Active Appraisal Window"
          value="Q1 FY 26-27"
          variant="featured"
          icon={Calendar}
          badge="Effective Apr 2026"
          badgeVariant="glass"
          footer={{
            left: <span>Cycle: <strong>Annual Review</strong></span>,
            right: <span>Status: <strong>Open</strong></span>
          }}
        />
      </KPIGrid>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee, dept, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'ANNUAL_APPRAISAL', 'PROMOTION', 'MARKET_CORRECTION', 'PROBATION_CONFIRMATION'].map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === tp
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tp.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Revisions History Table */}
      <div className={UI.card.base}>
        <div className="overflow-x-auto">
          <table className={UI.table.table}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={UI.table.th}>Employee & ID</th>
                <th className={UI.table.th}>Revision Type</th>
                <th className={`${UI.table.th} text-right`}>Previous CTC</th>
                <th className={`${UI.table.th} text-right`}>Revised CTC</th>
                <th className={`${UI.table.th} text-center`}>Hike %</th>
                <th className={UI.table.th}>Effective Date</th>
                <th className={`${UI.table.th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRevisions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No salary revision records found.
                  </td>
                </tr>
              ) : (
                filteredRevisions.map((rev) => (
                  <tr key={rev.id} className={UI.table.tr}>
                    <td className={UI.table.td}>
                      <span className="font-bold text-gray-900 dark:text-white block">{rev.employeeName}</span>
                      <span className="text-[11px] text-gray-500 block">
                        {rev.empCode} • {rev.newDesignation}
                      </span>
                    </td>
                    <td className={UI.table.td}>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {rev.revisionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`${UI.table.td} text-right`}>
                      <span className="font-mono text-gray-500">
                        ₹{(rev.previousAnnualCtc || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className={`${UI.table.td} text-right`}>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(rev.revisedAnnualCtc || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className={`${UI.table.td} text-center`}>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-xs">
                        +{rev.hikePercentage}%
                      </span>
                    </td>
                    <td className={UI.table.td}>
                      <span className="font-mono text-xs text-gray-900 dark:text-white block">
                        {rev.effectiveDate}
                      </span>
                      {rev.retroactiveArrearsEstimate && rev.retroactiveArrearsEstimate > 0 ? (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Incl ₹{rev.retroactiveArrearsEstimate.toLocaleString('en-IN')} Arrears
                        </span>
                      ) : null}
                    </td>
                    <td className={`${UI.table.td} text-center`}>
                      <button
                        onClick={() => setSelectedLetterForPreview(rev)}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Appraisal Letter
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Initiate Salary Revision Form */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Initiate Salary Revision / Increment
                </h3>
                <p className="text-xs text-gray-500">Calculate compensation hike and generate formal appraisal letter</p>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRevision} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Select Employee *
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => {
                      setSelectedEmpId(e.target.value);
                      const emp = employees.find((empItem) => empItem.id === e.target.value);
                      if (emp) setNewDesignation(emp.designation);
                    }}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-semibold"
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
                    Revision Reason / Type
                  </label>
                  <select
                    value={revisionType}
                    onChange={(e) => setRevisionType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="ANNUAL_APPRAISAL">Annual Performance Appraisal</option>
                    <option value="PROMOTION">Promotion & Title Upgrade</option>
                    <option value="MARKET_CORRECTION">Market Benchmark Correction</option>
                    <option value="PROBATION_CONFIRMATION">Probation Confirmation Revision</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Current Annual CTC
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`₹${currentAnnualCtc.toLocaleString('en-IN')}`}
                    className="w-full px-3 py-2 text-xs bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-gray-500 font-bold"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Increment Target
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCtcMode(!isCustomCtcMode)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      {isCustomCtcMode ? 'Switch to Hike %' : 'Enter Custom CTC'}
                    </button>
                  </div>

                  {isCustomCtcMode ? (
                    <input
                      type="number"
                      step="25000"
                      value={customNewCtc || calculatedNewCtc}
                      onChange={(e) => setCustomNewCtc(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 rounded-lg text-emerald-700 dark:text-emerald-300"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={hikePercentage}
                        onChange={(e) => setHikePercentage(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 rounded-lg text-emerald-700 dark:text-emerald-300"
                      />
                      <span className="text-sm font-bold text-gray-500">%</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Effective Date (Supports Retroactive Arrears)
                  </label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    New Designation (if promoted)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave unchanged or enter new title"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Appraisal Notes / Performance Comments (Included in Letter)
                </label>
                <textarea
                  rows={2}
                  value={appraisalComments}
                  onChange={(e) => setAppraisalComments(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              {/* Real-time Before vs After Comparison Card */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Real-time Compensation Comparison (Hike: +{actualHikePct}%)
                  </span>
                  {estimatedArrears > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded border border-amber-300">
                      Retroactive Arrears: ₹{estimatedArrears.toLocaleString('en-IN')} ({monthsDiff} mos)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Annual CTC</span>
                    <div className="flex items-center gap-1 font-mono mt-0.5">
                      <span className="text-gray-400 line-through">₹{(currentAnnualCtc / 100000).toFixed(2)}L</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-emerald-600">₹{(calculatedNewCtc / 100000).toFixed(2)}L</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Monthly Gross</span>
                    <div className="flex items-center gap-1 font-mono mt-0.5">
                      <span className="text-gray-400 line-through">₹{currentPayStructure.grossSalaryMonthly.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-emerald-600">₹{revisedPayStructure.grossSalaryMonthly.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Monthly Basic Pay</span>
                    <div className="flex items-center gap-1 font-mono mt-0.5">
                      <span className="text-gray-400 line-through">₹{currentPayStructure.basicSalary.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-emerald-600">₹{revisedPayStructure.basicSalary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Confirm & Apply Increment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Official Appraisal / Increment Letter */}
      {selectedLetterForPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-4xl w-full p-8 max-h-[92vh] overflow-y-auto space-y-6 print:m-0 print:p-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 print:hidden">
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                Official Appraisal Letter • Ref: {selectedLetterForPreview.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedLetterForPreview(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans text-xs leading-relaxed">
              <div className="border-b-2 border-emerald-600 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-400">
                    FINSTAQ TECHNOLOGIES PRIVATE LIMITED
                  </h1>
                  <p className="text-[11px] text-gray-500">
                    CIN: U72900MH2024PTC394812 • Mumbai HQ (BKC)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase">Appraisal & Increment Letter</span>
                  <p className="font-mono text-xs font-semibold">{selectedLetterForPreview.revisionDate}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-sm">{selectedLetterForPreview.employeeName}</p>
                <p className="text-gray-600 dark:text-gray-400">Employee Code: {selectedLetterForPreview.empCode}</p>
                <p className="text-gray-600 dark:text-gray-400">Department: {selectedLetterForPreview.department}</p>
              </div>

              <div>
                <p className="font-bold">
                  Subject: Compensation Revision & Performance Appraisal Notification
                </p>
              </div>

              <div className="space-y-3 text-justify">
                <p>Dear {selectedLetterForPreview.employeeName},</p>
                <p>
                  In recognition of your stellar performance and dedication, we are pleased to inform you that
                  your compensation has been revised effective from <strong>{selectedLetterForPreview.effectiveDate}</strong>.
                </p>
                <p>
                  {selectedLetterForPreview.appraisalComments}
                </p>
                <p>
                  Your revised Cost to Company (CTC) is{' '}
                  <strong>₹{selectedLetterForPreview.revisedAnnualCtc.toLocaleString('en-IN')}</strong> per annum
                  (representing a <strong>+{selectedLetterForPreview.hikePercentage}%</strong> increment from your previous CTC of{' '}
                  ₹{selectedLetterForPreview.previousAnnualCtc.toLocaleString('en-IN')}).
                  {selectedLetterForPreview.newDesignation !== selectedLetterForPreview.previousDesignation && (
                    <span>
                      {' '}Furthermore, you have been promoted to the designation of{' '}
                      <strong>{selectedLetterForPreview.newDesignation}</strong>.
                    </span>
                  )}
                </p>
              </div>

              {/* Revised Salary Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-400 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Revised Compensation Structure
                </h3>
                <table className="w-full border-collapse text-xs border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 font-bold border-b border-gray-200 dark:border-gray-700">
                      <th className="p-2 text-left">Component</th>
                      <th className="p-2 text-right">Monthly (₹)</th>
                      <th className="p-2 text-right">Annual (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                    <tr>
                      <td className="p-2">Basic Salary</td>
                      <td className="p-2 text-right">
                        {(selectedLetterForPreview.revisedPayStructure.basicSalary || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedLetterForPreview.revisedPayStructure.basicSalary || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">House Rent Allowance (HRA)</td>
                      <td className="p-2 text-right">
                        {(selectedLetterForPreview.revisedPayStructure.hra || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedLetterForPreview.revisedPayStructure.hra || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Special Allowance</td>
                      <td className="p-2 text-right">
                        {(selectedLetterForPreview.revisedPayStructure.specialAllowance || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedLetterForPreview.revisedPayStructure.specialAllowance || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300">
                      <td className="p-2">Total Monthly Gross Salary</td>
                      <td className="p-2 text-right">
                        {(selectedLetterForPreview.revisedPayStructure.grossSalaryMonthly || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedLetterForPreview.revisedPayStructure.grossSalaryMonthly || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-100 dark:bg-emerald-900/40 font-bold text-emerald-900 dark:text-emerald-200">
                      <td className="p-2">Total Annual CTC</td>
                      <td className="p-2 text-right">
                        {(selectedLetterForPreview.revisedPayStructure.totalEmployerMonthlyCost || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {selectedLetterForPreview.revisedAnnualCtc.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-8 flex justify-between items-end border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="font-bold">For Finstaq Technologies Pvt Ltd</p>
                  <div className="h-12 flex items-center">
                    <span className="font-mono italic text-emerald-600 font-bold text-sm">Authorized HR Signatory</span>
                  </div>
                  <p className="text-gray-500">Chief Executive Officer / VP HR</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Employee Acknowledgment</p>
                  <div className="h-12 flex items-center justify-end">
                    <span className="text-gray-400 italic">Signature & Date</span>
                  </div>
                  <p className="text-gray-500">{selectedLetterForPreview.employeeName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
