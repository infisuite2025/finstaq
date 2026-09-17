import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Search,
  Factory,
  Layers,
  Building2,
  RefreshCw,
  Clock,
  Printer,
  Calendar
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';

interface JobWorkOutwardChallan {
  id: string;
  challanNumber: string;
  challanDate: string;
  jobWorkerName: string;
  jobWorkerGstin: string;
  jobWorkerAddress: string;
  natureOfProcessing: string;
  expectedReturnDate: string;
  status: 'PENDING_RECEIPT' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED';
  items: Array<{
    itemSku: string;
    description: string;
    hsnCode: string;
    uom: string;
    dispatchQuantity: number;
    ratePerUnit: number;
    taxableValue: number;
    receivedQuantity: number;
    scrapReturnedQuantity: number;
  }>;
}

interface JobWorkReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  challanNumber: string;
  jobWorkerName: string;
  finishedItemSku: string;
  finishedItemName: string;
  quantityReceived: number;
  rawMaterialConsumedQty: number;
  scrapPercentage: number;
  jobWorkChargesInr: number;
}

export function JobWorkWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'challans' | 'receipts' | 'balances' | 'itc04'>('challans');
  const { getAuthHeaders } = useAuth();
  const [challans, setChallans] = useState<JobWorkOutwardChallan[]>([]);
  const [receipts, setReceipts] = useState<JobWorkReceipt[]>([]);
  const [itc04Data, setItc04Data] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Challan Modal
  const [isNewChallanModalOpen, setIsNewChallanModalOpen] = useState(false);
  const [newChallanForm, setNewChallanForm] = useState({
    jobWorkerName: 'Apex Precision Engineering Works',
    jobWorkerGstin: '27AABCA9876K1Z9',
    jobWorkerAddress: 'Plot 44, MIDC Industrial Area, Pune, Maharashtra',
    natureOfProcessing: 'CNC Milling, Deburring & Zinc Plating',
    expectedReturnDate: '2026-05-15',
    itemSku: 'RM-STEEL-ROD-01',
    description: 'Forged Alloy Steel Round Rods 25mm',
    hsnCode: '72142090',
    uom: 'KG',
    dispatchQuantity: 1000,
    ratePerUnit: 85,
  });

  // Record Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [newReceiptForm, setNewReceiptForm] = useState({
    challanNumber: 'JWC/2026/04/001',
    jobWorkerName: 'Apex Precision Engineering Works',
    finishedItemSku: 'FG-VALVE-SHAFT-01',
    finishedItemName: 'Precision Finished Valve Shafts',
    quantityReceived: 500,
    rawMaterialConsumedQty: 500,
    scrapPercentage: 5,
    jobWorkChargesInr: 17500,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [chRes, rcRes, itcRes] = await Promise.all([
        fetch('/api/v1/jobwork/challans', { headers: { ...getAuthHeaders() } }),
        fetch('/api/v1/jobwork/receipts', { headers: { ...getAuthHeaders() } }),
        fetch('/api/v1/jobwork/form-itc04?quarter=Q1&year=2026-27', { headers: { ...getAuthHeaders() } }),
      ]);
      const [chData, rcData, itcData] = await Promise.all([chRes.json(), rcRes.json(), itcRes.json()]);
      if (chData.success) setChallans(Array.isArray(chData.data) ? chData.data : []);
      if (rcData.success) setReceipts(Array.isArray(rcData.data) ? rcData.data : []);
      if (itcData.success) setItc04Data(itcData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        challanNumber: `JWC/2026/04/${(challans.length + 1).toString().padStart(3, '0')}`,
        challanDate: new Date().toISOString().split('T')[0],
        jobWorkerName: newChallanForm.jobWorkerName,
        jobWorkerGstin: newChallanForm.jobWorkerGstin,
        jobWorkerAddress: newChallanForm.jobWorkerAddress,
        natureOfProcessing: newChallanForm.natureOfProcessing,
        expectedReturnDate: newChallanForm.expectedReturnDate,
        items: [
          {
            itemSku: newChallanForm.itemSku,
            description: newChallanForm.description,
            hsnCode: newChallanForm.hsnCode,
            uom: newChallanForm.uom,
            dispatchQuantity: Number(newChallanForm.dispatchQuantity),
            ratePerUnit: Number(newChallanForm.ratePerUnit),
            taxableValue: Number(newChallanForm.dispatchQuantity) * Number(newChallanForm.ratePerUnit),
            receivedQuantity: 0,
            scrapReturnedQuantity: 0,
          },
        ],
      };

      const res = await fetch('/api/v1/jobwork/challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Outward Job Work Challan ${data.data.challanNumber} issued successfully!`);
        setIsNewChallanModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create challan');
    }
  };

  const handleRecordReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        receiptNumber: `JWR/2026/04/${(receipts.length + 1).toString().padStart(3, '0')}`,
        receiptDate: new Date().toISOString().split('T')[0],
        challanNumber: newReceiptForm.challanNumber,
        jobWorkerName: newReceiptForm.jobWorkerName,
        finishedItemSku: newReceiptForm.finishedItemSku,
        finishedItemName: newReceiptForm.finishedItemName,
        quantityReceived: Number(newReceiptForm.quantityReceived),
        rawMaterialConsumedQty: Number(newReceiptForm.rawMaterialConsumedQty),
        scrapPercentage: Number(newReceiptForm.scrapPercentage),
        jobWorkChargesInr: Number(newReceiptForm.jobWorkChargesInr),
      };

      const res = await fetch('/api/v1/jobwork/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Job Work Receipt ${data.data.receiptNumber} recorded! Stock updated.`);
        setIsReceiptModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to record receipt');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-800">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Work & Subcontracting Hub</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                GST Sec 143 • Form ITC-04
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dispatch raw materials under delivery challans, track goods with job workers, scrap recovery, and quarterly Form ITC-04 returns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewChallanModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Outward Challan
          </button>
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Record Goods Receipt
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <StandardTabs<'challans' | 'receipts' | 'balances' | 'itc04'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'challans',
            label: 'Outward Dispatch Challans',
            icon: Truck,
            badge: challans.length,
            badgeVariant: 'default',
          },
          {
            id: 'receipts',
            label: 'Inward Goods Receipts',
            icon: CheckCircle2,
            badge: receipts.length,
            badgeVariant: 'success',
          },
          {
            id: 'balances',
            label: 'Job Worker Stock Balances',
            icon: Factory,
          },
          {
            id: 'itc04',
            label: 'Quarterly Form ITC-04 Return',
            icon: FileSpreadsheet,
          },
        ]}
      />

      {/* TAB 1: Outward Challans */}
      {activeTab === 'challans' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Delivery Challans under Section 143 (Outward)</h3>
            <span className="text-xs text-slate-500">1 Year statutory return window tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Challan # & Date</th>
                  <th className="p-3.5">Job Worker & GSTIN</th>
                  <th className="p-3.5">Material Dispatched</th>
                  <th className="p-3.5">Nature of Processing</th>
                  <th className="p-3.5 text-right">Dispatched Qty</th>
                  <th className="p-3.5 text-right">Received Qty</th>
                  <th className="p-3.5 text-right">Taxable Value</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {challans.map((ch) => {
                  const item = ch.items[0];
                  return (
                    <tr key={ch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5">
                        <div className="font-bold text-indigo-600 font-mono">{ch.challanNumber}</div>
                        <div className="text-[11px] text-slate-400">{ch.challanDate}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{ch.jobWorkerName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{ch.jobWorkerGstin}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{item?.description}</div>
                        <div className="text-[11px] font-mono text-slate-400">HSN: {item?.hsnCode}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{ch.natureOfProcessing}</td>
                      <td className="p-3.5 text-right font-mono font-bold">{item?.dispatchQuantity} {item?.uom}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600">{item?.receivedQuantity || 0} {item?.uom}</td>
                      <td className="p-3.5 text-right font-mono font-bold">₹{(item?.taxableValue || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ch.status === 'FULLY_RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {ch.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Inward Receipts */}
      {activeTab === 'receipts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Goods Received Back from Job Worker</h3>
            <span className="text-xs text-slate-500">Includes Scrap Recovery and Processing Charges</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Receipt # & Date</th>
                  <th className="p-3.5">Linked Challan #</th>
                  <th className="p-3.5">Job Worker</th>
                  <th className="p-3.5">Finished Product Received</th>
                  <th className="p-3.5 text-right">Qty Received</th>
                  <th className="p-3.5 text-right">RM Consumed</th>
                  <th className="p-3.5 text-right">Scrap %</th>
                  <th className="p-3.5 text-right">Job Work Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {receipts.map((rc) => (
                  <tr key={rc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold font-mono text-emerald-600">{rc.receiptNumber}</td>
                    <td className="p-3.5 font-mono text-indigo-600">{rc.challanNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{rc.jobWorkerName}</td>
                    <td className="p-3.5 font-medium">{rc.finishedItemName}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600">{rc.quantityReceived} PCS</td>
                    <td className="p-3.5 text-right font-mono">{rc.rawMaterialConsumedQty} KG</td>
                    <td className="p-3.5 text-right font-mono text-amber-600">{rc.scrapPercentage}%</td>
                    <td className="p-3.5 text-right font-mono font-bold">₹{rc.jobWorkChargesInr.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Job Worker Stock Balances */}
      {activeTab === 'balances' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Apex Precision Engineering Works</h4>
                <span className="text-xs text-slate-500">MIDC Industrial Area, Pune</span>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full text-xs font-bold">
                700 KG Pending
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Material:</span>
                <span className="font-semibold">Forged Alloy Steel Round Rods 25mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispatched:</span>
                <span className="font-mono">1,500 KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Received Back:</span>
                <span className="font-mono text-emerald-600">800 KG</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Current Balance with Job Worker:</span>
                <span className="font-mono text-amber-600">700 KG</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Vanguard Heat Treaters Pvt Ltd</h4>
                <span className="text-xs text-slate-500">Wagle Estate, Thane</span>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full text-xs font-bold">
                500 PCS Pending
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Material:</span>
                <span className="font-semibold">Spur Gear Blanks 120mm OD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispatched:</span>
                <span className="font-mono">500 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Received Back:</span>
                <span className="font-mono text-emerald-600">0 PCS</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Current Balance with Job Worker:</span>
                <span className="font-mono text-amber-600">500 PCS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Form ITC-04 Return */}
      {activeTab === 'itc04' && itc04Data && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Quarterly Statement Form ITC-04</h3>
              <p className="text-xs text-slate-500">Goods dispatched to/received back from job workers (Q1 2026-27)</p>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(itc04Data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'GST_FORM_ITC04_Q1_2026-27.json';
                a.click();
                toast.success('Form ITC-04 JSON downloaded for GST portal upload!');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download GST ITC-04 JSON
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-500">Total Goods Dispatched</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">2,000 KG</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-500">Total Goods Received Back</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">800 KG</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-500">Balance with Job Workers</span>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">1,200 KG</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-500">Total Job Work Value</span>
              <div className="text-xl font-bold font-mono text-indigo-600 mt-1">₹2,47,500</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Issue Challan */}
      {isNewChallanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              Issue Outward Delivery Challan (Sec 143)
            </h3>

            <form onSubmit={handleCreateChallan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Job Worker Name</label>
                <input
                  type="text"
                  required
                  value={newChallanForm.jobWorkerName}
                  onChange={(e) => setNewChallanForm({ ...newChallanForm, jobWorkerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Job Worker GSTIN</label>
                  <input
                    type="text"
                    required
                    value={newChallanForm.jobWorkerGstin}
                    onChange={(e) => setNewChallanForm({ ...newChallanForm, jobWorkerGstin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    required
                    value={newChallanForm.expectedReturnDate}
                    onChange={(e) => setNewChallanForm({ ...newChallanForm, expectedReturnDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nature of Processing to be Done</label>
                <input
                  type="text"
                  required
                  value={newChallanForm.natureOfProcessing}
                  onChange={(e) => setNewChallanForm({ ...newChallanForm, natureOfProcessing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Raw Material Description</label>
                <input
                  type="text"
                  required
                  value={newChallanForm.description}
                  onChange={(e) => setNewChallanForm({ ...newChallanForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Dispatch Qty</label>
                  <input
                    type="number"
                    required
                    value={newChallanForm.dispatchQuantity}
                    onChange={(e) => setNewChallanForm({ ...newChallanForm, dispatchQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">UOM</label>
                  <input
                    type="text"
                    required
                    value={newChallanForm.uom}
                    onChange={(e) => setNewChallanForm({ ...newChallanForm, uom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newChallanForm.ratePerUnit}
                    onChange={(e) => setNewChallanForm({ ...newChallanForm, ratePerUnit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewChallanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition"
                >
                  Issue Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Receipt */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Record Inward Goods Receipt Back
            </h3>

            <form onSubmit={handleRecordReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Outward Challan #</label>
                <select
                  value={newReceiptForm.challanNumber}
                  onChange={(e) => setNewReceiptForm({ ...newReceiptForm, challanNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {challans.map((c) => (
                    <option key={c.id} value={c.challanNumber}>
                      {c.challanNumber} ({c.jobWorkerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Finished Goods Item Name</label>
                <input
                  type="text"
                  required
                  value={newReceiptForm.finishedItemName}
                  onChange={(e) => setNewReceiptForm({ ...newReceiptForm, finishedItemName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Quantity Received Back (PCS)</label>
                  <input
                    type="number"
                    required
                    value={newReceiptForm.quantityReceived}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, quantityReceived: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">RM Consumed (KG)</label>
                  <input
                    type="number"
                    required
                    value={newReceiptForm.rawMaterialConsumedQty}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, rawMaterialConsumedQty: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Scrap Recovered (%)</label>
                  <input
                    type="number"
                    required
                    value={newReceiptForm.scrapPercentage}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, scrapPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Job Work Charges (₹)</label>
                  <input
                    type="number"
                    required
                    value={newReceiptForm.jobWorkChargesInr}
                    onChange={(e) => setNewReceiptForm({ ...newReceiptForm, jobWorkChargesInr: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition"
                >
                  Save Receipt & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
