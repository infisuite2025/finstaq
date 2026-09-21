import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SalesOrder, DeliveryChallan, SalesSummary } from '../../types/sales';
import { CreateSoModal } from './CreateSoModal';
import { CreateChallanModal } from './CreateChallanModal';
import { GenerateInvoiceModal } from './GenerateInvoiceModal';
import { CreateSalesReturnModal, SalesReturnFormData } from './CreateSalesReturnModal';
import { UniversalDocumentPrintModal, PrintDocumentData } from '../common/UniversalDocumentPrintModal';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';
import {
  TrendingUp,
  Truck,
  Receipt,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Building2,
  DollarSign,
  PackageCheck,
  Printer,
  RotateCcw,
} from 'lucide-react';

const INITIAL_CUSTOMERS = [
  { id: 'c-101', name: 'Acme Enterprises (Debtor)', gstin: '27AAACW1234F1Z1' },
  { id: 'c-102', name: 'Bharat Forge & Heavy Machining Ltd', gstin: '27AABCB8821N1Z5' },
  { id: 'c-103', name: 'Mahindra Precision Components Ltd', gstin: '27AABCM4410K1Z9' },
];

const INITIAL_SOS: SalesOrder[] = [
  {
    id: 'so-001',
    tenantId: '27AABCF1234F1Z5',
    soNumber: 'SO-2026-1044',
    customerLedgerId: 'c-101',
    customerLedger: { id: 'c-101', name: 'Acme Enterprises (Debtor)', gstin: '27AAACW1234F1Z1' },
    orderDate: '2026-09-12',
    deliveryDueDate: '2026-09-19',
    status: 'CONFIRMED',
    subtotal: 161100,
    taxAmount: 28998,
    totalAmount: 190098,
    customerPoReference: 'PO/ACME/SEP-89',
    paymentTerms: 'Net 30 Days from Dispatch Date',
    shippingAddress: 'Plot 42, MIDC Industrial Area, Pune 411018',
    items: [
      {
        description: 'Custom High-Precision Flange Assembly M24',
        hsnCode: '8481',
        quantity: 15,
        unitPrice: 8500,
        taxRatePercent: 18,
      },
      {
        description: 'Industrial Heavy Duty Bearing Kits Type B',
        hsnCode: '8482',
        quantity: 8,
        unitPrice: 4200,
        taxRatePercent: 18,
      },
    ],
    createdAt: '2026-09-12T10:30:00Z',
  },
  {
    id: 'so-002',
    tenantId: '27AABCF1234F1Z5',
    soNumber: 'SO-2026-1045',
    customerLedgerId: 'c-102',
    customerLedger: { id: 'c-102', name: 'Bharat Forge & Heavy Machining Ltd', gstin: '27AABCB8821N1Z5' },
    orderDate: '2026-09-13',
    deliveryDueDate: '2026-09-20',
    status: 'COMPLETED',
    subtotal: 85000,
    taxAmount: 15300,
    totalAmount: 100300,
    customerPoReference: 'PO/BF/2026/04',
    paymentTerms: 'Immediate upon delivery',
    shippingAddress: 'Gate 3, Bharat Forge Works, Mundhwa, Pune 411036',
    items: [
      {
        description: 'Hardened Steel Shafts 45mm x 500mm',
        hsnCode: '7214',
        quantity: 10,
        unitPrice: 8500,
        taxRatePercent: 18,
      },
    ],
    createdAt: '2026-09-13T09:15:00Z',
  },
];

const INITIAL_CHALLANS: DeliveryChallan[] = [
  {
    id: 'dc-001',
    tenantId: '27AABCF1234F1Z5',
    challanNumber: 'DC-OUT-2026-0312',
    soId: 'so-002',
    so: { id: 'so-002', soNumber: 'SO-2026-1045' },
    customerLedgerId: 'c-102',
    customerLedger: { id: 'c-102', name: 'Bharat Forge & Heavy Machining Ltd' },
    dispatchDate: '2026-09-13',
    vehicleNumber: 'MH-14-GH-4412',
    transporterName: 'VRL Logistics Fleet',
    eWayBillNumber: '241088921094',
    status: 'DISPATCHED',
    remarks: 'Dispatched 10 units with warranty card and inspection certificate.',
    items: [
      {
        description: 'Hardened Steel Shafts 45mm x 500mm',
        dispatchedQty: 10,
        batchNumber: 'BAT-2026-09B',
      },
    ],
    createdAt: '2026-09-13T11:00:00Z',
  },
];


