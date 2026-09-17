import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Factory,
  Layers,
  Sparkles,
  Plus,
  Play,
  History,
  Grid,
  Clock,
  ArrowRight,
  Boxes,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
}

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  standardCost: number;
  closingStockQty: number;
}

interface BillOfMaterials {
  id: string;
  bomCode: string;
  bomName: string;
  finishedItemId: string;
  finishedItemSku: string;
  finishedItemName: string;
  finishedItemUom: string;
  batchSize: number;
  components: Array<{
    itemId: string;
    itemSku: string;
    itemName: string;
    uom: string;
    quantityPerBatch: number;
    wastagePercent: number;
    unitCost: number;
    totalCost: number;
  }>;
  byProducts: Array<{
    itemName: string;
    uom: string;
    quantityPerBatch: number;
    estimatedRecoveryRate: number;
    totalRecoveryValue: number;
  }>;
  laborCostPerBatch: number;
  overheadCostPerBatch: number;
  totalRawMaterialCost: number;
  totalByProductRecovery: number;
  netProductionCost: number;
  costPerUnit: number;
}

interface ManufacturingRun {
  id: string;
  journalNumber: string;
  productionDate: string;
  bomCode: string;
  finishedItemName: string;
  finishedItemSku: string;
  quantityProduced: number;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  consumedComponents: any[];
  laborCharges: number;
  overheadCharges: number;
  netManufacturingCost: number;
  unitManufacturingCost: number;
}

