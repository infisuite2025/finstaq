import { prisma } from '../../../core/database/prisma';
import { numberToIndianWords } from '../../banking/services/cheque.service';

export interface EmployeeAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface EmployeeEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface EmployeeEducation {
  qualification: string; // e.g. "B.Tech Computer Science", "Chartered Accountant (ICAI)", "MBA Finance"
  institution: string; // e.g. "IIT Bombay", "IIM Ahmedabad", "Delhi University"
  yearOfPassing: number; // e.g. 2018
  gradeOrPercentage?: string; // e.g. "8.8 CGPA" or "84%"
  certifications?: string[]; // e.g. ["AWS Certified Solutions Architect", "Scrum Master (CSM)"]
}

export interface EmployeeWorkExperience {
  totalExperienceYears: number; // e.g. 6.5
  previousEmployer: string; // e.g. "Tata Consultancy Services Ltd"
  previousDesignation: string; // e.g. "Senior Software Engineer"
  previousEmploymentPeriod?: string; // e.g. "June 2020 - March 2024"
  previousLastDrawnCtc?: number; // e.g. 950000
}

export interface EmployeePayStructure {
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
  
  // Employer Statutory Breakdown
  employerPf: number;
  employerEps: number;
  employerEdliAndAdmin: number;
  employerEsic: number;
  gratuityMonthly: number;
  statutoryBonusMonthly: number;
  totalEmployerMonthlyCost: number;
}

export interface EmployeeTaxDeclaration {
  taxRegime: 'NEW' | 'OLD';
  section80C: number; // Max 1,50,000
  section80D: number; // Health Insurance (Self/Parents)
  section24bHomeLoanInterest: number; // Max 2,00,000
  npsSection80CCD1B: number; // Max 50,000
  monthlyRentPaid: number;
  isMetroCityHra: boolean;
  otherIncomeOrLoss: number;
}

export interface Employee {
  id: string;
  tenantId: string;
  empCode: string; // Auto-generated e.g. FIN-2026-0001
  autoSequenceNumber: number;
  
  // Personal Details
  firstName: string;
  lastName: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  bloodGroup?: string;
  fatherOrSpouseName: string;
  personalEmail: string;
  officialEmail: string;
  phone: string;
  emergencyContact: EmployeeEmergencyContact;
  currentAddress: EmployeeAddress;
  permanentAddress: EmployeeAddress;

  // Identity & Statutory IDs
  pan: string;
  aadhaar: string;
  uan?: string;
  pfMemberId?: string;
  esicNo?: string;
  passportNumber?: string;
  drivingLicense?: string;

  // Education & Work Experience
  education?: EmployeeEducation;
  workExperience?: EmployeeWorkExperience;

  // Employment Details
  department: string;
  designation: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'PROBATION';
  workLocation: string; // e.g. "Mumbai HQ", "Bangalore Tech Park", "Delhi NCR"
  dateOfJoining: string;
  probationPeriodMonths: number;
  dateOfConfirmation?: string;
  reportingManagerName?: string;
  noticePeriodDays: number;
  status: 'ACTIVE' | 'PROBATION' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';

  // Bank & Payout
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountType: 'SALARY' | 'SAVINGS' | 'CURRENT';
  payoutMode: 'DIRECT_DEPOSIT_NEFT' | 'IMPS' | 'CHEQUE';

  // Statutory Preferences
  isPfEligible: boolean;
  pfCappingOption: 'CAPPED_15000' | 'ACTUAL_BASIC';
  isEsicEligible: boolean;
  isPtEligible: boolean;
  statePt: 'MAHARASHTRA' | 'KARNATAKA' | 'DELHI' | 'TAMIL_NADU' | 'TELANGANA' | 'WEST_BENGAL' | 'GUJARAT';
  isLwfEligible: boolean;

  // Pay Structure & Tax Declaration
  payStructure: EmployeePayStructure;
  taxDeclaration: EmployeeTaxDeclaration;
  
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  month: number;
  year: number;
  totalCalendarDays: number;
  presentDays: number;
  paidLeaves: number;
  lopDays: number;
  overtimeHours: number;
}

export interface PayrollLineItem {
  employeeId: string;
  empCode: string;
  name: string;
  department: string;
  designation: string;
  bankAccountNumber: string;
  bankIfsc: string;
  payoutMode: string;
  totalDays: number;
  payableDays: number;
  lopDays: number;
  
  // Earnings
  earnedBasic: number;
  earnedHra: number;
  earnedConveyance: number;
  earnedMedical: number;
  earnedSpecialAllowance: number;
  earnedChildrenEdu: number;
  overtimePay: number;
  performanceBonus: number;
  grossEarnings: number;

  // Statutory & Other Deductions
  employeePf: number;
  employeeEsic: number;
  professionalTax: number;
  lwfDeduction: number;
  tdsTax: number;
  totalDeductions: number;

  // Net Salary
  netPayable: number;
  netPayableInWords: string;

  // Employer Contributions
  employerPf: number;
  employerEps: number;
  employerEdliAndAdmin: number;
  employerEsic: number;
  gratuityMonthly: number;
  totalEmployerCost: number;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  payrollMonth: string;
  month: number;
  year: number;
  runDate: string;
  status: 'DRAFT' | 'PROCESSED' | 'PAID';
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalPfLiability: number;
  totalEsicLiability: number;
  totalPtLiability: number;
  totalTdsLiability: number;
  totalCompanyCost: number;
  voucherNumber?: string;
  journalVoucherId?: string;
  items: PayrollLineItem[];
}

async function getTenantEmployees(tenantId: string = 'tenant-default-01'): Promise<Employee[]> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_EMPLOYEES' } }
    });
    if (record && record.value && Array.isArray(record.value)) {
      return record.value as unknown as Employee[];
    }
  } catch (e) {}
  const init = getInitialEmployees(safeTenantId);
  try {
    await prisma.keyValueStore.upsert({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_EMPLOYEES' } },
      update: { value: init as any },
      create: { tenantId: safeTenantId, key: 'PAYROLL_EMPLOYEES', value: init as any }
    });
  } catch (e) {}
  return init;
}

async function saveTenantEmployees(tenantId: string = 'tenant-default-01', employees: Employee[]): Promise<void> {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_EMPLOYEES' } },
    update: { value: employees as any },
    create: { tenantId: safeTenantId, key: 'PAYROLL_EMPLOYEES', value: employees as any }
  });
}

