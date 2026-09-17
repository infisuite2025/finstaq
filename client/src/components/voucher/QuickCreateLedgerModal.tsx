import React, { useState, useEffect, useRef } from 'react';
import { LedgerGroupOption, LedgerOption } from '../../types/voucher';
import { PlusCircle, X } from 'lucide-react';

interface QuickCreateLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newLedger: LedgerOption) => void;
  groups: LedgerGroupOption[];
}

export const QuickCreateLedgerModal: React.FC<QuickCreateLedgerModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  groups,
}) => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [code, setCode] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCode('');
      setOpeningBalance('0');
      setError(null);
      if (groups.length > 0) {
        setGroupId(groups[0].id);
      }
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, groups]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Ledger name is required');
      return;
    }
    if (!groupId) {
      setError('Please select a Ledger Group');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedGroup = groups.find((g) => g.id === groupId);
      const newLedger: LedgerOption = {
        id: 'temp-' + Date.now(),
        name: name.trim(),
        code: code.trim() || undefined,
        currentBalance: parseFloat(openingBalance) || 0,
        groupName: selectedGroup?.name || 'Current Assets',
        nature: (selectedGroup?.nature as any) || 'ASSET',
      };

      onCreated(newLedger);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleModalKeyDown}
      >
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
              Quick Create Ledger <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded font-mono">Alt+C</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Ledger Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HDFC Bank Current A/c, Tata Motors"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Parent Group <span className="text-red-500">*</span>
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium text-sm focus:border-blue-500"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.nature})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Ledger Code / Alias
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. HDFC-01"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              step="any"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-sm focus:border-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">Esc</kbd> cancel, <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">Ctrl+Enter</kbd> save
            </span>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
              >
                {isLoading ? 'Creating...' : 'Create & Apply'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
