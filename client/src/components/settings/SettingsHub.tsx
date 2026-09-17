import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TenantConfiguration } from '../../types/masters';
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
  Cpu
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
  const [activeTab, setActiveTab] = useState<'company' | 'numbering' | 'users' | 'statutory' | 'soc2'>('company');
  const { getAuthHeaders } = useAuth();
  const [config, setConfig] = useState<TenantConfiguration>(INITIAL_CONFIG);
  const [isSaved, setIsSaved] = useState(false);

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
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Company Settings & System Configurations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure tenant legal identity, statutory GST parameters, auto-numbering series, and user roles
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
        >
          {isSaved ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 flex space-x-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & GSTIN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('numbering')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'numbering'
              ? 'bg-blue-600 text-white shadow-xs'
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
              ? 'bg-blue-600 text-white shadow-xs'
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
              ? 'bg-blue-600 text-white shadow-xs'
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
              ? 'bg-blue-600 text-white shadow-xs'
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono opacity-80"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono opacity-80"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold opacity-80"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono opacity-80"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tenant Users & Role-Based Access Control (RBAC) Matrix
            </span>
            <span className="text-xs text-slate-400 font-mono">{config.users.length} Active Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5 text-center">Assigned Role</th>
                  <th className="p-3.5">Permissions Description</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {config.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          u.role === 'OWNER'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : u.role === 'ACCOUNTANT'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {u.role === 'OWNER'
                        ? 'Full administrative control, audit logs, financials, and configurations.'
                        : u.role === 'ACCOUNTANT'
                        ? 'Vouchers, ledger masters, 3-way matching, tax invoicing, and reports.'
                        : 'High-speed voucher data entry, document upload, and basic order viewing.'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
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

      {/* Tab 4: Statutory Compliance */}
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
                  className="w-48 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-right"
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
    </div>
  );
}
