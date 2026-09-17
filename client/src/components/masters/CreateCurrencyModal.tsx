import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CurrencyMaster } from '../../types/masters';

interface CreateCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cur: CurrencyMaster) => void;
}

export const CreateCurrencyModal: React.FC<CreateCurrencyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const { getAuthHeaders } = useAuth();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isBase, setIsBase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !symbol.trim()) {
      setError('Currency Code, Name and Symbol are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/currencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name,
          symbol,
          decimalPlaces: Number(decimalPlaces),
          exchangeRate: Number(exchangeRate),
          isBase,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Currency');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Currency');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New Currency & Exchange Rate</h3>
            <p className="text-xs text-muted-foreground">Multi-currency accounting & foreign invoice exchange rates</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Currency Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. USD, EUR, GBP, AED"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Currency Symbol *</label>
              <input
                type="text"
                required
                placeholder="e.g. $, €, £, د.إ, ¥"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Currency Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. US Dollar, Euro, Great British Pound"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Exchange Rate to Base (₹)</label>
              <input
                type="number"
                step="0.0001"
                min={0}
                required
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Decimal Places</label>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
              >
                <option value={2}>2 (Standard: $100.50)</option>
                <option value={3}>3 (e.g. KWD 100.250)</option>
                <option value={0}>0 (e.g. JPY ¥10000)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Currency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};