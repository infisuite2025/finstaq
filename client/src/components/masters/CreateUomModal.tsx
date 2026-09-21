import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UnitOfMeasurement } from '../../types/masters';

interface CreateUomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uom: UnitOfMeasurement) => void;
}

export const CreateUomModal: React.FC<CreateUomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [symbol, setSymbol] = useState('');
  const { getAuthHeaders } = useAuth();
  const [formalName, setFormalName] = useState('');
  const [uqc, setUqc] = useState('');
  const [decimalPlaces, setDecimalPlaces] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !formalName.trim()) {
      setError('Symbol and Formal Name are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/uom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          formalName,
          uqc: uqc || symbol.toUpperCase(),
          decimalPlaces: Number(decimalPlaces),
          isDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Unit of Measurement');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Unit of Measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New Unit of Measurement (UoM)</h3>
            <p className="text-xs text-muted-foreground">Define quantity unit, decimal precision & GST UQC code</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold mb-1">Symbol / Unit Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. NOS, KGS, MTR, PCS, LTR, BOX"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Formal / Display Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Numbers, Kilograms, Metres, Litres"
              value={formalName}
              onChange={(e) => setFormalName(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">GST UQC Code</label>
              <input
                type="text"
                placeholder="e.g. NOS, KGS, MTR"
                value={uqc}
                onChange={(e) => setUqc(e.target.value.toUpperCase())}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Decimal Places</label>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value={0}>0 (Integers: PCS, NOS)</option>
                <option value={2}>2 (e.g. 10.50 MTR)</option>
                <option value={3}>3 (e.g. 1.250 KGS, TON)</option>
                <option value={4}>4 (High Precision)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultUom"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-input text-primary"
            />
            <label htmlFor="isDefaultUom" className="text-xs font-medium cursor-pointer">Set as system default unit for new items</label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Unit of Measurement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
