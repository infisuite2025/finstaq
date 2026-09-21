import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Download,
  Trash2,
  Search,
  Upload,
  Layers,
  FileCode,
  Archive,
  Eye,
  FileCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { KPIGrid, KPIScorecard } from '../common/KPIScorecard';
import { StandardTabs } from '../common/StandardTabs';
import { UI } from '../../theme/uiTheme';

export interface StoredDocumentMetadata {
  id: string;
  tenantId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: 'invoices' | 'banking' | 'payroll' | 'statutory' | 'inventory' | 'other';
  checksumSha256: string;
  storageDriver: 'local' | 's3' | 'azure';
  storagePath: string;
  isEncrypted: boolean;
  uploadedBy?: string;
  createdAt: string;
}

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

const CATEGORY_OPTIONS = [
  { value: 'invoices', label: 'Sales & Purchase Invoices', icon: FileText, color: 'text-blue-600' },
  { value: 'banking', label: 'Bank Statements & Cheques', icon: Landmark, color: 'text-emerald-600' },
  { value: 'payroll', label: 'Payroll & Employee HR Docs', icon: Users, color: 'text-indigo-600' },
  { value: 'statutory', label: 'GST, TDS & Statutory Filings', icon: Percent, color: 'text-amber-600' },
  { value: 'inventory', label: 'Inventory & BOM Drawings', icon: Layers, color: 'text-purple-600' },
  { value: 'other', label: 'Audit Attachments & Others', icon: Archive, color: 'text-slate-600' },
];

