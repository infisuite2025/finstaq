import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Boxes,
  Warehouse as WarehouseIcon,
  ArrowRightLeft,
  ClipboardCheck,
  Search,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Package,
  Calendar,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  capacitySqFt: number;
  managerName: string;
  contactNumber: string;
  isDefault: boolean;
}

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  hsnCode: string;
  taxRatePercent: number;
  reorderLevel: number;
  standardCost: number;
  sellingPrice: number;
  valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE';
  closingStockQty: number;
  warehouseBalances: Record<string, number>;
}

interface StockTransferNote {
  id: string;
  stnNumber: string;
  transferDate: string;
  fromWarehouseName: string;
  toWarehouseName: string;
  vehicleNumber?: string;
  transporterName?: string;
  status: string;
  remarks?: string;
  items: Array<{
    itemId: string;
    itemSku: string;
    itemName: string;
    uom: string;
    qty: number;
    unitCost: number;
    totalValue: number;
  }>;
}

interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: string;
  warehouseName: string;
  adjustmentType: string;
  remarks?: string;
  voucherNumber?: string;
  items: Array<{
    itemSku: string;
    itemName: string;
    uom: string;
    bookQty: number;
    physicalQty: number;
    varianceQty: number;
    unitCost: number;
    totalVarianceValue: number;
  }>;
}

