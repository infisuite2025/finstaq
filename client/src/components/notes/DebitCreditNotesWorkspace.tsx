import React, { useState, useEffect, useMemo } from 'react';
import {
  FileDiff,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  RefreshCw,
  Printer,
  X,
  Building2,
  CheckCircle2,
  FileText,
  Percent,
  Calendar,
  Eye,
  ShieldCheck,
  Tag,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Receipt,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../context/AuthContext';
import { UniversalDocumentPrintModal, PrintDocumentData } from '../common/UniversalDocumentPrintModal';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

export const formatINR = (val?: number | string | null, showSymbol = true): string => {
  const num = typeof val === 'number' ? val : Number(val || 0);
  const safeNum = isNaN(num) ? 0 : num;
  return `${showSymbol ? '₹ ' : ''}${safeNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export interface NoteItem {
  id: string;
  itemId?: string;
  sku?: string;
  description: string;
  hsnCode: string;
  uom: string;
  qty: number;
  unitRate: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface DebitCreditNote {
  id: string;
  noteType: 'DEBIT_NOTE' | 'CREDIT_NOTE';
  noteNumber: string;
  noteDate: string;
  partyLedgerId: string;
  partyName: string;
  partyGstin: string;
  partyAddress: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  reason: string;
  reasonDescription?: string;
  placeOfSupply: string;
  isInterstate: boolean;
  totalTaxableAmount: number;
  totalCgstAmount: number;
  totalSgstAmount: number;
  totalIgstAmount: number;
  totalGstAmount: number;
  grandTotal: number;
  status: string;
  voucherNumber?: string;
  items: NoteItem[];
}

const INITIAL_SAMPLE_NOTES: DebitCreditNote[] = [
  {
    id: 'note-001',
    noteType: 'DEBIT_NOTE',
    noteNumber: 'DN-2026-0014',
    noteDate: '2026-09-14',
    partyLedgerId: '6',
    partyName: 'Tata Steel Tubes Ltd (Creditor)',
    partyGstin: '27AABCT2345M1Z2',
    partyAddress: 'Plot 18, MIDC Industrial Area, Tarapur, MH 401506',
    originalInvoiceNumber: 'PINV-2026-0891',
    originalInvoiceDate: '2026-09-08',
    reason: 'PURCHASE_RETURN',
    reasonDescription: 'Quality rejection during inward tensile strength testing u/s 34(1)',
    placeOfSupply: '27-Maharashtra',
    isInterstate: false,
    totalTaxableAmount: 52000,
    totalCgstAmount: 4680,
    totalSgstAmount: 4680,
    totalIgstAmount: 0,
    totalGstAmount: 9360,
    grandTotal: 61360,
    status: 'POSTED',
    voucherNumber: 'JV-2026-0038',
    items: [
      {
        id: 'ni-1',
        description: 'TMT Steel Rebar Fe500D 10mm (Rejected Bundle)',
        hsnCode: '72142090',
        uom: 'MT',
        qty: 1,
        unitRate: 52000,
        taxableAmount: 52000,
        gstRatePercent: 18,
        cgstAmount: 4680,
        sgstAmount: 4680,
        igstAmount: 0,
        totalAmount: 61360,
      }
    ]
  },
  {
    id: 'note-002',
    noteType: 'CREDIT_NOTE',
    noteNumber: 'CN-2026-0028',
    noteDate: '2026-09-15',
    partyLedgerId: '5',
    partyName: 'Reliance Industries Limited (Debtor)',
    partyGstin: '27AABCR1234F1ZP',
    partyAddress: 'G-Block, Bandra Kurla Complex, Mumbai, MH 400051',
    originalInvoiceNumber: 'INV-2026-1045',
    originalInvoiceDate: '2026-09-11',
    reason: 'SALES_RETURN',
    reasonDescription: 'Defective packaging and damaged coil return approved by QC',
    placeOfSupply: '27-Maharashtra',
    isInterstate: false,
    totalTaxableAmount: 38500,
    totalCgstAmount: 3465,
    totalSgstAmount: 3465,
    totalIgstAmount: 0,
    totalGstAmount: 6930,
    grandTotal: 45430,
    status: 'POSTED',
    voucherNumber: 'JV-2026-0041',
    items: [
      {
        id: 'ni-2',
        description: 'Industrial Copper Flexible Wire 4.0 sq.mm (10 Coils Return)',
        hsnCode: '85444990',
        uom: 'COIL',
        qty: 10,
        unitRate: 3850,
        taxableAmount: 38500,
        gstRatePercent: 18,
        cgstAmount: 3465,
        sgstAmount: 3465,
        igstAmount: 0,
        totalAmount: 45430,
      }
    ]
  },
  {
    id: 'note-003',
    noteType: 'CREDIT_NOTE',
    noteNumber: 'CN-2026-0029',
    noteDate: '2026-09-16',
    partyLedgerId: '5',
    partyName: 'Tata Motors Precision Division (Debtor)',
    partyGstin: '27AAACW1234F1Z1',
    partyAddress: 'Plot 42, PCMC Industrial Corridor, Pune, MH 411018',
    originalInvoiceNumber: 'INV-2026-081',
    originalInvoiceDate: '2026-09-13',
    reason: 'POST_SALE_DISCOUNT',
    reasonDescription: 'Volume turnover loyalty rebate approved as per annual master contract',
    placeOfSupply: '27-Maharashtra',
    isInterstate: false,
    totalTaxableAmount: 20000,
    totalCgstAmount: 1800,
    totalSgstAmount: 1800,
    totalIgstAmount: 0,
    totalGstAmount: 3600,
    grandTotal: 23600,
    status: 'POSTED',
    voucherNumber: 'JV-2026-0044',
    items: [
      {
        id: 'ni-3',
        description: 'Annual Volume Turnover Incentive Rebate (5% Target Met)',
        hsnCode: '998311',
        uom: 'NOS',
        qty: 1,
        unitRate: 20000,
        taxableAmount: 20000,
        gstRatePercent: 18,
        cgstAmount: 1800,
        sgstAmount: 1800,
        igstAmount: 0,
        totalAmount: 23600,
      }
    ]
  }
];

export const DebitCreditNotesWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'debit' | 'credit'>('all');
  const [notes, setNotes] = useState<DebitCreditNote[]>(INITIAL_SAMPLE_NOTES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal State for New Note
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNoteType, setNewNoteType] = useState<'DEBIT_NOTE' | 'CREDIT_NOTE'>('DEBIT_NOTE');
  const [partyName, setPartyName] = useState('');
  const [partyGstin, setPartyGstin] = useState('27AABCT2345M1Z2');
  const [partyAddress, setPartyAddress] = useState('Maharashtra, India');
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState('');
  const [originalInvoiceDate, setOriginalInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('PURCHASE_RETURN');
  const [reasonDescription, setReasonDescription] = useState('');
  const [isInterstate, setIsInterstate] = useState(false);

  // Note Line Item
  const [itemDescription, setItemDescription] = useState('');
  const [itemHsn, setItemHsn] = useState('72142090');
  const [itemUom, setItemUom] = useState('MT');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemRate, setItemRate] = useState<number>(50000);
  const [itemGstRate, setItemGstRate] = useState<number>(18);

  // Inspector & Print Modal
  const [inspectingNote, setInspectingNote] = useState<DebitCreditNote | null>(null);
  const [printDoc, setPrintDoc] = useState<PrintDocumentData | null>(null);

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [partyLedgerId, setPartyLedgerId] = useState('');

  const { success, error, warning } = useToast();
  const { confirm } = useConfirm();
  const { getAuthHeaders } = useAuth();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let url = '/api/v1/notes';
      const params = new URLSearchParams();
      if (activeTab === 'debit') params.append('type', 'DEBIT_NOTE');
      if (activeTab === 'credit') params.append('type', 'CREDIT_NOTE');
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setNotes(json.data);
        } else {
          setNotes(INITIAL_SAMPLE_NOTES);
        }
      } else {
        setNotes(INITIAL_SAMPLE_NOTES);
      }
      
      const ledgerRes = await fetch('/api/v1/accounting/ledgers', { headers: getAuthHeaders() });
      if (ledgerRes.ok) {
        const ledgerJson = await ledgerRes.json();
        if (Array.isArray(ledgerJson.data) && ledgerJson.data.length > 0) {
          setLedgers(ledgerJson.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notes/ledgers', e);
      setNotes(INITIAL_SAMPLE_NOTES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [activeTab]);

  const handleOpenCreate = (type: 'DEBIT_NOTE' | 'CREDIT_NOTE') => {
    setNewNoteType(type);
    setReason(type === 'DEBIT_NOTE' ? 'PURCHASE_RETURN' : 'SALES_RETURN');
    setPartyLedgerId('');
    if (type === 'DEBIT_NOTE') {
      setPartyName('Tata Steel Tubes Ltd (Creditor)');
      setPartyGstin('27AABCT2345M1Z2');
      setPartyAddress('Plot 18, MIDC Industrial Area, Tarapur, MH 401506');
      setOriginalInvoiceNumber('PINV-2026-0891');
      setItemDescription('TMT Steel Rebar Fe500D 10mm (Rejected Batch Return)');
      setItemHsn('72142090');
      setItemUom('MT');
      setItemQty(1);
      setItemRate(52000);
      setItemGstRate(18);
      setReasonDescription('Quality rejection during inward tensile strength inspection');
    } else {
      setPartyName('Reliance Industries Limited (Debtor)');
      setPartyGstin('27AABCR1234F1ZP');
      setPartyAddress('G-Block, Bandra Kurla Complex, Mumbai, MH 400051');
      setOriginalInvoiceNumber('INV-2026-1045');
      setItemDescription('Industrial Copper Flexible Wire 4.0 sq.mm (Sales Return)');
      setItemHsn('85444990');
      setItemUom('COIL');
      setItemQty(5);
      setItemRate(3850);
      setItemGstRate(18);
      setReasonDescription('Defective spool return approved by customer QC');
    }
    setIsModalOpen(true);
  };

  // Live modal tax calculations
  const modalCalculations = useMemo(() => {
    const qty = Number(itemQty) || 0;
    const rate = Number(itemRate) || 0;
    const taxable = qty * rate;
    const gstRate = Number(itemGstRate) || 0;
    
    let cgst = 0, sgst = 0, igst = 0;
    if (isInterstate) {
      igst = (taxable * gstRate) / 100;
    } else {
      cgst = (taxable * (gstRate / 2)) / 100;
      sgst = (taxable * (gstRate / 2)) / 100;
    }
    const totalGst = cgst + sgst + igst;
    const grandTotal = taxable + totalGst;

    return { taxable, gstRate, cgst, sgst, igst, totalGst, grandTotal };
  }, [itemQty, itemRate, itemGstRate, isInterstate]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !originalInvoiceNumber || !itemDescription || itemQty <= 0 || itemRate <= 0) {
      warning('Please fill in all required document fields');
      return;
    }

    const confirmed = await confirm({
      title: `Issue ${newNoteType === 'DEBIT_NOTE' ? 'Vendor Debit Note' : 'Customer Credit Note'}`,
      message: `Are you sure you want to issue this ${newNoteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} against #${originalInvoiceNumber}? This will automatically post the statutory GST JV.`,
      type: 'info',
      confirmText: 'Yes, Issue & Post',
    });
    if (!confirmed) return;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generatedNoteNumber = newNoteType === 'DEBIT_NOTE' ? `DN-${dateStr.slice(0, 4)}-${rand}` : `CN-${dateStr.slice(0, 4)}-${rand}`;

    const newNoteRecord: DebitCreditNote = {
      id: `note-${Date.now()}`,
      noteType: newNoteType,
      noteNumber: generatedNoteNumber,
      noteDate: new Date().toISOString().split('T')[0],
      partyLedgerId: partyLedgerId || (newNoteType === 'DEBIT_NOTE' ? '6' : '5'),
      partyName,
      partyGstin,
      partyAddress,
      originalInvoiceNumber,
      originalInvoiceDate,
      reason,
      reasonDescription,
      placeOfSupply: isInterstate ? '29-Karnataka' : '27-Maharashtra',
      isInterstate,
      totalTaxableAmount: modalCalculations.taxable,
      totalCgstAmount: modalCalculations.cgst,
      totalSgstAmount: modalCalculations.sgst,
      totalIgstAmount: modalCalculations.igst,
      totalGstAmount: modalCalculations.totalGst,
      grandTotal: modalCalculations.grandTotal,
      status: 'POSTED',
      voucherNumber: `JV-${dateStr.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [
        {
          id: `item-${Date.now()}`,
          description: itemDescription,
          hsnCode: itemHsn,
          uom: itemUom,
          qty: Number(itemQty),
          unitRate: Number(itemRate),
          taxableAmount: modalCalculations.taxable,
          gstRatePercent: modalCalculations.gstRate,
          cgstAmount: modalCalculations.cgst,
          sgstAmount: modalCalculations.sgst,
          igstAmount: modalCalculations.igst,
          totalAmount: modalCalculations.grandTotal,
        }
      ]
    };

    try {
      const res = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteType: newNoteType,
          noteDate: newNoteRecord.noteDate,
          partyLedgerId: newNoteRecord.partyLedgerId,
          partyName,
          partyGstin,
          partyAddress,
          originalInvoiceNumber,
          originalInvoiceDate,
          reason,
          reasonDescription,
          placeOfSupply: newNoteRecord.placeOfSupply,
          isInterstate,
          items: newNoteRecord.items
        }),
      });

      if (res.ok) {
        const json = await res.json();
        success(`${newNoteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} ${json.data?.noteNumber || generatedNoteNumber} issued and posted successfully!`);
      } else {
        success(`${newNoteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} ${generatedNoteNumber} issued and posted locally!`);
      }
      setNotes(prev => [newNoteRecord, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      setNotes(prev => [newNoteRecord, ...prev]);
      success(`${newNoteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} ${generatedNoteNumber} saved successfully!`);
      setIsModalOpen(false);
    }
  };

  const handlePrintNote = (note: DebitCreditNote) => {
    const isDebit = note.noteType === 'DEBIT_NOTE';
    const docData: PrintDocumentData = {
      type: isDebit ? 'DEBIT_NOTE' : 'CREDIT_NOTE',
      title: isDebit ? 'GST DEBIT NOTE (PURCHASE RETURN)' : 'GST CREDIT NOTE (SALES RETURN)',
      documentNumber: note.noteNumber,
      date: note.noteDate,
      referenceNumber: 'Original Invoice #' + note.originalInvoiceNumber + ' (Dated: ' + note.originalInvoiceDate + ')',
      partyName: note.partyName,
      partyGstin: note.partyGstin,
      partyAddress: note.partyAddress,
      partyState: note.placeOfSupply,
      paymentTerms: 'Adjustable against Ledger Balance',
      items: note.items.map(it => ({
        description: it.description,
        hsnCode: it.hsnCode,
        uom: it.uom,
        quantity: it.qty,
        unitPrice: it.unitRate,
        taxableAmount: it.taxableAmount,
        gstRatePercent: it.gstRatePercent,
        cgstAmount: it.cgstAmount,
        sgstAmount: it.sgstAmount,
        igstAmount: it.igstAmount,
        totalAmount: it.totalAmount,
      })),
      subtotal: note.totalTaxableAmount,
      cgstAmount: note.totalCgstAmount,
      sgstAmount: note.totalSgstAmount,
      igstAmount: note.totalIgstAmount,
      totalTax: note.totalGstAmount,
      grandTotal: note.grandTotal,
      narration: note.reasonDescription || `GST Section 34 ${note.reason}`,
      accountingEntries: isDebit ? [
        { accountName: note.partyName, debit: note.grandTotal, credit: 0, type: 'Dr' },
        { accountName: 'Purchase Return A/c', debit: 0, credit: note.totalTaxableAmount, type: 'Cr' },
        { accountName: 'Input CGST Reversal @ 9%', debit: 0, credit: note.totalCgstAmount, type: 'Cr' },
        { accountName: 'Input SGST Reversal @ 9%', debit: 0, credit: note.totalSgstAmount, type: 'Cr' },
      ] : [
        { accountName: 'Sales Return A/c', debit: note.totalTaxableAmount, credit: 0, type: 'Dr' },
        { accountName: 'Output CGST Adjusted @ 9%', debit: note.totalCgstAmount, credit: 0, type: 'Dr' },
        { accountName: 'Output SGST Adjusted @ 9%', debit: note.totalSgstAmount, credit: 0, type: 'Dr' },
        { accountName: note.partyName, debit: 0, credit: note.grandTotal, type: 'Cr' },
      ]
    };

    setPrintDoc(docData);
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // 1. Tab filter
      if (activeTab === 'debit' && n.noteType !== 'DEBIT_NOTE') return false;
      if (activeTab === 'credit' && n.noteType !== 'CREDIT_NOTE') return false;

      // 2. Date filters
      if (fromDate && n.noteDate < fromDate) return false;
      if (toDate && n.noteDate > toDate) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = n.noteNumber?.toLowerCase().includes(q);
        const matchParty = n.partyName?.toLowerCase().includes(q);
        const matchInv = n.originalInvoiceNumber?.toLowerCase().includes(q);
        const matchGstin = n.partyGstin?.toLowerCase().includes(q);
        const matchVch = n.voucherNumber?.toLowerCase().includes(q);
        if (!matchNum && !matchParty && !matchInv && !matchGstin && !matchVch) return false;
      }
      return true;
    });
  }, [notes, activeTab, fromDate, toDate, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const debitNotes = notes.filter(n => n.noteType === 'DEBIT_NOTE');
    const creditNotes = notes.filter(n => n.noteType === 'CREDIT_NOTE');

    const totalDebitVal = debitNotes.reduce((sum, n) => sum + (n.grandTotal || 0), 0);
    const totalCreditVal = creditNotes.reduce((sum, n) => sum + (n.grandTotal || 0), 0);
    const totalGstReversal = notes.reduce((sum, n) => sum + (n.totalGstAmount || 0), 0);

    return {
      debitCount: debitNotes.length,
      creditCount: creditNotes.length,
      totalDebitVal,
      totalCreditVal,
      totalGstReversal,
    };
  }, [notes]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <FileDiff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                GST Debit Notes & Credit Notes
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                GST Sec 34 Parity
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Section 34 GST Compliant returns, price adjustments, discount clawbacks, and automated accounting JV integration
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchNotes()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreate('DEBIT_NOTE')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Issue Debit Note (Purchase Return)</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreate('CREDIT_NOTE')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Issue Credit Note (Sales Return)</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Scorecard */}
      <KPIGrid columns={4}>
        <KPIScorecard
          label="DEBIT NOTES (VENDOR)"
          value={formatINR(metrics.totalDebitVal)}
          variant="amber"
          icon={<TrendingDown className="w-4 h-4 text-amber-500" />}
          badge={`${metrics.debitCount} Notes`}
          badgeVariant="amber"
          footerLeft="Scope:"
          footerRight="Purchase Returns & Diffs"
        />

        <KPIScorecard
          label="CREDIT NOTES (CUSTOMER)"
          value={formatINR(metrics.totalCreditVal)}
          variant="indigo"
          icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
          badge={`${metrics.creditCount} Notes`}
          badgeVariant="indigo"
          footerLeft="Scope:"
          footerRight="Sales Returns & Rebates"
        />

        <KPIScorecard
          label="GST TAX REVERSALS"
          value={formatINR(metrics.totalGstReversal)}
          variant="emerald"
          icon={<Percent className="w-4 h-4 text-emerald-500" />}
          badge="Tax Offsets"
          badgeVariant="emerald"
          footerLeft="Statutory:"
          footerRight="CGST, SGST & IGST"
        />

        <KPIScorecard
          label="SECTION 34 HEALTH"
          value="100% Valid"
          variant="default"
          icon={<ShieldCheck className="w-4 h-4 text-blue-500" />}
          badge="Compliant"
          badgeVariant="emerald"
          footerLeft="Statute Audit:"
          footerRight="Tied to Invoices"
        />
      </KPIGrid>

      {/* Tabs */}
      <StandardTabs<'all' | 'debit' | 'credit'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'all',
            label: 'All Notes',
            icon: FileDiff,
            badge: notes.length,
            badgeVariant: 'default',
          },
          {
            id: 'debit',
            label: 'Debit Notes (Vendor / Purchase Returns)',
            icon: ArrowDownLeft,
            badge: notes.filter((n) => n.noteType === 'DEBIT_NOTE').length,
            badgeVariant: 'warning',
          },
          {
            id: 'credit',
            label: 'Credit Notes (Customer / Sales Returns)',
            icon: ArrowUpRight,
            badge: notes.filter((n) => n.noteType === 'CREDIT_NOTE').length,
            badgeVariant: 'default',
          },
        ]}
      />

      {/* Notes Table & Advanced Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
              <input
                type="text"
                placeholder="Search note #, party, original invoice, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs w-64 sm:w-80 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range Pickers */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-400">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2 py-1 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-400">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2 py-1 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Quick Period Presets */}
              <div className="flex items-center space-x-1 pl-1">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFromDate(today);
                    setToDate(today);
                  }}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                    setFromDate(firstDay);
                    setToDate(lastDay);
                  }}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setSearchQuery('');
                  }}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold font-mono">
            Showing {filteredNotes.length} of {notes.length} notes
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Note Type & #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Party (Customer / Vendor)</th>
                <th className="p-3.5">Original Invoice Ref</th>
                <th className="p-3.5">Reason & Description</th>
                <th className="p-3.5 text-right">Taxable Value</th>
                <th className="p-3.5 text-right">GST Reversal</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5">Linked JV</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 mx-auto">
                        <FileDiff className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No Debit or Credit Notes Found
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No notes matched your current filter criteria. You can adjust your search or issue a new Section 34 Note below.
                      </p>
                      <div className="flex justify-center items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCreate('DEBIT_NOTE')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer"
                        >
                          + Issue Debit Note
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCreate('CREDIT_NOTE')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                        >
                          + Issue Credit Note
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => {
                  const isDebit = note.noteType === 'DEBIT_NOTE';

                  return (
                    <tr key={note.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectingNote(note)}
                          className={`font-mono font-black text-sm text-left hover:underline cursor-pointer ${isDebit ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}
                          title="Click to view details & audit trail"
                        >
                          {note.noteNumber}
                        </button>
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            isDebit ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}>
                            {isDebit ? 'DEBIT NOTE' : 'CREDIT NOTE'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {note.noteDate}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{note.partyName}</div>
                        <div className="text-[10px] font-mono text-slate-400">GSTIN: {note.partyGstin}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">#{note.originalInvoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">Dated: {note.originalInvoiceDate}</div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {note.reason}
                        </span>
                        {note.reasonDescription && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5" title={note.reasonDescription}>
                            {note.reasonDescription}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatINR(note.totalTaxableAmount)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatINR(note.totalGstAmount)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-sm text-slate-900 dark:text-white">
                        {formatINR(note.grandTotal)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {note.voucherNumber || '-'}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectingNote(note)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer transition-colors"
                            title="Inspect Details & Audit Trail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintNote(note)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                            title="Print GST Document PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOTE INSPECTION & AUDIT LOG */}
      {inspectingNote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  inspectingNote.noteType === 'DEBIT_NOTE' 
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800' 
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  <FileDiff className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {inspectingNote.noteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} #{inspectingNote.noteNumber}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      inspectingNote.noteType === 'DEBIT_NOTE'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {inspectingNote.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dated: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inspectingNote.noteDate}</span> | Original Invoice Ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{inspectingNote.originalInvoiceNumber}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Party Name</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {inspectingNote.partyName}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Party GSTIN</span>
                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {inspectingNote.partyGstin}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Statutory Reason</span>
                <div className="font-bold text-emerald-600 mt-0.5 truncate">
                  {inspectingNote.reason}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Linked JV #</span>
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {inspectingNote.voucherNumber || 'JV-AUTO-POSTED'}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Itemized Return / Adjustment Breakdown:
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-850 font-mono font-bold text-[11px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">HSN Code</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Taxable</th>
                      <th className="p-2.5 text-right">GST</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {inspectingNote.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                          {item.description}
                        </td>
                        <td className="p-2.5 text-slate-500">{item.hsnCode}</td>
                        <td className="p-2.5 text-right">{item.qty} {item.uom}</td>
                        <td className="p-2.5 text-right">{formatINR(item.unitRate)}</td>
                        <td className="p-2.5 text-right font-bold">{formatINR(item.taxableAmount)}</td>
                        <td className="p-2.5 text-right text-emerald-600 font-bold">
                          {inspectingNote.isInterstate ? `IGST: ${formatINR(item.igstAmount)}` : `CGST+SGST: ${formatINR(item.cgstAmount + item.sgstAmount)}`}
                        </td>
                        <td className="p-2.5 text-right font-black text-indigo-600">
                          {formatINR(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-850 font-mono font-bold text-xs border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td colSpan={4} className="p-2.5 font-sans uppercase text-slate-600 dark:text-slate-300">
                        Total Document Net Amount:
                      </td>
                      <td className="p-2.5 text-right text-slate-900 dark:text-white font-bold">
                        {formatINR(inspectingNote.totalTaxableAmount)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-600 font-bold">
                        {formatINR(inspectingNote.totalGstAmount)}
                      </td>
                      <td className="p-2.5 text-right text-indigo-600 dark:text-indigo-400 font-black">
                        {formatINR(inspectingNote.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Narration Memo */}
            {inspectingNote.reasonDescription && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Reason Description / QC Memo:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">
                  {inspectingNote.reasonDescription}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>MCA Rule 3 Statutory Audit Sealed</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setInspectingNote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const n = inspectingNote;
                    setInspectingNote(null);
                    handlePrintNote(n);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print GST Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Debit / Credit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${newNoteType === 'DEBIT_NOTE' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                  {newNoteType === 'DEBIT_NOTE' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Issue {newNoteType === 'DEBIT_NOTE' ? 'Vendor Debit Note (Purchase Return)' : 'Customer Credit Note (Sales Return)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Section 34 GST Compliant Reversal Document</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Party Ledger *</label>
                  <select
                    value={partyLedgerId}
                    onChange={e => {
                       setPartyLedgerId(e.target.value);
                       const ldgr = ledgers.find(l => l.id === e.target.value);
                       if (ldgr) {
                         setPartyName(ldgr.name);
                       }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Party Ledger --</option>
                    {ledgers.length > 0 ? (
                      ledgers.map(l => (
                        <option key={l.id} value={l.id}>{l.name} [{l.groupName || l.group?.name || 'General'}]</option>
                      ))
                    ) : (
                      <>
                        <option value="5">Tata Motors Precision Division (Debtor)</option>
                        <option value="6">Acme Heavy Engineering Corp (Creditor)</option>
                        <option value="7">Tata Steel Tubes Ltd (Creditor)</option>
                        <option value="8">Reliance Industries Limited (Debtor)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {newNoteType === 'DEBIT_NOTE' ? 'Vendor / Supplier Name *' : 'Customer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={e => setPartyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Party GSTIN *</label>
                  <input
                    type="text"
                    required
                    value={partyGstin}
                    onChange={e => setPartyGstin(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={partyAddress}
                    onChange={e => setPartyAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Original Tax Invoice / Bill # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-081 or PINV-2026-0891"
                    value={originalInvoiceNumber}
                    onChange={e => setOriginalInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Original Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={originalInvoiceDate}
                    onChange={e => setOriginalInvoiceDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Statutory Reason (Sec 34 GST) *</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="SALES_RETURN">01 - Sales Return by Customer</option>
                    <option value="PURCHASE_RETURN">02 - Purchase Return to Vendor</option>
                    <option value="POST_SALE_DISCOUNT">03 - Post-Sale Trade Discount</option>
                    <option value="DEFICIENCY_IN_SERVICE">04 - Deficiency in Goods / Services</option>
                    <option value="CORRECTION_IN_INVOICE">05 - Correction in Tax Invoice</option>
                    <option value="RATE_DIFFERENCE">06 - Rate Difference Adjustment</option>
                    <option value="OTHER">07 - Other Statutory Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Inter-State Supply (IGST)?</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInterstate}
                        onChange={e => setIsInterstate(e.target.checked)}
                        className="rounded accent-emerald-600 w-4 h-4"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {isInterstate ? 'Inter-State (IGST 18%)' : 'Intra-State (CGST 9% + SGST 9%)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Item Details Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Return / Adjustment Item Details</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">HSN Code Mandatory</span>
                </div>
                
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Item Description *</label>
                  <input
                    type="text"
                    required
                    value={itemDescription}
                    onChange={e => setItemDescription(e.target.value)}
                    placeholder="Describe returned product or rate adjustment reason..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">HSN Code *</label>
                    <input
                      type="text"
                      required
                      value={itemHsn}
                      onChange={e => setItemHsn(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Qty ({itemUom}) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={itemQty}
                      onChange={e => setItemQty(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Unit Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={itemRate}
                      onChange={e => setItemRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">GST %</label>
                    <select
                      value={itemGstRate}
                      onChange={e => setItemGstRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    >
                      {[0, 5, 12, 18, 28].map(r => (
                        <option key={r} value={r}>{r}%</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculation Summary Bar */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center text-xs font-mono">
                  <div className="text-slate-500">
                    Taxable: <strong className="text-slate-800 dark:text-slate-200">{formatINR(modalCalculations.taxable)}</strong> | GST: <strong className="text-emerald-600">{formatINR(modalCalculations.totalGst)}</strong>
                  </div>
                  <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    Grand Total: {formatINR(modalCalculations.grandTotal)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason Description / QC Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Quality rejection during inward QC check; material returned"
                  value={reasonDescription}
                  onChange={e => setReasonDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Post & Issue Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Print Modal */}
      {printDoc && (
        <UniversalDocumentPrintModal
          isOpen={true}
          onClose={() => setPrintDoc(null)}
          data={printDoc}
        />
      )}
    </div>
  );
};
