import React from 'react';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface VoucherSummaryBarProps {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
  onSave: () => void;
  onPrint?: () => void;
  isSubmitting: boolean;
}

export const VoucherSummaryBar: React.FC<VoucherSummaryBarProps> = ({
  totalDebit,
  totalCredit,
  difference,
  isBalanced,
  onSave,
  onPrint,
  isSubmitting,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg shrink-0">
      {/* Keyboard Shortcuts Guide */}
      <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1.5">
          <kbd className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
            Enter
          </kbd>
          <span>Next Field</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <kbd className="font-mono bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 shadow-xs">
            Alt+C
          </kbd>
          <span>Quick Create</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <kbd className="font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 shadow-xs">
            Ctrl+A
          </kbd>
          <span>Save Voucher</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <kbd className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
            Esc
          </kbd>
          <span>Reset</span>
        </div>
      </div>

      {/* Real-time Double Entry Counters & Actions */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-6 font-mono text-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">Total Debit (Dr)</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold text-base">
              ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">Total Credit (Cr)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
              ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Balance Indicator */}
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">Difference</span>
            {isBalanced ? (
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>₹0.00 (Balanced)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 font-bold animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>₹{Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Diff</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              disabled={totalDebit === 0}
              className="px-4 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Preview & Print</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={!isBalanced || isSubmitting || totalDebit === 0}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 shadow-md cursor-pointer ${
              isBalanced && totalDebit > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Accept Voucher (Ctrl+A)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

