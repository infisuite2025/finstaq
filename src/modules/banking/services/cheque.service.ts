import { prisma } from '../../../core/database/prisma';

export interface ChequeBook {
  id: string;
  tenantId: string;
  bankLedgerId: string;
  bankName: string;
  accountNumber: string;
  bookSeries: string;
  fromChequeNo: number;
  toChequeNo: number;
  totalLeaves: number;
  issuedCount: number;
  clearedCount: number;
  cancelledCount: number;
  availableCount: number;
  createdAt: string;
}

export interface ChequeLeaf {
  id: string;
  tenantId: string;
  bookId: string;
  chequeNumber: string;
  bankLedgerId: string;
  status: 'AVAILABLE' | 'ISSUED' | 'CLEARED' | 'CANCELLED' | 'STALE';
  voucherId?: string;
  voucherNumber?: string;
  issueDate?: string;
  payeeName?: string;
  amount?: number;
  isCrossed: boolean;
  remarks?: string;
}

export interface ChequePrintTemplate {
  id: string;
  bankName: string;
  chequeWidthMm: number;
  chequeHeightMm: number;
  payeeTopMm: number;
  payeeLeftMm: number;
  dateTopMm: number;
  dateLeftMm: number;
  dateBoxSpacingMm: number;
  amountWordsTopMm: number;
  amountWordsLeftMm: number;
  amountWordsWidthMm: number;
  amountFiguresTopMm: number;
  amountFiguresLeftMm: number;
  crossingTopMm: number;
  crossingLeftMm: number;
  showCrossLine: boolean;
  signatoryTopMm: number;
  signatoryLeftMm: number;
}

async function getTenantChequeData(tenantId: string = 'tenant-default-01'): Promise<{ books: ChequeBook[]; leaves: ChequeLeaf[] }> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'CHEQUE_INVENTORY' } },
    });
    if (record && record.value) {
      return record.value as any;
    }
  } catch (e) {}
  const init = getInitialBooks(safeTenantId);
  try {
    await prisma.keyValueStore.upsert({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'CHEQUE_INVENTORY' } },
      update: { value: init as any },
      create: { tenantId: safeTenantId, key: 'CHEQUE_INVENTORY', value: init as any },
    });
  } catch (e) {}
  return init;
}

async function saveTenantChequeData(tenantId: string = 'tenant-default-01', data: { books: ChequeBook[]; leaves: ChequeLeaf[] }) {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: 'CHEQUE_INVENTORY' } },
    update: { value: data as any },
    create: { tenantId: safeTenantId, key: 'CHEQUE_INVENTORY', value: data as any },
  });
}

async function getTenantTemplates(tenantId: string = 'tenant-default-01'): Promise<ChequePrintTemplate[]> {
  const safeTenantId = tenantId || 'tenant-default-01';
  try {
    const record = await prisma.keyValueStore.findUnique({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'CHEQUE_PRINT_TEMPLATES' } },
    });
    if (record && record.value) {
      return record.value as any;
    }
  } catch (e) {}
  const init = getInitialTemplates();
  try {
    await prisma.keyValueStore.upsert({
      where: { tenantId_key: { tenantId: safeTenantId, key: 'CHEQUE_PRINT_TEMPLATES' } },
      update: { value: init as any },
      create: { tenantId: safeTenantId, key: 'CHEQUE_PRINT_TEMPLATES', value: init as any },
    });
  } catch (e) {}
  return init;
}

async function saveTenantTemplates(tenantId: string = 'tenant-default-01', data: ChequePrintTemplate[]) {
  const safeTenantId = tenantId || 'tenant-default-01';
  await prisma.keyValueStore.upsert({
    where: { tenantId_key: { tenantId: safeTenantId, key: 'CHEQUE_PRINT_TEMPLATES' } },
    update: { value: data as any },
    create: { tenantId: safeTenantId, key: 'CHEQUE_PRINT_TEMPLATES', value: data as any },
  });
}

