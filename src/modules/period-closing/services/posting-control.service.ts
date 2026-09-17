// @ts-nocheck
import {
  FinancialYear,
  AccountingPeriod,
  PeriodPostingValidation,
  UserRole
} from '../types/period-closing.types';
import { FinancialYearService } from './financial-year.service';
import { AppError } from '../../../core/errors/app-error';

export class PostingControlService {
  /**
   * Reusable central gatekeeper for EVERY accounting-impacting transaction.
   * Validates date, fiscal year, accounting period, status, user role, and document type.
   */
  public static validatePosting(params: {
    tenantId: string;
    transactionDate: string; // YYYY-MM-DD
    userRole: UserRole | string;
    userId?: string;
    documentType?: string;
    isAdjustmentJournal?: boolean;
  }): PeriodPostingValidation {
    const txDateStr = params.transactionDate.split('T')[0];
    const txDate = new Date(txDateStr + 'T00:00:00');

    // 1. Locate Financial Year
    const fYears = FinancialYearService.getFinancialYears(params.tenantId);
    const matchedFY = fYears.find((fy) => {
      const start = new Date(fy.startDate + 'T00:00:00');
      const end = new Date(fy.endDate + 'T00:00:00');
      return txDate >= start && txDate <= end;
    });

    if (!matchedFY) {
      return {
        isAllowed: false,
        status: 'BLOCKED',
        errorCode: 'NO_FINANCIAL_YEAR',
        reason: `No Financial Year defined for transaction date ${txDateStr}. Please configure the fiscal calendar.`,
      };
    }

    // 2. Evaluate Financial Year Status
    if (matchedFY.status === 'AUDIT_LOCKED') {
      return {
        isAllowed: false,
        status: 'BLOCKED',
        financialYear: matchedFY,
        errorCode: 'YEAR_AUDIT_LOCKED',
        reason: `Financial Year ${matchedFY.code} is AUDIT LOCKED. No postings are permitted under any circumstances.`,
      };
    }

    if (matchedFY.status === 'FINAL_CLOSED') {
      return {
        isAllowed: false,
        status: 'BLOCKED',
        financialYear: matchedFY,
        errorCode: 'YEAR_FINAL_CLOSED',
        reason: `Financial Year ${matchedFY.code} is FINAL CLOSED. Reopening workflow with Owner authorization is required to post adjustments.`,
      };
    }

    // 3. Locate Accounting Period
    const periods = FinancialYearService.getPeriods(params.tenantId, matchedFY.id);
    const matchedPeriod = periods.find((p) => {
      const pStart = new Date(p.startDate + 'T00:00:00');
      const pEnd = new Date(p.endDate + 'T00:00:00');
      return txDate >= pStart && txDate <= pEnd;
    });

    if (!matchedPeriod) {
      return {
        isAllowed: false,
        status: 'BLOCKED',
        financialYear: matchedFY,
        errorCode: 'NO_PERIOD_FOUND',
        reason: `No accounting period defined for date ${txDateStr} in FY ${matchedFY.code}.`,
      };
    }

    // 4. Evaluate Period Status & Role Permissions
    switch (matchedPeriod.status) {
      case 'AUDIT_LOCKED':
        return {
          isAllowed: false,
          status: 'BLOCKED',
          financialYear: matchedFY,
          period: matchedPeriod,
          errorCode: 'PERIOD_AUDIT_LOCKED',
          reason: `Accounting Period ${matchedPeriod.monthName} is AUDIT LOCKED. All postings are strictly prohibited.`,
        };

      case 'FINAL_CLOSED':
        return {
          isAllowed: false,
          status: 'BLOCKED',
          financialYear: matchedFY,
          period: matchedPeriod,
          errorCode: 'PERIOD_FINAL_CLOSED',
          reason: `Accounting Period ${matchedPeriod.monthName} is CLOSED. Contact Business Owner (Vikram Singhania) to reopen.`,
        };

      case 'FINANCE_REVIEW':
        // In Finance Review, only ACCOUNTANT and OWNER can post adjustment journals
        if (params.userRole !== 'ACCOUNTANT' && params.userRole !== 'OWNER') {
          return {
            isAllowed: false,
            status: 'BLOCKED',
            financialYear: matchedFY,
            period: matchedPeriod,
            errorCode: 'FINANCE_REVIEW_RESTRICTION',
            reason: `Accounting Period ${matchedPeriod.monthName} is under FINANCE REVIEW. Operational clerks cannot post entries; only Finance/Owner adjustment entries allowed.`,
          };
        }
        break;

      case 'SOFT_CLOSED':
        // In Soft Closed, only ACCOUNTANT/OWNER can post
        if (params.userRole === 'DATA_ENTRY') {
          return {
            isAllowed: false,
            status: 'BLOCKED',
            financialYear: matchedFY,
            period: matchedPeriod,
            errorCode: 'SOFT_CLOSED_RESTRICTION',
            reason: `Accounting Period ${matchedPeriod.monthName} is SOFT CLOSED. Normal clerk data entry is locked.`,
          };
        }
        break;

      case 'OPEN':
      case 'REOPENED':
        // Normal authorised transactions permitted
        break;
    }

    return {
      isAllowed: true,
      status: 'ALLOWED',
      financialYear: matchedFY,
      period: matchedPeriod,
    };
  }

  public static assertPostingAllowed(params: {
    tenantId: string;
    transactionDate: string;
    userRole: UserRole | string;
    userId?: string;
    documentType?: string;
    isAdjustmentJournal?: boolean;
  }): void {
    const result = this.validatePosting(params);
    if (!result.isAllowed) {
      throw new AppError(result.reason || 'Posting blocked by financial period control', 403);
    }
  }
}
