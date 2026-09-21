import React, { useState } from 'react';
import { PurchaseOrder, GoodsReceiptNote, ThreeWayMatchRecord } from '../../types/purchase';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface ThreeWayMatchViewProps {
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  matchHistory: ThreeWayMatchRecord[];
  onExecuteMatch: (payload: {
    poId: string;
    grnId: string;
    invoicedTotalAmount: number;
    invoicedItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) => void;
}

export function ThreeWayMatchView({
  purchaseOrders,
  goodsReceiptNotes,
  matchHistory,
  onExecuteMatch,
}: ThreeWayMatchViewProps) {
  const [selectedPoId, setSelectedPoId] = useState<string>(purchaseOrders[0]?.id || '');
  const [selectedGrnId, setSelectedGrnId] = useState<string>(goodsReceiptNotes[0]?.id || '');

  const selectedPo = purchaseOrders.find((p) => p.id === selectedPoId) || purchaseOrders[0];
  const selectedGrn = goodsReceiptNotes.find((g) => g.id === selectedGrnId) || goodsReceiptNotes[0];

  // Invoiced details (mocked / editable for simulation)
  const [invoicedTotal, setInvoicedTotal] = useState<number>(selectedPo?.totalAmount || 53100);
  const [invoicedQty, setInvoicedQty] = useState<number>(
    selectedPo?.items?.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0) || 15
  );
  const [invoicedUnitPrice, setInvoicedUnitPrice] = useState<number>(
    selectedPo?.items[0]?.unitPrice || 4500
  );

  const poTotal = selectedPo?.totalAmount || 0;
  const poQty = selectedPo?.items?.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0) || 0;
  const grnAcceptedQty =
    selectedGrn?.items?.reduce(
      (acc, it) => acc + (Number(it.receivedQty) || 0) - (Number(it.rejectedQty) || 0),
      0
    ) || 0;

  // Real-time variance calculations
  const qtyVariance = invoicedQty - grnAcceptedQty;
  const priceVariance = invoicedTotal - poTotal;
  const isMatch = Math.abs(qtyVariance) === 0 && Math.abs(priceVariance) < 1;

  const handleRunMatch = () => {
    if (!selectedPo || !selectedGrn) return;

    onExecuteMatch({
      poId: selectedPo.id,
      grnId: selectedGrn.id,
      invoicedTotalAmount: invoicedTotal,
      invoicedItems: [
        {
          description: selectedPo.items[0]?.description || 'Material Item',
          quantity: invoicedQty,
          unitPrice: invoicedUnitPrice,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-linear-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 dark:border-blue-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated 3-Way Matching & Reconciliation Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cross-verifies Purchase Order (Agreed), Goods Receipt (Physical QC Inward), and Vendor Invoice (Claimed) before booking financial liabilities.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunMatch}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <FileCheck className="w-4 h-4" />
          <span>Execute 3-Way Match</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Step 1: Select Purchase Order (PO)
          </label>
          <select
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          >
            {purchaseOrders.map((po) => (
              <option key={po.id} value={po.id}>
                {po.poNumber} — {po.vendorLedger?.name || 'Vendor'} (₹{po.totalAmount.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Step 2: Select Goods Receipt Note (GRN)
          </label>
          <select
            value={selectedGrnId}
            onChange={(e) => setSelectedGrnId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          >
            {goodsReceiptNotes.map((grn) => (
              <option key={grn.id} value={grn.id}>
                {grn.grnNumber} — QC: {grn.qcStatus} ({grn.receivedDate})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Way Comparison Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: PO */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                1. Purchase Order (Agreed)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono font-bold">
                {selectedPo?.poNumber || 'N/A'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Vendor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPo?.vendorLedger?.name || 'Acme Metals Ltd.'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ordered Quantity:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{poQty} Units</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total PO Amount:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  ₹{poTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Terms: Net 30, Approved PO
          </div>
        </div>

        {/* Card 2: GRN */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                2. Goods Receipt (Inward)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                {selectedGrn?.grnNumber || 'N/A'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>QC Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedGrn?.qcStatus || 'PASSED'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Accepted Qty:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {grnAcceptedQty} Units
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Challan / Vehicle:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedGrn?.challanNumber || 'DC-5521'} ({selectedGrn?.vehicleNumber || 'MH-12'})
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stock Added to Warehouse</span>
          </div>
        </div>

        {/* Card 3: Vendor Invoice */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                3. Vendor Bill (Claimed)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-mono font-bold">
                INV-8839
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Billed Total:</span>
                <input
                  type="number"
                  value={invoicedTotal}
                  onChange={(e) => setInvoicedTotal(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2 py-1 text-right font-mono font-bold border border-emerald-400 dark:border-emerald-500 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Billed Qty:</span>
                <input
                  type="number"
                  value={invoicedQty}
                  onChange={(e) => setInvoicedQty(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-right font-mono font-bold border border-emerald-400 dark:border-emerald-500 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Reconciliation State:</span>
                <span
                  className={`font-bold ${
                    isMatch
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isMatch ? 'PASSED (100% Match)' : 'VARIANCE DETECTED'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Source: AI Document Extractor / Manual Entry
          </div>
        </div>
      </div>

      {/* Discrepancy Diagnostics Bar */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isMatch
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isMatch ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              {isMatch
                ? 'Zero Discrepancy: PO, GRN, and Invoiced line items are perfectly matched.'
                : 'Variance Found: Audit required prior to voucher booking.'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              Price Variance: ₹{priceVariance.toFixed(2)} | Quantity Variance: {qtyVariance} Units
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded-full font-bold ${
              isMatch
                ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100'
            }`}
          >
            {isMatch ? 'MATCHED' : priceVariance !== 0 ? 'PRICE_MISMATCH' : 'QTY_MISMATCH'}
          </span>
        </div>
      </div>

      {/* Match History Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Audit Trail: Past 3-Way Reconciliation Records</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">{matchHistory.length} Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="p-3">Match Date</th>
                <th className="p-3">PO Amount (₹)</th>
                <th className="p-3">GRN Qty</th>
                <th className="p-3">Invoiced Total (₹)</th>
                <th className="p-3">Variance Note</th>
                <th className="p-3 text-center">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {matchHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No 3-Way reconciliation audits run yet. Click "Execute 3-Way Match" above to perform an automated match.
                  </td>
                </tr>
              ) : (
                matchHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      ₹{rec.poTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 font-mono">{rec.grnTotalQty} units</td>
                    <td className="p-3 font-mono font-semibold">
                      ₹{rec.invoicedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {rec.discrepancies?.notes || 'Zero discrepancy, reconciled.'}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          rec.status === 'MATCHED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
