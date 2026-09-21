import React, { useState } from 'react';
import {
  FileText,
  UserPlus,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Printer,
  Sparkles,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  UserCheck,
  Send,
  Plus,
  Search,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { CandidateOffer, Employee } from './payrollTypes';
import { calculateIndianCtcBreakdown } from './ctcCalculator';
import { UI } from '../../theme/uiTheme';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface OfferLetterHubProps {
  candidates: CandidateOffer[];
  onAddCandidate: (candidate: CandidateOffer) => void;
  onUpdateCandidateStatus: (candidateId: string, status: CandidateOffer['status']) => void;
  onConvertToEmployee: (candidate: CandidateOffer) => void;
}

export function OfferLetterHub({
  candidates,
  onAddCandidate,
  onUpdateCandidateStatus,
  onConvertToEmployee,
}: OfferLetterHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOfferForPreview, setSelectedOfferForPreview] = useState<CandidateOffer | null>(null);

  // Form State for Creating New Offer
  const [newOffer, setNewOffer] = useState({
    candidateName: '',
    email: '',
    phone: '',
    designation: 'Senior Fullstack Software Engineer',
    department: 'Engineering & Product',
    workLocation: 'Mumbai HQ (BKC)',
    dateOfJoining: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    annualCtc: 1200000,
    probationMonths: 3,
    noticePeriodDays: 60,
    reportingManager: 'Rajesh Nair (VP of Engineering)',
    address: 'B-402, Sunshine Heights, Powai, Mumbai - 400076',
  });

  const livePayStructure = calculateIndianCtcBreakdown(newOffer.annualCtc);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalOffers = candidates.length;
  const acceptedOffers = candidates.filter((c) => c.status === 'ACCEPTED' || c.status === 'JOINED').length;
  const pipelineCtcSum = candidates.reduce((sum, c) => sum + c.annualCtc, 0);
  const joinedCount = candidates.filter((c) => c.status === 'JOINED').length;

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.candidateName || !newOffer.email) return;

    const offerObj: CandidateOffer = {
      id: `OFFER-${Date.now().toString().slice(-4)}`,
      candidateName: newOffer.candidateName,
      email: newOffer.email,
      phone: newOffer.phone,
      designation: newOffer.designation,
      department: newOffer.department,
      workLocation: newOffer.workLocation,
      dateOfJoining: newOffer.dateOfJoining,
      offerDate: new Date().toISOString().split('T')[0],
      annualCtc: newOffer.annualCtc,
      probationMonths: newOffer.probationMonths,
      noticePeriodDays: newOffer.noticePeriodDays,
      reportingManager: newOffer.reportingManager,
      address: newOffer.address,
      status: 'DRAFT',
      payStructure: livePayStructure,
      termsAndConditions: [
        'The candidate shall be on probation for a period of 3 months from the date of joining.',
        'During probation, the notice period for either party shall be 30 days. Post confirmation, notice period shall be 60 days.',
        'The compensation structure and terms of this offer are confidential between the employee and the company.',
        'This offer is contingent upon satisfactory reference checks and submission of previous employment relieving documents.',
      ],
    };

    onAddCandidate(offerObj);
    setIsCreateModalOpen(false);
    setSelectedOfferForPreview(offerObj);
  };

  const getStatusBadge = (status: CandidateOffer['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className={UI.badge('neutral')}>Draft</span>;
      case 'SENT':
        return <span className={UI.badge('info')}>Sent to Candidate</span>;
      case 'ACCEPTED':
        return <span className={UI.badge('warning')}>Accepted</span>;
      case 'JOINED':
        return <span className={UI.badge('success')}>Joined & Onboarded</span>;
      case 'DECLINED':
        return <span className={UI.badge('danger')}>Declined</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Offer Letter & Candidate Onboarding Hub
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Build standardized Indian CTC offers, generate formal letterheads with Annexure A, and onboard into payroll with 1 click.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex items-center ${UI.btn.primary}`}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Offer Letter
        </button>
      </div>

      {/* Standard Executive KPI Scorecards */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Total Offers Extended"
          value={totalOffers}
          icon={FileText}
          badge="Talent Pipeline"
          badgeVariant="info"
          footer={{
            left: <span>Extended: <strong>{totalOffers}</strong></span>,
            right: <span>Pending: <strong>{candidates.filter(c => c.status === 'SENT').length}</strong></span>
          }}
        />

        <KPIScorecard
          label="Accepted Offers"
          value={acceptedOffers}
          variant="emerald"
          icon={CheckCircle2}
          trend={{ value: `${totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0}%`, direction: 'up', label: 'Rate' }}
          footer={{
            left: <span>Accepted: <strong>{acceptedOffers}</strong></span>,
            right: <span>Ready to onboard</span>
          }}
        />

        <KPIScorecard
          label="Active Pipeline CTC"
          value={`₹${(pipelineCtcSum / 100000).toFixed(1)}L`}
          icon={DollarSign}
          progress={{
            percentage: Math.min(100, Math.round((pipelineCtcSum / 5000000) * 100)),
            targetLabel: 'Budget Utilized',
            targetValue: `₹${(pipelineCtcSum / 100000).toFixed(1)}L / ₹50L`
          }}
        />

        <KPIScorecard
          label="Joined & Converted"
          value={joinedCount}
          variant="indigo"
          icon={UserCheck}
          badge="Active Master"
          badgeVariant="indigo"
          footer={{
            left: <span>Employees: <strong>{joinedCount}</strong></span>,
            right: <span>Status: <strong>Onboarded</strong></span>
          }}
        />
      </KPIGrid>

      {/* Candidate Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidate, role, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'JOINED', 'DECLINED'].map((st) => (
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

      {/* Candidate Offers Table */}
      <div className={UI.card.base}>
        <div className="overflow-x-auto">
          <table className={UI.table.table}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={UI.table.th}>Candidate & Role</th>
                <th className={UI.table.th}>Department & Location</th>
                <th className={`${UI.table.th} text-right`}>Annual CTC</th>
                <th className={`${UI.table.th} text-right`}>Monthly Gross</th>
                <th className={UI.table.th}>Joining Date</th>
                <th className={`${UI.table.th} text-center`}>Status</th>
                <th className={`${UI.table.th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No candidate offers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className={UI.table.tr}>
                    <td className={UI.table.td}>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {candidate.candidateName}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {candidate.designation} • {candidate.email}
                        </span>
                      </div>
                    </td>
                    <td className={UI.table.td}>
                      <span className="text-gray-900 dark:text-white block">{candidate.department}</span>
                      <span className="text-[11px] text-gray-500">{candidate.workLocation}</span>
                    </td>
                    <td className={`${UI.table.td} text-right`}>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        ₹{(candidate.annualCtc || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className={`${UI.table.td} text-right`}>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        ₹{(candidate.payStructure?.grossSalaryMonthly || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className={UI.table.td}>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                        {candidate.dateOfJoining}
                      </span>
                    </td>
                    <td className={`${UI.table.td} text-center`}>{getStatusBadge(candidate.status)}</td>
                    <td className={`${UI.table.td} text-center`}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOfferForPreview(candidate)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                          title="View Official Offer Letter"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Letter
                        </button>

                        {candidate.status === 'DRAFT' && (
                          <button
                            onClick={() => onUpdateCandidateStatus(candidate.id, 'SENT')}
                            className="px-2 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                            title="Mark as Sent"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send
                          </button>
                        )}

                        {candidate.status === 'SENT' && (
                          <button
                            onClick={() => onUpdateCandidateStatus(candidate.id, 'ACCEPTED')}
                            className="px-2 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                            title="Mark Accepted"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept
                          </button>
                        )}

                        {(candidate.status === 'ACCEPTED' || candidate.status === 'SENT') && (
                          <button
                            onClick={() => onConvertToEmployee(candidate)}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1 shadow-sm"
                            title="Convert to Active Employee"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Onboard
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

      {/* MODAL 1: Create New Offer Letter */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Generate New Offer Letter
                </h3>
                <p className="text-xs text-gray-500">Configure candidate compensation & employment terms</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sharma"
                    value={newOffer.candidateName}
                    onChange={(e) => setNewOffer({ ...newOffer, candidateName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Candidate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram.sharma@example.com"
                    value={newOffer.email}
                    onChange={(e) => setNewOffer({ ...newOffer, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newOffer.designation}
                    onChange={(e) => setNewOffer({ ...newOffer, designation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={newOffer.department}
                    onChange={(e) => setNewOffer({ ...newOffer, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="Engineering & Product">Engineering & Product</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Business Development">Sales & Business Development</option>
                    <option value="Operations & Support">Operations & Support</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Annual CTC (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={newOffer.annualCtc}
                    onChange={(e) => setNewOffer({ ...newOffer, annualCtc: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    required
                    value={newOffer.dateOfJoining}
                    onChange={(e) => setNewOffer({ ...newOffer, dateOfJoining: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={newOffer.workLocation}
                    onChange={(e) => setNewOffer({ ...newOffer, workLocation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    value={newOffer.reportingManager}
                    onChange={(e) => setNewOffer({ ...newOffer, reportingManager: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Live Indian Salary Breakdown Preview */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Automated Indian CTC Structuring Preview (Annexure A)
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                    Monthly Gross: ₹{livePayStructure.grossSalaryMonthly.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Basic (40%)</span>
                    <span className="font-mono font-semibold">₹{livePayStructure.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">HRA (50% Basic)</span>
                    <span className="font-mono font-semibold">₹{livePayStructure.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Special Allowance</span>
                    <span className="font-mono font-semibold">₹{livePayStructure.specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 block">Employer PF (12%)</span>
                    <span className="font-mono font-semibold">₹{livePayStructure.employerPf.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Generate Offer Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View & Print Official Offer Letter Document */}
      {selectedOfferForPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-4xl w-full p-8 max-h-[92vh] overflow-y-auto space-y-6 print:m-0 print:p-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 print:hidden">
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                Official Appointment Offer • Ref: {selectedOfferForPreview.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedOfferForPreview(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6 text-gray-900 dark:text-gray-100 font-sans text-xs leading-relaxed">
              {/* Company Letterhead */}
              <div className="border-b-2 border-blue-600 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-blue-900 dark:text-blue-400">
                    FINSTAQ TECHNOLOGIES PRIVATE LIMITED
                  </h1>
                  <p className="text-[11px] text-gray-500">
                    CIN: U72900MH2024PTC394812 • GSTIN: 27AABCF1234F1Z9
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Level 8, Tower B, Bandra Kurla Complex, Mumbai, Maharashtra - 400051
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase">Offer Letter</span>
                  <p className="font-mono text-xs font-semibold">{selectedOfferForPreview.offerDate}</p>
                </div>
              </div>

              {/* Candidate Info */}
              <div className="space-y-1">
                <p className="font-bold text-sm">{selectedOfferForPreview.candidateName}</p>
                <p className="text-gray-600 dark:text-gray-400">{selectedOfferForPreview.address}</p>
                <p className="text-gray-600 dark:text-gray-400">Email: {selectedOfferForPreview.email}</p>
              </div>

              {/* Letter Subject & Salutation */}
              <div>
                <p className="font-bold">
                  Subject: Offer of Employment for the position of{' '}
                  <span className="text-blue-700 dark:text-blue-400">{selectedOfferForPreview.designation}</span>
                </p>
              </div>

              <div className="space-y-3 text-justify">
                <p>Dear {selectedOfferForPreview.candidateName},</p>
                <p>
                  With reference to your application and the subsequent rounds of interviews you had with us,
                  we are delighted to offer you the full-time position of <strong>{selectedOfferForPreview.designation}</strong> in
                  the <strong>{selectedOfferForPreview.department}</strong> department at Finstaq Technologies Private Limited.
                </p>
                <p>
                  Your total annual Cost to Company (CTC) will be{' '}
                  <strong>₹{selectedOfferForPreview.annualCtc.toLocaleString('en-IN')}</strong> (Rupees{' '}
                  {(selectedOfferForPreview.annualCtc / 100000).toFixed(2)} Lakhs Only). Detailed component-wise salary
                  breakdown is provided in <strong>Annexure A</strong> attached herewith.
                </p>
                <p>
                  Your expected date of joining will be <strong>{selectedOfferForPreview.dateOfJoining}</strong> at our{' '}
                  <strong>{selectedOfferForPreview.workLocation}</strong> facility. You will be reporting directly to{' '}
                  <strong>{selectedOfferForPreview.reportingManager}</strong>.
                </p>
              </div>

              {/* Annexure A: Detailed Salary Breakdown */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Annexure A: Compensation & Benefits Structure
                </h3>
                <table className="w-full border-collapse text-xs border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 font-bold border-b border-gray-200 dark:border-gray-700">
                      <th className="p-2 text-left">Salary Component</th>
                      <th className="p-2 text-right">Monthly (₹)</th>
                      <th className="p-2 text-right">Annual (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                    <tr>
                      <td className="p-2">Basic Salary</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.basicSalary || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.basicSalary || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">House Rent Allowance (HRA)</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.hra || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.hra || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Conveyance Allowance</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.conveyanceAllowance || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.conveyanceAllowance || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Special Allowance</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.specialAllowance || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.specialAllowance || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300">
                      <td className="p-2">A. Total Gross Salary (Monthly)</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.grossSalaryMonthly || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.grossSalaryMonthly || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Employer PF Contribution (12%)</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.employerPf || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.employerPf || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Gratuity Provision (4.81% Basic)</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.gratuityMonthly || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {((selectedOfferForPreview.payStructure.gratuityMonthly || 0) * 12).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-blue-100 dark:bg-blue-900/40 font-bold text-blue-900 dark:text-blue-200">
                      <td className="p-2">Total Cost to Company (CTC)</td>
                      <td className="p-2 text-right">
                        {(selectedOfferForPreview.payStructure.totalEmployerMonthlyCost || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right">
                        {selectedOfferForPreview.annualCtc.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms of Employment */}
              <div className="space-y-1 pt-2">
                <p className="font-bold">Terms & Conditions:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>Probation Period:</strong> You will be on probation for a period of{' '}
                    {selectedOfferForPreview.probationMonths} months.
                  </li>
                  <li>
                    <strong>Notice Period:</strong> Notice period post confirmation is{' '}
                    {selectedOfferForPreview.noticePeriodDays} days.
                  </li>
                  <li>
                    <strong>Statutory Compliance:</strong> Provident Fund, Professional Tax, and Income Tax deductions
                    shall be made in accordance with the prevailing Indian laws.
                  </li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="font-bold">For Finstaq Technologies Pvt Ltd</p>
                  <div className="h-12 flex items-center">
                    <span className="font-mono italic text-blue-600 font-bold text-sm">Authorized Signatory</span>
                  </div>
                  <p className="text-gray-500">Director / Head of HR</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Candidate Acceptance</p>
                  <div className="h-12 flex items-center justify-end">
                    <span className="text-gray-400 italic">Signature & Date</span>
                  </div>
                  <p className="text-gray-500">{selectedOfferForPreview.candidateName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
