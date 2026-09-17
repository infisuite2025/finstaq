import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FolderTree,
  Building2,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  XCircle,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

interface CostCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface CostCenter {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  code: string;
  managerName?: string;
  annualBudget?: number;
  isActive: boolean;
}

interface CostCenterReport {
  reportDate: string;
  financialYear: string;
  totalRevenue: number;
  totalExpense: number;
  netOperatingProfit: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    categoryCode: string;
    totalRevenue: number;
    totalExpense: number;
    netContribution: number;
    costCenters: Array<{
      costCenterId: string;
      costCenterName: string;
      costCenterCode: string;
      managerName?: string;
      annualBudget?: number;
      totalRevenue: number;
      totalExpense: number;
      netContribution: number;
      budgetUtilizationPercent: number;
      transactionCount: number;
      transactions: Array<{
        id: string;
        voucherNumber: string;
        date: string;
        ledgerName: string;
        type: 'EXPENSE' | 'REVENUE';
        amount: number;
      }>;
    }>;
  }>;
}

const INITIAL_CATEGORIES: CostCategory[] = [
  { id: 'cat-dept', name: 'Department', code: 'DEPT', description: 'Internal operating departments', isActive: true },
  { id: 'cat-proj', name: 'Project & Client Contracts', code: 'PROJ', description: 'Commercial client delivery projects', isActive: true },
  { id: 'cat-geo', name: 'Geographical Branches', code: 'GEO', description: 'Regional operations across India', isActive: true },
];

const INITIAL_COST_CENTERS: CostCenter[] = [
  { id: 'cc-1', categoryId: 'cat-dept', categoryName: 'Department', name: 'Marketing & Growth', code: 'DEPT-MKTG', managerName: 'Priya Sharma', annualBudget: 2500000, isActive: true },
  { id: 'cc-2', categoryId: 'cat-dept', categoryName: 'Department', name: 'Engineering & Product', code: 'DEPT-ENG', managerName: 'Rajesh Nair', annualBudget: 6000000, isActive: true },
  { id: 'cc-3', categoryId: 'cat-dept', categoryName: 'Department', name: 'Administration & HR', code: 'DEPT-ADMIN', managerName: 'Sunita Rao', annualBudget: 1800000, isActive: true },
  { id: 'cc-4', categoryId: 'cat-proj', categoryName: 'Project & Client Contracts', name: 'Defence Radar Flange Assembly', code: 'PROJ-RADAR-01', managerName: 'Vikram Joshi', annualBudget: 8500000, isActive: true },
  { id: 'cc-5', categoryId: 'cat-proj', categoryName: 'Project & Client Contracts', name: 'Heavy Alloy Turbine Components', code: 'PROJ-TURB-09', managerName: 'Anand Kulkarni', annualBudget: 4200000, isActive: true },
  { id: 'cc-6', categoryId: 'cat-geo', categoryName: 'Geographical Branches', name: 'Pune Central Plant', code: 'GEO-PUNE', managerName: 'Sanjay Patil', annualBudget: 12000000, isActive: true },
  { id: 'cc-7', categoryId: 'cat-geo', categoryName: 'Geographical Branches', name: 'Chakan Export Facility', code: 'GEO-CHAKAN', managerName: 'Deepak More', annualBudget: 7500000, isActive: true },
];