async function getTenantAttendance(tenantId: string = 'tenant-default-01'): Promise<AttendanceRecord[]> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_ATTENDANCE' } }
    });
    if (record && record.value && Array.isArray(record.value)) {
      return record.value as unknown as AttendanceRecord[];
    }
  } catch (e) {}
  return [];
}

async function saveTenantAttendance(tenantId: string = 'tenant-default-01', records: AttendanceRecord[]): Promise<void> {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_ATTENDANCE' } },
    update: { value: records as any },
    create: { tenantId: safeTenantId, key: 'PAYROLL_ATTENDANCE', value: records as any }
  });
}

async function getTenantPayrollRuns(tenantId: string = 'tenant-default-01'): Promise<PayrollRun[]> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_RUNS' } }
    });
    if (record && record.value && Array.isArray(record.value)) {
      return record.value as unknown as PayrollRun[];
    }
  } catch (e) {}
  return [];
}

async function saveTenantPayrollRuns(tenantId: string = 'tenant-default-01', runs: PayrollRun[]): Promise<void> {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: 'PAYROLL_RUNS' } },
    update: { value: runs as any },
    create: { tenantId: safeTenantId, key: 'PAYROLL_RUNS', value: runs as any }
  });
}

/**
 * Auto CTC Breakdown Engine
 */
export function buildPayStructure(
  annualCtc: number,
  isPfEligible: boolean = true,
  pfCappingOption: 'CAPPED_15000' | 'ACTUAL_BASIC' = 'CAPPED_15000',
  isEsicEligible?: boolean
): EmployeePayStructure {
  const monthlyCtc = Math.round(annualCtc / 12);
  const basicSalary = Math.round(monthlyCtc * 0.40);
  const hra = Math.round(basicSalary * 0.50);
  const conveyanceAllowance = 1600;
  const medicalAllowance = 1250;
  const childrenEducationAllowance = 200; // 100 per child for up to 2 children
  const performanceBonusMonthly = 0;

  // Employer Contributions
  let employerPf = 0;
  let employerEps = 0;
  let employerEdliAndAdmin = 0;
  let employerPfTotal = 0;

  if (isPfEligible) {
    const pfWage = pfCappingOption === 'CAPPED_15000' ? Math.min(basicSalary, 15000) : basicSalary;
    employerPf = Math.round(pfWage * 0.0367);
    employerEps = Math.round(pfWage * 0.0833);
    employerEdliAndAdmin = Math.round(pfWage * 0.01);
    employerPfTotal = employerPf + employerEps + employerEdliAndAdmin;
  }

  let employerEsic = 0;
  const esicEligible = isEsicEligible !== undefined ? isEsicEligible : (monthlyCtc <= 21000);
  if (esicEligible && monthlyCtc <= 21000) {
    employerEsic = Math.ceil(monthlyCtc * 0.0325);
  }

  const gratuityMonthly = Math.round((basicSalary * 15) / (26 * 12)); // 4.81% of basic
  const statutoryBonusMonthly = Math.round(basicSalary * 0.0833);

  const employerAdditions = employerPfTotal + employerEsic + gratuityMonthly;
  const grossSalaryMonthly = Math.max(0, monthlyCtc - employerAdditions);

  // Special Allowance balances out the remaining gross
  const fixedComponents = basicSalary + hra + conveyanceAllowance + medicalAllowance + childrenEducationAllowance;
  const specialAllowance = Math.max(0, grossSalaryMonthly - fixedComponents);

  return {
    annualCtc,
    monthlyCtc,
    basicSalary,
    hra,
    conveyanceAllowance,
    medicalAllowance,
    specialAllowance,
    childrenEducationAllowance,
    performanceBonusMonthly,
    grossSalaryMonthly,
    employerPf,
    employerEps,
    employerEdliAndAdmin,
    employerEsic,
    gratuityMonthly,
    statutoryBonusMonthly,
    totalEmployerMonthlyCost: monthlyCtc,
  };
}

/**
 * Auto-Generates the next sequential Employee Code (e.g. FIN-2026-0001)
 */
function getNextEmpCode(list: Employee[], prefix: string = 'FIN-2026'): { empCode: string; autoSequenceNumber: number } {
  let maxSeq = 0;
  for (const emp of list) {
    if (emp.autoSequenceNumber && emp.autoSequenceNumber > maxSeq) {
      maxSeq = emp.autoSequenceNumber;
    }
  }
  const nextSeq = maxSeq + 1;
  const empCode = `${prefix}-${String(nextSeq).padStart(4, '0')}`;
  return { empCode, autoSequenceNumber: nextSeq };
}