function getInitialTemplates(): ChequePrintTemplate[] {
  return [
    {
      id: 'tmpl-hdfc',
      bankName: 'HDFC Bank Ltd',
      chequeWidthMm: 203,
      chequeHeightMm: 92,
      payeeTopMm: 28,
      payeeLeftMm: 24,
      dateTopMm: 12,
      dateLeftMm: 154,
      dateBoxSpacingMm: 4.8,
      amountWordsTopMm: 38,
      amountWordsLeftMm: 30,
      amountWordsWidthMm: 130,
      amountFiguresTopMm: 44,
      amountFiguresLeftMm: 156,
      crossingTopMm: 10,
      crossingLeftMm: 25,
      showCrossLine: true,
      signatoryTopMm: 74,
      signatoryLeftMm: 145,
    },
    {
      id: 'tmpl-sbi',
      bankName: 'State Bank of India',
      chequeWidthMm: 205,
      chequeHeightMm: 93,
      payeeTopMm: 30,
      payeeLeftMm: 26,
      dateTopMm: 14,
      dateLeftMm: 152,
      dateBoxSpacingMm: 5.0,
      amountWordsTopMm: 40,
      amountWordsLeftMm: 32,
      amountWordsWidthMm: 128,
      amountFiguresTopMm: 46,
      amountFiguresLeftMm: 154,
      crossingTopMm: 12,
      crossingLeftMm: 28,
      showCrossLine: true,
      signatoryTopMm: 75,
      signatoryLeftMm: 142,
    },
    {
      id: 'tmpl-icici',
      bankName: 'ICICI Bank Ltd',
      chequeWidthMm: 204,
      chequeHeightMm: 92,
      payeeTopMm: 29,
      payeeLeftMm: 25,
      dateTopMm: 13,
      dateLeftMm: 155,
      dateBoxSpacingMm: 4.9,
      amountWordsTopMm: 39,
      amountWordsLeftMm: 31,
      amountWordsWidthMm: 130,
      amountFiguresTopMm: 45,
      amountFiguresLeftMm: 155,
      crossingTopMm: 10,
      crossingLeftMm: 25,
      showCrossLine: true,
      signatoryTopMm: 74,
      signatoryLeftMm: 145,
    },
    {
      id: 'tmpl-axis',
      bankName: 'Axis Bank Ltd',
      chequeWidthMm: 202,
      chequeHeightMm: 91,
      payeeTopMm: 28,
      payeeLeftMm: 24,
      dateTopMm: 12,
      dateLeftMm: 153,
      dateBoxSpacingMm: 4.8,
      amountWordsTopMm: 38,
      amountWordsLeftMm: 30,
      amountWordsWidthMm: 129,
      amountFiguresTopMm: 44,
      amountFiguresLeftMm: 153,
      crossingTopMm: 11,
      crossingLeftMm: 26,
      showCrossLine: true,
      signatoryTopMm: 73,
      signatoryLeftMm: 144,
    },
    {
      id: 'tmpl-kotak',
      bankName: 'Kotak Mahindra Bank',
      chequeWidthMm: 203,
      chequeHeightMm: 92,
      payeeTopMm: 28,
      payeeLeftMm: 25,
      dateTopMm: 13,
      dateLeftMm: 154,
      dateBoxSpacingMm: 4.8,
      amountWordsTopMm: 38,
      amountWordsLeftMm: 30,
      amountWordsWidthMm: 130,
      amountFiguresTopMm: 44,
      amountFiguresLeftMm: 155,
      crossingTopMm: 10,
      crossingLeftMm: 25,
      showCrossLine: true,
      signatoryTopMm: 74,
      signatoryLeftMm: 145,
    },
  ];
}

