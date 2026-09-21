import React, { useState } from 'react';
import { PurchaseOrder, GoodsReceiptNote, PurchaseInvoice, PurchaseInvoiceItem } from '../../types/purchase';
import { X, Plus, Trash2, Receipt, ShieldCheck, Calculator, ArrowRight, Building, FileSpreadsheet } from 'lucide-react';

interface VendorOption {
  id: string;
  name: string;
  gstin: string;
  state: string;
  defaultTerms: string;
}

const DEMO_VENDORS: VendorOption[] = [
  { id: 'v-101', name: 'Stark Logistics & Supplies (Creditor)', gstin: '27AABCS1429B1Z8', state: 'Maharashtra (27) - Intra-State', defaultTerms: 'Net 30 Days' },
  { id: 'v-102', name: 'Acme Heavy Engineering Corp', gstin: '24AACCA9918M1Z2', state: 'Gujarat (24) - Inter-State (IGST)', defaultTerms: 'Immediate / Net 15 Days' },
  { id: 'v-103', name: 'Precision Tools & Dies Pvt Ltd', gstin: '27AABCP7721K1Z1', state: 'Maharashtra (27) - Intra-State', defaultTerms: 'Net 30 Days' },
];

interface FormItem {
  description: string;
  hsnCode: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRatePercent: number;
}

interface BookPurchaseInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoice: Partial<PurchaseInvoice>) => void;
  existingPos: PurchaseOrder[];
  existingGrns: GoodsReceiptNote[];
  existingInvoices?: PurchaseInvoice[];
}

