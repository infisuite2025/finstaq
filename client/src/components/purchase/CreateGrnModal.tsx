import React, { useState } from 'react';
import { GoodsReceiptNote, GoodsReceiptNoteItem, PurchaseOrder } from '../../types/purchase';
import { X, Plus, Trash2, PackageCheck, AlertCircle, ShieldCheck, Truck, AlertTriangle } from 'lucide-react';

interface CreateGrnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (grnData: Partial<GoodsReceiptNote>) => void;
  purchaseOrders: PurchaseOrder[];
  vendors: Array<{ id: string; name: string }>;
  existingGrns?: GoodsReceiptNote[];
}

export function CreateGrnModal({
  isOpen,
  onClose,
  onSubmit,
  purchaseOrders,
  vendors,
  existingGrns = [],
}: CreateGrnModalProps) {
  const [grnNumber, setGrnNumber] = useState('GRN-' + Date.now().toString().slice(-5));
  const [selectedPoId, setSelectedPoId] = useState<string>(purchaseOrders[0]?.id || '');
  const [vendorLedgerId, setVendorLedgerId] = useState<string>(
    purchaseOrders[0]?.vendorLedgerId || vendors[0]?.id || ''
  );
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNumber, setVehicleNumber] = useState('MH-12-AB-9876');
  const [challanNumber, setChallanNumber] = useState('DC-5521');
  const [remarks, setRemarks] = useState('Physical count verified against packing list. Passed visual QC.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const matchedPo = purchaseOrders.find((p) => p.id === selectedPoId);

  // Calculate existing inwards for this PO
  const getPoItemBalance = (itemDesc: string, totalPoQty: number) => {
    if (!matchedPo) return { ordered: totalPoQty, alreadyInwarded: 0, remaining: totalPoQty };
    let alreadyInwarded = 0;
    for (const grn of existingGrns) {
      if (grn.poId === matchedPo.id || grn.po?.poNumber === matchedPo.poNumber) {
        for (const it of grn.items) {
          if (it.description.trim().toLowerCase() === itemDesc.trim().toLowerCase()) {
            alreadyInwarded += Number(it.receivedQty) || 0;
          }
        }
      }
    }
    const remaining = Math.max(0, totalPoQty - alreadyInwarded);
    return { ordered: totalPoQty, alreadyInwarded, remaining };
  };

  const [items, setItems] = useState<Array<GoodsReceiptNoteItem & { maxAllowed?: number; orderedQty?: number }>>([
    {
      description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
      receivedQty: 10,
      rejectedQty: 0,
      rejectionReason: '',
      batchNumber: 'BATCH-2026-09A',
      maxAllowed: 10,
      orderedQty: 10,
    },
  ]);

  if (!isOpen) return null;

  const handlePoSelectionChange = (poId: string) => {
    setSelectedPoId(poId);
    setErrorMessage(null);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      setVendorLedgerId(po.vendorLedgerId);
      if (po.items && po.items.length > 0) {
        setItems(
          po.items.map((item) => {
            const balance = getPoItemBalance(item.description, Number(item.quantity) || 1);
            return {
              description: item.description,
              receivedQty: balance.remaining,
              rejectedQty: 0,
              rejectionReason: '',
              batchNumber: 'BAT-' + Date.now().toString().slice(-4),
              maxAllowed: balance.remaining,
              orderedQty: balance.ordered,
            };
          })
        );
      }
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        receivedQty: 1,
        rejectedQty: 0,
        rejectionReason: '',
        batchNumber: 'BAT-' + Date.now().toString().slice(-4),
        maxAllowed: 9999,
        orderedQty: 9999,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: keyof GoodsReceiptNoteItem, value: any) => {
    setErrorMessage(null);
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  // Check duplicate GRN number
  const isDuplicateGrnNumber = existingGrns.some(
    (g) => g.grnNumber.trim().toLowerCase() === grnNumber.trim().toLowerCase()
  );

  // Check if any item exceeds maxAllowed
  const overInwardItem = items.find((it) => it.maxAllowed !== undefined && (Number(it.receivedQty) || 0) > it.maxAllowed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isDuplicateGrnNumber) {
      setErrorMessage('Duplicate GRN Error: GRN #' + grnNumber + ' is already registered.');
      return;
    }

    if (overInwardItem) {
      setErrorMessage(
        `Business Rule Violation: Inward quantity (${overInwardItem.receivedQty}) for "${overInwardItem.description}" exceeds the remaining PO balance (${overInwardItem.maxAllowed}). GRN cannot be more than PO!`
      );
      return;
    }

    const totalReceived = items.reduce((acc, it) => acc + (Number(it.receivedQty) || 0), 0);
    const totalRejected = items.reduce((acc, it) => acc + (Number(it.rejectedQty) || 0), 0);
    const qcStatus =
      totalRejected === 0
        ? 'PASSED'
        : totalRejected >= totalReceived
        ? 'FAILED'
        : 'CONDITIONALLY_ACCEPTED';

    const selectedVendor = vendors.find((v) => v.id === vendorLedgerId);

    onSubmit({
      grnNumber,
      poId: selectedPoId || undefined,
      po: matchedPo ? { id: matchedPo.id, poNumber: matchedPo.poNumber } : undefined,
      vendorLedgerId,
      vendorLedger: selectedVendor ? { id: selectedVendor.id, name: selectedVendor.name } : undefined,
      receivedDate,
      vehicleNumber,
      challanNumber,
      qcStatus: qcStatus as any,
      remarks,
      items: items.map(({ maxAllowed, orderedQty, ...rest }) => rest),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Inward Goods Receipt Note (GRN / GRP)
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Enforces GRN ≤ PO Quantity Rule & Zero-Duplicate Booking
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
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isDuplicateGrnNumber && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Warning: GRN Number '{grnNumber}' already exists in system records.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                GRN Reference # *
              </label>
              <input
                type="text"
                value={grnNumber}
                onChange={(e) => {
                  setGrnNumber(e.target.value);
                  setErrorMessage(null);
                }}
                required
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Link to Purchase Order (PO) *
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => handlePoSelectionChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Direct Inward (No PO Link)</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} — {po.vendorLedger?.name || 'Vendor'} (₹{po.totalAmount.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Supplier / Creditor Party *
              </label>
              <select
                value={vendorLedgerId}
                onChange={(e) => setVendorLedgerId(e.target.value)}
                disabled={!!selectedPoId}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:opacity-70"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Material Received Date *
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. MH-12-AB-9876"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vendor Delivery Challan #
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                placeholder="e.g. DC-5521"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Line Items & QC Inward Inspection</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-lg hover:bg-emerald-100 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 w-28 text-right">PO Balance</th>
                    <th className="py-2.5 px-2 w-24 text-right">Inward Qty *</th>
                    <th className="py-2.5 px-2 w-20 text-right">QC Reject</th>
                    <th className="py-2.5 px-3 w-28">Batch / Lot #</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((it, idx) => {
                    const isExceeded = it.maxAllowed !== undefined && Number(it.receivedQty) > it.maxAllowed;
                    return (
                      <tr key={idx} className={isExceeded ? 'bg-rose-50/50 dark:bg-rose-950/30' : 'hover:bg-slate-50/50'}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          {it.orderedQty !== undefined && (
                            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                              Max: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{it.maxAllowed}</span> / {it.orderedQty}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            max={it.maxAllowed}
                            value={it.receivedQty}
                            onChange={(e) => handleUpdateItem(idx, 'receivedQty', Number(e.target.value))}
                            className={'w-full px-2.5 py-1.5 rounded-lg border text-xs text-right font-mono font-bold outline-none transition-all ' + (
                              isExceeded
                                ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/50 focus:ring-2 focus:ring-rose-500/20'
                                : 'border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                            )}
                          />
                          {isExceeded && (
                            <span className="text-[9px] text-rose-600 font-bold block text-right mt-0.5">
                              Exceeds PO!
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            value={it.rejectedQty}
                            onChange={(e) => handleUpdateItem(idx, 'rejectedQty', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-right font-mono text-rose-600 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={it.batchNumber || ''}
                            onChange={(e) => handleUpdateItem(idx, 'batchNumber', e.target.value)}
                            placeholder="Lot / Heat #"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              QC Inspection Remarks & Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!overInwardItem || isDuplicateGrnNumber}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-emerald-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Confirm & Inward Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
