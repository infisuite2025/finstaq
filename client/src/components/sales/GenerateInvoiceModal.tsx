import React, { useState } from 'react';
import { SalesOrder } from '../../types/sales';
import { X, Receipt, CheckCircle, Calculator, Building2 } from 'lucide-react';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoiceData: {
    soId: string;
    voucherNumber: string;
    date: string;
    salesLedgerId: string;
    cgstLedgerId?: string;
    sgstLedgerId?: string;
    igstLedgerId?: string;
    narration: string;
  }) => void;
  salesOrders: SalesOrder[];
}

export function GenerateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  salesOrders,
}: GenerateInvoiceModalProps) {
  const [selectedSoId, setSelectedSoId] = useState<string>(salesOrders[0]?.id || '');
  const [voucherNumber, setVoucherNumber] = useState(`INV-${Date.now().toString().slice(-5)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesLedgerId, setSalesLedgerId] = useState('led-sales-dom');
  const [taxType, setTaxType] = useState<'intra' | 'inter'>('intra');
  const [narration, setNarration] = useState('Tax Invoice booked against confirmed Sales Order.');

  if (!isOpen) return null;

  const selectedSo = salesOrders.find((s) => s.id === selectedSoId) || salesOrders[0];
  const grandTotal = selectedSo?.totalAmount || 0;
  const taxable = selectedSo?.subtotal || 0;
  const tax = selectedSo?.taxAmount || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSo) return;

    onSubmit({
      soId: selectedSo.id,
      voucherNumber,
      date,
      salesLedgerId,
      cgstLedgerId: taxType === 'intra' ? 'led-cgst-out' : undefined,
      sgstLedgerId: taxType === 'intra' ? 'led-sgst-out' : undefined,
      igstLedgerId: taxType === 'inter' ? 'led-igst-out' : undefined,
      narration,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Generate Tax Invoice & Post to Ledger</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Converts Sales Order into an official Tax Invoice and posts double-entry journal lines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Sales Order *
              </label>
              <select
                value={selectedSoId}
                onChange={(e) => setSelectedSoId(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono transition-all"
              >
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.soNumber} ({so.customerLedger?.name || 'Customer'}) — ₹{so.totalAmount.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax Invoice Number *
              </label>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GST Tax Mode
              </label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as 'intra' | 'inter')}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="intra">Intra-State (CGST 9% + SGST 9%)</option>
                <option value="inter">Inter-State (IGST 18%)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Narration
              </label>
              <input
                type="text"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Double-Entry Ledger Posting Preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Automatic Double-Entry Posting Matrix
            </span>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  [Dr] {selectedSo?.customerLedger?.name || 'Customer Ledger'} (Sundry Debtors)
                </span>
                <span className="font-bold">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-6">
                <span className="text-slate-600 dark:text-slate-400">
                  [Cr] Sales Account (Domestic Revenue)
                </span>
                <span className="font-bold">₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {taxType === 'intra' ? (
                <>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-6">
                    <span className="text-slate-600 dark:text-slate-400">[Cr] Output CGST @ 9%</span>
                    <span className="font-bold">₹{(tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-6">
                    <span className="text-slate-600 dark:text-slate-400">[Cr] Output SGST @ 9%</span>
                    <span className="font-bold">₹{(tax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-6">
                  <span className="text-slate-600 dark:text-slate-400">[Cr] Output IGST @ 18%</span>
                  <span className="font-bold">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Post Tax Invoice to Books</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
