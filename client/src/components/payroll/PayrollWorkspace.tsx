import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Download,
  Plus,
  RefreshCw,
  XCircle,
  ArrowRight,
  Check,
  Info,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  Briefcase,
  PhoneCall,
  UserCheck,
  Heart,
  MapPin,
  CreditCard,
  Eye,
  Award,
  BookOpen,
  History,
  ShieldAlert,
  UserPlus,
  FileText,
  LogOut,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs, TabItem } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';
import { OfferLetterHub } from './OfferLetterHub';
import { SalaryRevisionHub } from './SalaryRevisionHub';
import { FnFSettlementHub } from './FnFSettlementHub';
import { StaffLoansHub } from './StaffLoansHub';
import {
  CandidateOffer,
  SalaryRevisionRecord,
  FnFSettlementRecord,
  StaffLoanRecord,
} from './payrollTypes';
import { calculateIndianCtcBreakdown } from './ctcCalculator';

interface EmployeeEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

interface EmployeeAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface EmployeeEducation {
  qualification: string;
  institution: string;
  yearOfPassing: number;
  gradeOrPercentage?: string;
  certifications?: string[];
}

interface EmployeeWorkExperience {
  totalExperienceYears: number;
  previousEmployer: string;
  previousDesignation: string;
  previousEmploymentPeriod?: string;
  previousLastDrawnCtc?: number;
}

interface EmployeePayStructure {
  annualCtc: number;
  monthlyCtc: number;
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  childrenEducationAllowance: number;
  performanceBonusMonthly: number;
  grossSalaryMonthly: number;
  employerPf: number;
  employerEps: number;
  employerEdliAndAdmin: number;
  employerEsic: number;
  gratuityMonthly: number;
  statutoryBonusMonthly: number;
  totalEmployerMonthlyCost: number;
}

interface EmployeeTaxDeclaration {
  taxRegime: 'NEW' | 'OLD';
  section80C: number;
  section80D: number;
  section24bHomeLoanInterest: number;
  npsSection80CCD1B: number;
  monthlyRentPaid: number;
  isMetroCityHra: boolean;
  otherIncomeOrLoss: number;
}

interface Employee {
  id: string;
  empCode: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  bloodGroup?: string;
  fatherOrSpouseName?: string;
  personalEmail?: string;
  officialEmail?: string;
  phone?: string;
  emergencyContact?: EmployeeEmergencyContact;
  currentAddress?: EmployeeAddress;
  permanentAddress?: EmployeeAddress;
  education?: EmployeeEducation;
  workExperience?: EmployeeWorkExperience;
  department: string;
  designation: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'PROBATION';
  workLocation?: string;
  dateOfJoining?: string;
  probationPeriodMonths?: number;
  dateOfConfirmation?: string;
  reportingManagerName?: string;
  noticePeriodDays?: number;
  pan?: string;
  aadhaar?: string;
  uan?: string;
  esicNo?: string;
  passportNumber?: string;
  drivingLicense?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountType?: 'SALARY' | 'SAVINGS' | 'CURRENT';
  payoutMode?: 'DIRECT_DEPOSIT_NEFT' | 'IMPS' | 'CHEQUE';
  taxRegime?: 'NEW' | 'OLD';
  monthlyCtc?: number;
  basicSalary?: number;
  hra?: number;
  specialAllowance?: number;
  isPfEligible?: boolean;
  pfCappingOption?: 'CAPPED_15000' | 'ACTUAL_BASIC';
  isEsicEligible?: boolean;
  isPtEligible?: boolean;
  statePt?: string;
  status: string;
  payStructure?: EmployeePayStructure;
  taxDeclaration?: EmployeeTaxDeclaration;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  totalCalendarDays: number;
  presentDays: number;
  paidLeaves: number;
  lopDays: number;
  overtimeHours: number;
}

interface PayrollLineItem {
  employeeId: string;
  empCode: string;
  name: string;
  department: string;
  designation: string;
  bankAccount: string;
  bankIfsc: string;
  pan: string;
  uan?: string;
  taxRegime: 'NEW' | 'OLD';
  earnedBasic: number;
  earnedHra: number;
  earnedConveyance: number;
  earnedMedical: number;
  earnedSpecialAllowance: number;
  grossEarnings: number;
  employeePf: number;
  employeeEsic: number;
  professionalTax: number;
  tdsAmount: number;
  totalDeductions: number;
  netTakeHome: number;
  employerPfContribution: number;
  employerEsicContribution: number;
  gratuityProvision: number;
  totalEmployerCost: number;
  presentDays: number;
  lopDays: number;
}

interface PayrollSummary {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalEmployeePf: number;
  totalEmployeeEsic: number;
  totalProfessionalTax: number;
  totalTdsDeducted: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployerPf: number;
  totalEmployerEsic: number;
  totalEmployerCost: number;
}

export type PayrollTab =
  | 'overview'
  | 'directory'
  | 'offers'
  | 'revisions'
  | 'settlements'
  | 'loans'
  | 'attendance'
  | 'compliance';

interface PayrollWorkspaceProps {
  initialTab?: PayrollTab;
}