export function BookPurchaseInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
  existingPos,
  existingGrns,
  existingInvoices = [],
}: BookPurchaseInvoiceModalProps) {
  const [vendorLedgerId, setVendorLedgerId] = useState<string>(DEMO_VENDORS[0].id);
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('2026-10-15');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days');
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [selectedGrnId, setSelectedGrnId] = useState<string>('');
  const [tdsSection, setTdsSection] = useState<string>('194Q');
  const [remarks, setRemarks] = useState<string>('');

  const [items, setItems] = useState<FormItem[]>([
    {
      description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
      hsnCode: '7318',
      uom: 'PCS',
      quantity: 10,
      unitPrice: 4500,
      discountPercent: 0,
      taxRatePercent: 18,
    },
  ]);

  if (!isOpen) return null;

  
  const isDuplicateVendorInvoice = existingInvoices.some(
    (inv) =>
      inv.vendorLedgerId === vendorLedgerId &&
      inv.vendorInvoiceNumber.trim().toLowerCase() === vendorInvoiceNumber.trim().toLowerCase()
  );
  
  const selectedVendor = DEMO_VENDORS.find((v) => v.id === vendorLedgerId) || DEMO_VENDORS[0];
  const isInterState = selectedVendor.id === 'v-102';

  const handlePoChange = (poId: string) => {
    setSelectedPoId(poId);
    if (!poId) return;
    const matchedPo = existingPos.find((p) => p.id === poId);
    if (matchedPo) {
      if (matchedPo.vendorLedgerId) setVendorLedgerId(matchedPo.vendorLedgerId);
      if (matchedPo.items && matchedPo.items.length > 0) {
        setItems(
          matchedPo.items.map((it) => ({
            description: it.description,
            hsnCode: it.hsnCode || '8482',
            uom: 'PCS',
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            discountPercent: 0,
            taxRatePercent: Number(it.taxRatePercent) || 18,
          }))
        );
      }
    }
  };

  const handleGrnChange = (grnId: string) => {
    setSelectedGrnId(grnId);
    if (!grnId) return;
    const matchedGrn = existingGrns.find((g) => g.id === grnId);
    if (matchedGrn) {
      if (matchedGrn.vendorLedgerId) setVendorLedgerId(matchedGrn.vendorLedgerId);
      if (matchedGrn.poId) setSelectedPoId(matchedGrn.poId);
      if (matchedGrn.items && matchedGrn.items.length > 0) {
        setItems(
          matchedGrn.items.map((it) => ({
            description: it.description,
            hsnCode: '8482',
            uom: 'PCS',
            quantity: Number(it.receivedQty - (it.rejectedQty || 0)) || 1,
            unitPrice: 4500,
            discountPercent: 0,
            taxRatePercent: 18,
          }))
        );
      }
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        hsnCode: '8482',
        uom: 'PCS',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxRatePercent: 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const processedItems: PurchaseInvoiceItem[] = items.map((it, idx) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice) || 0;
    const disc = Number(it.discountPercent) || 0;
    const gstRate = Number(it.taxRatePercent) || 0;

    const gross = qty * price;
    const discountVal = (gross * disc) / 100;
    const taxable = gross - discountVal;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = (taxable * gstRate) / 100;
    } else {
      cgst = (taxable * (gstRate / 2)) / 100;
      sgst = (taxable * (gstRate / 2)) / 100;
    }

    const itemTotal = taxable + cgst + sgst + igst;
    subtotal += taxable;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return {
      id: 'item-' + idx,
      description: it.description,
      hsnCode: it.hsnCode,
      uom: it.uom,
      quantity: qty,
      unitPrice: price,
      discountPercent: disc,
      taxableAmount: taxable,
      gstRatePercent: gstRate,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount: itemTotal,
    };
  });

  const totalTax = totalCgst + totalSgst + totalIgst;
  const tdsRate = tdsSection === '194Q' ? 0.1 : tdsSection === '194C' ? 2.0 : tdsSection === '194J' ? 10.0 : 0;
  const tdsAmount = tdsRate > 0 ? (subtotal * tdsRate) / 100 : 0;
  const grossTotal = subtotal + totalTax - tdsAmount;
  const netPayable = Math.round(grossTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorInvoiceNumber.trim()) {
      alert('Please enter Vendor Invoice Number');
      return;
    }

    const newInvoice: Partial<PurchaseInvoice> = {
      vendorInvoiceNumber: vendorInvoiceNumber.trim(),
      vendorLedgerId,
      vendorLedger: {
        id: selectedVendor.id,
        name: selectedVendor.name,
        gstin: selectedVendor.gstin,
        state: selectedVendor.state,
      },
      invoiceDate,
      dueDate,
      poId: selectedPoId || undefined,
      grnId: selectedGrnId || undefined,
      status: 'BOOKED',
      subtotal,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      igstAmount: totalIgst,
      totalTax,
      tdsSection: tdsRate > 0 ? tdsSection : undefined,
      tdsRatePercent: tdsRate,
      tdsAmount,
      totalAmount: netPayable,
      paymentTerms,
      remarks: remarks || 'Vendor bill booked with automated double-entry GL voucher posting.',
      isThreeWayMatched: !!(selectedPoId && selectedGrnId),
      items: processedItems,
    };

    onInvoiceCreated(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Book Purchase Invoice / Vendor Bill
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  AP Voucher
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statutory Bill Booking with Indian GST (CGST/SGST/IGST), TDS Deduction & Automated GL Posting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Vendor / Sundry Creditor <span className="text-rose-500">*</span>
              </label>
              <select
                value={vendorLedgerId}
                onChange={(e) => setVendorLedgerId(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                {DEMO_VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>GSTIN: {selectedVendor.gstin}</span>
                <span className={isInterState ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {isInterState ? 'IGST Applicable' : 'CGST+SGST'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Link Purchase Order (PO)
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => handlePoChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">-- Standalone Bill (No PO) --</option>
                {existingPos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.poNumber} (₹{p.totalAmount?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Auto-prefills order line items</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Link Goods Receipt Note (GRN)
              </label>
              <select
                value={selectedGrnId}
                onChange={(e) => handleGrnChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">-- Direct Bill Booking --</option>
                {existingGrns.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.grnNumber} (Challan: {g.challanNumber || 'N/A'})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
                Enables instant 3-Way Reconciliation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Vendor Bill / Invoice No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STARK/2026/8921"
                value={vendorInvoiceNumber}
                onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                className="w-full text-xs font-mono font-bold px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bill / Invoice Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                TDS on Purchase (Income Tax)
              </label>
              <select
                value={tdsSection}
                onChange={(e) => setTdsSection(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="194Q">Sec 194Q - Goods Purchase (0.1%)</option>
                <option value="194C">Sec 194C - Contractor (2.0%)</option>
                <option value="194J">Sec 194J - Technical Fees (10.0%)</option>
                <option value="NONE">None (0% TDS)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Line Items & Statutory Tax Matrix
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-2 w-20">HSN/SAC</th>
                    <th className="py-2 px-2 w-16">UOM</th>
                    <th className="py-2 px-2 w-18 text-right">Qty</th>
                    <th className="py-2 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2 px-2 w-18 text-right">Disc %</th>
                    <th className="py-2 px-2 w-20 text-center">GST Rate</th>
                    <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {items.map((it, idx) => {
                    const gross = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
                    const discVal = (gross * (Number(it.discountPercent) || 0)) / 100;
                    const taxable = gross - discVal;
                    const gstRate = Number(it.taxRatePercent) || 0;
                    const taxVal = (taxable * gstRate) / 100;
                    const lineTotal = taxable + taxVal;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            placeholder="Description / Material SKU"
                            value={it.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="HSN"
                            value={it.hsnCode}
                            onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                            className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={it.uom}
                            onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                            className="w-full text-xs px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          >
                            <option value="PCS">PCS</option>
                            <option value="KGS">KGS</option>
                            <option value="SETS">SETS</option>
                            <option value="NOS">NOS</option>
                            <option value="MTR">MTR</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full text-xs text-right font-mono px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={it.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                            className="w-full text-xs text-right font-mono px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={it.discountPercent}
                            onChange={(e) => handleItemChange(idx, 'discountPercent', Number(e.target.value))}
                            className="w-full text-xs text-right font-mono px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={it.taxRatePercent}
                            onChange={(e) => handleItemChange(idx, 'taxRatePercent', Number(e.target.value))}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length === 1}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Voucher Narration / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inward raw material bill booked against GRN & verified for payment approval."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Automated Double-Entry GL Journal Matrix</span>
                </div>
                <div className="space-y-1 font-mono text-[10.5px] text-slate-600 dark:text-slate-400 pl-5">
                  <div className="flex justify-between">
                    <span>Dr. Purchase Account (Inventory):</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {isInterState ? (
                    <div className="flex justify-between">
                      <span>Dr. Input Tax Credit (IGST):</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalIgst.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Dr. Input Tax Credit (CGST):</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalCgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dr. Input Tax Credit (SGST):</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalSgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {tdsAmount > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Cr. TDS Payable u/s {tdsSection} ({tdsRate}%):</span>
                      <span className="font-bold">₹{tdsAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                    <span>Cr. {selectedVendor.name.split(' ')[0]} (Payable):</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{netPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Taxable Amount (Subtotal):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {isInterState ? (
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    ₹{totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Central GST (CGST):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      ₹{totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>State GST (SGST):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      ₹{totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}

              {tdsAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <span>Less: TDS u/s {tdsSection} ({tdsRate}%):</span>
                  <span className="font-mono font-bold">
                    -₹{tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Net Payable Amount:</span>
                <span className="text-lg font-mono font-black text-blue-600 dark:text-blue-400">
                  ₹{netPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Book Invoice & Post to GL</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}