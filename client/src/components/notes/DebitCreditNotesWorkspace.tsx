import React, { useState, useEffect } from 'react';
import {
  FileDiff,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  RefreshCw,
  Printer,
  X,
  Building,
  CheckCircle2,
  FileText,
  Percent,
  Calendar
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../context/AuthContext';
import { UniversalDocumentPrintModal, PrintDocumentData } from '../common/UniversalDocumentPrintModal';
import { StandardTabs } from '../common/StandardTabs';

interface NoteItem {
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

interface DebitCreditNote {
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

export const DebitCreditNotesWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'debit' | 'credit'>('all');
  const [notes, setNotes] = useState<DebitCreditNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for New Note
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNoteType, setNewNoteType] = useState<'DEBIT_NOTE' | 'CREDIT_NOTE'>('DEBIT_NOTE');
  const [partyName, setPartyName] = useState('');
  const [partyGstin, setPartyGstin] = useState('27AABCT2345M1Z2');
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

  // Print Modal
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
        setNotes(Array.isArray(json.data) ? json.data : []);
      } else {
        setNotes([]);
      }
      
      const ledgerRes = await fetch('/api/v1/accounting/ledgers', { headers: getAuthHeaders() });
      if (ledgerRes.ok) {
        const ledgerJson = await ledgerRes.json();
        setLedgers(Array.isArray(ledgerJson.data) ? ledgerJson.data : []);
      }
    } catch (e) {
      console.error('Failed to fetch notes/ledgers', e);
      setNotes([]);
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
      setPartyName('Tata Steel Tubes Ltd');
      setPartyGstin('27AABCT2345M1Z2');
      setItemDescription('TMT Steel Rebar 10mm (Rejected Batch Return)');
      setItemRate(52000);
    } else {
      setPartyName('Reliance Industries Ltd');
      setPartyGstin('27AABCR1234F1ZP');
      setItemDescription('Industrial Copper Flexible Wire 4.0 sq.mm (Sales Return)');
      setItemRate(3850);
      setItemUom('COIL');
    }
    setIsModalOpen(true);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyLedgerId || !partyName || !originalInvoiceNumber || !itemDescription || itemQty <= 0 || itemRate <= 0) {
      warning('Please fill in all required document fields, including Party Ledger');
      return;
    }

    const confirmed = await confirm({
      title: `Issue ${newNoteType === 'DEBIT_NOTE' ? 'Vendor Debit Note' : 'Customer Credit Note'}`,
      message: `Are you sure you want to issue this ${newNoteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} against #${originalInvoiceNumber}? This will automatically post the accounting JV.`,
      type: 'info',
      confirmText: 'Yes, Issue & Post',
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteType: newNoteType,
          noteDate: new Date().toISOString().split('T')[0],
          partyLedgerId,
          partyName,
          partyGstin,
          partyAddress: 'Maharashtra, India',
          originalInvoiceNumber,
          originalInvoiceDate,
          reason,
          reasonDescription,
          placeOfSupply: '27-Maharashtra',
          isInterstate,
          items: [
            {
              description: itemDescription,
              hsnCode: itemHsn,
              uom: itemUom,
              qty: Number(itemQty),
              unitRate: Number(itemRate),
              gstRatePercent: Number(itemGstRate),
            }
          ]
        }),
      });

      const json = await res.json();
      if (json.success) {
        success(`${newNoteType === 'DEBIT_NOTE' ? 'Debit Note' : 'Credit Note'} ${json.data.noteNumber} issued and posted successfully!`);
        setIsModalOpen(false);
        fetchNotes();
      } else {
        error(json.error || 'Failed to issue note');
      }
    } catch (err: any) {
      error(err.message || 'Network error');
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
    };

    setPrintDoc(docData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileDiff className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              GST Debit Notes & Credit Notes
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Section 34 GST Compliant returns, price adjustments, discount clawbacks, and automated accounting JV integration
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchNotes()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleOpenCreate('DEBIT_NOTE')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 rounded-xl shadow-md transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            + Issue Debit Note (Purchase Return)
          </button>
          <button
            onClick={() => handleOpenCreate('CREDIT_NOTE')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 rounded-xl shadow-md transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            + Issue Credit Note (Sales Return)
          </button>
        </div>
      </div>

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

      {/* Notes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search note #, party, original invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchNotes()}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs w-64 sm:w-80"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Showing {notes.length} notes registered
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {notes.map((note) => {
                const isDebit = note.noteType === 'DEBIT_NOTE';

                return (
                  <tr key={note.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className={`font-mono font-black text-sm ${isDebit ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {note.noteNumber}
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        isDebit ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}>
                        {isDebit ? 'DEBIT NOTE' : 'CREDIT NOTE'}
                      </span>
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
                      ₹ {note.totalTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                      ₹ {note.totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-sm text-slate-900 dark:text-white">
                      ₹ {note.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {note.voucherNumber || '-'}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handlePrintNote(note)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                        title="Print GST Document PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Debit / Credit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-indigo-600" />
                Issue {newNoteType === 'DEBIT_NOTE' ? 'Vendor Debit Note (Purchase Return)' : 'Customer Credit Note (Sales Return)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Party Ledger</label>
                  <select
                    required
                    value={partyLedgerId}
                    onChange={e => {
                       setPartyLedgerId(e.target.value);
                       const ldgr = ledgers.find(l => l.id === e.target.value);
                       if (ldgr) setPartyName(ldgr.name);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Ledger</option>
                    {ledgers.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {newNoteType === 'DEBIT_NOTE' ? 'Vendor / Supplier Name' : 'Customer Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={e => setPartyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Party GSTIN</label>
                  <input
                    type="text"
                    required
                    value={partyGstin}
                    onChange={e => setPartyGstin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Original Tax Invoice / Bill #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SI-2026-089 or INV-TS-9801"
                    value={originalInvoiceNumber}
                    onChange={e => setOriginalInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Original Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={originalInvoiceDate}
                    onChange={e => setOriginalInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Statutory Reason (Sec 34 GST)</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="SALES_RETURN">01 - Sales Return by Customer</option>
                    <option value="PURCHASE_RETURN">02 - Purchase Return to Vendor</option>
                    <option value="POST_SALE_DISCOUNT">03 - Post-Sale Trade Discount</option>
                    <option value="DEFICIENCY_IN_SERVICE">04 - Deficiency in Goods/Services</option>
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
                        className="rounded text-indigo-600"
                      />
                      <span>Yes, Inter-State (IGST 18%)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200">Return / Adjustment Item Details</div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Item Description</label>
                  <input
                    type="text"
                    required
                    value={itemDescription}
                    onChange={e => setItemDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">HSN Code</label>
                    <input
                      type="text"
                      value={itemHsn}
                      onChange={e => setItemHsn(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Qty ({itemUom})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={itemQty}
                      onChange={e => setItemQty(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">Unit Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={itemRate}
                      onChange={e => setItemRate(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">GST Rate (%)</label>
                    <input
                      type="number"
                      value={itemGstRate}
                      onChange={e => setItemGstRate(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 text-right font-bold text-slate-900 dark:text-white">
                  Estimated Total with Tax: ₹ {((itemQty * itemRate) * (1 + itemGstRate / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason Description / QC Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Quality rejection during inward QC check; material returned"
                  value={reasonDescription}
                  onChange={e => setReasonDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Post & Issue Note
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
