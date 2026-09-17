import React, { useState } from 'react';
import { InventoryItemMaster } from '../../types/masters';
import { X, Package, CheckCircle, Tag, Layers, BarChart2 } from 'lucide-react';

interface CreateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: Partial<InventoryItemMaster>) => void;
}

export function CreateInventoryModal({ isOpen, onClose, onSubmit }: CreateInventoryModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState(`SKU-${Date.now().toString().slice(-5)}`);
  const [category, setCategory] = useState('Precision Machined Parts');
  const [hsnCode, setHsnCode] = useState('8481');
  const [taxRatePercent, setTaxRatePercent] = useState(18);
  const [unit, setUnit] = useState('PCS');
  const [openingStockQty, setOpeningStockQty] = useState(50);
  const [reorderLevel, setReorderLevel] = useState(15);
  const [standardCost, setStandardCost] = useState(3200);
  const [sellingPrice, setSellingPrice] = useState(4800);
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'WEIGHTED_AVERAGE'>('FIFO');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    onSubmit({
      name,
      sku,
      category,
      hsnCode,
      taxRatePercent,
      unit,
      closingStockQty: openingStockQty,
      reorderLevel,
      standardCost,
      sellingPrice,
      valuationMethod,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Add Inventory / Product Item Master</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register stock SKUs, statutory HSN tax slabs, UOM, and reorder threshold levels
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
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product / Item Description *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stainless Steel Precision Flange 25mm"
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stock SKU / Part Number *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Fasteners, Raw Materials"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                HSN / SAC Code
              </label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 8481"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GST Tax Rate %
              </label>
              <select
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="0">0% (Nil / Exempt)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard Goods)</option>
                <option value="28">28% GST (Luxury / High Rate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit of Measurement (UOM)
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="NOS">NOS (Numbers)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="SET">SET (Sets)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opening Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={openingStockQty}
                onChange={(e) => setOpeningStockQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reorder Alert Level
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Purchase Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                value={standardCost}
                onChange={(e) => setStandardCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Selling Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Item Master</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
