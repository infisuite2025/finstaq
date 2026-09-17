import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
  Search,
  Plus,
  Building2,
  Receipt,
  Sparkles,
  ShieldCheck,
  Send,
  ExternalLink,
  DollarSign,
  Layers,
  Clock
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface UpiTransaction {
  id: string;
  type: 'COLLECTION' | 'PAYOUT';
  vpa: string;
  payeeOrPayerName: string;
  amount: number;
  invoiceNumber?: string;
  transactionRef: string;
  bankRrn: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  channel: 'DYNAMIC_QR' | 'STATIC_QR' | 'COLLECT_REQUEST' | 'DIRECT_PAYOUT';
  voucherNumber?: string;
  createdAt: string;
  settledAt?: string;
}

interface VpaDirectoryItem {
  id: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE';
  vpa: string;
  isDefault: boolean;
  isVerified: boolean;
}

export function UpiPaymentsWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'pos_qr' | 'collections' | 'payouts' | 'vpa_directory'>('pos_qr');
  const { getAuthHeaders } = useAuth();
  const [transactions, setTransactions] = useState<UpiTransaction[]>([]);
  const [vpaDirectory, setVpaDirectory] = useState<VpaDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // POS / Dynamic QR State
  const [posAmount, setPosAmount] = useState<number>(48500);
  const [posInvoiceNumber, setPosInvoiceNumber] = useState<string>('INV/2026/04/089');
  const [posCustomerName, setPosCustomerName] = useState<string>('Tata Motors Limited');
  const [posPayeeVpa, setPosPayeeVpa] = useState<string>('finstaq.enterprises@hdfcbank');
  const [posQrData, setPosQrData] = useState<{ upiUri: string; displayReference: string } | null>(null);

  // New Payout Form State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutVpa, setPayoutVpa] = useState('jswsteel@sbi');
  const [payoutName, setPayoutName] = useState('JSW Steel Processing Ltd');
  const [payoutAmount, setPayoutAmount] = useState<number>(82500);
  const [payoutBillRef, setPayoutBillRef] = useState('BILL-JSW-889');

  // New VPA Form State
  const [isAddVpaModalOpen, setIsAddVpaModalOpen] = useState(false);
  const [newVpaPartyName, setNewVpaPartyName] = useState('');
  const [newVpaPartyType, setNewVpaPartyType] = useState<'CUSTOMER' | 'VENDOR' | 'EMPLOYEE'>('CUSTOMER');
  const [newVpaAddress, setNewVpaAddress] = useState('');

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/upi/transactions', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVpaDirectory = async () => {
    try {
      const res = await fetch('/api/v1/upi/vpa-directory', {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        setVpaDirectory(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generatePosQr = async () => {
    try {
      const res = await fetch('/api/v1/upi/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payeeVpa: posPayeeVpa,
          payeeName: 'FINSTAQ ENTERPRISES LTD',
          amount: posAmount,
          invoiceNumber: posInvoiceNumber,
          narration: `Payment for ${posInvoiceNumber} - ${posCustomerName}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosQrData({
          upiUri: data.data.upiUri,
          displayReference: data.data.displayReference,
        });
      }
    } catch (err) {
      toast.error('Failed to generate QR');
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchVpaDirectory();
    generatePosQr();
  }, []);

  const handleSimulatePaymentReceived = async () => {
    try {
      const res = await fetch('/api/v1/upi/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          payerVpa: 'tatamotors@hdfcbank',
          payerName: posCustomerName,
          amount: posAmount,
          invoiceNumber: posInvoiceNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹${posAmount.toLocaleString('en-IN')} received via UPI! Auto-posted Receipt ${data.data.receiptVoucherNumber}`);
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Simulation error');
    }
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/upi/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          payeeVpa: payoutVpa,
          payeeName: payoutName,
          amount: payoutAmount,
          billNumber: payoutBillRef,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`UPI Payout of ₹${payoutAmount.toLocaleString('en-IN')} sent! Generated Payment Voucher ${data.data.paymentVoucherNumber}`);
        setIsPayoutModalOpen(false);
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Payout failed');
    }
  };

  const handleCreateVpa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const valRes = await fetch(`/api/v1/upi/validate-vpa?vpa=${encodeURIComponent(newVpaAddress)}`);
      const valData = await valRes.json();
      if (!valData.data?.isValid) {
        toast.error(valData.data?.message || 'Invalid VPA format');
        return;
      }

      const res = await fetch('/api/v1/upi/vpa-directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          partyName: newVpaPartyName,
          partyType: newVpaPartyType,
          vpa: newVpaAddress,
          isDefault: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`UPI ID ${newVpaAddress} registered for ${newVpaPartyName}!`);
        setIsAddVpaModalOpen(false);
        setNewVpaPartyName('');
        setNewVpaAddress('');
        fetchVpaDirectory();
      }
    } catch (err) {
      toast.error('Failed to register VPA');
    }
  };

  const totalCollected = transactions
    .filter((t) => t.type === 'COLLECTION' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter((t) => t.type === 'PAYOUT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">UPI Payments & Collections Hub</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                NPCI UPI 2.0 Ready
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dynamic B2B QR Code generation, instant auto-receipt reconciliation, vendor UPI direct payouts, and party VPA registry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            Send UPI Payout
          </button>
          <button
            onClick={() => { fetchTransactions(); fetchVpaDirectory(); }}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <KPIGrid columns={3}>
        <KPIScorecard
          label="TOTAL INWARD UPI COLLECTIONS"
          value={`₹${totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
          variant="emerald"
          badge="Auto-Booked"
          badgeVariant="emerald"
          footerLeft="GL Booking:"
          footerRight="Auto-Reconciled"
        />
        <KPIScorecard
          label="TOTAL OUTWARD UPI PAYOUTS"
          value={`₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
          badge="Settled"
          badgeVariant="indigo"
          footerLeft="Payout Type:"
          footerRight="Direct Vendor Settlements"
        />
        <KPIScorecard
          label="VERIFIED VPA REGISTRY"
          value={`${vpaDirectory.length} Handles`}
          icon={<Building2 className="w-3.5 h-3.5" />}
          badge="NPCI Verified"
          badgeVariant="blue"
          footerLeft="Directory Scope:"
          footerRight="Customers & Vendors"
        />
      </KPIGrid>

      {/* Tabs Navigation */}
      <StandardTabs<'pos_qr' | 'collections' | 'payouts' | 'vpa_directory'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'pos_qr',
            label: 'Dynamic UPI QR Generator',
            icon: QrCode,
          },
          {
            id: 'collections',
            label: 'Inbound Collections Feed',
            icon: ArrowDownLeft,
            badge: transactions.filter((t) => t.type === 'COLLECTION').length,
            badgeVariant: 'success',
          },
          {
            id: 'payouts',
            label: 'Outbound Payouts Studio',
            icon: ArrowUpRight,
            badge: transactions.filter((t) => t.type === 'PAYOUT').length,
            badgeVariant: 'default',
          },
          {
            id: 'vpa_directory',
            label: 'Party VPA Directory',
            icon: Building2,
            badge: vpaDirectory.length,
            badgeVariant: 'default',
          },
        ]}
      />

      {/* TAB 1: Dynamic POS QR */}
      {activeTab === 'pos_qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Invoice QR Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Company Receiving VPA</label>
                <input
                  type="text"
                  value={posPayeeVpa}
                  onChange={(e) => setPosPayeeVpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Bill Amount (₹)</label>
                <input
                  type="number"
                  value={posAmount}
                  onChange={(e) => setPosAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-base font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={posInvoiceNumber}
                    onChange={(e) => setPosInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={generatePosQr}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition"
              >
                Update Dynamic QR
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-5">
            <div className="p-4 bg-white border-2 border-emerald-500 rounded-3xl shadow-xl">
              {/* QR Render Preview */}
              <div className="w-56 h-56 bg-slate-50 flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 relative overflow-hidden">
                <QrCode className="w-36 h-36 text-slate-900" />
                <div className="absolute inset-x-0 bottom-2 text-[10px] font-mono text-slate-500 font-semibold">
                  SCAN WITH ANY UPI APP
                </div>
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                ₹{posAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Paying to: <strong className="text-slate-800 dark:text-slate-200">{posPayeeVpa}</strong> (FINSTAQ ENTERPRISES)
              </p>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Ref: {posQrData?.displayReference || 'FIN-UPI-0000'} • Inv: {posInvoiceNumber}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(posQrData?.upiUri || '');
                  toast.success('UPI Payment Link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy UPI Intent Link
              </button>

              <button
                onClick={handleSimulatePaymentReceived}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simulate Instant Payment (Auto-Receipt)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Inbound Collections Feed */}
      {activeTab === 'collections' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">UPI Collections Ledger</h3>
            <span className="text-xs text-slate-500">Live Bank RRNs & Linked Vouchers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Txn Date</th>
                  <th className="p-3.5">Payer / Customer</th>
                  <th className="p-3.5">Customer VPA</th>
                  <th className="p-3.5">Invoice Ref</th>
                  <th className="p-3.5">Bank RRN</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Auto-Booked Voucher</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.filter((t) => t.type === 'COLLECTION').map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 text-slate-500 font-mono">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{txn.payeeOrPayerName}</td>
                    <td className="p-3.5 font-mono text-indigo-600">{txn.vpa}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{txn.invoiceNumber || 'N/A'}</td>
                    <td className="p-3.5 font-mono text-slate-500">{txn.bankRrn}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 font-mono">
                      ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-mono font-bold">
                        {txn.voucherNumber || 'AUTO_PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-semibold">
                        SETTLED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Outbound Payouts Studio */}
      {activeTab === 'payouts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Vendor & Contractor Direct UPI Payouts</h3>
              <p className="text-xs text-slate-500">Zero-NEFT-delay instant merchant payouts</p>
            </div>
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Payout
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Payout Date</th>
                  <th className="p-3.5">Vendor / Payee</th>
                  <th className="p-3.5">Target VPA</th>
                  <th className="p-3.5">Vendor Bill Ref</th>
                  <th className="p-3.5">Bank RRN</th>
                  <th className="p-3.5 text-right">Disbursed Amount</th>
                  <th className="p-3.5 text-center">Payment Voucher</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.filter((t) => t.type === 'PAYOUT').map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 text-slate-500 font-mono">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{txn.payeeOrPayerName}</td>
                    <td className="p-3.5 font-mono text-indigo-600">{txn.vpa}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{txn.invoiceNumber || 'N/A'}</td>
                    <td className="p-3.5 font-mono text-slate-500">{txn.bankRrn}</td>
                    <td className="p-3.5 text-right font-bold text-indigo-600 font-mono">
                      ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-mono font-bold">
                        {txn.voucherNumber || 'AUTO_PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-semibold">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VPA Directory */}
      {activeTab === 'vpa_directory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Verified VPA & UPI Registry</h3>
              <p className="text-xs text-slate-500">NPCI-validated virtual payment addresses linked to party ledgers</p>
            </div>
            <button
              onClick={() => setIsAddVpaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Register New VPA
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vpaDirectory.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.partyName}</h4>
                    <span className="text-[10px] uppercase font-bold text-indigo-600">{item.partyType}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {item.vpa}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Execute Payout */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Direct UPI Payout
            </h3>

            <form onSubmit={handleExecutePayout} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Payee Name</label>
                <input
                  type="text"
                  required
                  value={payoutName}
                  onChange={(e) => setPayoutName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Payee UPI VPA</label>
                <input
                  type="text"
                  required
                  value={payoutVpa}
                  onChange={(e) => setPayoutVpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-base text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Vendor Bill Reference</label>
                <input
                  type="text"
                  value={payoutBillRef}
                  onChange={(e) => setPayoutBillRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
                >
                  Disburse via UPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register VPA */}
      {isAddVpaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Register Party VPA
            </h3>

            <form onSubmit={handleCreateVpa} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Party Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Larsen & Toubro Heavy Eng"
                  value={newVpaPartyName}
                  onChange={(e) => setNewVpaPartyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Party Type</label>
                <select
                  value={newVpaPartyType}
                  onChange={(e) => setNewVpaPartyType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">UPI ID / VPA</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. larsen.ops@hdfcbank"
                  value={newVpaAddress}
                  onChange={(e) => setNewVpaAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddVpaModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
                >
                  Save & Validate VPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
