import React from 'react';
import { ShieldAlert, AlertTriangle, CreditCard, Mail, Phone, ArrowLeft, RefreshCw } from 'lucide-react';

interface SuspendedTenantScreenProps {
  tenantName: string;
  subdomain: string;
  suspendedReason?: string;
  onBackToLogin: () => void;
}

export const SuspendedTenantScreen: React.FC<SuspendedTenantScreenProps> = ({
  tenantName,
  subdomain,
  suspendedReason,
  onBackToLogin,
}) => {
  return (
    <div className="min-h-screen w-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative select-none">
      <div className="w-full max-w-lg bg-slate-800/90 border border-rose-500/30 rounded-2xl shadow-2xl p-8 text-center backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Tenant Access Suspended</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mt-1 mb-2">
          {tenantName}
        </h1>
        <p className="text-xs font-mono text-slate-400 mb-6">
          https://{subdomain}.finstaq.com
        </p>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-left mb-6 text-xs space-y-2">
          <div className="font-semibold text-rose-300">Reason for Suspension:</div>
          <div className="text-slate-300 leading-relaxed">
            {suspendedReason || 'Your organization subscription has expired or has been paused by the Platform Administrator.'}
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            All accounting books and MCA edit logs remain strictly encrypted and preserved. To restore access immediately, please contact your account manager or platform administrator.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left text-xs mb-6">
          <div className="font-bold text-blue-300 mb-1 flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4" />
            <span>Platform Billing & Support Desk</span>
          </div>
          <div className="text-slate-300 flex items-center space-x-2 mt-1">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>billing@finstaq.com</span>
          </div>
          <div className="text-slate-300 flex items-center space-x-2 mt-1">
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>+91 (800) 555-FINSTAQ</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={onBackToLogin}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Status Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
