import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PurchaseOrder,
  GoodsReceiptNote,
  PurchaseInvoice,
  ThreeWayMatchRecord,
  ProcurementSummary,
} from '../../types/purchase';
import { CreatePoModal } from './CreatePoModal';
import { CreateGrnModal } from './CreateGrnModal';
import { BookPurchaseInvoiceModal } from './BookPurchaseInvoiceModal';
import { CreatePurchaseReturnModal, PurchaseReturnFormData } from './CreatePurchaseReturnModal';
import { ThreeWayMatchView } from './ThreeWayMatchView';
import {
  UniversalDocumentPrintModal,
  PrintDocumentData,
} from '../common/UniversalDocumentPrintModal';
import { KPIScorecard, KPIGrid } from '../common/KPIScorecard';
import {
  ShoppingCart,
  PackageCheck,
  Scale,
  Receipt,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  CreditCard,
  FileText,
  X,
  RotateCcw,
  Search,
  Printer,
} from 'lucide-react';

const INITIAL_VENDORS = [
  { id: 'v-101', name: 'Stark Logistics & Supplies (Creditor)', gstin: '27AABCS1429B1Z8', state: 'Maharashtra (27)' },
  { id: 'v-102', name: 'Acme Heavy Engineering Corp', gstin: '24AACCA9918M1Z2', state: 'Gujarat (24)' },
  { id: 'v-103', name: 'Precision Tools & Dies Pvt Ltd', gstin: '27AABCP7721K1Z1', state: 'Maharashtra (27)' },
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'po-001',
    tenantId: '27AABCF1234F1Z5',
    poNumber: 'PO-2026-0891',
    vendorLedgerId: 'v-101',
    vendorLedger: { id: 'v-101', name: 'Stark Logistics & Supplies (Creditor)', gstin: '27AABCS1429B1Z8' },
    orderDate: '2026-09-10',
    expectedDeliveryDate: '2026-09-17',
    status: 'APPROVED',
    subtotal: 45000,
    taxAmount: 8100,
    totalAmount: 53100,
    termsAndConditions: 'Net 30 days after invoice delivery. Standard ISO warranty applies.',
    items: [
      {
        description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
        hsnCode: '7318',
        quantity: 10,
        unitPrice: 4500,
        taxRatePercent: 18,
        totalAmount: 53100,
      },
    ],
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'po-002',
    tenantId: '27AABCF1234F1Z5',
    poNumber: 'PO-2026-0892',
    vendorLedgerId: 'v-102',
    vendorLedger: { id: 'v-102', name: 'Acme Heavy Engineering Corp', gstin: '24AACCA9918M1Z2' },
    orderDate: '2026-09-11',
    expectedDeliveryDate: '2026-09-18',
    status: 'RECEIVED',
    subtotal: 120000,
    taxAmount: 21600,
    totalAmount: 141600,
    termsAndConditions: 'Immediate payment upon material QC pass.',
    items: [
      {
        description: 'CNC Machine Spare Parts & Bearings',
        hsnCode: '8482',
        quantity: 20,
        unitPrice: 6000,
        taxRatePercent: 18,
        totalAmount: 141600,
      },
    ],
    createdAt: '2026-09-11T11:30:00Z',
  },
];

const INITIAL_GRNS: GoodsReceiptNote[] = [
  {
    id: 'grn-001',
    tenantId: '27AABCF1234F1Z5',
    grnNumber: 'GRN-2026-0412',
    poId: 'po-001',
    po: { id: 'po-001', poNumber: 'PO-2026-0891' },
    vendorLedgerId: 'v-101',
    vendorLedger: { id: 'v-101', name: 'Stark Logistics & Supplies (Creditor)' },
    receivedDate: '2026-09-12',
    vehicleNumber: 'MH-12-AB-9876',
    challanNumber: 'DC-5521',
    qcStatus: 'PASSED',
    remarks: 'Physical count verified. Passed dimensions and tensile testing.',
    items: [
      {
        description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
        receivedQty: 10,
        rejectedQty: 0,
        rejectionReason: '',
        batchNumber: 'BATCH-2026-09A',
      },
    ],
    createdAt: '2026-09-12T14:15:00Z',
  },
];