function getInitialBooks(tenantId: string): { books: ChequeBook[]; leaves: ChequeLeaf[] } {
  const bookId = 'book-hdfc-01';
  const books: ChequeBook[] = [
    {
      id: bookId,
      tenantId,
      bankLedgerId: 'bank-hdfc-001',
      bankName: 'HDFC Bank Ltd (Current A/c 502000123456)',
      accountNumber: '502000123456',
      bookSeries: 'HDFC/2026/01',
      fromChequeNo: 204501,
      toChequeNo: 204550,
      totalLeaves: 50,
      issuedCount: 3,
      clearedCount: 2,
      cancelledCount: 1,
      availableCount: 44,
      createdAt: '2026-04-01T10:00:00.000Z',
    },
  ];

  const leaves: ChequeLeaf[] = [];
  for (let num = 204501; num <= 204550; num++) {
    const numStr = String(num).padStart(6, '0');
    let status: ChequeLeaf['status'] = 'AVAILABLE';
    let payeeName = undefined;
    let amount = undefined;
    let voucherNumber = undefined;
    let issueDate = undefined;
    let remarks: string | undefined = undefined;

    if (num === 204501) {
      status = 'CLEARED';
      payeeName = 'Bharat Heavy Electricals Ltd';
      amount = 450000;
      voucherNumber = 'PV/26-27/012';
      issueDate = '2026-04-05';
    } else if (num === 204502) {
      status = 'CLEARED';
      payeeName = 'Adani Power & Infra Ltd';
      amount = 185000;
      voucherNumber = 'PV/26-27/028';
      issueDate = '2026-04-12';
    } else if (num === 204503) {
      status = 'ISSUED';
      payeeName = 'Tata Consultancy Services Ltd';
      amount = 125000;
      voucherNumber = 'PV/26-27/045';
      issueDate = '2026-04-18';
    } else if (num === 204504) {
      status = 'CANCELLED';
      remarks = 'Printer misalignment / paper jam';
    }

    leaves.push({
      id: `leaf-${bookId}-${numStr}`,
      tenantId,
      bookId,
      chequeNumber: numStr,
      bankLedgerId: 'bank-hdfc-001',
      status,
      voucherNumber,
      payeeName,
      amount,
      issueDate,
      isCrossed: true,
      remarks: num === 204504 ? 'Printer paper jam' : undefined,
    });
  }

  return { books, leaves };
}

// Convert numbers to Indian Rupees Words
export function numberToIndianWords(amount: number): string {
  const rounded = Math.floor(amount);
  const paise = Math.round((amount - rounded) * 100);

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
  }

  function convertSection(n: number): string {
    let str = '';
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    if (crore > 0) str += convertSection(crore) + ' Crore ';
    if (lakh > 0) str += convertTwoDigits(lakh) + ' Lakh ';
    if (thousand > 0) str += convertTwoDigits(thousand) + ' Thousand ';
    if (hundred > 0) str += units[hundred] + ' Hundred ';
    if (rest > 0) str += convertTwoDigits(rest) + ' ';

    return str.trim();
  }

  let words = rounded === 0 ? 'Zero' : convertSection(rounded);
  words = 'INR ' + words + ' Only';

  if (paise > 0) {
    words = words.replace(' Only', ` and ${convertTwoDigits(paise)} Paise Only`);
  }

  return words;
}

export class ChequeService {
  public static async listChequeBooks(tenantId: string): Promise<ChequeBook[]> {
    const { books } = await getTenantChequeData(tenantId);
    return books;
  }

  public static async addChequeBook(
    tenantId: string,
    payload: {
      bankLedgerId: string;
      bankName: string;
      accountNumber: string;
      bookSeries: string;
      fromChequeNo: number;
      toChequeNo: number;
    }
  ): Promise<ChequeBook> {
    const { books, leaves } = await getTenantChequeData(tenantId);
    const count = payload.toChequeNo - payload.fromChequeNo + 1;
    if (count <= 0) {
      throw new Error('toChequeNo must be greater than or equal to fromChequeNo');
    }

    const newBook: ChequeBook = {
      id: `book-${Date.now()}`,
      tenantId,
      bankLedgerId: payload.bankLedgerId,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      bookSeries: payload.bookSeries,
      fromChequeNo: payload.fromChequeNo,
      toChequeNo: payload.toChequeNo,
      totalLeaves: count,
      issuedCount: 0,
      clearedCount: 0,
      cancelledCount: 0,
      availableCount: count,
      createdAt: new Date().toISOString(),
    };

    for (let i = payload.fromChequeNo; i <= payload.toChequeNo; i++) {
      leaves.push({
        id: `leaf-${newBook.id}-${i}`,
        tenantId,
        bookId: newBook.id,
        chequeNumber: String(i).padStart(6, '0'),
        bankLedgerId: payload.bankLedgerId,
        status: 'AVAILABLE',
        isCrossed: true,
      });
    }

    books.push(newBook);
    await saveTenantChequeData(tenantId, { books, leaves });
    return newBook;
  }

  public static async listCheques(tenantId: string, bookId?: string, status?: string): Promise<ChequeLeaf[]> {
    const { leaves } = await getTenantChequeData(tenantId);
    return leaves.filter((l) => {
      if (bookId && l.bookId !== bookId) return false;
      if (status && l.status !== status) return false;
      return true;
    });
  }

