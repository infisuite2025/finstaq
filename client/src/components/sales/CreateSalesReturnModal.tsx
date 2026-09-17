import React, { useState } from 'react';
import { X, RotateCcw, Building2, PackagePlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SalesOrder } from '../../types/sales';

export interface SalesReturnItemData {
  id?: string;
  description: string;
  hsnCode?: string;
  returnedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitPrice: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  qcNotes?: string;
}

export interface SalesReturnFormData {
  customerLedgerId: string;
  customerName: string;
  customerGstin?: string;
  originalInvoiceNumber: string;
  soNumber?: string;
  returnDate: string;
  reason: 'CUSTOMER_REJECTION' | 'DAMAGE_CLAIM' | 'SPECIFICATION_MISMATCH' | 'ORDER_CANCELLATION' | 'OTHER';
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  qcDisposition: 'RESTOCK_GOOD' | 'MOVE_TO_SCRAP' | 'UNDER_REPAIR';
  autoCreateCreditNote: boolean;
  remarks: string;
  items: SalesReturnItemData[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

interface CreateSalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SalesReturnFormData) => void;
  salesOrders: SalesOrder[];
  customers: Array<{ id: string; name: string; gstin?: string }>;
}

const GODOWNS = [
  { id: 'wh-01', name: 'Finished Goods Godown A - Pune (WH-PUN-01)' },
  { id: 'wh-02', name: 'Returns & Quarantine Store - Pune (WH-PUN-02)' },
  { id: 'wh-03', name: 'Scrap & Rework Yard - Chakan (WH-CHK-03)' },
];

