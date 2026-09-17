import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CostCenter } from '../../types/masters';

interface CreateCostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cc: CostCenter) => void;
}

export const CreateCostCenterModal: React.FC<CreateCostCenterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const { getAuthHeaders } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Operations');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Cost Center Code and Name are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/cost-centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name,
          category,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Cost Center');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Cost Center');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New Cost Center / Department</h3>
            <p className="text-xs text-muted-foreground">Allocate revenues and operational costs to departments</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold mb-1">Cost Center Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. CC-MANUF-01, CC-MKT-HQ"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Cost Center / Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Heavy Machining Unit 2, Digital Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Category / Department</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-medium"
            >
              <option value="Operations">Operations & Manufacturing</option>
              <option value="Sales">Sales & Distribution</option>
              <option value="R&D">Research & Engineering</option>
              <option value="Administration">Corporate & Administration</option>
              <option value="Projects">Client Custom Projects</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Cost Center'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
