import React, { useState } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '../../types/purchase';
import { X, Plus, Trash2, ShoppingCart, CheckCircle, Calculator, FileText } from 'lucide-react';

interface CreatePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poData: Partial<PurchaseOrder>) => void;
  vendors: Array<{ id: string; name: string; gstin?: string }>;
}

export function CreatePoModal({ isOpen, onClose, onSubmit, vendors }: CreatePoModalProps) {
  const [poNumber, setPoNumber] = useState(`PO-${Date.now().toString().slice(-5)}`);
  const [vendorLedgerId, setVendorLedgerId] = useState(vendors[0]?.id || '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState('Payment within 30 days of invoice receipt. Standard quality warranty applies.');
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
      hsnCode: '7318',
      quantity: 10,
      unitPrice: 4500,
      taxRatePercent: 18,
    },
    {
      description: 'Hydraulic Seals & O-Rings Kit',
      hsnCode: '4016',
      quantity: 5,
      unitPrice: 3200,
      taxRatePercent: 18,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        hsnCode: '8481',
        quantity: 1,
        unitPrice: 1000,
        taxRatePercent: 18,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: keyof PurchaseOrderItem, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  // Live calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const taxAmount = items.reduce((acc, item) => {
    const itemSub = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    return acc + (itemSub * (Number(item.taxRatePercent) || 0)) / 100;
  }, 0);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorLedgerId || items.length === 0) return;

    onSubmit({
      poNumber,
      vendorLedgerId,
      orderDate,
      expectedDeliveryDate,
      termsAndConditions: terms,
      subtotal,
      taxAmount,
      totalAmount,
      status: 'APPROVED',
      items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Create Purchase Order (PO)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate a formal purchase commitment with statutory GST computation
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PO Reference Number *
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Supplier *
              </label>
              <select
                value={vendorLedgerId}
                onChange={(e) => setVendorLedgerId(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.gstin ? `(GSTIN: ${v.gstin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PO Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Terms & Conditions / Remarks
              </label>
              <input
                type="text"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Order Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                    <th className="p-2.5 font-semibold">#</th>
                    <th className="p-2.5 font-semibold">Item Description</th>
                    <th className="p-2.5 font-semibold w-24">HSN/SAC</th>
                    <th className="p-2.5 font-semibold w-20 text-right">Qty</th>
                    <th className="p-2.5 font-semibold w-28 text-right">Unit Price (₹)</th>
                    <th className="p-2.5 font-semibold w-20 text-right">GST %</th>
                    <th className="p-2.5 font-semibold w-28 text-right">Total (₹)</th>
                    <th className="p-2.5 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((item, idx) => {
                    const lineSub = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                    const lineTax = (lineSub * (Number(item.taxRatePercent) || 0)) / 100;
                    const lineTotal = lineSub + lineTax;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 text-slate-400 text-center font-mono">{idx + 1}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            placeholder="Material / Service description"
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.hsnCode || ''}
                            onChange={(e) => handleUpdateItem(idx, 'hsnCode', e.target.value)}
                            placeholder="HSN"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-right font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-right font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="p-2.5">
                          <select
                            value={item.taxRatePercent}
                            onChange={(e) => handleUpdateItem(idx, 'taxRatePercent', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-right font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className="p-1 rounded text-slate-400 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PO Summary & Taxes */}
          <div className="flex justify-end pt-2">
            <div className="w-72 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST Tax (Est.):</span>
                <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-1 flex justify-between font-bold text-sm text-blue-600 dark:text-blue-400">
                <span>Total PO Value:</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
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
              <span>Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
