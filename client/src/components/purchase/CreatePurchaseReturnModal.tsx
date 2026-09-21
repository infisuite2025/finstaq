import React, { useState, useEffect, useMemo } from 'react';
import { X, RotateCcw, Building2, PackageMinus, ShieldCheck, Link2, FileCheck, Layers, AlertCircle, CheckSquare, Square, Info } from 'lucide-react';
import { PurchaseInvoice, PurchaseOrder, GoodsReceiptNote } from '../../types/purchase';

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
  poNumber?: string;
  grnNumber?: string;
  maxAllowed?: number;
}

export interface PurchaseReturnFormData {
  vendorLedgerId: string;
  vendorName: string;
  vendorGstin?: string;
  vendorState?: string;
  originalInvoiceNumber: string;
  linkMode: 'GRN' | 'PO' | 'DIRECT';
  linkedGrnNumbers: string[];
  linkedPoNumbers: string[];
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
  purchaseOrders?: PurchaseOrder[];
  goodsReceiptNotes?: GoodsReceiptNote[];
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
  invoices = [],
  vendors = [],
  purchaseOrders = [],
  goodsReceiptNotes = [],
}: CreatePurchaseReturnModalProps) {
  const [vendorLedgerId, setVendorLedgerId] = useState(vendors[0]?.id || 'v-101');
  const [linkMode, setLinkMode] = useState<'GRN' | 'PO' | 'DIRECT'>('GRN');
  const [selectedGrnIds, setSelectedGrnIds] = useState<string[]>([]);
  const [selectedPoIds, setSelectedPoIds] = useState<string[]>([]);
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState('STARK/26-27/9912');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<PurchaseReturnFormData['reason']>('DEFECTIVE_QC_REJECT');
  const [warehouseId, setWarehouseId] = useState('wh-01');
  const [autoCreateDebitNote, setAutoCreateDebitNote] = useState(true);
  const [remarks, setRemarks] = useState('Material rejected during incoming QA inspection. Dimensions outside tolerance.');

  const [items, setItems] = useState<PurchaseReturnItemData[]>([
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
      poNumber: 'PO-2026-0045',
      grnNumber: 'GRN-2026-0031',
    },
  ]);

  // Available POs and GRNs for the selected vendor
  const vendorPos = useMemo(() => {
    return purchaseOrders.filter((p) => p.vendorLedgerId === vendorLedgerId);
  }, [purchaseOrders, vendorLedgerId]);

  const vendorGrns = useMemo(() => {
    return goodsReceiptNotes.filter((g) => g.vendorLedgerId === vendorLedgerId);
  }, [goodsReceiptNotes, vendorLedgerId]);

  const vendorInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.vendorLedgerId === vendorLedgerId);
  }, [invoices, vendorLedgerId]);

  // Sync default selection when vendor changes
  useEffect(() => {
    if (vendorGrns.length > 0) {
      setSelectedGrnIds([vendorGrns[0].id]);
    } else {
      setSelectedGrnIds([]);
    }

    if (vendorPos.length > 0) {
      setSelectedPoIds([vendorPos[0].id]);
    } else {
      setSelectedPoIds([]);
    }

    if (vendorInvoices.length > 0) {
      setOriginalInvoiceNumber(vendorInvoices[0].vendorInvoiceNumber);
    }
  }, [vendorLedgerId, vendorGrns.length, vendorPos.length, vendorInvoices.length]);

  if (!isOpen) return null;

  const selectedVendor = vendors.find((v) => v.id === vendorLedgerId) || vendors[0];
  const isInterState = selectedVendor?.state?.includes('Gujarat') || selectedVendor?.state?.includes('Inter-State');

  // Toggle selection for multiple GRNs
  const toggleGrnSelection = (grnId: string) => {
    setSelectedGrnIds((prev) =>
      prev.includes(grnId) ? prev.filter((id) => id !== grnId) : [...prev, grnId]
    );
  };

  // Toggle selection for multiple POs
  const togglePoSelection = (poId: string) => {
    setSelectedPoIds((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  };

  // Auto-populate line items from Selected GRNs (supports multi-GRN consolidation)
  const handlePopulateFromGrns = () => {
    const chosenGrns = goodsReceiptNotes.filter((g) => selectedGrnIds.includes(g.id));
    if (chosenGrns.length === 0) return;

    const populatedItems: PurchaseReturnItemData[] = [];
    chosenGrns.forEach((grn) => {
      const parentPo = purchaseOrders.find((p) => p.id === grn.poId);
      grn.items.forEach((gItem) => {
        const matchingPoItem = parentPo?.items?.find((pi) => pi.description === gItem.description);
        const qty = gItem.rejectedQty > 0 ? gItem.rejectedQty : Math.min(gItem.receivedQty, 5);
        const unitPrice = matchingPoItem?.unitPrice || 4500;
        const gstRate = matchingPoItem?.taxRatePercent || 18;
        const taxable = qty * unitPrice;
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isInterState) {
          igst = (taxable * gstRate) / 100;
        } else {
          cgst = (taxable * gstRate) / 200;
          sgst = (taxable * gstRate) / 200;
        }

        populatedItems.push({
          description: gItem.description,
          hsnCode: matchingPoItem?.hsnCode || '7318',
          quantity: qty,
          maxAllowed: gItem.receivedQty,
          unitPrice,
          taxableAmount: taxable,
          gstRatePercent: gstRate,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          totalAmount: taxable + cgst + sgst + igst,
          reason: gItem.rejectionReason || 'Defective / QA non-compliance',
          batchNumber: gItem.batchNumber || 'BATCH-2026-Q3',
          poNumber: parentPo?.poNumber || grn.po?.poNumber || 'PO-2026-0045',
          grnNumber: grn.grnNumber,
        });
      });
    });

    if (populatedItems.length > 0) {
      setItems(populatedItems);
    }
  };

  // Auto-populate line items from Selected POs (supports multi-PO consolidation)
  const handlePopulateFromPos = () => {
    const chosenPos = purchaseOrders.filter((p) => selectedPoIds.includes(p.id));
    if (chosenPos.length === 0) return;

    const populatedItems: PurchaseReturnItemData[] = [];
    chosenPos.forEach((po) => {
      po.items.forEach((pItem) => {
        const qty = Math.min(pItem.quantity, 2);
        const unitPrice = pItem.unitPrice;
        const gstRate = pItem.taxRatePercent || 18;
        const taxable = qty * unitPrice;
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isInterState) {
          igst = (taxable * gstRate) / 100;
        } else {
          cgst = (taxable * gstRate) / 200;
          sgst = (taxable * gstRate) / 200;
        }

        populatedItems.push({
          description: pItem.description,
          hsnCode: pItem.hsnCode || '7318',
          quantity: qty,
          maxAllowed: pItem.quantity,
          unitPrice,
          taxableAmount: taxable,
          gstRatePercent: gstRate,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          totalAmount: taxable + cgst + sgst + igst,
          reason: 'Excess dispatch / Grade mismatch',
          poNumber: po.poNumber,
          grnNumber: 'N/A (Pre-Inward)',
        });
      });
    });

    if (populatedItems.length > 0) {
      setItems(populatedItems);
    }
  };

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
        cgstAmount: isInterState ? 0 : 180,
        sgstAmount: isInterState ? 0 : 180,
        igstAmount: isInterState ? 360 : 0,
        totalAmount: 2360,
        reason: 'Micro-crack detected',
        poNumber: selectedPoIds.length > 0 ? (purchaseOrders.find(p => p.id === selectedPoIds[0])?.poNumber || 'PO-GEN') : 'PO-2026-0045',
        grnNumber: selectedGrnIds.length > 0 ? (goodsReceiptNotes.find(g => g.id === selectedGrnIds[0])?.grnNumber || 'GRN-GEN') : 'GRN-2026-0031',
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

  // Extract all linked PO and GRN identifiers across items and selections
  const linkedGrnNumbers = Array.from(
    new Set([
      ...selectedGrnIds.map((id) => goodsReceiptNotes.find((g) => g.id === id)?.grnNumber).filter(Boolean),
      ...items.map((it) => it.grnNumber).filter((g): g is string => !!g && g !== 'N/A' && !g.includes('N/A')),
    ])
  ) as string[];

  const linkedPoNumbers = Array.from(
    new Set([
      ...selectedPoIds.map((id) => purchaseOrders.find((p) => p.id === id)?.poNumber).filter(Boolean),
      ...items.map((it) => it.poNumber).filter((p): p is string => !!p && p !== 'N/A' && !p.includes('N/A')),
    ])
  ) as string[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selWh = WAREHOUSES.find((w) => w.id === warehouseId) || WAREHOUSES[0];
    onSubmit({
      vendorLedgerId,
      vendorName: selectedVendor?.name || 'Vendor Creditor',
      vendorGstin: selectedVendor?.gstin || '27AABCS1429B1Z8',
      vendorState: selectedVendor?.state || 'Maharashtra (27)',
      originalInvoiceNumber: originalInvoiceNumber || 'INV-REF-OUT',
      linkMode,
      linkedGrnNumbers,
      linkedPoNumbers,
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/80 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>Issue Purchase Return (Return Outward)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold">
                  Multi-PO & Multi-GRN Supported
                </span>
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Deduct physical warehouse inventory, link GRNs / POs & trigger Section 34 GST Debit Note
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {overReturnItem && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-shake">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Business Rule Violation: Return quantity ({overReturnItem.quantity}) for '{overReturnItem.description}' exceeds the original inwarded balance ({overReturnItem.maxAllowed}). Purchase Returns cannot exceed received GRN/PO quantity.
              </span>
            </div>
          )}

          {/* Supplier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Supplier / Creditor Party *</span>
              </label>
              <select
                value={vendorLedgerId}
                onChange={(e) => setVendorLedgerId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gstin || 'GSTIN Pending'}) - {v.state || 'Local State'}
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
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Document Linkage Selector (Multi-GRN, Multi-PO, or Direct Bill) */}
          <div className="space-y-3 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/40 pb-3">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Document Linkage & Line Traceability Mode
                </span>
              </div>
              
              {/* Link Mode Switcher */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setLinkMode('GRN')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    linkMode === 'GRN'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Link Inward GRNs ({vendorGrns.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode('PO')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    linkMode === 'PO'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Link Purchase Orders ({vendorPos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode('DIRECT')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    linkMode === 'DIRECT'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Direct / Ad-Hoc
                </button>
              </div>
            </div>

            {/* Mode 1: GRN Multi-Select Linkage */}
            {linkMode === 'GRN' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Select one or multiple Goods Receipt Notes (GRNs) to link to this return outward:
                  </span>
                  {selectedGrnIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handlePopulateFromGrns}
                      className="px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Pull Items from Selected GRN(s)</span>
                    </button>
                  )}
                </div>

                {vendorGrns.length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>No inward GRNs found for this supplier. You can switch to "Link Purchase Orders" or "Direct / Ad-Hoc" mode.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {vendorGrns.map((g) => {
                      const isSelected = selectedGrnIds.includes(g.id);
                      const matchingPo = purchaseOrders.find((p) => p.id === g.poId);
                      return (
                        <div
                          key={g.id}
                          onClick={() => toggleGrnSelection(g.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500 dark:border-blue-400 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="text-xs">
                            <div className="font-bold font-mono text-slate-900 dark:text-slate-100">
                              {g.grnNumber}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Date: {g.receivedDate} | QC: <span className="font-semibold text-emerald-600">{g.qcStatus}</span>
                            </div>
                            {matchingPo && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                                Ref PO: {matchingPo.poNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: PO Multi-Select Linkage */}
            {linkMode === 'PO' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Select one or multiple Purchase Orders (POs) for this return voucher:
                  </span>
                  {selectedPoIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handlePopulateFromPos}
                      className="px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Pull Items from Selected PO(s)</span>
                    </button>
                  )}
                </div>

                {vendorPos.length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>No Purchase Orders found for this supplier. Switch to "Direct / Ad-Hoc" mode.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {vendorPos.map((p) => {
                      const isSelected = selectedPoIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePoSelection(p.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500 dark:border-blue-400 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="text-xs">
                            <div className="font-bold font-mono text-slate-900 dark:text-slate-100">
                              {p.poNumber}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Date: {p.orderDate} | Total: ₹{p.totalAmount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Status: {p.status} ({p.items.length} lines)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Direct Bill Ref Info */}
            {linkMode === 'DIRECT' && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Ad-Hoc / Direct Invoiced Return:</span>
                <p className="text-slate-500 dark:text-slate-400">
                  Return items are directly associated with Supplier Bill <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{originalInvoiceNumber}</span>. You can enter or customize line-level PO & GRN numbers directly in the items table below if available.
                </p>
              </div>
            )}

            {/* Linkage Summary Badge Bar */}
            {(linkedGrnNumbers.length > 0 || linkedPoNumbers.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Consolidated Links:</span>
                {linkedGrnNumbers.map((grn) => (
                  <span key={grn} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    GRN: {grn}
                  </span>
                ))}
                {linkedPoNumbers.map((po) => (
                  <span key={po} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    PO: {po}
                  </span>
                ))}
              </div>
            )}
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
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Rejection Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table with per-item PO/GRN attribution */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                <PackageMinus className="w-4 h-4 text-rose-600" />
                <span>Return Material Line Items ({items.length})</span>
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description / Item</th>
                    <th className="py-2.5 px-2 w-28">Ref PO #</th>
                    <th className="py-2.5 px-2 w-28">Ref GRN #</th>
                    <th className="py-2.5 px-2 w-16">HSN</th>
                    <th className="py-2.5 px-2 w-20 text-right">Qty</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 w-16 text-center">GST %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                    <th className="py-2.5 px-2 w-8 text-center"></th>
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
                          className="w-full px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          placeholder="Item Name"
                        />
                        {it.batchNumber && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Batch: {it.batchNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={it.poNumber || ''}
                          onChange={(e) => updateItem(idx, 'poNumber', e.target.value)}
                          placeholder="PO-2026-XXXX"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-purple-700 dark:text-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={it.grnNumber || ''}
                          onChange={(e) => updateItem(idx, 'grnNumber', e.target.value)}
                          placeholder="GRN-2026-XXXX"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={it.hsnCode || ''}
                          onChange={(e) => updateItem(idx, 'hsnCode', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-right font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          value={it.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-right font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={it.gstRatePercent}
                          onChange={(e) => updateItem(idx, 'gstRatePercent', Number(e.target.value))}
                          className="w-full px-1.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1 cursor-pointer"
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
                  Posts Dr Supplier / Cr Purchase Return & Reverses Input Tax Credit ({isInterState ? 'IGST' : 'CGST+SGST'})
                </span>
              </div>
            </label>

            <div className="text-right space-y-1 w-full md:w-auto">
              <div className="text-xs text-slate-500">
                Taxable: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span> + GST ({isInterState ? 'IGST' : 'CGST+SGST'}): <span className="font-mono font-bold text-rose-600">₹{totalTax.toLocaleString('en-IN')}</span>
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
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!overReturnItem}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer"
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