export function ManufacturingBOMWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'boms' | 'production' | 'matrix' | 'aging'>('boms');
  const { getAuthHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [manufacturingHistory, setManufacturingHistory] = useState<ManufacturingRun[]>([]);
  
  // Matrix and Aging reports
  const [stockMatrix, setStockMatrix] = useState<any | null>(null);
  const [stockAging, setStockAging] = useState<any | null>(null);

  // Production Form State
  const [selectedBomId, setSelectedBomId] = useState<string>('');
  const [productionQty, setProductionQty] = useState<number>(2);
  const [sourceWhId, setSourceWhId] = useState<string>('wh-001');
  const [destWhId, setDestWhId] = useState<string>('wh-003');

  useEffect(() => {
    fetchBoms();
    fetchWarehouses();
    fetchStockItems();
    fetchHistory();
    fetchStockMatrix();
    fetchStockAging();
  }, []);

  const fetchBoms = async () => {
    try {
      const res = await fetch('/api/v1/inventory/boms', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        setBoms(Array.isArray(data.data) ? data.data : []);
        if (data.data.length > 0) setSelectedBomId(data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch BOMs', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/v1/inventory/warehouses', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) setWarehouses(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Failed to fetch warehouses', err);
    }
  };

  const fetchStockItems = async () => {
    try {
      const res = await fetch('/api/v1/inventory/items', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) setStockItems(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Failed to fetch stock items', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/inventory/manufacturing/history', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) setManufacturingHistory(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Failed to fetch manufacturing history', err);
    }
  };

  const fetchStockMatrix = async () => {
    try {
      const res = await fetch('/api/v1/inventory/reports/stock-matrix', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) setStockMatrix(data.data);
    } catch (err) {
      console.error('Failed to fetch stock matrix', err);
    }
  };

  const fetchStockAging = async () => {
    try {
      const res = await fetch('/api/v1/inventory/reports/stock-aging', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) setStockAging(data.data);
    } catch (err) {
      console.error('Failed to fetch stock aging', err);
    }
  };

  const handleExecuteProduction = async () => {
    if (!selectedBomId || productionQty <= 0) {
      toast.error('Please select a valid BOM and positive production quantity');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/inventory/manufacturing/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          bomId: selectedBomId,
          quantityToProduce: productionQty,
          sourceWarehouseId: sourceWhId,
          destinationWarehouseId: destWhId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Production order executed! Generated Stock Journal ${data.data.journalNumber}`);
        fetchHistory();
        fetchStockItems();
        fetchStockMatrix();
      } else {
        toast.error(data.error || 'Production execution failed');
      }
    } catch (err) {
      toast.error('Network error executing production order');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBom = boms.find(b => b.id === selectedBomId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-800/50">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing, BOM & Multi-Godown Hub</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                Enterprise Production Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-level Bill of Materials (BOM), automated stock journal production runs, godown matrix, and stock aging registers.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <StandardTabs<'boms' | 'production' | 'matrix' | 'aging'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'boms',
            label: 'BOM Designer & Recipes',
            icon: Layers,
            badge: boms.length,
            badgeVariant: 'default',
          },
          {
            id: 'production',
            label: 'Production Orders',
            icon: Play,
            badge: manufacturingHistory.length,
            badgeVariant: 'default',
          },
          {
            id: 'matrix',
            label: 'Godown Matrix',
            icon: Grid,
          },
          {
            id: 'aging',
            label: 'Stock Aging & Analysis',
            icon: Clock,
          },
        ]}
      />

      {/* TAB 1: BOM DESIGNER & RECIPE MATRIX */}
      {activeTab === 'boms' && (
        <div className="space-y-6">
          {boms.map((bom) => (
            <div key={bom.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* BOM Header Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      {bom.bomCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bom.bomName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Finished Good: <span className="font-semibold text-slate-800 dark:text-slate-200">{bom.finishedItemName} ({bom.finishedItemSku})</span> | Standard Batch Size: <span className="font-semibold text-blue-600">{bom.batchSize} {bom.finishedItemUom}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Unit Production Cost</span>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{bom.costPerUnit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw Material Components Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Raw Material Component Ingredients ({bom.components.length} items)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-4">Item SKU & Description</th>
                        <th className="py-2.5 px-4 text-center">Batch Qty</th>
                        <th className="py-2.5 px-4 text-center">Wastage %</th>
                        <th className="py-2.5 px-4 text-right">Standard Rate</th>
                        <th className="py-2.5 px-4 text-right">Total RM Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bom.components.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                            {c.itemName} <span className="font-mono text-slate-400 text-[11px]">({c.itemSku})</span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono">{c.quantityPerBatch} {c.uom}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-amber-600">{c.wastagePercent}%</td>
                          <td className="py-2.5 px-4 text-right font-mono">₹{c.unitCost.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            ₹{c.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overheads & Cost Summary Footer */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-500">Total Raw Materials:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">₹{bom.totalRawMaterialCost.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Direct Labor Allocation:</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">+ ₹{bom.laborCostPerBatch.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Overheads & Power:</span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">+ ₹{bom.overheadCostPerBatch.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500">By-Product Scrap Recovery:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">- ₹{bom.totalByProductRecovery.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PRODUCTION ORDERS & MANUFACTURING JOURNAL */}
      {activeTab === 'production' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Run Production Order */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-600" />
              <span>Execute Manufacturing Production Order</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Select BOM Recipe</label>
                <select
                  value={selectedBomId}
                  onChange={(e) => setSelectedBomId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {boms.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bomCode} — {b.bomName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Quantity to Produce (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={productionQty}
                  onChange={(e) => setProductionQty(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Source Godown (Raw Material)</label>
                  <select
                    value={sourceWhId}
                    onChange={(e) => setSourceWhId(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Destination Godown (FG)</label>
                  <select
                    value={destWhId}
                    onChange={(e) => setDestWhId(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBom && (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Estimated Total Cost:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      ₹{(selectedBom.costPerUnit * productionQty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Per-Unit Cost:</span>
                    <span className="font-mono font-semibold">₹{selectedBom.costPerUnit.toLocaleString('en-IN')} / {selectedBom.finishedItemUom}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleExecuteProduction}
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isLoading ? 'Executing Production Run...' : 'Post Manufacturing Stock Journal'}
              </button>
            </div>
          </div>

          {/* Right Log: Manufacturing Journal History */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Production Order History & Cost Sheets</span>
            </h3>

            <div className="space-y-3">
              {manufacturingHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No manufacturing runs executed yet. Select a BOM and click execute above.
                </div>
              ) : (
                manufacturingHistory.map((run) => (
                  <div key={run.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{run.journalNumber}</span>
                        <span className="text-slate-500">({run.productionDate})</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{run.netManufacturingCost.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Produced {run.quantityProduced}x {run.finishedItemName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{run.sourceWarehouseName} ➔ {run.destinationWarehouseName}</span>
                      <span className="font-mono">Unit Cost: ₹{run.unitManufacturingCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GODOWN STOCK MATRIX */}
      {activeTab === 'matrix' && stockMatrix && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Godown Stock Distribution Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time inventory levels across all warehouse godowns.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Item SKU & Name</th>
                  <th className="py-3 px-4">Category</th>
                  {stockMatrix.warehouses.map((w: any) => (
                    <th key={w.id} className="py-3 px-4 text-center font-mono">{w.name.split(' - ')[0]}</th>
                  ))}
                  <th className="py-3 px-4 text-right">Total Qty</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMatrix.items.map((item: any) => (
                  <tr key={item.itemId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.category}</td>
                    {stockMatrix.warehouses.map((w: any) => (
                      <td key={w.id} className="py-3 px-4 text-center font-mono font-medium">
                        {item.warehouseBalances[w.id] || 0} {item.uom}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {item.totalClosingQty} {item.uom}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{item.totalStockValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK AGING ANALYSIS */}
      {activeTab === 'aging' && stockAging && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventory Aging Register (FIFO Breakdown)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Inventory Value: <span className="font-semibold text-emerald-600">₹{stockAging.summary.totalInventoryValue.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4 text-right">&lt; 30 Days</th>
                  <th className="py-3 px-4 text-right">30 - 60 Days</th>
                  <th className="py-3 px-4 text-right">60 - 90 Days</th>
                  <th className="py-3 px-4 text-right">&gt; 90 Days</th>
                  <th className="py-3 px-4 text-right font-bold">Total Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockAging.items.map((row: any) => (
                  <tr key={row.itemId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                      <span className="ml-1.5 font-mono text-slate-400 text-[11px]">({row.sku})</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600">
                      ₹{row.agingBuckets.lessThan30Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-600">
                      ₹{row.agingBuckets.between30And60Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600">
                      ₹{row.agingBuckets.between60And90Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">
                      ₹{row.agingBuckets.moreThan90Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{row.totalStockValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
