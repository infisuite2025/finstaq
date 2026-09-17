import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, MessageSquare, Mail, Smartphone, Bell, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, FileText, Check, Copy, UserCheck, Search, Filter
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { StandardTabs } from '../common/StandardTabs';

interface CommTemplate {
  id: string;
  name: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'in_app';
  type: string;
  subject?: string;
  content: string;
  variables: string[];
}

interface CommLog {
  id: string;
  tenantId: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'in_app';
  recipient: string;
  subject?: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  referenceType?: string;
  referenceId?: string;
  sentAt: string;
  deliveredAt?: string;
  error?: string;
}

export const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'logs' | 'templates'>('send');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email' | 'in_app'>('whatsapp');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [logs, setLogs] = useState<CommLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchLog, setSearchLog] = useState('');

  const { success, error, info, warning } = useToast();
  const { getAuthHeaders } = useAuth();
  const { confirm } = useConfirm();

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/v1/communication/templates', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTemplates(Array.isArray(json.data) ? json.data : []);
        }
      }
    } catch (e) {
      console.error('Failed to load templates', e);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/communication/logs?limit=100', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLogs(Array.isArray(json.data) ? json.data : []);
        }
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
  }, []);

  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      setChannel(tmpl.channel);
      if (tmpl.subject) setSubject(tmpl.subject);
      setContent(tmpl.content);
      info(`Loaded template: ${tmpl.name}`, 'Template Applied');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !content.trim()) {
      warning('Please provide recipient details and message body', 'Missing Fields');
      return;
    }

    const confirmed = await confirm({
      title: 'Confirm Message Dispatch',
      message: `Are you sure you want to send this ${channel.toUpperCase()} message to ${recipient}?`,
      type: 'info',
      confirmText: 'Dispatch Message'
    });

    if (!confirmed) return;

    try {
      setSending(true);
      const res = await fetch('/api/v1/communication/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': getAuthHeaders()['x-tenant-id']
        },
        body: JSON.stringify({
          channel,
          recipient,
          subject: (channel === 'email' || channel === 'in_app') ? subject : undefined,
          content,
          variables: {
            companyName: 'Apex Industries Ltd.',
            partyName: 'Customer / Supplier',
            docNumber: 'DOC-2026-001',
            amount: '₹ 1,50,000.00'
          }
        })
      });

      const json = await res.json();
      if (json.success) {
        success(`${channel.toUpperCase()} message dispatched successfully to ${recipient}!`, 'Message Sent');
        setContent('');
        fetchLogs();
      } else {
        error(json.error || 'Failed to dispatch message', 'Dispatch Error');
      }
    } catch (err: any) {
      error(err.message || 'Network error sending communication', 'Error');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'read':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800"><CheckCircle2 className="w-3.5 h-3.5" /> Read</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800"><Check className="w-3.5 h-3.5" /> Delivered</span>;
      case 'sent':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800"><Clock className="w-3.5 h-3.5" /> Sent</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full"><Clock className="w-3.5 h-3.5" /> Queued</span>;
    }
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'whatsapp': return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'sms': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'in_app': return <Bell className="w-4 h-4 text-indigo-500" />;
      default: return <Send className="w-4 h-4" />;
    }
  };

  const query = (searchLog || '').toLowerCase();
  const filteredLogs = (logs || []).filter(l => {
    if (!l) return false;
    const recipient = (l.recipient || '').toLowerCase();
    const content = (l.content || '').toLowerCase();
    const subject = (l.subject || '').toLowerCase();
    const channel = (l.channel || '').toLowerCase();
    const status = (l.status || '').toLowerCase();
    return (
      recipient.includes(query) ||
      content.includes(query) ||
      subject.includes(query) ||
      channel.includes(query) ||
      status.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Send className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Communication Engine & Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Multi-channel notifications (WhatsApp, SMS, Email, In-App) & automated transactional messaging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchLogs(); fetchTemplates(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <StandardTabs<'send' | 'logs' | 'templates'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'send',
            label: 'Quick Dispatch Studio',
            icon: Send,
          },
          {
            id: 'logs',
            label: 'Delivery & Audit Logs',
            icon: Clock,
            badge: logs.length,
            badgeVariant: 'default',
          },
          {
            id: 'templates',
            label: 'Message Templates',
            icon: FileText,
            badge: templates.length,
            badgeVariant: 'default',
          },
        ]}
      />

      {/* Tab Content: Quick Dispatch Studio */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Compose & Dispatch Message
            </h2>

            <form onSubmit={handleSendMessage} className="space-y-4">
              {/* Channel selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Channel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: <Smartphone className="w-4 h-4 text-emerald-500" /> },
                    { id: 'sms', label: 'SMS Gateway', icon: <MessageSquare className="w-4 h-4 text-amber-500" /> },
                    { id: 'email', label: 'Email Dispatch', icon: <Mail className="w-4 h-4 text-blue-500" /> },
                    { id: 'in_app', label: 'In-App Alert', icon: <Bell className="w-4 h-4 text-indigo-500" /> }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id as any)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        channel === ch.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {ch.icon}
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template quick-loader */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Load from Template (Optional)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a standard ERP Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.channel.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Recipient ({channel === 'email' ? 'Email Address' : channel === 'in_app' ? 'User ID' : 'Mobile Number with Country Code'})
                </label>
                <input
                  type={channel === 'email' ? 'email' : 'text'}
                  required
                  placeholder={channel === 'email' ? 'finance@customer.com' : channel === 'in_app' ? 'USER-001' : '+91 98765 43210'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Subject (for email / in_app) */}
              {(channel === 'email' || channel === 'in_app') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tax Invoice #INV-2026-001 Dispatched"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Message Content / Body
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type message content or use template placeholders like {{partyName}}, {{docNumber}}..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
                  {sending ? 'Dispatching Message...' : `Dispatch ${channel.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info & Test Toasts/Alerts Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Live UI Feedback Preview
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Test interactive Toasters and SweetAlert2-style confirmation dialogs:
              </p>
              
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => success('Sales Order #SO-2026-099 posted & stock allocated!', 'Order Placed')}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 transition-colors"
                >
                  🟢 Trigger Success Toast
                </button>
                <button
                  type="button"
                  onClick={() => error('Debit and Credit totals do not match! Difference of ₹ 5,000.00 detected.', 'Sanity Check Failed')}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 transition-colors"
                >
                  🔴 Trigger Error Toast
                </button>
                <button
                  type="button"
                  onClick={() => warning('Minimum stock threshold reached for item STEEL-ROD-10MM', 'Low Stock Alert')}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 transition-colors"
                >
                  🟡 Trigger Warning Toast
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Reverse Auto-Posted Voucher?',
                      message: 'This will generate an offsetting Adjustment JV (JV-ADJ) linked directly to the original voucher. Are you sure you want to proceed?',
                      type: 'warning',
                      confirmText: 'Yes, Create Adjustment JV',
                      cancelText: 'Abort'
                    });
                    if (ok) {
                      success('Adjustment JV posted successfully!', 'Reversed');
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                >
                  ✨ Test SweetAlert2 Confirmation Modal
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Supported Placeholders
              </h3>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                <li>• {'{{companyName}}'} - Apex Industries Ltd.</li>
                <li>• {'{{partyName}}'} - Supplier / Customer Name</li>
                <li>• {'{{docNumber}}'} - Invoice / PO / Order No.</li>
                <li>• {'{{amount}}'} - Total Document Value</li>
                <li>• {'{{date}}'} - Timestamp</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient, content..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredLogs.length} transmissions
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Channel</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Message / Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                      No communication records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                          {getChannelIcon(log.channel)}
                          {log.channel}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {log.recipient}
                      </td>
                      <td className="p-4 max-w-xs">
                        {log.subject && <div className="font-bold text-slate-900 dark:text-white truncate">{log.subject}</div>}
                        <div className="text-slate-500 dark:text-slate-400 truncate">{log.content}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.sentAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    {getChannelIcon(tmpl.channel)}
                    {tmpl.name}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tmpl.channel}
                  </span>
                </div>

                {tmpl.subject && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Subject: {tmpl.subject}
                  </p>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap mb-3 border border-slate-100 dark:border-slate-800">
                  {tmpl.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {tmpl.variables.length} dynamic variables
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleTemplateSelect(tmpl.id);
                    setActiveTab('send');
                  }}
                  className="px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
