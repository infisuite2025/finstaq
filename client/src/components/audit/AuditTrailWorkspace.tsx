import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  History,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ArrowRight,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Laptop,
  Smartphone,
  Info,
  Calendar,
  Layers,
  Database,
  Lock,
  Download
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';
import { UniversalReportPrintModal, ReportPrintData } from '../common/UniversalReportPrintModal';

interface AuditDiff {
  changedFields: string[];
  before: Record<string, any>;
  after: Record<string, any>;
}

interface DataChangeLog {
  id: string;
  tenantId: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVERSE' | 'POST' | 'ADJUST';
  entityName: string;
  entityId: string;
  entityNumber?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  diffJson?: AuditDiff | null;
  narration?: string | null;
  createdAt: string;
}

interface SessionActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'SESSION_START' | 'SESSION_TIMEOUT' | 'PASSWORD_CHANGE' | 'EXPORT_DATA' | 'PRINT_REPORT';
  ipAddress: string;
  userAgent: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'API';
  status: 'SUCCESS' | 'FAILED' | 'TERMINATED';
  details?: string;
  createdAt: string;
}

interface AuditSummary {
  totalModifications: number;
  modifications24h: number;
  totalSessionEvents: number;
  activeLogins24h: number;
  criticalReversals: number;
  mcaComplianceStatus: string;
  entityBreakdown: Record<string, number>;
}