const INITIAL_SALES_RETURNS = [
  {
    id: 'sr-001',
    tenantId: '27AABCF1234F1Z5',
    returnNumber: 'SR-2026-0031',
    customerLedgerId: 'c-102',
    customerLedger: { id: 'c-102', name: 'Bharat Forge & Heavy Machining Ltd', gstin: '27AABCB8821N1Z5' },
    originalInvoiceNumber: 'INV-2026-081',
    soNumber: 'SO-2026-1045',
    returnDate: '2026-09-13',
    reason: 'CUSTOMER_REJECTION',
    destinationWarehouseId: 'wh-01',
    destinationWarehouseName: 'Finished Goods Godown A - Pune',
    qcDisposition: 'RESTOCK_GOOD',
    creditNoteNumber: 'CN-2026-0071',
    creditNoteId: 'cn-001',
    status: 'CREDITED',
    subtotal: 17000,
    cgstAmount: 1530,
    sgstAmount: 1530,
    igstAmount: 0,
    totalTax: 3060,
    totalAmount: 20060,
    remarks: 'Customer returned 2 units due to minor bore tolerance mismatch. Re-inspected and restocked to finished goods inventory.',
    items: [
      {
        description: 'Hardened Steel Shafts 45mm x 500mm',
        hsnCode: '7214',
        returnedQty: 2,
        acceptedQty: 2,
        rejectedQty: 0,
        unitPrice: 8500,
        taxableAmount: 17000,
        gstRatePercent: 18,
        cgstAmount: 1530,
        sgstAmount: 1530,
        igstAmount: 0,
        totalAmount: 20060,
        qcNotes: 'Pass visual & magnetic particle inspection',
      },
    ],
    createdAt: '2026-09-13T14:10:00Z',
  },
];

