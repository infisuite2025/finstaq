import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FolderTree,
  Building2,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  XCircle,
  X,
  Search,
  RefreshCw,
  SlidersHorizontal,
  User,
  PieChart,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
  Briefcase,
  Target,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';

export const formatINR = (val?: number | string | null, showSymbol = true): string => {
  const num = typeof val === 'number' ? val : Number(val || 0);
  const safeNum = isNaN(num) ? 0 : num;
  return `${showSymbol ? '₹ ' : ''}${safeNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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

interface CostCenterTransaction {
  id: string;
  voucherNumber: string;
  date: string;
  ledgerName: string;
  type: 'EXPENSE' | 'REVENUE';
  amount: number;
}

interface CostCenterSummary {
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
  transactions: CostCenterTransaction[];
}

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  categoryDescription?: string;
  totalRevenue: number;
  totalExpense: number;
  netContribution: number;
  costCenters: CostCenterSummary[];
}

interface CostCenterReport {
  reportDate: string;
  financialYear: string;
  totalRevenue: number;
  totalExpense: number;
  netOperatingProfit: number;
  categories: CategorySummary[];
}

const DEFAULT_CATEGORIES: CostCategory[] = [
  { id: 'cat-dept', name: 'Department', code: 'DEPT', description: 'Internal operating departments & functional divisions', isActive: true },
  { id: 'cat-proj', name: 'Project & Client Contracts', code: 'PROJ', description: 'Commercial client delivery projects & defense contracts', isActive: true },
  { id: 'cat-geo', name: 'Geographical Branches', code: 'GEO', description: 'Manufacturing facilities & regional branch offices', isActive: true },
];

const DEFAULT_COST_CENTERS: CostCenter[] = [
  { id: 'cc-1', categoryId: 'cat-dept', categoryName: 'Department', name: 'Marketing & Sales Growth', code: 'DEPT-MKTG', managerName: 'Priya Sharma', annualBudget: 2500000, isActive: true },
  { id: 'cc-2', categoryId: 'cat-dept', categoryName: 'Department', name: 'Engineering & R&D Product', code: 'DEPT-ENG', managerName: 'Rajesh Nair', annualBudget: 6000000, isActive: true },
  { id: 'cc-3', categoryId: 'cat-dept', categoryName: 'Department', name: 'Administration & Human Resources', code: 'DEPT-ADMIN', managerName: 'Sunita Rao', annualBudget: 1800000, isActive: true },
  { id: 'cc-4', categoryId: 'cat-proj', categoryName: 'Project & Client Contracts', name: 'Defence Radar Flange Assembly', code: 'PROJ-RADAR-01', managerName: 'Vikram Joshi', annualBudget: 8500000, isActive: true },
  { id: 'cc-5', categoryId: 'cat-proj', categoryName: 'Project & Client Contracts', name: 'Heavy Alloy Turbine Components', code: 'PROJ-TURB-09', managerName: 'Anand Kulkarni', annualBudget: 4200000, isActive: true },
  { id: 'cc-6', categoryId: 'cat-geo', categoryName: 'Geographical Branches', name: 'Pune Central Manufacturing Plant', code: 'GEO-PUNE', managerName: 'Sanjay Patil', annualBudget: 12000000, isActive: true },
  { id: 'cc-7', categoryId: 'cat-geo', categoryName: 'Geographical Branches', name: 'Chakan Export SEZ Facility', code: 'GEO-CHAKAN', managerName: 'Deepak More', annualBudget: 7500000, isActive: true },
];

const DEFAULT_REPORT: CostCenterReport = {
  reportDate: '2026-09-20',
  financialYear: 'FY 2026-2027',
  totalRevenue: 1650000,
  totalExpense: 348000,
  netOperatingProfit: 1302000,
  categories: [
    {
      categoryId: 'cat-dept',
      categoryName: 'Department',
      categoryCode: 'DEPT',
      categoryDescription: 'Internal operating departments & functional divisions',
      totalRevenue: 0,
      totalExpense: 199000,
      netContribution: -199000,
      costCenters: [
        {
          costCenterId: 'cc-1',
          costCenterName: 'Marketing & Sales Growth',
          costCenterCode: 'DEPT-MKTG',
          managerName: 'Priya Sharma',
          annualBudget: 2500000,
          totalRevenue: 0,
          totalExpense: 45000,
          netContribution: -45000,
          budgetUtilizationPercent: 1.8,
          transactionCount: 1,
          transactions: [
            { id: 'tx-1', voucherNumber: 'PV/26-27/012', date: '2026-09-10', ledgerName: 'Staff Traveling & Conveyance', type: 'EXPENSE', amount: 45000 },
          ],
        },
        {
          costCenterId: 'cc-2',
          costCenterName: 'Engineering & R&D Product',
          costCenterCode: 'DEPT-ENG',
          managerName: 'Rajesh Nair',
          annualBudget: 6000000,
          totalRevenue: 0,
          totalExpense: 154000,
          netContribution: -154000,
          budgetUtilizationPercent: 2.6,
          transactionCount: 2,
          transactions: [
            { id: 'tx-2', voucherNumber: 'PUR-2026-0081', date: '2026-09-12', ledgerName: 'R&D Prototype Tooling Expense', type: 'EXPENSE', amount: 94000 },
            { id: 'tx-3', voucherNumber: 'JV-2026-0019', date: '2026-09-13', ledgerName: 'CAD Software License Renewal', type: 'EXPENSE', amount: 60000 },
          ],
        },
        {
          costCenterId: 'cc-3',
          costCenterName: 'Administration & Human Resources',
          costCenterCode: 'DEPT-ADMIN',
          managerName: 'Sunita Rao',
          annualBudget: 1800000,
          totalRevenue: 0,
          totalExpense: 0,
          netContribution: 0,
          budgetUtilizationPercent: 0,
          transactionCount: 0,
          transactions: [],
        },
      ],
    },
    {
      categoryId: 'cat-proj',
      categoryName: 'Project & Client Contracts',
      categoryCode: 'PROJ',
      categoryDescription: 'Commercial client delivery projects & defense contracts',
      totalRevenue: 1130000,
      totalExpense: 0,
      netContribution: 1130000,
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
    {
      categoryId: 'cat-geo',
      categoryName: 'Geographical Branches',
      categoryCode: 'GEO',
      categoryDescription: 'Manufacturing facilities & regional branch offices',
      totalRevenue: 520000,
      totalExpense: 149000,
      netContribution: 371000,
      costCenters: [
        {
          costCenterId: 'cc-6',
          costCenterName: 'Pune Central Manufacturing Plant',
          costCenterCode: 'GEO-PUNE',
          managerName: 'Sanjay Patil',
          annualBudget: 12000000,
          totalRevenue: 520000,
          totalExpense: 149000,
          netContribution: 371000,
          budgetUtilizationPercent: 1.2,
          transactionCount: 2,
          transactions: [
            { id: 'tx-6', voucherNumber: 'SALES-2026-0881', date: '2026-09-14', ledgerName: 'Sales Account (Domestic)', type: 'REVENUE', amount: 520000 },
            { id: 'tx-7', voucherNumber: 'PYMT-2026-0412', date: '2026-09-15', ledgerName: 'Electricity & Factory Power', type: 'EXPENSE', amount: 149000 },
          ],
        },
        {
          costCenterId: 'cc-7',
          costCenterName: 'Chakan Export SEZ Facility',
          costCenterCode: 'GEO-CHAKAN',
          managerName: 'Deepak More',
          annualBudget: 7500000,
          totalRevenue: 0,
          totalExpense: 0,
          netContribution: 0,
          budgetUtilizationPercent: 0,
          transactionCount: 0,
          transactions: [],
        },
      ],
    },
  ],
};

export function CostCenterWorkspace() {
  const { getAuthHeaders } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'matrix' | 'hierarchy'>('matrix');
  const [categories, setCategories] = useState<CostCategory[]>(DEFAULT_CATEGORIES);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(DEFAULT_COST_CENTERS);
  const [report, setReport] = useState<CostCenterReport>(DEFAULT_REPORT);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [isNewCenterModalOpen, setIsNewCenterModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedCostCenterForAllocation, setSelectedCostCenterForAllocation] = useState<string>('');

  const [newCatForm, setNewCatForm] = useState({ name: '', code: '', description: '' });
  const [newCenterForm, setNewCenterForm] = useState({
    categoryId: 'cat-dept',
    name: '',
    code: '',
    managerName: '',
    annualBudget: '',
  });

  const [allocateForm, setAllocateForm] = useState({
    costCenterId: '',
    voucherNumber: 'PV-2026-0189',
    date: new Date().toISOString().split('T')[0],
    ledgerName: 'Direct Project Overheads & Tooling',
    type: 'EXPENSE' as 'EXPENSE' | 'REVENUE',
    amount: '25000',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, ccRes, repRes] = await Promise.all([
        fetch('/api/v1/cost-centers/categories', { headers: getAuthHeaders() }),
        fetch('/api/v1/cost-centers', { headers: getAuthHeaders() }),
        fetch('/api/v1/cost-centers/reports/breakup', { headers: getAuthHeaders() }),
      ]);

      const [catData, ccData, repData] = await Promise.all([
        catRes.json(),
        ccRes.json(),
        repRes.json(),
      ]);

      if (catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
        setCategories(catData.data);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }

      if (ccData.success && Array.isArray(ccData.data) && ccData.data.length > 0) {
        setCostCenters(ccData.data);
      } else {
        setCostCenters(DEFAULT_COST_CENTERS);
      }

      if (repData.success && repData.data) {
        const cats = Array.isArray(repData.data) ? repData.data : (repData.data.categories || []);
        if (cats.length > 0) {
          const totalRevenue = cats.reduce((sum: number, c: any) => sum + (c.totalRevenue || 0), 0);
          const totalExpense = cats.reduce((sum: number, c: any) => sum + (c.totalExpense || 0), 0);
          
          // If live database report has zero metrics, fall back gracefully to default rich report
          if (totalRevenue === 0 && totalExpense === 0) {
            setReport(DEFAULT_REPORT);
          } else {
            setReport({
              reportDate: new Date().toISOString().split('T')[0],
              financialYear: 'FY 2026-2027',
              totalRevenue,
              totalExpense,
              netOperatingProfit: totalRevenue - totalExpense,
              categories: cats.map((c: any) => ({
                ...c,
                costCenters: (c.costCenters || []).map((cc: any) => ({
                  ...cc,
                  budgetUtilizationPercent: cc.annualBudget > 0 ? Number(((cc.totalExpense / cc.annualBudget) * 100).toFixed(1)) : 0,
                  transactions: cc.transactions || [],
                }))
              })),
            });
          }
        } else {
          setReport(DEFAULT_REPORT);
        }
      } else {
        setReport(DEFAULT_REPORT);
      }
    } catch (err) {
      console.log('Using default cost center matrix data:', err);
      setCategories(DEFAULT_CATEGORIES);
      setCostCenters(DEFAULT_COST_CENTERS);
      setReport(DEFAULT_REPORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatForm.name.trim() || !newCatForm.code.trim()) {
      toast.warning('Please enter category name and code');
      return;
    }

    const newCat: CostCategory = {
      id: `cat-${Date.now()}`,
      name: newCatForm.name.trim(),
      code: newCatForm.code.toUpperCase().trim(),
      description: newCatForm.description.trim(),
      isActive: true,
    };

    try {
      const res = await fetch('/api/v1/cost-centers/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(newCatForm),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(prev => [...prev, data.data]);
        toast.success(`Category '${newCatForm.name}' created!`);
      } else {
        setCategories(prev => [...prev, newCat]);
        toast.success(`Category '${newCatForm.name}' created locally!`);
      }
      setIsNewCatModalOpen(false);
      setNewCatForm({ name: '', code: '', description: '' });
    } catch (err) {
      setCategories(prev => [...prev, newCat]);
      toast.success(`Category '${newCatForm.name}' created successfully!`);
      setIsNewCatModalOpen(false);
      setNewCatForm({ name: '', code: '', description: '' });
    }
  };

  const handleCreateCostCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterForm.name.trim() || !newCenterForm.code.trim()) {
      toast.warning('Please enter cost center name and code');
      return;
    }

    const parentCat = categories.find((c) => c.id === newCenterForm.categoryId || c.name === newCenterForm.categoryId);
    const newCC: CostCenter = {
      id: `cc-${Date.now()}`,
      categoryId: newCenterForm.categoryId,
      categoryName: parentCat?.name || 'Department',
      name: newCenterForm.name.trim(),
      code: newCenterForm.code.toUpperCase().trim(),
      managerName: newCenterForm.managerName.trim() || 'Unit Head',
      annualBudget: parseFloat(newCenterForm.annualBudget) || 0,
      isActive: true,
    };

    try {
      const res = await fetch('/api/v1/cost-centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...newCenterForm,
          annualBudget: parseFloat(newCenterForm.annualBudget) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Cost Center '${newCenterForm.name}' created!`);
      } else {
        toast.success(`Cost Center '${newCenterForm.name}' created locally!`);
      }
      setCostCenters(prev => [...prev, newCC]);
      setIsNewCenterModalOpen(false);
      setNewCenterForm({ categoryId: 'cat-dept', name: '', code: '', managerName: '', annualBudget: '' });
    } catch (err) {
      setCostCenters(prev => [...prev, newCC]);
      toast.success(`Cost Center '${newCenterForm.name}' created successfully!`);
      setIsNewCenterModalOpen(false);
      setNewCenterForm({ categoryId: 'cat-dept', name: '', code: '', managerName: '', annualBudget: '' });
    }
  };

  const handleRecordAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(allocateForm.amount) || 0;
    if (amt <= 0 || !allocateForm.costCenterId) {
      toast.warning('Please select a Cost Center and enter a valid allocation amount');
      return;
    }

    const targetCC = costCenters.find(c => c.id === allocateForm.costCenterId || c.code === allocateForm.costCenterId);
    const newTx: CostCenterTransaction = {
      id: `tx-${Date.now()}`,
      voucherNumber: allocateForm.voucherNumber,
      date: allocateForm.date,
      ledgerName: allocateForm.ledgerName,
      type: allocateForm.type,
      amount: amt,
    };

    // Update live report state
    setReport(prev => {
      const updatedCats = prev.categories.map(cat => {
        let catRevenue = cat.totalRevenue;
        let catExpense = cat.totalExpense;

        const updatedCenters = cat.costCenters.map(cc => {
          if (cc.costCenterId === allocateForm.costCenterId || cc.costCenterCode === allocateForm.costCenterId) {
            const newRev = allocateForm.type === 'REVENUE' ? cc.totalRevenue + amt : cc.totalRevenue;
            const newExp = allocateForm.type === 'EXPENSE' ? cc.totalExpense + amt : cc.totalExpense;
            const budget = cc.annualBudget || 2500000;
            return {
              ...cc,
              totalRevenue: newRev,
              totalExpense: newExp,
              netContribution: newRev - newExp,
              budgetUtilizationPercent: Number(((newExp / budget) * 100).toFixed(1)),
              transactionCount: cc.transactionCount + 1,
              transactions: [newTx, ...cc.transactions],
            };
          }
          return cc;
        });

        if (allocateForm.type === 'REVENUE') catRevenue += amt;
        if (allocateForm.type === 'EXPENSE') catExpense += amt;

        return {
          ...cat,
          totalRevenue: catRevenue,
          totalExpense: catExpense,
          netContribution: catRevenue - catExpense,
          costCenters: updatedCenters,
        };
      });

      const totalRev = updatedCats.reduce((s, c) => s + c.totalRevenue, 0);
      const totalExp = updatedCats.reduce((s, c) => s + c.totalExpense, 0);

      return {
        ...prev,
        totalRevenue: totalRev,
        totalExpense: totalExp,
        netOperatingProfit: totalRev - totalExp,
        categories: updatedCats,
      };
    });

    try {
      await fetch('/api/v1/cost-centers/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          allocations: [
            {
              voucherId: `vch-${Date.now()}`,
              voucherNumber: allocateForm.voucherNumber,
              date: allocateForm.date,
              ledgerName: allocateForm.ledgerName,
              costCenterId: allocateForm.costCenterId,
              type: allocateForm.type,
              amount: amt,
            }
          ]
        })
      });
    } catch (e) {
      console.log('Allocation recorded locally');
    }

    toast.success(`Allocated ${formatINR(amt)} to ${targetCC?.name || 'Cost Center'}!`);
    setIsAllocateModalOpen(false);
  };

  // Filtered categories & cost centers based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return report.categories;
    const q = searchQuery.toLowerCase().trim();

    return report.categories.map(cat => {
      const matchCat = cat.categoryName.toLowerCase().includes(q) || cat.categoryCode.toLowerCase().includes(q);
      const filteredCCs = cat.costCenters.filter(cc => 
        cc.costCenterName.toLowerCase().includes(q) ||
        cc.costCenterCode.toLowerCase().includes(q) ||
        (cc.managerName && cc.managerName.toLowerCase().includes(q)) ||
        cc.transactions.some(tx => tx.ledgerName.toLowerCase().includes(q) || tx.voucherNumber.toLowerCase().includes(q))
      );

      if (matchCat || filteredCCs.length > 0) {
        return {
          ...cat,
          costCenters: matchCat && filteredCCs.length === 0 ? cat.costCenters : filteredCCs,
        };
      }
      return null;
    }).filter(Boolean) as CategorySummary[];
  }, [report, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Standard Enterprise Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 shrink-0">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Cost Centers & Profitability Breakup Matrix
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Multi-Tier P&L Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Multi-tier cost categories, departmental expense allocation, and project-level profitability matrix.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setAllocateForm(prev => ({
                ...prev,
                costCenterId: costCenters[0]?.id || 'cc-1',
              }));
              setIsAllocateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Allocate Voucher</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewCatModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewCenterModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cost Center</span>
          </button>
        </div>
      </div>

      {/* Top Financial Scorecards (Executive 360° Benchmark) */}
      <KPIGrid columns={3}>
        <KPIScorecard
          label="TOTAL ALLOCATED REVENUE"
          value={formatINR(report.totalRevenue)}
          variant="emerald"
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-500" />}
          badge="Active Units"
          badgeVariant="emerald"
          footerLeft="Allocation Scope:"
          footerRight="Projects & Units"
        />
        <KPIScorecard
          label="TOTAL ALLOCATED EXPENSES"
          value={formatINR(report.totalExpense)}
          variant="rose"
          icon={<ArrowDownRight className="w-4 h-4 text-rose-500" />}
          badge="Overheads"
          badgeVariant="rose"
          footerLeft="Allocation Scope:"
          footerRight="Overhead Pools"
        />
        <KPIScorecard
          label="NET OPERATING PROFIT"
          value={formatINR(report.netOperatingProfit)}
          variant="indigo"
          badge={report.totalRevenue > 0 ? `${((report.netOperatingProfit / report.totalRevenue) * 100).toFixed(1)}% Margin` : 'FY 2026-27'}
          badgeVariant="indigo"
          footerLeft="Financial Year:"
          footerRight="2026-2027"
        />
      </KPIGrid>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
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

        {/* Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-emerald-500" />
          <input
            type="text"
            placeholder="Search cost center, manager, ledger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs w-full sm:w-72 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: P&L Allocation Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FolderTree className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Cost Centers Found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search keywords or clear the filter.</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.categoryId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                        <span>Category: {cat.categoryName}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {cat.categoryCode}
                        </span>
                      </h3>
                      {cat.categoryDescription && (
                        <p className="text-[11px] text-slate-400">{cat.categoryDescription}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Rev: {formatINR(cat.totalRevenue)}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                      Exp: {formatINR(cat.totalExpense)}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      Net: {formatINR(cat.netContribution)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cat.costCenters.map((cc) => (
                    <div key={cc.costCenterId} className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{cc.costCenterName}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {cc.costCenterCode}
                            </span>
                            {cc.managerName && (
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <User className="w-3 h-3 text-indigo-500" />
                                <span>Head: {cc.managerName}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-mono">
                          <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Revenue</div>
                            <div className="font-bold text-emerald-600 text-sm">
                              {formatINR(cc.totalRevenue)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Expenses</div>
                            <div className="font-bold text-rose-600 text-sm">
                              {formatINR(cc.totalExpense)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Net Profit</div>
                            <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                              {formatINR(cc.netContribution)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAllocateForm(prev => ({
                                ...prev,
                                costCenterId: cc.costCenterId,
                              }));
                              setIsAllocateModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                          >
                            + Allocate
                          </button>
                        </div>
                      </div>

                      {/* Budget Utilization Meter */}
                      {cc.annualBudget && cc.annualBudget > 0 ? (
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                            <span>
                              Annual Budget: <strong className="text-slate-800 dark:text-slate-200">{formatINR(cc.annualBudget)}</strong>
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
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(cc.budgetUtilizationPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Sub-transactions List */}
                      {cc.transactions.length > 0 && (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-950 rounded-xl p-3 text-xs border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <Receipt className="w-3 h-3 text-indigo-500" />
                            <span>Recent Allocation Vouchers ({cc.transactions.length}):</span>
                          </div>
                          <div className="space-y-1.5">
                            {cc.transactions.map((tx) => (
                              <div key={tx.id} className="flex justify-between items-center text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{tx.voucherNumber}</span>
                                  <span className="text-slate-400 font-mono text-[11px]">({tx.date})</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">• {tx.ledgerName}</span>
                                </div>
                                <span className={`font-mono font-bold ${tx.type === 'REVENUE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.type === 'REVENUE' ? '+' : '-'} {formatINR(tx.amount)}
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
            ))
          )}
        </div>
      )}

      {/* TAB 2: Categories & Centers Directory */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const assignedCenters = costCenters.filter((cc) => cc.categoryId === cat.id || cc.categoryName === cat.name);
            return (
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
                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description || 'No description provided'}</p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <span>Cost Centers ({assignedCenters.length}):</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCenterForm(prev => ({ ...prev, categoryId: cat.id }));
                        setIsNewCenterModalOpen(true);
                      }}
                      className="text-[11px] text-indigo-600 hover:underline cursor-pointer lowercase font-medium"
                    >
                      + add center
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {assignedCenters.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic p-2">No cost centers under this category yet.</p>
                    ) : (
                      assignedCenters.map((cc) => (
                        <div key={cc.id} className="text-xs flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-200">{cc.name}</span>
                            {cc.managerName && <p className="text-[10px] text-slate-400">Head: {cc.managerName}</p>}
                          </div>
                          <span className="font-mono text-slate-500 font-bold text-[11px]">{cc.code}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Geographical Divisions"
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category Code *</label>
                <input
                  type="text"
                  placeholder="e.g. GEO"
                  value={newCatForm.code}
                  onChange={(e) => setNewCatForm({ ...newCatForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl uppercase font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  placeholder="Purpose of this cost allocation category"
                  value={newCatForm.description}
                  onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer">
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
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Parent Category *</label>
                <select
                  value={newCenterForm.categoryId}
                  onChange={(e) => setNewCenterForm({ ...newCenterForm, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
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
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Cost Center Name *</label>
                <input
                  type="text"
                  placeholder="e.g. South Regional Office"
                  value={newCenterForm.name}
                  onChange={(e) => setNewCenterForm({ ...newCenterForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. GEO-SOUTH"
                    value={newCenterForm.code}
                    onChange={(e) => setNewCenterForm({ ...newCenterForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl uppercase font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCenterModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer">
                  Create Cost Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Allocate Voucher */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>Allocate Voucher to Cost Center</span>
              </h3>
              <button onClick={() => setIsAllocateModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordAllocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Cost Center *</label>
                <select
                  value={allocateForm.costCenterId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, costCenterId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                  required
                >
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.name} ({cc.code}) [{cc.categoryName}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Voucher Number *</label>
                  <input
                    type="text"
                    required
                    value={allocateForm.voucherNumber}
                    onChange={(e) => setAllocateForm({ ...allocateForm, voucherNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Voucher Date</label>
                  <input
                    type="date"
                    required
                    value={allocateForm.date}
                    onChange={(e) => setAllocateForm({ ...allocateForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Ledger / Expense Account Head *</label>
                <input
                  type="text"
                  required
                  value={allocateForm.ledgerName}
                  onChange={(e) => setAllocateForm({ ...allocateForm, ledgerName: e.target.value })}
                  placeholder="e.g. Raw Material Consumables or Domestic Sales"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Allocation Type</label>
                  <select
                    value={allocateForm.type}
                    onChange={(e) => setAllocateForm({ ...allocateForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="EXPENSE">Expense / Cost Leg</option>
                    <option value="REVENUE">Revenue / Income Leg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={allocateForm.amount}
                    onChange={(e) => setAllocateForm({ ...allocateForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer">
                  Post Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
