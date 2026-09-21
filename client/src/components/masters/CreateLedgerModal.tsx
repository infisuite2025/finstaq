import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LedgerGroup, LedgerMaster } from '../../types/masters';

interface CreateLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: LedgerGroup[];
  onSuccess: (ledger: LedgerMaster) => void;
}

export const CreateLedgerModal: React.FC<CreateLedgerModalProps> = ({ isOpen, onClose, groups, onSuccess }) => {
  const [name, setName] = useState('');
  const { getAuthHeaders } = useAuth();
  const [groupId, setGroupId] = useState('');
  const [code, setCode] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [gstIn, setGstIn] = useState('');
  const [pan, setPan] = useState('');
  const [stateCode, setStateCode] = useState('27');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGstChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setGstIn(clean);
    if (clean.length >= 2) setStateCode(clean.slice(0, 2));
    if (clean.length >= 12) setPan(clean.slice(2, 12));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !groupId) {
      setError('Ledger Name and Group are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/ledgers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          name,
          groupId,
          code: code || undefined,
          openingBalance: Number(openingBalance),
          gstIn: gstIn || undefined,
          pan: pan || undefined,
          stateCode,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create Ledger');
      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create Ledger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-card-foreground w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h3 className="font-semibold text-base">New General Ledger Account</h3>
            <p className="text-xs text-muted-foreground">Create a chart of accounts ledger under any group</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold mb-1">Ledger Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Printing & Stationery, ICICI Bank Overdraft, Audit Fees"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Parent Account Group *</label>
              <select
                required
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">-- Select Group --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.nature})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Ledger Code</label>
              <input
                type="text"
                placeholder="e.g. EXP-OFF-01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Opening Balance (₹)</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">GSTIN (If Applicable)</label>
              <input
                type="text"
                maxLength={15}
                placeholder="27AABCF1234F1Z5"
                value={gstIn}
                onChange={(e) => handleGstChange(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium border rounded-lg hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90">
              {isSubmitting ? 'Saving...' : 'Save Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};