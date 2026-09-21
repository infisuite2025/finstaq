import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Settings2, Hash, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface SeriesConfig {
  id: string;
  seriesCode: string;
  seriesName?: string;
  prefix: string;
  suffix?: string;
  startingNumber: number;
  startNumber?: number;
  padding: number;
  paddingDigits?: number;
  restartFrequency?: string;
  currentNumber?: number;
  isDefault: boolean;
}

export function VoucherSeriesConfigModal({
  isOpen,
  onClose,
  voucherType,
}: {
  isOpen: boolean;
  onClose: () => void;
  voucherType: string;
}) {
  const { success, error } = useToast();
  const { getAuthHeaders } = useAuth();
  const [seriesList, setSeriesList] = useState<SeriesConfig[]>([]);
  const [selectedType, setSelectedType] = useState(voucherType || 'SALES');
  const [isAdding, setIsAdding] = useState(false);

  const [form, setForm] = useState({
    voucherType: 'SALES',
    seriesCode: '',
    seriesName: '',
    prefix: '',
    suffix: '',
    startingNumber: 1,
    startNumber: 1,
    padding: 4,
    paddingDigits: 4,
    restartFrequency: 'YEARLY',
    isDefault: false,
  });

  const fetchSeries = async () => {
    try {
      const res = await fetch(`/api/v1/accounting/voucher-series?voucherType=${selectedType}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSeriesList(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      
    }
  };

  useEffect(() => {
    if (isOpen) fetchSeries();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/accounting/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        success('Voucher numbering series saved!');
        setIsAdding(false);
        fetchSeries();
      }
    } catch (err) {
      error('Failed to save series');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-600" />
            Custom Voucher Numbering Sequences
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Type Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-2">
          {['SALES', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'JOURNAL', 'CONTRA'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setSelectedType(t);
                setForm((prev) => ({ ...prev, voucherType: t }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedType === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Series List */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {seriesList.map((s) => (
            <div
              key={s.id}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm"
            >
              <div>
                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {s.seriesName}
                  {s.isDefault && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  Pattern: <span className="text-indigo-600">{s.prefix}</span>
                  {'0'.repeat(s.paddingDigits ?? s.padding ?? 4)}
                  <span className="text-indigo-600">{s.suffix}</span> | Reset: {s.restartFrequency}
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-gray-400">Current No.</div>
                <div className="font-bold text-gray-900 dark:text-white">{s.currentNumber}</div>
              </div>
            </div>
          ))}
        </div>

        {isAdding ? (
          <form onSubmit={handleSave} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3 text-xs">
            <div className="font-bold text-gray-900 dark:text-white">Add New Numbering Series</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1">Series Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Branch Sales"
                  value={form.seriesName}
                  onChange={(e) => setForm({ ...form, seriesCode: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Prefix</label>
                <input
                  type="text"
                  placeholder="e.g. DEL/26-27/"
                  value={form.prefix}
                  onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-600 mb-1">Digits Padding</label>
                <input
                  type="number"
                  value={form.paddingDigits}
                  onChange={(e) => setForm({ ...form, padding: parseInt(e.target.value) || 4 })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Start Number</label>
                <input
                  type="number"
                  value={form.startNumber}
                  onChange={(e) => setForm({ ...form, startingNumber: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Reset Period</label>
                <select
                  value={form.restartFrequency}
                  onChange={(e) => setForm({ ...form, restartFrequency: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                >
                  <option value="YEARLY">Yearly (FY)</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="NEVER">Never</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 border rounded"
              >
                Cancel
              </button>
              <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded font-semibold">
                Save Series
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Custom Series
          </button>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-lg text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
