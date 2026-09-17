import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { AuthProvider, AuthSession } from './context/AuthContext';
import { NotificationCenterDrawer } from './components/common/NotificationCenterDrawer';
import { SessionTimeoutModal } from './components/common/SessionTimeoutModal';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { LoginScreen } from './components/auth/LoginScreen';

import { VoucherEntryScreen } from './components/voucher/VoucherEntryScreen';
import { DocumentReviewScreen } from './components/document/DocumentReviewScreen';
import { PurchaseDashboard } from './components/purchase/PurchaseDashboard';
import { PurchaseReportsWorkspace } from './components/reports/purchase/PurchaseReportsWorkspace';
import { SalesDashboard } from './components/sales/SalesDashboard';
import { SalesReportsWorkspace } from './components/reports/sales/SalesReportsWorkspace';
import { AccountingReportsWorkspace } from './components/reports/accounting/AccountingReportsWorkspace';
import { MastersHub } from './components/masters/MastersHub';
import { SettingsHub } from './components/settings/SettingsHub';
import { CommunicationHub } from './components/communication/CommunicationHub';
import { AuditTrailWorkspace } from './components/audit/AuditTrailWorkspace';
import { InventoryHub } from './components/inventory/InventoryHub';
import { DebitCreditNotesWorkspace } from './components/notes/DebitCreditNotesWorkspace';
import { ApprovalCenter } from './components/approvals/ApprovalCenter';
import { PeriodLockWorkspace } from './components/period-lock/PeriodLockWorkspace';
import { FinancialPeriodHub } from './components/closing/FinancialPeriodHub';
import { HelpGenieDrawer } from './components/genie/HelpGenieDrawer';
import { SuperAdminHub } from './components/super-admin/SuperAdminHub';
import { SuspendedTenantScreen } from './components/auth/SuspendedTenantScreen';
import { BankReconciliationWorkspace } from './components/banking/BankReconciliationWorkspace';
import { StatutoryComplianceHub } from './components/compliance/StatutoryComplianceHub';
import { ManufacturingBOMWorkspace } from './components/inventory/ManufacturingBOMWorkspace';
import { ForexManagementWorkspace } from './components/forex/ForexManagementWorkspace';
import { ChequeManagementWorkspace } from './components/banking/ChequeManagementWorkspace';
import { CostCenterWorkspace } from './components/cost-center/CostCenterWorkspace';
import { PayrollWorkspace } from './components/payroll/PayrollWorkspace';
import { UpiPaymentsWorkspace } from './components/upi/UpiPaymentsWorkspace';
import { PdcMemorandaWorkspace } from './components/pdc/PdcMemorandaWorkspace';
import { InterestCalculationWorkspace } from './components/interest/InterestCalculationWorkspace';
import { JobWorkWorkspace } from './components/jobwork/JobWorkWorkspace';
import { MobileAppSimulator } from './components/mobile/MobileAppSimulator';
import { MobileAppView } from './components/mobile/MobileAppView';
import { ExecutiveAnalyticsWorkspace } from './components/analytics/ExecutiveAnalyticsWorkspace';
import { HRWorkspace } from './components/hr/HRWorkspace';
import { StorageVaultWorkspace } from './components/storage/StorageVaultWorkspace';
import {
  Keyboard,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  ShoppingBag,
  TrendingUp,
  BookOpen,
  Settings,
  FileSpreadsheet,
  BarChart2,
  Scale,
  ChevronLeft,
  ChevronRight,
  Building,
  Send,
  ShieldCheck,
  Boxes,
  FileDiff,
  UserCheck,
  Lock,
  Calendar,
  Globe,
  Landmark,
  Factory,
  Coins,
  CreditCard,
  Layers,
  Users,
  QrCode,
  Clock,
  Percent,
  Truck,
  Smartphone,
  HardDrive,
  FileText,
  DollarSign,
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

type TabType =
  | 'super-admin'
  | 'analytics'
  | 'masters'
  | 'voucher'
  | 'banking'
  | 'cheques'
  | 'upi'
  | 'pdc'
  | 'interest'
  | 'cost-centers'
  | 'forex'
  | 'compliance'
  | 'financial-reports'
  | 'financial-periods'
  | 'notes'
  | 'procurement'
  | 'manufacturing'
  | 'jobwork'
  | 'inventory'
  | 'purchase-reports'
  | 'hr-directory'
  | 'hr-offers'
  | 'hr-lifecycle'
  | 'payroll-run'
  | 'payroll-loans'
  | 'payroll-compliance'
  | 'payroll'
  | 'sales'
  | 'sales-reports'
  | 'communication'
  | 'audit-trail'
  | 'approvals'
  | 'period-lock'
  | 'document'
  | 'mobile'
  | 'storage'
  | 'settings';

function MainWorkspace({
  session,
  onLogout,
}: {
  session: AuthSession;
  onLogout: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>(
    session.role === 'SUPER_ADMIN' ? 'super-admin' : 'financial-periods'
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isGenieOpen, setIsGenieOpen] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [forceDesktopMode, setForceDesktopMode] = useState<boolean>(false);

  // Auto-detect mobile screen resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K or Shift+? to trigger Help Genie
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGenieOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // On Mobile Viewports (< 768px), seamlessly render the Native Mobile App Experience
  if (isMobileScreen && !forceDesktopMode) {
    return (
      <MobileAppView
        session={session}
        onLogout={onLogout}
        onSwitchToDesktop={() => setForceDesktopMode(true)}
      />
    );
  }

  interface NavItem {

    id: TabType;
    label: string;
    icon: any;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  // Strict Tenant Privacy: Super Admin only sees SaaS Management & Platform Billing, zero tenant private data
  const navSections: NavSection[] = session.role === 'SUPER_ADMIN' ? [
    {
      title: 'PLATFORM OWNER',
      items: [
        { id: 'super-admin' as TabType, label: 'Platform Control Center', icon: Globe, badge: 'SaaS Hub' },
      ],
    },
    {
      title: 'PLATFORM GOVERNANCE',
      items: [
        { id: 'settings' as TabType, label: 'Security & Access Keys', icon: Settings, badge: 'SOC 2' },
      ],
    },
  ] : [

    {
      title: 'EXECUTIVE & BI',
      items: [
        { id: 'analytics' as TabType, label: 'Executive Analytics 360°', icon: BarChart2, badge: 'Live 360°' },
      ],
    },
    {
      title: 'FINANCIAL ACCOUNTING',
      items: [
        { id: 'voucher' as TabType, label: 'Voucher Matrix', icon: Keyboard, badge: 'F4–F9' },
        { id: 'notes' as TabType, label: 'Debit & Credit Notes', icon: FileDiff, badge: 'Sec 34' },
        { id: 'cost-centers' as TabType, label: 'Cost Centers & P&L', icon: Layers, badge: 'P&L Matrix' },
        { id: 'financial-reports' as TabType, label: 'Financial Statements', icon: Scale, badge: 'Sched III' },
        { id: 'financial-periods' as TabType, label: 'Periods & Year-End', icon: Calendar, badge: 'Closing' },
      ],
    },
    {
      title: 'BANKING & TREASURY',
      items: [
        { id: 'banking' as TabType, label: 'Bank Reconciliation (BRS)', icon: Landmark, badge: 'Auto-Match' },
        { id: 'cheques' as TabType, label: 'Cheque & Print Hub', icon: CreditCard, badge: 'CTS-2010' },
        { id: 'upi' as TabType, label: 'UPI QR & Collections', icon: QrCode, badge: 'NPCI / QR' },
        { id: 'pdc' as TabType, label: 'PDC & Memoranda', icon: Clock, badge: 'Maturity' },
        { id: 'interest' as TabType, label: 'Interest Engine (18%)', icon: Percent, badge: 'MSME' },
        { id: 'forex' as TabType, label: 'Multi-Currency Forex', icon: Coins, badge: 'AS 11' },
      ],
    },
    {
      title: 'PROCUREMENT & STORES',
      items: [
        { id: 'procurement' as TabType, label: 'Purchase Operations', icon: ShoppingBag, badge: '3-Way' },
        { id: 'inventory' as TabType, label: 'Stores & Godowns', icon: Boxes, badge: 'FIFO' },
        { id: 'manufacturing' as TabType, label: 'Manufacturing & BOM', icon: Factory, badge: 'Assembly' },
        { id: 'jobwork' as TabType, label: 'Job Work Subcontracting', icon: Truck, badge: 'ITC-04' },
        { id: 'purchase-reports' as TabType, label: 'Purchase Reports', icon: FileSpreadsheet, badge: 'Registers' },
      ],
    },
    {
      title: 'SALES & REVENUE',
      items: [
        { id: 'sales' as TabType, label: 'Sales Operations', icon: TrendingUp, badge: 'Orders' },
        { id: 'sales-reports' as TabType, label: 'Sales & Debtors Ageing', icon: BarChart2, badge: 'Ageing' },
      ],
    },
    {
      title: 'HUMAN RESOURCES (HR)',
      items: [
        { id: 'hr-directory' as TabType, label: 'Employee Directory 360°', icon: Users, badge: 'Profiles' },
        { id: 'hr-offers' as TabType, label: 'Offer Letters & Onboarding', icon: FileText, badge: 'CTC Annex A' },
        { id: 'hr-lifecycle' as TabType, label: 'Appraisals & F&F Exit Hub', icon: TrendingUp, badge: 'Lifecycle' },
      ],
    },
    {
      title: 'PAYROLL & COMPENSATION',
      items: [
        { id: 'payroll-run' as TabType, label: 'Payroll Run & Register', icon: DollarSign, badge: 'EPF/ESIC' },
        { id: 'payroll-loans' as TabType, label: 'Staff Loans & Advances', icon: CreditCard, badge: 'EMI Master' },
        { id: 'payroll-compliance' as TabType, label: 'Statutory Returns & ECR', icon: ShieldCheck, badge: 'ECR / 24Q' },
      ],
    },
    {
      title: 'STATUTORY, TAX & AUDIT',
      items: [
        { id: 'compliance' as TabType, label: 'Statutory & Tax Hub', icon: ShieldCheck, badge: 'GST/TDS' },
        { id: 'audit-trail' as TabType, label: 'Audit Trail & Edit Log', icon: ShieldCheck, badge: 'MCA 2024' },
      ],
    },
    {
      title: 'GOVERNANCE & ADMIN',
      items: [
        { id: 'masters' as TabType, label: 'Master Data Hub', icon: BookOpen, badge: 'Masters' },
        { id: 'approvals' as TabType, label: 'Maker & Checker', icon: UserCheck, badge: '4-Eyes' },
        { id: 'period-lock' as TabType, label: 'Period Lock & Freeze', icon: Lock, badge: 'Gatekeeper' },
        { id: 'communication' as TabType, label: 'Communication Hub', icon: Send, badge: 'Omni' },
        { id: 'document' as TabType, label: 'AI Document Review', icon: Sparkles, badge: 'OCR' },
        { id: 'storage' as TabType, label: 'Storage & Encrypted Vault', icon: HardDrive, badge: 'AES-256' },
        { id: 'mobile' as TabType, label: 'Flutter Mobile App', icon: Smartphone, badge: 'iOS/Android' },
        { id: 'settings' as TabType, label: 'Settings & Security', icon: Settings, badge: 'SOC 2' },
      ],
    },
  ];

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'analytics': return { section: 'Executive & BI', title: 'Owner Analytics, Financial Ratios & 360° Business Intelligence Command Center' };
      case 'super-admin': return { section: 'Platform Owner', title: 'Global Multi-Tenant & Subscription Control Center' };
      case 'voucher': return { section: 'Financial Accounting', title: 'Voucher Matrix & Ledger Entries' };
      case 'notes': return { section: 'Financial Accounting', title: 'GST Debit Notes & Credit Notes (Sec 34)' };
      case 'cost-centers': return { section: 'Financial Accounting', title: 'Cost Center & Multi-Tier Profitability Breakup Matrix' };
      case 'financial-reports': return { section: 'Financial Accounting', title: 'Financial & Accounting Reports (Schedule III)' };
      case 'financial-periods': return { section: 'Financial Accounting', title: 'Financial Period Management, Month-End & Year-End Closing Engine' };
      case 'banking': return { section: 'Banking & Treasury', title: 'Bank Reconciliation Statement (BRS) Auto-Match Engine' };
      case 'cheques': return { section: 'Banking & Treasury', title: 'Cheque Book Management & CTS-2010 Print Designer' };
      case 'upi': return { section: 'Banking & Treasury', title: 'NPCI Dynamic UPI QR Generation & Instant Settlement Engine' };
      case 'pdc': return { section: 'Banking & Treasury', title: 'Post-Dated Cheques (PDC) & Memoranda Voucher Registry' };
      case 'interest': return { section: 'Banking & Treasury', title: 'Automated Overdue Interest Calculation & Debit Note Engine (18% p.a.)' };
      case 'forex': return { section: 'Banking & Treasury', title: 'Multi-Currency & AS 11 Foreign Exchange Fluctuation Management' };
      case 'procurement': return { section: 'Procurement & Stores', title: 'Purchase Operations & 3-Way Match' };
      case 'inventory': return { section: 'Procurement & Stores', title: 'Stores, Godowns & Inventory Valuation' };
      case 'manufacturing': return { section: 'Procurement & Stores', title: 'Manufacturing Operations, BOM & Production Journals' };
      case 'jobwork': return { section: 'Procurement & Stores', title: 'Job Work Order Management & GST Form ITC-04 Compliance' };
      case 'purchase-reports': return { section: 'Procurement & Stores', title: 'Purchase Department Reports & Registers' };
      case 'sales': return { section: 'Sales & Revenue', title: 'Sales Operations, SOs & Challans' };
      case 'sales-reports': return { section: 'Sales & Revenue', title: 'Sales Department Reports, Registers & Debtors Ageing' };
      case 'hr-directory': return { section: 'Human Resources (HR)', title: 'Employee 360° Directory, Personal Profiles & Organization Hierarchy' };
      case 'hr-offers': return { section: 'Human Resources (HR)', title: 'Candidate Offer Letter Generator, Indian CTC Breakup & Onboarding' };
      case 'hr-lifecycle': return { section: 'Human Resources (HR)', title: 'Salary Revisions, Annual Appraisals & Statutory Full & Final (F&F) Exit Hub' };
      case 'payroll-run': return { section: 'Payroll & Compensation', title: 'Monthly Statutory Payroll Processing, Bank NEFT Batch & Salary Register' };
      case 'payroll-loans': return { section: 'Payroll & Compensation', title: 'Staff Loans & Salary Advance Deductions Master' };
      case 'payroll-compliance': return { section: 'Payroll & Compensation', title: 'EPFO Electronic Challan (ECR), ESIC & Statutory Returns' };
      case 'payroll': return { section: 'Payroll & Compensation', title: 'Payroll Run, Salary Register & Statutory Hub' };
      case 'compliance': return { section: 'Statutory, Tax & Audit', title: 'Statutory & Tax Compliance Hub (E-Way / E-Invoice / Form 26Q / 27EQ TCS)' };
      case 'audit-trail': return { section: 'Statutory, Tax & Audit', title: 'Audit Trail & Edit Log (MCA 2024 / Companies Act Rule 3)' };
      case 'masters': return { section: 'Governance & Admin', title: 'Master Data Hub & Relational Master Registries' };
      case 'approvals': return { section: 'Governance & Admin', title: 'Maker-Checker Dual Authorization & Fraud Prevention Hub' };
      case 'period-lock': return { section: 'Governance & Admin', title: 'Accounting Period Closure, Hard Books Freeze & Backdated Entry Controls' };
      case 'communication': return { section: 'Governance & Admin', title: 'Communication Engine & Multi-Channel Alerts' };
      case 'document': return { section: 'Governance & Admin', title: 'AI Document OCR & Review' };
      case 'storage': return { section: 'Governance & Admin', title: 'Zero-Trust Encrypted Document Storage Vault & Quota Manager' };
      case 'mobile': return { section: 'Governance & Admin', title: 'FINSTAQ Mobile Flutter Application Experience & Interactive Simulator' };
      case 'settings': return { section: 'Governance & Admin', title: 'Organization Settings, Security & SOC 2 Type II Trust Matrix' };
      default: return { section: 'Overview', title: 'Financial Dashboard' };
    }
  };


  const breadcrumb = getBreadcrumb();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sleek Left Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-200 select-none z-20`}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-sm shadow-blue-600/30 text-base shrink-0">
              F
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  FINSTAQ
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mt-0.5">
                  Cloud Enterprise ERP
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 no-scrollbar">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                    } py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: User Card & Logout */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-950/40">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                  {session.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {session.email.split('@')[0]}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
                      {session.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Right View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Clean Header Bar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium">{breadcrumb.section}</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{breadcrumb.title}</span>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center space-x-3.5">
            {/* AI Help Genie / ERP Trainer Header Button */}
            <button
              type="button"
              onClick={() => setIsGenieOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              title="Ask Help Genie & AI ERP Trainer (Ctrl+K)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Ask Genie</span>
              <span className="hidden xl:inline text-[9px] bg-white/20 px-1 py-0.5 rounded font-mono ml-1">Ctrl+K</span>
            </button>

            {/* Notification Center Popover */}
            <NotificationCenterDrawer />

            {/* Active Tenant / Platform Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              {session.role === 'SUPER_ADMIN' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-bold">Platform Super Admin</span>
                  <span className="text-[10px] font-mono text-indigo-500 font-bold">(Global Control)</span>
                </>
              ) : (
                <>
                  <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{session.tenantName || 'Apex Industries Ltd.'}</span>
                  <span className="text-[10px] font-mono text-slate-400">({session.subdomain ? `${session.subdomain}.finstaq.com` : session.tenantId})</span>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] hidden md:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Active Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col relative">
          {activeTab === 'analytics' && <ExecutiveAnalyticsWorkspace />}
          {activeTab === 'super-admin' && <SuperAdminHub />}
          {activeTab === 'masters' && <MastersHub />}
          {activeTab === 'voucher' && <VoucherEntryScreen />}
          {activeTab === 'upi' && <UpiPaymentsWorkspace />}
          {activeTab === 'pdc' && <PdcMemorandaWorkspace />}
          {activeTab === 'interest' && <InterestCalculationWorkspace />}
          {activeTab === 'banking' && <BankReconciliationWorkspace />}
          {activeTab === 'cheques' && <ChequeManagementWorkspace />}
          {activeTab === 'cost-centers' && <CostCenterWorkspace />}
          {activeTab === 'forex' && <ForexManagementWorkspace />}
          {activeTab === 'compliance' && <StatutoryComplianceHub />}
          {activeTab === 'notes' && <DebitCreditNotesWorkspace />}
          {activeTab === 'financial-reports' && <AccountingReportsWorkspace />}
          {activeTab === 'financial-periods' && <FinancialPeriodHub />}
          {activeTab === 'procurement' && <PurchaseDashboard />}
          {activeTab === 'jobwork' && <JobWorkWorkspace />}
          {activeTab === 'manufacturing' && <ManufacturingBOMWorkspace />}
          {activeTab === 'inventory' && <InventoryHub />}
          {activeTab === 'purchase-reports' && <PurchaseReportsWorkspace />}
          {activeTab === 'hr-directory' && <HRWorkspace initialTab="directory" />}
          {activeTab === 'hr-offers' && <HRWorkspace initialTab="offers" />}
          {activeTab === 'hr-lifecycle' && <HRWorkspace initialTab="revisions" />}
          {activeTab === 'payroll-run' && <PayrollWorkspace initialTab="overview" />}
          {activeTab === 'payroll-loans' && <PayrollWorkspace initialTab="loans" />}
          {activeTab === 'payroll-compliance' && <PayrollWorkspace initialTab="compliance" />}
          {activeTab === 'payroll' && <PayrollWorkspace initialTab="overview" />}
          {activeTab === 'sales' && <SalesDashboard />}
          {activeTab === 'sales-reports' && <SalesReportsWorkspace />}
          {activeTab === 'approvals' && <ApprovalCenter />}
          {activeTab === 'period-lock' && <PeriodLockWorkspace />}
          {activeTab === 'communication' && <CommunicationHub />}
          {activeTab === 'audit-trail' && <AuditTrailWorkspace />}
          {activeTab === 'document' && <DocumentReviewScreen />}
          {activeTab === 'storage' && <StorageVaultWorkspace />}
          {activeTab === 'mobile' && <MobileAppSimulator />}
          {activeTab === 'settings' && <SettingsHub />}
        </main>
      </div>

      {/* Floating Button to Return to Mobile View if on small screen */}
      {forceDesktopMode && (
        <button
          type="button"
          onClick={() => setForceDesktopMode(false)}
          className="fixed bottom-20 right-6 px-3.5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center space-x-2 text-xs font-bold z-30 cursor-pointer transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>Switch to Mobile App</span>
        </button>
      )}

      {/* Floating Quick Action for Help Genie */}
      <button
        type="button"
        onClick={() => setIsGenieOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 z-30 cursor-pointer group"
        title="ERP Help Genie & Trainer (Ctrl+K)"
      >
        <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Help Genie & AI ERP Trainer Drawer */}
      <HelpGenieDrawer
        isOpen={isGenieOpen}
        onClose={() => setIsGenieOpen(false)}
        onNavigate={(tab) => setActiveTab(tab as TabType)}
      />
    </div>
  );
}

export function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionExpiryNotice, setSessionExpiryNotice] = useState<string | null>(null);

  const handleLogout = (reasonText?: string) => {
    if (session) {
      try {
        fetch('/api/v1/audit/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': session.tenantId,
          },
          body: JSON.stringify({
            eventType: 'LOGOUT',
            details: `User ${session.email} session ended${reasonText ? ` (${reasonText})` : ''}`
          })
        }).catch(() => {});
      } catch (e) {}
    }
    setSession(null);
  };

  const handleSessionExpired = (reason: 'INACTIVITY' | 'MAX_SESSION_REACHED' | 'MANUAL_LOGOUT' | 'REMOTE_LOGOUT') => {
    if (reason === 'INACTIVITY') {
      setSessionExpiryNotice('Your workspace session was automatically closed after 15 minutes of inactivity as per SOC 2 & banking security guidelines.');
      handleLogout('15-minute inactivity timeout');
    } else if (reason === 'MAX_SESSION_REACHED') {
      setSessionExpiryNotice('Maximum 8-hour continuous work shift reached. Please sign in again.');
      handleLogout('8-hour maximum shift limit');
    } else if (reason === 'REMOTE_LOGOUT') {
      setSessionExpiryNotice('You were signed out from another tab or device.');
      handleLogout('Remote tab sign-out');
    } else {
      handleLogout();
    }
  };

  // Industry Standard Inactivity Watcher (14m warning + 60s countdown = 15m total)
  const { isWarningOpen, remainingCountdown, extendSession } = useSessionTimeout({
    warningTimeoutSeconds: 14 * 60,
    countdownSeconds: 60,
    maxSessionSeconds: 8 * 60 * 60,
    onSessionExpired: handleSessionExpired,
    enabled: !!session,
  });

  const handleLogin = (user: AuthSession) => {
    setSessionExpiryNotice(null);
    setSession(user);
    try {
      fetch('/api/v1/audit/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({
          eventType: 'LOGIN',
          details: `User ${user.email} successfully logged in as ${user.role}`
        })
      }).catch(() => {});
    } catch (e) {}
  };

  return (
    <AuthProvider session={session} setSession={setSession}>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <QueryClientProvider client={queryClient}>
              {!session ? (
                <LoginScreen onLoginSuccess={handleLogin} sessionExpiryNotice={sessionExpiryNotice} />
              ) : session.tenantStatus === 'SUSPENDED' || session.tenantStatus === 'INACTIVE' ? (
                <SuspendedTenantScreen
                  tenantName={session.tenantName || 'Your Organization'}
                  subdomain={session.subdomain || 'tenant'}
                  suspendedReason={session.suspendedReason}
                  onBackToLogin={() => handleLogout('Suspended tenant exit')}
                />
              ) : (
                <>
                  <MainWorkspace session={session} onLogout={() => handleLogout('Manual user sign out')} />
                  <SessionTimeoutModal
                    isOpen={isWarningOpen}
                    remainingSeconds={remainingCountdown}
                    totalCountdownSeconds={60}
                    onExtend={extendSession}
                    onLogout={() => handleSessionExpired('INACTIVITY')}
                  />
                </>
              )}
            </QueryClientProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

