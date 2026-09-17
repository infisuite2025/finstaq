import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'success';
}

interface StandardTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  rightElement?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StandardTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  rightElement,
  className = '',
  size = 'md',
}: StandardTabsProps<T>) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold rounded-xl gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center transition-all duration-150 cursor-pointer select-none font-semibold ${sizeClasses} ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {Icon && <Icon className={iconSizes} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                <span
                  className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : tab.badgeVariant === 'danger'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : tab.badgeVariant === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : tab.badgeVariant === 'success'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {rightElement && (
        <div className="flex items-center gap-2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

export default StandardTabs;
