import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Settings, RefreshCw,
  Search, ArrowRight, UserCheck, Lock, Sliders, DollarSign, Eye, Filter, Check, X,
  FileText, ShoppingCart, Truck, Receipt, BookOpen, Layers, Undo2, RotateCcw,
  Sparkles, Info, Users
} from 'lucide-react';
import { StandardTabs } from '../common/StandardTabs';
import { useAuth } from '../../context/AuthContext';

type UserRole = 'OWNER' | 'ACCOUNTANT' | 'DATA_ENTRY';

interface ApprovalRule {
  docType: string;
  docTitle: string;
  module: string;
  isEnabled: boolean;
  thresholdAmount: number;
  requireDistinctChecker: boolean;
  allowedRoles: UserRole[];
  defaultMakerRole: UserRole;
  description: string;
  workflowSummary: string;
}

interface ApprovalRequest {
  id: string;
  tenantId: string;
  docType: string;
  docTitle: string;
  docNumber: string;
  docId: string;
  amount: number;
  currency: string;
  makerId: string;
  makerName: string;
  makerRole: UserRole | string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';
  checkerId?: string;
  checkerName?: string;
  checkerRole?: UserRole | string;
  remarks?: string;
  rejectionReason?: string;
  decidedAt?: string;
  metadata?: Record<string, any>;
}

interface ApprovalStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  autoApprovedCount: number;
  rulesConfiguredCount: number;
}

interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  description: string;
}

// Exactly matches the 3 standard tenant users from Settings & RBAC matrix
const tenantUsers: CurrentUser[] = [
  {
    id: 'usr-001',
    name: 'Vikram Singhania',
    role: 'OWNER',
    email: 'owner@apexindustries.com',
    description: 'Full administrative control, audit logs, financials, and configurations (Final Approver).',
  },
  {
    id: 'usr-002',
    name: 'Priya Deshmukh',
    role: 'ACCOUNTANT',
    email: 'accountant@apexindustries.com',
    description: 'Vouchers, ledger masters, 3-way matching, tax invoicing, reports (Checker for Ops, Maker for JVs).',
  },
  {
    id: 'usr-003',
    name: 'Ramesh Patel',
    role: 'DATA_ENTRY',
    email: 'clerk@apexindustries.com',
    description: 'High-speed voucher data entry, document upload, and basic order viewing (Pure Maker).',
  },
];

