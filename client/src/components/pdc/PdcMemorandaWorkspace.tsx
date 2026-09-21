import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Clock,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';

interface PostDatedCheque {
  id: string;
  voucherType: 'PDC_RECEIPT' | 'PDC_PAYMENT' | 'MEMORANDUM' | 'OPTIONAL_VOUCHER';
  pdcNumber: string;
  chequeNumber: string;
  chequeDate: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'VENDOR';
  bankName: string;
  amount: number;
  purposeOrNarration: string;
  status: 'PENDING' | 'CLEARED_ACTIVE' | 'CANCELLED' | 'BOUNCED';
  promotedVoucherNumber?: string;
  promotedAt?: string;
}

export function PdcMemorandaWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'inward' | 'outward' | 'memoranda'>('inward');
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState<PostDatedCheque[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New PDC Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    voucherType: 'PDC_RECEIPT' as 'PDC_RECEIPT' | 'PDC_PAYMENT' | 'MEMORANDUM',
    chequeNumber: '554202',
    chequeDate: '2026-09-28',
    partyName: 'Tata Motors Limited',
    partyType: 'CUSTOMER' as 'CUSTOMER' | 'VENDOR',
    bankName: 'HDFC Bank Ltd',
    amount: 150000,
    purposeOrNarration: 'Advance cheque against Sales Order',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/pdc', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        setItems(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePromote = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/pdc/${id}/promote`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Post-dated voucher promoted to active books! Generated Voucher #${data.data.voucherNumber}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to promote voucher');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prefix = form.voucherType === 'PDC_RECEIPT' ? 'PDC-IN' : form.voucherType === 'PDC_PAYMENT' ? 'PDC-OUT' : 'MEMO';
      const pdcNumber = `${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch('/api/v1/pdc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...form,
          pdcNumber,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${form.voucherType} ${pdcNumber} registered successfully!`);
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create PDC');
    }
  };

  const inwardItems = items.filter((i) => i.voucherType === 'PDC_RECEIPT');
  const outwardItems = items.filter((i) => i.voucherType === 'PDC_PAYMENT');
  const memoItems = items.filter((i) => ['MEMORANDUM', 'OPTIONAL_VOUCHER'].includes(i.voucherType));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post-Dated & Memoranda Vouchers</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                Shadow Ledger & PDC Maturity Tracker
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track post-dated cheque receipts & payments outside active books with automated 1-click promotion on maturity dates.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Register New PDC / Memo
        </button>
      </div>

      {/* Tabs */}
      <StandardTabs<'inward' | 'outward' | 'memoranda'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'inward',
            label: 'PDC Inward (Customer Receipts)',
            icon: ArrowDownLeft,
            badge: inwardItems.filter((i) => i.status === 'PENDING').length,
            badgeVariant: 'warning',
          },
          {
            id: 'outward',
            label: 'PDC Outward (Vendor Payments)',
            icon: ArrowUpRight,
            badge: outwardItems.filter((i) => i.status === 'PENDING').length,
            badgeVariant: 'default',
          },
          {
            id: 'memoranda',
            label: 'Memoranda & Optional Vouchers',
            icon: FileText,
            badge: memoItems.length,
            badgeVariant: 'default',
          },
        ]}
      />

      {/* Content Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {activeTab === 'inward' ? 'Post-Dated Inward Cheques' : activeTab === 'outward' ? 'Post-Dated Outward Cheques' : 'Memoranda / Contingent Vouchers'}
          </h3>
          <span className="text-xs text-slate-500">Zero posting impact until activated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5">PDC #</th>
                <th className="p-3.5">Cheque # & Bank</th>
                <th className="p-3.5">Maturity Date</th>
                <th className="p-3.5">Party Name</th>
                <th className="p-3.5">Purpose / Narration</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(activeTab === 'inward' ? inwardItems : activeTab === 'outward' ? outwardItems : memoItems).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold font-mono text-indigo-600">{item.pdcNumber}</td>
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.chequeNumber}</div>
                    <div className="text-[11px] text-slate-400">{item.bankName}</div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-600">{item.chequeDate}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{item.partyName}</td>
                  <td className="p-3.5 text-slate-500">{item.purposeOrNarration}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-base">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      item.status === 'CLEARED_ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.status === 'CLEARED_ACTIVE' ? `POSTED (${item.promotedVoucherNumber})` : 'PENDING MATURITY'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {item.status === 'PENDING' ? (
                      <button
                        onClick={() => handlePromote(item.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                      >
                        Activate & Post
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">In General Ledger</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Register PDC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Register Post-Dated / Optional Voucher
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Voucher Type</label>
                <select
                  value={form.voucherType}
                  onChange={(e) => setForm({ ...form, voucherType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PDC_RECEIPT">Post-Dated Receipt Cheque (Customer)</option>
                  <option value="PDC_PAYMENT">Post-Dated Payment Cheque (Vendor)</option>
                  <option value="MEMORANDUM">Memorandum / Optional Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Party Name</label>
                <input
                  type="text"
                  required
                  value={form.partyName}
                  onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Cheque / Leaf #</label>
                  <input
                    type="text"
                    required
                    value={form.chequeNumber}
                    onChange={(e) => setForm({ ...form, chequeNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Maturity Date</label>
                  <input
                    type="date"
                    required
                    value={form.chequeDate}
                    onChange={(e) => setForm({ ...form, chequeDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Narration / Purpose</label>
                <input
                  type="text"
                  value={form.purposeOrNarration}
                  onChange={(e) => setForm({ ...form, purposeOrNarration: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
                >
                  Register PDC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