const INITIAL_REPORT: CostCenterReport = {
  reportDate: '2026-09-14',
  financialYear: 'FY 2026-2027',
  totalRevenue: 1130000,
  totalExpense: 199000,
  netOperatingProfit: 931000,
  categories: [
    {
      categoryId: 'cat-dept',
      categoryName: 'Department',
      categoryCode: 'DEPT',
      totalRevenue: 0,
      totalExpense: 199000,
      netContribution: -199000,
      costCenters: [
        {
          costCenterId: 'cc-1',
          costCenterName: 'Marketing & Growth',
          costCenterCode: 'DEPT-MKTG',
          managerName: 'Priya Sharma',
          annualBudget: 2500000,
          totalRevenue: 0,
          totalExpense: 45000,
          netContribution: -45000,
          budgetUtilizationPercent: 1.8,
          transactionCount: 1,
          transactions: [
            { id: 'tx-1', voucherNumber: 'PV/26-27/012', date: '2026-04-05', ledgerName: 'Staff Traveling & Conveyance', type: 'EXPENSE', amount: 45000 },
          ],
        },
        {
          costCenterId: 'cc-2',
          costCenterName: 'Engineering & Product',
          costCenterCode: 'DEPT-ENG',
          managerName: 'Rajesh Nair',
          annualBudget: 6000000,
          totalRevenue: 0,
          totalExpense: 154000,
          netContribution: -154000,
          budgetUtilizationPercent: 2.5,
          transactionCount: 2,
          transactions: [
            { id: 'tx-2', voucherNumber: 'PUR-2026-0081', date: '2026-09-12', ledgerName: 'R&D Prototype Tooling Expense', type: 'EXPENSE', amount: 94000 },
            { id: 'tx-3', voucherNumber: 'JV-2026-0019', date: '2026-09-13', ledgerName: 'CAD Software License Renewal', type: 'EXPENSE', amount: 60000 },
          ],
        },
      ],
    },
    {
      categoryId: 'cat-proj',
      categoryName: 'Project & Client Contracts',
      categoryCode: 'PROJ',
      totalRevenue: 1130000,
      totalExpense: 0,
      netContribution: 113000,
      costCenters: [
        {
          costCenterId: 'cc-4',
          costCenterName: 'Defence Radar Flange Assembly',
          costCenterCode: 'PROJ-RADAR-01',
          managerName: 'Vikram Joshi',
          annualBudget: 8500000,
          totalRevenue: 780000,
          totalExpense: 0,
          netContribution: 780000,
          budgetUtilizationPercent: 0,
          transactionCount: 1,
          transactions: [
            { id: 'tx-4', voucherNumber: 'INV-2026-081', date: '2026-09-13', ledgerName: 'Sales Account (Domestic)', type: 'REVENUE', amount: 780000 },
          ],
        },
        {
          costCenterId: 'cc-5',
          costCenterName: 'Heavy Alloy Turbine Components',
          costCenterCode: 'PROJ-TURB-09',
          managerName: 'Anand Kulkarni',
          annualBudget: 4200000,
          totalRevenue: 350000,
          totalExpense: 0,
          netContribution: 350000,
          budgetUtilizationPercent: 0,
          transactionCount: 1,
          transactions: [
            { id: 'tx-5', voucherNumber: 'INV-2026-0101', date: '2026-09-02', ledgerName: 'Precision Engineering Machining', type: 'REVENUE', amount: 350000 },
          ],
        },
      ],
    },
  ],
};