function getInitialEmployees(tenantId: string): Employee[] {
  const e1Ctc = 1500000;
  const e2Ctc = 2100000;
  const e3Ctc = 250000;
  const e4Ctc = 1080000;

  return [
    {
      id: 'emp-001',
      tenantId,
      empCode: 'FIN-2026-0001',
      autoSequenceNumber: 1,
      firstName: 'Priya',
      lastName: 'Sharma',
      name: 'Priya Sharma',
      gender: 'FEMALE',
      dateOfBirth: '1990-08-14',
      maritalStatus: 'MARRIED',
      bloodGroup: 'B+',
      fatherOrSpouseName: 'Rohan Sharma',
      personalEmail: 'priya.sharma90@gmail.com',
      officialEmail: 'priya.sharma@finstaq.com',
      phone: '+91 98201 12345',
      emergencyContact: {
        name: 'Rohan Sharma',
        relationship: 'Spouse',
        phone: '+91 98201 99887',
      },
      currentAddress: {
        addressLine1: 'Flat 802, Palm Heights, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400076',
        country: 'India',
      },
      permanentAddress: {
        addressLine1: 'Flat 802, Palm Heights, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400076',
        country: 'India',
      },
      pan: 'ABCPS1234F',
      aadhaar: '4532 8901 2345',
      uan: '100902345678',
      pfMemberId: 'MH/BAN/0045678/000/0001001',
      department: 'Marketing & Growth',
      designation: 'VP Marketing',
      employmentType: 'FULL_TIME',
      workLocation: 'Mumbai HQ (BKC)',
      dateOfJoining: '2023-06-15',
      probationPeriodMonths: 3,
      dateOfConfirmation: '2023-09-15',
      reportingManagerName: 'Managing Director',
      noticePeriodDays: 60,
      status: 'ACTIVE',
      bankName: 'HDFC Bank Ltd',
      bankAccountNumber: '50100234567890',
      bankIfsc: 'HDFC0000123',
      bankAccountType: 'SALARY',
      payoutMode: 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: false,
      isPtEligible: true,
      statePt: 'MAHARASHTRA',
      isLwfEligible: true,
      payStructure: buildPayStructure(e1Ctc),
      taxDeclaration: {
        taxRegime: 'NEW',
        section80C: 150000,
        section80D: 25000,
        section24bHomeLoanInterest: 0,
        npsSection80CCD1B: 0,
        monthlyRentPaid: 45000,
        isMetroCityHra: true,
        otherIncomeOrLoss: 0,
      },
      createdAt: '2023-06-15T10:00:00.000Z',
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'emp-002',
      tenantId,
      empCode: 'FIN-2026-0002',
      autoSequenceNumber: 2,
      firstName: 'Rajesh',
      lastName: 'Nair',
      name: 'Rajesh Nair',
      gender: 'MALE',
      dateOfBirth: '1987-11-22',
      maritalStatus: 'MARRIED',
      bloodGroup: 'O+',
      fatherOrSpouseName: 'K. V. Nair',
      personalEmail: 'rajesh.nair87@gmail.com',
      officialEmail: 'rajesh.nair@finstaq.com',
      phone: '+91 98202 23456',
      emergencyContact: {
        name: 'Sunita Nair',
        relationship: 'Spouse',
        phone: '+91 98202 88776',
      },
      currentAddress: {
        addressLine1: 'Villa 14, Prestige Enclave, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        country: 'India',
      },
      permanentAddress: {
        addressLine1: 'Villa 14, Prestige Enclave, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        country: 'India',
      },
      pan: 'BCDPN5678G',
      aadhaar: '6743 9012 3456',
      uan: '100908765432',
      pfMemberId: 'KN/BNG/0098765/000/0002002',
      department: 'Engineering & Product',
      designation: 'Principal Architect',
      employmentType: 'FULL_TIME',
      workLocation: 'Bangalore Tech Park',
      dateOfJoining: '2022-03-01',
      probationPeriodMonths: 3,
      dateOfConfirmation: '2022-06-01',
      reportingManagerName: 'Chief Technology Officer',
      noticePeriodDays: 90,
      status: 'ACTIVE',
      bankName: 'ICICI Bank Ltd',
      bankAccountNumber: '001205678901',
      bankIfsc: 'ICIC0000012',
      bankAccountType: 'SALARY',
      payoutMode: 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: false,
      isPtEligible: true,
      statePt: 'KARNATAKA',
      isLwfEligible: true,
      payStructure: buildPayStructure(e2Ctc),
      taxDeclaration: {
        taxRegime: 'NEW',
        section80C: 150000,
        section80D: 50000,
        section24bHomeLoanInterest: 200000,
        npsSection80CCD1B: 50000,
        monthlyRentPaid: 50000,
        isMetroCityHra: true,
        otherIncomeOrLoss: 0,
      },
      createdAt: '2022-03-01T10:00:00.000Z',
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'emp-003',
      tenantId,
      empCode: 'FIN-2026-0003',
      autoSequenceNumber: 3,
      firstName: 'Amit',
      lastName: 'Desai',
      name: 'Amit Desai',
      gender: 'MALE',
      dateOfBirth: '1995-04-10',
      maritalStatus: 'SINGLE',
      bloodGroup: 'A+',
      fatherOrSpouseName: 'Suresh Desai',
      personalEmail: 'amit.desai95@gmail.com',
      officialEmail: 'amit.desai@finstaq.com',
      phone: '+91 98203 34567',
      emergencyContact: {
        name: 'Suresh Desai',
        relationship: 'Father',
        phone: '+91 98203 77665',
      },
      currentAddress: {
        addressLine1: 'Room 12, Shree Ram Niwas, Thane West',
        city: 'Thane',
        state: 'Maharashtra',
        pincode: '400601',
        country: 'India',
      },
      permanentAddress: {
        addressLine1: 'Room 12, Shree Ram Niwas, Thane West',
        city: 'Thane',
        state: 'Maharashtra',
        pincode: '400601',
        country: 'India',
      },
      pan: 'CDEPA9012H',
      aadhaar: '8912 3456 7890',
      uan: '100903456789',
      pfMemberId: 'MH/THN/0012345/000/0003003',
      esicNo: '31000987654321',
      department: 'Operations & Logistics',
      designation: 'Warehouse & Stores Lead',
      employmentType: 'FULL_TIME',
      workLocation: 'Bhiwandi Central Stores',
      dateOfJoining: '2024-01-10',
      probationPeriodMonths: 6,
      dateOfConfirmation: '2024-07-10',
      reportingManagerName: 'Operations Head',
      noticePeriodDays: 30,
      status: 'ACTIVE',
      bankName: 'State Bank of India',
      bankAccountNumber: '30456789012',
      bankIfsc: 'SBIN0000456',
      bankAccountType: 'SAVINGS',
      payoutMode: 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: true,
      isPtEligible: true,
      statePt: 'MAHARASHTRA',
      isLwfEligible: true,
      payStructure: buildPayStructure(e3Ctc),
      taxDeclaration: {
        taxRegime: 'NEW',
        section80C: 0,
        section80D: 0,
        section24bHomeLoanInterest: 0,
        npsSection80CCD1B: 0,
        monthlyRentPaid: 8000,
        isMetroCityHra: false,
        otherIncomeOrLoss: 0,
      },
      createdAt: '2024-01-10T10:00:00.000Z',
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'emp-004',
      tenantId,
      empCode: 'FIN-2026-0004',
      autoSequenceNumber: 4,
      firstName: 'Sneha',
      lastName: 'Patel',
      name: 'Sneha Patel',
      gender: 'FEMALE',
      dateOfBirth: '1992-02-18',
      maritalStatus: 'SINGLE',
      bloodGroup: 'AB+',
      fatherOrSpouseName: 'Kirit Patel',
      personalEmail: 'sneha.patel92@gmail.com',
      officialEmail: 'sneha.patel@finstaq.com',
      phone: '+91 98204 45678',
      emergencyContact: {
        name: 'Kirit Patel',
        relationship: 'Father',
        phone: '+91 98204 66554',
      },
      currentAddress: {
        addressLine1: 'B-404, Green Acres, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        country: 'India',
      },
      permanentAddress: {
        addressLine1: 'B-404, Green Acres, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        country: 'India',
      },
      pan: 'DEFPS3456J',
      aadhaar: '1234 5678 9012',
      uan: '100904567890',
      pfMemberId: 'MH/BAN/0045678/000/0004004',
      department: 'Client Projects',
      designation: 'Project Lead - Cloud Solutions',
      employmentType: 'FULL_TIME',
      workLocation: 'Mumbai HQ (BKC)',
      dateOfJoining: '2023-11-20',
      probationPeriodMonths: 3,
      dateOfConfirmation: '2024-02-20',
      reportingManagerName: 'Delivery Head',
      noticePeriodDays: 60,
      status: 'ACTIVE',
      bankName: 'Axis Bank Ltd',
      bankAccountNumber: '912010045678901',
      bankIfsc: 'UTIB0000789',
      bankAccountType: 'SALARY',
      payoutMode: 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: false,
      isPtEligible: true,
      statePt: 'MAHARASHTRA',
      isLwfEligible: true,
      payStructure: buildPayStructure(e4Ctc),
      taxDeclaration: {
        taxRegime: 'NEW',
        section80C: 150000,
        section80D: 25000,
        section24bHomeLoanInterest: 0,
        npsSection80CCD1B: 0,
        monthlyRentPaid: 32000,
        isMetroCityHra: true,
        otherIncomeOrLoss: 0,
      },
      createdAt: '2023-11-20T10:00:00.000Z',
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'emp-005',
      tenantId,
      empCode: 'FIN-2026-0005',
      autoSequenceNumber: 5,
      firstName: 'Arjun',
      lastName: 'Venkatesh',
      name: 'Arjun Venkatesh',
      gender: 'MALE',
      dateOfBirth: '1993-07-15',
      maritalStatus: 'SINGLE',
      bloodGroup: 'B+',
      fatherOrSpouseName: 'S. Venkatesh',
      personalEmail: 'arjun.venkat93@gmail.com',
      officialEmail: 'arjun.venkatesh@finstaq.com',
      phone: '+91 98205 56789',
      emergencyContact: {
        name: 'S. Venkatesh',
        relationship: 'Father',
        phone: '+91 98205 99112',
      },
      currentAddress: {
        addressLine1: 'Flat 302, Cyber Heights, Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        country: 'India',
      },
      permanentAddress: {
        addressLine1: 'Flat 302, Cyber Heights, Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        country: 'India',
      },
      pan: 'BVGPA1234K',
      aadhaar: '8901 2345 6789',
      uan: '100905678901',
      pfMemberId: 'TS/HYD/0056789/000/0005005',
      department: 'Engineering & Product',
      designation: 'Staff Software Engineer',
      employmentType: 'FULL_TIME',
      workLocation: 'Hyderabad Tech Hub',
      dateOfJoining: '2023-01-15',
      probationPeriodMonths: 3,
      dateOfConfirmation: '2023-04-15',
      reportingManagerName: 'Principal Architect',
      noticePeriodDays: 60,
      status: 'ACTIVE',
      bankName: 'Kotak Mahindra Bank',
      bankAccountNumber: '451234567890',
      bankIfsc: 'KKBK0000123',
      bankAccountType: 'SALARY',
      payoutMode: 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: false,
      isPtEligible: true,
      statePt: 'TELANGANA',
      isLwfEligible: true,
      payStructure: buildPayStructure(1800000),
      taxDeclaration: {
        taxRegime: 'NEW',
        section80C: 150000,
        section80D: 25000,
        section24bHomeLoanInterest: 0,
        npsSection80CCD1B: 0,
        monthlyRentPaid: 35000,
        isMetroCityHra: true,
        otherIncomeOrLoss: 0,
      },
      createdAt: '2023-01-15T10:00:00.000Z',
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'emp-006',
      tenantId,
      empCode: 'FIN-2026-0006',
      autoSequenceNumber: 6,
      firstName: 'Kavita',
      lastName: 'Sundaram',
      name: 'Kavita Sundaram',
      gender: 'FEMALE',
      dateOfBirth: '1991-09-05',
      maritalStatus: 'MARRIED',
      bloodGroup: 'O-',
      fatherOrSpouseName: 'Anand Sundaram',
      personalEmail: 'kavita.sundaram@gmail.com',
      officialEmail: 'kavita.sundaram@finstaq.com',
      phone: '+91 98206 67890',
      emergencyContact: {
        name: 'Anand Sundaram',
        relationship: 'Spouse',
        phone: '+91 98206 11223',
      },
      currentAddress: {
        addressLine1: 'B-102, Shanti Vihar, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
      },
      permanentAddress: {
        addressLine1: 'B-102, Shanti Vihar, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
      },
      pan: 'KAVPS9876L',
      aadhaar: '9012 3456 7890',
      uan: '100906789012',
      pfMemberId: 'KN/BNG/0067890/000/0006006',
      department: 'Marketing & Growth',
      designation: 'Talent & People Operations Lead',
      employmentType: 'FULL_TIME',
      workLocation: 'Bangalore Tech Park',
      dateOfJoining: '2024-02-01',
      probationPeriodMonths: 3,
      dateOfConfirmation: '2024-05-01',
      reportingManagerName: 'VP People',
      noticePeriodDays: 30,
      status: 'ACTIVE',
      bankName: 'HDFC Bank Ltd',
      bankAccountNumber: '50100678901234',
      bankIfsc: 'HDFC0000123',
      bankAccountType: 'SALARY',
      payoutMode: 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: true,
      pfCappingOption: 'CAPPED_15000',
      isEsicEligible: false,
      isPtEligible: true,
      statePt: 'KARNATAKA',
      isLwfEligible: true,
      payStructure: buildPayStructure(1320000),
      taxDeclaration: {
        taxRegime: 'NEW',
        section80C: 150000,
        section80D: 25000,
        section24bHomeLoanInterest: 0,
        npsSection80CCD1B: 0,
        monthlyRentPaid: 28000,
        isMetroCityHra: true,
        otherIncomeOrLoss: 0,
      },
      createdAt: '2024-02-01T10:00:00.000Z',
      updatedAt: '2026-04-01T10:00:00.000Z',
    },
  ];
}