export const ApprovalCenter: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'rules' | 'history' | 'simulator'>('pending');
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [pendingItems, setPendingItems] = useState<ApprovalRequest[]>([]);
  const [historyItems, setHistoryItems] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    autoApprovedCount: 0,
    rulesConfiguredCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(tenantUsers[1]); // Default to Accountant (Priya)
  
  // Action Modal states
  const [selectedItem, setSelectedItem] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionRemarks, setActionRemarks] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState('ALL');

  // Simulator state
  const [simDocType, setSimDocType] = useState('VENDOR_BILL');
  const [simAmount, setSimAmount] = useState<number>(45000);
  const [simMaker, setSimMaker] = useState<string>('usr-003');
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const rulesRes = await fetch('/api/v1/approvals/rules', {
        headers: getAuthHeaders(),
      });
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(Array.isArray(rulesData.data) ? rulesData.data : []);
      }

      const pendingRes = await fetch('/api/v1/approvals/pending', {
        headers: getAuthHeaders(),
      });
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingItems(Array.isArray(pendingData.data) ? pendingData.data : []);
      }

      const histRes = await fetch('/api/v1/approvals/history', {
        headers: getAuthHeaders(),
      });
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistoryItems(Array.isArray(histData.data) ? histData.data : []);
      }

      const statsRes = await fetch('/api/v1/approvals/stats', {
        headers: getAuthHeaders(),
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data && typeof statsData.data === 'object' && !Array.isArray(statsData.data) ? statsData.data : {
          pendingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          autoApprovedCount: 0,
          rulesConfiguredCount: 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch approval data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuleToggle = (docType: string) => {
    setRules(prev => prev.map(r => r.docType === docType ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const handleThresholdChange = (docType: string, val: number) => {
    setRules(prev => prev.map(r => r.docType === docType ? { ...r, thresholdAmount: val } : r));
  };

  const handleDistinctToggle = (docType: string) => {
    setRules(prev => prev.map(r => r.docType === docType ? { ...r, requireDistinctChecker: !r.requireDistinctChecker } : r));
  };

  const handleRoleToggle = (docType: string, role: UserRole) => {
    setRules(prev => prev.map(r => {
      if (r.docType !== docType) return r;
      const exists = r.allowedRoles.includes(role);
      const newRoles = exists
        ? r.allowedRoles.filter(x => x !== role)
        : [...r.allowedRoles, role];
      return { ...r, allowedRoles: newRoles.length > 0 ? newRoles : ['OWNER'] };
    }));
  };

  const handleSaveRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/approvals/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
          rules: rules,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', 'Approval policies and threshold limits saved successfully!');
        fetchData();
      } else {
        showNotification('error', data.message || 'Failed to save policies');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error saving policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Reset all Maker-Checker settings to the standard 90% Best Practice Defaults?')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/approvals/rules/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: '27AABCF1234F1Z5' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', 'Reset to standard 90% Best Practice Defaults!');
        fetchData();
      } else {
        showNotification('error', data.message || 'Reset failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedItem || !actionType) return;

    if (actionType === 'REJECT' && !actionRemarks.trim()) {
      showNotification('error', 'Rejection reason is mandatory for audit compliance.');
      return;
    }

    try {
      const endpoint = actionType === 'APPROVE'
        ? `/api/v1/approvals/${selectedItem.id}/approve`
        : `/api/v1/approvals/${selectedItem.id}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
          checkerId: currentUser.id,
          checkerName: currentUser.name,
          checkerRole: currentUser.role,
          remarks: actionRemarks,
          rejectionReason: actionType === 'REJECT' ? actionRemarks : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', `Transaction ${selectedItem.docNumber} has been ${actionType === 'APPROVE' ? 'Approved' : 'Rejected'}!`);
        setSelectedItem(null);
        setActionType(null);
        setActionRemarks('');
        fetchData();
      } else {
        showNotification('error', data.message || 'Action failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Server error occurred');
    }
  };

  const handleRunSimulation = async () => {
    const makerObj = tenantUsers.find(u => u.id === simMaker) || tenantUsers[2];
    try {
      const res = await fetch('/api/v1/approvals/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '27AABCF1234F1Z5',
          docType: simDocType,
          docNumber: `SIM-${simDocType}-${Math.floor(1000 + Math.random() * 9000)}`,
          docId: `sim-doc-${Date.now()}`,
          amount: Number(simAmount),
          currency: 'INR',
          makerId: makerObj.id,
          makerName: makerObj.name,
          makerRole: makerObj.role,
          metadata: { simulated: true, simulatedAt: new Date().toISOString() },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimResult(data.data);
        fetchData();
      } else {
        showNotification('error', data.message || 'Simulation failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Simulation error');
    }
  };

  const getDocIcon = (docType: string) => {
    switch (docType) {
      case 'PO': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'GRN': return <Truck className="w-4 h-4 text-emerald-500" />;
      case 'VENDOR_BILL': return <Receipt className="w-4 h-4 text-purple-500" />;
      case 'SO': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'DO': return <Truck className="w-4 h-4 text-teal-500" />;
      case 'SALES_INVOICE': return <Receipt className="w-4 h-4 text-emerald-600" />;
      case 'JV': return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'DEBIT_NOTE':
      case 'CREDIT_NOTE': return <Layers className="w-4 h-4 text-cyan-500" />;
      case 'PURCHASE_RETURN':
      case 'SALES_RETURN': return <Undo2 className="w-4 h-4 text-rose-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            OWNER
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            ACCOUNTANT
          </span>
        );
      case 'DATA_ENTRY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            DATA_ENTRY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {role}
          </span>
        );
    }
  };

  const filteredPending = pendingItems.filter(item => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = (item.docNumber || '').toLowerCase().includes(q) ||
      (item.makerName || '').toLowerCase().includes(q) ||
      (item.docTitle || '').toLowerCase().includes(q);
    const matchesType = filterDocType === 'ALL' || item.docType === filterDocType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Persona Switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-lg shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Maker-Checker Authorization Engine
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  90% Ready Out-of-the-box
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Configured for standard 3-tier SME structure: <strong className="text-emerald-700">DATA_ENTRY (Maker)</strong> → <strong className="text-blue-700">ACCOUNTANT (Checker/Maker)</strong> → <strong className="text-purple-700">OWNER (Final Approver)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Persona Switcher */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <UserCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Active Acting User:</div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = tenantUsers.find(x => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-4"
            >
              {tenantUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div className="ml-1">
            {getRoleBadge(currentUser.role)}
          </div>
        </div>
      </div>

      {/* 90% Defaults Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900">Standard Business Rule Matrix (Zero Configuration Required):</span>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
            <div>
              <strong className="text-emerald-800">1. Data Entry Clerk:</strong> Enters operational bills, orders & returns. Small amounts (&lt;₹25k) auto-approve; larger ones route to Accountant.
            </div>
            <div>
              <strong className="text-blue-800">2. Accountant:</strong> Checks clerk bills/orders. When Accountant creates manual JVs/payments, they escalate to Owner.
            </div>
            <div>
              <strong className="text-purple-800">3. Business Owner:</strong> Reviews sensitive manual JVs, large payments, and high-value orders.
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {feedbackMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <div className="text-sm font-medium">{feedbackMessage.text}</div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.pendingCount}</div>
            <div className="text-xs text-slate-500 font-medium">Pending Authorizations</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.approvedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Approved by Checker</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.autoApprovedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Below Threshold (Auto)</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.rulesConfiguredCount} Active</div>
            <div className="text-xs text-slate-500 font-medium">Configured Policies</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <StandardTabs<'pending' | 'rules' | 'history' | 'simulator'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'pending',
            label: 'Pending Authorizations',
            icon: Clock,
            badge: stats.pendingCount > 0 ? stats.pendingCount : null,
            badgeVariant: 'warning',
          },
          {
            id: 'rules',
            label: 'Policy & Threshold Matrix',
            icon: Sliders,
            badge: `${stats.rulesConfiguredCount} Active`,
            badgeVariant: 'default',
          },
          {
            id: 'history',
            label: 'Authorization Audit History',
            icon: CheckCircle2,
          },
          {
            id: 'simulator',
            label: 'Role Flow Simulator',
            icon: RefreshCw,
          },
        ]}
      />

      {/* Tab 1: Pending Authorizations Queue */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-4 shadow-sm -mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doc # or maker name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl text-xs w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="px-3 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="ALL">All Document Types</option>
                <option value="VENDOR_BILL">Vendor Bill (Purchase Invoice)</option>
                <option value="PO">Purchase Order</option>
                <option value="GRN">Goods Receipt Note</option>
                <option value="JV">Journal Voucher</option>
                <option value="DEBIT_NOTE">Debit Note</option>
                <option value="CREDIT_NOTE">Credit Note</option>
                <option value="PURCHASE_RETURN">Purchase Return</option>
                <option value="SALES_RETURN">Sales Return</option>
                <option value="SALES_INVOICE">Sales Invoice</option>
                <option value="PAYMENT">Bank Payment</option>
              </select>
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
          </div>

          {filteredPending.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-lg">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="text-base font-semibold text-slate-700">All clear! No pending authorizations</div>
              <div className="text-xs text-slate-400 mt-1">All transactions requiring verification have been processed.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Doc Type & No</th>
                    <th className="py-3 px-4">Maker (Initiator)</th>
                    <th className="py-3 px-4 text-right">Transaction Amount</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Status & Action</th>
                    <th className="py-3 px-4 text-center">Checker Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPending.map((item) => {
                    const isMaker = item.makerId === currentUser.id;
                    const rule = rules.find(r => r.docType === item.docType);
                    const isRoleAuthorized = !rule || rule.allowedRoles.includes(currentUser.role);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-slate-100 rounded">
                              {getDocIcon(item.docType)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{item.docNumber}</div>
                              <div className="text-xs text-slate-500">{item.docTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{item.makerName}</div>
                          <div className="mt-0.5">{getRoleBadge(item.makerRole)}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-slate-400">{item.currency}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Awaiting Checker
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isMaker ? (
                            <div className="inline-flex items-center justify-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Self-Approval Blocked (Maker)</span>
                            </div>
                          ) : !isRoleAuthorized ? (
                            <div className="inline-flex items-center justify-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              <Lock className="w-3 h-3" />
                              <span>Requires {rule?.allowedRoles.join('/')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setActionType('APPROVE');
                                  setActionRemarks('');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setActionType('REJECT');
                                  setActionRemarks('');
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Policy & Threshold Matrix */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-6 shadow-sm -mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Standard Policy & Threshold Matrix</h2>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                  3-Role Standard RBAC
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pre-configured for 90% of business scenarios. Transactions below ₹ limit auto-approve. High-value transactions route to Accountant or Owner.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefaults}
                disabled={isLoading}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Reset to 90% Defaults
              </button>
              <button
                onClick={handleSaveRules}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Policy Matrix
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Default Maker & Workflow</th>
                  <th className="py-3 px-4 text-center">Dual Approval?</th>
                  <th className="py-3 px-4">Auto-Approval Threshold (₹)</th>
                  <th className="py-3 px-4">Authorized Checker Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.docType} className={`hover:bg-slate-50 transition-colors ${rule.isEnabled ? 'bg-white' : 'bg-slate-50/50 opacity-70'}`}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {getDocIcon(rule.docType)}
                        <div>
                          <div>{rule.docTitle}</div>
                          <div className="text-xs text-slate-400 font-normal">{rule.module}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Maker:</span>
                        {getRoleBadge(rule.defaultMakerRole)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 italic">
                        {rule.workflowSummary}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.isEnabled}
                          onChange={() => handleRuleToggle(rule.docType)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-semibold text-xs">₹</span>
                        <input
                          type="number"
                          disabled={!rule.isEnabled}
                          value={rule.thresholdAmount}
                          onChange={(e) => handleThresholdChange(rule.docType, Number(e.target.value))}
                          className="w-28 px-2.5 py-1 text-xs border border-emerald-400 dark:border-emerald-500 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {rule.thresholdAmount === 0 ? 'All amounts require checker' : `Auto-approve if ≤ ₹${rule.thresholdAmount.toLocaleString('en-IN')}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!rule.isEnabled}
                            checked={rule.allowedRoles.includes('ACCOUNTANT')}
                            onChange={() => handleRoleToggle(rule.docType, 'ACCOUNTANT')}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-blue-700 font-medium text-[11px]">ACCOUNTANT</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!rule.isEnabled}
                            checked={rule.allowedRoles.includes('OWNER')}
                            onChange={() => handleRoleToggle(rule.docType, 'OWNER')}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-purple-700 font-medium text-[11px]">OWNER</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: History & Audit Trail */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-4 shadow-sm -mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Authorization Audit History</h2>
              <p className="text-xs text-slate-500">Immutable record of all maker-checker approvals, rejections, and auto-authorizations</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Doc # & Type</th>
                  <th className="py-3 px-4">Maker</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Checker / Decision</th>
                  <th className="py-3 px-4">Remarks / Rejection Reason</th>
                  <th className="py-3 px-4">Decided At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {getDocIcon(item.docType)}
                        <span>{item.docNumber}</span>
                      </div>
                      <div className="text-xs text-slate-400">{item.docTitle}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.makerName}</div>
                      <div className="mt-0.5">{getRoleBadge(item.makerRole)}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {item.status === 'AUTO_APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Check className="w-3 h-3" /> Auto-Approved (≤ Limit)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.checkerName ? (
                        <div>
                          <div className="font-medium text-slate-800">{item.checkerName}</div>
                          <div className="mt-0.5">{getRoleBadge(item.checkerRole || 'ACCOUNTANT')}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">System (Auto-Limit)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {item.rejectionReason ? (
                        <span className="text-rose-600 font-medium">{item.rejectionReason}</span>
                      ) : (
                        item.remarks || '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {item.decidedAt ? new Date(item.decidedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Simulator */}
      {activeTab === 'simulator' && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 space-y-6 shadow-sm -mt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Interactive Role Flow Simulator</h2>
            <p className="text-xs text-slate-500">
              Test how transactions created by Ramesh (Clerk), Priya (Accountant), or Vikram (Owner) automatically route based on document type and value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Type</label>
              <select
                value={simDocType}
                onChange={(e) => setSimDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-emerald-400 dark:border-emerald-500 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                {rules.map(r => (
                  <option key={r.docType} value={r.docType}>
                    {r.docTitle} ({r.docType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Value (₹)</label>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-emerald-400 dark:border-emerald-500 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maker (Who creates the entry?)</label>
              <select
                value={simMaker}
                onChange={(e) => setSimMaker(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-emerald-400 dark:border-emerald-500 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                {tenantUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunSimulation}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Simulate Policy & Routing
            </button>
          </div>

          {simResult && (
            <div className="mt-4 p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-indigo-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Simulation Result:</span>
                {simResult.status === 'AUTO_APPROVED' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Approved (No Bottleneck)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Queued for Checker
                  </span>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium">Applied Threshold Rule</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {simResult.ruleApplied?.thresholdAmount > 0
                      ? `₹${simResult.ruleApplied.thresholdAmount.toLocaleString('en-IN')}`
                      : 'Always Mandate Checker (₹0)'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {Number(simAmount) <= (simResult.ruleApplied?.thresholdAmount || 0)
                      ? 'Amount is within auto limit'
                      : 'Amount exceeds auto limit'}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium">Authorized Checkers</div>
                  <div className="text-sm font-bold text-indigo-700 mt-1">
                    {simResult.ruleApplied?.allowedRoles?.join(' or ') || 'OWNER'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Maker cannot approve their own entry
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium">Message</div>
                  <div className="text-xs font-medium text-slate-700 mt-1">
                    {simResult.message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approve / Reject Action Modal */}
      {selectedItem && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600" />
                )}
                <span>{actionType === 'APPROVE' ? 'Authorize & Approve Transaction' : 'Reject Transaction'}</span>
              </div>
              <button onClick={() => { setSelectedItem(null); setActionType(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Document:</span>
                <span className="font-semibold text-slate-800">{selectedItem.docNumber} ({selectedItem.docTitle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Value:</span>
                <span className="font-bold text-slate-900">₹{selectedItem.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Maker (Created By):</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">{selectedItem.makerName}</span>
                  {getRoleBadge(selectedItem.makerRole)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Checker (Authorizing As):</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-indigo-800">{currentUser.name}</span>
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {actionType === 'APPROVE' ? 'Checker Approval Remarks (Optional)' : 'Reason for Rejection (Mandatory for Audit)'}
              </label>
              <textarea
                rows={3}
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder={actionType === 'APPROVE' ? 'e.g., Verified against PO & GRN rates. Approved for posting.' : 'e.g., Rates do not match agreement with supplier.'}
                className="w-full px-3.5 py-2 border border-emerald-400 dark:border-emerald-500 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setSelectedItem(null); setActionType(null); }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm flex items-center gap-1.5 ${
                  actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionType === 'APPROVE' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
