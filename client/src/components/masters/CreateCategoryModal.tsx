import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ItemCategory } from '../../types/masters';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ItemCategory[];
  onSuccess: (category: ItemCategory) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose, categories, onSuccess }) => {
  const [name, setName] = useState('');
  const { getAuthHeaders } = useAuth();
  const [code, setCode] = useState('');
  const [parentId, setParentId] = useState('');
  const [defaultHsn, setDefaultHsn] = useState('8481');
  const [defaultTaxRate, setDefaultTaxRate] = useState(18);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category Name is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/categories', {
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
          defaultHsn,
          defaultTaxRate: Number(defaultTaxRate),
          description,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Item Category');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Item Category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New Item Category / Group</h3>
            <p className="text-xs text-muted-foreground">Classify inventory products & set default tax rates</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Electrical Components, Raw Steel, Packaging"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category Code</label>
              <input
                type="text"
                placeholder="e.g. ELEC, STL, PKG"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background"
              >
                <option value="">-- Primary (Root Category) --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Default HSN Code</label>
              <input
                type="text"
                placeholder="e.g. 8481, 7214"
                value={defaultHsn}
                onChange={(e) => setDefaultHsn(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Default GST Rate %</label>
              <select
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                className="w-full h-9 px-3 text-sm rounded-lg border bg-background font-mono"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard)</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Scope, specifications or handling instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border bg-background resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Item Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
