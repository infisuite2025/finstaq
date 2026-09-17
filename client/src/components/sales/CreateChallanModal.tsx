import React, { useState } from 'react';
import { DeliveryChallan, DeliveryChallanItem, SalesOrder } from '../../types/sales';
import { X, Plus, Trash2, Truck, CheckCircle, ShieldAlert, ArrowUpRight, AlertTriangle, AlertCircle } from 'lucide-react';

interface CreateChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (challanData: Partial<DeliveryChallan>) => void;
  salesOrders: SalesOrder[];
  customers: Array<{ id: string; name: string }>;
  existingChallans?: DeliveryChallan[];
}

export function CreateChallanModal({
  isOpen,
  onClose,
  onSubmit,
  salesOrders,
  customers,
  existingChallans = [],
}: CreateChallanModalProps) {
  const [challanNumber, setChallanNumber] = useState('DC-OUT-' + Date.now().toString().slice(-5));
  const [selectedSoId, setSelectedSoId] = useState<string>(salesOrders[0]?.id || '');
  const [customerLedgerId, setCustomerLedgerId] = useState<string>(
    salesOrders[0]?.customerLedgerId || customers[0]?.id || ''
  );
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNumber, setVehicleNumber] = useState('MH-14-GH-4412');
  const [transporterName, setTransporterName] = useState('VRL Logistics Fleet');
  const [eWayBillNumber, setEWayBillNumber] = useState('241088921094');
  const [remarks, setRemarks] = useState('Goods dispatched in good condition with tamper-evident seal.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const matchedSo = salesOrders.find((s) => s.id === selectedSoId);

  // Calculate existing dispatches for this SO
  const getSoItemBalance = (itemDesc: string, totalSoQty: number) => {
    if (!matchedSo) return { ordered: totalSoQty, alreadyDispatched: 0, remaining: totalSoQty };
    let alreadyDispatched = 0;
    for (const dc of existingChallans) {
      if (dc.soId === matchedSo.id || dc.so?.soNumber === matchedSo.soNumber) {
        for (const it of dc.items) {
          if (it.description.trim().toLowerCase() === itemDesc.trim().toLowerCase()) {
            alreadyDispatched += Number(it.dispatchedQty) || 0;
          }
        }
      }
    }
    const remaining = Math.max(0, totalSoQty - alreadyDispatched);
    return { ordered: totalSoQty, alreadyDispatched, remaining };
  };

  const [items, setItems] = useState<Array<DeliveryChallanItem & { maxAllowed?: number; orderedQty?: number }>>([
    {
      description: 'Custom High-Precision Flange Assembly M24',
      dispatchedQty: 15,
      batchNumber: 'BAT-2026-09A',
      maxAllowed: 15,
      orderedQty: 15,
    },
  ]);

  if (!isOpen) return null;

  const handleSoSelectionChange = (soId: string) => {
    setSelectedSoId(soId);
    setErrorMessage(null);
    const so = salesOrders.find((s) => s.id === soId);
    if (so) {
      setCustomerLedgerId(so.customerLedgerId);
      if (so.items && so.items.length > 0) {
        setItems(
          so.items.map((item) => {
            const balance = getSoItemBalance(item.description, Number(item.quantity) || 1);
            return {
              description: item.description,
              dispatchedQty: balance.remaining,
              batchNumber: 'BAT-OUT-' + Date.now().toString().slice(-4),
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
        dispatchedQty: 1,
        batchNumber: 'BAT-OUT-' + Date.now().toString().slice(-4),
        maxAllowed: 9999,
        orderedQty: 9999,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: keyof DeliveryChallanItem, value: any) => {
    setErrorMessage(null);
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  // Check duplicate Challan number
  const isDuplicateChallanNumber = existingChallans.some(
    (c) => c.challanNumber.trim().toLowerCase() === challanNumber.trim().toLowerCase()
  );

  // Check if any item exceeds maxAllowed
  const overDispatchedItem = items.find((it) => it.maxAllowed !== undefined && (Number(it.dispatchedQty) || 0) > it.maxAllowed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isDuplicateChallanNumber) {
      setErrorMessage('Duplicate Challan Error: Delivery Challan #' + challanNumber + ' is already registered.');
      return;
    }

    if (overDispatchedItem) {
      setErrorMessage(
        `Business Rule Violation: Dispatch quantity (${overDispatchedItem.dispatchedQty}) for "${overDispatchedItem.description}" exceeds the remaining SO balance (${overDispatchedItem.maxAllowed}). Delivery cannot exceed Sales Order!`
      );
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === customerLedgerId);

    onSubmit({
      challanNumber,
      soId: selectedSoId || undefined,
      so: matchedSo ? { id: matchedSo.id, soNumber: matchedSo.soNumber } : undefined,
      customerLedgerId,
      customerLedger: selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name } : undefined,
      dispatchDate,
      vehicleNumber,
      transporterName,
      eWayBillNumber,
      remarks,
      status: 'DISPATCHED',
      items: items.map(({ maxAllowed, orderedQty, ...rest }) => rest),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Create Delivery Challan (Outward Dispatch)
              </h2>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                Enforces Delivery ≤ SO Quantity Rule & Zero-Duplicate Booking
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

          {isDuplicateChallanNumber && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Warning: Challan Number '{challanNumber}' is already in use.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Challan Number *
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => {
                  setChallanNumber(e.target.value);
                  setErrorMessage(null);
                }}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Link to Sales Order (SO) *
              </label>
              <select
                value={selectedSoId}
                onChange={(e) => handleSoSelectionChange(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Direct Dispatch (No SO Link)</option>
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.soNumber} — {so.customerLedger?.name || 'Customer'} (₹{so.totalAmount.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer / Debtor Party *
              </label>
              <select
                value={customerLedgerId}
                onChange={(e) => setCustomerLedgerId(e.target.value)}
                disabled={!!selectedSoId}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Dispatch Date *
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
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
                placeholder="e.g. MH-14-GH-4412"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transporter & e-Way Bill
              </label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                placeholder="Transporter Name / eWay Bill"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Dispatch Items & Stock Deduction</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 rounded-lg hover:bg-indigo-100 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 w-28 text-right">SO Balance</th>
                    <th className="py-2.5 px-2 w-28 text-right">Dispatch Qty *</th>
                    <th className="py-2.5 px-3 w-32">Batch / Heat #</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((it, idx) => {
                    const isExceeded = it.maxAllowed !== undefined && Number(it.dispatchedQty) > it.maxAllowed;
                    return (
                      <tr key={idx} className={isExceeded ? 'bg-rose-50/50 dark:bg-rose-950/30' : 'hover:bg-slate-50/50'}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          {it.orderedQty !== undefined && (
                            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                              Max: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{it.maxAllowed}</span> / {it.orderedQty}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            max={it.maxAllowed}
                            value={it.dispatchedQty}
                            onChange={(e) => handleUpdateItem(idx, 'dispatchedQty', Number(e.target.value))}
                            className={'w-full px-2 py-1 rounded border text-xs text-right font-mono font-bold ' + (
                              isExceeded
                                ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            )}
                          />
                          {isExceeded && (
                            <span className="text-[9px] text-rose-600 font-bold block text-right mt-0.5">
                              Exceeds SO!
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={it.batchNumber || ''}
                            onChange={(e) => handleUpdateItem(idx, 'batchNumber', e.target.value)}
                            placeholder="Batch #"
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
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
              Dispatch Instructions & Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
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
              disabled={!!overDispatchedItem || isDuplicateChallanNumber}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm & Dispatch Challan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