  public static async issueCheque(
    tenantId: string,
    payload: {
      bookId: string;
      chequeNumber?: string;
      voucherNumber: string;
      payeeName: string;
      amount: number;
      issueDate: string;
      isCrossed?: boolean;
      remarks?: string;
    }
  ): Promise<ChequeLeaf> {
    const { books, leaves } = await getTenantChequeData(tenantId);
    let leaf: ChequeLeaf | undefined;

    if (payload.chequeNumber) {
      leaf = leaves.find((l) => l.bookId === payload.bookId && l.chequeNumber === payload.chequeNumber);
    } else {
      leaf = leaves.find((l) => l.bookId === payload.bookId && l.status === 'AVAILABLE');
    }

    if (!leaf) {
      throw new Error('No available cheque leaves found in the selected cheque book');
    }
    if (leaf.status !== 'AVAILABLE') {
      throw new Error(`Cheque #${leaf.chequeNumber} is currently ${leaf.status} and cannot be issued`);
    }

    leaf.status = 'ISSUED';
    leaf.voucherNumber = payload.voucherNumber;
    leaf.payeeName = payload.payeeName;
    leaf.amount = payload.amount;
    leaf.issueDate = payload.issueDate;
    leaf.isCrossed = payload.isCrossed ?? true;
    leaf.remarks = payload.remarks;

    // Update book summary
    const book = books.find((b) => b.id === payload.bookId);
    if (book) {
      book.issuedCount++;
      book.availableCount--;
    }

    await saveTenantChequeData(tenantId, { books, leaves });
    return leaf;
  }

  public static async cancelCheque(
    tenantId: string,
    chequeId: string,
    reason: string
  ): Promise<ChequeLeaf> {
    const { books, leaves } = await getTenantChequeData(tenantId);
    const leaf = leaves.find((l) => l.id === chequeId);
    if (!leaf) {
      throw new Error('Cheque leaf not found');
    }

    const prevStatus = leaf.status;
    leaf.status = 'CANCELLED';
    leaf.remarks = reason;

    const book = books.find((b) => b.id === leaf.bookId);
    if (book) {
      book.cancelledCount++;
      if (prevStatus === 'AVAILABLE') book.availableCount--;
      if (prevStatus === 'ISSUED') book.issuedCount--;
    }

    await saveTenantChequeData(tenantId, { books, leaves });
    return leaf;
  }

  public static async getTemplates(tenantId: string): Promise<ChequePrintTemplate[]> {
    return getTenantTemplates(tenantId);
  }

  public static async saveTemplate(tenantId: string, template: ChequePrintTemplate): Promise<ChequePrintTemplate> {
    const tmpls = await this.getTemplates(tenantId);
    const idx = tmpls.findIndex((t) => t.id === template.id || t.bankName === template.bankName);
    if (idx >= 0) {
      tmpls[idx] = { ...tmpls[idx], ...template };
    } else {
      tmpls.push(template);
    }
    await saveTenantTemplates(tenantId, tmpls);
    return template;
  }

  public static async preparePrintPayload(
    tenantId: string,
    payload: {
      templateId?: string;
      bankName?: string;
      payeeName: string;
      amount: number;
      dateStr: string; // YYYY-MM-DD
      isCrossed?: boolean;
    }
  ) {
    const templates = await this.getTemplates(tenantId);
    let tmpl = payload.templateId ? templates.find((t) => t.id === payload.templateId) : undefined;
    if (!tmpl && payload.bankName) {
      tmpl = templates.find((t) => t.bankName.toLowerCase().includes(payload.bankName!.toLowerCase()));
    }
    if (!tmpl) tmpl = templates[0];

    // Format Date into DD MM YYYY individual digits
    const parts = payload.dateStr.split('-');
    const year = parts[0] || '2026';
    const month = parts[1] || '01';
    const day = parts[2] || '01';
    const dateDigits = `${day}${month}${year}`.split('');

    const words = numberToIndianWords(payload.amount);
    const formattedAmount = '₹ ' + payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    return {
      template: tmpl,
      printData: {
        payeeName: payload.payeeName,
        amountInFigures: formattedAmount,
        amountInWords: words,
        dateDigits,
        isCrossed: payload.isCrossed ?? true,
      },
    };
  }
}
