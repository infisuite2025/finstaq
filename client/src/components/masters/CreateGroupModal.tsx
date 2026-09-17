import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GroupNature, LedgerGroup } from '../../types/masters';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: LedgerGroup[];
  onSuccess: (group: LedgerGroup) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, groups, onSuccess }) => {
  const [name, setName] = useState('');
  const { getAuthHeaders } = useAuth();
  const [code, setCode] = useState('');
  const [parentId, setParentId] = useState('');
  const [nature, setNature] = useState<GroupNature>('EXPENSE');
  const [affectsGrossProfit, setAffectsGrossProfit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Account Group Name is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          name,
          code: code || name.slice(0, 4).toUpperCase(),
          parentId: parentId || null,
          nature,
          affectsGrossProfit,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Account Group');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Account Group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New Chart of Accounts Group</h3>
            <p className="text-xs text-muted-foreground">Create financial sub-groups in the balance sheet / P&L tree</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold mb-1">Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Marketing & Advertising, Factory Overheads"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Group Code</label>
              <input
                type="text"
                placeholder="e.g. MKT-EXP, OTH-AST"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Nature of Group *</label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value as GroupNature)}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-semibold"
              >
                <option value="ASSET">ASSET (Debit Balances)</option>
                <option value="LIABILITY">LIABILITY (Credit Balances)</option>
                <option value="EQUITY">EQUITY (Capital/Reserves)</option>
                <option value="INCOME">INCOME (Revenues/Sales)</option>
                <option value="EXPENSE">EXPENSE (Costs/Overheads)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Parent Group (Under)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            >
              <option value="">-- Primary Root Group --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.nature})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="affectsGross"
              checked={affectsGrossProfit}
              onChange={(e) => setAffectsGrossProfit(e.target.checked)}
              className="rounded border-input text-primary"
            />
            <label htmlFor="affectsGross" className="text-xs font-medium cursor-pointer">Affects Gross Profit (Direct Trading item)</label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Account Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