export const InventoryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transfers' | 'adjustments' | 'warehouses'>('stock');
  const [items, setItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transfers, setTransfers] = useState<StockTransferNote[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // New Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [fromWhId, setFromWhId] = useState('');
  const [toWhId, setToWhId] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferVehicle, setTransferVehicle] = useState('');
  const [transferTransporter, setTransferTransporter] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');
  const [selectedTransferItem, setSelectedTransferItem] = useState('');
  const [transferQty, setTransferQty] = useState<number>(1);

  // New Adjustment Modal
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [adjWhId, setAdjWhId] = useState('');
  const [adjType, setAdjType] = useState('PHYSICAL_AUDIT');
  const [adjRemarks, setAdjRemarks] = useState('');
  const [selectedAdjItem, setSelectedAdjItem] = useState('');
  const [adjPhysicalQty, setAdjPhysicalQty] = useState<number>(0);

  const { success, error, warning } = useToast();
  const { getAuthHeaders } = useAuth();
  const { confirm } = useConfirm();

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsRes, whRes, transRes, adjRes, sumRes] = await Promise.all([
        fetch(`/api/v1/inventory/items?search=${searchQuery}&category=${categoryFilter}`, { headers: getAuthHeaders() }),
        fetch('/api/v1/inventory/warehouses', { headers: getAuthHeaders() }),
        fetch('/api/v1/inventory/transfers', { headers: getAuthHeaders() }),
        fetch('/api/v1/inventory/adjustments', { headers: getAuthHeaders() }),
        fetch('/api/v1/inventory/summary', { headers: getAuthHeaders() }),
      ]);

      if (itemsRes.ok) setItems((await itemsRes.json()).data || []);
      if (whRes.ok) {
        const whs = (await whRes.json()).data || [];
        setWarehouses(whs);
        if (whs.length >= 2) {
          if (!fromWhId) setFromWhId(whs[0].id);
          if (!toWhId) setToWhId(whs[1].id);
          if (!adjWhId) setAdjWhId(whs[0].id);
        }
      }
      if (transRes.ok) setTransfers((await transRes.json()).data || []);
      if (adjRes.ok) setAdjustments((await adjRes.json()).data || []);
      if (sumRes.ok) setSummary((await sumRes.json()).data || null);
    } catch (e) {
      console.error('Failed to fetch inventory data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [categoryFilter]);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransferItem || transferQty <= 0) {
      warning('Please select an item and valid transfer quantity');
      return;
    }

    const confirmed = await confirm({
      title: 'Confirm Stock Transfer Note',
      message: 'Are you sure you want to transfer ' + transferQty + ' units to destination godown?',
      type: 'info',
      confirmText: 'Dispatch & Transfer',
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/v1/inventory/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': getAuthHeaders()['x-tenant-id'],
        },
        body: JSON.stringify({
          fromWarehouseId: fromWhId,
          toWarehouseId: toWhId,
          transferDate,
          vehicleNumber: transferVehicle,
          transporterName: transferTransporter,
          remarks: transferRemarks,
          items: [{ itemId: selectedTransferItem, qty: Number(transferQty) }],
        }),
      });

      const json = await res.json();
      if (json.success) {
        success('Stock Transfer Note #' + json.data.stnNumber + ' generated successfully!', 'STN Created');
        setIsTransferModalOpen(false);
        fetchInventoryData();
      } else {
        error(json.error || 'Failed to create transfer');
      }
    } catch (err: any) {
      error(err.message || 'Network error');
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjItem) {
      warning('Please select an item to adjust');
      return;
    }

    const confirmed = await confirm({
      title: 'Confirm Stock Journal Adjustment',
      message: 'This will post a Physical Stock Reconciliation Journal and update closing inventory. Proceed?',
      type: 'warning',
      confirmText: 'Yes, Post Stock Journal',
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/v1/inventory/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': getAuthHeaders()['x-tenant-id'],
        },
        body: JSON.stringify({
          warehouseId: adjWhId,
          adjustmentDate: new Date().toISOString().split('T')[0],
          adjustmentType: adjType,
          remarks: adjRemarks,
          items: [{ itemId: selectedAdjItem, physicalQty: Number(adjPhysicalQty) }],
        }),
      });

      const json = await res.json();
      if (json.success) {
        success('Stock Adjustment #' + json.data.adjustmentNumber + ' posted successfully!', 'Reconciled');
        setIsAdjModalOpen(false);
        fetchInventoryData();
      } else {
        error(json.error || 'Failed to adjust stock');
      }
    } catch (err: any) {
      error(err.message || 'Network error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Boxes className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Stores & Inventory Management
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Multi-Godown
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Real-time stock valuation (FIFO/Weighted Avg), inter-godown transfers (STN), and physical stock reconciliation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchInventoryData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            New Godown Transfer (STN)
          </button>
          <button
            onClick={() => setIsAdjModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl transition-all"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
            Stock Journal / Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stock Value</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹ {summary.totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">✓ FIFO / Weighted Avg Valued</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active SKUs</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.totalSKUs} Items</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Across all item categories</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Godowns / Warehouses</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{summary.totalWarehouses} Locations</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">1 Central + 2 Regional Yards</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reorder / Low Stock Alerts</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.lowStockCount} Items</div>
            <div className="text-[10px] text-rose-600 font-semibold mt-1">Below minimum safety threshold</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'stock'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Stock Summary & Valuation ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'transfers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Godown Transfers / STN ({transfers.length})
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'adjustments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Stock Journal & Adjustments ({adjustments.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'warehouses'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          Godown / Warehouse Directory ({warehouses.length})
        </button>
      </div>

      {/* Tab 1: Stock Summary */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="ALL">All Categories</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Electricals">Electricals</option>
                <option value="Machinery Components">Machinery Components</option>
                <option value="Consumables">Consumables</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SKU, item name, HSN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchInventoryData()}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs w-56 sm:w-64"
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {items.length} items in inventory
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Item SKU & Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">HSN & UOM</th>
                  <th className="p-3.5 text-right">Standard Cost</th>
                  <th className="p-3.5 text-right">Total Closing Stock</th>
                  <th className="p-3.5 text-right">Total Stock Value</th>
                  <th className="p-3.5">Godown Breakdown</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {items.map((item) => {
                  const totalVal = item.closingStockQty * item.standardCost;
                  const isLow = item.closingStockQty <= item.reorderLevel;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{item.sku}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">HSN: {item.hsnCode}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{item.uom} • GST {item.taxRatePercent}%</div>
                      </td>
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ₹ {item.standardCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-sm text-slate-900 dark:text-white">
                        {item.closingStockQty.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">{item.uom}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₹ {totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {warehouses.map(w => {
                            const qty = item.warehouseBalances[w.id] || 0;
                            if (qty === 0) return null;
                            return (
                              <div key={w.id} className="text-[11px] flex items-center justify-between gap-2 text-slate-500">
                                <span>{w.code}:</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{qty.toFixed(2)} {item.uom}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-300">
                            <AlertTriangle className="w-3 h-3" /> Reorder Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Adequate Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Godown Transfers */}
      {activeTab === 'transfers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inter-Godown Stock Transfer Slips (STN)</h3>
            <span className="text-xs text-slate-500 font-semibold">{transfers.length} transfers recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">STN #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Source Godown</th>
                  <th className="p-3.5">Destination Godown</th>
                  <th className="p-3.5">Items Transferred</th>
                  <th className="p-3.5">Transporter & Vehicle</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {transfers.map((stn) => (
                  <tr key={stn.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-black text-blue-600 dark:text-blue-400">{stn.stnNumber}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{stn.transferDate}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{stn.fromWarehouseName}</td>
                    <td className="p-3.5 font-semibold text-emerald-700 dark:text-emerald-300">{stn.toWarehouseName}</td>
                    <td className="p-3.5">
                      {stn.items.map((it, idx) => (
                        <div key={idx} className="font-medium text-slate-700 dark:text-slate-300">
                          {it.itemName}: <span className="font-mono font-bold text-blue-600">{it.qty} {it.uom}</span> (₹ {it.totalValue.toLocaleString()})
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {stn.vehicleNumber || 'Internal Van'} • {stn.transporterName || 'Self'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {stn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Adjustments */}
      {activeTab === 'adjustments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Physical Stock Journal & Audit Reconciliations</h3>
            <span className="text-xs text-slate-500 font-semibold">{adjustments.length} adjustment records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Adj Number</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Godown</th>
                  <th className="p-3.5">Type & Reason</th>
                  <th className="p-3.5">Book Qty vs Physical Qty</th>
                  <th className="p-3.5 text-right">Variance & Valuation Impact</th>
                  <th className="p-3.5">Linked Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-black text-amber-600">{adj.adjustmentNumber}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{adj.adjustmentDate}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{adj.warehouseName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {adj.adjustmentType}
                      </span>
                      {adj.remarks && <div className="text-[11px] text-slate-500 mt-0.5">{adj.remarks}</div>}
                    </td>
                    <td className="p-3.5">
                      {adj.items.map((it, idx) => (
                        <div key={idx} className="font-medium text-slate-700 dark:text-slate-300">
                          {it.itemName}: Book <span className="font-mono">{it.bookQty}</span> ➔ Physical <span className="font-mono font-bold text-slate-900 dark:text-white">{it.physicalQty} {it.uom}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-right">
                      {adj.items.map((it, idx) => (
                        <div key={idx} className={`font-mono font-bold ${it.varianceQty >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {it.varianceQty >= 0 ? '+' : ''}{it.varianceQty} {it.uom} (₹ {it.totalVarianceValue.toLocaleString()})
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-blue-600">{adj.voucherNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Warehouses */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black uppercase font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {wh.code}
                  </span>
                  {wh.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Primary Hub
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{wh.name}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{wh.address}</p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div><strong>Storage Capacity:</strong> {wh.capacitySqFt.toLocaleString()} sq.ft</div>
                  <div><strong>Godown In-Charge:</strong> {wh.managerName}</div>
                  <div><strong>Contact:</strong> {wh.contactNumber}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Inter-Godown Transfer */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                Issue Inter-Godown Stock Transfer (STN)
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Source Godown (From)</label>
                  <select
                    value={fromWhId}
                    onChange={e => setFromWhId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destination Godown (To)</label>
                  <select
                    value={toWhId}
                    onChange={e => setToWhId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Item to Transfer</label>
                <select
                  value={selectedTransferItem}
                  onChange={e => setSelectedTransferItem(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {items.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.sku}) - Avail in Source: {(it.warehouseBalances[fromWhId] || 0)} {it.uom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transfer Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={transferQty}
                    onChange={e => setTransferQty(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle / Truck No.</label>
                  <input
                    type="text"
                    placeholder="MH-04-AB-1234"
                    value={transferVehicle}
                    onChange={e => setTransferVehicle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transfer Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Stock replenishment for production batch"
                  value={transferRemarks}
                  onChange={e => setTransferRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
                >
                  Generate STN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Physical Stock Audit & Journal */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-600" />
                Physical Stock Reconciliation & Journal
              </h3>
              <button onClick={() => setIsAdjModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Godown to Audit</label>
                <select
                  value={adjWhId}
                  onChange={e => setAdjWhId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Item to Reconcile</label>
                <select
                  value={selectedAdjItem}
                  onChange={e => {
                    setSelectedAdjItem(e.target.value);
                    const it = items.find(i => i.id === e.target.value);
                    if (it) setAdjPhysicalQty(it.warehouseBalances[adjWhId] || 0);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Stock Item --</option>
                  {items.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.sku}) - Book Qty: {(it.warehouseBalances[adjWhId] || 0)} {it.uom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physical Counted Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={adjPhysicalQty}
                    onChange={e => setAdjPhysicalQty(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Type</label>
                  <select
                    value={adjType}
                    onChange={e => setAdjType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PHYSICAL_AUDIT">Physical Stock Count Audit</option>
                    <option value="DAMAGE">Damaged in Transit / Storage</option>
                    <option value="EXPIRY">Expired Material</option>
                    <option value="CORRECTION">Counting Error Correction</option>
                    <option value="SCRAP">Scrapped Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Audit Notes / Explanation</label>
                <input
                  type="text"
                  placeholder="e.g. Discrepancy observed during monthly physical verification"
                  value={adjRemarks}
                  onChange={e => setAdjRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
                >
                  Post Stock Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
