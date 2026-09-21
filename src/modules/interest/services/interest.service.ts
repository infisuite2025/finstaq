export interface OverdueBill {
  id: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'VENDOR';
  billAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueDays: number;
  annualInterestRate: number; // e.g. 18%
  interestCalculationMethod: 'SIMPLE' | 'COMPOUND_MONTHLY';
  calculatedInterestAmount: number;
  debitNoteStatus: 'NOT_GENERATED' | 'GENERATED';
  linkedDebitNoteNo?: string;
}

export class InterestService {
  getOverdueBills(tenantId: string, asOfDateStr?: string): OverdueBill[] {
    const asOfDate = asOfDateStr ? new Date(asOfDateStr) : new Date();

    const sampleBills = [
      {
        id: 'bill-1',
        billNumber: 'INV/2026/02/088',
        billDate: '2026-02-01',
        dueDate: '2026-03-03',
        partyId: 'cust-1',
        partyName: 'Tata Motors Limited',
        partyType: 'CUSTOMER' as const,
        billAmount: 500000,
        paidAmount: 100000,
        outstandingAmount: 400000,
        annualInterestRate: 18,
        interestCalculationMethod: 'SIMPLE' as const,
      },
      {
        id: 'bill-2',
        billNumber: 'INV/2026/01/014',
        billDate: '2026-01-15',
        dueDate: '2026-02-15',
        partyId: 'cust-2',
        partyName: 'Reliance Retail Ventures',
        partyType: 'CUSTOMER' as const,
        billAmount: 850000,
        paidAmount: 0,
        outstandingAmount: 850000,
        annualInterestRate: 18,
        interestCalculationMethod: 'SIMPLE' as const,
      },
      {
        id: 'bill-3',
        billNumber: 'PUR-JSW-2026-004',
        billDate: '2026-01-20',
        dueDate: '2026-02-20',
        partyId: 'vend-1',
        partyName: 'JSW Steel Processing Ltd',
        partyType: 'VENDOR' as const,
        billAmount: 620000,
        paidAmount: 0,
        outstandingAmount: 620000,
        annualInterestRate: 15,
        interestCalculationMethod: 'SIMPLE' as const,
      },
    ];

    return sampleBills.map((b) => {
      const due = new Date(b.dueDate);
      const diffTime = asOfDate.getTime() - due.getTime();
      const overdueDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      const calculatedInterest = Math.round((b.outstandingAmount * (b.annualInterestRate / 100) * overdueDays) / 365);

      return {
        ...b,
        overdueDays,
        calculatedInterestAmount: calculatedInterest,
        debitNoteStatus: 'NOT_GENERATED',
      };
    });
  }

  generateInterestDebitNote(params: {
    billNumber: string;
    partyName: string;
    partyType: 'CUSTOMER' | 'VENDOR';
    interestAmount: number;
    overdueDays: number;
    rate: number;
  }): { debitNoteNumber: string; voucherId: string; journalEntry: any } {
    const isCustomer = params.partyType === 'CUSTOMER';
    const notePrefix = isCustomer ? 'DN/INT' : 'CN/INT';
    const noteNumber = `${notePrefix}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const journalEntry = {
      debitLedger: isCustomer ? `Customer - ${params.partyName}` : 'Interest Expense A/c (Overdue Vendor Bills)',
      creditLedger: isCustomer ? 'Interest Income A/c (Delayed Customer Receivables)' : `Vendor - ${params.partyName}`,
      amount: params.interestAmount,
      narration: `Overdue interest @${params.rate}% p.a. for ${params.overdueDays} days past due on bill ${params.billNumber}`,
    };

    return {
      debitNoteNumber: noteNumber,
      voucherId: `vch-int-${Date.now()}`,
      journalEntry,
    };
  }
}

export const interestService = new InterestService();
