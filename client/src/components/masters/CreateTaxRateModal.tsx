import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TaxRateMaster } from '../../types/masters';

interface CreateTaxRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rate: TaxRateMaster) => void;
}

export const CreateTaxRateModal: React.FC<CreateTaxRateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const { getAuthHeaders } = useAuth();
  const [ratePercent, setRatePercent] = useState(18);
  const [cgstPercent, setCgstPercent] = useState(9);
  const [sgstPercent, setSgstPercent] = useState(9);
  const [igstPercent, setIgstPercent] = useState(18);
  const [cessPercent, setCessPercent] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRateChange = (val: number) => {
    setRatePercent(val);
    const half = Math.round((val / 2) * 100) / 100;
    setCgstPercent(half);
    setSgstPercent(half);
    setIgstPercent(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tax Name is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/tax-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          name,
          ratePercent: Number(ratePercent),
          cgstPercent: Number(cgstPercent),
          sgstPercent: Number(sgstPercent),
          igstPercent: Number(igstPercent),
          cessPercent: Number(cessPercent),
          isDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Tax Rate');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Tax Rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New GST Tax Slab</h3>
            <p className="text-xs text-muted-foreground">Define statutory tax rates with automated intra/inter-state split</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold mb-1">Tax Slab Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. GST 18% Standard, GST 5% GTA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Total Effective GST Rate % *</label>
            <input
              type="number"
              step="0.01"
              min={0}
              required
              value={ratePercent}
              onChange={(e) => handleRateChange(Number(e.target.value))}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-mono"
            />
          </div>

          <div className="p-3 bg-muted/30 border rounded-lg space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Automated Statutory Split:</span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-background p-2 rounded border text-center">
                <span className="block text-[10px] text-muted-foreground font-sans">CGST</span>
                <span className="font-bold text-primary">{cgstPercent}%</span>
              </div>
              <div className="bg-background p-2 rounded border text-center">
                <span className="block text-[10px] text-muted-foreground font-sans">SGST</span>
                <span className="font-bold text-primary">{sgstPercent}%</span>
              </div>
              <div className="bg-background p-2 rounded border text-center">
                <span className="block text-[10px] text-muted-foreground font-sans">IGST</span>
                <span className="font-bold text-blue-500">{igstPercent}%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Cess / Compensation Tax % (Optional)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={cessPercent}
              onChange={(e) => setCessPercent(Number(e.target.value))}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Tax Slab'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};