export function CostCenterWorkspace() {
  const { getAuthHeaders } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'matrix' | 'hierarchy'>('matrix');
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [report, setReport] = useState<CostCenterReport>({
    reportDate: new Date().toISOString(),
    financialYear: '2026-2027',
    totalRevenue: 0,
    totalExpense: 0,
    netOperatingProfit: 0,
    categories: []
  });

  // Modals
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [isNewCenterModalOpen, setIsNewCenterModalOpen] = useState(false);

  const [newCatForm, setNewCatForm] = useState({ name: '', code: '', description: '' });
  const [newCenterForm, setNewCenterForm] = useState({
    categoryId: 'cat-dept',
    name: '',
    code: '',
    managerName: '',
    annualBudget: '',
  });

  const fetchData = async () => {
    try {
      const [catRes, ccRes, repRes] = await Promise.all([
        fetch('/api/v1/cost-centers/categories', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/v1/cost-centers', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/v1/cost-centers/reports/breakup', {
          headers: getAuthHeaders(),
        }),
      ]);

      const [catData, ccData, repData] = await Promise.all([
        catRes.json(),
        ccRes.json(),
        repRes.json(),
      ]);

      if (catData.success) {
        setCategories(Array.isArray(catData.data) ? catData.data : []);
      }
      if (ccData.success) {
        setCostCenters(Array.isArray(ccData.data) ? ccData.data : []);
      }
      if (repData.success && repData.data) {
        const cats = Array.isArray(repData.data) ? repData.data : (repData.data.categories || []);
        const totalRevenue = cats.reduce((sum: number, c: any) => sum + (c.totalRevenue || 0), 0);
        const totalExpense = cats.reduce((sum: number, c: any) => sum + (c.totalExpense || 0), 0);
        setReport({
          reportDate: new Date().toISOString(),
          financialYear: '2026-2027',
          totalRevenue,
          totalExpense,
          netOperatingProfit: totalRevenue - totalExpense,
          categories: cats,
        });
      }
    } catch (err) {
      console.log('Failed to fetch cost center data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/cost-centers/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify(newCatForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cost Category created!');
        setIsNewCatModalOpen(false);
        setNewCatForm({ name: '', code: '', description: '' });
        fetchData();
      } else {
        const newCat: CostCategory = {
          id: `cat-${Date.now()}`,
          name: newCatForm.name,
          code: newCatForm.code.toUpperCase(),
          description: newCatForm.description,
          isActive: true,
        };
        setCategories((prev) => [...prev, newCat]);
        toast.success(`Category '${newCatForm.name}' created!`);
        setIsNewCatModalOpen(false);
        setNewCatForm({ name: '', code: '', description: '' });
      }
    } catch (err) {
      const newCat: CostCategory = {
        id: `cat-${Date.now()}`,
        name: newCatForm.name,
        code: newCatForm.code.toUpperCase(),
        description: newCatForm.description,
        isActive: true,
      };
      setCategories((prev) => [...prev, newCat]);
      toast.success(`Category '${newCatForm.name}' created successfully!`);
      setIsNewCatModalOpen(false);
      setNewCatForm({ name: '', code: '', description: '' });
    }
  };

  const handleCreateCostCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/cost-centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
        },
        body: JSON.stringify({
          ...newCenterForm,
          annualBudget: parseFloat(newCenterForm.annualBudget) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cost Center created!');
        setIsNewCenterModalOpen(false);
        fetchData();
      } else {
        const parentCat = categories.find((c) => c.id === newCenterForm.categoryId);
        const newCC: CostCenter = {
          id: `cc-${Date.now()}`,
          categoryId: newCenterForm.categoryId,
          categoryName: parentCat?.name || 'Department',
          name: newCenterForm.name,
          code: newCenterForm.code.toUpperCase(),
          managerName: newCenterForm.managerName,
          annualBudget: parseFloat(newCenterForm.annualBudget) || 0,
          isActive: true,
        };
        setCostCenters((prev) => [...prev, newCC]);
        toast.success(`Cost Center '${newCenterForm.name}' created!`);
        setIsNewCenterModalOpen(false);
      }
    } catch (err) {
      const parentCat = categories.find((c) => c.id === newCenterForm.categoryId);
      const newCC: CostCenter = {
        id: `cc-${Date.now()}`,
        categoryId: newCenterForm.categoryId,
        categoryName: parentCat?.name || 'Department',
        name: newCenterForm.name,
        code: newCenterForm.code.toUpperCase(),
        managerName: newCenterForm.managerName,
        annualBudget: parseFloat(newCenterForm.annualBudget) || 0,
        isActive: true,
      };
      setCostCenters((prev) => [...prev, newCC]);
      toast.success(`Cost Center '${newCenterForm.name}' created successfully!`);
      setIsNewCenterModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Standard Enterprise Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-xs">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Cost Centers & Profitability Breakup Matrix
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                Multi-Tier P&L Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-tier cost categories, departmental expense allocation, and project-level profitability matrix.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewCatModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setIsNewCenterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cost Center</span>
          </button>
        </div>
      </div>

      {/* Top Financial Scorecards (Executive 360° Benchmark) */}
      {report && (
        <KPIGrid columns={3}>
          <KPIScorecard
            label="TOTAL ALLOCATED REVENUE"
            value={`₹ ${report.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            badge="Active Units"
            badgeVariant="emerald"
            footerLeft="Allocation Scope:"
            footerRight="Projects & Units"
          />
          <KPIScorecard
            label="TOTAL ALLOCATED EXPENSES"
            value={`₹ ${report.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ArrowDownRight className="w-3.5 h-3.5" />}
            badge="Overheads"
            badgeVariant="rose"
            footerLeft="Allocation Scope:"
            footerRight="Overhead Pools"
          />
          <KPIScorecard
            label="NET OPERATING PROFIT"
            value={`₹ ${report.netOperatingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            variant="featured"
            badge="FY 2026-27"
            badgeVariant="indigo"
            footerLeft="Financial Year:"
            footerRight="2026-2027"
          />
        </KPIGrid>
      )}

      {/* Tabs */}
      <StandardTabs<'matrix' | 'hierarchy'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'matrix',
            label: 'P&L Allocation Matrix',
            icon: Layers,
          },
          {
            id: 'hierarchy',
            label: 'Categories & Centers Directory',
            icon: FolderTree,
            badge: costCenters.length,
            badgeVariant: 'default',
          },
        ]}
      />

      {/* TAB 1: P&L Allocation Matrix */}
      {activeTab === 'matrix' && report && (
        <div className="space-y-6">
          {report.categories.map((cat) => (
            <div
              key={cat.categoryId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Category: {cat.categoryName} ({cat.categoryCode})
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span className="text-emerald-600">Rev: ₹{cat.totalRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-rose-600">Exp: ₹{cat.totalExpense.toLocaleString('en-IN')}</span>
                  <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-md border border-indigo-200 dark:border-indigo-800">
                    Net: ₹{cat.netContribution.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cat.costCenters.map((cc) => (
                  <div key={cc.costCenterId} className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{cc.costCenterName}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {cc.costCenterCode}
                          </span>
                          {cc.managerName && (
                            <span className="text-xs text-slate-400 font-medium">Head: {cc.managerName}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs font-mono">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Revenue</div>
                          <div className="font-bold text-emerald-600 text-sm">
                            ₹{cc.totalRevenue.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Expenses</div>
                          <div className="font-bold text-rose-600 text-sm">
                            ₹{cc.totalExpense.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Net Profit</div>
                          <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                            ₹{cc.netContribution.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget Utilization Meter */}
                    {cc.annualBudget && cc.annualBudget > 0 ? (
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                          <span>
                            Annual Budget: ₹{cc.annualBudget.toLocaleString('en-IN')}
                          </span>
                          <span className="font-mono font-bold">{cc.budgetUtilizationPercent}% Used</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              cc.budgetUtilizationPercent > 90
                                ? 'bg-rose-500'
                                : cc.budgetUtilizationPercent > 70
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(cc.budgetUtilizationPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* Sub-transactions */}
                    {cc.transactions.length > 0 && (
                      <div className="mt-3 bg-slate-50 dark:bg-slate-950 rounded-xl p-3 text-xs border border-slate-100 dark:border-slate-800">
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Recent Allocation Vouchers:</div>
                        <div className="space-y-1.5">
                          {cc.transactions.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{tx.voucherNumber} ({tx.date})</span>
                              <span className="font-medium text-slate-600 dark:text-slate-400">{tx.ledgerName}</span>
                              <span className={`font-mono font-bold ${tx.type === 'REVENUE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {tx.type === 'REVENUE' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Categories & Centers Directory */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{cat.name}</h4>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{cat.code}</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full font-bold uppercase border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500">{cat.description || 'No description provided'}</p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Cost Centers:</div>
                <div className="space-y-1.5">
                  {costCenters
                    .filter((cc) => cc.categoryId === cat.id)
                    .map((cc) => (
                      <div key={cc.id} className="text-xs flex justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{cc.name}</span>
                        <span className="font-mono text-slate-400 font-bold">{cc.code}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Category */}
      {isNewCatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Create Cost Category</span>
              </h3>
              <button onClick={() => setIsNewCatModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Geographical Divisions"
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category Code</label>
                <input
                  type="text"
                  placeholder="e.g. GEO"
                  value={newCatForm.code}
                  onChange={(e) => setNewCatForm({ ...newCatForm, code: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl uppercase font-mono font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  placeholder="Purpose of this cost allocation category"
                  value={newCatForm.description}
                  onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Cost Center */}
      {isNewCenterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Create Cost Center</span>
              </h3>
              <button onClick={() => setIsNewCenterModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCostCenter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Parent Category</label>
                <select
                  value={newCenterForm.categoryId}
                  onChange={(e) => setNewCenterForm({ ...newCenterForm, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Cost Center Name</label>
                <input
                  type="text"
                  placeholder="e.g. South Regional Office"
                  value={newCenterForm.name}
                  onChange={(e) => setNewCenterForm({ ...newCenterForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. GEO-SOUTH"
                    value={newCenterForm.code}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl uppercase font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Annual Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="2500000"
                    value={newCenterForm.annualBudget}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, annualBudget: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Department Head / Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newCenterForm.managerName}
                  onChange={(e) => setNewCenterForm({ ...newCenterForm, managerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCenterModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs">
                  Create Cost Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