const INITIAL_INVOICES: PurchaseInvoice[] = [
  {
    id: 'pinv-001',
    tenantId: '27AABCF1234F1Z5',
    invoiceNumber: 'PUR-2026-0081',
    vendorInvoiceNumber: 'STARK/26-27/9912',
    vendorLedgerId: 'v-101',
    vendorLedger: {
      id: 'v-101',
      name: 'Stark Logistics & Supplies (Creditor)',
      gstin: '27AABCS1429B1Z8',
      state: 'Maharashtra (27)',
    },
    invoiceDate: '2026-09-11',
    dueDate: '2026-10-11',
    poId: 'po-001',
    poNumber: 'PO-2026-0891',
    grnId: 'grn-001',
    grnNumber: 'GRN-2026-0412',
    status: 'BOOKED',
    subtotal: 45000,
    cgstAmount: 4050,
    sgstAmount: 4050,
    igstAmount: 0,
    totalTax: 8100,
    tdsSection: '194Q',
    tdsRatePercent: 0.1,
    tdsAmount: 45,
    roundOff: -0.05,
    totalAmount: 53055,
    paidAmount: 0,
    balanceAmount: 53055,
    paymentTerms: 'Net 30 Days',
    remarks: 'Automated 3-Way Match verified against GRN-2026-0412 and PO-2026-0891.',
    voucherId: 'vch-pur-0081',
    voucherNumber: 'PUR-2026-0081',
    isThreeWayMatched: true,
    items: [
      {
        id: 'pitem-1',
        description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
        hsnCode: '7318',
        uom: 'PCS',
        quantity: 10,
        unitPrice: 4500,
        discountPercent: 0,
        taxableAmount: 45000,
        gstRatePercent: 18,
        cgstAmount: 4050,
        sgstAmount: 4050,
        igstAmount: 0,
        totalAmount: 53100,
      },
    ],
    createdAt: '2026-09-11T16:20:00Z',
  },
  {
    id: 'pinv-002',
    tenantId: '27AABCF1234F1Z5',
    invoiceNumber: 'PUR-2026-0082',
    vendorInvoiceNumber: 'ACME/BILL/2026/04',
    vendorLedgerId: 'v-102',
    vendorLedger: {
      id: 'v-102',
      name: 'Acme Heavy Engineering Corp',
      gstin: '24AACCA9918M1Z2',
      state: 'Gujarat (24) - Inter-State',
    },
    invoiceDate: '2026-09-12',
    dueDate: '2026-09-27',
    poId: 'po-002',
    poNumber: 'PO-2026-0892',
    status: 'PAID',
    subtotal: 120000,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 21600,
    totalTax: 21600,
    tdsSection: '194Q',
    tdsRatePercent: 0.1,
    tdsAmount: 120,
    roundOff: 0,
    totalAmount: 141480,
    paidAmount: 141480,
    balanceAmount: 0,
    paymentTerms: 'Immediate Payment (Paid via HDFC NetBanking)',
    remarks: 'Inter-state raw materials procurement from Gujarat facility.',
    voucherId: 'vch-pur-0082',
    voucherNumber: 'PUR-2026-0082',
    isThreeWayMatched: true,
    items: [
      {
        id: 'pitem-2',
        description: 'CNC Machine Spare Parts & Bearings',
        hsnCode: '8482',
        uom: 'SETS',
        quantity: 20,
        unitPrice: 6000,
        discountPercent: 0,
        taxableAmount: 120000,
        gstRatePercent: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 21600,
        totalAmount: 141600,
      },
    ],
    createdAt: '2026-09-12T11:45:00Z',
  },
  {
    id: 'pinv-003',
    tenantId: '27AABCF1234F1Z5',
    invoiceNumber: 'PUR-2026-0083',
    vendorInvoiceNumber: 'PTD/INV/SEP/104',
    vendorLedgerId: 'v-103',
    vendorLedger: {
      id: 'v-103',
      name: 'Precision Tools & Dies Pvt Ltd',
      gstin: '27AABCP7721K1Z1',
      state: 'Maharashtra (27)',
    },
    invoiceDate: '2026-09-13',
    dueDate: '2026-10-13',
    status: 'BOOKED',
    subtotal: 85000,
    cgstAmount: 7650,
    sgstAmount: 7650,
    igstAmount: 0,
    totalTax: 15300,
    tdsSection: '194C',
    tdsRatePercent: 2.0,
    tdsAmount: 1700,
    roundOff: 0,
    totalAmount: 98600,
    paidAmount: 0,
    balanceAmount: 98600,
    paymentTerms: 'Net 30 Days',
    remarks: 'Direct factory tooling & machining contract jobwork bill.',
    voucherId: 'vch-pur-0083',
    voucherNumber: 'PUR-2026-0083',
    isThreeWayMatched: false,
    items: [
      {
        id: 'pitem-3',
        description: 'Carbide End Mills & Custom Milling Cutters',
        hsnCode: '8207',
        uom: 'NOS',
        quantity: 25,
        unitPrice: 3400,
        discountPercent: 0,
        taxableAmount: 85000,
        gstRatePercent: 18,
        cgstAmount: 7650,
        sgstAmount: 7650,
        igstAmount: 0,
        totalAmount: 100300,
      },
    ],
    createdAt: '2026-09-13T10:15:00Z',
  },
];


