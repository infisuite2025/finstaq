import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AllMastersBundle,
  CustomerMaster,
  VendorMaster,
  InventoryItemMaster,
  UnitOfMeasurement,
  ItemCategory,
  Warehouse,
  CostCenter,
  PaymentTerm,
  TaxRateMaster,
  HsnDirectoryItem,
  CurrencyMaster,
  LedgerGroup,
  LedgerMaster,
} from '../../types/masters';
import { CreateCustomerModal } from './CreateCustomerModal';
import { CreateVendorModal } from './CreateVendorModal';
import { CreateInventoryModal } from './CreateInventoryModal';
import { CreateUomModal } from './CreateUomModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { CreateWarehouseModal } from './CreateWarehouseModal';
import { CreateGroupModal } from './CreateGroupModal';
import { CreatePaymentTermModal } from './CreatePaymentTermModal';
import { CreateCostCenterModal } from './CreateCostCenterModal';
import { CreateTaxRateModal } from './CreateTaxRateModal';
import { CreateCurrencyModal } from './CreateCurrencyModal';
import { CreateLedgerModal } from './CreateLedgerModal';
import { LegacyDataMigrationModal } from '../migration/LegacyDataMigrationModal';

import {
  Users,
  Building2,
  Package,
  Ruler,
  Layers,
  MapPin,
  CreditCard,
  Percent,
  Coins,
  Search,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  FolderTree,
  Tag,
  Briefcase,
  Sliders,
  Database,
} from 'lucide-react';


type MasterTab =
  | 'coa'
  | 'customers'
  | 'vendors'
  | 'inventory'
  | 'uom'
  | 'categories'
  | 'warehouses'
  | 'cost_centers'
  | 'payment_terms'
  | 'tax_rates'
  | 'currencies';

