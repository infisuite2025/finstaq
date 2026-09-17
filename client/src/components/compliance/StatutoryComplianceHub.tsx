import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  FileCode2,
  Truck,
  Calculator,
  Download,
  Eye,
  CheckCircle2,
  QrCode,
  Copy,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  Percent
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';

interface TdsSection {
  sectionCode: string;
  description: string;
  defaultRateIndHuf: number;
  defaultRateCorporate: number;
  singleThreshold: number;
  aggregateThreshold: number;
  defaultPayableLedgerName: string;
}

interface Form26QData {
  formType: string;
  quarter: string;
  financialYear: string;
  tan: string;
  totalDeductees: number;
  totalGrossPaid: number;
  totalTdsDeducted: number;
  sectionWiseSummary: Record<string, number>;
  deductees: any[];
}

export function StatutoryComplianceHub() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'e-invoice' | 'eway-bill' | 'tds-form26q' | 'tcs-form27eq'>('e-invoice');
  const { getAuthHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // E-Invoice State
  const [einvDocNo, setEinvDocNo] = useState<string>('INV/2026/04/001');
  const [einvDocDate, setEinvDocDate] = useState<string>('15/04/2026');
  const [einvResult, setEinvResult] = useState<any | null>(null);

  // E-Way Bill State
  const [ewbDocNo, setEwbDocNo] = useState<string>('INV/2026/04/001');
  const [ewbDocDate, setEwbDocDate] = useState<string>('15/04/2026');
  const [ewbTransporterId, setEwbTransporterId] = useState<string>('27AAAAA0000A1Z5');
  const [ewbTransporterName, setEwbTransporterName] = useState<string>('SafeExpress Logistics Ltd');
  const [ewbDistance, setEwbDistance] = useState<number>(250);
  const [ewbVehicleNo, setEwbVehicleNo] = useState<string>('MH04DE8899');
  const [ewbResult, setEwbResult] = useState<any | null>(null);

  // TDS State
  const [tdsSections, setTdsSections] = useState<TdsSection[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [form26qData, setForm26qData] = useState<Form26QData | null>(null);

  // TCS State
  const [form27eqData, setForm27eqData] = useState<any | null>(null);
  const [tcsBuyerId, setTcsBuyerId] = useState('cust-1');
  const [tcsBuyerName, setTcsBuyerName] = useState('Tata Motors Limited');
  const [tcsBuyerPan, setTcsBuyerPan] = useState('AABCT5544M');
  const [tcsCurrentSale, setTcsCurrentSale] = useState<number>(500000);
  const [tcsResult, setTcsResult] = useState<any | null>(null);

  // Calculator State
  const [calcSection, setCalcSection] = useState<string>('194J');
  const [calcGross, setCalcGross] = useState<number>(100000);
  const [calcPan, setCalcPan] = useState<string>('ABCDE1234F');
  const [calcResult, setCalcResult] = useState<any | null>(null);

  useEffect(() => {
    fetchTdsSections();
    fetchForm26q(selectedQuarter);
    fetchForm27eq(selectedQuarter);
  }, []);

  useEffect(() => {
    fetchForm26q(selectedQuarter);
    fetchForm27eq(selectedQuarter);
  }, [selectedQuarter]);

  const fetchTdsSections = async () => {
    try {
      const res = await fetch('/api/v1/tax/tds-sections', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTdsSections(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch TDS sections', err);
    }
  };

  const fetchForm26q = async (quarter: string) => {
    try {
      const res = await fetch(`/api/v1/tax/form-26q?quarter=${quarter}&fy=2026-2027`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setForm26qData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Form 26Q', err);
    }
  };

  const fetchForm27eq = async (quarter: string) => {
    try {
      const res = await fetch(`/api/v1/tax/form-27eq?quarter=${quarter}&fy=2026-2027`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setForm27eqData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Form 27EQ', err);
    }
  };

  const handleGenerateEInvoice = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/compliance/e-invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({ documentNumber: einvDocNo, documentDate: einvDocDate }),
      });
      const data = await res.json();
      if (data.success) {
        setEinvResult(data.data);
        toast.success('NIC E-Invoice Payload & IRN signed successfully!');
      } else {
        toast.error(data.error || 'Failed to generate E-Invoice');
      }
    } catch (err) {
      toast.error('Network error generating E-Invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEwb = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/compliance/eway-bill/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({
          documentNumber: ewbDocNo,
          documentDate: ewbDocDate,
          transporterId: ewbTransporterId,
          transporterName: ewbTransporterName,
          distanceKm: ewbDistance,
          vehicleNumber: ewbVehicleNo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEwbResult(data.data);
        toast.success('E-Way Bill generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate E-Way Bill');
      }
    } catch (err) {
      toast.error('Network error generating E-Way Bill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateTds = async () => {
    try {
      const res = await fetch('/api/v1/tax/calculate-tds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionCode: calcSection, grossAmount: calcGross, vendorPan: calcPan }),
      });
      const data = await res.json();
      if (data.success) {
        setCalcResult(data.data);
        toast.success('TDS deduction calculated!');
      }
    } catch (err) {
      toast.error('Calculation failed');
    }
  };

  const handleCalculateTcs = async () => {
    try {
      const res = await fetch('/api/v1/tax/calculate-tcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': getAuthHeaders()['x-tenant-id'] },
        body: JSON.stringify({
          buyerPartyId: tcsBuyerId,
          buyerName: tcsBuyerName,
          buyerPan: tcsBuyerPan,
          currentInvoiceAmount: tcsCurrentSale,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTcsResult(data.data);
        toast.success('TCS u/s 206C(1H) calculated!');
      }
    } catch (err) {
      toast.error('TCS calculation failed');
    }
  };

  const downloadJson = (obj: any, filename: string) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', filename);
    dlAnchor.click();
    toast.info(`Downloaded ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Statutory & Tax Compliance Hub</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                NIC Portal • Form 26Q • Form 27EQ (TCS)
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Official NIC E-Invoice (IRN/QR), E-Way Bill (Schema v1.03), Quarterly Form 26Q e-TDS and Section 206C(1H) TCS Form 27EQ.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <StandardTabs<'e-invoice' | 'eway-bill' | 'tds-form26q' | 'tcs-form27eq'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'e-invoice',
            label: 'E-Invoice (IRN/QR)',
            icon: FileCode2,
          },
          {
            id: 'eway-bill',
            label: 'E-Way Bill (NIC)',
            icon: Truck,
          },
          {
            id: 'tds-form26q',
            label: 'TDS & Form 26Q Returns',
            icon: Calculator,
          },
          {
            id: 'tcs-form27eq',
            label: 'TCS Sec 206C(1H) & Form 27EQ',
            icon: Percent,
            badge: '₹50L Limit Tracker',
            badgeVariant: 'warning',
          },
        ]}
      />

      {/* TAB 1: E-INVOICE GENERATOR */}
      {activeTab === 'e-invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-600" />
              <span>Generate NIC E-Invoice Payload</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invoice / Document Number</label>
                <input
                  type="text"
                  value={einvDocNo}
                  onChange={(e) => setEinvDocNo(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invoice Date (DD/MM/YYYY)</label>
                <input
                  type="text"
                  value={einvDocDate}
                  onChange={(e) => setEinvDocDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleGenerateEInvoice}
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate NIC JSON & IRN Hash</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {einvResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    IRN Generated Successfully
                  </h4>
                  <button
                    onClick={() => downloadJson(einvResult, `einv_${einvDocNo}.json`)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download NIC JSON
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">IRN:</span>
                    <p className="font-bold break-all text-slate-900 dark:text-white">{einvResult.irn}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ack No / Date:</span>
                    <p className="text-slate-700 dark:text-slate-300">{einvResult.ackNo} • {einvResult.ackDate}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                Click Generate to produce schema-compliant NIC E-Invoice payload
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: E-WAY BILL GENERATOR */}
      {activeTab === 'eway-bill' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span>E-Way Bill Generation Parameters</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold">Document #</label>
                  <input
                    type="text"
                    value={ewbDocNo}
                    onChange={(e) => setEwbDocNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold">Vehicle #</label>
                  <input
                    type="text"
                    value={ewbVehicleNo}
                    onChange={(e) => setEwbVehicleNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold">Transporter Name & GSTIN</label>
                <input
                  type="text"
                  value={ewbTransporterName}
                  onChange={(e) => setEwbTransporterName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <button
                onClick={handleGenerateEwb}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
              >
                Generate E-Way Bill
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {ewbResult ? (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  E-Way Bill Generated
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">EWB Number:</span>
                    <p className="font-bold text-base text-indigo-600">{ewbResult.ewbNo}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Validity:</span>
                    <p className="text-slate-700 dark:text-slate-300">{ewbResult.validUpto}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                Fill details to generate official E-Way Bill #
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TDS & Form 26Q */}
      {activeTab === 'tds-form26q' && form26qData && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Form 26Q e-TDS Quarterly Statement</h3>
              <p className="text-xs text-slate-500">Total Deductions: ₹{form26qData.totalTdsDeducted.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={() => downloadJson(form26qData, 'form_26q_2026-27.json')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Form 26Q JSON
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b">
                  <th className="p-3">Section</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">PAN</th>
                  <th className="p-3 text-right">Gross Paid</th>
                  <th className="p-3 text-right">TDS Deducted</th>
                  <th className="p-3 text-center">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {form26qData.deductees.map((d: any) => (
                  <tr key={d.recordId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-indigo-600">Sec {d.section}</td>
                    <td className="p-3 font-medium">{d.deducteeName}</td>
                    <td className="p-3 font-mono">{d.panOfDeductee}</td>
                    <td className="p-3 text-right font-mono">₹{d.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">₹{d.tdsDeducted.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-center font-mono">{d.rateAtWhichDeducted}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TCS Section 206C(1H) & Form 27EQ */}
      {activeTab === 'tcs-form27eq' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-600" />
                <span>TCS Calculator u/s 206C(1H)</span>
              </h3>
              <p className="text-xs text-slate-500">
                0.1% TCS on sale of goods exceeding ₹50,00,000 to a single buyer in a financial year.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Buyer Name</label>
                  <input
                    type="text"
                    value={tcsBuyerName}
                    onChange={(e) => setTcsBuyerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Buyer PAN</label>
                  <input
                    type="text"
                    value={tcsBuyerPan}
                    onChange={(e) => setTcsBuyerPan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Current Invoice Amount (₹)</label>
                  <input
                    type="number"
                    value={tcsCurrentSale}
                    onChange={(e) => setTcsCurrentSale(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono font-bold text-base"
                  />
                </div>

                <button
                  onClick={handleCalculateTcs}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
                >
                  Compute TCS & Threshold Status
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {tcsResult ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">TCS Computation Breakdown</h4>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                      tcsResult.isThresholdCrossed ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tcsResult.isThresholdCrossed ? '₹50L Threshold Crossed' : 'Within ₹50L Limit'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono">
                    <div>
                      <span className="text-slate-400">Previous YTD Sales:</span>
                      <p className="font-bold text-slate-900 dark:text-white">₹{tcsResult.previousSalesYtd.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">New YTD Sales:</span>
                      <p className="font-bold text-slate-900 dark:text-white">₹{tcsResult.newTotalSalesYtd.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Amount Subject to TCS:</span>
                      <p className="font-bold text-indigo-600">₹{tcsResult.amountSubjectToTcs.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">TCS Rate Applied:</span>
                      <p className="font-bold text-slate-900 dark:text-white">{tcsResult.tcsRatePercent}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">Total TCS to Collect:</span>
                      <div className="text-2xl font-black text-emerald-600 font-mono">₹{tcsResult.tcsAmount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">Invoice Total with TCS:</span>
                      <div className="text-lg font-bold font-mono">₹{tcsResult.totalInvoiceWithTcs.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  Enter buyer sale details to compute Section 206C(1H) TCS
                </div>
              )}
            </div>
          </div>

          {/* Form 27EQ Annexure */}
          {form27eqData && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Form 27EQ Quarterly TCS Return Register</h3>
                  <p className="text-xs text-slate-500">Tax collected at source on sales &gt; ₹50 Lakhs (Q1 2026-27)</p>
                </div>
                <button
                  onClick={() => downloadJson(form27eqData, 'form_27eq_Q1_2026-27.json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Form 27EQ JSON
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b">
                      <th className="p-3">Buyer Name</th>
                      <th className="p-3">Buyer PAN</th>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3 text-right">Sale Amount</th>
                      <th className="p-3 text-right">TCS Subject Value</th>
                      <th className="p-3 text-right">TCS Collected (0.1%)</th>
                      <th className="p-3">Challan Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {form27eqData.collectees.map((c: any) => (
                      <tr key={c.recordId} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.buyerName}</td>
                        <td className="p-3 font-mono">{c.buyerPan}</td>
                        <td className="p-3 font-mono text-indigo-600">{c.invoiceNumber}</td>
                        <td className="p-3 text-right font-mono">₹{c.taxableSaleAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-bold text-indigo-600">₹{c.amountSubjectToTcs.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">₹{c.tcsCollected.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-mono text-slate-500">{c.challanNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