const INITIAL_PURCHASE_RETURNS = [
  {
    id: 'pr-001',
    tenantId: '27AABCF1234F1Z5',
    returnNumber: 'PR-2026-0012',
    vendorLedgerId: 'v-101',
    vendorLedger: { id: 'v-101', name: 'Stark Logistics & Supplies (Creditor)', gstin: '27AABCS1429B1Z8', state: 'Maharashtra (27)' },
    originalInvoiceNumber: 'STARK/26-27/9912',
    linkMode: 'GRN',
    linkedGrnNumbers: ['GRN-2026-0031'],
    linkedPoNumbers: ['PO-2026-0045'],
    returnDate: '2026-09-12',
    reason: 'DEFECTIVE_QC_REJECT',
    warehouseId: 'wh-01',
    warehouseName: 'Main Plant Warehouse - Pune',
    debitNoteNumber: 'DN-2026-0041',
    debitNoteId: 'dn-001',
    status: 'APPROVED',
    subtotal: 9000,
    cgstAmount: 810,
    sgstAmount: 810,
    igstAmount: 0,
    totalTax: 1620,
    totalAmount: 10620,
    remarks: 'Material failed torque tensile testing. Rejected at inward gate inspection.',
    items: [
      {
        description: 'Industrial Steel Fasteners Grade 8.8 (1000 pcs)',
        hsnCode: '7318',
        quantity: 2,
        unitPrice: 4500,
        taxableAmount: 9000,
        gstRatePercent: 18,
        cgstAmount: 810,
        sgstAmount: 810,
        igstAmount: 0,
        totalAmount: 10620,
        reason: 'Tensile defect',
        poNumber: 'PO-2026-0045',
        grnNumber: 'GRN-2026-0031',
        batchNumber: 'BATCH-2026-09A',
      },
    ],
    createdAt: '2026-09-12T15:30:00Z',
  },
];

