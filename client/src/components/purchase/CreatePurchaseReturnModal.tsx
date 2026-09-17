import React, { useState } from 'react';
import { X, RotateCcw, Building2, PackageMinus, ShieldCheck } from 'lucide-react';
import { PurchaseInvoice } from '../../types/purchase';

export interface PurchaseReturnItemData {
  id?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  reason?: string;
  batchNumber?: string;
}

export interface PurchaseReturnFormData {
  vendorLedgerId: string;
  vendorName: string;
  vendorGstin?: string;
  vendorState?: string;
  originalInvoiceNumber: string;
  poNumber?: string;
  returnDate: string;
  reason: 'DEFECTIVE_QC_REJECT' | 'DAMAGED_IN_TRANSIT' | 'EXCESS_DISPATCH' | 'WRONG_SPECIFICATION' | 'OTHER';
  warehouseId: string;
  warehouseName: string;
  autoCreateDebitNote: boolean;
  remarks: string;
  items: PurchaseReturnItemData[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

interface CreatePurchaseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseReturnFormData) => void;
  invoices: PurchaseInvoice[];
  vendors: Array<{ id: string; name: string; gstin?: string; state?: string }>;
}

const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Plant Warehouse - Pune (WH-PUN-01)' },
  { id: 'wh-02', name: 'Raw Materials Godown B - Chakan (WH-CHK-02)' },
  { id: 'wh-03', name: 'Consumables & Spares Store - Bhosari (WH-BHO-03)' },
];

