import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0.0 to 1.0
  label?: string;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  label,
  size = 'sm',
}) => {
  const percent = Math.round(score * 100);

  let colorClasses = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300';
  let Icon = CheckCircle2;

  if (percent < 75) {
    colorClasses = 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300';
    Icon = AlertCircle;
  } else if (percent < 90) {
    colorClasses = 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300';
    Icon = HelpCircle;
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center space-x-1 font-mono rounded border font-semibold ${colorClasses} ${
        isSmall ? 'text-[10px] px-1.5 py-0.2' : 'text-xs px-2 py-0.5'
      }`}
      title={`AI Confidence Score: ${percent}%`}
    >
      <Icon className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      {label && <span className="font-sans font-medium">{label}:</span>}
      <span>{percent}%</span>
    </span>
  );
};
