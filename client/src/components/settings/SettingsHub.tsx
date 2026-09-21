import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TenantConfiguration } from '../../types/masters';
import { TenantOnboardingWizard } from '../onboarding/TenantOnboardingWizard';
import { LegacyDataMigrationModal } from '../migration/LegacyDataMigrationModal';
import {
  Settings,
  Building2,
  Hash,
  Users,
  ShieldCheck,
  Save,
  CheckCircle,
  Key,
  Globe,
  Sliders,
  FileText,
  UserCheck,
  Lock,
  Download,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  EyeOff,
  FileSpreadsheet,
  Cpu,
  Sparkles,
  Boxes,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';

const INITIAL_CONFIG: TenantConfiguration = {
  tenant: {
    id: '27AABCF1234F1Z5',
    name: 'Apex Industries Ltd.',
    gstIn: '27AABCF1234F1Z5',
    taxId: 'AAACF1234F',
    currency: 'INR (₹)',
    stateCode: '27',
    stateName: 'Maharashtra',
  },
  numberingSeries: {
    salesOrderPrefix: 'SO-2026-',
    salesInvoicePrefix: 'INV-2026-',
    deliveryChallanPrefix: 'DC-OUT-',
    purchaseOrderPrefix: 'PO-2026-',
    grnPrefix: 'GRN-2026-',
    receiptPrefix: 'RCT-',
    paymentPrefix: 'PMT-',
  },
  statutorySettings: {
    compositionScheme: false,
    eWayBillThreshold: 50000,
    eInvoiceMandatory: false,
    reverseChargeMechanismApplicable: false,
  },
  users: [
    {
      id: 'usr-001',
      email: 'owner@apexindustries.com',
      role: 'OWNER',
      firstName: 'Vikram',
      lastName: 'Singhania',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr-002',
      email: 'accountant@apexindustries.com',
      role: 'ACCOUNTANT',
      firstName: 'Priya',
      lastName: 'Deshmukh',
      isActive: true,
      createdAt: '2026-01-05T00:00:00Z',
    },
    {
      id: 'usr-003',
      email: 'clerk@apexindustries.com',
      role: 'DATA_ENTRY',
      firstName: 'Ramesh',
      lastName: 'Patel',
      isActive: true,
      createdAt: '2026-02-10T00:00:00Z',
    },
  ],
};

export function SettingsHub() {
  const [activeTab, setActiveTab] = useState<'company' | 'onboarding' | 'numbering' | 'users' | 'statutory' | 'soc2'>('company');
  const { getAuthHeaders } = useAuth();
  const [config, setConfig] = useState<TenantConfiguration>(INITIAL_CONFIG);
  const [isSaved, setIsSaved] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Company Settings & System Configurations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure tenant legal identity, statutory GST parameters, auto-numbering series, starter packs & legacy migration
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>AI Onboarding Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMigrationModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-indigo-200" />
            <span>Data Migration Engine</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            {isSaved ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 flex space-x-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'company'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & GSTIN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'onboarding'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Onboarding & Starter Packs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('numbering')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'numbering'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>Auto-Numbering Sequences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management & RBAC ({config.users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statutory')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'statutory'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance & Thresholds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('soc2')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'soc2'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>SOC 2 Type II Trust Matrix</span>
        </button>
      </div>

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            Legal Entity & Registered Address Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Legal Company Name
              </label>
              <input
                type="text"
                value={config.tenant.name}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    tenant: { ...config.tenant, name: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN (Goods and Services Tax Identification Number)
              </label>
              <input
                type="text"
                value={config.tenant.gstIn}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    tenant: { ...config.tenant, gstIn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                value={config.tenant.taxId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    tenant: { ...config.tenant, taxId: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State & State Code
              </label>
              <input
                type="text"
                value={`${config.tenant.stateCode} - ${config.tenant.stateName}`}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Base Functional Currency
              </label>
              <input
                type="text"
                value={config.tenant.currency}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tenant Isolation Partition Key
              </label>
              <input
                type="text"
                value={config.tenant.id}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold opacity-80"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Numbering Sequences */}
      {activeTab === 'numbering' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            Voucher & Document Automatic Numbering Sequences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sales Order (SO) Prefix
              </label>
              <input
                type="text"
                value={config.numberingSeries.salesOrderPrefix}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    numberingSeries: { ...config.numberingSeries, salesOrderPrefix: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax Invoice Prefix
              </label>
              <input
                type="text"
                value={config.numberingSeries.salesInvoicePrefix}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    numberingSeries: { ...config.numberingSeries, salesInvoicePrefix: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Challan (Dispatch) Prefix
              </label>
              <input
                type="text"
                value={config.numberingSeries.deliveryChallanPrefix}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    numberingSeries: { ...config.numberingSeries, deliveryChallanPrefix: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Order (PO) Prefix
              </label>
              <input
                type="text"
                value={config.numberingSeries.purchaseOrderPrefix}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    numberingSeries: { ...config.numberingSeries, purchaseOrderPrefix: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goods Receipt (GRN) Prefix
              </label>
              <input
                type="text"
                value={config.numberingSeries.grnPrefix}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    numberingSeries: { ...config.numberingSeries, grnPrefix: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt / Payment Voucher Prefix
              </label>
              <input
                type="text"
                value={`${config.numberingSeries.receiptPrefix} / ${config.numberingSeries.paymentPrefix}`}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono opacity-80"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            Workspace Users & Role-Based Access Control (RBAC)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Assigned Role</th>
                  <th className="py-2.5">Permissions</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {config.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{u.firstName} {u.lastName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      Full access to vouchers, GST, inventory & books
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Onboarding & Starter Packs */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          {/* Quick Action Hero Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Tenant Accelerator & Starter Packs</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Next-Gen Zero-Friction Onboarding & Data Migration
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Configure your business identity in 60 seconds with AI GSTIN inference, pick industry pre-setups, or import 2–3+ years of historical financial books from Tally, Busy, Zoho, QuickBooks, or Excel.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                <span>Launch Onboarding Wizard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMigrationModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <Database className="w-4 h-4 text-indigo-100" />
                <span>Import Legacy ERP Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Environment Configuration Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-400/40 dark:border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Starter Pack Status</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">Manufacturing & Discrete Assembly</div>
              <p className="text-[11px] text-slate-500">
                18 Schedule III ledgers, 4 stock items, 3 godowns, multi-tier BOM & Job Work ITC-04 enabled.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-400/40 dark:border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">AI GSTIN Inference</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Verified
                </span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono">27AAACB1234F1Z9</div>
              <p className="text-[11px] text-slate-500">
                Maharashtra State (27), Corporate Entity, ₹1,00,000 E-Way Threshold & B2B E-Invoicing.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-400/40 dark:border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Data Invariance Guarantee</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Δ = ₹0.00
                </span>
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">12 Sanity Rules Active</div>
              <p className="text-[11px] text-slate-500">
                Multi-year historical roll guarantees zero-difference trial balances & MCA 2024 signed audit certificates.
              </p>
            </div>
          </div>

          {/* Industry Packs Catalog */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Curated Industry Starter Kits (Pick & Choose Anytime)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch or re-apply curated accounting starter packs tailored for your business vertical.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'MANUFACTURING',
                  name: 'Manufacturing & Assembly',
                  desc: 'BOMs, WIP journals, raw materials & ITC-04 Job Work accounts.',
                  badge: 'Industrial',
                  count: '18 Ledgers',
                },
                {
                  id: 'TRADING_WHOLESALE',
                  name: 'Trading & Wholesale',
                  desc: 'Multi-godown stock, debtor ageing, purchase orders & price lists.',
                  badge: 'B2B & Distribution',
                  count: '16 Ledgers',
                },
                {
                  id: 'SOFTWARE_SAAS',
                  name: 'Software & SaaS Tech',
                  desc: 'MRR subscription, deferred revenue, AWS infra & AS 11 Forex.',
                  badge: 'Tech & SaaS',
                  count: '15 Ledgers',
                },
                {
                  id: 'SERVICES_EPC',
                  name: 'EPC & Consulting',
                  desc: 'Cost center job costing, milestone billing, Sec 194C/194J TDS.',
                  badge: 'Projects & EPC',
                  count: '14 Ledgers',
                },
                {
                  id: 'RETAIL_ECOMMERCE',
                  name: 'Retail & Omnichannel',
                  desc: 'High-speed POS, NPCI UPI QR settlements & barcode SKUs.',
                  badge: 'Retail / D2C',
                  count: '15 Ledgers',
                },
              ].map((pack) => (
                <div
                  key={pack.id}
                  className="p-4 rounded-xl border border-emerald-400/40 dark:border-emerald-500/30 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {pack.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{pack.count}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pack.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {pack.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOnboardingModalOpen(true)}
                    className="w-full py-2 px-3 rounded-lg border border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer text-center"
                  >
                    Select & Configure Pack
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Statutory Compliance */}
      {activeTab === 'statutory' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            Indian Statutory GST & Compliance Configurations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                E-Way Bill Mandatory Threshold Limit
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Consignments exceeding this taxable threshold automatically mandate E-Way Bill generation on Delivery Challans.
              </p>
              <div className="pt-2">
                <input
                  type="number"
                  value={config.statutorySettings.eWayBillThreshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      statutorySettings: {
                        ...config.statutorySettings,
                        eWayBillThreshold: parseFloat(e.target.value) || 50000,
                      },
                    })
                  }
                  className="w-48 px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                GST Composition Scheme
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Toggle if your tenant is registered under Section 10 Composition Levy.
              </p>
              <div className="pt-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 font-semibold text-[11px]">
                  Regular Taxpayer (Non-Composition)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding & Migration Modals */}
      <TenantOnboardingWizard
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onOpenMigration={() => {
          setIsOnboardingModalOpen(false);
          setIsMigrationModalOpen(true);
        }}
      />

      <LegacyDataMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
      />
    </div>
  );
}
