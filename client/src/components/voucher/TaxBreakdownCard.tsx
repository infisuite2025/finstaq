import React from 'react';
import { CalculatedTax } from '../../types/voucher';
import { Percent, MapPin } from 'lucide-react';

interface TaxBreakdownCardProps {
  taxData: CalculatedTax | null;
}

export const TaxBreakdownCard: React.FC<TaxBreakdownCardProps> = ({ taxData }) => {
  if (!taxData || taxData.totalTaxAmount === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3 text-xs shadow-xs animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
        <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
          <Percent className="w-3.5 h-3.5" />
          <span>GST Breakdown</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-medium">
          <MapPin className="w-3 h-3" />
          <span>{taxData.isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}</span>
        </div>
      </div>

      <div className="space-y-1.5 font-mono">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Taxable Value:</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            ₹{taxData.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {taxData.taxBreakdown.map((line, idx) => (
          <div key={idx} className="flex justify-between text-amber-700 dark:text-amber-300">
            <span>{line.taxType} @ {line.ratePercent}%:</span>
            <span>₹{line.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span>Total GST:</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            ₹{taxData.totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