export class PayrollService {
  public static async listEmployees(tenantId: string, department?: string): Promise<Employee[]> {
    const list = await getTenantEmployees(tenantId);
    if (department && department !== 'ALL') {
      return list.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }
    return list;
  }

  public static async getEmployeeById(tenantId: string, id: string): Promise<Employee | undefined> {
    const list = await getTenantEmployees(tenantId);
    return list.find((e) => e.id === id || e.empCode === id);
  }

  public static async saveEmployee(tenantId: string, payload: Partial<Employee> & { monthlyCtc?: number; annualCtc?: number }): Promise<Employee> {
    const list = await getTenantEmployees(tenantId);
    
    // Auto-calculate pay structure from annualCtc or monthlyCtc with PF and ESIC eligibility
    const annualCtc = payload.annualCtc || payload.payStructure?.annualCtc || (payload.payStructure?.monthlyCtc ? payload.payStructure.monthlyCtc * 12 : (payload.monthlyCtc ? payload.monthlyCtc * 12 : 600000));
    const isPfEligible = payload.isPfEligible !== undefined ? payload.isPfEligible : (payload.payStructure?.employerPf !== 0);
    const pfCappingOption = payload.pfCappingOption || 'CAPPED_15000';
    const isEsicEligible = payload.isEsicEligible;
    const payStructure = buildPayStructure(annualCtc, isPfEligible, pfCappingOption, isEsicEligible);

    // If existing ID provided
    if (payload.id) {
      const idx = list.findIndex((e) => e.id === payload.id);
      if (idx >= 0) {
        const existing = list[idx];
        const updated: Employee = {
          ...existing,
          ...payload,
          name: payload.name || `${payload.firstName || existing.firstName} ${payload.lastName || existing.lastName}`.trim(),
          payStructure: { ...existing.payStructure, ...payStructure, ...(payload.payStructure || {}) },
          updatedAt: new Date().toISOString(),
        };
        list[idx] = updated;
        await saveTenantEmployees(tenantId, list);
        return updated;
      }
    }

    // Deduplicate by PAN or Email if already exists for this tenant
    const existingByPan = payload.pan ? list.find((e) => e.pan?.toUpperCase() === payload.pan?.toUpperCase()) : null;
    const existingByEmail = payload.officialEmail ? list.find((e) => e.officialEmail?.toLowerCase() === payload.officialEmail?.toLowerCase()) : null;
    const existingMatch = existingByPan || existingByEmail;
    if (existingMatch) {
      const idx = list.findIndex((e) => e.id === existingMatch.id);
      const updated: Employee = {
        ...existingMatch,
        ...payload,
        name: payload.name || `${payload.firstName || existingMatch.firstName} ${payload.lastName || existingMatch.lastName}`.trim(),
        payStructure: { ...existingMatch.payStructure, ...payStructure, ...(payload.payStructure || {}) },
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      await saveTenantEmployees(tenantId, list);
      return updated;
    }

    const { empCode, autoSequenceNumber } = getNextEmpCode(list);
    const firstName = payload.firstName || 'New';
    const lastName = payload.lastName || 'Employee';

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      tenantId,
      empCode: payload.empCode || empCode,
      autoSequenceNumber,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      gender: payload.gender || 'MALE',
      dateOfBirth: payload.dateOfBirth || '1995-01-01',
      maritalStatus: payload.maritalStatus || 'SINGLE',
      bloodGroup: payload.bloodGroup || 'O+',
      fatherOrSpouseName: payload.fatherOrSpouseName || '',
      personalEmail: payload.personalEmail || '',
      officialEmail: payload.officialEmail || '',
      phone: payload.phone || '',
      emergencyContact: payload.emergencyContact || { name: '', relationship: 'Spouse', phone: '' },
      currentAddress: payload.currentAddress || { addressLine1: '', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      permanentAddress: payload.permanentAddress || { addressLine1: '', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      pan: (payload.pan || 'AAAAA0000A').toUpperCase(),
      aadhaar: payload.aadhaar || '0000 0000 0000',
      uan: payload.uan,
      pfMemberId: payload.pfMemberId,
      esicNo: payload.esicNo,
      passportNumber: payload.passportNumber,
      drivingLicense: payload.drivingLicense,
      education: payload.education || {
        qualification: 'Bachelor of Engineering (B.E.)',
        institution: 'University of Mumbai',
        yearOfPassing: 2020,
        gradeOrPercentage: '8.4 CGPA',
        certifications: ['Certified Professional Specialist'],
      },
      workExperience: payload.workExperience || {
        totalExperienceYears: 3.5,
        previousEmployer: 'Previous Tech Enterprises',
        previousDesignation: 'Associate Specialist',
        previousEmploymentPeriod: '2021 - 2024',
        previousLastDrawnCtc: 650000,
      },
      department: payload.department || 'Engineering & Product',
      designation: payload.designation || 'Member Technical Staff',
      employmentType: payload.employmentType || 'FULL_TIME',
      workLocation: payload.workLocation || 'Mumbai HQ',
      dateOfJoining: payload.dateOfJoining || new Date().toISOString().split('T')[0],
      probationPeriodMonths: payload.probationPeriodMonths ?? 3,
      dateOfConfirmation: payload.dateOfConfirmation,
      reportingManagerName: payload.reportingManagerName,
      noticePeriodDays: payload.noticePeriodDays ?? 60,
      status: payload.status || 'ACTIVE',
      bankName: payload.bankName || 'HDFC Bank Ltd',
      bankAccountNumber: payload.bankAccountNumber || '000000000000',
      bankIfsc: (payload.bankIfsc || 'HDFC0000001').toUpperCase(),
      bankAccountType: payload.bankAccountType || 'SALARY',
      payoutMode: payload.payoutMode || 'DIRECT_DEPOSIT_NEFT',
      isPfEligible: payload.isPfEligible ?? true,
      pfCappingOption: payload.pfCappingOption || 'CAPPED_15000',
      isEsicEligible: payload.isEsicEligible ?? (payStructure.monthlyCtc <= 21000),
      isPtEligible: payload.isPtEligible ?? true,
      statePt: payload.statePt || 'MAHARASHTRA',
      isLwfEligible: payload.isLwfEligible ?? true,
      payStructure: { ...payStructure, ...(payload.payStructure || {}) },
      taxDeclaration: payload.taxDeclaration || {
        taxRegime: 'NEW',
        section80C: 0,
        section80D: 0,
        section24bHomeLoanInterest: 0,
        npsSection80CCD1B: 0,
        monthlyRentPaid: 0,
        isMetroCityHra: true,
        otherIncomeOrLoss: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.push(newEmp);
    await saveTenantEmployees(tenantId, list);
    return newEmp;
  }

  public static async getAttendanceRegister(
    tenantId: string,
    month: number,
    year: number
  ): Promise<AttendanceRecord[]> {
    const employees = await getTenantEmployees(tenantId);
    const records = await getTenantAttendance(tenantId);
    const totalDays = new Date(year, month, 0).getDate();

    let dirty = false;
    const result = employees.map((emp) => {
      let rec = records.find((r) => r.employeeId === emp.id && r.month === month && r.year === year);
      if (!rec) {
        rec = {
          id: `att-${emp.id}-${month}-${year}`,
          tenantId,
          employeeId: emp.id,
          month,
          year,
          totalCalendarDays: totalDays,
          presentDays: totalDays,
          paidLeaves: 0,
          lopDays: 0,
          overtimeHours: 0,
        };
        records.push(rec);
        dirty = true;
      }
      return rec;
    });

    if (dirty) {
      await saveTenantAttendance(tenantId, records);
    }

    return result;
  }

  public static async updateAttendance(
    tenantId: string,
    payload: {
      employeeId: string;
      month: number;
      year: number;
      presentDays: number;
      paidLeaves: number;
      lopDays: number;
      overtimeHours?: number;
    }
  ): Promise<AttendanceRecord> {
    const records = await getTenantAttendance(tenantId);
    const totalDays = new Date(payload.year, payload.month, 0).getDate();

    let rec = records.find(
      (r) => r.employeeId === payload.employeeId && r.month === payload.month && r.year === payload.year
    );

    if (!rec) {
      rec = {
        id: `att-${payload.employeeId}-${payload.month}-${payload.year}`,
        tenantId,
        employeeId: payload.employeeId,
        month: payload.month,
        year: payload.year,
        totalCalendarDays: totalDays,
        presentDays: payload.presentDays,
        paidLeaves: payload.paidLeaves,
        lopDays: payload.lopDays,
        overtimeHours: payload.overtimeHours || 0,
      };
      records.push(rec);
    } else {
      rec.presentDays = payload.presentDays;
      rec.paidLeaves = payload.paidLeaves;
      rec.lopDays = payload.lopDays;
      rec.overtimeHours = payload.overtimeHours || 0;
    }

    await saveTenantAttendance(tenantId, records);
    return rec;
  }

  /**
   * Detailed Indian Income Tax (Sec 192) Projection Calculator
   */
  public static calculateTdsOnSalary(
    annualGross: number,
    decl: EmployeeTaxDeclaration,
    annualPf: number,
    annualPt: number
  ): number {
    if (decl.taxRegime === 'NEW') {
      // New Tax Regime (FY 2025-26 & FY 2026-27 under Sec 115BAC)
      const stdDeduction = 75000;
      const netTaxableIncome = Math.max(0, annualGross - stdDeduction + (decl.otherIncomeOrLoss || 0));

      // Rebate under 87A: Up to Rs 7,00,000 taxable income -> 0 tax
      if (netTaxableIncome <= 700000) return 0;

      let tax = 0;
      if (netTaxableIncome > 1500000) {
        tax += (netTaxableIncome - 1500000) * 0.30 + 150000;
      } else if (netTaxableIncome > 1200000) {
        tax += (netTaxableIncome - 1200000) * 0.20 + 90000;
      } else if (netTaxableIncome > 1000000) {
        tax += (netTaxableIncome - 1000000) * 0.15 + 60000;
      } else if (netTaxableIncome > 700000) {
        tax += (netTaxableIncome - 700000) * 0.10 + 30000;
      } else if (netTaxableIncome > 300000) {
        tax += (netTaxableIncome - 300000) * 0.05;
      }

      // 4% Health & Education Cess
      const totalAnnualTax = tax * 1.04;
      return Math.round(totalAnnualTax / 12);
    } else {
      // Old Tax Regime with Deductions (80C, 80D, 24b, HRA)
      const stdDeduction = 50000;
      const sec80C = Math.min(150000, (decl.section80C || 0) + annualPf);
      const sec80D = Math.min(75000, decl.section80D || 0);
      const sec24b = Math.min(200000, decl.section24bHomeLoanInterest || 0);
      const sec80CCD1B = Math.min(50000, decl.npsSection80CCD1B || 0);

      const totalExemptions = stdDeduction + sec80C + sec80D + sec24b + sec80CCD1B + annualPt;
      const netTaxableIncome = Math.max(0, annualGross - totalExemptions + (decl.otherIncomeOrLoss || 0));

      // Rebate under 87A: Up to Rs 5,00,000 taxable income -> 0 tax
      if (netTaxableIncome <= 500000) return 0;

      let tax = 0;
      if (netTaxableIncome > 1000000) {
        tax += (netTaxableIncome - 1000000) * 0.30 + 112500;
      } else if (netTaxableIncome > 500000) {
        tax += (netTaxableIncome - 500000) * 0.20 + 12500;
      } else if (netTaxableIncome > 250000) {
        tax += (netTaxableIncome - 250000) * 0.05;
      }

      const totalAnnualTax = tax * 1.04;
      return Math.round(totalAnnualTax / 12);
    }
  }

  /**
   * Statutory Payroll Execution Engine
   */
  public static calculateStatutoryPayroll(
    emp: Employee,
    att: AttendanceRecord
  ): PayrollLineItem {
    const totalDays = att.totalCalendarDays || 30;
    const payableDays = Math.max(0, totalDays - att.lopDays);
    const prorationRatio = payableDays / totalDays;

    const ps = emp.payStructure;

    // Pro-rated Earnings
    const earnedBasic = Math.round(ps.basicSalary * prorationRatio);
    const earnedHra = Math.round(ps.hra * prorationRatio);
    const earnedConveyance = Math.round(ps.conveyanceAllowance * prorationRatio);
    const earnedMedical = Math.round(ps.medicalAllowance * prorationRatio);
    const earnedSpecial = Math.round(ps.specialAllowance * prorationRatio);
    const earnedChildrenEdu = Math.round(ps.childrenEducationAllowance * prorationRatio);

    const hourlyRate = (ps.monthlyCtc / (totalDays * 8)) * 1.5;
    const overtimePay = Math.round(hourlyRate * (att.overtimeHours || 0));
    const performanceBonus = ps.performanceBonusMonthly || 0;

    const grossEarnings =
      earnedBasic +
      earnedHra +
      earnedConveyance +
      earnedMedical +
      earnedSpecial +
      earnedChildrenEdu +
      overtimePay +
      performanceBonus;

    // 1. Employee EPF (12% of Basic)
    let employeePf = 0;
    let employerPf = 0;
    let employerEps = 0;
    let employerEdliAndAdmin = 0;

    if (emp.isPfEligible) {
      const pfWage = emp.pfCappingOption === 'CAPPED_15000' ? Math.min(earnedBasic, 15000) : earnedBasic;
      employeePf = Math.round(pfWage * 0.12);
      employerEps = Math.round(pfWage * 0.0833);
      employerPf = Math.round(pfWage * 0.0367);
      employerEdliAndAdmin = Math.round(pfWage * 0.01);
    }

    // 2. Employee ESIC (0.75% Employee, 3.25% Employer if gross <= 21,000)
    let employeeEsic = 0;
    let employerEsic = 0;
    if (emp.isEsicEligible && grossEarnings <= 21000) {
      employeeEsic = Math.ceil(grossEarnings * 0.0075);
      employerEsic = Math.ceil(grossEarnings * 0.0325);
    }

    // 3. Professional Tax (PT)
    let pt = 0;
    if (emp.isPtEligible) {
      if (emp.statePt === 'MAHARASHTRA') {
        if (grossEarnings > 10000) {
          pt = att.month === 2 ? 300 : 200;
        } else if (grossEarnings > 7500) {
          pt = 175;
        }
      } else if (emp.statePt === 'KARNATAKA') {
        if (grossEarnings >= 15000) pt = 200;
      } else if (emp.statePt === 'TELANGANA' || emp.statePt === 'TAMIL_NADU') {
        if (grossEarnings > 15000) pt = 200;
      } else if (emp.statePt === 'WEST_BENGAL') {
        if (grossEarnings > 10000) pt = 150;
      } else if (emp.statePt === 'GUJARAT') {
        if (grossEarnings > 12000) pt = 200;
      }
    }

    // 4. Labour Welfare Fund (LWF)
    const lwfDeduction = emp.isLwfEligible ? 25 : 0;

    // 5. TDS on Salary (Sec 192)
    const annualProjectedGross = grossEarnings * 12;
    const tdsTax = this.calculateTdsOnSalary(annualProjectedGross, emp.taxDeclaration, employeePf * 12, pt * 12);

    const totalDeductions = employeePf + employeeEsic + pt + lwfDeduction + tdsTax;
    const netPayable = Math.max(0, grossEarnings - totalDeductions);
    const gratuityMonthly = Math.round((earnedBasic * 15) / (26 * 12));
    const totalEmployerCost = grossEarnings + employerPf + employerEps + employerEdliAndAdmin + employerEsic + gratuityMonthly;

    return {
      employeeId: emp.id,
      empCode: emp.empCode,
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      bankAccountNumber: emp.bankAccountNumber,
      bankIfsc: emp.bankIfsc,
      payoutMode: emp.payoutMode,
      totalDays,
      payableDays,
      lopDays: att.lopDays,
      earnedBasic,
      earnedHra,
      earnedConveyance,
      earnedMedical,
      earnedSpecialAllowance: earnedSpecial,
      earnedChildrenEdu,
      overtimePay,
      performanceBonus,
      grossEarnings,
      employeePf,
      employeeEsic,
      professionalTax: pt,
      lwfDeduction,
      tdsTax,
      totalDeductions,
      netPayable,
      netPayableInWords: numberToIndianWords(netPayable),
      employerPf,
      employerEps,
      employerEdliAndAdmin,
      employerEsic,
      gratuityMonthly,
      totalEmployerCost,
    };
  }

  public static async previewPayroll(
    tenantId: string,
    month: number,
    year: number
  ): Promise<{ monthStr: string; items: PayrollLineItem[]; summary: any }> {
    const allEmps = await getTenantEmployees(tenantId);
    const employees = allEmps.filter((e) => e.status === 'ACTIVE' || e.status === 'PROBATION');
    const attendance = await this.getAttendanceRegister(tenantId, month, year);

    const items: PayrollLineItem[] = employees.map((emp) => {
      const att = attendance.find((a) => a.employeeId === emp.id) || {
        id: 'default',
        tenantId,
        employeeId: emp.id,
        month,
        year,
        totalCalendarDays: new Date(year, month, 0).getDate(),
        presentDays: new Date(year, month, 0).getDate(),
        paidLeaves: 0,
        lopDays: 0,
        overtimeHours: 0,
      };
      return this.calculateStatutoryPayroll(emp, att);
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthStr = `${monthNames[month - 1]} ${year}`;

    const summary = {
      totalEmployees: items.length,
      totalGrossPay: items.reduce((s, i) => s + i.grossEarnings, 0),
      totalDeductions: items.reduce((s, i) => s + i.totalDeductions, 0),
      totalNetPay: items.reduce((s, i) => s + i.netPayable, 0),
      totalPfLiability: items.reduce((s, i) => s + i.employeePf + i.employerPf + i.employerEps + i.employerEdliAndAdmin, 0),
      totalEsicLiability: items.reduce((s, i) => s + i.employeeEsic + i.employerEsic, 0),
      totalPtLiability: items.reduce((s, i) => s + i.professionalTax, 0),
      totalTdsLiability: items.reduce((s, i) => s + i.tdsTax, 0),
      totalCompanyCost: items.reduce((s, i) => s + i.totalEmployerCost, 0),
    };

    return { monthStr, items, summary };
  }

  public static async executePayrollRun(
    tenantId: string,
    payload: { month: number; year: number; autoPostVoucher?: boolean }
  ): Promise<PayrollRun> {
    const { monthStr, items, summary } = await this.previewPayroll(tenantId, payload.month, payload.year);
    const runs = await getTenantPayrollRuns(tenantId);

    const runId = `payroll-${payload.year}-${String(payload.month).padStart(2, '0')}`;
    const voucherNumber = `SAL/JV/${payload.year}/${String(payload.month).padStart(2, '0')}`;

    const payrollRun: PayrollRun = {
      id: runId,
      tenantId,
      payrollMonth: monthStr,
      month: payload.month,
      year: payload.year,
      runDate: new Date().toISOString(),
      status: 'PROCESSED',
      totalEmployees: summary.totalEmployees,
      totalGrossPay: summary.totalGrossPay,
      totalDeductions: summary.totalDeductions,
      totalNetPay: summary.totalNetPay,
      totalPfLiability: summary.totalPfLiability,
      totalEsicLiability: summary.totalEsicLiability,
      totalPtLiability: summary.totalPtLiability,
      totalTdsLiability: summary.totalTdsLiability,
      totalCompanyCost: summary.totalCompanyCost,
      voucherNumber,
      journalVoucherId: `jv-${Date.now()}`,
      items,
    };

    const existingIdx = runs.findIndex((r) => r.id === runId);
    if (existingIdx >= 0) {
      runs[existingIdx] = payrollRun;
    } else {
      runs.unshift(payrollRun);
    }

    await saveTenantPayrollRuns(tenantId, runs);
    return payrollRun;
  }

  public static async listPayrollRuns(tenantId: string): Promise<PayrollRun[]> {
    const runs = await getTenantPayrollRuns(tenantId);
    if (runs.length === 0) {
      const sample = await this.executePayrollRun(tenantId, { month: 4, year: 2026 });
      return [sample];
    }
    return runs;
  }

  public static async getPayslip(
    tenantId: string,
    employeeId: string,
    runId?: string
  ) {
    const runs = await this.listPayrollRuns(tenantId);
    const run = runId ? runs.find((r) => r.id === runId) : runs[0];
    if (!run) throw new Error('No payroll runs found');

    const item = run.items.find((i) => i.employeeId === employeeId);
    if (!item) throw new Error('Employee not found in selected payroll run');

    const employees = await getTenantEmployees(tenantId);
    const emp = employees.find((e) => e.id === employeeId);

    return {
      companyName: 'INFISUITE TECHNOLOGIES PRIVATE LIMITED',
      companyAddress: 'Unit 402, Trade Tower, Bandra Kurla Complex, Mumbai 400051',
      payrollMonth: run.payrollMonth,
      runDate: run.runDate,
      voucherNumber: run.voucherNumber,
      employee: {
        empCode: item.empCode,
        name: item.name,
        department: item.department,
        designation: item.designation,
        dateOfJoining: emp?.dateOfJoining || '2023-01-01',
        workLocation: emp?.workLocation || 'Mumbai HQ',
        pan: emp?.pan || '',
        aadhaar: emp?.aadhaar || '',
        uan: emp?.uan || 'N/A',
        pfMemberId: emp?.pfMemberId || 'N/A',
        esicNo: emp?.esicNo || 'N/A',
        bankName: emp?.bankName || '',
        bankAccountNumber: item.bankAccountNumber,
        bankIfsc: item.bankIfsc,
        payoutMode: item.payoutMode,
        taxRegime: emp?.taxDeclaration?.taxRegime || 'NEW',
      },
      attendance: {
        totalDays: item.totalDays,
        payableDays: item.payableDays,
        lopDays: item.lopDays,
      },
      earnings: [
        { label: 'Basic Salary', amount: item.earnedBasic },
        { label: 'House Rent Allowance (HRA)', amount: item.earnedHra },
        { label: 'Conveyance Allowance', amount: item.earnedConveyance },
        { label: 'Medical Allowance', amount: item.earnedMedical },
        { label: 'Special Allowance', amount: item.earnedSpecialAllowance },
        { label: 'Children Education Allowance', amount: item.earnedChildrenEdu },
        { label: 'Overtime & Incentives', amount: item.overtimePay },
        { label: 'Performance Bonus', amount: item.performanceBonus },
      ].filter((e) => e.amount > 0),
      deductions: [
        { label: 'Provident Fund (EPF)', amount: item.employeePf },
        { label: 'Employee State Insurance (ESIC)', amount: item.employeeEsic },
        { label: 'Professional Tax (PT)', amount: item.professionalTax },
        { label: 'Labour Welfare Fund (LWF)', amount: item.lwfDeduction },
        { label: 'Income Tax / TDS (Sec 192)', amount: item.tdsTax },
      ].filter((d) => d.amount > 0),
      grossEarnings: item.grossEarnings,
      totalDeductions: item.totalDeductions,
      netPayable: item.netPayable,
      netPayableInWords: item.netPayableInWords,
    };
  }

  public static async generateEpfoEcrText(tenantId: string, runId?: string): Promise<{ textContent: string; fileName: string }> {
    const runs = await this.listPayrollRuns(tenantId);
    const run = runId ? runs.find((r) => r.id === runId) : runs[0];
    if (!run) throw new Error('Payroll run not found');

    const allEmps = await getTenantEmployees(tenantId);
    const lines: string[] = [];
    for (const item of run.items) {
      const emp = allEmps.find((e) => e.id === item.employeeId);
      if (!emp?.isPfEligible) continue;

      const uan = emp.uan || '100900000000';
      const name = emp.name.toUpperCase();
      const gross = item.grossEarnings;
      const pfWages = emp.pfCappingOption === 'CAPPED_15000' ? Math.min(item.earnedBasic, 15000) : item.earnedBasic;
      const epsWages = pfWages;
      const edliWages = pfWages;
      const epfContr = item.employeePf;
      const epsContr = item.employerEps;
      const epfDiff = item.employerPf;
      const ncpDays = item.lopDays;

      lines.push(`${uan}#~#${name}#~#${gross}#~#${pfWages}#~#${epsWages}#~#${edliWages}#~#${epfContr}#~#${epsContr}#~#${epfDiff}#~#${ncpDays}#~#0`);
    }

    const textContent = lines.join('\n');
    const fileName = `ECR_${run.year}_${String(run.month).padStart(2, '0')}.txt`;

    return { textContent, fileName };
  }
}