export function StorageVaultWorkspace() {
  const { getAuthHeaders, session } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [stats, setStats] = useState<StorageStats | null>(null);
  const [files, setFiles] = useState<StoredDocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(STORAGE_PACKS[1]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState<'invoices' | 'banking' | 'payroll' | 'statutory' | 'inventory' | 'other'>('invoices');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStorageData = async () => {
    setIsLoading(true);
    try {
      const [usageRes, filesRes] = await Promise.all([
        fetch('/api/v1/storage/usage', { headers: getAuthHeaders() }),
        fetch('/api/v1/storage/files', { headers: getAuthHeaders() }),
      ]);

      const usageData = await usageRes.json();
      if (usageData.success && usageData.data) {
        setStats(usageData.data);
      }

      const filesData = await filesRes.json();
      if (filesData.success && Array.isArray(filesData.data)) {
        setFiles(filesData.data);
      }
    } catch (err) {
      console.error('Failed to fetch storage data', err);
      toast.error('Could not load storage data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
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

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please choose a document to upload');
      return;
    }

    if (stats && selectedFile.size > stats.maxFileSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds tenant limit (${stats.maxFileSizeMB} MB)`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', uploadCategory);

      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Encrypted & stored: ${selectedFile.name}`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploadModalOpen(false);
        fetchStorageData();
      } else {
        toast.error(data.error || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Upload error', err);
      toast.error('Network error during document upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: StoredDocumentMetadata) => {
    try {
      toast.info(`Decrypting & streaming ${file.originalName}...`);
      const res = await fetch(`/api/v1/storage/download/${file.id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded: ${file.originalName}`);
    } catch (err) {
      console.error('Download error', err);
      toast.error('Could not download or decrypt document');
    }
  };

  const handleDeleteFile = async (file: StoredDocumentMetadata) => {
    const ok = await confirm({
      title: 'Delete Encrypted Document?',
      message: `Are you sure you want to permanently erase "${file.originalName}" from the AES-256-GCM encrypted vault? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      confirmColor: 'danger',
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/v1/storage/files/${file.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Document securely erased from vault');
        fetchStorageData();
      } else {
        toast.error(data.error || 'Could not delete document');
      }
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Network error erasing document');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0.00 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'EXCEEDED' || status === 'CRITICAL') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Quota Warning
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Approaching Limit
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Vault Healthy
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
      case 'inventory':
        return <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch =
        searchQuery === '' ||
        f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.checksumSha256.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.uploadedBy && f.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [files, searchQuery, categoryFilter]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      {/* Top Banner */}
      <div className="finstaq-banner">
        <div className="flex items-center gap-3.5">
          <div className="finstaq-banner-icon">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Encrypted Document Vault & Storage
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                AES-256-GCM Vault
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Zero-Trust tenant-isolated encrypted file repository for invoices, bank statements, payroll slips, and statutory filings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={fetchStorageData}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Refresh Storage Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="finstaq-btn-secondary"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBuyModalOpen(true)}
            className="finstaq-btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buy Additional Storage</span>
          </button>
        </div>
      </div>

      {/* Main Storage Utilization Card */}
      {stats && (
        <div className="finstaq-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Storage Allocation</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 flex items-baseline gap-2">
                <span>{stats.usedFormatted}</span>
                <span className="text-xs font-semibold text-slate-400">/ {stats.allocatedGB} GB Allocated</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(stats.status)}
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {stats.usedPercentage}% Consumed
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
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
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>0 GB</span>
              <span>Available: <strong>{stats.availableFormatted}</strong> free</span>
              <span>{stats.allocatedGB} GB</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <KPIGrid cols={4}>
            <KPIScorecard
              label="TOTAL FILES"
              value={`${stats.totalFiles.toLocaleString('en-IN')} Files`}
              icon={<FileCheck className="w-4 h-4 text-slate-500" />}
              badge="Vault Indexed"
              badgeVariant="default"
              footerLeft="Storage Driver:"
              footerRight="Local Vault"
            />
            <KPIScorecard
              label="MAX FILE UPLOAD"
              value={`${stats.maxFileSizeMB} MB / file`}
              variant="indigo"
              icon={<Zap className="w-4 h-4 text-indigo-500" />}
              badge="Single Limit"
              badgeVariant="indigo"
              footerLeft="Upload Buffer:"
              footerRight="Chunk Streamed"
            />
            <KPIScorecard
              label="STORAGE DRIVER"
              value={`${stats.storageDriver.toUpperCase()} VAULT`}
              variant="emerald"
              icon={<Server className="w-4 h-4 text-emerald-500" />}
              badge="Partitioned"
              badgeVariant="emerald"
              footerLeft="Isolation Mode:"
              footerRight="Tenant-Dedicated"
            />
            <KPIScorecard
              label="SECURITY STANDARD"
              value="AES-256-GCM"
              variant="default"
              icon={<Key className="w-4 h-4 text-blue-500" />}
              badge="Hardware Key"
              badgeVariant="blue"
              footerLeft="Checksum:"
              footerRight="SHA-256 Verified"
            />
          </KPIGrid>
        </div>
      )}

      {/* Category Consumption Breakdown */}
      {stats && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Storage Breakdown by Module
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">{stats.categories.length} Categories Tracked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.categories.map((cat) => (
              <div
                key={cat.category}
                onClick={() => setCategoryFilter(categoryFilter === cat.category ? 'all' : cat.category)}
                className={`finstaq-card p-3.5 space-y-2 cursor-pointer transition-all hover:border-blue-400 ${
                  categoryFilter === cat.category ? 'ring-2 ring-blue-500/20 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                    {cat.fileCount} files
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {cat.sizeFormatted}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {cat.percentOfTotal}% of used
                  </span>
                </div>

                {/* Micro Category Progress */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
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

      {/* Encrypted File Explorer Table */}
      <div className="finstaq-card overflow-hidden space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Encrypted Documents Vault Explorer</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredFiles.length} Documents
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Encrypted binary records streamed on-demand with zero plaintext exposure.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-1 rounded-md transition ${
                  categoryFilter === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('invoices')}
                className={`px-2 py-1 rounded-md transition ${
                  categoryFilter === 'invoices' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Invoices
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('banking')}
                className={`px-2 py-1 rounded-md transition ${
                  categoryFilter === 'banking' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Banking
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('payroll')}
                className={`px-2 py-1 rounded-md transition ${
                  categoryFilter === 'payroll' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Payroll
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('statutory')}
                className={`px-2 py-1 rounded-md transition ${
                  categoryFilter === 'statutory' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Statutory
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="finstaq-input pl-8 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="finstaq-table">
            <thead>
              <tr>
                <th className="finstaq-th">Document Name</th>
                <th className="finstaq-th">Category</th>
                <th className="finstaq-th">Size</th>
                <th className="finstaq-th">Security / Checksum</th>
                <th className="finstaq-th">Uploaded By</th>
                <th className="finstaq-th">Date</th>
                <th className="finstaq-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-xs">No encrypted documents match your criteria</p>
                    <p className="text-[11px] mt-0.5">Click "Upload Document" to add invoices, payroll files, or statutory reports.</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="finstaq-tr">
                    <td className="finstaq-td font-bold">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-xs text-slate-900 dark:text-white" title={file.originalName}>
                          {file.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="finstaq-td">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {file.category}
                      </span>
                    </td>
                    <td className="finstaq-td font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatBytes(file.sizeBytes)}
                    </td>
                    <td className="finstaq-td">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> AES-256
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]" title={file.checksumSha256}>
                          {file.checksumSha256.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="finstaq-td text-[11px] text-slate-500 dark:text-slate-400">
                      {file.uploadedBy || 'System'}
                    </td>
                    <td className="finstaq-td text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(file.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="finstaq-td text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition cursor-pointer"
                          title="Decrypt & Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                          title="Secure Erase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Zero-Trust Notice Card */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero-Trust Enterprise Storage Architecture</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          All document uploads are partitioned under dedicated tenant prefixes (<code>tenants/{session?.tenantId || 'tenant'}/...</code>), validated via binary magic signatures, and encrypted at rest using AES-256-GCM. Direct static file URLs are prohibited; all downloads are streamed via short-lived authenticated channels.
        </p>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="finstaq-modal-backdrop">
          <div className="finstaq-modal-box max-w-lg">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Upload Encrypted Document</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Files are validated for signature authenticity and encrypted on write.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="finstaq-label">Target Module Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="finstaq-select"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="finstaq-label">Select Document (PDF, ZIP, Image, DOCX, CSV)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="finstaq-input file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</span>
                    <span className="font-mono text-slate-500">{formatBytes(selectedFile.size)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-700 dark:text-blue-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Automatic AES-256 Encryption</span>
                </div>
                <p>The uploaded payload will be encrypted with tenant key & verified via SHA-256 before disk persistence.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="finstaq-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="finstaq-btn-primary"
                >
                  {isUploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Encrypt & Store</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buy Additional Storage Modal */}
      {isBuyModalOpen && (
        <div className="finstaq-modal-backdrop">
          <div className="finstaq-modal-box max-w-2xl p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Storage Expansion Pack</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Buy Additional Cloud Storage
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STORAGE_PACKS.map((pack) => {
                const isSelected = selectedPack.id === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2 right-3 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                        Most Popular
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{pack.label}</span>
                      <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                        ₹{pack.priceINR.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{pack.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
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
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-xs text-slate-900 dark:text-white">
                <span>Monthly Add-on Charge:</span>
                <span className="font-mono text-blue-600">₹{selectedPack.priceINR.toLocaleString('en-IN')} / month</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="finstaq-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchaseStorage}
                disabled={isPurchasing}
                className="finstaq-btn-primary px-5"
              >
                {isPurchasing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Activate +{selectedPack.gb} GB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
