import React, { useState } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { ConfidenceBadge } from './ConfidenceBadge';
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Hash,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';

interface ReviewLineItem {
  id: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  amount: number;
  matchedInventoryItemId: string;
  confidenceScore: number;
}

export const DocumentReviewScreen: React.FC = () => {
  // Document Extracted Metadata
  const [vendorName, setVendorName] = useState('Tata Steel BSL Limited');
  const [vendorGstin, setVendorGstin] = useState('27AAACT0001Z1Z2');
  const [vendorLedgerId, setVendorLedgerId] = useState('led-tata-01');
  const [purchaseLedgerId, setPurchaseLedgerId] = useState('led-purch-01');
  const [taxLedgerId, setTaxLedgerId] = useState('led-tax-cgst-01');

  const [poNumber, setPoNumber] = useState('PO-2026-9812');
  const [invoiceDate, setInvoiceDate] = useState('2026-09-13');
  const [voucherNumber, setVoucherNumber] = useState('PUR/2026/0189');
  const [narration, setNarration] = useState('Auto-extracted from Purchase Order #PO-2026-9812 (Tata Steel)');

  // Line Items
  const [items, setItems] = useState<ReviewLineItem[]>([
    {
      id: 'row-1',
      description: 'Industrial Steel Sheets Grade A (10mm)',
      sku: 'STL-SHT-10MM',
      quantity: 25,
      unitPrice: 1200,
      taxRatePercent: 18,
      amount: 30000,
      matchedInventoryItemId: 'inv-stl-01',
      confidenceScore: 0.96,
    },
    {
      id: 'row-2',
      description: 'High Tensile Structural Bolts M16',
      sku: 'BLT-M16-HT',
      quantity: 100,
      unitPrice: 50,
      taxRatePercent: 18,
      amount: 5000,
      matchedInventoryItemId: 'inv-blt-01',
      confidenceScore: 0.94,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  // Recalculate totals
  const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const taxAmount = (subtotal * 18) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleItemChange = (index: number, field: keyof ReviewLineItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const updated = { ...copy[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : copy[index].quantity;
        const p = field === 'unitPrice' ? Number(value) : copy[index].unitPrice;
        updated.amount = q * p;
      }
      copy[index] = updated;
      return copy;
    });
  };

  const handleVerifyAndPost = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPostedSuccess(true);
    }, 600);
  };

  if (postedSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-900/10 dark:shadow-emerald-900/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Purchase Voucher Successfully Posted!</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6 font-mono text-xs">
          Voucher <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">#{voucherNumber}</span> has been posted into General Ledger. Inventory stock updated: +25 Steel Sheets, +100 Structural Bolts.
        </p>
        <button
          type="button"
          onClick={() => setPostedSuccess(false)}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 cursor-pointer"
        >
          Review Next Document
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* LEFT PANE (50%): Document Viewer */}
      <div className="w-1/2 h-full flex flex-col">
        <DocumentViewer
          poNumber={poNumber}
          vendorName={vendorName}
          totalAmount={grandTotal}
          date={invoiceDate}
        />
      </div>

      {/* RIGHT PANE (50%): Pre-filled Review & Verification Matrix */}
      <div className="w-1/2 h-full flex flex-col bg-white dark:bg-slate-900 overflow-y-auto border-l border-slate-200 dark:border-slate-800">
        {/* Review Header Banner */}
        <div className="bg-slate-50 dark:bg-slate-850 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              AI Transaction Draft Review
            </h2>
            <ConfidenceBadge score={0.95} label="Overall AI Score" size="sm" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded font-medium">
              Draft ID: #DOC-9812
            </span>
          </div>
        </div>

        {/* Verification Form Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Vendor & Smart Matching Card */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Extracted Vendor Information</span>
              </span>
              <div className="flex items-center space-x-2">
                <ConfidenceBadge score={0.98} />
                <span className="text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-medium">
                  Smart Matched (78% similarity)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Extracted Vendor Name
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Mapped Vendor Ledger (Sundry Creditor)
                </label>
                <select
                  value={vendorLedgerId}
                  onChange={(e) => setVendorLedgerId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300 font-semibold focus:border-blue-500"
                >
                  <option value="led-tata-01">Tata Steel Creditor A/c [Sundry Creditors]</option>
                  <option value="led-stark-01">Stark Logistics [Sundry Creditors]</option>
                  <option value="led-acme-01">Acme Global [Sundry Creditors]</option>
                </select>
              </div>
            </div>
          </div>

          {/* PO, Invoice No & Date Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400">PO / Bill No.</label>
                <ConfidenceBadge score={0.97} />
              </div>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400">Invoice Date</label>
                <ConfidenceBadge score={0.96} />
              </div>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400">Purchase Voucher #</label>
                <span className="text-[10px] font-mono text-slate-400">Auto</span>
              </div>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold focus:border-blue-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-850 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Extracted Line Items & Inventory Mapping</span>
              </span>
              <ConfidenceBadge score={0.95} />
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-2.5">Item Description / Inventory SKU</th>
                  <th className="p-2.5 text-right w-20">Qty</th>
                  <th className="p-2.5 text-right w-24">Rate (₹)</th>
                  <th className="p-2.5 text-right w-24">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-sans mb-1 focus:border-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-500 font-sans">Map to SKU:</span>
                        <select
                          value={item.matchedInventoryItemId}
                          onChange={(e) => handleItemChange(idx, 'matchedInventoryItemId', e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] text-blue-700 dark:text-blue-300 rounded-lg px-2 py-0.5 focus:border-blue-500"
                        >
                          <option value="inv-stl-01">STL-SHT-10MM (Steel Sheets 10mm)</option>
                          <option value="inv-blt-01">BLT-M16-HT (Structural Bolts M16)</option>
                          <option value="inv-new">+ Create New Stock Item</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-2.5 text-right align-top">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2.5 text-right align-top">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 align-top pt-3">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Voucher Narration
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bottom Review Actions & Total Bar */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0 shadow-lg">
          <div className="font-mono text-xs space-y-0.5">
            <div className="text-slate-600 dark:text-slate-400">
              Taxable: <span className="text-slate-900 dark:text-white font-bold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> | GST (18%): <span className="text-amber-700 dark:text-amber-400 font-bold">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Grand Total: <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-xs transition-colors cursor-pointer"
            >
              Reject Draft
            </button>
            <button
              type="button"
              onClick={handleVerifyAndPost}
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center space-x-2 ring-2 ring-emerald-500/50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Verify & Post Voucher (Ctrl+Enter)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