export function CreatePurchaseReturnModal({
  isOpen,
  onClose,
  onSubmit,
  invoices,
  vendors,
}: CreatePurchaseReturnModalProps) {
  const [vendorLedgerId, setVendorLedgerId] = useState(vendors[0]?.id || 'v-101');
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState(invoices[0]?.vendorInvoiceNumber || 'STARK/26-27/9912');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<PurchaseReturnFormData['reason']>('DEFECTIVE_QC_REJECT');
  const [warehouseId, setWarehouseId] = useState('wh-01');
  const [autoCreateDebitNote, setAutoCreateDebitNote] = useState(true);
  const [remarks, setRemarks] = useState('Material rejected during incoming QA inspection. Dimensions outside tolerance.');

  const [items, setItems] = useState<Array<PurchaseReturnItemData & { maxAllowed?: number }>>([
    {
      description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
      maxAllowed: 10,
      hsnCode: '7318',
      quantity: 2,
      unitPrice: 4500,
      taxableAmount: 9000,
      gstRatePercent: 18,
      cgstAmount: 810,
      sgstAmount: 810,
      igstAmount: 0,
      totalAmount: 10620,
      reason: 'Failed torque tensile test',
      batchNumber: 'BATCH-2026-09A',
    },
  ]);

  if (!isOpen) return null;

  const selectedVendor = vendors.find((v) => v.id === vendorLedgerId) || vendors[0];
  const isInterState = selectedVendor?.state?.includes('Gujarat') || selectedVendor?.state?.includes('Inter-State');

  const updateItem = (index: number, field: string, val: any) => {
    const newItems = [...items];
    const it = { ...newItems[index], [field]: val };

    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice) || 0;
    const gstRate = Number(it.gstRatePercent) || 0;

    const taxable = qty * price;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = (taxable * gstRate) / 100;
    } else {
      cgst = (taxable * gstRate) / 200;
      sgst = (taxable * gstRate) / 200;
    }

    it.taxableAmount = taxable;
    it.cgstAmount = cgst;
    it.sgstAmount = sgst;
    it.igstAmount = igst;
    it.totalAmount = taxable + cgst + sgst + igst;

    newItems[index] = it;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: 'CNC Tooling / Spare Bit',
        hsnCode: '8207',
        quantity: 1,
        unitPrice: 2000,
        taxableAmount: 2000,
        gstRatePercent: 18,
        cgstAmount: 180,
        sgstAmount: 180,
        igstAmount: 0,
        totalAmount: 2360,
        reason: 'Micro-crack detected',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  
  // Business Rule: Return cannot exceed inwarded GRN/Bill quantity
  const overReturnItem = items.find((it) => it.maxAllowed !== undefined && (Number(it.quantity) || 0) > it.maxAllowed);
  
  const subtotal = items.reduce((acc, it) => acc + (it.taxableAmount || 0), 0);
  const cgstAmount = items.reduce((acc, it) => acc + (it.cgstAmount || 0), 0);
  const sgstAmount = items.reduce((acc, it) => acc + (it.sgstAmount || 0), 0);
  const igstAmount = items.reduce((acc, it) => acc + (it.igstAmount || 0), 0);
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = subtotal + totalTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selWh = WAREHOUSES.find((w) => w.id === warehouseId) || WAREHOUSES[0];
    onSubmit({
      vendorLedgerId,
      vendorName: selectedVendor?.name || 'Vendor Creditor',
      vendorGstin: selectedVendor?.gstin || '27AABCS1429B1Z8',
      vendorState: selectedVendor?.state || 'Maharashtra (27)',
      originalInvoiceNumber,
      returnDate,
      reason,
      warehouseId,
      warehouseName: selWh.name,
      autoCreateDebitNote,
      remarks,
      items,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTax,
      totalAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/70 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Issue Purchase Return (Return Outward)
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Deduct physical warehouse inventory & trigger Section 34 GST Debit Note
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {overReturnItem && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-shake">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Business Rule Violation: Return quantity (${overReturnItem.quantity}) for '${overReturnItem.description}' exceeds the original inwarded GRN balance (${overReturnItem.maxAllowed}). Purchase Returns cannot exceed GRN quantity.</span>
            </div>
          )}
          {/* Vendor and Reference selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Supplier / Creditor Party *
              </label>
              <select
                value={vendorLedgerId}
                onChange={(e) => setVendorLedgerId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-rose-500"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gstin})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Original Supplier Bill / Invoice Ref *
              </label>
              <input
                type="text"
                value={originalInvoiceNumber}
                onChange={(e) => setOriginalInvoiceNumber(e.target.value)}
                placeholder="e.g. STARK/26-27/9912"
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Return Outward Date *
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Rejection Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-rose-500"
              >
                <option value="DEFECTIVE_QC_REJECT">QC Inspection Failure (Defective)</option>
                <option value="DAMAGED_IN_TRANSIT">Damaged in Transit / Crushed</option>
                <option value="EXCESS_DISPATCH">Excess Dispatch Over PO Qty</option>
                <option value="WRONG_SPECIFICATION">Wrong Grade / Specification</option>
                <option value="OTHER">Commercial Price Correction / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deduct From Warehouse *
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-rose-500"
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                <PackageMinus className="w-4 h-4 text-rose-600" />
                <span>Return Material Line Items</span>
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description / Item</th>
                    <th className="py-2.5 px-2 w-20">HSN</th>
                    <th className="py-2.5 px-2 w-20 text-right">Qty</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 w-20 text-center">GST %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="Item Name"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={it.hsnCode || ''}
                          onChange={(e) => updateItem(idx, 'hsnCode', e.target.value)}
                          className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          value={it.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={it.gstRatePercent}
                          onChange={(e) => updateItem(idx, 'gstRatePercent', Number(e.target.value))}
                          className="w-full px-1 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{it.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals & Debit note automated switch */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateDebitNote}
                onChange={(e) => setAutoCreateDebitNote(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Auto-Generate Section 34 Debit Note & Accounting Journal</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Posts Dr Supplier / Cr Purchase Return & Reverses Input Tax Credit (ITC)
                </span>
              </div>
            </label>

            <div className="text-right space-y-1 w-full md:w-auto">
              <div className="text-xs text-slate-500">
                Taxable: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span> + GST: <span className="font-mono font-bold text-rose-600">₹{totalTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                Total Return Outward: ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Quality Rejection Notes / Narration
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!overReturnItem} className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Confirm & Post Purchase Return</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