export function PayrollWorkspace({ initialTab = 'overview' }: PayrollWorkspaceProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<PayrollTab>(initialTab);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<{ summary: PayrollSummary; items: PayrollLineItem[] } | null>(null);

  // Candidate Offers State
  const [candidates, setCandidates] = useState<CandidateOffer[]>([
    {
      id: 'OFFER-0891',
      candidateName: 'Vikramaditya Sharma',
      email: 'vikram.sharma@example.com',
      phone: '+91 98201 54321',
      designation: 'Senior Fullstack Software Engineer',
      department: 'Engineering & Product',
      workLocation: 'Mumbai HQ (BKC)',
      dateOfJoining: '2026-05-01',
      offerDate: '2026-04-10',
      annualCtc: 1200000,
      probationMonths: 3,
      noticePeriodDays: 60,
      reportingManager: 'Rajesh Nair (VP of Engineering)',
      address: 'B-402, Sunshine Heights, Powai, Mumbai - 400076',
      status: 'ACCEPTED',
      payStructure: calculateIndianCtcBreakdown(1200000),
      termsAndConditions: [
        'The candidate shall be on probation for 3 months from the date of joining.',
        'During probation, notice period shall be 30 days. Post confirmation, notice period is 60 days.',
      ],
    },
    {
      id: 'OFFER-0892',
      candidateName: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      phone: '+91 97112 88990',
      designation: 'Growth Marketing Manager',
      department: 'Sales & Business Development',
      workLocation: 'Bengaluru Branch (Indiranagar)',
      dateOfJoining: '2026-05-15',
      offerDate: '2026-04-12',
      annualCtc: 950000,
      probationMonths: 3,
      noticePeriodDays: 60,
      reportingManager: 'Ankita Verma (Head of Growth)',
      address: '45/2, 12th Main, Indiranagar, Bengaluru - 560038',
      status: 'SENT',
      payStructure: calculateIndianCtcBreakdown(950000),
    },
    {
      id: 'OFFER-0893',
      candidateName: 'Rohan Deshmukh',
      email: 'rohan.d@example.com',
      phone: '+91 98334 11223',
      designation: 'Senior Financial Analyst',
      department: 'Finance & Accounts',
      workLocation: 'Mumbai HQ (BKC)',
      dateOfJoining: '2026-06-01',
      offerDate: '2026-04-15',
      annualCtc: 750000,
      probationMonths: 3,
      noticePeriodDays: 60,
      reportingManager: 'Pooja Hegde (CFO)',
      address: '102, Gokul Dham, Thane West, Mumbai - 400601',
      status: 'DRAFT',
      payStructure: calculateIndianCtcBreakdown(750000),
    },
  ]);

  // Salary Revisions State
  const [salaryRevisions, setSalaryRevisions] = useState<SalaryRevisionRecord[]>([
    {
      id: 'REV-0412',
      employeeId: 'emp-1',
      employeeName: 'Priya Sharma',
      empCode: 'EMP-001',
      department: 'Engineering & Product',
      previousDesignation: 'Senior Software Engineer',
      newDesignation: 'Staff Software Architect',
      previousAnnualCtc: 1500000,
      revisedAnnualCtc: 1800000,
      hikePercentage: 20.0,
      effectiveDate: '2026-04-01',
      revisionDate: '2026-04-05',
      revisionType: 'PROMOTION',
      appraisalComments: 'Promoted to Staff Architect for leading the core multi-tenant microservices migration.',
      revisedPayStructure: calculateIndianCtcBreakdown(1800000),
      retroactiveArrearsEstimate: 0,
      status: 'APPLIED',
    },
    {
      id: 'REV-0413',
      employeeId: 'emp-2',
      employeeName: 'Rajesh Nair',
      empCode: 'EMP-002',
      department: 'Engineering & Product',
      previousDesignation: 'VP of Engineering',
      newDesignation: 'VP of Engineering',
      previousAnnualCtc: 2100000,
      revisedAnnualCtc: 2350000,
      hikePercentage: 11.9,
      effectiveDate: '2026-04-01',
      revisionDate: '2026-04-05',
      revisionType: 'ANNUAL_APPRAISAL',
      appraisalComments: 'Annual performance revision based on enterprise deliverable milestones.',
      revisedPayStructure: calculateIndianCtcBreakdown(2350000),
      status: 'APPLIED',
    },
  ]);

  // Full & Final Settlements State
  const [settlements, setSettlements] = useState<FnFSettlementRecord[]>([
    {
      id: 'FNF-0104',
      employeeId: 'emp-4',
      employeeName: 'Amit Desai',
      empCode: 'EMP-004',
      department: 'Operations & Logistics',
      designation: 'Operations Lead',
      dateOfJoining: '2021-02-15',
      dateOfResignation: '2026-03-01',
      lastWorkingDay: '2026-03-31',
      tenureYears: 5.1,
      exitReason: 'RESIGNATION',
      exitMonthDaysWorked: 30,
      exitMonthGrossSalary: 35000,
      earnedLeavesBalance: 12,
      leaveEncashmentRatePerDay: 769,
      leaveEncashmentAmount: 9228,
      isGratuityEligible: true,
      gratuityAmount: 58846,
      statutoryBonusPayable: 0,
      reimbursementsPending: 2400,
      noticePeriodShortfallDays: 0,
      noticeRecoveryAmount: 0,
      salaryAdvanceRecovery: 8000,
      unreturnedAssetDeduction: 0,
      tdsDeduction: 0,
      totalGrossPayable: 105474,
      totalDeductionsAndRecoveries: 8000,
      netSettlementAmount: 97474,
      settlementStatus: 'SETTLED',
      settlementDate: '2026-04-02',
      settledBy: 'Finance & HR Payroll Admin',
      remarks: 'NOC cleared across all departments. Gratuity disbursed as per Payment of Gratuity Act 1972.',
    },
    {
      id: 'FNF-0105',
      employeeId: 'emp-5',
      employeeName: 'Sneha Kulkarni',
      empCode: 'EMP-005',
      department: 'Engineering & Product',
      designation: 'QA Automation Engineer',
      dateOfJoining: '2024-01-10',
      dateOfResignation: '2026-03-15',
      lastWorkingDay: '2026-04-15',
      tenureYears: 2.3,
      exitReason: 'RESIGNATION',
      exitMonthDaysWorked: 15,
      exitMonthGrossSalary: 28000,
      earnedLeavesBalance: 8,
      leaveEncashmentRatePerDay: 1077,
      leaveEncashmentAmount: 8616,
      isGratuityEligible: false,
      gratuityAmount: 0,
      statutoryBonusPayable: 0,
      reimbursementsPending: 1500,
      noticePeriodShortfallDays: 0,
      noticeRecoveryAmount: 0,
      salaryAdvanceRecovery: 0,
      unreturnedAssetDeduction: 0,
      tdsDeduction: 0,
      totalGrossPayable: 38116,
      totalDeductionsAndRecoveries: 0,
      netSettlementAmount: 38116,
      settlementStatus: 'DRAFT',
      settlementDate: '2026-04-15',
      settledBy: 'Finance & HR Payroll Admin',
      remarks: 'Pending laptop physical asset verification by IT dept.',
    },
  ]);

  // Staff Loans State
  const [staffLoans, setStaffLoans] = useState<StaffLoanRecord[]>([
    {
      id: 'LN-0041',
      employeeId: 'emp-4',
      employeeName: 'Amit Desai',
      department: 'Operations & Logistics',
      loanType: 'SALARY_ADVANCE',
      principalAmount: 40000,
      interestRateAnnual: 0,
      tenureMonths: 5,
      monthlyEmi: 8000,
      disbursedDate: '2025-11-01',
      emiStartMonth: 'Dec 2025',
      totalRepaid: 32000,
      outstandingBalance: 8000,
      status: 'ACTIVE',
      reason: 'Home Renovation / Emergency advance',
    },
    {
      id: 'LN-0042',
      employeeId: 'emp-3',
      employeeName: 'Suresh Patil',
      department: 'Sales & Marketing',
      loanType: 'EMERGENCY_MEDICAL',
      principalAmount: 60000,
      interestRateAnnual: 0,
      tenureMonths: 6,
      monthlyEmi: 10000,
      disbursedDate: '2025-08-01',
      emiStartMonth: 'Sep 2025',
      totalRepaid: 60000,
      outstandingBalance: 0,
      status: 'CLOSED',
      reason: 'Medical hospitalization advance',
    },
  ]);

  // Candidate Handlers
  const handleAddCandidate = (newCand: CandidateOffer) => {
    setCandidates([newCand, ...candidates]);
    toast.success(`Offer Letter generated for ${newCand.candidateName}!`);
  };

  const handleUpdateCandidateStatus = (candidateId: string, status: CandidateOffer['status']) => {
    setCandidates(candidates.map((c) => (c.id === candidateId ? { ...c, status } : c)));
    toast.success(`Candidate status updated to ${status}`);
  };

  const handleConvertToEmployee = async (cand: CandidateOffer) => {
    const names = cand.candidateName.split(' ');
    const firstName = names[0] || cand.candidateName;
    const lastName = names.slice(1).join(' ') || '';

    const newEmp: Employee = {
      id: `emp-${Date.now().toString().slice(-4)}`,
      empCode: `EMP-${(employees.length + 101).toString()}`,
      name: cand.candidateName,
      firstName,
      lastName,
      officialEmail: cand.email,
      phone: cand.phone,
      department: cand.department,
      designation: cand.designation,
      workLocation: cand.workLocation,
      dateOfJoining: cand.dateOfJoining,
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      probationPeriodMonths: cand.probationMonths,
      reportingManagerName: cand.reportingManager,
      noticePeriodDays: cand.noticePeriodDays,
      monthlyCtc: cand.payStructure.monthlyCtc,
      basicSalary: cand.payStructure.basicSalary,
      hra: cand.payStructure.hra,
      specialAllowance: cand.payStructure.specialAllowance,
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: cand.payStructure.monthlyCtc <= 21000,
      isPtEligible: true,
      statePt: 'MAHARASHTRA',
      payStructure: cand.payStructure,
      currentAddress: {
        addressLine1: cand.address,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
    };

    setEmployees([newEmp, ...employees]);
    setCandidates(candidates.map((c) => (c.id === cand.id ? { ...c, status: 'JOINED' } : c)));
    toast.success(`🎉 ${cand.candidateName} successfully onboarded into Employee Directory & Payroll Master!`);
  };

  // Salary Revision Handler
  const handleApplySalaryRevision = (rev: SalaryRevisionRecord) => {
    setSalaryRevisions([rev, ...salaryRevisions]);
    setEmployees(
      employees.map((emp) => {
        if (emp.id === rev.employeeId) {
          return {
            ...emp,
            designation: rev.newDesignation,
            monthlyCtc: rev.revisedPayStructure.monthlyCtc,
            basicSalary: rev.revisedPayStructure.basicSalary,
            hra: rev.revisedPayStructure.hra,
            specialAllowance: rev.revisedPayStructure.specialAllowance,
            payStructure: rev.revisedPayStructure,
          };
        }
        return emp;
      })
    );
    toast.success(`Increment of +${rev.hikePercentage}% applied for ${rev.employeeName}!`);
  };

  // FnF Settlement Handlers
  const handleCreateFnFSettlement = (settlement: FnFSettlementRecord) => {
    setSettlements([settlement, ...settlements]);
    setEmployees(
      employees.map((emp) => (emp.id === settlement.employeeId ? { ...emp, status: 'RESIGNED' } : emp))
    );
    toast.success(`F&F Settlement computed for ${settlement.employeeName}. Net Payable: ₹${settlement.netSettlementAmount.toLocaleString('en-IN')}`);
  };

  const handleUpdateSettlementStatus = (settlementId: string, status: FnFSettlementRecord['settlementStatus']) => {
    setSettlements(settlements.map((s) => (s.id === settlementId ? { ...s, settlementStatus: status } : s)));
    toast.success(`Settlement status updated to ${status}`);
  };

  // Staff Loan Handlers
  const handleAddStaffLoan = (loan: StaffLoanRecord) => {
    setStaffLoans([loan, ...staffLoans]);
    toast.success(`Loan of ₹${loan.principalAmount.toLocaleString('en-IN')} disbursed to ${loan.employeeName}!`);
  };

  const handleRecordLoanRepayment = (loanId: string, amount: number) => {
    setStaffLoans(
      staffLoans.map((ln) => {
        if (ln.id === loanId) {
          const newRepaid = ln.totalRepaid + amount;
          const newOutstanding = Math.max(0, ln.principalAmount - newRepaid);
          return {
            ...ln,
            totalRepaid: newRepaid,
            outstandingBalance: newOutstanding,
            status: newOutstanding === 0 ? 'CLOSED' : 'ACTIVE',
          };
        }
        return ln;
      })
    );
    toast.success(`Recorded ₹${amount.toLocaleString('en-IN')} loan EMI deduction!`);
  };

  // Month & Year state
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Modals
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [addEmpStep, setAddEmpStep] = useState<number>(1);
  const [isRunPayrollModalOpen, setIsRunPayrollModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);

  // Employee 360 Profile Modal State
  const [selectedEmpForProfile, setSelectedEmpForProfile] = useState<Employee | null>(null);
  const [profileModalTab, setProfileModalTab] = useState<'overview' | 'personal' | 'education' | 'experience' | 'statutory' | 'compensation'>('overview');

  // Manage CTC Modal State
  const [isManageCtcModalOpen, setIsManageCtcModalOpen] = useState(false);
  const [selectedEmpForCtc, setSelectedEmpForCtc] = useState<Employee | null>(null);
  const [revisedAnnualCtc, setRevisedAnnualCtc] = useState<number>(1200000);
  const [revisedCtcBreakdown, setRevisedCtcBreakdown] = useState<any>(null);
  const [revisedTaxRegime, setRevisedTaxRegime] = useState<'NEW' | 'OLD'>('NEW');
  const [revisedIsPfEligible, setRevisedIsPfEligible] = useState<boolean>(true);
  const [revisedPfCappingOption, setRevisedPfCappingOption] = useState<'CAPPED_15000' | 'ACTUAL_BASIC'>('CAPPED_15000');
  const [revisedIsEsicEligible, setRevisedIsEsicEligible] = useState<boolean>(false);
  const [revisedIsPtEligible, setRevisedIsPtEligible] = useState<boolean>(true);
  const [revisedPtState, setRevisedPtState] = useState<string>('MAHARASHTRA');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Comprehensive New Employee Form State
  const [newEmpForm, setNewEmpForm] = useState({
    // 1. Personal & Demographics
    firstName: '',
    lastName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dateOfBirth: '1995-05-15',
    maritalStatus: 'SINGLE' as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED',
    bloodGroup: 'B+',
    fatherOrSpouseName: '',
    officialEmail: '',
    personalEmail: '',
    phone: '',

    // 2. Employment & Role
    department: 'Engineering & Product',
    designation: '',
    employmentType: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'PROBATION',
    workLocation: 'Mumbai HQ (BKC)',
    dateOfJoining: new Date().toISOString().split('T')[0],
    probationPeriodMonths: 3,
    reportingManagerName: 'Rajesh Nair (VP Engineering)',
    noticePeriodDays: 60,

    // 3. Education & Work Experience
    qualification: 'Bachelor of Technology (B.Tech Computer Science)',
    institution: 'University of Mumbai',
    yearOfPassing: 2020,
    gradeOrPercentage: '8.4 CGPA',
    certifications: 'AWS Certified Developer, Certified Scrum Master',
    totalExperienceYears: 4.5,
    previousEmployer: 'Infosys Limited',
    previousDesignation: 'Senior Systems Engineer',
    previousLastDrawnCtc: 850000,

    // 4. Emergency & Addresses
    emergencyContactName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    addressLine1: '',

    // 5. Identity, Bank & Statutory
    pan: '',
    aadhaar: '',
    uan: '',
    esicNo: '',
    bankName: 'HDFC Bank Ltd',
    bankAccountNumber: '',
    bankIfsc: 'HDFC0000123',
    annualCtc: 1200000,
    monthlyCtc: 100000,
    taxRegime: 'NEW' as 'NEW' | 'OLD',
    statePt: 'MAHARASHTRA',
    isPfEligible: true,
    pfCappingOption: 'CAPPED_15000' as 'CAPPED_15000' | 'ACTUAL_BASIC',
    isEsicEligible: false,
    isPtEligible: true,
  });

  const recalculateCtcBreakdown = async (
    annual: number,
    isPf: boolean,
    pfCap: 'CAPPED_15000' | 'ACTUAL_BASIC',
    isEsic: boolean
  ) => {
    try {
      const res = await fetch('/api/v1/payroll/employees/calculate-ctc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify({
          annualCtc: annual,
          isPfEligible: isPf,
          pfCappingOption: pfCap,
          isEsicEligible: isEsic,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setRevisedCtcBreakdown(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenManageCtc = async (emp: Employee) => {
    setSelectedEmpForCtc(emp);
    const annual = emp.payStructure?.annualCtc || (emp.payStructure?.monthlyCtc ? emp.payStructure.monthlyCtc * 12 : (emp.monthlyCtc ? emp.monthlyCtc * 12 : 1200000));
    const isPf = emp.isPfEligible !== undefined ? emp.isPfEligible : true;
    const pfCap = emp.pfCappingOption || 'CAPPED_15000';
    const isEsic = emp.isEsicEligible !== undefined ? emp.isEsicEligible : ((emp.payStructure?.monthlyCtc || Math.round(annual / 12)) <= 21000);
    const isPt = emp.isPtEligible !== undefined ? emp.isPtEligible : true;
    const ptState = emp.statePt || 'MAHARASHTRA';

    setRevisedAnnualCtc(annual);
    setRevisedTaxRegime((emp.taxDeclaration?.taxRegime || emp.taxRegime || 'NEW') as 'NEW' | 'OLD');
    setRevisedIsPfEligible(isPf);
    setRevisedPfCappingOption(pfCap);
    setRevisedIsEsicEligible(isEsic);
    setRevisedIsPtEligible(isPt);
    setRevisedPtState(ptState);

    await recalculateCtcBreakdown(annual, isPf, pfCap, isEsic);
    setIsManageCtcModalOpen(true);
  };

  const handleOpenProfileModal = (emp: Employee) => {
    setSelectedEmpForProfile(emp);
    setProfileModalTab('overview');
  };

  const handleCtcSliderChange = async (val: number) => {
    setRevisedAnnualCtc(val);
    const monthlyVal = Math.round(val / 12);
    const autoEsic = monthlyVal <= 21000 ? revisedIsEsicEligible : false;
    await recalculateCtcBreakdown(val, revisedIsPfEligible, revisedPfCappingOption, autoEsic);
  };

  const handleTogglePf = async (eligible: boolean) => {
    setRevisedIsPfEligible(eligible);
    await recalculateCtcBreakdown(revisedAnnualCtc, eligible, revisedPfCappingOption, revisedIsEsicEligible);
  };

  const handlePfCappingChange = async (opt: 'CAPPED_15000' | 'ACTUAL_BASIC') => {
    setRevisedPfCappingOption(opt);
    await recalculateCtcBreakdown(revisedAnnualCtc, revisedIsPfEligible, opt, revisedIsEsicEligible);
  };

  const handleToggleEsic = async (eligible: boolean) => {
    setRevisedIsEsicEligible(eligible);
    await recalculateCtcBreakdown(revisedAnnualCtc, revisedIsPfEligible, revisedPfCappingOption, eligible);
  };

  const handleSaveCtcRevision = async () => {
    if (!selectedEmpForCtc) return;
    try {
      const res = await fetch('/api/v1/payroll/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify({
          id: selectedEmpForCtc.id,
          annualCtc: revisedAnnualCtc,
          isPfEligible: revisedIsPfEligible,
          pfCappingOption: revisedPfCappingOption,
          isEsicEligible: revisedIsEsicEligible,
          isPtEligible: revisedIsPtEligible,
          statePt: revisedPtState,
          taxDeclaration: {
            ...(selectedEmpForCtc.taxDeclaration || {}),
            taxRegime: revisedTaxRegime,
          },
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        toast.success(`CTC & Statutory Settings revised for ${selectedEmpForCtc.name}!`);
        setIsManageCtcModalOpen(false);
        fetchData();
      } else {
        toast.error('Failed to update CTC');
      }
    } catch (err) {
      toast.error('Error saving CTC revision');
    }
  };

  const fetchData = async () => {
    try {
      const [empRes, attRes, runsRes, prevRes] = await Promise.all([
        fetch('/api/v1/payroll/employees', {
          headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
        }),
        fetch(`/api/v1/payroll/attendance?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
        }),
        fetch('/api/v1/payroll/history', {
          headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
        }),
        fetch(`/api/v1/payroll/preview?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
        }),
      ]);

      const [empData, attData, runsData, prevData] = await Promise.all([
        empRes.json(),
        attRes.json(),
        runsRes.json(),
        prevRes.json(),
      ]);

      if (empData.success) setEmployees(Array.isArray(empData.data) ? empData.data : []);
      if (attData.success) setAttendance(Array.isArray(attData.data) ? attData.data : []);
      if (runsData.success) setPayrollRuns(Array.isArray(runsData.data) ? runsData.data : []);
      if (prevData.success) setPreviewData(prevData.data);
    } catch (err) {
      console.error('Failed to load payroll data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const certList = newEmpForm.certifications
        ? newEmpForm.certifications.split(',').map((c) => c.trim()).filter(Boolean)
        : [];

      const payload = {
        firstName: newEmpForm.firstName,
        lastName: newEmpForm.lastName,
        name: `${newEmpForm.firstName} ${newEmpForm.lastName}`.trim(),
        gender: newEmpForm.gender,
        dateOfBirth: newEmpForm.dateOfBirth,
        maritalStatus: newEmpForm.maritalStatus,
        bloodGroup: newEmpForm.bloodGroup,
        fatherOrSpouseName: newEmpForm.fatherOrSpouseName,
        officialEmail: newEmpForm.officialEmail,
        personalEmail: newEmpForm.personalEmail,
        phone: newEmpForm.phone,
        department: newEmpForm.department,
        designation: newEmpForm.designation,
        employmentType: newEmpForm.employmentType,
        workLocation: newEmpForm.workLocation,
        dateOfJoining: newEmpForm.dateOfJoining,
        probationPeriodMonths: newEmpForm.probationPeriodMonths,
        reportingManagerName: newEmpForm.reportingManagerName,
        noticePeriodDays: newEmpForm.noticePeriodDays,
        education: {
          qualification: newEmpForm.qualification,
          institution: newEmpForm.institution,
          yearOfPassing: Number(newEmpForm.yearOfPassing) || 2020,
          gradeOrPercentage: newEmpForm.gradeOrPercentage,
          certifications: certList,
        },
        workExperience: {
          totalExperienceYears: Number(newEmpForm.totalExperienceYears) || 0,
          previousEmployer: newEmpForm.previousEmployer,
          previousDesignation: newEmpForm.previousDesignation,
          previousLastDrawnCtc: Number(newEmpForm.previousLastDrawnCtc) || 0,
        },
        emergencyContact: {
          name: newEmpForm.emergencyContactName,
          relationship: newEmpForm.emergencyRelationship,
          phone: newEmpForm.emergencyPhone,
        },
        currentAddress: {
          addressLine1: newEmpForm.addressLine1 || 'Mumbai HQ Area',
          city: newEmpForm.city,
          state: newEmpForm.state,
          pincode: newEmpForm.pincode,
          country: 'India',
        },
        permanentAddress: {
          addressLine1: newEmpForm.addressLine1 || 'Mumbai HQ Area',
          city: newEmpForm.city,
          state: newEmpForm.state,
          pincode: newEmpForm.pincode,
          country: 'India',
        },
        pan: newEmpForm.pan.toUpperCase(),
        aadhaar: newEmpForm.aadhaar,
        uan: newEmpForm.uan,
        esicNo: newEmpForm.esicNo,
        bankName: newEmpForm.bankName,
        bankAccountNumber: newEmpForm.bankAccountNumber,
        bankIfsc: newEmpForm.bankIfsc.toUpperCase(),
        annualCtc: newEmpForm.monthlyCtc * 12,
        monthlyCtc: newEmpForm.monthlyCtc,
        isPfEligible: newEmpForm.isPfEligible,
        pfCappingOption: newEmpForm.pfCappingOption,
        isEsicEligible: newEmpForm.isEsicEligible,
        isPtEligible: newEmpForm.isPtEligible,
        statePt: newEmpForm.statePt,
        taxDeclaration: {
          taxRegime: newEmpForm.taxRegime,
          section80C: 150000,
          section80D: 25000,
          section24bHomeLoanInterest: 0,
          npsSection80CCD1B: 0,
          monthlyRentPaid: 0,
          isMetroCityHra: true,
          otherIncomeOrLoss: 0,
        },
      };

      const res = await fetch('/api/v1/payroll/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Employee ${data.data.name} (${data.data.empCode}) onboarded successfully!`);
        setIsAddEmpModalOpen(false);
        setAddEmpStep(1);
        fetchData();
      } else {
        toast.error('Failed to onboard employee');
      }
    } catch (err) {
      toast.error('Error creating employee');
    }
  };

  const handleUpdateLop = async (empId: string, lop: number) => {
    try {
      const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();
      const res = await fetch('/api/v1/payroll/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify({
          employeeId: empId,
          month: selectedMonth,
          year: selectedYear,
          presentDays: totalDays - lop,
          paidLeaves: 0,
          lopDays: lop,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Attendance & LOP updated!');
        fetchData();
      }
    } catch (err) {
      toast.error('Error updating attendance');
    }
  };

  const handleExecutePayroll = async () => {
    try {
      const res = await fetch('/api/v1/payroll/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          autoPostVoucher: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payroll Executed! Journal Voucher posted (${data.data.voucherNumber || 'JV-AUTO'})`);
        setIsRunPayrollModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to execute payroll');
      }
    } catch (err) {
      toast.error('Execution error');
    }
  };

  const handleOpenPayslip = async (empId: string) => {
    try {
      const res = await fetch(`/api/v1/payroll/payslip/${empId}?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
      });
      const data = await res.json();
      if (data.success) {
        setPayslipData(data.data);
        setIsPayslipModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load payslip');
    }
  };

  const handleDownloadEcr = async () => {
    try {
      const res = await fetch(`/api/v1/payroll/compliance/ecr?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([data.data.ecrContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.data.filename;
        a.click();
        toast.success(`EPFO ECR file ${data.data.filename} downloaded!`);
      }
    } catch (err) {
      toast.error('Failed to download ECR');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.empCode || '').toLowerCase().includes(q) ||
      (emp.pan || '').toLowerCase().includes(q) ||
      (emp.officialEmail || '').toLowerCase().includes(q) ||
      (emp.reportingManagerName || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q);
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const getManageCtcTakeHome = () => {
    if (!revisedCtcBreakdown) return 0;
    const gross = revisedCtcBreakdown.grossSalaryMonthly || Math.round(revisedAnnualCtc / 12 * 0.94);
    const basic = revisedCtcBreakdown.basicSalary || Math.round((revisedAnnualCtc / 12) * 0.40);
    
    let eePf = 0;
    if (revisedIsPfEligible) {
      const pfWage = revisedPfCappingOption === 'CAPPED_15000' ? Math.min(basic, 15000) : basic;
      eePf = Math.round(pfWage * 0.12);
    }

    let eeEsic = 0;
    if (revisedIsEsicEligible && gross <= 21000) {
      eeEsic = Math.ceil(gross * 0.0075);
    }

    let pt = 0;
    if (revisedIsPtEligible && revisedPtState !== 'DELHI') {
      pt = 200;
    }

    const estimatedAnnualTaxable = revisedTaxRegime === 'NEW'
      ? Math.max(0, revisedAnnualCtc - 75000)
      : Math.max(0, revisedAnnualCtc - 50000 - 150000 - (eePf * 12));
    
    let annualTds = 0;
    if (revisedTaxRegime === 'NEW') {
      if (estimatedAnnualTaxable > 700000) {
        annualTds = Math.max(0, (estimatedAnnualTaxable - 700000) * 0.15);
      }
    } else {
      if (estimatedAnnualTaxable > 500000) {
        annualTds = Math.max(0, (estimatedAnnualTaxable - 500000) * 0.20);
      }
    }
    const monthlyTds = Math.round(annualTds / 12);

    return Math.max(0, gross - eePf - eeEsic - pt - monthlyTds);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold tracking-wide uppercase border border-indigo-400/30">
              Indian Payroll & HR Engine 2.0
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
              Complete HR Profile • EPFO • ESIC • PT • TDS Ready
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Time, Attendance & Statutory Payroll Hub</h1>
          <p className="text-sm text-indigo-200/90 mt-1">
            Comprehensive Employee 360° Profiles (Education, Prior Experience, Emergency Contacts, Reporting Manager) with statutory payroll and double-entry postings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/10 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-white px-2 py-1 outline-none font-semibold cursor-pointer"
            >
              <option value={1} className="text-black">Jan 2026</option>
              <option value={2} className="text-black">Feb 2026</option>
              <option value={3} className="text-black">Mar 2026</option>
              <option value={4} className="text-black">Apr 2026</option>
              <option value={5} className="text-black">May 2026</option>
            </select>
          </div>

          <button
            onClick={() => { setAddEmpStep(1); setIsAddEmpModalOpen(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/10 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Onboard Employee
          </button>

          <button
            onClick={() => setIsRunPayrollModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Process & Execute Payroll
          </button>
        </div>
      </div>

      {/* Primary Executive KPI Scorecards */}
      {previewData && (
        <KPIGrid cols={4}>
          <KPIScorecard
            label="Total Active Employees"
            value={previewData.summary.totalEmployees}
            icon={Users}
            badge="Full Statutory"
            badgeVariant="info"
            footer={{
              left: <span>Active: <strong className="text-slate-900 dark:text-white font-bold">{employees.filter(e => e.status === 'ACTIVE').length}</strong></span>,
              right: <span>EPFO / ESIC Enrolled</span>
            }}
          />

          <KPIScorecard
            label="Gross Monthly Earnings"
            value={`₹${(previewData.summary.totalGrossPayroll || 0).toLocaleString('en-IN')}`}
            icon={DollarSign}
            trend={{ value: 'Earned Gross', direction: 'up', label: 'post LOP' }}
            footer={{
              left: <span>Basic + HRA + Allowances</span>,
              right: <span>Month {selectedMonth}/{selectedYear}</span>
            }}
          />

          <KPIScorecard
            label="Total Statutory Deductions"
            value={`₹${(previewData.summary.totalDeductions || 0).toLocaleString('en-IN')}`}
            variant="rose"
            icon={ShieldCheck}
            trend={{ value: 'Statutory', direction: 'down', label: 'TDS/PF/PT' }}
            footer={{
              left: <span>PF: ₹{(previewData.summary.totalEmployeePf || 0).toLocaleString('en-IN')}</span>,
              right: <span>TDS: ₹{(previewData.summary.totalTdsDeducted || 0).toLocaleString('en-IN')}</span>
            }}
          />

          <KPIScorecard
            label="Net Salary Disbursement"
            value={`₹${(previewData.summary.totalNetPay || 0).toLocaleString('en-IN')}`}
            variant="featured"
            icon={TrendingUp}
            badge="Bank Batch Ready"
            badgeVariant="glass"
            footer={{
              left: <span>Payout: <strong>NEFT / IMPS</strong></span>,
              right: <span>Status: <strong>Ready</strong></span>
            }}
          />
        </KPIGrid>
      )}

      {/* Navigation Tabs */}
      <StandardTabs<PayrollTab>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'overview',
            label: 'Payroll Run & Register',
            icon: DollarSign,
            badge: previewData ? `${previewData.items.length} Ready` : null,
            badgeVariant: 'default',
          },
          {
            id: 'attendance',
            label: 'Time, Attendance & LOP',
            icon: Calendar,
            badge: `${attendance.filter((a) => a.lopDays > 0).length} LOP`,
            badgeVariant: attendance.some((a) => a.lopDays > 0) ? 'warning' : 'default',
          },
          {
            id: 'loans',
            label: 'Staff Loans & Advances',
            icon: CreditCard,
            badge: staffLoans.filter((l) => l.status === 'ACTIVE').length,
            badgeVariant: 'default',
          },
          {
            id: 'compliance',
            label: 'Statutory Compliance & ECR',
            icon: ShieldCheck,
            badge: 'EPFO / ESIC',
            badgeVariant: 'success',
          },
        ]}
      />

      {/* TAB 1: Payroll Summary & Register */}
      {activeTab === 'overview' && previewData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Salary Register Preview (Month {selectedMonth}/{selectedYear})
              </h3>
              <p className="text-xs text-gray-500">Live statutory deductions calculated per employee</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800">
              Auto-Calculated Engine Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3 font-semibold">Employee</th>
                  <th className="p-3 font-semibold text-center">Days (Pres / LOP)</th>
                  <th className="p-3 font-semibold text-right">Earned Basic</th>
                  <th className="p-3 font-semibold text-right">Gross Earnings</th>
                  <th className="p-3 font-semibold text-right text-rose-600">EE PF (12%)</th>
                  <th className="p-3 font-semibold text-right text-rose-600">ESIC (0.75%)</th>
                  <th className="p-3 font-semibold text-right text-rose-600">PT</th>
                  <th className="p-3 font-semibold text-right text-rose-600">TDS</th>
                  <th className="p-3 font-semibold text-right font-bold text-emerald-600">Net Take-Home</th>
                  <th className="p-3 font-semibold text-right text-blue-600">Total CTC Cost</th>
                  <th className="p-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.items.map((item) => (
                  <tr key={item.employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="p-3">
                      <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {item.empCode} • {item.department}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-medium">{item.presentDays}</span>
                      {item.lopDays > 0 && (
                        <span className="ml-1 text-rose-600 font-bold">({item.lopDays} LOP)</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">₹{(item.earnedBasic || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                      ₹{(item.grossEarnings || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-600">
                      {(item.employeePf || 0) > 0 ? `₹${(item.employeePf || 0).toLocaleString('en-IN')}` : <span className="text-gray-400 font-semibold">₹0 (Opted Out)</span>}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-600">
                      {(item.employeeEsic || 0) > 0 ? `₹${(item.employeeEsic || 0).toLocaleString('en-IN')}` : <span className="text-gray-400">₹0 (Exempt)</span>}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-600">₹{(item.professionalTax || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono text-rose-600">₹{(item.tdsAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">
                      ₹{(item.netTakeHome || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-blue-600">
                      ₹{(item.totalEmployerCost || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenPayslip(item.employeeId)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded font-semibold text-xs transition"
                      >
                        Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Employee Master Directory with Rich Cards */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search by name, emp code, PAN, manager, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering & Product">Engineering & Product</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Operations & Logistics">Operations & Logistics</option>
                <option value="Client Projects">Client Projects</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((emp) => {
              const monthlyCtc = emp.payStructure?.monthlyCtc ?? emp.monthlyCtc ?? 0;
              const taxRegime = emp.taxDeclaration?.taxRegime ?? emp.taxRegime ?? 'NEW';
              const bankAcc = emp.bankAccountNumber || '';
              const isPf = emp.isPfEligible ?? true;
              const isEsic = emp.isEsicEligible ?? (monthlyCtc <= 21000);
              const pfCap = emp.pfCappingOption || 'CAPPED_15000';

              return (
                <div
                  key={emp.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                          {emp.name}
                          <span className="text-[11px] font-normal px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {emp.gender || 'MALE'} • {emp.maritalStatus || 'SINGLE'}
                          </span>
                        </h4>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{emp.empCode}</span>
                          <span>•</span>
                          <span>{emp.designation}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-semibold">
                      {emp.status}
                    </span>
                  </div>

                  {/* Reporting Manager & Experience Highlight */}
                  <div className="flex flex-wrap items-center gap-2 text-xs bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Manager: <strong>{emp.reportingManagerName || 'Managing Director'}</strong></span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>{emp.workExperience?.totalExperienceYears ? `${emp.workExperience.totalExperienceYears} yrs exp` : 'Joined ' + (emp.dateOfJoining || '2024')}</span>
                    </div>
                    {emp.bloodGroup && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-rose-600 font-semibold">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{emp.bloodGroup}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Statutory Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {isPf ? (
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                        PF: Enrolled ({pfCap === 'CAPPED_15000' ? '₹15k Cap' : 'Actual Basic'})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 font-semibold">
                        PF: Opted Out (Form 11)
                      </span>
                    )}

                    {isEsic ? (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                        ESIC: Covered (Gross ≤ ₹21k)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        ESIC: Exempt ({monthlyCtc > 21000 ? '>₹21k Ceiling' : 'Excluded'})
                      </span>
                    )}

                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                      PT: {emp.statePt || 'Maharashtra'}
                    </span>
                  </div>

                  {/* Key Profile Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-gray-400">Monthly CTC:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white block">
                        ₹{(monthlyCtc || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">PAN / UAN:</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 block">
                        {emp.pan || 'N/A'} / {emp.uan || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Education / Degree:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 block truncate">
                        {emp.education?.qualification || 'Graduate / Professional'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tax Regime:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                        {taxRegime} Regime
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                      Annual CTC: <strong className="text-gray-800 dark:text-gray-200">₹{((monthlyCtc || 0) * 12).toLocaleString('en-IN')}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenProfileModal(emp)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        360° Profile
                      </button>
                      <button
                        onClick={() => handleOpenManageCtc(emp)}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Manage CTC
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Time, Attendance & LOP */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Monthly Attendance & Loss of Pay (LOP) Editor (Month {selectedMonth}/{selectedYear})
            </h3>
            <span className="text-xs text-gray-500">Calendar Days: 30</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3 font-semibold">Employee</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold text-center">Calendar Days</th>
                  <th className="p-3 font-semibold text-center">LOP (Unpaid Days)</th>
                  <th className="p-3 font-semibold text-center">Net Payable Days</th>
                  <th className="p-3 font-semibold text-center">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((emp) => {
                  const att = attendance.find((a) => a.employeeId === emp.id) || {
                    lopDays: 0,
                    presentDays: 30,
                    totalCalendarDays: 30,
                  };
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{emp.name}</td>
                      <td className="p-3 text-gray-500">{emp.department}</td>
                      <td className="p-3 text-center font-mono">30</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={att.lopDays}
                          onChange={(e) => handleUpdateLop(emp.id, parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border rounded text-center font-mono font-bold bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-rose-600"
                        />
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600">
                        {30 - att.lopDays}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          {[0, 1, 2, 3].map((days) => (
                            <button
                              key={days}
                              onClick={() => handleUpdateLop(emp.id, days)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                                att.lopDays === days
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {days === 0 ? 'Full (0 LOP)' : `${days} LOP`}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Statutory Compliance & EPFO ECR Hub */}
      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">EPFO Electronic Challan (ECR)</h3>
                  <p className="text-xs text-gray-500">Direct portal-ready #~# text file format</p>
                </div>
              </div>
              <button
                onClick={handleDownloadEcr}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download ECR File
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
              <div className="text-gray-400 font-semibold mb-2">ECR Preview Line:</div>
              <div>100902345678#~#PRIYA SHARMA#~#125000#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#0#~#0</div>
              <div>100908765432#~#RAJESH NAIR#~#175000#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#0#~#0</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">ESIC & PT Return Statements</h3>
                <p className="text-xs text-gray-500">Monthly statutory contribution schedules</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total ESIC IP Covered:</span>
                <span className="font-bold font-mono text-gray-900 dark:text-white">1 Employee (Amit Desai)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total ESIC Contribution (4%):</span>
                <span className="font-bold font-mono text-emerald-600">₹800.00</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Maharashtra PT Challan Total:</span>
                <span className="font-bold font-mono text-indigo-600">₹1,000.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Offer Letter & Candidate Onboarding Hub */}
      {activeTab === 'offers' && (
        <OfferLetterHub
          candidates={candidates}
          onAddCandidate={handleAddCandidate}
          onUpdateCandidateStatus={handleUpdateCandidateStatus}
          onConvertToEmployee={handleConvertToEmployee}
        />
      )}

      {/* TAB 6: Salary Revision & Performance Appraisals Hub */}
      {activeTab === 'revisions' && (
        <SalaryRevisionHub
          employees={employees}
          revisions={salaryRevisions}
          onApplyRevision={handleApplySalaryRevision}
        />
      )}

      {/* TAB 7: Full & Final (F&F) Exit Settlement Engine */}
      {activeTab === 'settlements' && (
        <FnFSettlementHub
          employees={employees}
          settlements={settlements}
          onCreateSettlement={handleCreateFnFSettlement}
          onUpdateSettlementStatus={handleUpdateSettlementStatus}
        />
      )}

      {/* TAB 8: Staff Loans & Salary Advance Deductions */}
      {activeTab === 'loans' && (
        <StaffLoansHub
          employees={employees}
          loans={staffLoans}
          onAddLoan={handleAddStaffLoan}
          onRecordRepayment={handleRecordLoanRepayment}
        />
      )}

      {/* MODAL 1: 360° Comprehensive Employee Profile View */}
      {selectedEmpForProfile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            {/* Header with Avatar and Basic Info */}
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
                  {selectedEmpForProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">{selectedEmpForProfile.name}</h2>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-semibold">
                      {selectedEmpForProfile.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <strong className="text-indigo-600 font-mono">{selectedEmpForProfile.empCode}</strong> • {selectedEmpForProfile.designation} • {selectedEmpForProfile.department}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                    <span>📧 {selectedEmpForProfile.officialEmail || 'N/A'}</span>
                    <span>📞 {selectedEmpForProfile.phone || 'N/A'}</span>
                    <span>📍 {selectedEmpForProfile.workLocation || 'Mumbai HQ'}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEmpForProfile(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <StandardTabs<'overview' | 'personal' | 'education' | 'experience' | 'statutory' | 'compensation'>
              size="sm"
              activeTab={profileModalTab}
              onChange={setProfileModalTab}
              tabs={[
                { id: 'overview', label: 'Overview & Role', icon: Users },
                { id: 'personal', label: 'Personal & Demographics', icon: Heart },
                { id: 'education', label: 'Education & Certifications', icon: GraduationCap },
                { id: 'experience', label: 'Experience & History', icon: Briefcase },
                { id: 'statutory', label: 'Emergency & KYC', icon: ShieldCheck },
                { id: 'compensation', label: 'Salary & Compensation', icon: DollarSign },
              ]}
            />

            {/* Tab: Overview & Role */}
            {profileModalTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Employment & Hierarchy
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedEmpForProfile.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Designation:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedEmpForProfile.designation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reporting Manager:</span>
                      <span className="font-bold text-indigo-600">{selectedEmpForProfile.reportingManagerName || 'Managing Director'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employment Type:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedEmpForProfile.employmentType || 'FULL_TIME'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Work Location:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedEmpForProfile.workLocation || 'Mumbai HQ (BKC)'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Tenure & Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Joining:</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">{selectedEmpForProfile.dateOfJoining || '2023-06-15'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Probation Period:</span>
                      <span className="font-semibold">{selectedEmpForProfile.probationPeriodMonths ?? 3} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Confirmation Date:</span>
                      <span className="font-semibold">{selectedEmpForProfile.dateOfConfirmation || 'Confirmed'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Notice Period:</span>
                      <span className="font-semibold">{selectedEmpForProfile.noticePeriodDays ?? 60} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Status:</span>
                      <span className="font-bold text-emerald-600">{selectedEmpForProfile.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Personal & Demographics */}
            {profileModalTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Demographics & Bio
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-mono font-bold">{selectedEmpForProfile.dateOfBirth || '1990-08-14'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-semibold">{selectedEmpForProfile.gender || 'MALE'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Marital Status:</span>
                      <span className="font-semibold">{selectedEmpForProfile.maritalStatus || 'SINGLE'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blood Group:</span>
                      <span className="font-bold text-rose-600">{selectedEmpForProfile.bloodGroup || 'O+'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Father / Spouse Name:</span>
                      <span className="font-semibold">{selectedEmpForProfile.fatherOrSpouseName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <PhoneCall className="w-4 h-4 text-indigo-600" />
                    Contact Coordinates
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mobile Phone:</span>
                      <span className="font-mono font-bold">{selectedEmpForProfile.phone || '+91 98201 12345'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Official Email:</span>
                      <span className="font-mono text-indigo-600">{selectedEmpForProfile.officialEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Personal Email:</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{selectedEmpForProfile.personalEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Education & Certifications */}
            {profileModalTab === 'education' && (
              <div className="space-y-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Academic Degrees & Qualifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block">Highest Degree / Degree:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {selectedEmpForProfile.education?.qualification || 'Master of Business Administration (MBA)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">University / Institute:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedEmpForProfile.education?.institution || 'Indian Institute of Management (IIM)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Year of Passing:</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {selectedEmpForProfile.education?.yearOfPassing || 2018}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Score / Distinction:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedEmpForProfile.education?.gradeOrPercentage || '8.8 CGPA (First Class Distinction)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    Professional Credentials & Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedEmpForProfile.education?.certifications && selectedEmpForProfile.education.certifications.length > 0) ? (
                      selectedEmpForProfile.education.certifications.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 font-semibold shadow-sm">
                          🎖️ {c}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 font-semibold shadow-sm">
                          🎖️ Certified Financial Professional
                        </span>
                        <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 font-semibold shadow-sm">
                          🎖️ Enterprise Cloud Practitioner
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Experience & History */}
            {profileModalTab === 'experience' && (
              <div className="space-y-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <History className="w-4 h-4 text-blue-600" />
                    Prior Work History & Track Record
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block">Total Work Experience:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        {selectedEmpForProfile.workExperience?.totalExperienceYears ? `${selectedEmpForProfile.workExperience.totalExperienceYears} Years` : '6.5 Years'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Previous Employer:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedEmpForProfile.workExperience?.previousEmployer || 'Tata Consultancy Services Ltd'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Previous Role / Title:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedEmpForProfile.workExperience?.previousDesignation || 'Senior Software Engineer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Previous Last Drawn CTC:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        ₹{(selectedEmpForProfile.workExperience?.previousLastDrawnCtc || 950000).toLocaleString('en-IN')}/year
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Emergency & Statutory KYC */}
            {profileModalTab === 'statutory' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Emergency Contact Person
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Name:</span>
                      <span className="font-bold">{selectedEmpForProfile.emergencyContact?.name || selectedEmpForProfile.fatherOrSpouseName || 'Next of Kin'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Relationship:</span>
                      <span className="font-semibold">{selectedEmpForProfile.emergencyContact?.relationship || 'Spouse / Parent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Emergency Phone:</span>
                      <span className="font-mono font-bold text-rose-600">{selectedEmpForProfile.emergencyContact?.phone || '+91 98201 99887'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Statutory & KYC Identifiers
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">PAN Number:</span>
                      <span className="font-mono font-bold text-indigo-600">{selectedEmpForProfile.pan || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Aadhaar (UIDAI):</span>
                      <span className="font-mono">{selectedEmpForProfile.aadhaar || '4532 8901 2345'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">EPFO UAN:</span>
                      <span className="font-mono">{selectedEmpForProfile.uan || '100902345678'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Account:</span>
                      <span className="font-mono truncate">{selectedEmpForProfile.bankName} ({selectedEmpForProfile.bankAccountNumber})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank IFSC:</span>
                      <span className="font-mono">{selectedEmpForProfile.bankIfsc}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Salary & Compensation */}
            {profileModalTab === 'compensation' && (
              <div className="space-y-4 text-xs">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] block font-bold">Annual Cost to Company (CTC)</span>
                    <span className="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
                      ₹{((selectedEmpForProfile.payStructure?.monthlyCtc || selectedEmpForProfile.monthlyCtc || 100000) * 12).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => { setSelectedEmpForProfile(null); handleOpenManageCtc(selectedEmpForProfile); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Open CTC & Salary Manager
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedEmpForProfile(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Employee Onboarding Wizard */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Onboard New Employee (Step {addEmpStep} of 4)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Enter complete personal, educational, employment, and statutory details</p>
              </div>
              <button onClick={() => setIsAddEmpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Step Navigation Pill Indicator */}
            <div className="flex gap-2 text-xs">
              {[
                { s: 1, label: '1. Personal & Bio' },
                { s: 2, label: '2. Role & Reporting' },
                { s: 3, label: '3. Education & Exp' },
                { s: 4, label: '4. Bank & Statutory' },
              ].map((step) => (
                <button
                  key={step.s}
                  type="button"
                  onClick={() => setAddEmpStep(step.s)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold transition text-[11px] ${
                    addEmpStep === step.s
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs pt-2">
              {/* Step 1: Personal & Demographics */}
              {addEmpStep === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">First Name</label>
                      <input
                        type="text"
                        value={newEmpForm.firstName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                        placeholder="e.g. Ramesh"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Last Name</label>
                      <input
                        type="text"
                        value={newEmpForm.lastName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                        placeholder="e.g. Kulkarni"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Gender</label>
                      <select
                        value={newEmpForm.gender}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, gender: e.target.value as any })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other / Non-Binary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Date of Birth</label>
                      <input
                        type="date"
                        value={newEmpForm.dateOfBirth}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, dateOfBirth: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Marital Status</label>
                      <select
                        value={newEmpForm.maritalStatus}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, maritalStatus: e.target.value as any })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      >
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                        <option value="DIVORCED">Divorced</option>
                        <option value="WIDOWED">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Blood Group</label>
                      <select
                        value={newEmpForm.bloodGroup}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, bloodGroup: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Father / Spouse Name</label>
                      <input
                        type="text"
                        value={newEmpForm.fatherOrSpouseName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, fatherOrSpouseName: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        placeholder="e.g. Suresh Kulkarni"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Official Email</label>
                      <input
                        type="email"
                        value={newEmpForm.officialEmail}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, officialEmail: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                        placeholder="ramesh@finstaq.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Personal Email</label>
                      <input
                        type="email"
                        value={newEmpForm.personalEmail}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, personalEmail: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        placeholder="ramesh.personal@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Contact Phone</label>
                      <input
                        type="text"
                        value={newEmpForm.phone}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono"
                        placeholder="+91 98200 00000"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Role, Reporting & Employment */}
              {addEmpStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Department</label>
                      <select
                        value={newEmpForm.department}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      >
                        <option value="Engineering & Product">Engineering & Product</option>
                        <option value="Marketing & Growth">Marketing & Growth</option>
                        <option value="Operations & Logistics">Operations & Logistics</option>
                        <option value="Client Projects">Client Projects</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Designation / Role</label>
                      <input
                        type="text"
                        value={newEmpForm.designation}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                        placeholder="e.g. Lead Backend Engineer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Reporting Manager</label>
                      <input
                        type="text"
                        value={newEmpForm.reportingManagerName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, reportingManagerName: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        placeholder="e.g. Rajesh Nair (VP Engineering)"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Date of Joining</label>
                      <input
                        type="date"
                        value={newEmpForm.dateOfJoining}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, dateOfJoining: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Employment Type</label>
                      <select
                        value={newEmpForm.employmentType}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, employmentType: e.target.value as any })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERN">Intern</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Work Location</label>
                      <input
                        type="text"
                        value={newEmpForm.workLocation}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, workLocation: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Notice Period (Days)</label>
                      <input
                        type="number"
                        value={newEmpForm.noticePeriodDays}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, noticePeriodDays: parseInt(e.target.value) || 60 })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Education & Work Experience */}
              {addEmpStep === 3 && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      Academic Education & Credentials
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Highest Degree</label>
                        <input
                          type="text"
                          value={newEmpForm.qualification}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, qualification: e.target.value })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          placeholder="e.g. B.Tech Computer Science / MBA"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">University / College</label>
                        <input
                          type="text"
                          value={newEmpForm.institution}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, institution: e.target.value })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          placeholder="e.g. IIT Bombay / Delhi University"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Year of Passing</label>
                        <input
                          type="number"
                          value={newEmpForm.yearOfPassing}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, yearOfPassing: parseInt(e.target.value) || 2020 })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Certifications (comma separated)</label>
                        <input
                          type="text"
                          value={newEmpForm.certifications}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, certifications: e.target.value })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          placeholder="e.g. AWS Certified, PMP, CA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      Prior Work Experience
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Total Exp (Years)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={newEmpForm.totalExperienceYears}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, totalExperienceYears: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Previous Employer</label>
                        <input
                          type="text"
                          value={newEmpForm.previousEmployer}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, previousEmployer: e.target.value })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          placeholder="e.g. Infosys Ltd"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 mb-1">Last Drawn CTC (₹)</label>
                        <input
                          type="number"
                          value={newEmpForm.previousLastDrawnCtc}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, previousLastDrawnCtc: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Bank, Identity & Statutory Schemes */}
              {addEmpStep === 4 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">PAN Number</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={newEmpForm.pan}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, pan: e.target.value.toUpperCase() })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Aadhaar (UIDAI)</label>
                      <input
                        type="text"
                        placeholder="4532 8901 2345"
                        value={newEmpForm.aadhaar}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, aadhaar: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">EPFO UAN</label>
                      <input
                        type="text"
                        placeholder="100902345678"
                        value={newEmpForm.uan}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, uan: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Monthly CTC (₹)</label>
                      <input
                        type="number"
                        value={newEmpForm.monthlyCtc}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, monthlyCtc: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono font-bold text-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Bank Name</label>
                      <input
                        type="text"
                        value={newEmpForm.bankName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, bankName: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1 font-medium">Account Number</label>
                      <input
                        type="text"
                        value={newEmpForm.bankAccountNumber}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, bankAccountNumber: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">EPF Scheme</span>
                        <input
                          type="checkbox"
                          checked={newEmpForm.isPfEligible}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, isPfEligible: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                      </div>
                      {newEmpForm.isPfEligible && (
                        <select
                          value={newEmpForm.pfCappingOption}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, pfCappingOption: e.target.value as any })}
                          className="w-full p-1 border rounded bg-white dark:bg-gray-800 text-[11px]"
                        >
                          <option value="CAPPED_15000">₹15,000 Wage Ceiling Cap (₹1,800/mo)</option>
                          <option value="ACTUAL_BASIC">Actual Basic Wage (12% uncapped)</option>
                        </select>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">ESIC Scheme</span>
                        <input
                          type="checkbox"
                          checked={newEmpForm.isEsicEligible}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, isEsicEligible: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {newEmpForm.monthlyCtc <= 21000 ? 'Gross ≤ ₹21,000 (Eligible for ESIC IP)' : 'Gross > ₹21,000 (Statutory Exemption)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Actions */}
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    if (addEmpStep > 1) setAddEmpStep(addEmpStep - 1);
                    else setIsAddEmpModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-xl"
                >
                  {addEmpStep > 1 ? 'Previous Step' : 'Cancel'}
                </button>

                {addEmpStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setAddEmpStep(addEmpStep + 1)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete & Onboard Employee
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage & Revise Employee CTC & Statutory Rules */}
      {isManageCtcModalOpen && selectedEmpForCtc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                    CTC & Statutory Rules Manager
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Configure EPF opt-out/capping, ESIC coverage, state PT, and live auto-breakdown across salary heads.
                </p>
              </div>
              <button onClick={() => setIsManageCtcModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Employee Meta Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3 text-xs">
              <div>
                <span className="text-gray-400 block">Employee:</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedEmpForCtc.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Employee Code:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{selectedEmpForCtc.empCode}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Department & Role:</span>
                <span className="text-gray-800 dark:text-gray-200">{selectedEmpForCtc.department} • {selectedEmpForCtc.designation}</span>
              </div>
              <div>
                <span className="text-gray-400 block">PAN / Bank:</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">{selectedEmpForCtc.pan || 'N/A'} • {selectedEmpForCtc.bankName || 'Bank'}</span>
              </div>
            </div>

            {/* Quick Revision Presets */}
            <div className="space-y-1.5 text-xs">
              <span className="text-gray-500 font-semibold uppercase text-[10px] tracking-wider">Quick CTC Presets & Increments:</span>
              <div className="flex flex-wrap gap-2">
                {[600000, 960000, 1200000, 1500000, 1800000, 2100000, 2400000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleCtcSliderChange(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      revisedAnnualCtc === preset
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    ₹{(preset / 100000).toFixed(1)} LPA
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCtcSliderChange(Math.round(revisedAnnualCtc * 1.10))}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
                >
                  +10% Hike
                </button>
                <button
                  type="button"
                  onClick={() => handleCtcSliderChange(Math.round(revisedAnnualCtc * 1.15))}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
                >
                  +15% Hike
                </button>
                <button
                  type="button"
                  onClick={() => handleCtcSliderChange(Math.round(revisedAnnualCtc * 1.20))}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
                >
                  +20% Hike
                </button>
              </div>
            </div>

            {/* Annual CTC Input & Range Slider */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                    Revised Annual Cost to Company (CTC)
                  </label>
                  <span className="text-[11px] text-gray-500">
                    Monthly CTC Equivalent: <strong className="text-indigo-600 font-mono">₹{Math.round(revisedAnnualCtc / 12).toLocaleString('en-IN')}/month</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500 font-mono">₹</span>
                  <input
                    type="number"
                    step="25000"
                    min="180000"
                    max="10000000"
                    value={revisedAnnualCtc}
                    onChange={(e) => handleCtcSliderChange(parseFloat(e.target.value) || 0)}
                    className="p-2 border rounded-lg bg-white dark:bg-gray-900 border-indigo-300 dark:border-indigo-700 font-mono font-bold text-base text-gray-900 dark:text-white w-44 text-right shadow-inner"
                  />
                </div>
              </div>

              <input
                type="range"
                min="300000"
                max="5000000"
                step="25000"
                value={revisedAnnualCtc}
                onChange={(e) => handleCtcSliderChange(parseInt(e.target.value) || 300000)}
                className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Statutory Configuration Controls */}
            <div className="bg-slate-50 dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Statutory Scheme Rules & Configurations
                </span>
                <span className="text-[11px] text-gray-500">Toggles dynamically update take-home pay and CTC allocation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. EPF Scheme */}
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">EPF Scheme</span>
                    <button
                      type="button"
                      onClick={() => handleTogglePf(!revisedIsPfEligible)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                        revisedIsPfEligible
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {revisedIsPfEligible ? 'Enrolled' : 'Opted Out (Form 11)'}
                    </button>
                  </div>

                  {revisedIsPfEligible ? (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block">EPF Wage Ceiling</label>
                      <div className="space-y-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="pfCap"
                            checked={revisedPfCappingOption === 'CAPPED_15000'}
                            onChange={() => handlePfCappingChange('CAPPED_15000')}
                            className="text-indigo-600"
                          />
                          <span>₹15,000 Cap (₹1,800/mo)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="pfCap"
                            checked={revisedPfCappingOption === 'ACTUAL_BASIC'}
                            onChange={() => handlePfCappingChange('ACTUAL_BASIC')}
                            className="text-indigo-600"
                          />
                          <span>Actual Basic (12% uncapped)</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      💡 Employer PF (12%) is redirected into Special Allowance, keeping total CTC whole.
                    </div>
                  )}
                </div>

                {/* 2. ESIC Scheme */}
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">ESIC Scheme</span>
                    <button
                      type="button"
                      onClick={() => handleToggleEsic(!revisedIsEsicEligible)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        revisedIsEsicEligible && (revisedCtcBreakdown?.grossSalaryMonthly || Math.round(revisedAnnualCtc / 12)) <= 21000
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {revisedIsEsicEligible ? 'Covered' : 'Exempt'}
                    </button>
                  </div>

                  <div className="pt-1">
                    {(revisedAnnualCtc / 12) > 21000 ? (
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded text-[11px] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                        🛡️ <strong>Statutory Exemption:</strong> Gross exceeds ₹21,000/month threshold under ESI Act.
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded text-[11px] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        ✅ <strong>ESIC Applicable:</strong> Gross ≤ ₹21,000/mo (EE: 0.75%, ER: 3.25%).
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Professional Tax (PT) */}
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Professional Tax (PT)</span>
                    <button
                      type="button"
                      onClick={() => setRevisedIsPtEligible(!revisedIsPtEligible)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        revisedIsPtEligible
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {revisedIsPtEligible ? 'Applicable' : 'Exempt'}
                    </button>
                  </div>

                  <div className="pt-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">State Jurisdiction</label>
                    <select
                      value={revisedPtState}
                      onChange={(e) => setRevisedPtState(e.target.value)}
                      className="w-full p-1.5 border rounded bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                    >
                      <option value="MAHARASHTRA">Maharashtra (₹200/mo, ₹300 Feb)</option>
                      <option value="KARNATAKA">Karnataka (₹200/mo)</option>
                      <option value="TELANGANA">Telangana (₹200/mo)</option>
                      <option value="DELHI">Delhi (₹0 - No PT)</option>
                      <option value="TAMIL_NADU">Tamil Nadu (Slab-based)</option>
                      <option value="GUJARAT">Gujarat (₹200/mo)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Column CTC Component Auto-Breakdown */}
            {revisedCtcBreakdown && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Column 1: Gross Salary Constituents */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span>Earnings (Gross Wages)</span>
                  </div>

                  <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Basic Salary (40%):</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">₹{(revisedCtcBreakdown.basicSalary || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA (50% Basic):</span>
                      <span className="font-mono text-gray-900 dark:text-white">₹{(revisedCtcBreakdown.hra || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conveyance Allowance:</span>
                      <span className="font-mono text-gray-900 dark:text-white">₹{(revisedCtcBreakdown.conveyanceAllowance || 1600).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medical Allowance:</span>
                      <span className="font-mono text-gray-900 dark:text-white">₹{(revisedCtcBreakdown.medicalAllowance || 1250).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Allowance:</span>
                      <span className="font-mono font-semibold text-indigo-600">₹{(revisedCtcBreakdown.specialAllowance || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Monthly Gross Pay:</span>
                    <span className="font-mono text-indigo-600">₹{(revisedCtcBreakdown.grossSalaryMonthly || Math.round(revisedAnnualCtc / 12 * 0.94)).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Column 2: Employer Benefits & Statutory */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Employer Statutory Cost</span>
                  </div>

                  <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Employer EPF (12%):</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {revisedIsPfEligible ? `₹${((revisedCtcBreakdown.employerPf || 0) + (revisedCtcBreakdown.employerEps || 0) + (revisedCtcBreakdown.employerEdliAndAdmin || 0) || 1950).toLocaleString('en-IN')}` : '₹0 (Opted Out)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employer ESIC (3.25%):</span>
                      <span className="font-mono text-gray-900 dark:text-white">{revisedCtcBreakdown.employerEsic > 0 ? `₹${revisedCtcBreakdown.employerEsic}` : '₹0 (Exempt)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gratuity Provision (4.81%):</span>
                      <span className="font-mono text-gray-900 dark:text-white">₹{Math.round((revisedCtcBreakdown.basicSalary || 0) * 0.0481).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance & Admin:</span>
                      <span className="font-mono text-gray-900 dark:text-white">₹150</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Total Employer Cost:</span>
                    <span className="font-mono text-blue-600">₹{Math.round(revisedAnnualCtc / 12).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Column 3: In-Hand / Take-Home Estimator */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Estimated Take-Home Pay</span>
                    </div>

                    <div className="space-y-1.5 text-gray-600 dark:text-gray-300 mt-2">
                      <div className="flex justify-between text-rose-600">
                        <span>Employee EPF (12%):</span>
                        <span className="font-mono">
                          {revisedIsPfEligible ? `-₹${Math.round((revisedPfCappingOption === 'CAPPED_15000' ? Math.min(revisedCtcBreakdown.basicSalary || 0, 15000) : (revisedCtcBreakdown.basicSalary || 0)) * 0.12).toLocaleString('en-IN')}` : '₹0 (Opted Out)'}
                        </span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Professional Tax (PT):</span>
                        <span className="font-mono">
                          {revisedIsPtEligible && revisedPtState !== 'DELHI' ? '-₹200' : '₹0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Est. Monthly TDS:</span>
                        <span className="font-mono">-₹{Math.round(Math.max(0, (revisedAnnualCtc - 775000) * 0.15 / 12)).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                      Estimated Monthly In-Hand
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 block mt-0.5">
                      ₹{getManageCtcTakeHome().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Regime Selector */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Income Tax Regime for TDS Withholding</span>
                <span className="text-[11px] text-gray-500">New Regime includes ₹75,000 standard deduction and Section 87A rebate.</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRevisedTaxRegime('NEW')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    revisedTaxRegime === 'NEW'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                  }`}
                >
                  New Regime (115BAC)
                </button>
                <button
                  type="button"
                  onClick={() => setRevisedTaxRegime('OLD')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    revisedTaxRegime === 'OLD'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                  }`}
                >
                  Old Regime (80C / HRA)
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsManageCtcModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCtcRevision}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save & Apply CTC Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Run & Execute Payroll */}
      {isRunPayrollModalOpen && previewData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Confirm & Execute Payroll (Month {selectedMonth}/{selectedYear})
              </h3>
              <button onClick={() => setIsRunPayrollModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Employees to Process:</span>
                <span className="font-bold">{previewData.summary.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Payroll Amount:</span>
                <span className="font-bold font-mono">₹{(previewData.summary.totalGrossPayroll || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Total Deductions:</span>
                <span className="font-bold">₹{(previewData.summary.totalDeductions || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold border-t pt-2 text-sm">
                <span>Net Disbursement:</span>
                <span>₹{(previewData.summary.totalNetPay || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRunPayrollModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePayroll}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
              >
                Execute & Post Journal Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Interactive Payslip */}
      {isPayslipModalOpen && payslipData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-y-auto font-sans">
            {/* Payslip Header */}
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-wide">
                  {payslipData.companyName || 'FINSTAQ ENTERPRISES'}
                </h2>
                <p className="text-xs text-gray-500">{payslipData.companyAddress || ''}</p>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  PAYSLIP FOR {(payslipData.payrollMonth || '').toUpperCase()}
                </div>
              </div>
              <button onClick={() => setIsPayslipModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Employee Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-gray-400">Employee Name:</span>
                <span className="font-bold text-gray-900 dark:text-white block">{payslipData.employee?.name || ''}</span>
              </div>
              <div>
                <span className="text-gray-400">Employee Code / Dept:</span>
                <span className="font-mono text-gray-900 dark:text-white block">
                  {payslipData.employee?.empCode || ''} • {payslipData.employee?.department || ''}
                </span>
              </div>
              <div>
                <span className="text-gray-400">PAN / UAN:</span>
                <span className="font-mono text-gray-900 dark:text-white block">
                  {payslipData.employee?.pan || 'N/A'} / {payslipData.employee?.uan || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bank Account / IFSC:</span>
                <span className="font-mono text-gray-900 dark:text-white block truncate">
                  {payslipData.employee?.bankAccountNumber || 'N/A'} ({payslipData.employee?.bankIfsc || ''})
                </span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white border-b pb-1 text-sm text-indigo-600">
                  Earnings
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span className="font-mono font-bold">₹{(payslipData.lineItem?.earnedBasic || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA:</span>
                    <span className="font-mono">₹{(payslipData.lineItem?.earnedHra || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conveyance Allowance:</span>
                    <span className="font-mono">₹{(payslipData.lineItem?.earnedConveyance || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Allowance:</span>
                    <span className="font-mono">₹{(payslipData.lineItem?.earnedMedical || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Allowance:</span>
                    <span className="font-mono">₹{(payslipData.lineItem?.earnedSpecialAllowance || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Gross Earnings:</span>
                  <span className="font-mono text-indigo-600">₹{(payslipData.lineItem?.grossEarnings || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white border-b pb-1 text-sm text-rose-600">
                  Deductions
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Employee EPF (12%):</span>
                    <span className="font-mono text-rose-600">
                      {(payslipData.lineItem?.employeePf || 0) > 0 ? `₹${(payslipData.lineItem?.employeePf || 0).toLocaleString('en-IN')}` : '₹0 (Opted Out)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee ESIC (0.75%):</span>
                    <span className="font-mono text-rose-600">
                      {(payslipData.lineItem?.employeeEsic || 0) > 0 ? `₹${(payslipData.lineItem?.employeeEsic || 0).toLocaleString('en-IN')}` : '₹0 (Exempt)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax (PT):</span>
                    <span className="font-mono text-rose-600">₹{(payslipData.lineItem?.professionalTax || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax (TDS):</span>
                    <span className="font-mono text-rose-600">₹{(payslipData.lineItem?.tdsAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-rose-600">₹{(payslipData.lineItem?.totalDeductions || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Salary Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block uppercase tracking-wider">
                  Net Take-Home Pay
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400">
                  Disbursed directly to registered salary bank account
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                ₹{(payslipData.lineItem?.netTakeHome || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-center border-t border-gray-100 dark:border-gray-800 pt-3">
              This is a computer-generated payslip under FINSTAQ Cloud ERP and does not require a physical signature.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
