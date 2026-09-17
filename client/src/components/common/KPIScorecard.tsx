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
    ? 'p-5 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 space-y-3 font-mono transition-all duration-150'
    : 'p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 font-mono transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700';

  // Header label styles
  const labelClass = isFeatured
    ? 'text-xs font-bold text-blue-100 uppercase tracking-wider'
    : 'text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider';

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
      return 'bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white';
    }
    switch (badgeVariant) {
      case 'success':
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      case 'warning':
      case 'amber':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      case 'danger':
      case 'rose':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      case 'info':
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
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
        className={`w-4 h-4 ${
          isFeatured
            ? 'text-blue-200'
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
      <div className="flex justify-between items-center">
        <span className={labelClass}>{label}</span>

        {/* Right Header Element: Trend, Badge, or Icon */}
        <div className="flex items-center space-x-1.5">
          {trend && (
            <span
              className={`flex items-center text-xs font-black ${
                isFeatured
                  ? 'text-white'
                  : trend.direction === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {trend.direction === 'down' ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              )}
              <span>{trend.value}</span>
              {trend.label && <span className="ml-1 text-[10px] opacity-80">{trend.label}</span>}
            </span>
          )}

          {badge && <span className={getBadgeClass()}>{badge}</span>}

          {!trend && !badge && renderIcon()}
        </div>
      </div>

      {/* Metric Primary Value */}
      <div className={`text-2xl font-black tracking-tight ${getValueColor()}`}>
        {value}
      </div>

      {/* Progress Bar (if provided) */}
      {progress && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex justify-between text-[11px] font-medium">
            <span className={isFeatured ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}>
              {progress.targetLabel || 'Target'}: {progress.targetValue || progress.target || `${progress.percentage}%`}
            </span>
            <span className={`font-bold ${isFeatured ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
              {progress.percentage}%
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              isFeatured ? 'bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress.barColor ||
                progress.color ||
                (isFeatured
                  ? 'bg-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600')
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Sub-metrics / Comparison info */}
      {hasFooter && !progress && (
        <div
          className={`flex justify-between items-center text-xs pt-2 border-t font-medium ${
            isFeatured
              ? 'border-white/20 text-blue-100'
              : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {footerLeft !== undefined || footerRight !== undefined ? (
            <>
              <div>{footerLeft}</div>
              <div>{footerRight}</div>
            </>
          ) : footer && typeof footer === 'object' && 'left' in (footer as any) ? (
            <>
              <div>{(footer as any).left}</div>
              <div>{(footer as any).right}</div>
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

  return <div className={`${colClasses[columnCount] || colClasses[4]} gap-4 ${className}`}>{children}</div>;
}
