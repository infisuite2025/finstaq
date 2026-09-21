import React, { useState } from 'react';
import {
  Printer,
  X,
  Download,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Copy,
  Share2,
} from 'lucide-react';
import { numberToIndianWords } from '../../utils/indianNumberToWords';

export type PrintDocumentType =
  | 'PO'
  | 'SO'
  | 'SALES_INVOICE'
  | 'PURCHASE_INVOICE'
  | 'GRN'
  | 'DO'
  | 'JV'
  | 'DEBIT_NOTE'
  | 'CREDIT_NOTE'
  | 'PURCHASE_RETURN'
  | 'SALES_RETURN';

export interface PrintDocumentData {
  type: PrintDocumentType;
  title?: string;
  documentNumber: string;
  date: string;
  dueDate?: string;
  referenceNumber?: string;
  poReference?: string;
  grnReference?: string;
  challanReference?: string;
  eWayBillNumber?: string;
  vehicleNumber?: string;
  transporterName?: string;
  partyName: string;
  partyGstin?: string;
  partyAddress?: string;
  partyState?: string;
  partyContact?: string;
  shippingAddress?: string;
  paymentTerms?: string;
  qcStatus?: string;
  items?: Array<{
    id?: string;
    description: string;
    hsnCode?: string;
    uom?: string;
    quantity: number;
    acceptedQty?: number;
    rejectedQty?: number;
    unitPrice: number;
    discountPercent?: number;
    taxableAmount: number;
    gstRatePercent: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    totalAmount: number;
  }>;
  subtotal: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalTax: number;
  tdsAmount?: number;
  tdsSection?: string;
  roundOff?: number;
  grandTotal: number;
  narration?: string;
  termsAndConditions?: string;
  accountingEntries?: Array<{
    accountName: string;
    debit: number;
    credit: number;
    type: 'Dr' | 'Cr';
  }>;
}

export type UniversalPrintData = PrintDocumentData;

interface UniversalDocumentPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintDocumentData | null;
}