export const MastersHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MasterTab>('coa');
  const { getAuthHeaders } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Master Data States
  const [uoms, setUoms] = useState<UnitOfMeasurement[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRateMaster[]>([]);
  const [hsnCodes, setHsnCodes] = useState<HsnDirectoryItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyMaster[]>([]);
  const [groups, setGroups] = useState<LedgerGroup[]>([]);
  const [ledgers, setLedgers] = useState<LedgerMaster[]>([]);
  const [customers, setCustomers] = useState<CustomerMaster[]>([]);
  const [vendors, setVendors] = useState<VendorMaster[]>([]);
  const [items, setItems] = useState<InventoryItemMaster[]>([]);

  // Modal Open States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isPaymentTermModalOpen, setIsPaymentTermModalOpen] = useState(false);
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [isTaxRateModalOpen, setIsTaxRateModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);


  // Load all masters bundle
  const loadMasters = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId') || '27AABCF1234F1Z5';

      const res = await fetch('http://localhost:3000/api/v1/masters/all', {
        headers: {
          Authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data: AllMastersBundle = json.data;
        setUoms(data.uoms || []);
        setCategories(data.categories || []);
        setWarehouses(data.warehouses || []);
        setCostCenters(data.costCenters || []);
        setPaymentTerms(data.paymentTerms || []);
        setTaxRates(data.taxRates || []);
        setHsnCodes(data.hsnSacCodes || []);
        setCurrencies(data.currencies || []);
        setGroups(data.groups || []);
        setLedgers(data.ledgers || []);
        setCustomers(data.customers || []);
        setVendors(data.vendors || []);
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch masters bundle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  };

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case 'ASSET':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'LIABILITY':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'INCOME':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'EXPENSE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'EQUITY':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Enterprise Masters Hub</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Zero Hardcoding Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dynamic relational architecture: Manage Chart of Accounts, UoMs, Tax Slabs, Warehouses, Categories, Contacts & Statutory registries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsMigrationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-sm transition cursor-pointer"
            title="Migrate 2-3 Years of Historical Books from Tally, Busy, Zoho, QuickBooks or Excel"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Import Legacy ERP Data</span>
          </button>

          <button
            onClick={loadMasters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-muted transition"
            title="Refresh All Masters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>


          <div className="relative">
            <button
              onClick={() => {
                if (activeTab === 'coa') setIsLedgerModalOpen(true);
                else if (activeTab === 'customers') setIsCustomerModalOpen(true);
                else if (activeTab === 'vendors') setIsVendorModalOpen(true);
                else if (activeTab === 'inventory') setIsInventoryModalOpen(true);
                else if (activeTab === 'uom') setIsUomModalOpen(true);
                else if (activeTab === 'categories') setIsCategoryModalOpen(true);
                else if (activeTab === 'warehouses') setIsWarehouseModalOpen(true);
                else if (activeTab === 'cost_centers') setIsCostCenterModalOpen(true);
                else if (activeTab === 'payment_terms') setIsPaymentTermModalOpen(true);
                else if (activeTab === 'tax_rates') setIsTaxRateModalOpen(true);
                else if (activeTab === 'currencies') setIsCurrencyModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {activeTab === 'coa' && 'Add Ledger Account'}
              {activeTab === 'customers' && 'New Customer'}
              {activeTab === 'vendors' && 'New Vendor'}
              {activeTab === 'inventory' && 'New Stock Item'}
              {activeTab === 'uom' && 'New UoM'}
              {activeTab === 'categories' && 'New Item Category'}
              {activeTab === 'warehouses' && 'New Warehouse'}
              {activeTab === 'cost_centers' && 'New Cost Center'}
              {activeTab === 'payment_terms' && 'New Payment Term'}
              {activeTab === 'tax_rates' && 'New Tax Slab'}
              {activeTab === 'currencies' && 'New Currency'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Ledgers</span>
            <span className="text-base font-bold">{ledgers.length}</span>
          </div>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Customers</span>
            <span className="text-base font-bold">{customers.length}</span>
          </div>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Vendors</span>
            <span className="text-base font-bold">{vendors.length}</span>
          </div>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">SKUs</span>
            <span className="text-base font-bold">{items.length}</span>
          </div>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">UoMs</span>
            <span className="text-base font-bold">{uoms.length}</span>
          </div>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Godowns</span>
            <span className="text-base font-bold">{warehouses.length}</span>
          </div>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">GST Slabs</span>
            <span className="text-base font-bold">{taxRates.length}</span>
          </div>
        </div>
      </div>

      {/* Modern Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b pb-2 scrollbar-none">
        {[
          { id: 'coa', label: 'Chart of Accounts', icon: FolderTree, count: ledgers.length },
          { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
          { id: 'vendors', label: 'Vendors', icon: Building2, count: vendors.length },
          { id: 'inventory', label: 'Inventory Items', icon: Package, count: items.length },
          { id: 'uom', label: 'Units (UoM)', icon: Ruler, count: uoms.length },
          { id: 'categories', label: 'Item Categories', icon: Layers, count: categories.length },
          { id: 'warehouses', label: 'Warehouses', icon: MapPin, count: warehouses.length },
          { id: 'cost_centers', label: 'Cost Centers', icon: Briefcase, count: costCenters.length },
          { id: 'payment_terms', label: 'Payment Terms', icon: CreditCard, count: paymentTerms.length },
          { id: 'tax_rates', label: 'Tax Slabs & HSN', icon: Percent, count: taxRates.length },
          { id: 'currencies', label: 'Currencies & FX', icon: Coins, count: currencies.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MasterTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter records by code, name, tax or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border bg-background"
          />
        </div>
        {activeTab === 'coa' && (
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-muted"
          >
            <Plus className="w-3.5 h-3.5" />
            New Account Group
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: CHART OF ACCOUNTS & GROUPS */}
      {activeTab === 'coa' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Groups Tree Card */}
            <div className="bg-card border rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b mb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Chart of Accounts Hierarchy</h3>
                </div>
                <span className="text-[11px] text-muted-foreground">{groups.length} Groups Configured</span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {groups
                  .filter((g) => !g.parentId)
                  .map((rootGroup) => {
                    const childGroups = groups.filter((g) => g.parentId === rootGroup.id);
                    const groupLedgers = ledgers.filter((l) => l.groupId === rootGroup.id);
                    return (
                      <div key={rootGroup.id} className="p-3 bg-muted/20 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{rootGroup.name}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getNatureColor(rootGroup.nature)}`}>
                              {rootGroup.nature}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {childGroups.length} Sub-groups | {groupLedgers.length} Ledgers
                          </span>
                        </div>

                        {childGroups.length > 0 && (
                          <div className="pl-4 border-l-2 border-primary/30 space-y-1 pt-1">
                            {childGroups.map((sub) => {
                              const subLedgers = ledgers.filter((l) => l.groupId === sub.id);
                              return (
                                <div key={sub.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40 text-xs">
                                  <span className="text-foreground/90 font-medium">↳ {sub.name}</span>
                                  <span className="text-[10px] font-mono text-muted-foreground">({subLedgers.length} ledgers)</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Ledgers Master List */}
            <div className="bg-card border rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b mb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold">Ledger Accounts Master Directory</h3>
                </div>
                <span className="text-[11px] text-muted-foreground">{ledgers.length} Ledgers</span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {ledgers
                  .filter((l) => (l.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || ((l.code || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
                  .map((l) => {
                    const group = groups.find((g) => g.id === l.groupId);
                    return (
                      <div key={l.id} className="p-3 bg-muted/10 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{l.name}</span>
                            {l.code && <span className="text-[10px] font-mono text-muted-foreground">[{l.code}]</span>}
                          </div>
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            Under: <strong className="text-foreground">{group?.name || 'General'}</strong> ({group?.nature || 'ASSET'})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs block">{formatCurrency(Number(l.openingBalance))}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">GSTIN / PAN</th>
                  <th className="px-4 py-3">Credit Terms</th>
                  <th className="px-4 py-3">Credit Limit</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers
                  .filter((c) => (c.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || ((c.gstIn || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{c.code || '-'}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className="font-semibold text-primary">{c.gstIn || '-'}</span>
                        {c.pan && <span className="block text-[10px] text-muted-foreground">PAN: {c.pan}</span>}
                      </td>
                      <td className="px-4 py-3 font-mono">{c.creditPeriodDays ?? 30} Days</td>
                      <td className="px-4 py-3 font-mono">{c.creditLimit ? formatCurrency(Number(c.creditLimit)) : 'Unlimited'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div>{c.contactPerson || '-'}</div>
                        <div className="text-[10px]">{c.phone || c.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(c.currentBalance))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Vendor / Supplier Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">GSTIN / PAN</th>
                  <th className="px-4 py-3">Bank Settlement Info</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors
                  .filter((v) => (v.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || ((v.gstIn || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
                  .map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-semibold text-foreground">{v.name}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{v.code || '-'}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{v.gstIn || '-'}</span>
                        {v.pan && <span className="block text-[10px] text-muted-foreground">PAN: {v.pan}</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div>A/C: {v.bankAccount || 'Not Specified'}</div>
                        <div className="text-muted-foreground">IFSC: {v.ifscCode || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div>{v.contactPerson || '-'}</div>
                        <div className="text-[10px]">{v.phone || v.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(Number(v.currentBalance))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: INVENTORY ITEMS */}
      {activeTab === 'inventory' && (
        <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">SKU / Code</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">UoM</th>
                  <th className="px-4 py-3">HSN & Tax %</th>
                  <th className="px-4 py-3">Standard Cost</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3 text-right">Physical Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items
                  .filter((i) => (i.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || ((i.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
                  .map((i) => {
                    const isLowStock = Number(i.closingStockQty) <= (i.reorderLevel ?? 10);
                    return (
                      <tr key={i.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{i.sku}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{i.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-medium">{i.category || 'General'}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">{i.unit}</td>
                        <td className="px-4 py-3 font-mono">
                          <span className="font-semibold">{i.hsnCode || '8481'}</span>
                          <span className="text-[10px] text-muted-foreground block">{i.taxRatePercent ?? 18}% GST</span>
                        </td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(Number(i.standardCost ?? 0))}</td>
                        <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(Number(i.sellingPrice ?? 0))}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <div className="flex items-center justify-end gap-1.5">
                            {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            <span className={`font-bold ${isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {Number(i.closingStockQty)} {i.unit}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Min Safety: {i.reorderLevel ?? 10}</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: UNITS OF MEASUREMENT */}
      {activeTab === 'uom' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uoms.map((u) => (
            <div key={u.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-2 hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-primary">{u.symbol}</span>
                {u.isDefault && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 rounded border border-emerald-500/20">
                    System Default
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm">{u.formalName}</h4>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t font-mono">
                <span>GST UQC: <strong>{u.uqc || u.symbol}</strong></span>
                <span>Decimals: <strong>{u.decimalPlaces}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 6: ITEM CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-2 hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{c.name}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">{c.code || 'CAT'}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.description || 'General product category'}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t font-mono">
                <span>Default HSN: <strong>{c.defaultHsn || '8481'}</strong></span>
                <span>GST: <strong className="text-primary">{c.defaultTaxRate ?? 18}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 7: WAREHOUSES & GODOWNS */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <div key={w.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-3 hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-primary">{w.code}</span>
                {w.isPrimary && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-600 rounded border border-blue-500/20">
                    Primary Godown
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{w.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{w.address}, {w.city}, {w.state} - {w.pincode}</p>
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <span className="block">In-charge: <strong className="text-foreground">{w.contactPerson || 'Not Assigned'}</strong></span>
                <span className="font-mono text-[11px]">{w.phone || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 8: COST CENTERS */}
      {activeTab === 'cost_centers' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {costCenters.map((cc) => (
            <div key={cc.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-2 hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-primary">{cc.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-medium">{cc.category || 'General'}</span>
              </div>
              <h4 className="font-semibold text-sm">{cc.name}</h4>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 9: PAYMENT TERMS */}
      {activeTab === 'payment_terms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentTerms.map((pt) => (
            <div key={pt.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-2 hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-primary">{pt.code}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                  {pt.days} Days
                </span>
              </div>
              <h4 className="font-semibold text-sm">{pt.name}</h4>
              <p className="text-xs text-muted-foreground">{pt.description || 'Standard invoice payment term'}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 10: TAX SLABS & HSN */}
      {activeTab === 'tax_rates' && (
        <div className="space-y-6">
          {/* Tax Slabs */}
          <div>
            <h3 className="text-sm font-bold mb-3">Statutory GST Tax Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {taxRates.map((t) => (
                <div key={t.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary">{t.ratePercent}%</span>
                    {t.isDefault && <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 rounded">Standard</span>}
                  </div>
                  <h4 className="font-semibold text-xs">{t.name}</h4>
                  <div className="p-2 bg-muted/30 rounded border text-[11px] font-mono grid grid-cols-3 gap-1 text-center">
                    <div><span className="block text-[9px] text-muted-foreground font-sans">CGST</span>{t.cgstPercent}%</div>
                    <div><span className="block text-[9px] text-muted-foreground font-sans">SGST</span>{t.sgstPercent}%</div>
                    <div><span className="block text-[9px] text-muted-foreground font-sans">IGST</span>{t.igstPercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HSN Registry */}
          <div>
            <h3 className="text-sm font-bold mb-3">Indian Statutory HSN/SAC Directory</h3>
            <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">HSN / SAC Code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Statutory Classification / Scope</th>
                    <th className="px-4 py-3 text-right">Default GST Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hsnCodes.map((h) => (
                    <tr key={h.id || h.code} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{h.code}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.type === 'GOODS' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{h.description}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">{h.defaultGstRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 11: CURRENCIES & EXCHANGE RATES */}
      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currencies.map((cur) => (
            <div key={cur.id} className="p-4 bg-card border rounded-xl shadow-xs space-y-3 hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-primary">{cur.code}</span>
                <span className="text-lg font-bold w-8 h-8 rounded-full bg-muted flex items-center justify-center">{cur.symbol}</span>
              </div>
              <h4 className="font-semibold text-sm">{cur.name}</h4>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t font-mono">
                <span>Decimals: <strong>{cur.decimalPlaces}</strong></span>
                <span>FX to Base: <strong>₹{Number(cur.exchangeRate).toFixed(2)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALL MODAL DIALOGS */}
      <CreateCustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSubmit={() => loadMasters()} />
      <CreateVendorModal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} onSubmit={() => loadMasters()} />
      <CreateInventoryModal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} onSubmit={() => loadMasters()} />
      <CreateUomModal isOpen={isUomModalOpen} onClose={() => setIsUomModalOpen(false)} onSuccess={() => loadMasters()} />
      <CreateCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onSuccess={() => loadMasters()} />
      <CreateWarehouseModal isOpen={isWarehouseModalOpen} onClose={() => setIsWarehouseModalOpen(false)} onSuccess={() => loadMasters()} />
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} groups={groups} onSuccess={() => loadMasters()} />
      <CreateLedgerModal isOpen={isLedgerModalOpen} onClose={() => setIsLedgerModalOpen(false)} groups={groups} onSuccess={() => loadMasters()} />
      <CreatePaymentTermModal isOpen={isPaymentTermModalOpen} onClose={() => setIsPaymentTermModalOpen(false)} onSuccess={() => loadMasters()} />
      <CreateCostCenterModal isOpen={isCostCenterModalOpen} onClose={() => setIsCostCenterModalOpen(false)} onSuccess={() => loadMasters()} />
      <CreateTaxRateModal isOpen={isTaxRateModalOpen} onClose={() => setIsTaxRateModalOpen(false)} onSuccess={() => loadMasters()} />
      <CreateCurrencyModal isOpen={isCurrencyModalOpen} onClose={() => setIsCurrencyModalOpen(false)} onSuccess={() => loadMasters()} />
      <LegacyDataMigrationModal isOpen={isMigrationModalOpen} onClose={() => setIsMigrationModalOpen(false)} onMigrationComplete={() => loadMasters()} />
    </div>
  );
};

