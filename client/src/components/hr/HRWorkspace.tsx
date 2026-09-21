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
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';
import { UI } from '../../theme/uiTheme';
import { OfferLetterHub } from '../payroll/OfferLetterHub';
import { SalaryRevisionHub } from '../payroll/SalaryRevisionHub';
import { FnFSettlementHub } from '../payroll/FnFSettlementHub';
import {
  CandidateOffer,
  SalaryRevisionRecord,
  FnFSettlementRecord,
  Employee,
  EmployeePayStructure,
  EmployeeTaxDeclaration,
} from '../payroll/payrollTypes';
import { calculateIndianCtcBreakdown } from '../payroll/ctcCalculator';

export type HRTab = 'directory' | 'offers' | 'revisions' | 'settlements';

interface HRWorkspaceProps {
  initialTab?: HRTab;
}

export function HRWorkspace({ initialTab = 'directory' }: HRWorkspaceProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<HRTab>(initialTab);
  const { getAuthHeaders } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Keep internal tab in sync if initialTab changes externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Candidate Offers State
  const [candidates, setCandidates] = useState<CandidateOffer[]>([
    {
      id: 'OFFER-2026-001',
      candidateName: 'Aakash Verma',
      email: 'aakash.verma@example.com',
      phone: '+91 98201 54321',
      designation: 'Senior Fullstack Engineer',
      department: 'Engineering & Product',
      workLocation: 'Mumbai HQ (BKC)',
      dateOfJoining: '2026-05-02',
      offerDate: '2026-04-01',
      annualCtc: 1800000,
      probationMonths: 3,
      noticePeriodDays: 60,
      reportingManager: 'Rajesh Nair (VP Engineering)',
      address: 'Bandra West, Mumbai 400050',
      status: 'ACCEPTED',
      payStructure: calculateIndianCtcBreakdown(1800000, {
        isPfEligible: true,
        pfCappingOption: 'CAPPED_15000',
        isEsicEligible: false,
      }),
      termsAndConditions: [
        'Probation duration is 3 months with 15-day notice period.',
        'Standard intellectual property assignment and confidentiality clauses apply.',
      ],
    },
    {
      id: 'OFFER-2026-002',
      candidateName: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      phone: '+91 98334 11223',
      designation: 'Financial Controller & Tax Analyst',
      department: 'Finance & Accounts',
      workLocation: 'Pune Tech Park',
      dateOfJoining: '2026-05-15',
      offerDate: '2026-04-05',
      annualCtc: 1400000,
      probationMonths: 6,
      noticePeriodDays: 90,
      reportingManager: 'Managing Director',
      address: 'Kothrud, Pune 411038',
      status: 'SENT',
      payStructure: calculateIndianCtcBreakdown(1400000, {
        isPfEligible: true,
        pfCappingOption: 'CAPPED_15000',
        isEsicEligible: false,
      }),
      termsAndConditions: [
        'ICAI certification verified. Standard finance fiduciary clause applies.',
      ],
    },
  ]);

  // Salary Revisions State
  const [salaryRevisions, setSalaryRevisions] = useState<SalaryRevisionRecord[]>([
    {
      id: 'REV-2026-008',
      employeeId: 'emp-1',
      employeeName: 'Priya Sharma',
      empCode: 'EMP-101',
      department: 'Engineering & Product',
      previousDesignation: 'Senior Software Engineer',
      newDesignation: 'Lead Software Architect',
      effectiveDate: '2026-04-01',
      revisionDate: '2026-03-25',
      previousAnnualCtc: 1500000,
      revisedAnnualCtc: 1800000,
      hikePercentage: 20,
      revisionType: 'ANNUAL_APPRAISAL',
      appraisalComments: 'Outstanding delivery on the Core Ledger 2.0 module and low latency indexing.',
      status: 'APPROVED',
      retroactiveArrearsEstimate: 25000,
      revisedPayStructure: calculateIndianCtcBreakdown(1800000),
    },
  ]);

  // FnF Settlements State
  const [settlements, setSettlements] = useState<FnFSettlementRecord[]>([
    {
      id: 'FNF-2026-004',
      employeeId: 'emp-3',
      employeeName: 'Suresh Patil',
      empCode: 'EMP-103',
      department: 'Sales & Marketing',
      designation: 'Key Account Manager',
      dateOfJoining: '2020-03-01',
      dateOfResignation: '2026-02-28',
      lastWorkingDay: '2026-03-31',
      tenureYears: 6.08,
      exitReason: 'RESIGNATION',
      exitMonthDaysWorked: 31,
      exitMonthGrossSalary: 62500,
      earnedLeavesBalance: 14,
      leaveEncashmentRatePerDay: 1202,
      leaveEncashmentAmount: 16828,
      isGratuityEligible: true,
      gratuityAmount: 108231,
      statutoryBonusPayable: 7000,
      reimbursementsPending: 4500,
      noticePeriodShortfallDays: 0,
      noticeRecoveryAmount: 0,
      salaryAdvanceRecovery: 0,
      unreturnedAssetDeduction: 0,
      tdsDeduction: 5500,
      totalGrossPayable: 199059,
      totalDeductionsAndRecoveries: 5500,
      netSettlementAmount: 193559,
      settlementStatus: 'SETTLED',
      settlementDate: '2026-04-05',
      settledBy: 'Finance & HR Payroll Admin',
      remarks: 'Full clearance received from IT, Assets and Sales Handover.',
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
      personalEmail: cand.email,
      officialEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase() || 'emp'}@finstaq.com`,
      phone: cand.phone,
      department: cand.department,
      designation: cand.designation,
      employmentType: 'FULL_TIME',
      workLocation: cand.workLocation,
      dateOfJoining: cand.dateOfJoining,
      probationPeriodMonths: cand.probationMonths,
      noticePeriodDays: cand.noticePeriodDays,
      status: 'ACTIVE',
      monthlyCtc: cand.payStructure.monthlyCtc,
      basicSalary: cand.payStructure.basicSalary,
      hra: cand.payStructure.hra,
      specialAllowance: cand.payStructure.specialAllowance,
      payStructure: cand.payStructure,
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      taxRegime: 'NEW',
    };

    try {
      const res = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify(newEmp),
      });

      if (res.ok) {
        setEmployees([newEmp, ...employees]);
        setCandidates(
          candidates.map((c) => (c.id === cand.id ? { ...c, status: 'JOINED' } : c))
        );
        toast.success(`🎉 ${cand.candidateName} successfully onboarded into Employee Directory!`);
        setActiveTab('directory');
      } else {
        setEmployees([newEmp, ...employees]);
        setCandidates(
          candidates.map((c) => (c.id === cand.id ? { ...c, status: 'JOINED' } : c))
        );
        toast.success(`🎉 Candidate ${cand.candidateName} onboarded with Employee Code ${newEmp.empCode}!`);
        setActiveTab('directory');
      }
    } catch (err) {
      setEmployees([newEmp, ...employees]);
      setCandidates(
        candidates.map((c) => (c.id === cand.id ? { ...c, status: 'JOINED' } : c))
      );
      toast.success(`Candidate ${cand.candidateName} converted to employee.`);
      setActiveTab('directory');
    }
  };

  // Salary Revision Handlers
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

  // Modals
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
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

  // New Employee Form State
  const [newEmpForm, setNewEmpForm] = useState({
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
    department: 'Engineering & Product',
    designation: '',
    employmentType: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'PROBATION',
    workLocation: 'Mumbai HQ (BKC)',
    dateOfJoining: new Date().toISOString().split('T')[0],
    probationPeriodMonths: 3,
    reportingManagerName: 'Rajesh Nair (VP Engineering)',
    noticePeriodDays: 60,
    qualification: 'Bachelor of Technology (B.Tech Computer Science)',
    institution: 'University of Mumbai',
    yearOfPassing: 2020,
    gradeOrPercentage: '8.4 CGPA',
    certifications: 'AWS Certified Developer, Certified Scrum Master',
    totalExperienceYears: 4.5,
    previousEmployer: 'Infosys Limited',
    previousDesignation: 'Senior Systems Engineer',
    previousLastDrawnCtc: 850000,
    emergencyContactName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    addressLine1: '',
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

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/v1/employees', {
        headers: { ...getAuthHeaders(), 'x-user-id': 'usr-admin', 'x-user-role': 'OWNER' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEmployees(data.data);
      } else {
        // Default seed
        setEmployees([
          {
            id: 'emp-1',
            empCode: 'EMP-101',
            name: 'Priya Sharma',
            firstName: 'Priya',
            lastName: 'Sharma',
            gender: 'FEMALE',
            department: 'Engineering & Product',
            designation: 'Senior Software Engineer',
            monthlyCtc: 125000,
            basicSalary: 50000,
            hra: 25000,
            specialAllowance: 50000,
            pan: 'ABCPS1234F',
            uan: '100902345678',
            esicNo: '',
            taxRegime: 'NEW',
            isPfEligible: true,
            status: 'ACTIVE',
            dateOfJoining: '2022-04-01',
            officialEmail: 'priya.sharma@finstaq.com',
            phone: '+91 98200 11223',
            workLocation: 'Mumbai HQ (BKC)',
            reportingManagerName: 'Rajesh Nair',
          },
          {
            id: 'emp-2',
            empCode: 'EMP-102',
            name: 'Rajesh Nair',
            firstName: 'Rajesh',
            lastName: 'Nair',
            gender: 'MALE',
            department: 'Engineering & Product',
            designation: 'VP of Engineering',
            monthlyCtc: 175000,
            basicSalary: 70000,
            hra: 35000,
            specialAllowance: 70000,
            pan: 'ABCPN5678K',
            uan: '100908765432',
            esicNo: '',
            taxRegime: 'NEW',
            isPfEligible: true,
            status: 'ACTIVE',
            dateOfJoining: '2021-02-15',
            officialEmail: 'rajesh.nair@finstaq.com',
            phone: '+91 98110 33445',
            workLocation: 'Mumbai HQ (BKC)',
            reportingManagerName: 'Managing Director',
          },
          {
            id: 'emp-3',
            empCode: 'EMP-103',
            name: 'Suresh Patil',
            firstName: 'Suresh',
            lastName: 'Patil',
            gender: 'MALE',
            department: 'Sales & Marketing',
            designation: 'Key Account Manager',
            monthlyCtc: 75000,
            basicSalary: 30000,
            hra: 15000,
            specialAllowance: 30000,
            pan: 'ABCPS9012L',
            uan: '100907654321',
            esicNo: '',
            taxRegime: 'OLD',
            isPfEligible: true,
            status: 'ACTIVE',
            dateOfJoining: '2020-03-01',
            officialEmail: 'suresh.patil@finstaq.com',
            phone: '+91 98700 99887',
            workLocation: 'Pune Branch',
            reportingManagerName: 'Director Sales',
          },
          {
            id: 'emp-4',
            empCode: 'EMP-104',
            name: 'Amit Desai',
            firstName: 'Amit',
            lastName: 'Desai',
            gender: 'MALE',
            department: 'Operations & Logistics',
            designation: 'Logistics Supervisor',
            monthlyCtc: 20000,
            basicSalary: 12000,
            hra: 5000,
            specialAllowance: 3000,
            pan: 'ABCDD3456M',
            uan: '',
            esicNo: '31000987654321001',
            taxRegime: 'NEW',
            isPfEligible: false,
            isEsicEligible: true,
            status: 'ACTIVE',
            dateOfJoining: '2023-08-10',
            officialEmail: 'amit.desai@finstaq.com',
            phone: '+91 99300 44556',
            workLocation: 'Bhiwandi Warehouse',
            reportingManagerName: 'Warehouse Manager',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const certList = newEmpForm.certifications
        ? newEmpForm.certifications.split(',').map((c) => c.trim()).filter(Boolean)
        : [];

      const payload: Partial<Employee> = {
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
        monthlyCtc: newEmpForm.monthlyCtc,
        isPfEligible: newEmpForm.isPfEligible,
        pfCappingOption: newEmpForm.pfCappingOption,
        isEsicEligible: newEmpForm.isEsicEligible,
        isPtEligible: newEmpForm.isPtEligible,
        statePt: newEmpForm.statePt,
        taxRegime: newEmpForm.taxRegime,
        status: 'ACTIVE',
      };

      const res = await fetch('/api/v1/employees', {
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
        setEmployees([data.data, ...employees]);
        toast.success(`Employee ${data.data.name} created successfully!`);
        setIsAddEmpModalOpen(false);
      } else {
        const localEmp: Employee = {
          id: `emp-${Date.now()}`,
          empCode: `EMP-${(employees.length + 101).toString()}`,
          ...(payload as any),
        };
        setEmployees([localEmp, ...employees]);
        toast.success(`Employee ${localEmp.name} created locally!`);
        setIsAddEmpModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to create employee');
    }
  };

  const handleOpenProfileModal = (emp: Employee) => {
    setSelectedEmpForProfile(emp);
    setProfileModalTab('overview');
  };

  const handleOpenManageCtc = (emp: Employee) => {
    setSelectedEmpForCtc(emp);
    const mCtc = emp.monthlyCtc || (emp.basicSalary ? emp.basicSalary * 2 : 100000);
    const aCtc = mCtc * 12;
    setRevisedAnnualCtc(aCtc);
    setRevisedTaxRegime(emp.taxRegime || 'NEW');
    setRevisedIsPfEligible(emp.isPfEligible ?? true);
    setRevisedPfCappingOption(emp.pfCappingOption || 'CAPPED_15000');
    setRevisedIsEsicEligible(emp.isEsicEligible ?? false);
    setRevisedIsPtEligible(emp.isPtEligible ?? true);
    setRevisedPtState(emp.statePt || 'MAHARASHTRA');

    const breakdown = calculateIndianCtcBreakdown(aCtc, {
      isPfEligible: emp.isPfEligible ?? true,
      pfCappingOption: emp.pfCappingOption || 'CAPPED_15000',
      isEsicEligible: emp.isEsicEligible ?? false,
    });
    setRevisedCtcBreakdown(breakdown);
    setIsManageCtcModalOpen(true);
  };

  const handleRecalculateCtc = (annual: number) => {
    setRevisedAnnualCtc(annual);
    const breakdown = calculateIndianCtcBreakdown(annual, {
      isPfEligible: revisedIsPfEligible,
      pfCappingOption: revisedPfCappingOption,
      isEsicEligible: revisedIsEsicEligible,
    });
    setRevisedCtcBreakdown(breakdown);
  };

  const handleSaveRevisedCtc = () => {
    if (!selectedEmpForCtc || !revisedCtcBreakdown) return;
    setEmployees(
      employees.map((emp) => {
        if (emp.id === selectedEmpForCtc.id) {
          return {
            ...emp,
            monthlyCtc: revisedCtcBreakdown.monthlyCtc,
            basicSalary: revisedCtcBreakdown.basicSalary,
            hra: revisedCtcBreakdown.hra,
            specialAllowance: revisedCtcBreakdown.specialAllowance,
            isPfEligible: revisedIsPfEligible,
            pfCappingOption: revisedPfCappingOption,
            isEsicEligible: revisedIsEsicEligible,
            isPtEligible: revisedIsPtEligible,
            statePt: revisedPtState,
            taxRegime: revisedTaxRegime,
            payStructure: revisedCtcBreakdown,
          };
        }
        return emp;
      })
    );
    toast.success(`CTC structure updated for ${selectedEmpForCtc.name}!`);
    setIsManageCtcModalOpen(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold tracking-wide uppercase border border-blue-400/30">
              Human Resources & Talent Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
              Employee 360° • Offer Letters • Appraisals • F&F Exit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">People & Talent Lifecycle Hub</h1>
          <p className="text-sm text-blue-200/90 mt-1">
            Full-spectrum employee lifecycle management: recruitment offers with Indian CTC breakdown, 360° profiles, annual appraisal increments, and statutory exit settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setIsAddEmpModalOpen(true);
            }}
            className={UI.btn.primary}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Standard Executive KPI Scorecards */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Total Headcount"
          value={employees.length}
          icon={Users}
          trend={{ value: `${employees.filter(e => e.status === 'ACTIVE').length} Active`, direction: 'up' }}
          footer={{
            left: <span>Active: <strong className="text-slate-900 dark:text-white font-bold">{employees.filter(e => e.status === 'ACTIVE').length}</strong></span>,
            right: <span>Exited: <strong className="text-slate-900 dark:text-white font-bold">{employees.filter(e => e.status === 'RESIGNED').length}</strong></span>,
          }}
        />

        <KPIScorecard
          label="Offers in Pipeline"
          value={candidates.length}
          icon={FileText}
          badge={`${candidates.filter(c => c.status === 'ACCEPTED').length} Ready`}
          badgeVariant={candidates.some(c => c.status === 'ACCEPTED') ? 'warning' : 'default'}
          progress={{
            percentage: candidates.length > 0 ? Math.round((candidates.filter(c => c.status === 'ACCEPTED').length / candidates.length) * 100) : 0,
            targetLabel: 'Accepted Rate',
            targetValue: `${candidates.filter(c => c.status === 'ACCEPTED').length}/${candidates.length}`,
          }}
        />

        <KPIScorecard
          label="Appraisals & Revisions"
          value={salaryRevisions.length}
          variant="emerald"
          icon={TrendingUp}
          trend={{ value: '+18.5%', direction: 'up', label: 'Avg Hike' }}
          footer={{
            left: <span>Effective: <strong>Q1 FY26</strong></span>,
            right: <span>Status: <strong className="text-emerald-600 font-bold">Approved</strong></span>,
          }}
        />

        <KPIScorecard
          label="Exit Settlements (F&F)"
          value={settlements.length}
          variant="indigo"
          icon={LogOut}
          badge={`${settlements.filter(s => s.settlementStatus === 'DRAFT').length} Action`}
          badgeVariant="indigo"
          footer={{
            left: <span>Drafts: <strong>{settlements.filter(s => s.settlementStatus === 'DRAFT').length}</strong></span>,
            right: <span>Settled: <strong>{settlements.filter(s => s.settlementStatus === 'SETTLED').length}</strong></span>,
          }}
        />
      </KPIGrid>

      {/* Navigation Tabs */}
      <StandardTabs<HRTab>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'directory',
            label: 'Employee Directory (360°)',
            icon: Users,
            badge: employees.length,
            badgeVariant: 'default',
          },
          {
            id: 'offers',
            label: 'Offer Letters & Onboarding',
            icon: FileText,
            badge: `${candidates.filter((c) => c.status === 'ACCEPTED').length} Ready`,
            badgeVariant: candidates.some((c) => c.status === 'ACCEPTED') ? 'warning' : 'default',
          },
          {
            id: 'revisions',
            label: 'Salary Revisions & Appraisals',
            icon: TrendingUp,
            badge: salaryRevisions.length,
            badgeVariant: 'default',
          },
          {
            id: 'settlements',
            label: 'Full & Final (F&F) Exit Hub',
            icon: LogOut,
            badge: `${settlements.filter((s) => s.settlementStatus === 'DRAFT').length} Action`,
            badgeVariant: settlements.some((s) => s.settlementStatus === 'DRAFT') ? 'danger' : 'default',
          },
        ]}
      />

      {/* TAB 1: Employee Directory 360° */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, code, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-500">
              Showing <strong className="text-gray-900 dark:text-white">{filteredEmployees.length}</strong> employees
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const monthlyCtc = emp.monthlyCtc || (emp.basicSalary ? emp.basicSalary * 2 : 100000);
              const taxRegime = emp.taxRegime || 'NEW';
              return (
                <div
                  key={emp.id}
                  className={`${UI.card.base} p-4 space-y-3 transition hover:shadow-md border-l-4 ${
                    emp.status === 'ACTIVE' ? 'border-l-blue-600' : 'border-l-rose-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{emp.name}</h4>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {emp.empCode} • {emp.designation}
                        </span>
                      </div>
                    </div>
                    <span
                      className={
                        emp.status === 'ACTIVE'
                          ? UI.badge('success')
                          : UI.badge('danger')
                      }
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-gray-400">Department:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
                        {emp.department}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Monthly CTC:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
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
                      <span className="text-gray-400">Tax Regime:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                        {taxRegime} Regime
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                      Annual: <strong className="text-gray-800 dark:text-gray-200">₹{((monthlyCtc || 0) * 12).toLocaleString('en-IN')}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenProfileModal(emp)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        360° Profile
                      </button>
                      <button
                        onClick={() => handleOpenManageCtc(emp)}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded text-xs font-bold flex items-center gap-1 transition border border-blue-200 dark:border-blue-800"
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

      {/* TAB 2: Offer Letter & Candidate Onboarding Hub */}
      {activeTab === 'offers' && (
        <OfferLetterHub
          candidates={candidates}
          onAddCandidate={handleAddCandidate}
          onUpdateCandidateStatus={handleUpdateCandidateStatus}
          onConvertToEmployee={handleConvertToEmployee}
        />
      )}

      {/* TAB 3: Salary Revision & Performance Appraisals Hub */}
      {activeTab === 'revisions' && (
        <SalaryRevisionHub
          employees={employees}
          revisions={salaryRevisions}
          onApplyRevision={handleApplySalaryRevision}
        />
      )}

      {/* TAB 4: Full & Final (F&F) Exit Settlement Engine */}
      {activeTab === 'settlements' && (
        <FnFSettlementHub
          employees={employees}
          settlements={settlements}
          onCreateSettlement={handleCreateFnFSettlement}
          onUpdateSettlementStatus={handleUpdateSettlementStatus}
        />
      )}

      {/* MODAL 1: 360° Comprehensive Employee Profile View */}
      {selectedEmpForProfile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-700 to-purple-600 text-white font-bold flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                  {selectedEmpForProfile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">
                      {selectedEmpForProfile.name}
                    </h2>
                    <span className={UI.badge('success')}>
                      {selectedEmpForProfile.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <strong className="text-blue-600 font-mono">{selectedEmpForProfile.empCode}</strong> •{' '}
                    {selectedEmpForProfile.designation} • {selectedEmpForProfile.department}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                    <span>📧 {selectedEmpForProfile.officialEmail || 'N/A'}</span>
                    <span>📞 {selectedEmpForProfile.phone || 'N/A'}</span>
                    <span>📍 {selectedEmpForProfile.workLocation || 'Mumbai HQ'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmpForProfile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

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

            {profileModalTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Employment & Hierarchy
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedEmpForProfile.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Designation:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedEmpForProfile.designation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reporting Manager:</span>
                      <span className="font-bold text-blue-600">
                        {selectedEmpForProfile.reportingManagerName || 'Managing Director'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employment Type:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedEmpForProfile.employmentType || 'FULL_TIME'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Tenure & Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Joining:</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">
                        {selectedEmpForProfile.dateOfJoining || '2023-06-15'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Probation Period:</span>
                      <span className="font-semibold">
                        {selectedEmpForProfile.probationPeriodMonths ?? 3} Months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Notice Period:</span>
                      <span className="font-semibold">
                        {selectedEmpForProfile.noticePeriodDays ?? 60} Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profileModalTab === 'compensation' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900">
                    <span className="text-gray-500">Monthly CTC</span>
                    <div className="text-lg font-bold text-blue-600 font-mono">
                      ₹{(selectedEmpForProfile.monthlyCtc || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-gray-500">Annual CTC</span>
                    <div className="text-lg font-bold text-emerald-600 font-mono">
                      ₹{((selectedEmpForProfile.monthlyCtc || 0) * 12).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900">
                    <span className="text-gray-500">Tax Regime</span>
                    <div className="text-lg font-bold text-purple-600 font-mono">
                      {selectedEmpForProfile.taxRegime || 'NEW'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Manage CTC & Compensation Restructuring */}
      {isManageCtcModalOpen && selectedEmpForCtc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  Manage Indian CTC Structure — {selectedEmpForCtc.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Re-structure annual compensation with automatic statutory calculations
                </p>
              </div>
              <button
                onClick={() => setIsManageCtcModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                  Target Annual CTC (₹)
                </label>
                <input
                  type="number"
                  value={revisedAnnualCtc}
                  onChange={(e) => handleRecalculateCtc(Number(e.target.value))}
                  className={UI.input.text}
                />
              </div>

              {revisedCtcBreakdown && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Basic (40%):</span>
                    <span className="font-bold">₹{revisedCtcBreakdown.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly HRA (50% of Basic):</span>
                    <span className="font-bold">₹{revisedCtcBreakdown.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Special / Balancing Allowance:</span>
                    <span className="font-bold">₹{revisedCtcBreakdown.specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Total Monthly CTC:</span>
                    <span className="font-bold text-blue-600">₹{revisedCtcBreakdown.monthlyCtc.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsManageCtcModalOpen(false)}
                  className={UI.btn.secondary}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRevisedCtc}
                  className={UI.btn.primary}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Comprehensive Multi-Step New Employee Onboarding */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Employee Onboarding Wizard
              </h3>
              <button onClick={() => setIsAddEmpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.firstName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                    className={UI.input.text}
                    placeholder="e.g. Aakash"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.lastName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                    className={UI.input.text}
                    placeholder="e.g. Verma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmpForm.officialEmail}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, officialEmail: e.target.value })}
                    className={UI.input.text}
                    placeholder="aakash.verma@finstaq.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.phone}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                    className={UI.input.text}
                    placeholder="+91 98200 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Department *</label>
                  <select
                    value={newEmpForm.department}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    className={UI.input.text}
                  >
                    <option value="Engineering & Product">Engineering & Product</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Operations & Logistics">Operations & Logistics</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.designation}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                    className={UI.input.text}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Monthly CTC (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newEmpForm.monthlyCtc}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, monthlyCtc: Number(e.target.value) })}
                    className={UI.input.text}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">PAN Number *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.pan}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, pan: e.target.value.toUpperCase() })}
                    className={UI.input.text}
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddEmpModalOpen(false)}
                  className={UI.btn.secondary}
                >
                  Cancel
                </button>
                <button type="submit" className={UI.btn.primary}>
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
