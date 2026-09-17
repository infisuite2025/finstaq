import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  ShieldCheck,
  Plus,
  TrendingUp,
  FileText,
  Landmark,
  Users,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  Server,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UI } from '../../theme/uiTheme';

interface CategoryBreakdown {
  category: string;
  label: string;
  sizeBytes: number;
  sizeFormatted: string;
  fileCount: number;
  percentOfTotal: number;
}

interface StorageStats {
  tenantId: string;
  allocatedGB: number;
  allocatedBytes: number;
  usedBytes: number;
  usedGB: number;
  usedFormatted: string;
  availableBytes: number;
  availableFormatted: string;
  usedPercentage: number;
  totalFiles: number;
  maxFileSizeMB: number;
  storageDriver: 'local' | 's3' | 'azure';
  isHealthy: boolean;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  categories: CategoryBreakdown[];
}

const STORAGE_PACKS = [
  { id: 'pack-10', gb: 10, label: '+10 GB Starter Pack', priceINR: 499, popular: false, desc: 'Ideal for small retail & growing accounting firms' },
  { id: 'pack-50', gb: 50, label: '+50 GB Growth Pack', priceINR: 1999, popular: true, desc: 'Recommended for active multi-branch enterprises' },
  { id: 'pack-100', gb: 100, label: '+100 GB Scale Pack', priceINR: 3499, popular: false, desc: 'High-volume invoices, payroll records & audit attachments' },
  { id: 'pack-500', gb: 500, label: '+500 GB Archival Pack', priceINR: 12999, popular: false, desc: 'Complete 8-year statutory financial archive vault' },
];

export function StorageVaultWorkspace() {
  const { getAuthHeaders, session } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(STORAGE_PACKS[1]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const fetchStorageStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/storage/usage', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch storage usage', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const handlePurchaseStorage = async () => {
    setIsPurchasing(true);
    try {
      const res = await fetch('/api/v1/storage/add-on-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          addonGB: selectedPack.gb,
          packName: selectedPack.label,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Storage expanded by +${selectedPack.gb} GB! New Total: ${data.data.newTotalGB} GB.`);
        setStats(data.data.stats);
        setIsBuyModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to process storage add-on purchase');
      }
    } catch (err) {
      toast.error('Network error processing purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'EXCEEDED' || status === 'CRITICAL') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Quota Warning
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Approaching Limit
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> Vault Healthy
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoices':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'banking':
        return <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'payroll':
        return <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'statutory':
        return <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Top Banner */}
      <div className={UI.banner.container}>
        <div className="flex items-center gap-4">
          <div className={UI.banner.icon}>
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Encrypted Document Vault & Storage
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                AES-256-GCM Vault
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Zero-Trust tenant-isolated encrypted file repository for invoices, bank statements, payroll slips, and statutory filings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStorageStats}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Refresh Storage Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsBuyModalOpen(true)}
            className={UI.btn.primary}
          >
            <Plus className="w-4 h-4" />
            <span>Buy Additional Storage</span>
          </button>
        </div>
      </div>

      {/* Main Storage Utilization Card */}
      {stats && (
        <div className={`${UI.card.base} p-6 space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Storage Allocation</span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
                <span>{stats.usedFormatted}</span>
                <span className="text-sm font-semibold text-slate-400">/ {stats.allocatedGB} GB Allocated</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(stats.status)}
              <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                {stats.usedPercentage}% Consumed
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.usedPercentage >= 90
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    : stats.usedPercentage >= 70
                    ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/50'
                }`}
                style={{ width: `${Math.max(2, stats.usedPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>0 GB</span>
              <span>Available: {stats.availableFormatted} free</span>
              <span>{stats.allocatedGB} GB</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Files</span>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">
                {stats.totalFiles.toLocaleString('en-IN')} Files
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Max File Upload</span>
              <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                {stats.maxFileSizeMB} MB / file
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Storage Driver</span>
              <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 uppercase">
                {stats.storageDriver} Vault
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Security Standard</span>
              <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                AES-256-GCM
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Consumption Breakdown */}
      {stats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Storage Breakdown by Module
            </h2>
            <span className="text-xs text-slate-400 font-medium">{stats.categories.length} Categories Tracked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.categories.map((cat) => (
              <div
                key={cat.category}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {cat.fileCount} files
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {cat.sizeFormatted}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                    {cat.percentOfTotal}% of used
                  </span>
                </div>

                {/* Micro Category Progress */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.max(3, cat.percentOfTotal)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security & Zero-Trust Notice Card */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero-Trust Enterprise Storage Architecture</span>
        </div>
        <p className="leading-relaxed">
          All document uploads are partitioned under dedicated tenant prefixes (<code>tenants/{session?.tenantId || 'tenant'}/...</code>), validated via binary magic signatures, and encrypted at rest using AES-256-GCM. Direct static file URLs are prohibited; all downloads are streamed via short-lived authenticated channels.
        </p>
      </div>

      {/* Buy Additional Storage Modal */}
      {isBuyModalOpen && (
        <div className={UI.modal.backdrop}>
          <div className={`${UI.modal.box} max-w-2xl p-6 sm:p-8 space-y-6`}>
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Storage Expansion Pack</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Buy Additional Cloud Storage
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Expand your organization's encrypted vault with instant allocation and zero downtime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pack Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {STORAGE_PACKS.map((pack) => {
                const isSelected = selectedPack.id === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                        Most Popular
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{pack.label}</span>
                      <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                        ₹{pack.priceINR.toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-normal">/mo</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{pack.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Selected Add-on:</span>
                <strong className="text-slate-900 dark:text-white">{selectedPack.label}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Current Quota:</span>
                <span className="font-mono">{stats?.allocatedGB} GB</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>New Total Quota after Upgrade:</span>
                <span className="font-mono font-bold text-emerald-600">{(stats?.allocatedGB || 0) + selectedPack.gb} GB</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Monthly Add-on Charge:</span>
                <span className="font-mono text-blue-600">₹{selectedPack.priceINR.toLocaleString('en-IN')} / month</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className={UI.btn.secondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchaseStorage}
                disabled={isPurchasing}
                className={`${UI.btn.primary} px-6`}
              >
                {isPurchasing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Activate +{selectedPack.gb} GB</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default StorageVaultWorkspace;
