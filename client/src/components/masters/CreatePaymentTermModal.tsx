import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PaymentTerm } from '../../types/masters';

interface CreatePaymentTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pt: PaymentTerm) => void;
}

export const CreatePaymentTermModal: React.FC<CreatePaymentTermModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const { getAuthHeaders } = useAuth();
  const [name, setName] = useState('');
  const [days, setDays] = useState(30);
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Term Code and Name are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/payment-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name,
          days: Number(days),
          description,
          isDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Payment Term');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Payment Term');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New Payment / Credit Term</h3>
            <p className="text-xs text-muted-foreground">Configure payment due day counters for invoices & orders</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Term Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. NET30, NET45, IMM"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Credit Days *</label>
              <input
                type="number"
                min={0}
                required
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Term Display Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Net 30 Days Standard Credit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description / Contract Clause</label>
            <input
              type="text"
              placeholder="e.g. Due within 30 calendar days from invoice date"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultPt"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-input text-primary"
            />
            <label htmlFor="isDefaultPt" className="text-xs font-medium cursor-pointer">Set as default payment term for new customers</label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Payment Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