export function CreateSalesReturnModal({
  isOpen,
  onClose,
  onSubmit,
  salesOrders,
  customers,
}: CreateSalesReturnModalProps) {
  const [customerLedgerId, setCustomerLedgerId] = useState(customers[0]?.id || 'c-101');
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState('INV-2026-081');
  const [soNumber, setSoNumber] = useState(salesOrders[0]?.soNumber || 'SO-2026-1045');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<SalesReturnFormData['reason']>('CUSTOMER_REJECTION');
  const [qcDisposition, setQcDisposition] = useState<SalesReturnFormData['qcDisposition']>('RESTOCK_GOOD');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('wh-01');
  const [autoCreateCreditNote, setAutoCreateCreditNote] = useState(true);
  const [remarks, setRemarks] = useState('Customer returned 2 units due to minor dimension mismatch. Verified good condition for restock.');

  const [items, setItems] = useState<Array<SalesReturnItemData & { maxAllowed?: number }>>([
    {
      description: 'Hardened Steel Shafts 45mm x 500mm',
      maxAllowed: 10,
      hsnCode: '7214',
      returnedQty: 2,
      acceptedQty: 2,
      rejectedQty: 0,
      unitPrice: 8500,
      taxableAmount: 17000,
      gstRatePercent: 18,
      cgstAmount: 1530,
      sgstAmount: 1530,
      igstAmount: 0,
      totalAmount: 20060,
      qcNotes: 'Pass visual & magnetic particle inspection',
    },
  ]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === customerLedgerId) || customers[0];

  const updateItem = (index: number, field: string, val: any) => {
    const newItems = [...items];
    const it = { ...newItems[index], [field]: val };

    const qty = Number(it.acceptedQty) || 0;
    const price = Number(it.unitPrice) || 0;
    const gstRate = Number(it.gstRatePercent) || 0;

    const taxable = qty * price;
    const cgst = (taxable * gstRate) / 200;
    const sgst = (taxable * gstRate) / 200;

    it.taxableAmount = taxable;
    it.cgstAmount = cgst;
    it.sgstAmount = sgst;
    it.igstAmount = 0;
    it.totalAmount = taxable + cgst + sgst;

    newItems[index] = it;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: 'Custom High-Precision Flange Assembly M24',
        hsnCode: '8481',
        returnedQty: 1,
        acceptedQty: 1,
        rejectedQty: 0,
        unitPrice: 8500,
        taxableAmount: 8500,
        gstRatePercent: 18,
        cgstAmount: 765,
        sgstAmount: 765,
        igstAmount: 0,
        totalAmount: 10030,
        qcNotes: 'Customer surplus return',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  
  // Business Rule: Sales Return cannot exceed delivered quantity
  const overReturnItem = items.find((it) => it.maxAllowed !== undefined && (Number(it.returnedQty) || 0) > it.maxAllowed);
  
  const subtotal = items.reduce((acc, it) => acc + (it.taxableAmount || 0), 0);
  const cgstAmount = items.reduce((acc, it) => acc + (it.cgstAmount || 0), 0);
  const sgstAmount = items.reduce((acc, it) => acc + (it.sgstAmount || 0), 0);
  const igstAmount = items.reduce((acc, it) => acc + (it.igstAmount || 0), 0);
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = subtotal + totalTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selWh = GODOWNS.find((w) => w.id === destinationWarehouseId) || GODOWNS[0];
    onSubmit({
      customerLedgerId,
      customerName: selectedCustomer?.name || 'Customer Debtor',
      customerGstin: selectedCustomer?.gstin || '27AAACW1234F1Z1',
      originalInvoiceNumber,
      soNumber,
      returnDate,
      reason,
      destinationWarehouseId,
      destinationWarehouseName: selWh.name,
      qcDisposition,
      autoCreateCreditNote,
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
        <div className="px-6 py-4 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Receive Sales Return (Return Inward)
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                QC Inspection, Godown Restocking & Section 34 GST Credit Note Generation
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
              <span>Business Rule Violation: Return quantity (${overReturnItem.returnedQty}) for '${overReturnItem.description}' exceeds the total delivered quantity (${overReturnItem.maxAllowed}). Sales Returns cannot exceed delivery challan balance.</span>
            </div>
          )}
          {/* Customer and Reference selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer / Debtor Party *
              </label>
              <select
                value={customerLedgerId}
                onChange={(e) => setCustomerLedgerId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gstin})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Original Sales Invoice Reference *
              </label>
              <input
                type="text"
                value={originalInvoiceNumber}
                onChange={(e) => setOriginalInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-081"
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Return Inward Date *
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                QC Disposition Verdict *
              </label>
              <select
                value={qcDisposition}
                onChange={(e) => setQcDisposition(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500"
              >
                <option value="RESTOCK_GOOD">Restock to Saleable Finished Goods</option>
                <option value="UNDER_REPAIR">Under Re-work / Quarantine</option>
                <option value="MOVE_TO_SCRAP">Move to Scrap / Write-off</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Inward Destination Godown *
              </label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500"
              >
                {GODOWNS.map((w) => (
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
                <PackagePlus className="w-4 h-4 text-amber-600" />
                <span>Returned Products & Inward Inspection</span>
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description / Product</th>
                    <th className="py-2.5 px-2 w-20">HSN</th>
                    <th className="py-2.5 px-2 w-20 text-right">Ret Qty</th>
                    <th className="py-2.5 px-2 w-20 text-right">Acc Qty</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
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
                          placeholder="Product Description"
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
                          value={it.returnedQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateItem(idx, 'returnedQty', val);
                          }}
                          className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          value={it.acceptedQty}
                          onChange={(e) => updateItem(idx, 'acceptedQty', Number(e.target.value))}
                          className="w-full px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-mono font-bold text-emerald-600"
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

          {/* Financial Totals & Credit note automated switch */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateCreditNote}
                onChange={(e) => setAutoCreateCreditNote(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Auto-Generate Section 34 Credit Note & Accounting Journal</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Posts Dr Sales Return / Dr Output GST / Cr Customer Debtor & replenishes stock
                </span>
              </div>
            </label>

            <div className="text-right space-y-1 w-full md:w-auto">
              <div className="text-xs text-slate-500">
                Taxable: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span> + GST: <span className="font-mono font-bold text-amber-600">₹{totalTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                Total Return Inward: ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Customer Reason & Inward Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
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
              disabled={!!overReturnItem} className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-amber-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Confirm & Receive Return Inward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