export function SalesDashboard() {
  const [activeTab, setActiveTab] = useState<'sos' | 'challans' | 'invoices' | 'returns'>('sos');
  const { getAuthHeaders } = useAuth();
  const [salesReturns, setSalesReturns] = useState<any[]>(INITIAL_SALES_RETURNS);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [sos, setSos] = useState<SalesOrder[]>(INITIAL_SOS);
  const [challans, setChallans] = useState<DeliveryChallan[]>(INITIAL_CHALLANS);
  const [invoices, setInvoices] = useState<any[]>([
    {
      id: 'inv-001',
      voucherNumber: 'INV-2026-081',
      date: '2026-09-13',
      soNumber: 'SO-2026-1045',
      customerName: 'Bharat Forge & Heavy Machining Ltd',
      taxable: 85000,
      tax: 15300,
      totalAmount: 100300,
      status: 'POSTED',
    },
  ]);

  const [isSoModalOpen, setIsSoModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Universal Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<PrintDocumentData | null>(null);

  // Computed Metrics
  const totalSalesRevenue = sos.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
  const totalSosCount = sos.length;
  const totalChallanCount = challans.length;
  const pendingDispatchCount = sos.filter((s) => s.status === 'CONFIRMED').length;

  
  const handlePrintSalesReturn = (ret: any) => {
    setPrintData({
      type: 'SALES_RETURN',
      documentNumber: ret.returnNumber,
      date: ret.returnDate,
      referenceNumber: ret.originalInvoiceNumber,
      partyName: ret.customerLedger?.name || 'Customer Debtor',
      partyGstin: ret.customerLedger?.gstin || '27AAACW1234F1Z1',
      partyAddress: 'Customer Facility, Plot 42, MIDC, Pune',
      partyState: 'Maharashtra (27)',
      items: ret.items.map((it: any) => ({
        description: it.description,
        hsnCode: it.hsnCode || '7214',
        uom: 'NOS',
        quantity: it.returnedQty,
        acceptedQty: it.acceptedQty,
        rejectedQty: it.rejectedQty,
        unitPrice: it.unitPrice,
        taxableAmount: it.taxableAmount,
        gstRatePercent: it.gstRatePercent,
        cgstAmount: it.cgstAmount,
        sgstAmount: it.sgstAmount,
        igstAmount: it.igstAmount,
        totalAmount: it.totalAmount,
      })),
      subtotal: ret.subtotal,
      cgstAmount: ret.cgstAmount,
      sgstAmount: ret.sgstAmount,
      igstAmount: ret.igstAmount,
      totalTax: ret.totalTax,
      grandTotal: ret.totalAmount,
      narration: `Reason: ${ret.reason}. QC Disposition: ${ret.qcDisposition}. Restock Godown: ${ret.destinationWarehouseName}. Credit Note: ${ret.creditNoteNumber || 'Issued'}. Remarks: ${ret.remarks}`,
    });
    setPrintModalOpen(true);
  };

  const handleCreateSalesReturn = (formData: SalesReturnFormData) => {
    const seq = salesReturns.length + 32;
    const returnNumber = 'SR-2026-00' + seq;
    const creditNoteNumber = formData.autoCreateCreditNote ? ('CN-2026-00' + (salesReturns.length + 72)) : undefined;

    const newReturn = {
      id: 'sr-' + Date.now(),
      tenantId: '27AABCF1234F1Z5',
      returnNumber,
      customerLedgerId: formData.customerLedgerId,
      customerLedger: {
        id: formData.customerLedgerId,
        name: formData.customerName,
        gstin: formData.customerGstin || '27AAACW1234F1Z1',
      },
      originalInvoiceNumber: formData.originalInvoiceNumber,
      soNumber: formData.soNumber || 'SO-2026-1045',
      returnDate: formData.returnDate,
      reason: formData.reason,
      destinationWarehouseId: formData.destinationWarehouseId,
      destinationWarehouseName: formData.destinationWarehouseName,
      qcDisposition: formData.qcDisposition,
      creditNoteNumber,
      creditNoteId: creditNoteNumber ? ('cn-' + Date.now()) : undefined,
      status: 'CREDITED',
      subtotal: formData.subtotal,
      cgstAmount: formData.cgstAmount,
      sgstAmount: formData.sgstAmount,
      igstAmount: formData.igstAmount,
      totalTax: formData.totalTax,
      totalAmount: formData.totalAmount,
      remarks: formData.remarks,
      items: formData.items,
      createdAt: new Date().toISOString(),
    };

    setSalesReturns([newReturn, ...salesReturns]);
  };

  const handleCreateSo = (soData: Partial<SalesOrder>) => {
    const customer = INITIAL_CUSTOMERS.find((c) => c.id === soData.customerLedgerId);
    const newSo: SalesOrder = {
      id: `so-${Date.now()}`,
      tenantId: '27AABCF1234F1Z5',
      soNumber: soData.soNumber || `SO-${Date.now().toString().slice(-4)}`,
      customerLedgerId: soData.customerLedgerId || '',
      customerLedger: customer,
      orderDate: soData.orderDate || new Date().toISOString().split('T')[0],
      deliveryDueDate: soData.deliveryDueDate,
      status: 'CONFIRMED',
      subtotal: soData.subtotal || 0,
      taxAmount: soData.taxAmount || 0,
      totalAmount: soData.totalAmount || 0,
      customerPoReference: soData.customerPoReference,
      paymentTerms: soData.paymentTerms,
      shippingAddress: soData.shippingAddress,
      items: soData.items || [],
      createdAt: new Date().toISOString(),
    };
    setSos([newSo, ...sos]);
  };

  const handleCreateChallan = (challanData: Partial<DeliveryChallan>) => {
    const customer = INITIAL_CUSTOMERS.find((c) => c.id === challanData.customerLedgerId);
    const so = sos.find((s) => s.id === challanData.soId);
    const newChallan: DeliveryChallan = {
      id: `dc-${Date.now()}`,
      tenantId: '27AABCF1234F1Z5',
      challanNumber: challanData.challanNumber || `DC-${Date.now().toString().slice(-4)}`,
      soId: challanData.soId,
      so: so ? { id: so.id, soNumber: so.soNumber } : undefined,
      customerLedgerId: challanData.customerLedgerId || '',
      customerLedger: customer,
      dispatchDate: challanData.dispatchDate || new Date().toISOString().split('T')[0],
      vehicleNumber: challanData.vehicleNumber,
      transporterName: challanData.transporterName,
      eWayBillNumber: challanData.eWayBillNumber,
      status: 'DISPATCHED',
      remarks: challanData.remarks,
      items: challanData.items || [],
      createdAt: new Date().toISOString(),
    };
    setChallans([newChallan, ...challans]);
  };

  const handleGenerateInvoice = (invoiceData: {
    soId: string;
    voucherNumber: string;
    date: string;
    salesLedgerId: string;
    cgstLedgerId?: string;
    sgstLedgerId?: string;
    igstLedgerId?: string;
    narration: string;
  }) => {
    const so = sos.find((s) => s.id === invoiceData.soId);
    const newInvoice = {
      id: `inv-${Date.now()}`,
      voucherNumber: invoiceData.voucherNumber,
      date: invoiceData.date,
      soNumber: so?.soNumber || 'SO-Direct',
      customerName: so?.customerLedger?.name || 'Customer Ledger',
      taxable: so?.subtotal || 0,
      tax: so?.taxAmount || 0,
      totalAmount: so?.totalAmount || 0,
      status: 'POSTED',
    };
    setInvoices([newInvoice, ...invoices]);
  };

  const handlePrintSo = (so: SalesOrder) => {
    const pData: PrintDocumentData = {
      type: 'SO',
      documentNumber: so.soNumber,
      date: so.orderDate,
      referenceNumber: so.customerPoReference,
      dueDate: so.deliveryDueDate,
      partyName: so.customerLedger?.name || 'Customer Debtor',
      partyGstin: so.customerLedger?.gstin || '27AAACW1234F1Z1',
      partyAddress: 'Plot 42, MIDC Industrial Area, Pune 411018',
      partyState: 'Maharashtra (27)',
      shippingAddress: so.shippingAddress || 'Plot 42, MIDC Industrial Area, Pune 411018',
      paymentTerms: so.paymentTerms || 'Net 30 Days',
      items: (so.items || []).map((item) => ({
        description: item.description,
        hsnCode: item.hsnCode || '8481',
        uom: 'NOS',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxableAmount: item.quantity * item.unitPrice,
        gstRatePercent: item.taxRatePercent || 18,
        cgstAmount: (item.quantity * item.unitPrice * (item.taxRatePercent || 18)) / 200,
        sgstAmount: (item.quantity * item.unitPrice * (item.taxRatePercent || 18)) / 200,
        totalAmount: item.quantity * item.unitPrice * (1 + (item.taxRatePercent || 18) / 100),
      })),
      subtotal: so.subtotal,
      cgstAmount: so.taxAmount / 2,
      sgstAmount: so.taxAmount / 2,
      totalTax: so.taxAmount,
      grandTotal: so.totalAmount,
      narration: `Customer PO Ref: ${so.customerPoReference || 'N/A'}. Delivery Address: ${so.shippingAddress || 'Factory Gate'}`,
    };
    setPrintData(pData);
    setPrintModalOpen(true);
  };

  const handlePrintChallan = (ch: DeliveryChallan) => {
    const pData: PrintDocumentData = {
      type: 'DO',
      documentNumber: ch.challanNumber,
      date: ch.dispatchDate,
      challanReference: ch.so?.soNumber,
      vehicleNumber: ch.vehicleNumber,
      transporterName: ch.transporterName,
      eWayBillNumber: ch.eWayBillNumber,
      partyName: ch.customerLedger?.name || 'Customer / Consignee',
      partyGstin: '27AAACW1234F1Z1',
      partyAddress: 'Gate 3, Factory Delivery Point, Pune',
      partyState: 'Maharashtra (27)',
      shippingAddress: 'Gate 3, Factory Delivery Point, Pune',
      items: (ch.items || []).map((item) => ({
        description: item.description,
        hsnCode: '8481',
        uom: 'NOS',
        quantity: item.dispatchedQty,
        unitPrice: 0,
        taxableAmount: 0,
        gstRatePercent: 0,
        totalAmount: 0,
      })),
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      narration: ch.remarks || `Dispatched via ${ch.transporterName || 'Fleet'} against SO ${ch.so?.soNumber || 'N/A'}`,
    };
    setPrintData(pData);
    setPrintModalOpen(true);
  };

  const handlePrintInvoice = (inv: any) => {
    const pData: PrintDocumentData = {
      type: 'SALES_INVOICE',
      documentNumber: inv.voucherNumber,
      date: inv.date,
      referenceNumber: inv.soNumber,
      partyName: inv.customerName,
      partyGstin: '27AAACW1234F1Z1',
      partyAddress: 'Commercial Complex, Senapati Bapat Road, Pune 411016',
      partyState: 'Maharashtra (27)',
      paymentTerms: 'Net 30 Days from Invoice Date',
      items: [
        {
          description: `Supply of Engineering Assemblies / Parts as per ${inv.soNumber}`,
          hsnCode: '8481',
          uom: 'LOT',
          quantity: 1,
          unitPrice: inv.taxable,
          taxableAmount: inv.taxable,
          gstRatePercent: 18,
          cgstAmount: inv.tax / 2,
          sgstAmount: inv.tax / 2,
          totalAmount: inv.totalAmount,
        },
      ],
      subtotal: inv.taxable,
      cgstAmount: inv.tax / 2,
      sgstAmount: inv.tax / 2,
      totalTax: inv.tax,
      grandTotal: inv.totalAmount,
      narration: `Being Tax Invoice booked and synced to General Ledger for ${inv.customerName} against Sales Order ${inv.soNumber}`,
    };
    setPrintData(pData);
    setPrintModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header Banner & Sales Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Sales & Distribution Department</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customer order booking, Delivery Challans (Outward Dispatch & Stock Deduction), and Double-Entry Tax Invoicing
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsSoModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Order</span>
          </button>
          <button
            type="button"
            onClick={() => setIsChallanModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch Challan</span>
          </button>
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Book Tax Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'returns'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sales Returns (Inward)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
              {salesReturns.length}
            </span>
          </button>
        </div>
      </div>

      {/* Standard Executive KPI Scorecards */}
      <KPIGrid cols={4}>
        <KPIScorecard
          label="Total Sales Commitments"
          value={`₹${totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend={{ value: `${totalSosCount} Orders`, direction: 'up', label: 'Active SOs' }}
          footer={{
            left: <span>Committed Revenue</span>,
            right: <span>Booked: <strong>{totalSosCount} SOs</strong></span>
          }}
        />

        <KPIScorecard
          label="Outward Delivery Challans"
          value={`${totalChallanCount} Shipments`}
          variant="emerald"
          icon={Truck}
          badge="E-Way Verified"
          badgeVariant="success"
          footer={{
            left: <span>Dispatched: <strong>{totalChallanCount}</strong></span>,
            right: <span>Gate Pass Cleared</span>
          }}
        />

        <KPIScorecard
          label="Pending Dispatches"
          value={`${pendingDispatchCount} Orders`}
          variant="amber"
          icon={Clock}
          trend={{ value: 'Warehouse Prep', direction: 'neutral', label: 'Pending' }}
          footer={{
            left: <span>Packing & Staging</span>,
            right: <span>Due this week</span>
          }}
        />

        <KPIScorecard
          label="Posted Tax Invoices"
          value={`${invoices.length} Invoices`}
          variant="indigo"
          icon={Receipt}
          badge="Ledger Synced"
          badgeVariant="indigo"
          footer={{
            left: <span>Double-Entry Synced</span>,
            right: <span>GSTR-1 Ready</span>
          }}
        />
      </KPIGrid>

      {/* Main Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 flex space-x-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('sos')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'sos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales Orders ({sos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('challans')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'challans'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery Challans / Outward Notes ({challans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Tax Invoices & Double-Entry Ledger ({invoices.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Sales Orders */}
      {activeTab === 'sos' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Active Customer Sales Orders Register
            </span>
            <span className="text-xs text-slate-400 font-mono">{sos.length} Orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-3.5">SO Number</th>
                  <th className="p-3.5">Customer / Debtor</th>
                  <th className="p-3.5">Order Date</th>
                  <th className="p-3.5">Customer PO Ref</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5 text-right">Subtotal (₹)</th>
                  <th className="p-3.5 text-right">GST (₹)</th>
                  <th className="p-3.5 text-right">Total (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sos.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {so.soNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {so.customerLedger?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        GSTIN: {so.customerLedger?.gstin || '27AAACW1234F1Z1'}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{so.orderDate}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {so.customerPoReference || 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {so.items.length} item(s) (
                      {so.items.map((i) => i.description).join(', ').slice(0, 30)}
                      ...)
                    </td>
                    <td className="p-3.5 text-right font-mono">
                      ₹{so.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-500">
                      ₹{so.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{so.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          so.status === 'CONFIRMED'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                            : so.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {so.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintSo(so)}
                        className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold flex items-center space-x-1 transition-all mx-auto cursor-pointer"
                        title="Print / Save PDF Sales Order"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print SO</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Delivery Challans */}
      {activeTab === 'challans' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Outward Delivery Challans & Dispatch Register
            </span>
            <span className="text-xs text-slate-400 font-mono">{challans.length} Shipments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-3.5">Challan Number</th>
                  <th className="p-3.5">Linked SO</th>
                  <th className="p-3.5">Customer / Consignee</th>
                  <th className="p-3.5">Dispatch Date</th>
                  <th className="p-3.5">Vehicle & Transporter</th>
                  <th className="p-3.5">E-Way Bill #</th>
                  <th className="p-3.5 text-right">Dispatched Qty</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Inventory Stock</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {challans.map((ch) => {
                  const totalQty = ch.items.reduce((a, b) => a + (Number(b.dispatchedQty) || 0), 0);
                  return (
                    <tr key={ch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {ch.challanNumber}
                      </td>
                      <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400">
                        {ch.so?.soNumber || 'Direct Dispatch'}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {ch.customerLedger?.name || 'Customer'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{ch.dispatchDate}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">
                        {ch.vehicleNumber || 'MH-14'} ({ch.transporterName || 'VRL'})
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {ch.eWayBillNumber || 'N/A'}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                        {totalQty} Units
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {ch.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Stock Deducted</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handlePrintChallan(ch)}
                          className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold flex items-center space-x-1 transition-all mx-auto cursor-pointer"
                          title="Print / Save Delivery Challan (DO)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print DO</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Tax Invoices & Double-Entry Ledgers */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tax Invoices Posted to Double-Entry Accounting Ledgers
            </span>
            <span className="text-xs text-slate-400 font-mono">{invoices.length} Invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Invoice Date</th>
                  <th className="p-3.5">Customer Ledger (Debited)</th>
                  <th className="p-3.5">Linked SO</th>
                  <th className="p-3.5 text-right">Taxable Revenue (₹)</th>
                  <th className="p-3.5 text-right">Output GST (₹)</th>
                  <th className="p-3.5 text-right">Grand Total (₹)</th>
                  <th className="p-3.5 text-center">Ledger State</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {inv.voucherNumber}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{inv.date}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {inv.customerName}
                    </td>
                    <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400">{inv.soNumber}</td>
                    <td className="p-3.5 text-right font-mono">
                      ₹{inv.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-500">
                      ₹{inv.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintInvoice(inv)}
                        className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-semibold flex items-center space-x-1 transition-all mx-auto cursor-pointer"
                        title="Print / Save Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSoModal
        isOpen={isSoModalOpen}
        onClose={() => setIsSoModalOpen(false)}
        onSubmit={handleCreateSo}
        customers={INITIAL_CUSTOMERS}
      />

      <CreateChallanModal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        onSubmit={handleCreateChallan}
        salesOrders={sos}
        customers={INITIAL_CUSTOMERS}
        existingChallans={challans}
      />

      <GenerateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSubmit={handleGenerateInvoice}
        salesOrders={sos}
      />

      {/* Universal Print & PDF Preview Modal */}
      <CreateSalesReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleCreateSalesReturn}
        salesOrders={sos}
        customers={INITIAL_CUSTOMERS}
      />

      <UniversalDocumentPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        data={printData}
      />
    </div>
  );
}