export function PurchaseDashboard() {
  const [activeTab, setActiveTab] = useState<'pos' | 'grns' | 'invoices' | 'matching' | 'returns'>('invoices');
  const { getAuthHeaders } = useAuth();
  const [purchaseReturns, setPurchaseReturns] = useState<any[]>(INITIAL_PURCHASE_RETURNS);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>(INITIAL_GRNS);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>(INITIAL_INVOICES);
  const [matches, setMatches] = useState<ThreeWayMatchRecord[]>([]);

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<PurchaseInvoice | null>(null);

  // Print Preview state
  const [printData, setPrintData] = useState<PrintDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Computed metrics
  const totalPoValue = pos.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
  const totalInvoicedValue = invoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
  const totalPendingPayable = invoices.reduce((acc, i) => acc + (Number(i.balanceAmount) || 0), 0);
  const totalGrnCount = grns.length;

  const handlePrintPo = (po: PurchaseOrder) => {
    const isInterState = po.vendorLedgerId === 'v-102';
    const cgst = isInterState ? 0 : po.taxAmount / 2;
    const sgst = isInterState ? 0 : po.taxAmount / 2;
    const igst = isInterState ? po.taxAmount : 0;

    setPrintData({
      type: 'PO',
      documentNumber: po.poNumber,
      date: po.orderDate,
      dueDate: po.expectedDeliveryDate,
      partyName: po.vendorLedger?.name || 'Authorized Supplier',
      partyGstin: po.vendorLedger?.gstin || '27AABCS1429B1Z8',
      partyAddress: 'Industrial Zone, Phase II, MIDC, Pune',
      partyState: isInterState ? 'Gujarat (24)' : 'Maharashtra (27)',
      shippingAddress: 'Apex Works Gate #2, Plot 42, MIDC Chinchwad, Pune - 411019',
      paymentTerms: po.termsAndConditions || 'Net 30 Days after inspection',
      items: po.items.map((it) => ({
        description: it.description,
        hsnCode: it.hsnCode || '7318',
        uom: 'PCS',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxableAmount: it.quantity * it.unitPrice,
        gstRatePercent: it.taxRatePercent,
        totalAmount: it.totalAmount || (it.quantity * it.unitPrice * (1 + it.taxRatePercent / 100)),
      })),
      subtotal: po.subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalTax: po.taxAmount,
      grandTotal: po.totalAmount,
      termsAndConditions: po.termsAndConditions || 'Standard 30 days payment terms upon QC approval.',
    });
    setIsPrintModalOpen(true);
  };

  const handlePrintGrn = (grn: GoodsReceiptNote) => {
    setPrintData({
      type: 'GRN',
      documentNumber: grn.grnNumber,
      date: grn.receivedDate,
      poReference: grn.po?.poNumber || 'N/A',
      challanReference: grn.challanNumber || 'DC-5521',
      vehicleNumber: grn.vehicleNumber || 'MH-12-AB-9876',
      partyName: grn.vendorLedger?.name || 'Supplier Creditor',
      partyGstin: '27AABCS1429B1Z8',
      partyAddress: 'Supplier Dispatch Yard, Maharashtra',
      partyState: 'Maharashtra (27)',
      qcStatus: grn.qcStatus,
      items: grn.items.map((it) => ({
        description: it.description,
        hsnCode: '7318',
        uom: 'PCS',
        quantity: it.receivedQty,
        acceptedQty: it.receivedQty - (it.rejectedQty || 0),
        rejectedQty: it.rejectedQty || 0,
        unitPrice: 4500,
        taxableAmount: (it.receivedQty - (it.rejectedQty || 0)) * 4500,
        gstRatePercent: 18,
        totalAmount: (it.receivedQty - (it.rejectedQty || 0)) * 4500 * 1.18,
      })),
      subtotal: 45000,
      totalTax: 8100,
      grandTotal: 53100,
      narration: grn.remarks || 'Material physically verified and stamped Passed QC by Stores Department.',
    });
    setIsPrintModalOpen(true);
  };

  const handlePrintInvoice = (inv: PurchaseInvoice) => {
    setPrintData({
      type: 'PURCHASE_INVOICE',
      documentNumber: inv.invoiceNumber,
      referenceNumber: inv.vendorInvoiceNumber,
      date: inv.invoiceDate,
      dueDate: inv.dueDate,
      poReference: inv.poNumber,
      grnReference: inv.grnNumber,
      partyName: inv.vendorLedger?.name || 'Trade Vendor',
      partyGstin: inv.vendorLedger?.gstin || '27AABCS1429B1Z8',
      partyAddress: 'Vendor Works, State MIDC Area',
      partyState: inv.vendorLedger?.state || 'Maharashtra (27)',
      paymentTerms: inv.paymentTerms || 'Net 30 Days',
      items: inv.items.map((it) => ({
        description: it.description,
        hsnCode: it.hsnCode || '7318',
        uom: it.uom || 'PCS',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        taxableAmount: it.taxableAmount,
        gstRatePercent: it.gstRatePercent,
        cgstAmount: it.cgstAmount,
        sgstAmount: it.sgstAmount,
        igstAmount: it.igstAmount,
        totalAmount: it.totalAmount,
      })),
      subtotal: inv.subtotal,
      cgstAmount: inv.cgstAmount,
      sgstAmount: inv.sgstAmount,
      igstAmount: inv.igstAmount,
      totalTax: inv.totalTax,
      tdsSection: inv.tdsSection,
      tdsAmount: inv.tdsAmount,
      roundOff: inv.roundOff,
      grandTotal: inv.totalAmount,
      narration: inv.remarks || 'Statutory AP bill booked and posted to General Ledger.',
    });
    setIsPrintModalOpen(true);
  };

  const handleCreatePo = (poData: Partial<PurchaseOrder>) => {
    const vendor = INITIAL_VENDORS.find((v) => v.id === poData.vendorLedgerId);
    const newPo: PurchaseOrder = {
      id: 'po-' + Date.now(),
      tenantId: '27AABCF1234F1Z5',
      poNumber: poData.poNumber || ('PO-' + Date.now().toString().slice(-4)),
      vendorLedgerId: poData.vendorLedgerId || '',
      vendorLedger: vendor,
      orderDate: poData.orderDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: poData.expectedDeliveryDate,
      status: 'APPROVED',
      subtotal: poData.subtotal || 0,
      taxAmount: poData.taxAmount || 0,
      totalAmount: poData.totalAmount || 0,
      termsAndConditions: poData.termsAndConditions,
      items: poData.items || [],
      createdAt: new Date().toISOString(),
    };
    setPos([newPo, ...pos]);
  };

  const handleCreateGrn = (grnData: Partial<GoodsReceiptNote>) => {
    const vendor = INITIAL_VENDORS.find((v) => v.id === grnData.vendorLedgerId);
    const po = pos.find((p) => p.id === grnData.poId);
    const newGrn: GoodsReceiptNote = {
      id: 'grn-' + Date.now(),
      tenantId: '27AABCF1234F1Z5',
      grnNumber: grnData.grnNumber || ('GRN-' + Date.now().toString().slice(-4)),
      poId: grnData.poId,
      po: po ? { id: po.id, poNumber: po.poNumber } : undefined,
      vendorLedgerId: grnData.vendorLedgerId || '',
      vendorLedger: vendor,
      receivedDate: grnData.receivedDate || new Date().toISOString().split('T')[0],
      vehicleNumber: grnData.vehicleNumber,
      challanNumber: grnData.challanNumber,
      qcStatus: grnData.qcStatus || 'PASSED',
      remarks: grnData.remarks,
      items: grnData.items || [],
      createdAt: new Date().toISOString(),
    };
    setGrns([newGrn, ...grns]);
  };

  const handleExecuteMatch = (payload: {
    poId: string;
    grnId: string;
    invoicedTotalAmount: number;
    invoicedItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) => {
    const matchedPo = pos.find((p) => p.id === payload.poId);
    const matchedGrn = grns.find((g) => g.id === payload.grnId);
    const poTotal = matchedPo?.totalAmount || 0;
    const grnQty = matchedGrn?.items?.reduce((acc, it) => acc + (it.receivedQty - it.rejectedQty), 0) || 0;
    const invoicedTotal = payload.invoicedTotalAmount;
    const isMatched = Math.abs(invoicedTotal - poTotal) < 1;

    const newRecord: ThreeWayMatchRecord = {
      id: 'match-' + Date.now(),
      poId: payload.poId,
      grnId: payload.grnId,
      status: isMatched ? 'MATCHED' : 'PRICE_MISMATCH',
      discrepancies: {
        priceVariance: invoicedTotal - poTotal,
        qtyVariance: 0,
        notes: isMatched ? 'Perfect 3-Way match: PO, GRN & Bill reconciled.' : ('Variance: ₹' + (invoicedTotal - poTotal)),
      },
      poTotal,
      grnTotalQty: grnQty,
      invoicedTotal,
      createdAt: new Date().toISOString(),
    };
    setMatches([newRecord, ...matches]);
  };

  
  const handlePrintPurchaseReturn = (ret: any) => {
    const docLinks = [
      ret.originalInvoiceNumber ? `Bill: ${ret.originalInvoiceNumber}` : '',
      ret.linkedGrnNumbers?.length ? `GRN(s): ${ret.linkedGrnNumbers.join(', ')}` : '',
      ret.linkedPoNumbers?.length ? `PO(s): ${ret.linkedPoNumbers.join(', ')}` : '',
    ].filter(Boolean).join(' | ');

    setPrintData({
      type: 'PURCHASE_RETURN',
      documentNumber: ret.returnNumber,
      date: ret.returnDate,
      referenceNumber: docLinks || ret.originalInvoiceNumber,
      partyName: ret.vendorLedger?.name || 'Vendor Creditor',
      partyGstin: ret.vendorLedger?.gstin || '27AABCS1429B1Z8',
      partyAddress: 'Vendor Works, Industrial Phase II, Pune',
      partyState: ret.vendorLedger?.state || 'Maharashtra (27)',
      items: ret.items.map((it: any) => ({
        description: `${it.description}${it.poNumber ? ` [PO: ${it.poNumber}]` : ''}${it.grnNumber ? ` [GRN: ${it.grnNumber}]` : ''}`,
        hsnCode: it.hsnCode || '7318',
        uom: 'PCS',
        quantity: it.quantity,
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
      narration: `Reason: ${ret.reason}. Warehouse: ${ret.warehouseName}. Debit Note: ${ret.debitNoteNumber || 'Issued'}. Links: ${docLinks || 'Direct'}. Remarks: ${ret.remarks}`,
    });
    setIsPrintModalOpen(true);
  };

  const handleCreatePurchaseReturn = (formData: PurchaseReturnFormData) => {
    const seq = purchaseReturns.length + 13;
    const returnNumber = 'PR-2026-00' + seq;
    const debitNoteNumber = formData.autoCreateDebitNote ? ('DN-2026-00' + (purchaseReturns.length + 42)) : undefined;

    const newReturn = {
      id: 'pr-' + Date.now(),
      tenantId: '27AABCF1234F1Z5',
      returnNumber,
      vendorLedgerId: formData.vendorLedgerId,
      vendorLedger: {
        id: formData.vendorLedgerId,
        name: formData.vendorName,
        gstin: formData.vendorGstin || '27AABCS1429B1Z8',
        state: formData.vendorState || 'Maharashtra (27)',
      },
      originalInvoiceNumber: formData.originalInvoiceNumber,
      linkMode: formData.linkMode,
      linkedGrnNumbers: formData.linkedGrnNumbers,
      linkedPoNumbers: formData.linkedPoNumbers,
      returnDate: formData.returnDate,
      reason: formData.reason,
      warehouseId: formData.warehouseId,
      warehouseName: formData.warehouseName,
      debitNoteNumber,
      debitNoteId: debitNoteNumber ? ('dn-' + Date.now()) : undefined,
      status: 'APPROVED',
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

    setPurchaseReturns([newReturn, ...purchaseReturns]);
  };

  const handleCreateInvoice = (invoiceData: Partial<PurchaseInvoice>) => {
    const invoiceSeq = invoices.length + 84;
    const voucherNumber = 'PUR-2026-00' + invoiceSeq;

    const newInvoice: PurchaseInvoice = {
      id: 'pinv-' + Date.now(),
      tenantId: '27AABCF1234F1Z5',
      invoiceNumber: voucherNumber,
      vendorInvoiceNumber: invoiceData.vendorInvoiceNumber || 'INV-TEMP-01',
      vendorLedgerId: invoiceData.vendorLedgerId || '',
      vendorLedger: invoiceData.vendorLedger,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || '2026-10-15',
      poId: invoiceData.poId,
      poNumber: invoiceData.poId ? ('PO-2026-' + invoiceData.poId.slice(-4)) : undefined,
      grnId: invoiceData.grnId,
      grnNumber: invoiceData.grnId ? ('GRN-2026-' + invoiceData.grnId.slice(-4)) : undefined,
      status: 'BOOKED',
      subtotal: invoiceData.subtotal || 0,
      cgstAmount: invoiceData.cgstAmount || 0,
      sgstAmount: invoiceData.sgstAmount || 0,
      igstAmount: invoiceData.igstAmount || 0,
      totalTax: invoiceData.totalTax || 0,
      tdsSection: invoiceData.tdsSection,
      tdsRatePercent: invoiceData.tdsRatePercent,
      tdsAmount: invoiceData.tdsAmount || 0,
      totalAmount: invoiceData.totalAmount || 0,
      paidAmount: 0,
      balanceAmount: invoiceData.totalAmount || 0,
      paymentTerms: invoiceData.paymentTerms || 'Net 30 Days',
      remarks: invoiceData.remarks,
      voucherId: 'vch-' + voucherNumber.toLowerCase(),
      voucherNumber,
      isThreeWayMatched: !!(invoiceData.poId && invoiceData.grnId),
      items: invoiceData.items || [],
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
  };

  const handlePayInvoice = (invoiceId: string) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'PAID',
            paidAmount: inv.totalAmount,
            balanceAmount: 0,
          };
        }
        return inv;
      })
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.vendorInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.vendorLedger?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReturns = purchaseReturns.filter((ret) => {
    const matchesSearch =
      ret.returnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.originalInvoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ret.vendorLedger?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ret.debitNoteNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.linkedGrnNumbers?.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ret.linkedPoNumbers?.some((p: string) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>Procurement & Purchase Department</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                AP Core Matrix
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              End-to-End Purchase Orders, GRN Inward QC, Vendor Invoice Booking with GST & TDS, and 3-Way Reconciliation
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsPoModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Raise PO</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGrnModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Inward GRN</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReturnModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Issue Return Outward</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>+ Book Purchase Bill</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <KPIGrid columns={4}>
            <KPIScorecard
              label="TOTAL PO BACKLOG"
              value={`₹${totalPoValue.toLocaleString('en-IN')}`}
              icon={<ShoppingCart className="w-3.5 h-3.5" />}
              badge={`${pos.length} Active Orders`}
              badgeVariant="indigo"
              footerLeft="PO Fulfilment"
              footerRight="Open Commitments"
            />
            <KPIScorecard
              label="GOODS INWARDED (GRN)"
              value={`${totalGrnCount} GRNs`}
              icon={<PackageCheck className="w-3.5 h-3.5" />}
              badge="100% Passed QC"
              badgeVariant="emerald"
              footerLeft="Inspection Status"
              footerRight="Zero QC Defects"
            />
            <KPIScorecard
              label="TOTAL INVOICED SPEND"
              value={`₹${totalInvoicedValue.toLocaleString('en-IN')}`}
              icon={<Receipt className="w-3.5 h-3.5" />}
              badge={`${invoices.length} Bills Booked`}
              badgeVariant="indigo"
              footerLeft="GL Booking"
              footerRight="Matched 3-Way"
            />
            <KPIScorecard
              label="PENDING AP PAYABLES"
              value={`₹${totalPendingPayable.toLocaleString('en-IN')}`}
              icon={<Clock className="w-3.5 h-3.5" />}
              badge="Aging 0-30 Days"
              badgeVariant="amber"
              footerLeft="Creditor Aging"
              footerRight="Due This Month"
            />
          </KPIGrid>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Purchase Invoices / Bills</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {invoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders (POs)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {pos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grns')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'grns'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Goods Receipt Notes (GRN)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {grns.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matching')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'matching'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>3-Way Matching Engine</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
              Automated
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'returns'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Purchase Returns (Outward)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold">
              {purchaseReturns.length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Bill No, Voucher #, Vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="BOOKED">Booked (Unpaid)</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Vendor Bill #</th>
                      <th className="py-3 px-3">Voucher Ref</th>
                      <th className="py-3 px-4">Vendor / Creditor</th>
                      <th className="py-3 px-3">Bill Date & Due</th>
                      <th className="py-3 px-3">Linkages</th>
                      <th className="py-3 px-3 text-right">Taxable (₹)</th>
                      <th className="py-3 px-3 text-right">GST (₹)</th>
                      <th className="py-3 px-3 text-right">TDS (₹)</th>
                      <th className="py-3 px-4 text-right">Total Payable (₹)</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {inv.vendorInvoiceNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {inv.items.length} line item(s)
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                            {inv.invoiceNumber}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {inv.vendorLedger?.name || 'Trade Vendor'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            GSTIN: {inv.vendorLedger?.gstin || 'N/A'}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{inv.invoiceDate}</div>
                          <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {inv.poNumber && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {inv.poNumber}
                              </span>
                            )}
                            {inv.grnNumber && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                {inv.grnNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          ₹{inv.subtotal.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-medium text-blue-600 dark:text-blue-400">
                          ₹{inv.totalTax.toLocaleString('en-IN')}
                          <div className="text-[9px] text-slate-400">
                            {inv.igstAmount > 0 ? 'IGST' : 'CGST+SGST'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                          {inv.tdsAmount && inv.tdsAmount > 0 ? ('₹' + inv.tdsAmount.toLocaleString('en-IN')) : '-'}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                          ₹{inv.totalAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handlePrintInvoice(inv)}
                              title="Print AP Voucher / Vendor Bill"
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForModal(inv)}
                              title="View GL Journal Voucher & Bill Details"
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {inv.status !== 'PAID' && (
                              <button
                                type="button"
                                onClick={() => handlePayInvoice(inv.id)}
                                title="Record Full Payment"
                                className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-3">Order Date</th>
                    <th className="py-3 px-3">Exp. Delivery</th>
                    <th className="py-3 px-3 text-right">Taxable (₹)</th>
                    <th className="py-3 px-3 text-right">Tax (₹)</th>
                    <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {pos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold font-mono text-blue-600 dark:text-blue-400">
                        {p.poNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {p.vendorLedger?.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{p.orderDate}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{p.expectedDeliveryDate || '-'}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        ₹{p.subtotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                        ₹{p.taxAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{p.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handlePrintPo(p)}
                          title="Print Purchase Order PDF"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))} 
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'grns' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">GRN Number</th>
                    <th className="py-3 px-3">Linked PO</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-3">Inward Date</th>
                    <th className="py-3 px-3">Vehicle #</th>
                    <th className="py-3 px-3">Challan #</th>
                    <th className="py-3 px-3 text-center">QC Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {grns.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {g.grnNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {g.po?.poNumber || '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {g.vendorLedger?.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{g.receivedDate}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{g.vehicleNumber || '-'}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{g.challanNumber || '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          {g.qcStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handlePrintGrn(g)}
                          title="Print Material Inward Slip / GRP"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))} 
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'matching' && (
          <ThreeWayMatchView
            purchaseOrders={pos}
            goodsReceiptNotes={grns}
            matchHistory={matches}
            onExecuteMatch={handleExecuteMatch}
          />
        )}

        {activeTab === 'returns' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Return #, GRN #, PO #, Vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>+ Issue Purchase Return</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Return # & Date</th>
                      <th className="py-3 px-4">Vendor / Creditor</th>
                      <th className="py-3 px-3">Orig. Bill Ref</th>
                      <th className="py-3 px-3">Linked Docs (GRN / PO)</th>
                      <th className="py-3 px-3">Warehouse / Reason</th>
                      <th className="py-3 px-3 text-right">Taxable (₹)</th>
                      <th className="py-3 px-3 text-right">GST (₹)</th>
                      <th className="py-3 px-4 text-right">Total (₹)</th>
                      <th className="py-3 px-3 text-center">Debit Note #</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredReturns.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-slate-400">
                          No purchase returns matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredReturns.map((ret) => (
                        <tr key={ret.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                              {ret.returnNumber}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {ret.returnDate} ({ret.items.length} item{ret.items.length > 1 ? 's' : ''})
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {ret.vendorLedger?.name || 'Vendor Creditor'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              GSTIN: {ret.vendorLedger?.gstin || 'N/A'}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                            {ret.originalInvoiceNumber}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {ret.linkedGrnNumbers && ret.linkedGrnNumbers.length > 0 ? (
                                ret.linkedGrnNumbers.map((grn: string) => (
                                  <span
                                    key={grn}
                                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  >
                                    GRN: {grn}
                                  </span>
                                ))
                              ) : null}
                              {ret.linkedPoNumbers && ret.linkedPoNumbers.length > 0 ? (
                                ret.linkedPoNumbers.map((po: string) => (
                                  <span
                                    key={po}
                                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                  >
                                    PO: {po}
                                  </span>
                                ))
                              ) : null}
                              {!ret.linkedGrnNumbers?.length && !ret.linkedPoNumbers?.length && (
                                <span className="text-[10px] text-slate-400 italic">Direct Bill</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[140px]" title={ret.warehouseName}>
                              {ret.warehouseName}
                            </div>
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                              {ret.reason.replace(/_/g, ' ')}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            ₹{ret.subtotal.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                            ₹{ret.totalTax.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            ₹{ret.totalAmount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {ret.debitNoteNumber ? (
                              <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                                {ret.debitNoteNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 uppercase">
                              {ret.status || 'APPROVED'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handlePrintPurchaseReturn(ret)}
                              title="Print Purchase Return / Debit Note Delivery Document"
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Bill Details & GL Voucher: {selectedInvoiceForModal.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block">Vendor Invoice No:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedInvoiceForModal.vendorInvoiceNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Vendor Name:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedInvoiceForModal.vendorLedger?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Invoice Date / Due:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedInvoiceForModal.invoiceDate} (Due: {selectedInvoiceForModal.dueDate})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedInvoiceForModal.status} (Balance: ₹{selectedInvoiceForModal.balanceAmount?.toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Double-Entry General Ledger Journal Matrix</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2 px-3">Account Name</th>
                        <th className="py-2 px-3 text-right">Debit (Dr) ₹</th>
                        <th className="py-2 px-3 text-right">Credit (Cr) ₹</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                          Purchase Account - Raw Materials
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ₹{selectedInvoiceForModal.subtotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                      </tr>
                      {selectedInvoiceForModal.cgstAmount > 0 && (
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                            Input Tax Credit - CGST
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            ₹{selectedInvoiceForModal.cgstAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        </tr>
                      )}
                      {selectedInvoiceForModal.sgstAmount > 0 && (
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                            Input Tax Credit - SGST
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            ₹{selectedInvoiceForModal.sgstAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        </tr>
                      )}
                      {selectedInvoiceForModal.igstAmount > 0 && (
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                            Input Tax Credit - IGST
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            ₹{selectedInvoiceForModal.igstAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        </tr>
                      )}
                      {selectedInvoiceForModal.tdsAmount && selectedInvoiceForModal.tdsAmount > 0 ? (
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                            TDS Payable ({selectedInvoiceForModal.tdsSection})
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">
                            ₹{selectedInvoiceForModal.tdsAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ) : null}
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                          Sundry Creditor - {selectedInvoiceForModal.vendorLedger?.name}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">
                          ₹{selectedInvoiceForModal.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-right pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForModal(null)}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreatePoModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        onSubmit={handleCreatePo}
        vendors={INITIAL_VENDORS}
      />

      <CreateGrnModal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        onSubmit={handleCreateGrn}
        purchaseOrders={pos}
        vendors={INITIAL_VENDORS}
        existingGrns={grns}
      />

      <BookPurchaseInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onInvoiceCreated={handleCreateInvoice}
        existingPos={pos}
        existingGrns={grns}
        existingInvoices={invoices}
      />

      <CreatePurchaseReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleCreatePurchaseReturn}
        invoices={invoices}
        vendors={INITIAL_VENDORS}
        purchaseOrders={pos}
        goodsReceiptNotes={grns}
      />

      <UniversalDocumentPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={printData}
      />
    </div>
  );
}