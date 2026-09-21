import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Users,
  Building,
  Target,
  Clock,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Filter,
  CheckCircle2,
  HelpCircle,
  Percent,
  ChevronRight,
  Package,
  Truck,
  Eye,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { StandardTabs, TabItem } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

export function ExecutiveAnalyticsWorkspace() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cashflow' | 'profitability' | 'sales' | 'inventory'>('overview');
  const [timeRange, setTimeRange] = useState<'fy' | 'quarter' | 'month'>('fy');
  const [isExporting, setIsExporting] = useState(false);

  const tabs: TabItem<'overview' | 'cashflow' | 'profitability' | 'sales' | 'inventory'>[] = [
    { id: 'overview', label: '360° Executive Pulse', icon: Activity, badge: 'Live' },
    { id: 'cashflow', label: 'Cash Flow & Runway Radar', icon: DollarSign },
    { id: 'profitability', label: 'P&L Margins & Cost Drivers', icon: TrendingUp },
    { id: 'sales', label: 'Sales & Customer Intelligence', icon: Users },
    { id: 'inventory', label: 'Inventory Velocity & Supply', icon: Package },
  ];

  // Dynamic Time-Range Datasets
  const datasetByRange = {
    fy: {
      revenue: {
        current: '₹ 8,45,20,000.00',
        change: '+18.7% YoY',
        target: '₹ 10,00,00,000.00',
        progress: 84.5,
      },
      netProfit: {
        current: '₹ 1,48,60,000.00',
        change: '+25.9%',
        margin: '17.6%',
        grossMargin: '32.4%',
      },
      liquidCash: {
        current: '₹ 1,42,85,400.00',
        burnRate: '₹32.5L / mo',
        runwayMonths: '4.4 Mos',
        status: 'HEALTHY',
      },
      dso: {
        current: '38 Days',
        target: '30d',
        change: '-4 Days (Faster collections)',
        ccc: '42 Days',
      },
      monthlyTrajectory: [
        { month: 'Apr 26', revenue: 62.5, expenses: 48.0, netProfit: 14.5 },
        { month: 'May 26', revenue: 68.0, expenses: 51.5, netProfit: 16.5 },
        { month: 'Jun 26', revenue: 74.5, expenses: 56.0, netProfit: 18.5 },
        { month: 'Jul 26', revenue: 82.0, expenses: 61.2, netProfit: 20.8 },
        { month: 'Aug 26', revenue: 91.5, expenses: 67.8, netProfit: 23.7 },
        { month: 'Sep 26 (Est)', revenue: 98.0, expenses: 71.5, netProfit: 26.5 },
      ],
    },
    quarter: {
      revenue: {
        current: '₹ 2,71,50,000.00',
        change: '+21.4% QoQ',
        target: '₹ 3,20,00,000.00',
        progress: 84.8,
      },
      netProfit: {
        current: '₹ 71,00,000.00',
        change: '+29.2%',
        margin: '26.1%',
        grossMargin: '34.8%',
      },
      liquidCash: {
        current: '₹ 1,42,85,400.00',
        burnRate: '₹31.2L / mo',
        runwayMonths: '4.6 Mos',
        status: 'HEALTHY',
      },
      dso: {
        current: '35 Days',
        target: '30d',
        change: '-7 Days (Q2 acceleration)',
        ccc: '39 Days',
      },
      monthlyTrajectory: [
        { month: 'Jul 26', revenue: 82.0, expenses: 61.2, netProfit: 20.8 },
        { month: 'Aug 26', revenue: 91.5, expenses: 67.8, netProfit: 23.7 },
        { month: 'Sep 26 (Est)', revenue: 98.0, expenses: 71.5, netProfit: 26.5 },
      ],
    },
    month: {
      revenue: {
        current: '₹ 91,50,000.00',
        change: '+11.6% MoM',
        target: '₹ 1,00,00,000.00',
        progress: 91.5,
      },
      netProfit: {
        current: '₹ 23,70,000.00',
        change: '+13.9%',
        margin: '25.9%',
        grossMargin: '33.2%',
      },
      liquidCash: {
        current: '₹ 1,42,85,400.00',
        burnRate: '₹32.5L / mo',
        runwayMonths: '4.4 Mos',
        status: 'HEALTHY',
      },
      dso: {
        current: '38 Days',
        target: '30d',
        change: '-2 Days',
        ccc: '42 Days',
      },
      monthlyTrajectory: [
        { month: 'Week 1', revenue: 21.0, expenses: 15.5, netProfit: 5.5 },
        { month: 'Week 2', revenue: 22.5, expenses: 16.8, netProfit: 5.7 },
        { month: 'Week 3', revenue: 23.8, expenses: 17.5, netProfit: 6.3 },
        { month: 'Week 4', revenue: 24.2, expenses: 18.0, netProfit: 6.2 },
      ],
    },
  };

  const currentData = datasetByRange[timeRange];

  // Top Customer Revenue Contribution & Credit Risk
  const topCustomers = [
    { name: 'Tata Motors Fleet Ltd', revenue: '₹ 2,45,00,000', share: 29.0, dso: '28 Days', risk: 'LOW', overdue: '₹ 0' },
    { name: 'Reliance Retail Ltd', revenue: '₹ 1,85,00,000', share: 21.9, dso: '34 Days', risk: 'LOW', overdue: '₹ 0' },
    { name: 'Jindal Steel & Power', revenue: '₹ 1,42,00,000', share: 16.8, dso: '52 Days', risk: 'MEDIUM', overdue: '₹ 12,50,000' },
    { name: 'Bharat Heavy Electricals', revenue: '₹ 98,50,000', share: 11.7, dso: '64 Days', risk: 'HIGH', overdue: '₹ 24,80,000' },
    { name: 'Adani Logistics Hub', revenue: '₹ 78,20,000', share: 9.3, dso: '31 Days', risk: 'LOW', overdue: '₹ 0' },
  ];

  // Expense Categories Breakdown
  const expenseBreakdown = [
    { category: 'Direct Raw Materials (Steel / Alloys)', amount: '₹ 3,45,20,000', share: 49.6, color: 'bg-blue-600' },
    { category: 'Employee Salaries & Statutory Payroll', amount: '₹ 1,48,50,000', share: 21.3, color: 'bg-indigo-600' },
    { category: 'Job Work & Subcontracting Charges', amount: '₹ 82,40,000', share: 11.8, color: 'bg-emerald-600' },
    { category: 'Power, Fuel & Factory Overheads', amount: '₹ 64,80,000', share: 9.3, color: 'bg-amber-600' },
    { category: 'Logistics, Freight & Distribution', amount: '₹ 55,70,000', share: 8.0, color: 'bg-rose-600' },
  ];

  // Strategic AI Insights
  const aiInsights = [
    {
      type: 'OPPORTUNITY',
      title: 'Gross Margin Expansion on Heavy Duty Gearboxes',
      detail: 'Gross margin improved by +4.2% this quarter due to bulk steel procurement contracts with Tata Steel.',
      action: 'Lock in Q3 raw material pricing under current supplier index.',
      impact: '+ ₹ 14.5 Lakhs projected EBITDA'
    },
    {
      type: 'ALERT',
      title: 'Working Capital Stretch on BHEL Receivables',
      detail: 'Bharat Heavy Electricals average collection period increased from 42 days to 64 days with ₹ 24.8L overdue.',
      action: 'Auto-levy 18% p.a. overdue interest Debit Note & hold dispatch for SO #SO-2026-140.',
      impact: '₹ 84,250 interest recovery'
    },
    {
      type: 'TAX_RADAR',
      title: 'TCS Section 206C(1H) Compliance Trigger',
      detail: 'Turnover on Tata Motors and BHEL has exceeded the ₹50 Lakhs threshold for FY 2026-27.',
      action: 'Automated 0.1% TCS levy active on all subsequent sales invoices. Form 27EQ quarterly return pre-compiled.',
      impact: '100% Tax compliance'
    }
  ];

  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Time Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Executive Business Intelligence & Owner Insights
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                  REAL-TIME CORE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Strategic 360° financial command center, profitability margins, cash runways, and AI growth radars
              </p>
            </div>
          </div>
        </div>

        {/* Time Period Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center">
            <button
              type="button"
              onClick={() => setTimeRange('fy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${timeRange === 'fy' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              FY 2026-27 (YTD)
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${timeRange === 'quarter' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Q2 (Jul - Sep)
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${timeRange === 'month' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              This Month
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            {isExporting ? <Printer className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Generating...' : 'Export Executive PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main StandardTabs Navigation */}
      <StandardTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        size="md"
      />


      {/* ================= TAB 1: 360° EXECUTIVE PULSE ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Executive Top KPI Grid */}
          <KPIGrid columns={4}>
            {/* Total Turnover Run Rate */}
            <KPIScorecard
              label={timeRange === 'fy' ? 'NET REVENUE (YTD)' : timeRange === 'quarter' ? 'NET REVENUE (Q2)' : 'NET REVENUE (MTD)'}
              value={currentData.revenue.current}
              trend={{ direction: 'up', value: currentData.revenue.change }}
              progress={{ target: currentData.revenue.target, percentage: currentData.revenue.progress, color: 'bg-gradient-to-r from-blue-600 to-indigo-600' }}
            />

            {/* Net Profit & Margins */}
            <KPIScorecard
              label="NET PROFIT (EAT)"
              value={currentData.netProfit.current}
              variant="emerald"
              trend={{ direction: 'up', value: currentData.netProfit.change }}
              footerLeft={<span>Net: <strong>{currentData.netProfit.margin}</strong></span>}
              footerRight={<span>Gross: <strong>{currentData.netProfit.grossMargin}</strong></span>}
            />

            {/* Liquid Cash & Bank Runway */}
            <KPIScorecard
              label="LIQUID CASH & BANK"
              value={currentData.liquidCash.current}
              variant="indigo"
              badge={currentData.liquidCash.status}
              badgeVariant="indigo"
              footerLeft={<span>Burn: <strong>{currentData.liquidCash.burnRate}</strong></span>}
              footerRight={<span>Runway: <strong>{currentData.liquidCash.runwayMonths}</strong></span>}
            />

            {/* DSO & Working Capital Speed */}
            <KPIScorecard
              label="DAYS SALES OUTSTANDING"
              value={currentData.dso.current}
              trend={{ direction: 'up', value: currentData.dso.change }}
              footerLeft={<span>Target: <strong>{currentData.dso.target}</strong></span>}
              footerRight={<span>CCC: <strong>{currentData.dso.ccc}</strong></span>}
            />
          </KPIGrid>

          {/* Revenue, Expenses & EBITDA Visual Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Monthly Financial Trajectory Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {timeRange === 'month' ? 'Weekly Revenue vs Expenses (₹ Lakhs)' : 'Monthly Revenue vs Expenses vs Net Profit (₹ Lakhs)'}
                  </h3>
                  <p className="text-xs text-slate-400">Fiscal progression & operating leverage ({timeRange.toUpperCase()})</p>
                </div>
                <div className="flex items-center space-x-3 text-xs font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-blue-600"></span>
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-rose-500"></span>
                    <span>Expenses</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                    <span>Net Profit</span>
                  </div>
                </div>
              </div>

              {/* Visual Simulated Bar Chart with ample top clearance */}
              <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-200 dark:border-slate-800">
                {currentData.monthlyTrajectory.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 font-sans">
                      ₹{item.revenue}L
                    </div>
                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      {/* Revenue Bar */}
                      <div
                        className="w-1/3 bg-blue-600 rounded-t-md transition-all duration-300 hover:brightness-110 shadow-xs"
                        style={{ height: `${(item.revenue / (timeRange === 'month' ? 30 : 100)) * 100}%` }}
                        title={`Revenue: ₹${item.revenue} Lakhs`}
                      ></div>
                      {/* Expenses Bar */}
                      <div
                        className="w-1/3 bg-rose-500/85 rounded-t-md transition-all duration-300 hover:brightness-110 shadow-xs"
                        style={{ height: `${(item.expenses / (timeRange === 'month' ? 30 : 100)) * 100}%` }}
                        title={`Expenses: ₹${item.expenses} Lakhs`}
                      ></div>
                      {/* Net Profit Bar */}
                      <div
                        className="w-1/3 bg-emerald-500 rounded-t-md transition-all duration-300 hover:brightness-110 shadow-xs"
                        style={{ height: `${(item.netProfit / (timeRange === 'month' ? 30 : 100)) * 100}%` }}
                        title={`Net Profit: ₹${item.netProfit} Lakhs`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1 font-sans">{item.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Average Period Run Rate: <strong>₹ {timeRange === 'month' ? '22.8 Lakhs / wk' : '79.4 Lakhs / mo'}</strong></span>
                <span>Operating Margin Expansion: <strong className="text-emerald-600">+3.8% in Q2</strong></span>
              </div>
            </div>

            {/* AI Strategic Insights & Recommendations */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    AI Owner Insights & Alerts
                  </h3>
                </div>
                <p className="text-xs text-slate-400">Automated financial intelligence and risk radar</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {aiInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border space-y-1.5 ${insight.type === 'ALERT' ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' : insight.type === 'OPPORTUNITY' ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${insight.type === 'ALERT' ? 'bg-rose-500 text-white' : insight.type === 'OPPORTUNITY' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {insight.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{insight.impact}</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-100">{insight.title}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{insight.detail}</div>
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 pt-1 flex items-center space-x-1">
                      <span>Suggested Action: {insight.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Top Customers & Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Customer Concentration & Collection Risk */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Top Customers & Credit Risk Radar
                  </h3>
                  <p className="text-xs text-slate-400">Revenue concentration, collection speed & overdue balances</p>
                </div>
                <span className="text-xs font-bold text-blue-600">Top 5: 88.7% Share</span>
              </div>

              <div className="space-y-3">
                {topCustomers.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.revenue} • {c.share}% Share • Avg DSO: {c.dso}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${c.risk === 'LOW' ? 'bg-emerald-500/15 text-emerald-600' : c.risk === 'MEDIUM' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-600'}`}>
                        {c.risk} RISK
                      </span>
                      {c.overdue !== '₹ 0' && (
                        <div className="text-[10px] font-bold text-rose-500">
                          Overdue: {c.overdue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Expense Structure Breakdown */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Operating Cost Distribution
                  </h3>
                  <p className="text-xs text-slate-400">Cost of Goods Sold (COGS) & Overheads breakdown</p>
                </div>
                <span className="text-xs font-bold text-slate-500">Total: ₹ 6.96 Cr</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {expenseBreakdown.map((exp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{exp.category}</span>
                      <span>{exp.amount} ({exp.share}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${exp.color}`} style={{ width: `${exp.share}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CASH FLOW & RUNWAY RADAR ================= */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Monthly Cash Inflow</div>
              <div className="text-2xl font-black text-emerald-600">₹ 82,45,000.00</div>
              <div className="text-[11px] text-slate-400">Collections from 28 customers</div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Monthly Cash Outflow</div>
              <div className="text-2xl font-black text-rose-600">₹ 64,80,000.00</div>
              <div className="text-[11px] text-slate-400">Suppliers, Payroll, GST/TDS & Rent</div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Net Free Cash Flow</div>
              <div className="text-2xl font-black text-blue-600">+ ₹ 17,65,000.00</div>
              <div className="text-[11px] text-emerald-500 font-bold">Positive operating cash runway</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Bank Account Balance Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-black">HDFC Bank Current A/c #50200012345678</div>
                  <div className="text-[10px] text-slate-400 font-mono">IFSC: HDFC0000128 • Primary Operations</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-blue-600">₹ 84,50,400.00</div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600">✓ Reconciled</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-black">ICICI Bank CC A/c #001205001234</div>
                  <div className="text-[10px] text-slate-400 font-mono">IFSC: ICIC0000012 • Cash Credit Limit: ₹1.00 Cr</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-indigo-600">₹ 58,35,000.00</div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600">✓ Reconciled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PROFITABILITY & COST DRIVERS ================= */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Gross Profit Margin</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">32.4%</div>
              <div className="text-[11px] text-emerald-600 font-bold">+3.5% vs Industry Average (28.9%)</div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">EBITDA Margin</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">21.8%</div>
              <div className="text-[11px] text-blue-600 font-bold">₹ 1.84 Cr Operating EBITDA</div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Return on Capital Employed (ROCE)</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">26.5%</div>
              <div className="text-[11px] text-emerald-600 font-bold">Strong capital efficiency</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SALES & CUSTOMER INTELLIGENCE ================= */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Customer Aging & Receivables Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-center">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">0 - 30 Days (Current)</div>
                <div className="text-lg font-black text-emerald-600 mt-1">₹ 2,14,50,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 text-center">
                <div className="text-[10px] font-bold text-blue-600 uppercase">31 - 60 Days</div>
                <div className="text-lg font-black text-blue-600 mt-1">₹ 42,10,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-center">
                <div className="text-[10px] font-bold text-amber-600 uppercase">61 - 90 Days</div>
                <div className="text-lg font-black text-amber-600 mt-1">₹ 14,80,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-center">
                <div className="text-[10px] font-bold text-rose-600 uppercase">&gt; 90 Days (Overdue)</div>
                <div className="text-lg font-black text-rose-600 mt-1">₹ 8,40,000</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: INVENTORY VELOCITY ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Inventory Valuation</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">₹ 1,84,50,000.00</div>
              <div className="text-[11px] text-slate-400">Valued @ Weighted Average Cost</div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Inventory Turnover Ratio</div>
              <div className="text-2xl font-black text-blue-600">6.8x / Year</div>
              <div className="text-[11px] text-emerald-600 font-bold">Fast-moving stock replenishment</div>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Stock Days of Supply</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">53 Days</div>
              <div className="text-[11px] text-slate-400">Optimal buffer for production</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
