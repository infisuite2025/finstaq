import React from 'react';
import { ShieldAlert, Clock, LogOut, CheckCircle2, Lock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  totalCountdownSeconds?: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingSeconds,
  totalCountdownSeconds = 60,
  onExtend,
  onLogout,
}) => {
  if (!isOpen) return null;

  const percentageLeft = Math.max(0, Math.min(100, (remainingSeconds / totalCountdownSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-300 dark:border-amber-600/40 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Session Inactivity Warning</h3>
            <p className="text-xs text-amber-100 font-medium">
              SOC 2 Type II & Banking Security Guard
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You have been inactive for over <strong className="text-slate-900 dark:text-white">14 minutes</strong>. As per financial industry compliance standards, your active workspace will automatically close to prevent unauthorized access.
          </p>

          {/* Countdown Display Card */}
          <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Logging out automatically in:</span>
            </div>
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}s
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-amber-200 dark:bg-amber-900/60 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${percentageLeft}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 justify-center">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted ledger session AES-256-GCM authenticated</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Now</span>
            </button>

            <button
              type="button"
              onClick={onExtend}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Stay Logged In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
