export interface EmployeeEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface EmployeeAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface EmployeeEducation {
  qualification: string;
  institution: string;
  yearOfPassing: number;
  gradeOrPercentage?: string;
  certifications?: string[];
}

export interface EmployeeWorkExperience {
  totalExperienceYears: number;
  previousEmployer: string;
  previousDesignation: string;
  previousEmploymentPeriod?: string;
  previousLastDrawnCtc?: number;
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
  section80C: number;
  section80D: number;
  section24bHomeLoanInterest: number;
  npsSection80CCD1B: number;
  monthlyRentPaid: number;
  isMetroCityHra: boolean;
  otherIncomeOrLoss: number;
}

export interface Employee {
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

export interface CandidateOffer {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  workLocation: string;
  dateOfJoining: string;
  offerDate: string;
  annualCtc: number;
  probationMonths: number;
  noticePeriodDays: number;
  reportingManager: string;
  address: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'JOINED' | 'DECLINED';
  payStructure: EmployeePayStructure;
  termsAndConditions?: string[];
}

export interface SalaryRevisionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  department: string;
  previousDesignation: string;
  newDesignation: string;
  previousAnnualCtc: number;
  revisedAnnualCtc: number;
  hikePercentage: number;
  effectiveDate: string;
  revisionDate: string;
  revisionType: 'ANNUAL_APPRAISAL' | 'PROMOTION' | 'MARKET_CORRECTION' | 'PROBATION_CONFIRMATION';
  appraisalComments: string;
  revisedPayStructure: EmployeePayStructure;
  retroactiveArrearsEstimate?: number;
  status: 'APPROVED' | 'APPLIED';
}

export interface FnFSettlementRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  dateOfResignation: string;
  lastWorkingDay: string;
  tenureYears: number;
  exitReason: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'MUTUAL_SEPARATION';
  
  // Salary in Exit Month
  exitMonthDaysWorked: number;
  exitMonthGrossSalary: number;
  
  // Leave Encashment
  earnedLeavesBalance: number;
  leaveEncashmentRatePerDay: number;
  leaveEncashmentAmount: number;
  
  // Gratuity (Payment of Gratuity Act 1972: 15 * Basic / 26 * Years if >= 5 yrs)
  isGratuityEligible: boolean;
  gratuityAmount: number;
  
  // Statutory Bonus & Arrears
  statutoryBonusPayable: number;
  reimbursementsPending: number;
  
  // Recoveries & Deductions
  noticePeriodShortfallDays: number;
  noticeRecoveryAmount: number;
  salaryAdvanceRecovery: number;
  unreturnedAssetDeduction: number;
  tdsDeduction: number;
  
  // Summary Totals
  totalGrossPayable: number;
  totalDeductionsAndRecoveries: number;
  netSettlementAmount: number; // Positive = Company pays, Negative = Employee pays
  
  settlementStatus: 'DRAFT' | 'SETTLED' | 'CANCELLED';
  settlementDate: string;
  settledBy: string;
  remarks: string;
}

export interface StaffLoanRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  loanType: 'SALARY_ADVANCE' | 'PERSONAL_LOAN' | 'EMERGENCY_MEDICAL' | 'EQUIPMENT_PURCHASE';
  principalAmount: number;
  interestRateAnnual: number;
  tenureMonths: number;
  monthlyEmi: number;
  disbursedDate: string;
  emiStartMonth: string;
  totalRepaid: number;
  outstandingBalance: number;
  status: 'ACTIVE' | 'CLOSED';
  reason: string;
}