export function UniversalDocumentPrintModal({
  isOpen,
  onClose,
  data,
}: UniversalDocumentPrintModalProps) {
  const [copyType, setCopyType] = useState<string>('ORIGINAL FOR RECIPIENT');

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDocumentHeader = () => {
    switch (data.type) {
      case 'PO':
        return { badge: 'PURCHASE ORDER', subtitle: 'Official Purchase Order & Procurement Contract', color: 'border-blue-600' };
      case 'SO':
        return { badge: 'SALES ORDER', subtitle: 'Order Confirmation & Proforma Acknowledgement', color: 'border-indigo-600' };
      case 'SALES_INVOICE':
        return { badge: 'TAX INVOICE', subtitle: 'Rule 46 - Central Goods and Services Tax Rules, 2017', color: 'border-blue-700' };
      case 'PURCHASE_INVOICE':
        return { badge: 'PURCHASE BILL / AP VOUCHER', subtitle: 'Vendor Bill Booking & Internal Accounts Payable Record', color: 'border-purple-600' };
      case 'GRN':
        return { badge: 'GOODS RECEIPT NOTE (GRP)', subtitle: 'Material Inward Inspection & QC Acceptance Slip', color: 'border-emerald-600' };
      case 'DO':
        return { badge: 'DELIVERY ORDER / CHALLAN', subtitle: 'Rule 55 - Outward Goods Delivery & Transportation Challan', color: 'border-amber-600' };
      case 'JV':
        return { badge: 'JOURNAL VOUCHER', subtitle: 'Double-Entry General Ledger Financial Voucher', color: 'border-slate-800' };
      case 'DEBIT_NOTE':
        return { badge: 'DEBIT NOTE', subtitle: 'Section 34(1) - Purchase Return & Tax Adjustment Note', color: 'border-rose-600' };
      case 'CREDIT_NOTE':
        return { badge: 'CREDIT NOTE', subtitle: 'Section 34(1) - Sales Return & Tax Adjustment Note', color: 'border-emerald-600' };
      case 'PURCHASE_RETURN':
        return { badge: 'PURCHASE RETURN / RETURN OUTWARD', subtitle: 'Rejection & Material Debit Dispatch Note', color: 'border-rose-600' };
      case 'SALES_RETURN':
        return { badge: 'SALES RETURN / RETURN INWARD', subtitle: 'Goods Inward Rejection & QC Credit Slip', color: 'border-amber-600' };
    }
  };

  const headerInfo = getDocumentHeader();
  const amountInWords = numberToIndianWords(data.grandTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:static print:bg-white print:z-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:rounded-none print:my-0 print:max-w-none print:w-full print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Document Print & PDF Preview
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {data.documentNumber} • {data.partyName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <select
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-hidden"
            >
              <option value="ORIGINAL FOR RECIPIENT">Original for Recipient</option>
              <option value="DUPLICATE FOR TRANSPORTER">Duplicate for Transporter</option>
              <option value="TRIPLICATE FOR SUPPLIER">Triplicate for Supplier</option>
              <option value="OFFICE COPY / AUDIT">Office Copy / Audit</option>
            </select>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Canvas (A4 Standard) */}
        <div className="p-8 bg-white text-slate-900 font-sans max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 select-text">
          <div className="border-2 border-slate-900 p-6 space-y-4 print:border-slate-900 text-[11px] leading-relaxed">
            {/* Top Watermark / Copy Badge */}
            <div className="flex justify-between items-center border-b pb-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              <span>GSTIN: 27AABCF1234F1Z5 • CIN: U29100MH2020PLC123456</span>
              <span className="px-2 py-0.5 border border-slate-400 rounded font-black text-slate-900 bg-slate-50">
                {copyType}
              </span>
            </div>

            {/* Company Header & Document Badge */}
            <div className="flex justify-between items-start border-b border-slate-900 pb-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-black text-sm print:bg-slate-900">
                    F
                  </div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    APEX INDUSTRIES LIMITED
                  </h1>
                </div>
                <p className="text-slate-600 text-[10.5px]">
                  Plot 42, MIDC Industrial Area, Chinchwad, Pune - 411019, Maharashtra, India
                </p>
                <div className="text-slate-600 text-[10px] space-x-3">
                  <span><strong>PAN:</strong> AABCF1234F</span>
                  <span><strong>State:</strong> Maharashtra (27)</span>
                  <span><strong>Email:</strong> accounts@apexindustries.com</span>
                </div>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded">
                  {headerInfo.badge}
                </div>
                <div className="text-[9.5px] text-slate-500 italic max-w-xs">
                  {headerInfo.subtitle}
                </div>
                <div className="pt-1 font-mono font-black text-sm text-slate-900">
                  {data.documentNumber}
                </div>
              </div>
            </div>

            {/* Metadata Grid (Bill To, Ship To, Dates, Terms) */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-900 pb-4">
              {/* Left Column: Party Details */}
              <div className="border-r border-slate-200 pr-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {data.type === 'PO' || data.type === 'PURCHASE_INVOICE' || data.type === 'GRN'
                    ? 'Vendor / Supplier Details:'
                    : 'Billed To / Consignee Details:'}
                </div>
                <div className="font-bold text-xs text-slate-900">{data.partyName}</div>
                {data.partyAddress && <div className="text-slate-600">{data.partyAddress}</div>}
                <div className="space-x-3 text-[10.5px]">
                  {data.partyGstin && <span><strong>GSTIN:</strong> {data.partyGstin}</span>}
                  {data.partyState && <span><strong>State:</strong> {data.partyState}</span>}
                </div>
                {data.shippingAddress && (
                  <div className="mt-1 text-[10px] text-slate-500">
                    <strong>Delivery Location:</strong> {data.shippingAddress}
                  </div>
                )}
              </div>

              {/* Right Column: Dates & Logistics */}
              <div className="space-y-1 font-mono text-[10.5px]">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-500">Date:</span>
                  <span className="font-bold">{data.date}</span>
                </div>
                {data.dueDate && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Due Date:</span>
                    <span>{data.dueDate}</span>
                  </div>
                )}
                {data.poReference && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">PO Ref No:</span>
                    <span className="font-bold">{data.poReference}</span>
                  </div>
                )}
                {data.grnReference && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">GRN Ref:</span>
                    <span className="font-bold">{data.grnReference}</span>
                  </div>
                )}
                {data.challanReference && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Challan / DC No:</span>
                    <span>{data.challanReference}</span>
                  </div>
                )}
                {data.vehicleNumber && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Vehicle No:</span>
                    <span>{data.vehicleNumber}</span>
                  </div>
                )}
                {data.eWayBillNumber && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">E-Way Bill No:</span>
                    <span>{data.eWayBillNumber}</span>
                  </div>
                )}
                {data.paymentTerms && (
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-500">Terms:</span>
                    <span className="font-semibold">{data.paymentTerms}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            {data.items && data.items.length > 0 && (
              <div>
                <table className="w-full text-left border border-slate-900 border-collapse text-[10.5px]">
                  <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-8 text-center">#</th>
                      <th className="py-1.5 px-2 border-r border-slate-300">Item Description</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-center">HSN/SAC</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-right">Qty</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-20 text-right">Rate (₹)</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-14 text-right">Disc %</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-20 text-right">Taxable (₹)</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-14 text-center">GST %</th>
                      <th className="py-1.5 px-2 text-right w-24">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-semibold">
                          {it.description}
                          {it.acceptedQty !== undefined && (
                            <div className="text-[9.5px] text-emerald-700 font-normal">
                              Accepted: {it.acceptedQty} {it.uom || 'PCS'} • Rejected: {it.rejectedQty || 0}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{it.hsnCode || '-'}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">
                          {it.quantity} {it.uom || 'PCS'}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">
                          ₹{it.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">
                          {it.discountPercent ? `${it.discountPercent}%` : '-'}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">
                          ₹{it.taxableAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">
                          {it.gstRatePercent}%
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold">
                          ₹{it.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Accounting Entries Table */}
            {data.accountingEntries && data.accountingEntries.length > 0 && (
              <div>
                <div className="font-bold mb-1">General Ledger Double-Entry Matrix:</div>
                <table className="w-full text-left border border-slate-900 border-collapse text-[10.5px]">
                  <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-slate-300 w-10 text-center">Type</th>
                      <th className="py-1.5 px-2 border-r border-slate-300">Ledger / Account Head</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 text-right w-28">Debit (Dr) ₹</th>
                      <th className="py-1.5 px-2 text-right w-28">Credit (Cr) ₹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.accountingEntries.map((e, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold font-mono">
                          {e.type}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-semibold">{e.accountName}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono font-bold">
                          {e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold">
                          {e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary & Tax Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
              <div className="space-y-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px]">
                  <span className="font-bold block text-slate-600">Amount Chargeable (in words):</span>
                  <span className="font-bold text-slate-900 text-[11px]">{amountInWords}</span>
                </div>

                <div className="p-2.5 border border-slate-200 rounded text-[10px] space-y-1 font-mono">
                  <span className="font-bold font-sans block text-slate-600">Company Bank Settlement Details (RTGS/NEFT):</span>
                  <div>Bank Name: HDFC Bank Ltd (Current A/c)</div>
                  <div>A/c No: 50200012345678 • IFSC: HDFC0000123</div>
                  <div>Branch: MIDC Chinchwad Industrial Branch, Pune</div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-sans text-slate-600">Taxable Subtotal:</span>
                  <span className="font-bold">₹{data.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {data.cgstAmount !== undefined && data.cgstAmount > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span className="font-sans text-slate-600">Central GST (CGST):</span>
                    <span>₹{data.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {data.sgstAmount !== undefined && data.sgstAmount > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span className="font-sans text-slate-600">State GST (SGST):</span>
                    <span>₹{data.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {data.igstAmount !== undefined && data.igstAmount > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span className="font-sans text-slate-600">Integrated GST (IGST):</span>
                    <span>₹{data.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {data.tdsAmount !== undefined && data.tdsAmount > 0 && (
                  <div className="flex justify-between py-0.5 text-amber-700">
                    <span className="font-sans">Less: TDS u/s {data.tdsSection || '194Q'}:</span>
                    <span>-₹{data.tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {data.roundOff !== undefined && data.roundOff !== 0 && (
                  <div className="flex justify-between py-0.5 text-slate-500">
                    <span className="font-sans">Round Off:</span>
                    <span>₹{data.roundOff.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t-2 border-slate-900 font-black text-sm text-slate-900">
                  <span className="font-sans">Total Value:</span>
                  <span>₹{data.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Narration & Terms */}
            <div className="text-[10px] text-slate-600 space-y-1 border-t border-slate-200 pt-2">
              <div><strong>Declaration:</strong> We declare that this document shows the actual price of goods/services described and that all particulars are true and correct.</div>
              {data.narration && <div><strong>Narration:</strong> {data.narration}</div>}
              {data.termsAndConditions && <div><strong>Terms:</strong> {data.termsAndConditions}</div>}
            </div>

            {/* Signatory Footer */}
            <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[10px] border-t border-slate-900">
              <div>
                <div className="border-b border-dashed border-slate-400 pb-1 mb-1 font-semibold">
                  Prepared By
                </div>
                <span className="text-slate-400">Authorized Staff</span>
              </div>
              <div>
                <div className="border-b border-dashed border-slate-400 pb-1 mb-1 font-semibold">
                  Checked & Verified
                </div>
                <span className="text-slate-400">Internal Audit</span>
              </div>
              <div>
                <div className="border-b border-dashed border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                  For APEX INDUSTRIES LIMITED
                </div>
                <span className="text-slate-900 font-semibold">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}