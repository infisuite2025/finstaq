import { EmployeePayStructure } from './payrollTypes';

export function calculateIndianCtcBreakdown(
  annualCtc: number,
  options?: {
    basicPercent?: number; // default 40%
    hraPercent?: number; // default 50% of basic
    isPfEligible?: boolean;
    pfCappingOption?: 'CAPPED_15000' | 'ACTUAL_BASIC';
    isEsicEligible?: boolean;
  }
): EmployeePayStructure {
  const monthlyCtc = Math.round(annualCtc / 12);
  const basicPct = (options?.basicPercent || 40) / 100;
  const hraPct = (options?.hraPercent || 50) / 100;
  const isPf = options?.isPfEligible ?? true;
  const pfCapping = options?.pfCappingOption ?? 'CAPPED_15000';
  const isEsic = options?.isEsicEligible ?? (monthlyCtc <= 21000);

  // 1. Basic & HRA
  const basicSalary = Math.round(monthlyCtc * basicPct);
  const hra = Math.round(basicSalary * hraPct);
  const conveyanceAllowance = 1600;
  const medicalAllowance = 1250;
  const childrenEducationAllowance = 200;

  // 2. Employer Statutory Costs
  let employerPf = 0;
  let employerEps = 0;
  let employerEdliAndAdmin = 0;

  if (isPf) {
    const pfWage = pfCapping === 'CAPPED_15000' ? Math.min(basicSalary, 15000) : basicSalary;
    employerEps = Math.round(pfWage * 0.0833);
    const pfRemaining = Math.round(pfWage * 0.12) - employerEps;
    employerPf = pfRemaining;
    employerEdliAndAdmin = Math.round(pfWage * 0.01); // EDLI + Admin ~ 1%
  }

  // Gratuity provision: (15/26) * Basic / 12 ~ 4.81% of Basic
  const gratuityMonthly = Math.round((basicSalary * 15) / (26 * 12));

  // Gross estimate before balancing
  const fixedNonSpecial = basicSalary + hra + conveyanceAllowance + medicalAllowance + childrenEducationAllowance;
  const totalEmployerFixedCost = employerPf + employerEps + employerEdliAndAdmin + gratuityMonthly;

  // ESIC (if Gross <= 21000)
  let employerEsic = 0;
  if (isEsic) {
    // ESIC Employer @ 3.25% of gross
    employerEsic = Math.round(fixedNonSpecial * 0.0325);
  }

  // Balancing Special Allowance so that totalEmployerMonthlyCost equals monthlyCtc
  let specialAllowance = monthlyCtc - (fixedNonSpecial + totalEmployerFixedCost + employerEsic);
  if (specialAllowance < 0) {
    specialAllowance = 0;
  }

  const grossSalaryMonthly = fixedNonSpecial + specialAllowance;
  if (isEsic) {
    employerEsic = Math.round(grossSalaryMonthly * 0.0325);
  }

  const totalEmployerMonthlyCost = grossSalaryMonthly + employerPf + employerEps + employerEdliAndAdmin + employerEsic + gratuityMonthly;

  return {
    annualCtc,
    monthlyCtc,
    basicSalary,
    hra,
    conveyanceAllowance,
    medicalAllowance,
    specialAllowance,
    childrenEducationAllowance,
    performanceBonusMonthly: 0,
    grossSalaryMonthly,
    employerPf,
    employerEps,
    employerEdliAndAdmin,
    employerEsic,
    gratuityMonthly,
    statutoryBonusMonthly: 0,
    totalEmployerMonthlyCost,
  };
}
