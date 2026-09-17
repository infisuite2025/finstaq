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
  Bell,
  UserCheck,
  CheckCircle2,
  X,
  Check,
  AlertTriangle,
  Building
} from 'lucide-react';
import { StandardTabs } from '../common/StandardTabs';

export function MobileAppSimulator() {
  const [deviceTheme, setDeviceTheme] = useState<'light' | 'dark'>('light');
  const [activeBottomNav, setActiveBottomNav] = useState<'pulse' | 'books' | 'upi' | 'approvals' | 'more'>('pulse');
  const [booksTab, setBooksTab] = useState('all');
  const [approvalTab, setApprovalTab] = useState<'pending' | 'history'>('pending');
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState('14500');
  const [upiInvoice, setUpiInvoice] = useState('INV-2026-089');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'APR-2026-089',
      docType: 'PAYMENT',
      docTitle: 'Supplier Payout (Tata Steel)',
      docNumber: 'PAY-2026-089',
      amount: 650000.0,
      maker: 'Ramesh Patel',
      reason: 'High-Value Payment > ₹5,00,000 threshold'
    },
    {
      id: 'APR-2026-090',
      docType: 'PURCHASE',
      docTitle: 'Raw Material Bill',
      docNumber: 'BILL-2026-442',
      amount: 420000.0,
      maker: 'Ramesh Patel',
      reason: 'GRN Qty Match Variance exceeds 2%'
    },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 'n-1', title: '🚨 High-Value Payout Pending', msg: 'PAY-2026-089 of ₹6.50L requires 4-Eyes signoff', read: false },
    { id: 'n-2', title: '💰 UPI Payment Received', msg: '₹45,000 received from Apex Retail via UPI', read: false },
    { id: 'n-3', title: '⏰ PDC Cheque Maturing', msg: 'Cheque #884210 of ₹2.10L due today at HDFC', read: true },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApprove = (id: string, num: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    showToast(`✓ Authorized ${num} via 4-Eyes Signoff`);
  };

  const handleReject = (id: string, num: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    showToast(`✗ Rejected ${num}. Reason logged to audit log.`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const booksTabs = [
    { id: 'all', label: 'All', badge: 48 },
    { id: 'sales', label: 'Sales', badge: 18 },
    { id: 'purchase', label: 'Purchases', badge: 14 },
    { id: 'receipt', label: 'Receipts', badge: 9 },
    { id: 'payment', label: 'Payouts', badge: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Device Config Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                FINSTAQ Mobile Flutter Simulator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive preview with Push Notifications, 4-Eyes Approvals Hub, and Live UPI Generator
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDeviceTheme(deviceTheme === 'light' ? 'dark' : 'light')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {deviceTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{deviceTheme === 'dark' ? 'Light Device Mode' : 'Dark Device Mode'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Presentation Area */}
      <div className="flex justify-center py-6">
        {/* Mobile Phone Mockup Frame */}
        <div className={'w-[390px] h-[780px] rounded-[48px] p-3.5 shadow-2xl border-4 ' + (deviceTheme === 'dark' ? 'bg-slate-950 border-slate-800 shadow-blue-950/40' : 'bg-slate-900 border-slate-300 shadow-slate-400/30') + ' flex flex-col relative overflow-hidden transition-colors'}>
          
          {/* Top Dynamic Island / Speaker Notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950/60 border border-blue-600/30"></div>
          </div>

          {/* Device Screen Interior */}
          <div className={'flex-1 rounded-[38px] flex flex-col overflow-hidden relative ' + (deviceTheme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900')}>
            
            {/* Screen Header Bar */}
            <div className={'pt-9 pb-3 px-4 border-b flex items-center justify-between ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  F
                </div>
                <div>
                  <div className="text-xs font-extrabold leading-none">Apex Industries</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">FY 2026-27 • Live Core</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-black text-[8px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <span className="text-[10px] font-bold text-slate-400">14:30</span>
              </div>
            </div>

            {/* Notifications Dropdown inside phone */}
            {isNotifOpen && (
              <div className={'p-3 border-b space-y-2 ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/90 border-blue-200')}>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>Push Notifications</span>
                  <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-blue-600">Mark Read</button>
                </div>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsNotifOpen(false);
                      if (n.title.includes('Payout')) setActiveBottomNav('approvals');
                    }}
                    className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 text-[10px] cursor-pointer"
                  >
                    <div className="font-bold">{n.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[9px]">{n.msg}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Main Screen Body Container */}
            <div className="flex-1 overflow-y-auto pb-24 p-3.5 space-y-3">
              
              {/* TAB 1: PULSE (Dashboard) */}
              {activeBottomNav === 'pulse' && (
                <div className="space-y-3.5">
                  
                  {/* Approvals Pending Card */}
                  {pendingApprovals.length > 0 && (
                    <div
                      onClick={() => setActiveBottomNav('approvals')}
                      className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-white" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
                            🚨 {pendingApprovals.length} Approvals Pending
                          </div>
                          <div className="text-xs font-black">₹ 10.70 Lakhs for 4-Eyes Signoff</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}

                  {/* Liquid Cash Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
                    <div className="flex justify-between items-center text-[10px] text-blue-100 font-bold tracking-wider uppercase">
                      <span>Total Liquid Cash & Bank</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">Reconciled</span>
                    </div>
                    <div className="text-2xl font-black mt-1 tracking-tight">₹ 1,42,85,400.00</div>
                    <div className="mt-3 pt-2.5 border-t border-white/20 flex justify-between text-[10px] text-blue-100 font-medium">
                      <span>HDFC: ₹ 84.50 L</span>
                      <span>ICICI: ₹ 58.35 L</span>
                    </div>
                  </div>

                  {/* Overdue Interest Banner */}
                  <div className={'p-3 rounded-xl border flex items-center space-x-3 ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">Overdue Interest Radar</div>
                      <div className="text-[10px] text-slate-400">₹ 84,250 accrued @18% p.a.</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Today's UPI Inflow / Outflow */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className={'p-3 rounded-xl border ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-500">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>UPI INFLOW</span>
                      </div>
                      <div className="text-sm font-black mt-1 text-emerald-600 dark:text-emerald-400">₹ 3,45,000</div>
                      <div className="text-[9px] text-slate-400">12 Collections</div>
                    </div>
                    <div className={'p-3 rounded-xl border ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-rose-500">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>UPI OUTFLOW</span>
                      </div>
                      <div className="text-sm font-black mt-1 text-rose-600 dark:text-rose-400">₹ 1,82,000</div>
                      <div className="text-[9px] text-slate-400">4 Supplier Payouts</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BOOKS */}
              {activeBottomNav === 'books' && (
                <div className="space-y-3">
                  <StandardTabs
                    tabs={booksTabs}
                    activeTab={booksTab}
                    onChange={setBooksTab}
                    size="sm"
                  />
                  <div className="space-y-2">
                    {[
                      { party: 'Tata Motors Fleet Ltd', num: 'INV-2026-089', amt: '₹ 4,50,000.00', status: 'PAID' },
                      { party: 'Jindal Steel & Power', num: 'BILL-2026-442', amt: '₹ 6,25,000.00', status: 'UNPAID' },
                      { party: 'Reliance Retail Ltd', num: 'REC-2026-112', amt: '₹ 1,85,000.00', status: 'CLEARED' },
                      { party: 'Tata Steel Operations', num: 'PAY-2026-089', amt: '₹ 6,50,000.00', status: 'PENDING' },
                    ].map((v, idx) => (
                      <div key={idx} className={'p-3 rounded-xl border flex justify-between items-center ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
                        <div>
                          <div className="text-xs font-bold">{v.party}</div>
                          <div className="text-[10px] text-slate-400">{v.num}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black">{v.amt}</div>
                          <span className="text-[9px] font-bold text-blue-600">{v.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: UPI */}
              {activeBottomNav === 'upi' && (
                <div className="space-y-3.5">
                  <div className={'p-4 rounded-2xl border text-center space-y-3 ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
                    <div className="p-3 bg-white rounded-xl inline-block shadow-xs">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=apexindustries@hdfcbank%26pn=Apex%20Industries%26am=${upiAmount}%26cu=INR%26tn=${upiInvoice}`}
                        alt="UPI QR"
                        className="w-28 h-28 object-contain"
                      />
                    </div>
                    <div className="text-sm font-black">₹ {parseFloat(upiAmount || '0').toLocaleString('en-IN')}.00</div>
                    <button
                      onClick={() => showToast('✓ Dynamic UPI QR Link Shared')}
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Share on WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: APPROVALS */}
              {activeBottomNav === 'approvals' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black">Maker-Checker Hub</span>
                    <span className="text-[10px] font-bold text-rose-500">{pendingApprovals.length} Pending</span>
                  </div>

                  {pendingApprovals.length === 0 ? (
                    <div className="p-6 text-center space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div className="text-xs font-bold">All Vouchers Authorized</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingApprovals.map((item) => (
                        <div key={item.id} className={'p-3 rounded-2xl border space-y-2 ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold">{item.docTitle}</div>
                              <div className="text-[10px] text-slate-400">{item.docNumber}</div>
                            </div>
                            <div className="text-xs font-black">₹ {item.amount.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="text-[10px] text-amber-500 font-medium">{item.reason}</div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleReject(item.id, item.docNumber)}
                              className="py-1.5 rounded-lg border border-rose-500 text-rose-500 font-bold text-[11px]"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(item.id, item.docNumber)}
                              className="py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: MORE */}
              {activeBottomNav === 'more' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Enterprise Modules</div>
                  {[
                    { label: 'Maker-Checker Approvals', icon: UserCheck, desc: '4-Eyes Governance' },
                    { label: 'TCS 206C(1H) & Form 27EQ', icon: ShieldCheck, desc: '₹50L threshold tracker' },
                    { label: 'PDC & Memoranda Registry', icon: Clock, desc: 'Cheque maturities' },
                    { label: 'Job Work & ITC-04', icon: Truck, desc: 'Section 143 challans' },
                    { label: 'HR & Statutory Payroll', icon: Users, desc: 'EPF / ESIC opt-out & CTC' },
                  ].map((m, idx) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (m.label.includes('Approvals')) setActiveBottomNav('approvals');
                        }}
                        className={'p-3 rounded-xl border flex items-center justify-between cursor-pointer ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-xs font-bold">{m.label}</div>
                            <div className="text-[9px] text-slate-400">{m.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Nav */}
            <div className={'absolute bottom-0 left-0 right-0 py-2.5 px-3 border-t flex justify-around items-center ' + (deviceTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')}>
              <button onClick={() => setActiveBottomNav('pulse')} className={activeBottomNav === 'pulse' ? 'text-blue-600 font-bold' : ''}>
                <TrendingUp className="w-4 h-4 mx-auto" />
                <span className="text-[9px]">Pulse</span>
              </button>
              <button onClick={() => setActiveBottomNav('books')} className={activeBottomNav === 'books' ? 'text-blue-600 font-bold' : ''}>
                <FileText className="w-4 h-4 mx-auto" />
                <span className="text-[9px]">Books</span>
              </button>
              <button onClick={() => setActiveBottomNav('approvals')} className={'relative ' + (activeBottomNav === 'approvals' ? 'text-blue-600 font-bold' : '')}>
                <UserCheck className="w-4 h-4 mx-auto" />
                <span className="text-[9px]">Approvals</span>
                {pendingApprovals.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                )}
              </button>
              <button onClick={() => setActiveBottomNav('more')} className={activeBottomNav === 'more' ? 'text-blue-600 font-bold' : ''}>
                <Building className="w-4 h-4 mx-auto" />
                <span className="text-[9px]">More</span>
              </button>
            </div>

            {/* Toast */}
            {toastMsg && (
              <div className="absolute bottom-16 left-4 right-4 p-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold text-center border border-slate-700 shadow-xl">
                {toastMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
