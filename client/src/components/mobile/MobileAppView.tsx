import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Plus,
  Search,
  FileText,
  Clock,
  Percent,
  Truck,
  Users,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Receipt,
  Download,
  Building,
  Calendar,
  Layers,
  HelpCircle,
  X,
  UserCheck,
  Bell,
  Check,
  AlertTriangle,
  Send,
  Sliders,
  DollarSign
} from 'lucide-react';
import { StandardTabs } from '../common/StandardTabs';
import { AuthSession } from '../../context/AuthContext';

interface MobileAppViewProps {
  session: AuthSession;
  onLogout: () => void;
  onSwitchToDesktop: () => void;
}

interface InAppPushNotification {
  id: string;
  title: string;
  message: string;
  category: 'approval' | 'upi' | 'pdc' | 'compliance' | 'system';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  docId?: string;
}

interface ApprovalItem {
  id: string;
  docType: string;
  docTitle: string;
  docNumber: string;
  amount: number;
  currency: string;
  makerName: string;
  makerRole: string;
  createdAt: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  checkerName?: string;
  rejectionReason?: string;
}

export function MobileAppView({ session, onLogout, onSwitchToDesktop }: MobileAppViewProps) {
  const [activeBottomNav, setActiveBottomNav] = useState<'pulse' | 'books' | 'upi' | 'approvals' | 'more'>('pulse');
  const [booksTab, setBooksTab] = useState('all');
  const [upiSubTab, setUpiSubTab] = useState('qr');
  const [approvalTab, setApprovalTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Push Notifications State
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppPushNotification[]>([
    {
      id: 'notif-1',
      title: '🚨 High-Value Payout Pending Approval',
      message: 'Payment #PAY-2026-089 of ₹6,50,000 to Tata Steel requires your 4-Eyes signoff.',
      category: 'approval',
      priority: 'urgent',
      timestamp: '8 mins ago',
      isRead: false,
      docId: 'APR-2026-089'
    },
    {
      id: 'notif-2',
      title: '💰 UPI Instant Payment Received',
      message: '₹45,000 credited to HDFC Bank from Apex Retail via UPI VPA apex@icici.',
      category: 'upi',
      priority: 'high',
      timestamp: '25 mins ago',
      isRead: false
    },
    {
      id: 'notif-3',
      title: '⏰ PDC Cheque Due Today',
      message: 'Cheque #884210 of ₹2,10,000 for Larsen & Toubro matures today at HDFC Bank.',
      category: 'pdc',
      priority: 'high',
      timestamp: '2 hours ago',
      isRead: false
    },
    {
      id: 'notif-4',
      title: '🛡️ TCS 206C(1H) Threshold Crossed',
      message: 'Party Bharat Heavy Electricals turnover crossed ₹50 Lakhs. TCS is now applicable @ 0.1%.',
      category: 'compliance',
      priority: 'medium',
      timestamp: '5 hours ago',
      isRead: true
    }
  ]);

  // Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([
    {
      id: 'APR-2026-089',
      docType: 'PAYMENT_VOUCHER',
      docTitle: 'Supplier Payout (Tata Steel Ltd)',
      docNumber: 'PAY-2026-089',
      amount: 650000.0,
      currency: 'INR',
      makerName: 'Ramesh Patel (Clerk)',
      makerRole: 'DATA_ENTRY',
      createdAt: '10 mins ago',
      reason: 'High-Value Payment > ₹5,00,000 threshold requirement (4-Eyes Principle)',
      status: 'PENDING'
    },
    {
      id: 'APR-2026-090',
      docType: 'PURCHASE_BILL',
      docTitle: 'Raw Material Inward Bill',
      docNumber: 'BILL-2026-442',
      amount: 420000.0,
      currency: 'INR',
      makerName: 'Ramesh Patel (Clerk)',
      makerRole: 'DATA_ENTRY',
      createdAt: '45 mins ago',
      reason: 'GRN Qty Match Variance exceeds 2% tolerance threshold',
      status: 'PENDING'
    },
    {
      id: 'APR-2026-091',
      docType: 'JOURNAL_VOUCHER',
      docTitle: 'Backdated Stock Adjustment',
      docNumber: 'JV-2026-018',
      amount: 175000.0,
      currency: 'INR',
      makerName: 'Priya Deshmukh (Accountant)',
      makerRole: 'ACCOUNTANT',
      createdAt: '2 hours ago',
      reason: 'Backdated entry by 4 days in closed inventory sub-ledger',
      status: 'PENDING'
    }
  ]);

  const [approvalHistory, setApprovalHistory] = useState<ApprovalItem[]>([
    {
      id: 'APR-2026-085',
      docType: 'PAYMENT_VOUCHER',
      docTitle: 'Vendor RTGS Transfer',
      docNumber: 'PAY-2026-085',
      amount: 890000.0,
      currency: 'INR',
      makerName: 'Ramesh Patel',
      makerRole: 'DATA_ENTRY',
      createdAt: 'Yesterday, 16:40',
      reason: 'Approved via Mobile Biometric 4-Eyes Authorization',
      status: 'APPROVED',
      checkerName: 'Vikram Singhania (Owner)'
    },
    {
      id: 'APR-2026-082',
      docType: 'CREDIT_LIMIT_OVERRIDE',
      docTitle: 'Client Dispatch Clearance',
      docNumber: 'SO-2026-192',
      amount: 350000.0,
      currency: 'INR',
      makerName: 'Priya Deshmukh',
      makerRole: 'ACCOUNTANT',
      createdAt: '2 days ago',
      reason: 'Rejected: Outstanding overdue exceeds 60 days limit',
      status: 'REJECTED',
      checkerName: 'Vikram Singhania (Owner)',
      rejectionReason: 'Party overdue balance unpaid for 65 days'
    }
  ]);

  const [rejectModalItem, setRejectModalItem] = useState<ApprovalItem | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');

  // Modals
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isTcsModalOpen, setIsTcsModalOpen] = useState(false);
  const [isPdcModalOpen, setIsPdcModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isJobWorkModalOpen, setIsJobWorkModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isBankBreakdownOpen, setIsBankBreakdownOpen] = useState(false);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // UPI Form State
  const [upiAmount, setUpiAmount] = useState('14500');
  const [upiInvoice, setUpiInvoice] = useState('INV-2026-089');
  const [upiVpa, setUpiVpa] = useState('apexindustries@hdfcbank');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('✓ All notifications marked as read');
  };

  const triggerSimulatedPush = () => {
    const newNotif: InAppPushNotification = {
      id: 'notif-' + Date.now(),
      title: '🚨 Urgent Voucher Approval Required',
      message: 'Payment #PAY-2026-095 for ₹8,20,000 created by Ramesh requires 4-Eyes Owner signoff.',
      category: 'approval',
      priority: 'urgent',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast('🔔 New Push Notification Received!');
  };

  const handleApprove = (item: ApprovalItem) => {
    setPendingApprovals(prev => prev.filter(req => req.id !== item.id));
    setApprovalHistory(prev => [
      {
        ...item,
        status: 'APPROVED',
        checkerName: `${session.email.split('@')[0]} (${session.role})`,
        reason: 'Authorized via Mobile 4-Eyes Maker-Checker Engine'
      },
      ...prev
    ]);
    showToast(`✓ Authorized ${item.docNumber} (₹${item.amount.toLocaleString('en-IN')})`);
  };

  const handleRejectConfirm = () => {
    if (!rejectModalItem) return;
    const reason = rejectReasonText.trim() || 'Voucher details require revision by maker';
    setPendingApprovals(prev => prev.filter(req => req.id !== rejectModalItem.id));
    setApprovalHistory(prev => [
      {
        ...rejectModalItem,
        status: 'REJECTED',
        checkerName: `${session.email.split('@')[0]} (${session.role})`,
        rejectionReason: reason
      },
      ...prev
    ]);
    setRejectModalItem(null);
    setRejectReasonText('');
    showToast(`✗ Rejected ${rejectModalItem.docNumber}. Logged to audit trail.`);
  };

  const booksTabs = [
    { id: 'all', label: 'All', badge: 48 },
    { id: 'sales', label: 'Sales', badge: 18 },
    { id: 'purchase', label: 'Purchases', badge: 14 },
    { id: 'receipt', label: 'Receipts', badge: 9 },
    { id: 'payment', label: 'Payouts', badge: 7 },
  ];

  const upiTabs = [
    { id: 'qr', label: 'Dynamic QR' },
    { id: 'collect', label: 'Collect Request' },
    { id: 'payout', label: 'Vendor Payout' },
    { id: 'vpa', label: 'VPA Directory' },
  ];

  const voucherList = [
    { id: 'v-1', number: 'INV-2026-089', type: 'sales', party: 'Tata Motors Fleet Ltd', amount: '₹ 4,50,000.00', date: 'Today, 11:30', status: 'PAID', irn: 'IRN-984210' },
    { id: 'v-2', number: 'BILL-2026-442', type: 'purchase', party: 'Jindal Steel & Power', amount: '₹ 6,25,000.00', date: 'Today, 09:15', status: 'UNPAID', irn: 'IRN-331092' },
    { id: 'v-3', number: 'REC-2026-112', type: 'receipt', party: 'Reliance Retail Ltd', amount: '₹ 1,85,000.00', date: 'Yesterday', status: 'CLEARED', irn: 'UPI-REF-889' },
    { id: 'v-4', number: 'PAY-2026-089', type: 'payment', party: 'Tata Steel Operations', amount: '₹ 6,50,000.00', date: 'Yesterday', status: 'PENDING_APPROVAL', irn: '4-EYES-REQ' },
    { id: 'v-5', number: 'INV-2026-088', type: 'sales', party: 'Adani Logistics Hub', amount: '₹ 2,75,000.00', date: '12 Sep', status: 'PAID', irn: 'IRN-776219' },
    { id: 'v-6', number: 'BILL-2026-441', type: 'purchase', party: 'Ultratech Cement Ltd', amount: '₹ 3,40,000.00', date: '11 Sep', status: 'OVERDUE', irn: 'IRN-102948' },
  ];

  const filteredVouchers = voucherList.filter((v) => {
    const matchesTab = booksTab === 'all' || v.type === booksTab;
    const matchesSearch =
      v.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={`w-full min-h-screen ${themeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans select-none pb-24`}>
      
      {/* Dynamic Native Top Bar */}
      <header className={`sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-md flex items-center justify-between ${themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md shadow-blue-600/30 text-sm">
            F
          </div>
          <div>
            <div className="text-xs font-black tracking-tight leading-none">FINSTAQ Mobile</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-0.5 tracking-wider">
              {session.tenantName || 'Apex Industries'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Push Notification Bell with live unread badge */}
          <button
            type="button"
            onClick={() => setIsNotifDrawerOpen(true)}
            className={`relative p-2 rounded-xl border transition cursor-pointer ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
            title="Push Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-xl border transition cursor-pointer ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-indigo-600'}`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Switch to Desktop */}
          <button
            type="button"
            onClick={onSwitchToDesktop}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold cursor-pointer"
          >
            Desktop
          </button>
        </div>
      </header>

      {/* Main Screen Content Body */}
      <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        
        {/* ================= TAB 1: PULSE (Dashboard) ================= */}
        {activeBottomNav === 'pulse' && (
          <div className="space-y-4">
            
            {/* PENDING APPROVALS ALERT BANNER (If any pending) */}
            {pendingApprovals.length > 0 && (
              <div
                onClick={() => setActiveBottomNav('approvals')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-lg shadow-rose-600/20 flex items-center justify-between cursor-pointer active:scale-[0.99] transition transform"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white/20 text-white shrink-0 animate-pulse">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-rose-100">
                      🚨 {pendingApprovals.length} Approvals Pending
                    </div>
                    <div className="text-xs font-bold mt-0.5">
                      ₹ {pendingApprovals.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')} requiring 4-Eyes Signoff
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white shrink-0" />
              </div>
            )}

            {/* Executive Analytics & BI Radar Banner */}
            <div
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition transform"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                    Executive 360° Analytics
                  </div>
                  <div className="text-xs font-black mt-0.5">
                    ₹ 8.45 Cr Revenue (YTD) • 17.6% Net Margin
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Liquid Cash & Bank Card */}
            <div
              onClick={() => setIsBankBreakdownOpen(true)}
              className="p-5 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/25 cursor-pointer active:scale-[0.99] transition transform"
            >
              <div className="flex justify-between items-center text-xs text-blue-100 font-bold uppercase tracking-wider">
                <span>Total Liquid Cash & Bank</span>
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px]">
                  ✓ Reconciled
                </span>
              </div>
              <div className="text-3xl font-black mt-2 tracking-tight">₹ 1,42,85,400.00</div>
              <div className="mt-4 pt-3 border-t border-white/20 flex justify-between text-xs text-blue-100">
                <span>HDFC: ₹ 84.50 L</span>
                <span>ICICI: ₹ 58.35 L</span>
              </div>
            </div>

            {/* Overdue Interest Alert Banner */}
            <div
              onClick={() => setIsInterestModalOpen(true)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black">Overdue Interest Radar</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    ₹ 84,250 accrued @18% p.a. on 3 overdue parties
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Today's UPI Inflow / Outflow Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => { setActiveBottomNav('upi'); setUpiSubTab('qr'); }}
                className={`p-3.5 rounded-2xl border cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-500">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>UPI INFLOW</span>
                </div>
                <div className="text-lg font-black mt-1 text-emerald-600 dark:text-emerald-400">₹ 3,45,000</div>
                <div className="text-[10px] text-slate-400">12 Collections</div>
              </div>

              <div
                onClick={() => { setActiveBottomNav('upi'); setUpiSubTab('payout'); }}
                className={`p-3.5 rounded-2xl border cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-rose-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>UPI OUTFLOW</span>
                </div>
                <div className="text-lg font-black mt-1 text-rose-600 dark:text-rose-400">₹ 1,82,000</div>
                <div className="text-[10px] text-slate-400">4 Supplier Payouts</div>
              </div>
            </div>

            {/* 1-Tap Quick Actions Bar */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setActiveBottomNav('upi'); setUpiSubTab('qr'); }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer active:scale-95 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">UPI Collect</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickInvoiceOpen(true)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer active:scale-95 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">GST Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickExpenseOpen(true)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer active:scale-95 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="p-2 rounded-xl bg-amber-600 text-white shadow-sm">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Expense</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPayrollModalOpen(true)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer active:scale-95 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Attendance</span>
              </button>
            </div>

            {/* Recent Activity List */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase text-slate-400">Live Operations Feed</span>
                <button
                  type="button"
                  onClick={() => setActiveBottomNav('books')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400"
                >
                  View All
                </button>
              </div>

              {voucherList.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVoucher(v)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${v.type === 'sales' ? 'bg-blue-500/10 text-blue-500' : v.type === 'purchase' ? 'bg-purple-500/10 text-purple-500' : v.type === 'payment' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black">{v.party}</div>
                      <div className="text-[10px] text-slate-400">{v.number} • {v.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black">{v.amount}</div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${v.status === 'PAID' || v.status === 'CLEARED' ? 'bg-emerald-500/15 text-emerald-600' : v.status === 'PENDING_APPROVAL' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600'}`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BOOKS (Registers) ================= */}
        {activeBottomNav === 'books' && (
          <div className="space-y-3">
            {/* StandardTabs Pill Filter */}
            <StandardTabs
              tabs={booksTabs}
              activeTab={booksTab}
              onChange={setBooksTab}
              size="sm"
            />

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search party or voucher #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none font-medium ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
              />
            </div>

            {/* Vouchers Register List */}
            <div className="space-y-2.5 pt-1">
              {filteredVouchers.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVoucher(v)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${v.type === 'sales' ? 'bg-blue-500/10 text-blue-500' : v.type === 'purchase' ? 'bg-purple-500/10 text-purple-500' : v.type === 'payment' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black">{v.party}</div>
                      <div className="text-[10px] text-slate-400">{v.number} • {v.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black">{v.amount}</div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${v.status === 'PAID' || v.status === 'CLEARED' ? 'bg-emerald-500/15 text-emerald-600' : v.status === 'PENDING_APPROVAL' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600'}`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: UPI HUB ================= */}
        {activeBottomNav === 'upi' && (
          <div className="space-y-4">
            <StandardTabs
              tabs={upiTabs}
              activeTab={upiSubTab}
              onChange={setUpiSubTab}
              size="sm"
            />

            {upiSubTab === 'qr' && (
              <div className={`p-5 rounded-3xl border flex flex-col items-center text-center space-y-4 shadow-sm ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiVpa}%26pn=Apex%20Industries%26am=${upiAmount}%26cu=INR%26tn=${upiInvoice}`}
                    alt="Dynamic UPI QR"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <div className="w-full space-y-2">
                  <div className="text-xl font-black">₹ {parseFloat(upiAmount || '0').toLocaleString('en-IN')}.00</div>
                  <div className="text-xs text-slate-400">{upiInvoice} • {upiVpa}</div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('✓ UPI Payment Link copied to clipboard')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('✓ Dynamic UPI QR Invoice sent via WhatsApp')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {upiSubTab === 'collect' && (
              <div className={`p-4 rounded-3xl border space-y-3.5 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-black uppercase text-slate-400">Initiate Instant UPI Collect</div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Customer UPI VPA</label>
                  <input
                    type="text"
                    defaultValue="buyer@okhdfcbank"
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-medium outline-none ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Amount (INR)</label>
                  <input
                    type="number"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-black outline-none ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => showToast('✓ UPI Collect Mandate Sent to Customer VPA')}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  Send UPI Payment Request
                </button>
              </div>
            )}

            {upiSubTab === 'payout' && (
              <div className={`p-4 rounded-3xl border space-y-3.5 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-black uppercase text-slate-400">Vendor Instant UPI Payout</div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Select Verified Vendor VPA</label>
                  <select
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-medium outline-none ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option>tatasteel@hdfcbank (Verified Vendor)</option>
                    <option>jindalpower@icici (Verified Vendor)</option>
                    <option>relianceops@axisbank (Verified Vendor)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">Payout Amount (INR)</label>
                  <input
                    type="number"
                    defaultValue="65000"
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-black outline-none ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => showToast('✓ Vendor Payout Transferred & Payment Voucher Created')}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  Authorize Instant UPI Payout
                </button>
              </div>
            )}

            {upiSubTab === 'vpa' && (
              <div className="space-y-2">
                {[
                  { name: 'Tata Steel Limited', vpa: 'tatasteel@hdfcbank', status: 'NPCI VERIFIED' },
                  { name: 'Jindal Steel & Power', vpa: 'jindalpower@icici', status: 'NPCI VERIFIED' },
                  { name: 'Apex Logistics Hub', vpa: 'apexlogistics@kotak', status: 'NPCI VERIFIED' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                  >
                    <div>
                      <div className="text-xs font-black">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.vpa}</div>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: APPROVALS (Maker-Checker 4-Eyes) ================= */}
        {activeBottomNav === 'approvals' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black tracking-tight">Maker-Checker Authorization</h3>
                <p className="text-[10px] text-slate-400">4-Eyes Governance & High-Value Vouchers</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600/15 text-blue-600">
                {pendingApprovals.length} Pending
              </span>
            </div>

            <StandardTabs
              tabs={[
                { id: 'pending' as const, label: 'Pending Action', badge: pendingApprovals.length },
                { id: 'history' as const, label: 'Audit Log', badge: approvalHistory.length },
              ]}
              activeTab={approvalTab}
              onChange={(t) => setApprovalTab(t as any)}
              size="sm"
            />

            {approvalTab === 'pending' ? (
              pendingApprovals.length === 0 ? (
                <div className={`p-8 rounded-3xl border text-center space-y-2 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="text-xs font-black">Zero Pending Approvals</div>
                  <div className="text-[11px] text-slate-400">All high-value vouchers and overrides are authorized</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 rounded-3xl border space-y-3 shadow-xs ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 uppercase">
                            {req.docType}
                          </span>
                          <div className="text-xs font-black mt-1">{req.docTitle}</div>
                          <div className="text-[10px] text-slate-400">{req.docNumber} • {req.createdAt}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            ₹ {req.amount.toLocaleString('en-IN')}.00
                          </div>
                          <div className="text-[9px] text-slate-400">Maker: {req.makerName}</div>
                        </div>
                      </div>

                      {/* 4-Eyes Trigger Reason Card */}
                      <div className={`p-2.5 rounded-xl border flex items-center space-x-2 text-[11px] ${themeMode === 'dark' ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-medium">{req.reason}</span>
                      </div>

                      {/* 1-Tap Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setRejectModalItem(req)}
                          className="py-2.5 rounded-xl border border-rose-500/30 text-rose-600 font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve (4-Eyes)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {approvalHistory.map((hist) => (
                  <div
                    key={hist.id}
                    className={`p-3.5 rounded-2xl border space-y-1.5 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black">{hist.docNumber}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${hist.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}>
                        {hist.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ₹ {hist.amount.toLocaleString('en-IN')}.00
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {hist.reason || hist.rejectionReason} • Checker: {hist.checkerName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: MORE (Compliance & Hubs) ================= */}
        {activeBottomNav === 'more' && (
          <div className="space-y-3">
            <div className="text-xs font-black uppercase text-slate-400 px-1">Governance & Approvals</div>
            <div
              onClick={() => setActiveBottomNav('approvals')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black">Maker-Checker Approvals Hub</div>
                  <div className="text-[10px] text-slate-400">{pendingApprovals.length} Vouchers Pending Signoff</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="text-xs font-black uppercase text-slate-400 px-1 pt-2">Compliance & Operations</div>
            
            {/* TCS 206C(1H) Card */}
            <div
              onClick={() => setIsTcsModalOpen(true)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black">TCS 206C(1H) & Form 27EQ</div>
                  <div className="text-[10px] text-slate-400">₹ 50L threshold tracker & quarterly return</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* PDC & Memoranda Registry */}
            <div
              onClick={() => setIsPdcModalOpen(true)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black">PDC & Memoranda Registry</div>
                  <div className="text-[10px] text-slate-400">Post-dated cheques & maturity alerts</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Job Work & ITC-04 */}
            <div
              onClick={() => setIsJobWorkModalOpen(true)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black">Job Work & GST Form ITC-04</div>
                  <div className="text-[10px] text-slate-400">Section 143 subcontracting challans</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* HR & Indian Payroll */}
            <div
              onClick={() => setIsPayrollModalOpen(true)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black">HR & Indian Payroll Engine</div>
                  <div className="text-[10px] text-slate-400">EPF / ESIC opt-out, attendance & CTC</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Sign Out Card */}
            <div
              onClick={onLogout}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${themeMode === 'dark' ? 'bg-rose-950/20 border-rose-900/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'}`}
            >
              <div className="text-xs font-black">Sign Out ({session.email})</div>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </main>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-lg px-3 py-2 flex items-center justify-around ${themeMode === 'dark' ? 'bg-slate-900/95 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-600'}`}>
        <button
          type="button"
          onClick={() => setActiveBottomNav('pulse')}
          className={`flex flex-col items-center space-y-1 transition cursor-pointer ${activeBottomNav === 'pulse' ? 'text-blue-600 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Pulse</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomNav('books')}
          className={`flex flex-col items-center space-y-1 transition cursor-pointer ${activeBottomNav === 'books' ? 'text-blue-600 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Books</span>
        </button>

        {/* Center Floating Action Button (+) */}
        <button
          type="button"
          onClick={() => setIsFabModalOpen(true)}
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition transform cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomNav('approvals')}
          className={`flex flex-col items-center space-y-1 relative transition cursor-pointer ${activeBottomNav === 'approvals' ? 'text-blue-600 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px]">Approvals</span>
          {pendingApprovals.length > 0 && (
            <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomNav('more')}
          className={`flex flex-col items-center space-y-1 transition cursor-pointer ${activeBottomNav === 'more' ? 'text-blue-600 font-bold' : 'hover:text-slate-900 dark:hover:text-white'}`}
        >
          <Building className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* ================= PUSH NOTIFICATIONS DRAWER / MODAL ================= */}
      {isNotifDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
          <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col ${themeMode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-black">Push Notifications ({notifications.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={markAllNotifsRead}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  Mark All Read
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotifDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Test Simulated Push Button */}
            <button
              type="button"
              onClick={triggerSimulatedPush}
              className="w-full py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Real-Time Push Notification</span>
            </button>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotifRead(n.id);
                    if (n.category === 'approval') {
                      setIsNotifDrawerOpen(false);
                      setActiveBottomNav('approvals');
                    } else if (n.category === 'upi') {
                      setIsNotifDrawerOpen(false);
                      setActiveBottomNav('upi');
                    }
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${!n.isRead ? (themeMode === 'dark' ? 'bg-blue-950/20 border-blue-800/40' : 'bg-blue-50/70 border-blue-200') : (themeMode === 'dark' ? 'bg-slate-800/50 border-slate-800 opacity-70' : 'bg-slate-50 border-slate-200 opacity-70')}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-black">{n.title}</div>
                    <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{n.message}</div>
                  {!n.isRead && (
                    <div className="mt-2 flex items-center space-x-1 text-[9px] font-bold text-blue-600">
                      <span>Tap to inspect & take action</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT REASON MODAL ================= */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 space-y-4 ${themeMode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="text-sm font-black">Reject {rejectModalItem.docNumber}</div>
            <p className="text-xs text-slate-400">Please provide a mandatory audit rejection reason for the maker:</p>
            <textarea
              rows={3}
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              placeholder="e.g. Unit rate variance with PO #PO-2026-112 or unverified bank details"
              className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FAB QUICK ACTION SHEET ================= */}
      {isFabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-0 sm:p-4 sm:justify-center sm:items-center">
          <div className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 ${themeMode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-black">Quick Financial Actions</span>
              <button onClick={() => setIsFabModalOpen(false)} className="p-1 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setIsFabModalOpen(false); setActiveBottomNav('upi'); setUpiSubTab('qr'); }}
                className="p-4 rounded-2xl bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex flex-col items-center space-y-2 cursor-pointer font-bold text-xs"
              >
                <QrCode className="w-6 h-6" />
                <span>Dynamic UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsFabModalOpen(false); setIsQuickInvoiceOpen(true); }}
                className="p-4 rounded-2xl bg-indigo-600/10 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex flex-col items-center space-y-2 cursor-pointer font-bold text-xs"
              >
                <FileText className="w-6 h-6" />
                <span>GST Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsFabModalOpen(false); setIsQuickExpenseOpen(true); }}
                className="p-4 rounded-2xl bg-amber-600/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex flex-col items-center space-y-2 cursor-pointer font-bold text-xs"
              >
                <Receipt className="w-6 h-6" />
                <span>Record Expense</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsFabModalOpen(false); setActiveBottomNav('approvals'); }}
                className="p-4 rounded-2xl bg-rose-600/10 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex flex-col items-center space-y-2 cursor-pointer font-bold text-xs"
              >
                <UserCheck className="w-6 h-6" />
                <span>Pending Approvals</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VOUCHER DETAIL MODAL ================= */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-0 sm:p-4 sm:justify-center sm:items-center">
          <div className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 ${themeMode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-sm font-black">{selectedVoucher.number}</div>
                <div className="text-[10px] text-slate-400">{selectedVoucher.party}</div>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="p-1 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Voucher Amount:</span>
                <span className="font-black text-sm">{selectedVoucher.amount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">IRN / Reference:</span>
                <span className="font-mono text-[11px] font-bold">{selectedVoucher.irn}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="font-black text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500">
                  {selectedVoucher.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setSelectedVoucher(null); showToast(`✓ Shared ${selectedVoucher.number} via WhatsApp`); }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share PDF Invoice on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= EXECUTIVE ANALYTICS MODAL ================= */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
          <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[88vh] flex flex-col ${themeMode === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black">Executive Business Analytics</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {/* Core Financial Run Rate */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[10px] font-bold text-blue-600 uppercase">Net Revenue (YTD)</div>
                  <div className="text-base font-black mt-0.5">₹ 8.45 Cr</div>
                  <div className="text-[9px] text-emerald-500 font-bold">+18.7% YoY Growth</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Net Profit (EAT)</div>
                  <div className="text-base font-black mt-0.5">₹ 1.48 Cr</div>
                  <div className="text-[9px] text-emerald-500 font-bold">17.6% Net Margin</div>
                </div>
              </div>

              {/* Working Capital Radar */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs font-black uppercase text-slate-400">Working Capital & Collections</div>
                <div className="flex justify-between text-xs">
                  <span>Days Sales Outstanding (DSO):</span>
                  <span className="font-black text-emerald-600">38 Days (Fast)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Cash Runway:</span>
                  <span className="font-black text-blue-600">4.4 Months</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Inventory Turnover:</span>
                  <span className="font-black">6.8x / Year</span>
                </div>
              </div>

              {/* AI Strategic Insights */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-black text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Profitability Radar</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Gross margin on Precision Gearboxes expanded by <strong>+4.2%</strong> due to favorable steel contracts. Auto-levying 0.1% TCS is active for 2 parties exceeding ₹50L.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST BANNER ================= */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