export const AuditTrailWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'changes' | 'sessions' | 'summary'>('changes');
  const [logs, setLogs] = useState<DataChangeLog[]>([]);
  const [sessions, setSessions] = useState<SessionActivityLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters for Data Changes
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filters for Sessions
  const [sessionEventType, setSessionEventType] = useState('ALL');
  const [sessionSearch, setSessionSearch] = useState('');

  // Diff Modal State
  const [activeDiffLog, setActiveDiffLog] = useState<DataChangeLog | null>(null);

  // Print Report Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printReportData, setPrintReportData] = useState<ReportPrintData | null>(null);

  const { success, info } = useToast();
  const { getAuthHeaders } = useAuth();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEntity !== 'ALL') params.append('entityName', selectedEntity);
      if (selectedAction !== 'ALL') params.append('action', selectedAction);
      if (searchQuery) params.append('search', searchQuery);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const res = await fetch(`/api/v1/audit/logs?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLogs(json.data.logs || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (sessionEventType !== 'ALL') params.append('eventType', sessionEventType);
      if (sessionSearch) params.append('search', sessionSearch);

      const res = await fetch(`/api/v1/audit/sessions?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSessions(json.data.sessions || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/v1/audit/summary', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSummary(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch summary', err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchSessions();
    fetchSummary();
  }, [selectedEntity, selectedAction, sessionEventType]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID/Number', 'User', 'Role', 'IP Address', 'Narration'];
    const rows = logs.map(l => [
      new Date(l.createdAt).toLocaleString(),
      l.action,
      l.entityName,
      l.entityNumber || l.entityId,
      l.userName || l.userId,
      l.userRole || 'N/A',
      l.ipAddress || 'N/A',
      `"${(l.narration || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MCA_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Audit Trail exported successfully to CSV/Excel', 'Export Complete');
  };

  const handlePrint = () => {
    const reportDoc: ReportPrintData = {
      reportTitle: 'MCA Audit Trail & Transaction Edit Log',
      department: 'TAXATION',
      subtitle: 'Rule 3(1) Companies (Accounts) Rules 2014 • Statutory Immutable Log',
      asOfDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      summaryCards: [
        { label: 'Total Recorded Changes', value: summary?.totalModifications || logs.length, format: 'text' },
        { label: 'Modifications (24h)', value: summary?.modifications24h || 0, format: 'text' },
        { label: 'Active Sessions / Logins', value: summary?.activeLogins24h || 0, format: 'text' },
        { label: 'Critical Reversals / JVs', value: summary?.criticalReversals || 0, format: 'text' },
      ],
      columns: [
        { header: 'Timestamp', accessor: 'formattedDate', align: 'left' },
        { header: 'Action', accessor: 'action', align: 'center' },
        { header: 'Entity', accessor: 'entityName', align: 'left' },
        { header: 'Doc / Ref ID', accessor: 'docRef', align: 'left' },
        { header: 'User & Role', accessor: 'userInfo', align: 'left' },
        { header: 'IP Address', accessor: 'ipAddress', align: 'left' },
        { header: 'Narration / Event Reason', accessor: 'narration', align: 'left' },
        { header: 'Modified Fields', accessor: 'changedFields', align: 'left' },
      ],
      rows: logs.map((l) => ({
        formattedDate: new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        action: l.action,
        entityName: l.entityName,
        docRef: l.entityNumber || l.entityId,
        userInfo: `${l.userName || 'User'} (${l.userRole || 'N/A'})`,
        ipAddress: l.ipAddress || '127.0.0.1',
        narration: l.narration || '-',
        changedFields: l.diffJson?.changedFields?.length ? l.diffJson.changedFields.join(', ') : 'Initial State',
      })),
      notes: 'MCA Statutory Compliance Certification: This audit log is maintained in an immutable, tamper-evident format. All modifications, adjustments, reversals, and session activities are permanently recorded in accordance with Ministry of Corporate Affairs requirements.',
    };
    setPrintReportData(reportDoc);
    setIsPrintModalOpen(true);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300 dark:border-blue-800">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800">DELETE</span>;
      case 'REVERSE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">REVERSE</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">POST</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">{action}</span>;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300">LOGIN</span>;
      case 'LOGOUT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">LOGOUT</span>;
      case 'EXPORT_DATA':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300">DATA EXPORT</span>;
      case 'PRINT_REPORT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-300">PRINT REPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">{eventType}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Compliance Stamp */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Audit Trail & MCA Edit Log
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  MCA / GST Compliant
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Tamper-evident edit log of all transactional changes, voucher adjustments, user logins, and session lifecycles
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchAuditLogs(); fetchSessions(); fetchSummary(); }}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Log
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Excel (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Log (PDF)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <KPIGrid cols={4}>
          <KPIScorecard
            label="Total Recorded Changes"
            value={summary.totalModifications}
            icon={<History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            badge="MCA Compliant"
            badgeVariant="emerald"
            variant="emerald"
            footerLeft="Audit Trail"
            footerRight="100% Preserved"
          />
          <KPIScorecard
            label="Recent Changes (24h)"
            value={summary.modifications24h}
            icon={<Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            badge="Live Trail"
            badgeVariant="indigo"
            variant="indigo"
            footerLeft="Time Window"
            footerRight="All Modules"
          />
          <KPIScorecard
            label="Active Sessions & Logins"
            value={summary.activeLogins24h}
            icon={<UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            badge={`${summary.totalSessionEvents} Events`}
            badgeVariant="blue"
            variant="default"
            footerLeft="Session Log"
            footerRight="Multi-Device"
          />
          <KPIScorecard
            label="Critical Reversals / JVs"
            value={summary.criticalReversals}
            icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            badge="Strict Audit"
            badgeVariant="amber"
            variant="amber"
            footerLeft="Offsetting JVs"
            footerRight="Verified Only"
          />
        </KPIGrid>
      )}

      {/* Navigation Tabs */}
      <StandardTabs<'changes' | 'sessions' | 'summary'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'changes',
            label: 'Data Modification Edit Logs',
            icon: History,
            badge: logs.length,
            badgeVariant: 'default',
          },
          {
            id: 'sessions',
            label: 'User Logins & Session Logs',
            icon: UserCheck,
            badge: sessions.length,
            badgeVariant: 'default',
          },
          {
            id: 'summary',
            label: 'Entity Modification Breakdown',
            icon: Layers,
          },
        ]}
      />

      {/* Tab 1: Data Changes Edit Log */}
      {activeTab === 'changes' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden -mt-6">
          {/* Filters Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Entity Filter */}
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="ALL">All Entities</option>
                <option value="SALES_INVOICE">Sales Invoices</option>
                <option value="PURCHASE_ORDER">Purchase Orders</option>
                <option value="JOURNAL_VOUCHER">Journal Vouchers</option>
                <option value="VOUCHER_ADJUSTMENT">Voucher Adjustments</option>
                <option value="INVENTORY_ITEM">Inventory Items</option>
                <option value="LEDGER">Ledger Accounts</option>
                <option value="PAYROLL">Payroll & Salary</option>
                <option value="PARTY">Customers & Vendors</option>
              </select>

              {/* Action Filter */}
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="POST">POST</option>
                <option value="REVERSE">REVERSE</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Doc #, user, narration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                  className="pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs w-48 sm:w-64 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {(selectedEntity !== 'ALL' || selectedAction !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedEntity('ALL');
                    setSelectedAction('ALL');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing {logs.length} audit trail records
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Document / Ref ID</th>
                  <th className="p-3.5">User & Role</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Narration / Event</th>
                  <th className="p-3.5 text-right">Audit Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      No audit trail records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {log.entityName}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {log.entityNumber || log.entityId}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">{log.userName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.userRole}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.narration || ''}>
                        {log.narration || '-'}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {log.diffJson && log.diffJson.changedFields?.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setActiveDiffLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 dark:border-blue-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Diff ({log.diffJson.changedFields.length})
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Initial State</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sessions Log */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden -mt-6">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <select
                value={sessionEventType}
                onChange={(e) => setSessionEventType(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="ALL">All Event Types</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="EXPORT_DATA">EXPORT DATA</option>
                <option value="PRINT_REPORT">PRINT REPORT</option>
                <option value="PASSWORD_CHANGE">PASSWORD CHANGE</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, IP, activity..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSessions()}
                  className="pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs w-48 sm:w-64 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {sessionSearch && (
                <button
                  onClick={() => { setSessionSearch(''); }}
                  className="px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing {sessions.length} authentication events
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">User Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Device & User Agent</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {sessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(ses.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getEventBadge(ses.eventType)}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {ses.userEmail}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {ses.userRole}
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-500 text-[11px]" title={ses.userAgent}>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">{ses.deviceType}:</span>
                      {ses.userAgent}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {ses.ipAddress}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {ses.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={ses.details || ''}>
                      {ses.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Summary Breakdown */}
      {activeTab === 'summary' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Modifications by Entity Type
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.entityBreakdown).map(([entity, count]) => (
                <div key={entity} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{entity}</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {count} edits
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              MCA Audit Trail Compliance Guarantee
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium">
                ✓ <strong>Statutory Compliance Verified:</strong> Conforms to Rule 3(1) of the Companies (Accounts) Rules, 2014 requiring immutable logging of each and every change in accounting records.
              </div>
              <ul className="space-y-2 pl-4 list-disc text-slate-500 dark:text-slate-400">
                <li>Audit trail cannot be disabled or bypassed by any system role.</li>
                <li>All changes capture previous state, new state, operating user, and IP address.</li>
                <li>Zero-edit policy enforced on auto-posted vouchers — strictly reversible via adjustment JVs.</li>
                <li>Exportable directly to statutory auditors with cryptographically tamper-evident log IDs.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Visual Diff Modal */}
      {activeDiffLog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Audit Diff Inspector: {activeDiffLog.entityName} ({activeDiffLog.entityNumber || activeDiffLog.entityId})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modified by {activeDiffLog.userName} on {new Date(activeDiffLog.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDiffLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Side-by-Side Diff */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="text-xs font-semibold text-slate-500">
                Changed fields ({activeDiffLog.diffJson?.changedFields?.length || 0}):{' '}
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {activeDiffLog.diffJson?.changedFields?.join(', ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before State */}
                <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Previous Value (Before)
                  </h4>
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {JSON.stringify(activeDiffLog.diffJson?.before || {}, null, 2)}
                  </pre>
                </div>

                {/* After State */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    New Value (After Modification)
                  </h4>
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {JSON.stringify(activeDiffLog.diffJson?.after || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {activeDiffLog.narration && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Audit Narration / Reason: </span>
                  <span className="text-slate-600 dark:text-slate-400">{activeDiffLog.narration}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setActiveDiffLog(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl transition-all"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Report Print Modal */}
      {isPrintModalOpen && printReportData && (
        <UniversalReportPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          data={printReportData}
        />
      )}
    </div>
  );
};
