import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const duration = toast.duration ?? 4500;
    const newToast: ToastItem = { ...toast, id, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'success', message, title: title || 'Success', duration });
  }, [showToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'error', message, title: title || 'Error', duration: duration ?? 6000 });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'warning', message, title: title || 'Warning', duration });
  }, [showToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'info', message, title: title || 'Information', duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          };

          const borders = {
            success: 'border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 shadow-emerald-500/10',
            error: 'border-rose-500/30 bg-white/95 dark:bg-slate-900/95 shadow-rose-500/10',
            warning: 'border-amber-500/30 bg-white/95 dark:bg-slate-900/95 shadow-amber-500/10',
            info: 'border-blue-500/30 bg-white/95 dark:bg-slate-900/95 shadow-blue-500/10'
          };

          const progressColors = {
            success: 'bg-emerald-500',
            error: 'bg-rose-500',
            warning: 'bg-amber-500',
            info: 'bg-blue-500'
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borders[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 min-w-0">
                {t.title && <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{t.title}</h4>}
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 opacity-60 ${progressColors[t.type]}`}
                style={{
                  animation: `shrinkProgress ${t.duration || 4500}ms linear forwards`
                }}
              />
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes shrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
