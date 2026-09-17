import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, CheckCircle2, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning';
}

interface ConfirmationModalProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        } else if (e.key === 'Enter') {
          onConfirm();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const type = options.type || 'warning';

  const icons = {
    warning: <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full ring-8 ring-amber-50 dark:ring-amber-950/20"><AlertTriangle className="w-8 h-8" /></div>,
    danger: <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full ring-8 ring-rose-50 dark:ring-rose-950/20"><AlertCircle className="w-8 h-8" /></div>,
    info: <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full ring-8 ring-blue-50 dark:ring-blue-950/20"><HelpCircle className="w-8 h-8" /></div>,
    success: <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full ring-8 ring-emerald-50 dark:ring-emerald-950/20"><CheckCircle2 className="w-8 h-8" /></div>
  };

  const getConfirmButtonClasses = () => {
    if (options.confirmColor === 'danger' || type === 'danger') {
      return 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-rose-500/25';
    }
    if (options.confirmColor === 'warning' || type === 'warning') {
      return 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-500/25';
    }
    if (options.confirmColor === 'success' || type === 'success') {
      return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-500/25';
    }
    return 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-500/25';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {icons[type]}
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {options.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            {options.message}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl shadow-lg transition-all transform active:scale-95 ${getConfirmButtonClasses()}`}
            >
              {options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
