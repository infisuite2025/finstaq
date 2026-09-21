import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export type KPIScorecardBadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'glass'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'blue';

export interface KPIScorecardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'featured' | 'emerald' | 'rose' | 'indigo' | 'amber';
  icon?: LucideIcon | React.ReactNode;
  trend?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  badge?: string;
  badgeVariant?: KPIScorecardBadgeVariant;
  progress?: {
    percentage: number;
    target?: string;
    targetLabel?: string;
    targetValue?: string;
    barColor?: string;
    color?: string;
  };
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  footer?:
    | {
        left?: React.ReactNode;
        right?: React.ReactNode;
      }
    | React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function KPIScorecard({
  label,
  value,
  variant = 'default',
  icon,
  trend,
  badge,
  badgeVariant = 'default',
  progress,
  footerLeft,
  footerRight,
  footer,
  className = '',
  onClick,
}: KPIScorecardProps) {
  const isFeatured = variant === 'featured';

  // Base container styles
  const containerClass = isFeatured
    ? 'p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white shadow-sm space-y-2 font-sans transition-all duration-150 hover:border-slate-700'
    : 'p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 font-sans transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700';

  // Header label styles
  const labelClass = isFeatured
    ? 'text-[11px] font-bold text-slate-300 uppercase tracking-wider leading-tight truncate'
    : 'text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight truncate';

  // Value text color styles
  const getValueColor = () => {
    if (isFeatured) return 'text-white';
    switch (variant) {
      case 'emerald':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'rose':
        return 'text-rose-600 dark:text-rose-400';
      case 'indigo':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-slate-900 dark:text-white';
    }
  };

  // Badge styles
  const getBadgeClass = () => {
    if (isFeatured || badgeVariant === 'glass') {
      return 'bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
    }
    switch (badgeVariant) {
      case 'success':
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
      case 'warning':
      case 'amber':
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
      case 'danger':
      case 'rose':
        return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
      case 'info':
      case 'blue':
        return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap';
    }
  };

  // Render icon whether it's a Component function or ReactNode element
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as LucideIcon;
    return (
      <IconComp
        className={`w-3.5 h-3.5 shrink-0 ${
          isFeatured
            ? 'text-slate-400'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      />
    );
  };

  // Render footer content
  const hasFooter = footerLeft !== undefined || footerRight !== undefined || footer !== undefined;

  return (
    <div
      onClick={onClick}
      className={`${containerClass} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center gap-1.5 min-w-0">
        <span className={labelClass} title={typeof label === 'string' ? label : undefined}>{label}</span>

        {/* Right Header Element: Trend, Badge, or Icon */}
        <div className="flex items-center space-x-1 shrink-0">
          {trend && (
            <span
              className={`flex items-center text-[11px] font-bold ${
                isFeatured
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {trend.direction === 'down' ? (
                <ArrowDownRight className="w-3 h-3 mr-0.5 shrink-0" />
              ) : (
                <ArrowUpRight className="w-3 h-3 mr-0.5 shrink-0" />
              )}
              <span>{trend.value}</span>
              {trend.label && <span className="ml-0.5 text-[9px] opacity-80">{trend.label}</span>}
            </span>
          )}

          {badge && <span className={getBadgeClass()}>{badge}</span>}

          {!trend && !badge && renderIcon()}
        </div>
      </div>

      {/* Metric Primary Value */}
      <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight leading-none py-0.5 ${getValueColor()}`}>
        {value}
      </div>

      {/* Progress Bar (if provided) */}
      {progress && (
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between text-[11px] font-medium">
            <span className={isFeatured ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}>
              {progress.targetLabel || 'Target'}: {progress.targetValue || progress.target || `${progress.percentage}%`}
            </span>
            <span className={`font-bold font-mono ${isFeatured ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
              {progress.percentage}%
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden ${
              isFeatured ? 'bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress.barColor ||
                progress.color ||
                'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Sub-metrics / Comparison info */}
      {hasFooter && !progress && (
        <div
          className={`flex items-center justify-between text-[11px] pt-1.5 border-t font-medium gap-1 ${
            isFeatured
              ? 'border-slate-800 text-slate-400'
              : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {footerLeft !== undefined || footerRight !== undefined ? (
            <>
              <div className="truncate shrink min-w-0">{footerLeft}</div>
              <div className="truncate text-right shrink-0">{footerRight}</div>
            </>
          ) : footer && typeof footer === 'object' && 'left' in (footer as any) ? (
            <>
              <div className="truncate shrink min-w-0">{(footer as any).left}</div>
              <div className="truncate text-right shrink-0">{(footer as any).right}</div>
            </>
          ) : (
            (footer as React.ReactNode)
          )}
        </div>
      )}
    </div>
  );
}

export interface KPIGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 5;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function KPIGrid({
  children,
  cols,
  columns,
  className = '',
}: KPIGridProps) {
  const columnCount = (cols || columns || 4) as 2 | 3 | 4 | 5;
  const colClasses = {
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  };

  return <div className={`${colClasses[columnCount] || colClasses[4]} gap-3 ${className}`}>{children}</div>;
}
