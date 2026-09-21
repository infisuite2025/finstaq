import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  VoucherType,
  EntryType,
  VoucherLineItem,
  LedgerOption,
  LedgerGroupOption,
  CalculatedTax,
  VoucherRecord,
  ItemInvoiceLine,
  AdditionalCharge,
  SupplyType,
  InvoiceTaxSummaryRow,
} from '../../types/voucher';
import { useVoucherHotkeys } from '../../hooks/useVoucherHotkeys';
import { QuickCreateLedgerModal } from './QuickCreateLedgerModal';
import { VoucherSummaryBar } from './VoucherSummaryBar';
import { TaxBreakdownCard } from './TaxBreakdownCard';
import { UniversalDocumentPrintModal, PrintDocumentData } from '../common/UniversalDocumentPrintModal';
import {
  BookOpen,
  Calendar,
  FileText,
  Hash,
  Plus,
  Trash2,
  Building2,
  Check,
  AlertTriangle,
  Printer,
  Lock,
  ShieldCheck,
  RotateCcw,
  ListFilter,
  CheckCircle2,
  FileCheck,
  SlidersHorizontal,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  Boxes,
  HelpCircle,
  Keyboard,
  CreditCard,
  Receipt,
  X,
  MapPin,
  Truck,
  Tag,
  User,
  Info,
  AlertCircle,
  ChevronDown,
  Globe,
  Banknote,
  Clock,
  ArrowRight,
  Search,
  Eye,
  Filter,
} from 'lucide-react';

export interface BillAllocation {
  type: 'Agst Ref' | 'Advance' | 'New Ref' | 'On Account';
  refNo: string;
  dueDate: string;
  amount: number;
}

export interface BankAllocation {
  transactionType: 'e-Fund Transfer' | 'Cheque' | 'UPI' | 'Demand Draft' | 'Cash';
  instrumentNo: string;
  instrumentDate: string;
  bankName: string;
  transferMode: string;
  favoureeName: string;
  amount: number;
}

export interface SingleEntryParticular {
  id: string;
  ledgerId: string;
  amount: number | string;
  curBalance: number;
  billAllocations?: BillAllocation[];
  bankAllocations?: BankAllocation[];
}

const INITIAL_LEDGERS: LedgerOption[] = [
  { id: '1', name: 'Cash in Hand', currentBalance: 25000, groupName: 'Cash-in-hand', nature: 'ASSET' },
  { id: '2', name: 'HDFC Bank Current A/c', currentBalance: 340000, groupName: 'Bank Accounts', nature: 'ASSET' },
  { id: '3', name: 'Sales Account (Domestic)', currentBalance: 1250000, groupName: 'Sales Accounts', nature: 'INCOME' },
  { id: '4', name: 'Purchase Account', currentBalance: 820000, groupName: 'Purchase Accounts', nature: 'EXPENSE' },
  { id: '5', name: 'Tata Motors Precision Division (Debtor)', currentBalance: 780000, groupName: 'Sundry Debtors', nature: 'ASSET' },
  { id: '6', name: 'Acme Heavy Engineering Corp (Creditor)', currentBalance: 885000, groupName: 'Sundry Creditors', nature: 'LIABILITY' },
  { id: '7', name: 'Office Rent Expense', currentBalance: 180000, groupName: 'Indirect Expenses', nature: 'EXPENSE' },
  { id: '8', name: 'Output CGST @ 9%', currentBalance: 45000, groupName: 'Duties & Taxes', nature: 'LIABILITY' },
  { id: '9', name: 'Output SGST @ 9%', currentBalance: 45000, groupName: 'Duties & Taxes', nature: 'LIABILITY' },
  { id: '10', name: 'Output IGST @ 18%', currentBalance: 90000, groupName: 'Duties & Taxes', nature: 'LIABILITY' },
  { id: '11', name: 'Input CGST @ 9%', currentBalance: 35000, groupName: 'Duties & Taxes', nature: 'ASSET' },
  { id: '12', name: 'Input SGST @ 9%', currentBalance: 35000, groupName: 'Duties & Taxes', nature: 'ASSET' },
  { id: '13', name: 'TDS Payable u/s 194Q', currentBalance: 1420, groupName: 'Duties & Taxes', nature: 'LIABILITY' },
];

const INITIAL_GROUPS: LedgerGroupOption[] = [
  { id: 'g1', name: 'Current Assets', nature: 'ASSET' },
  { id: 'g2', name: 'Bank Accounts', nature: 'ASSET' },
  { id: 'g3', name: 'Cash-in-hand', nature: 'ASSET' },
  { id: 'g4', name: 'Sundry Debtors', nature: 'ASSET' },
  { id: 'g5', name: 'Current Liabilities', nature: 'LIABILITY' },
  { id: 'g6', name: 'Sundry Creditors', nature: 'LIABILITY' },
  { id: 'g7', name: 'Duties & Taxes', nature: 'LIABILITY' },
  { id: 'g8', name: 'Sales Accounts', nature: 'INCOME' },
  { id: 'g9', name: 'Direct Incomes', nature: 'INCOME' },
  { id: 'g10', name: 'Purchase Accounts', nature: 'EXPENSE' },
  { id: 'g11', name: 'Indirect Expenses', nature: 'EXPENSE' },
];

const SAMPLE_INVENTORY_ITEMS = [
  { id: 'item-1', sku: 'BRG-6205-ZZ', name: 'Deep Groove Ball Bearing 6205-ZZ', description: 'Single row deep groove ball bearing, 25mm bore, 52mm OD, 15mm width, ZZ shielded', hsnCode: '84821010', uom: 'NOS', defaultRate: 480, stock: 2500, defaultGst: 18 },
  { id: 'item-2', sku: 'STL-EN8-ROD', name: 'Alloy Steel Forging Rod Grade EN8D', description: 'Medium carbon steel rod EN8D spec, 50mm dia, 3m lengths, annealed condition', hsnCode: '72283000', uom: 'MT', defaultRate: 50000, stock: 40, defaultGst: 18 },
  { id: 'item-3', sku: 'CNC-TOOL-M12', name: 'Solid Carbide 4-Flute Endmill M12', description: 'Solid carbide 4-flute end mill 12mm dia, 75mm OAL, AlTiN coated, for steel machining', hsnCode: '82079090', uom: 'NOS', defaultRate: 1250, stock: 150, defaultGst: 18 },
  { id: 'item-4', sku: 'OIL-HYD-68', name: 'Industrial Servo Hydraulic Oil 68', description: 'Premium anti-wear hydraulic oil ISO VG 68, 200L barrel, food-grade compatible', hsnCode: '27101990', uom: 'LTR', defaultRate: 220, stock: 800, defaultGst: 18 },
  { id: 'item-5', sku: 'ALU-6061-T6', name: 'Aerospace Aluminium Billet 6061-T6', description: 'Aerospace-grade aluminium alloy billet 6061-T6, 100mm dia round bar, solution heat treated', hsnCode: '76042100', uom: 'KGS', defaultRate: 340, stock: 1200, defaultGst: 18 },
];

// GST State Code to State Name mapping (first 2 digits of GSTIN)
const GSTIN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu', '27': 'Maharashtra', '28': 'Andhra Pradesh',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
  '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana',
  '37': 'Andhra Pradesh (New)', '38': 'Ladakh', '97': 'Other Territory', '99': 'Centre Jurisdiction',
};

const PAYMENT_TERMS_OPTIONS = [
  { label: 'Immediate (0 days)', days: 0 },
  { label: 'Net 7', days: 7 },
  { label: 'Net 15', days: 15 },
  { label: 'Net 30', days: 30 },
  { label: 'Net 45', days: 45 },
  { label: 'Net 60', days: 60 },
  { label: 'Net 90', days: 90 },
];

// Company's own GSTIN (from tenant profile — State code determines CGST/SGST vs IGST)
const COMPANY_GSTIN = '27AABCF1234F1Z5'; // Maharashtra
const COMPANY_STATE_CODE = COMPANY_GSTIN.substring(0, 2); // '27'

const SAMPLE_WAREHOUSES = [
  { id: 'wh-1', name: 'Pune Central Godown (Main)' },
  { id: 'wh-2', name: 'Chakan Raw Material Store' },
  { id: 'wh-3', name: 'Bhosari Finished Goods Store' },
];

const INITIAL_VOUCHERS_REGISTER: VoucherRecord[] = [
  {
    id: 'vch-001',
    voucherNumber: 'PUR-2026-0081',
    type: 'PURCHASE',
    date: '2026-09-12',
    narration: 'Auto-posted AP Bill for Raw Materials purchase against PO-2026-0891 and GRN-2026-0411',
    isSystemGenerated: true,
    sourceModule: 'PURCHASE_BILL',
    sourceDocumentId: 'pinv-001',
    sourceDocumentNumber: 'STARK-INV-8891',
    totalDebit: 177000,
    totalCredit: 177000,
    isBalanced: true,
    itemCount: 4,
    items: [
      { id: 'i1', type: 'Dr', ledgerId: '4', ledgerName: 'Purchase Account', amount: 150000 },
      { id: 'i2', type: 'Dr', ledgerId: '11', ledgerName: 'Input CGST @ 9%', amount: 13500 },
      { id: 'i3', type: 'Dr', ledgerId: '12', ledgerName: 'Input SGST @ 9%', amount: 13500 },
      { id: 'i4', type: 'Cr', ledgerId: '6', ledgerName: 'Acme Heavy Engineering Corp (Creditor)', amount: 177000 },
    ],
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'vch-002',
    voucherNumber: 'INV-2026-081',
    type: 'SALES',
    date: '2026-09-13',
    narration: 'Auto-posted Tax Invoice for customer dispatch against SO-2026-1045 and DC-OUT-2026-0312',
    isSystemGenerated: true,
    sourceModule: 'SALES_INVOICE',
    sourceDocumentId: 'inv-001',
    sourceDocumentNumber: 'SO-2026-1045',
    totalDebit: 100300,
    totalCredit: 100300,
    isBalanced: true,
    itemCount: 4,
    items: [
      { id: 'i5', type: 'Dr', ledgerId: '5', ledgerName: 'Tata Motors Precision Division (Debtor)', amount: 100300 },
      { id: 'i6', type: 'Cr', ledgerId: '3', ledgerName: 'Sales Account (Domestic)', amount: 85000 },
      { id: 'i7', type: 'Cr', ledgerId: '8', ledgerName: 'Output CGST @ 9%', amount: 7650 },
      { id: 'i8', type: 'Cr', ledgerId: '9', ledgerName: 'Output SGST @ 9%', amount: 7650 },
    ],
    createdAt: '2026-09-13T11:00:00Z',
  },
  {
    id: 'vch-003',
    voucherNumber: 'JV-2026-0019',
    type: 'JOURNAL',
    date: '2026-09-13',
    narration: 'Quarterly office rent expense accrual adjustment entry',
    isSystemGenerated: false,
    sourceModule: 'MANUAL_ENTRY',
    totalDebit: 60000,
    totalCredit: 60000,
    isBalanced: true,
    itemCount: 2,
    items: [
      { id: 'i9', type: 'Dr', ledgerId: '7', ledgerName: 'Office Rent Expense', amount: 60000 },
      { id: 'i10', type: 'Cr', ledgerId: '2', ledgerName: 'HDFC Bank Current A/c', amount: 60000 },
    ],
    createdAt: '2026-09-13T14:30:00Z',
  },
  {
    id: 'vch-004',
    voucherNumber: 'RCPT-2026-0045',
    type: 'RECEIPT',
    date: '2026-09-14',
    narration: 'Settlement received against Invoice INV-2026-081 via HDFC NEFT UTR-9941028',
    isSystemGenerated: false,
    sourceModule: 'MANUAL_ENTRY',
    totalDebit: 100300,
    totalCredit: 100300,
    isBalanced: true,
    itemCount: 2,
    items: [
      { id: 'i11', type: 'Dr', ledgerId: '2', ledgerName: 'HDFC Bank Current A/c', amount: 100300 },
      { id: 'i12', type: 'Cr', ledgerId: '5', ledgerName: 'Tata Motors Precision Division (Debtor)', amount: 100300 },
    ],
    createdAt: '2026-09-14T09:15:00Z',
  },
];

const VOUCHER_TYPE_BUTTONS: { type: VoucherType; fKey: string; label: string; color: string }[] = [
  { type: 'CONTRA', fKey: 'F4', label: 'Contra', color: 'bg-amber-600 text-white' },
  { type: 'PAYMENT', fKey: 'F5', label: 'Payment', color: 'bg-rose-600 text-white' },
  { type: 'RECEIPT', fKey: 'F6', label: 'Receipt', color: 'bg-emerald-600 text-white' },
  { type: 'JOURNAL', fKey: 'F7', label: 'Journal', color: 'bg-blue-600 text-white' },
  { type: 'SALES', fKey: 'F8', label: 'Sales', color: 'bg-indigo-600 text-white' },
  { type: 'PURCHASE', fKey: 'F9', label: 'Purchase', color: 'bg-purple-600 text-white' },
];

// Indian numbering currency format helpers
export const formatINR = (val?: number | string | null, showSymbol = true): string => {
  const num = typeof val === 'number' ? val : Number(val || 0);
  const safeNum = isNaN(num) ? 0 : num;
  return `${showSymbol ? '₹ ' : ''}${safeNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatBalance = (val?: number | string | null, nature?: string): string => {
  const num = typeof val === 'number' ? val : Number(val || 0);
  const safeNum = isNaN(num) ? 0 : num;
  const tag = nature === 'LIABILITY' || nature === 'INCOME' ? 'Cr' : 'Dr';
  return `₹ ${safeNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tag}`;
};

export const VoucherEntryScreen: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  // Screen Tabs: 'entry' vs 'register'
  const [activeTab, setActiveTab] = useState<'entry' | 'register'>('entry');

  // Entry Mode for Sales/Purchase: 'ITEM_INVOICE' vs 'ACCOUNTING_VOUCHER' (Mode Toggle Ctrl+H)
  const [entryMode, setEntryMode] = useState<'ITEM_INVOICE' | 'ACCOUNTING_VOUCHER'>('ITEM_INVOICE');

  // Single-Entry Mode for Payment / Receipt / Contra (Tally Single Entry Mode)
  const [isSingleEntryMode, setIsSingleEntryMode] = useState<boolean>(true);

  // Voucher Header State
  const [voucherType, setVoucherType] = useState<VoucherType>('RECEIPT');
  const [voucherNumber, setVoucherNumber] = useState('RCPT-2026-0046');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('INV-2026-089');
  const [partyLedgerId, setPartyLedgerId] = useState('5'); // Tata Motors
  const [customerGstin, setCustomerGstin] = useState('27AAACW1234F1Z1');
  const [narration, setNarration] = useState('Payment received from customer against Invoice INV-2026-089 via RTGS');

  // Item Invoice — Party & Supply Details
  const [placeOfSupply, setPlaceOfSupply] = useState('27'); // Maharashtra (auto from GSTIN)
  const [buyerPoNo, setBuyerPoNo] = useState('PO-2026-1045');
  const [salesLedgerId, setSalesLedgerId] = useState('3'); // Sales Account (Domestic)
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [showDispatchSection, setShowDispatchSection] = useState(false);
  const [dispatchThrough, setDispatchThrough] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [lrNo, setLrNo] = useState('');
  const [destination, setDestination] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [eInvoiceEnabled, setEInvoiceEnabled] = useState(false);
  const [eWayBillEnabled, setEWayBillEnabled] = useState(false);
  const [roundOff, setRoundOff] = useState<number>(0);

  // Additional Charges (Freight, Packing, Insurance, Other)
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([
    { id: 'ac-1', label: 'Freight / Transport Charges', amount: '', gstPercent: 18, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 },
    { id: 'ac-2', label: 'Packing & Forwarding', amount: '', gstPercent: 18, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 },
    { id: 'ac-3', label: 'Insurance', amount: '', gstPercent: 18, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 },
    { id: 'ac-4', label: 'Other Charges', amount: '', gstPercent: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 },
  ]);

  // Single-Entry Banking Ledger (Top "Account:" in Tally)
  const [bankingAccountLedgerId, setBankingAccountLedgerId] = useState<string>('2'); // HDFC Bank

  // Single-Entry Particulars Lines
  const [singleEntryParticulars, setSingleEntryParticulars] = useState<SingleEntryParticular[]>([
    {
      id: 'sep-1',
      ledgerId: '5', // Tata Motors (Debtor)
      amount: 43070,
      curBalance: 780000,
      billAllocations: [
        { type: 'Agst Ref', refNo: 'INV-2026-089', dueDate: '2026-09-20', amount: 43070 }
      ],
      bankAllocations: [
        {
          transactionType: 'e-Fund Transfer',
          instrumentNo: 'UTR-98421045',
          instrumentDate: new Date().toISOString().split('T')[0],
          bankName: 'HDFC Bank Limited',
          transferMode: 'RTGS',
          favoureeName: 'Tata Motors Precision Division',
          amount: 43070
        }
      ]
    }
  ]);

  // Modal active index states
  const [activeBillModalIndex, setActiveBillModalIndex] = useState<number | null>(null);
  const [activeBankModalIndex, setActiveBankModalIndex] = useState<number | null>(null);

  // Master State
  const [ledgers, setLedgers] = useState<LedgerOption[]>(INITIAL_LEDGERS);
  const [groups] = useState<LedgerGroupOption[]>(INITIAL_GROUPS);
  const [vouchersRegister, setVouchersRegister] = useState<VoucherRecord[]>(INITIAL_VOUCHERS_REGISTER);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Filtered Ledger Helper Lists
  const bankAndCashLedgers = useMemo(() => {
    const filtered = ledgers.filter(
      l => l.groupName?.toLowerCase().includes('bank') ||
           l.groupName?.toLowerCase().includes('cash') ||
           l.name?.toLowerCase().includes('bank') ||
           l.name?.toLowerCase().includes('cash')
    );
    return filtered.length > 0 ? filtered : ledgers;
  }, [ledgers]);

  const partyLedgers = useMemo(() => {
    const filtered = ledgers.filter(
      l => l.groupName?.toLowerCase().includes('debtor') ||
           l.groupName?.toLowerCase().includes('creditor') ||
           l.nature === 'ASSET' ||
           l.nature === 'LIABILITY'
    );
    return filtered.length > 0 ? filtered : ledgers;
  }, [ledgers]);

  const salesPurchaseLedgers = useMemo(() => {
    const filtered = ledgers.filter(
      l => l.groupName?.toLowerCase().includes('sales') ||
           l.groupName?.toLowerCase().includes('purchase') ||
           l.nature === 'INCOME' ||
           l.nature === 'EXPENSE'
    );
    return filtered.length > 0 ? filtered : ledgers;
  }, [ledgers]);

  // Load Live Database Ledgers on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchMasters = async () => {
      try {
        const authHeaders = getAuthHeaders();
        const res = await fetch('/api/v1/masters/all', {
          headers: {
            ...authHeaders,
            'x-tenant-id': authHeaders['x-tenant-id'] || 'tenant-default-01'
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && json.data.ledgers && json.data.ledgers.length > 0) {
            const mappedLedgers: LedgerOption[] = json.data.ledgers.map((l: any) => ({
              id: l.id,
              name: l.name,
              currentBalance: Number(l.currentBalance || 0),
              groupName: l.group?.name || 'General Ledger',
              nature: l.group?.nature || 'ASSET',
            }));
            setLedgers(mappedLedgers);

            // Auto-align active selected ledgers if default IDs aren't in fetched list
            const bankCash = mappedLedgers.find(l => l.groupName?.toLowerCase().includes('bank') || l.groupName?.toLowerCase().includes('cash'));
            if (bankCash) {
              setBankingAccountLedgerId(prev => (mappedLedgers.some(l => l.id === prev) ? prev : bankCash.id));
            }
            const debtorCreditor = mappedLedgers.find(l => l.groupName?.toLowerCase().includes('debtor') || l.groupName?.toLowerCase().includes('creditor'));
            if (debtorCreditor) {
              setPartyLedgerId(prev => (mappedLedgers.some(l => l.id === prev) ? prev : debtorCreditor.id));
            }
            const spLedger = mappedLedgers.find(l => l.groupName?.toLowerCase().includes('sales') || l.groupName?.toLowerCase().includes('purchase'));
            if (spLedger) {
              setSalesLedgerId(prev => (mappedLedgers.some(l => l.id === prev) ? prev : spLedger.id));
            }

            // Sync particulars
            setSingleEntryParticulars(prev => prev.map(p => {
              const matched = mappedLedgers.find(l => l.id === p.ledgerId) || debtorCreditor || mappedLedgers[0];
              return {
                ...p,
                ledgerId: matched.id,
                curBalance: matched.currentBalance,
              };
            }));

            // Sync drCrItems
            setDrCrItems(prev => prev.map((it, idx) => {
              const targetLedger = idx === 0 ? (bankCash || mappedLedgers[0]) : (debtorCreditor || mappedLedgers[1] || mappedLedgers[0]);
              const existing = mappedLedgers.find(l => l.id === it.ledgerId);
              return {
                ...it,
                ledgerId: existing ? existing.id : targetLedger.id,
              };
            }));
          }
        }
      } catch (err) {
        console.warn('Masters live load fallback:', err);
      }
    };
    fetchMasters();
    return () => { isMounted = false; };
  }, [getAuthHeaders]);

  // Item Invoice Mode Lines (for Sales / Purchase)
  const [invoiceItems, setInvoiceItems] = useState<ItemInvoiceLine[]>([
    {
      id: 'inv-item-1',
      itemId: 'item-1',
      itemName: 'Deep Groove Ball Bearing 6205-ZZ',
      description: 'Single row deep groove ball bearing, 25mm bore, 52mm OD, 15mm width, ZZ shielded',
      sku: 'BRG-6205-ZZ',
      hsnCode: '84821010',
      warehouseId: 'wh-1',
      warehouseName: 'Pune Central Godown (Main)',
      quantity: 50,
      uom: 'NOS',
      rate: 480,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 24000,
      taxRatePercent: 18,
      cgstPercent: 9,
      sgstPercent: 9,
      igstPercent: 0,
      cgstAmount: 2160,
      sgstAmount: 2160,
      igstAmount: 0,
      totalAmount: 28320,
    },
    {
      id: 'inv-item-2',
      itemId: 'item-3',
      itemName: 'Solid Carbide 4-Flute Endmill M12',
      description: 'Solid carbide 4-flute end mill 12mm dia, 75mm OAL, AlTiN coated, for steel machining',
      sku: 'CNC-TOOL-M12',
      hsnCode: '82079090',
      warehouseId: 'wh-1',
      warehouseName: 'Pune Central Godown (Main)',
      quantity: 10,
      uom: 'NOS',
      rate: 1250,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 12500,
      taxRatePercent: 18,
      cgstPercent: 9,
      sgstPercent: 9,
      igstPercent: 0,
      cgstAmount: 1125,
      sgstAmount: 1125,
      igstAmount: 0,
      totalAmount: 14750,
    },
  ]);

  // Pure Double-Entry Lines (for Contra, Payment, Receipt, Journal, or As-Voucher mode)
  const [drCrItems, setDrCrItems] = useState<VoucherLineItem[]>([
    {
      id: 'item-1',
      type: 'Dr',
      ledgerId: '2', // HDFC Bank
      amount: 43070,
    },
    {
      id: 'item-2',
      type: 'Cr',
      ledgerId: '5', // Tata Motors (Debtor)
      amount: 43070,
    },
  ]);

  // Print Modal State
  const [printDoc, setPrintDoc] = useState<PrintDocumentData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Day Book / Register Filter & Search States
  const [registerFilterType, setRegisterFilterType] = useState<string>('ALL');
  const [registerSearchQuery, setRegisterSearchQuery] = useState<string>('');
  const [registerFromDate, setRegisterFromDate] = useState<string>('');
  const [registerToDate, setRegisterToDate] = useState<string>('');
  const [inspectingVoucher, setInspectingVoucher] = useState<VoucherRecord | null>(null);

  // Handle Voucher Type Switching with Tally Golden Rules
  const handleVoucherTypeChange = (newType: VoucherType) => {
    setVoucherType(newType);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);

    if (newType === 'RECEIPT') {
      setVoucherNumber(`RCPT-${dateStr}-${rand}`);
      setNarration('Settlement received from debtor against pending sales invoices');
      setBankingAccountLedgerId('2'); // HDFC Bank
      setPartyLedgerId('5'); // Tata Motors
      setSingleEntryParticulars([
        {
          id: 'sep-1',
          ledgerId: '5',
          amount: 50000,
          curBalance: 780000,
          billAllocations: [{ type: 'Agst Ref', refNo: 'INV-2026-081', dueDate: '2026-09-25', amount: 50000 }],
          bankAllocations: [{
            transactionType: 'e-Fund Transfer',
            instrumentNo: `UTR-${rand}89`,
            instrumentDate: new Date().toISOString().split('T')[0],
            bankName: 'HDFC Bank Current A/c',
            transferMode: 'NEFT',
            favoureeName: 'Tata Motors Precision Division',
            amount: 50000
          }]
        }
      ]);
      setDrCrItems([
        { id: '1', type: 'Dr', ledgerId: '2', amount: 50000 },
        { id: '2', type: 'Cr', ledgerId: '5', amount: 50000 },
      ]);
    } else if (newType === 'PAYMENT') {
      setVoucherNumber(`PYMT-${dateStr}-${rand}`);
      setNarration('Payment issued to vendor against purchase invoices / operational expenses');
      setBankingAccountLedgerId('2'); // HDFC Bank
      setPartyLedgerId('6'); // Acme Creditor
      setSingleEntryParticulars([
        {
          id: 'sep-1',
          ledgerId: '6',
          amount: 75000,
          curBalance: 885000,
          billAllocations: [{ type: 'Agst Ref', refNo: 'PUR-2026-0081', dueDate: '2026-09-30', amount: 75000 }],
          bankAllocations: [{
            transactionType: 'e-Fund Transfer',
            instrumentNo: `UTR-PYM-${rand}`,
            instrumentDate: new Date().toISOString().split('T')[0],
            bankName: 'HDFC Bank Current A/c',
            transferMode: 'RTGS',
            favoureeName: 'Acme Heavy Engineering Corp',
            amount: 75000
          }]
        }
      ]);
      setDrCrItems([
        { id: '1', type: 'Dr', ledgerId: '6', amount: 75000 },
        { id: '2', type: 'Cr', ledgerId: '2', amount: 75000 },
      ]);
    } else if (newType === 'CONTRA') {
      setVoucherNumber(`CNTR-${dateStr}-${rand}`);
      setNarration('Cash withdrawal / deposit between Bank and Cash account');
      setBankingAccountLedgerId('2'); // HDFC Bank
      setSingleEntryParticulars([
        { id: 'sep-1', ledgerId: '1', amount: 15000, curBalance: 25000 }
      ]);
      setDrCrItems([
        { id: '1', type: 'Dr', ledgerId: '2', amount: 15000 },
        { id: '2', type: 'Cr', ledgerId: '1', amount: 15000 },
      ]);
    } else if (newType === 'JOURNAL') {
      setVoucherNumber(`JV-${dateStr}-${rand}`);
      setNarration('Accrual / Adjustment / Rectification Journal Entry');
      setDrCrItems([
        { id: '1', type: 'Dr', ledgerId: '7', amount: 25000 },
        { id: '2', type: 'Cr', ledgerId: '6', amount: 25000 },
      ]);
    } else if (newType === 'SALES') {
      setVoucherNumber(`SALES-${dateStr}-${rand}`);
      setNarration('Commercial Tax Invoice dispatch to customer');
      setPartyLedgerId('5');
      setDrCrItems([
        { id: '1', type: 'Dr', ledgerId: '5', amount: 43070 },
        { id: '2', type: 'Cr', ledgerId: '3', amount: 36500 },
        { id: '3', type: 'Cr', ledgerId: '8', amount: 3285 },
        { id: '4', type: 'Cr', ledgerId: '9', amount: 3285 },
      ]);
    } else if (newType === 'PURCHASE') {
      setVoucherNumber(`PUR-${dateStr}-${rand}`);
      setNarration('Inward Raw Material Purchase Bill from vendor');
      setPartyLedgerId('6');
      setDrCrItems([
        { id: '1', type: 'Dr', ledgerId: '4', amount: 50000 },
        { id: '2', type: 'Dr', ledgerId: '11', amount: 4500 },
        { id: '3', type: 'Dr', ledgerId: '12', amount: 4500 },
        { id: '4', type: 'Cr', ledgerId: '6', amount: 59000 },
      ]);
    }
  };


  // ─── Supply Type Auto-Detection from GSTIN ───────────────────────────────────
  // First 2 chars of GSTIN = state code. Compare company vs customer to determine tax type.
  const supplyType: SupplyType = useMemo(() => {
    const partyCode = customerGstin.trim().substring(0, 2);
    if (!partyCode || customerGstin.trim().toUpperCase() === 'URP') return 'INTRASTATE'; // Unregistered
    if (partyCode === '96' || partyCode === '97') return 'EXPORT';
    return partyCode === COMPANY_STATE_CODE ? 'INTRASTATE' : 'INTERSTATE';
  }, [customerGstin]);

  const isInterstate = supplyType === 'INTERSTATE';
  const customerStateName = GSTIN_STATE_CODES[customerGstin.trim().substring(0, 2)] || '';
  const companyStateName = GSTIN_STATE_CODES[COMPANY_STATE_CODE] || 'Maharashtra';

  // ─── Compute totals for Item Invoice ─────────────────────────────────────────
  const itemInvoiceTotals = useMemo(() => {
    let taxable = 0, cgst = 0, sgst = 0, igst = 0, discount = 0;
    const byRate: Record<number, { taxable: number; cgst: number; sgst: number; igst: number }> = {};

    invoiceItems.forEach((item) => {
      const t = Number(item.taxableAmount) || 0;
      const d = Number(item.discountAmount) || 0;
      taxable += t;
      discount += d;
      cgst += Number(item.cgstAmount) || 0;
      sgst += Number(item.sgstAmount) || 0;
      igst += Number(item.igstAmount) || 0;

      const r = Number(item.taxRatePercent) || 18;
      if (!byRate[r]) byRate[r] = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
      byRate[r].taxable += t;
      byRate[r].cgst += Number(item.cgstAmount) || 0;
      byRate[r].sgst += Number(item.sgstAmount) || 0;
      byRate[r].igst += Number(item.igstAmount) || 0;
    });

    // Additional charges totals
    let addlTaxable = 0, addlCgst = 0, addlSgst = 0, addlIgst = 0;
    additionalCharges.forEach((ac) => {
      addlTaxable += Number(ac.taxableAmount) || 0;
      addlCgst += Number(ac.cgstAmount) || 0;
      addlSgst += Number(ac.sgstAmount) || 0;
      addlIgst += Number(ac.igstAmount) || 0;
    });

    const totalTax = cgst + sgst + igst + addlCgst + addlSgst + addlIgst;
    const subTotalBeforeRound = taxable + totalTax + addlTaxable;
    const grandTotal = subTotalBeforeRound + roundOff;

    const taxSummaryRows: InvoiceTaxSummaryRow[] = Object.entries(byRate)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([rate, vals]) => ({
        ratePercent: Number(rate),
        taxableAmount: vals.taxable,
        cgstAmount: vals.cgst,
        sgstAmount: vals.sgst,
        igstAmount: vals.igst,
      }));

    return {
      taxable, discount, cgst, sgst, igst,
      addlTaxable, addlCgst, addlSgst, addlIgst,
      totalTax, subTotalBeforeRound, grandTotal,
      taxSummaryRows,
    };
  }, [invoiceItems, additionalCharges, roundOff]);

  // ─── Update line item with supply-type-aware tax calc ─────────────────────────
  const updateInvoiceLine = (idx: number, updates: Partial<ItemInvoiceLine>) => {
    setInvoiceItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[idx], ...updates };

      if ('itemId' in updates) {
        const itemObj = SAMPLE_INVENTORY_ITEMS.find((i) => i.id === updates.itemId);
        if (itemObj) {
          current.itemName = itemObj.name;
          current.description = itemObj.description;
          current.sku = itemObj.sku;
          current.hsnCode = itemObj.hsnCode;
          current.rate = itemObj.defaultRate;
          current.uom = itemObj.uom;
          current.taxRatePercent = itemObj.defaultGst;
        }
      }

      const qty = Number(current.quantity) || 0;
      const rate = Number(current.rate) || 0;
      const disc = Number(current.discountPercent) || 0;
      const raw = qty * rate;
      current.discountAmount = (raw * disc) / 100;
      const taxableAmt = raw - current.discountAmount;
      current.taxableAmount = taxableAmt;

      const gstRate = Number(current.taxRatePercent) || 18;
      if (isInterstate) {
        current.cgstPercent = 0;
        current.sgstPercent = 0;
        current.igstPercent = gstRate;
        current.cgstAmount = 0;
        current.sgstAmount = 0;
        current.igstAmount = (taxableAmt * gstRate) / 100;
        current.totalAmount = taxableAmt + current.igstAmount;
      } else {
        current.cgstPercent = gstRate / 2;
        current.sgstPercent = gstRate / 2;
        current.igstPercent = 0;
        current.cgstAmount = (taxableAmt * (gstRate / 2)) / 100;
        current.sgstAmount = (taxableAmt * (gstRate / 2)) / 100;
        current.igstAmount = 0;
        current.totalAmount = taxableAmt + current.cgstAmount + current.sgstAmount;
      }

      copy[idx] = current;
      return copy;
    });
  };

  // Re-compute all line taxes when supply type changes (e.g., party GSTIN changes)
  const recomputeAllLineTaxes = (interstate: boolean) => {
    setInvoiceItems((prev) =>
      prev.map((current) => {
        const gstRate = Number(current.taxRatePercent) || 18;
        const taxableAmt = Number(current.taxableAmount) || 0;
        if (interstate) {
          return {
            ...current,
            cgstPercent: 0, sgstPercent: 0, igstPercent: gstRate,
            cgstAmount: 0, sgstAmount: 0,
            igstAmount: (taxableAmt * gstRate) / 100,
            totalAmount: taxableAmt + (taxableAmt * gstRate) / 100,
          };
        } else {
          return {
            ...current,
            cgstPercent: gstRate / 2, sgstPercent: gstRate / 2, igstPercent: 0,
            cgstAmount: (taxableAmt * (gstRate / 2)) / 100,
            sgstAmount: (taxableAmt * (gstRate / 2)) / 100,
            igstAmount: 0,
            totalAmount: taxableAmt + 2 * (taxableAmt * (gstRate / 2)) / 100,
          };
        }
      })
    );
  };

  // ─── Update Additional Charges ──────────────────────────────────────────────
  const updateAdditionalCharge = (idx: number, field: 'amount' | 'gstPercent', value: string | number) => {
    setAdditionalCharges((prev) => {
      const copy = [...prev];
      const ac = { ...copy[idx], [field]: value };
      const amt = Number(ac.amount) || 0;
      const gst = Number(ac.gstPercent) || 0;
      ac.taxableAmount = amt;
      if (isInterstate) {
        ac.cgstAmount = 0; ac.sgstAmount = 0;
        ac.igstAmount = (amt * gst) / 100;
      } else {
        ac.cgstAmount = (amt * (gst / 2)) / 100;
        ac.sgstAmount = (amt * (gst / 2)) / 100;
        ac.igstAmount = 0;
      }
      ac.totalAmount = amt + ac.cgstAmount + ac.sgstAmount + ac.igstAmount;
      copy[idx] = ac;
      return copy;
    });
  };

  const handleAddInvoiceItem = () => {
    const defaultItem = SAMPLE_INVENTORY_ITEMS[0];
    const gstRate = defaultItem.defaultGst;
    const baseAmt = defaultItem.defaultRate;
    const cgst = isInterstate ? 0 : (baseAmt * (gstRate / 2)) / 100;
    const sgst = isInterstate ? 0 : (baseAmt * (gstRate / 2)) / 100;
    const igstAmt = isInterstate ? (baseAmt * gstRate) / 100 : 0;
    const newItem: ItemInvoiceLine = {
      id: `inv-item-${Date.now()}`,
      itemId: defaultItem.id,
      itemName: defaultItem.name,
      description: defaultItem.description,
      sku: defaultItem.sku,
      hsnCode: defaultItem.hsnCode,
      warehouseId: SAMPLE_WAREHOUSES[0].id,
      warehouseName: SAMPLE_WAREHOUSES[0].name,
      quantity: 1,
      uom: defaultItem.uom,
      rate: baseAmt,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: baseAmt,
      taxRatePercent: gstRate,
      cgstPercent: isInterstate ? 0 : gstRate / 2,
      sgstPercent: isInterstate ? 0 : gstRate / 2,
      igstPercent: isInterstate ? gstRate : 0,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igstAmt,
      totalAmount: baseAmt + cgst + sgst + igstAmt,
    };
    setInvoiceItems((prev) => [...prev, newItem]);
  };



  const handleDeleteInvoiceItem = (idx: number) => {
    if (invoiceItems.length === 1) return;
    setInvoiceItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Single-Entry Mode Total Amount
  const singleEntryTotal = useMemo(() => {
    return singleEntryParticulars.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [singleEntryParticulars]);

  // Debit/Credit Totals for Double-Entry Mode
  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    if (voucherType === 'SALES' || voucherType === 'PURCHASE') {
      if (entryMode === 'ITEM_INVOICE') {
        const total = itemInvoiceTotals.grandTotal;
        return { totalDebit: total, totalCredit: total, isBalanced: true };
      }
    }
    if ((voucherType === 'RECEIPT' || voucherType === 'PAYMENT' || voucherType === 'CONTRA') && isSingleEntryMode) {
      return { totalDebit: singleEntryTotal, totalCredit: singleEntryTotal, isBalanced: true };
    }
    let dr = 0, cr = 0;
    drCrItems.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'Dr') dr += amt;
      if (item.type === 'Cr') cr += amt;
    });
    return { totalDebit: dr, totalCredit: cr, isBalanced: dr === cr && dr > 0 };
  }, [voucherType, entryMode, isSingleEntryMode, itemInvoiceTotals, singleEntryTotal, drCrItems]);

  // Double Entry Row Handlers
  const handleAddDrCrRow = () => {
    const newId = `dr-cr-${Date.now()}`;
    setDrCrItems((prev) => [...prev, { id: newId, type: 'Dr', ledgerId: ledgers[0]?.id || '1', amount: 0 }]);
  };

  const handleDeleteDrCrRow = (idx: number) => {
    if (drCrItems.length <= 2) return;
    setDrCrItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrCrItemChange = (idx: number, field: keyof VoucherLineItem, value: any) => {
    setDrCrItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Single-Entry Handlers
  const handleAddSingleEntryParticular = () => {
    const newId = `sep-${Date.now()}`;
    const defaultLedger = ledgers.find(l => l.groupName.includes('Debtor') || l.groupName.includes('Creditor') || l.groupName.includes('Expenses')) || ledgers[4];
    setSingleEntryParticulars(prev => [
      ...prev,
      {
        id: newId,
        ledgerId: defaultLedger.id,
        amount: 10000,
        curBalance: defaultLedger.currentBalance,
        billAllocations: [{ type: 'Agst Ref', refNo: 'NEW-REF-001', dueDate: '2026-09-30', amount: 10000 }],
        bankAllocations: [{
          transactionType: 'e-Fund Transfer',
          instrumentNo: 'UTR-NEW',
          instrumentDate: new Date().toISOString().split('T')[0],
          bankName: 'HDFC Bank',
          transferMode: 'NEFT',
          favoureeName: defaultLedger.name,
          amount: 10000
        }]
      }
    ]);
  };

  const handleDeleteSingleEntryParticular = (idx: number) => {
    if (singleEntryParticulars.length === 1) return;
    setSingleEntryParticulars(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSingleEntryParticularChange = (idx: number, field: keyof SingleEntryParticular, value: any) => {
    setSingleEntryParticulars(prev => {
      const copy = [...prev];
      const updated = { ...copy[idx], [field]: value };
      if (field === 'ledgerId') {
        const found = ledgers.find(l => l.id === value);
        if (found) {
          updated.curBalance = found.currentBalance;
        }
      }
      copy[idx] = updated;
      return copy;
    });
  };

  // Save Voucher
  const handleSaveVoucher = async () => {
    if (!isBalanced) return;
    setIsSubmitting(true);

    let recordedItems: VoucherLineItem[] = [];

    if (voucherType === 'SALES' || voucherType === 'PURCHASE') {
      if (entryMode === 'ITEM_INVOICE') {
        if (voucherType === 'SALES') {
          recordedItems = [
            { id: '1', type: 'Dr', ledgerId: partyLedgerId, amount: itemInvoiceTotals.grandTotal },
            { id: '2', type: 'Cr', ledgerId: '3', amount: itemInvoiceTotals.taxable },
            { id: '3', type: 'Cr', ledgerId: '8', amount: itemInvoiceTotals.cgst },
            { id: '4', type: 'Cr', ledgerId: '9', amount: itemInvoiceTotals.sgst },
          ];
        } else {
          recordedItems = [
            { id: '1', type: 'Dr', ledgerId: '4', amount: itemInvoiceTotals.taxable },
            { id: '2', type: 'Dr', ledgerId: '11', amount: itemInvoiceTotals.cgst },
            { id: '3', type: 'Dr', ledgerId: '12', amount: itemInvoiceTotals.sgst },
            { id: '4', type: 'Cr', ledgerId: partyLedgerId, amount: itemInvoiceTotals.grandTotal },
          ];
        }
      } else {
        recordedItems = drCrItems;
      }
    } else if ((voucherType === 'RECEIPT' || voucherType === 'PAYMENT' || voucherType === 'CONTRA') && isSingleEntryMode) {
      if (voucherType === 'RECEIPT') {
        recordedItems = [
          { id: 'b1', type: 'Dr', ledgerId: bankingAccountLedgerId, amount: singleEntryTotal },
          ...singleEntryParticulars.map((p, idx) => ({
            id: `p${idx}`,
            type: 'Cr' as EntryType,
            ledgerId: p.ledgerId,
            amount: Number(p.amount) || 0
          }))
        ];
      } else if (voucherType === 'PAYMENT') {
        recordedItems = [
          ...singleEntryParticulars.map((p, idx) => ({
            id: `p${idx}`,
            type: 'Dr' as EntryType,
            ledgerId: p.ledgerId,
            amount: Number(p.amount) || 0
          })),
          { id: 'b1', type: 'Cr', ledgerId: bankingAccountLedgerId, amount: singleEntryTotal }
        ];
      } else {
        // Contra
        recordedItems = [
          { id: 'b1', type: 'Dr', ledgerId: bankingAccountLedgerId, amount: singleEntryTotal },
          ...singleEntryParticulars.map((p, idx) => ({
            id: `p${idx}`,
            type: 'Cr' as EntryType,
            ledgerId: p.ledgerId,
            amount: Number(p.amount) || 0
          }))
        ];
      }
    } else {
      recordedItems = drCrItems;
    }

    const payload = {
      type: voucherType,
      voucherNumber,
      date,
      narration,
      isSystemGenerated: false,
      sourceModule: 'MANUAL_ENTRY',
      items: recordedItems.map((item) => ({
        ledgerId: item.ledgerId || 'unknown',
        debitAmount: item.type === 'Dr' ? item.amount : 0,
        creditAmount: item.type === 'Cr' ? item.amount : 0,
      })).filter(i => Number(i.debitAmount) > 0 || Number(i.creditAmount) > 0),
    };

    try {
      const res = await fetch('/api/v1/accounting/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          'x-user-id': 'usr-admin',
          'x-user-role': 'OWNER',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      const newRecord: VoucherRecord = {
        id: data?.data?.id || `vch-${Date.now()}`,
        voucherNumber,
        type: voucherType,
        date,
        narration,
        isSystemGenerated: false,
        sourceModule: 'MANUAL_ENTRY',
        totalDebit,
        totalCredit,
        isBalanced: true,
        itemCount: recordedItems.length,
        items: recordedItems,
        createdAt: new Date().toISOString(),
      };

      setVouchersRegister((prev) => [newRecord, ...prev]);
      setIsSubmitting(false);
      setSaveSuccessMsg(`Voucher ${voucherNumber} saved & posted to General Ledger successfully via API.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      handleVoucherTypeChange(voucherType);
    } catch (error) {
      console.error('Failed to post voucher to backend', error);
      const newRecord: VoucherRecord = {
        id: `vch-${Date.now()}`,
        voucherNumber,
        type: voucherType,
        date,
        narration,
        isSystemGenerated: false,
        sourceModule: 'MANUAL_ENTRY',
        totalDebit,
        totalCredit,
        isBalanced: true,
        itemCount: recordedItems.length,
        items: recordedItems,
        createdAt: new Date().toISOString(),
      };

      setVouchersRegister((prev) => [newRecord, ...prev]);
      setIsSubmitting(false);
      setSaveSuccessMsg(`[Fallback] Voucher ${voucherNumber} saved locally.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      handleVoucherTypeChange(voucherType);
    }
  };

  // Keyboard Hotkeys Integration
  useVoucherHotkeys({
    onSave: () => handleSaveVoucher(),
    onQuickCreate: () => setIsQuickCreateOpen(true),
    onEscape: () => {
      setActiveBillModalIndex(null);
      setActiveBankModalIndex(null);
      setIsQuickCreateOpen(false);
      setInspectingVoucher(null);
    },
    onSwitchType: (type: VoucherType) => handleVoucherTypeChange(type),
    onAddRow: () => {
      if (entryMode === 'ITEM_INVOICE' && (voucherType === 'SALES' || voucherType === 'PURCHASE')) {
        handleAddInvoiceItem();
      } else if (isSingleEntryMode && (voucherType === 'RECEIPT' || voucherType === 'PAYMENT' || voucherType === 'CONTRA')) {
        handleAddSingleEntryParticular();
      } else {
        handleAddDrCrRow();
      }
    },
    onSwitchTab: (tab: 'entry' | 'register') => setActiveTab(tab),
    onToggleMode: () => {
      if (voucherType === 'SALES' || voucherType === 'PURCHASE') {
        setEntryMode(prev => prev === 'ITEM_INVOICE' ? 'ACCOUNTING_VOUCHER' : 'ITEM_INVOICE');
      } else if (voucherType === 'RECEIPT' || voucherType === 'PAYMENT' || voucherType === 'CONTRA') {
        setIsSingleEntryMode(prev => !prev);
      }
    },
    isModalOpen: isQuickCreateOpen || activeBillModalIndex !== null || activeBankModalIndex !== null || inspectingVoucher !== null || !!printDoc,
  });

  const handlePrintRecordedVoucher = (rec: VoucherRecord) => {
    setPrintDoc({
      title: `${rec.type} VOUCHER - ${rec.voucherNumber}`,
      type: 'JV',
      documentNumber: rec.voucherNumber,
      date: rec.date,
      partyName: ledgers.find((l) => l.id === rec.items[0]?.ledgerId)?.name || 'Principal Account',
      partyAddress: 'Plot 42, PCMC Industrial Corridor, Pune, MH 411018',
      partyGstin: '27AAACW1234F1Z1',
      items: rec.items.map((it, idx) => ({
        id: `vch-item-${idx}`,
        description: ledgers.find((l) => l.id === it.ledgerId)?.name || 'General Ledger Account',
        hsnCode: '998311',
        quantity: 1,
        uom: 'NOS',
        unitPrice: Number(it.amount),
        taxableAmount: Number(it.amount),
        gstRatePercent: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: Number(it.amount),
      })),
      subtotal: rec.totalDebit,
      totalTax: 0,
      grandTotal: rec.totalDebit,
      narration: rec.narration,
      accountingEntries: rec.items.map((it) => ({
        accountName: ledgers.find((l) => l.id === it.ledgerId)?.name || 'General Ledger',
        debit: it.type === 'Dr' ? Number(it.amount) : 0,
        credit: it.type === 'Cr' ? Number(it.amount) : 0,
        type: it.type,
      })),
    });
  };

  const filteredRegister = useMemo(() => {
    return vouchersRegister.filter((v) => {
      // 1. Voucher Type Filter
      if (registerFilterType !== 'ALL' && v.type !== registerFilterType) {
        return false;
      }
      // 2. Date Range Filter
      if (registerFromDate && v.date < registerFromDate) {
        return false;
      }
      if (registerToDate && v.date > registerToDate) {
        return false;
      }
      // 3. Search Query Filter (Voucher Number, Narration, Ledger names, or Amounts)
      if (registerSearchQuery.trim()) {
        const query = registerSearchQuery.toLowerCase().trim();
        const matchNum = v.voucherNumber?.toLowerCase().includes(query);
        const matchNarr = v.narration?.toLowerCase().includes(query);
        const matchType = v.type?.toLowerCase().includes(query);
        const matchSource = v.sourceDocumentNumber?.toLowerCase().includes(query);
        const matchLedger = v.items?.some((it) => {
          const lName = ledgers.find((l) => l.id === it.ledgerId)?.name || it.ledgerName || '';
          return lName.toLowerCase().includes(query);
        });
        const matchAmount = String(v.totalDebit).includes(query) || String(v.totalCredit).includes(query);
        if (!matchNum && !matchNarr && !matchType && !matchSource && !matchLedger && !matchAmount) {
          return false;
        }
      }
      return true;
    });
  }, [vouchersRegister, registerFilterType, registerSearchQuery, registerFromDate, registerToDate, ledgers]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Top Banner & Hotkey Breadcrumb */}
      <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight">Accounting Voucher Entry & Day Book</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Legacy ERP Native Parity
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Single-Entry & Double-Entry engine with Bill-wise Allocation & Bank Allocations
            </p>
          </div>
        </div>

        {/* View Switcher: Entry Screen vs Register / Day Book */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('entry')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'entry'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Voucher Entry (Alt+V)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Day Book / Register ({vouchersRegister.length})</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'entry' ? (
        <div className="flex-1 flex flex-col">
          {/* Tally F-Keys Voucher Type Switcher Toolbar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Voucher Type:
              </span>
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {VOUCHER_TYPE_BUTTONS.map((btn) => (
                  <button
                    key={btn.type}
                    type="button"
                    onClick={() => handleVoucherTypeChange(btn.type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      voucherType === btn.type
                        ? `${btn.color} shadow-sm`
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <kbd className="font-mono text-[10px] bg-black/20 px-1 py-0.5 rounded text-current">
                      {btn.fKey}
                    </kbd>
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Switcher for Payment / Receipt / Contra / Sales / Purchase */}
            {(voucherType === 'SALES' || voucherType === 'PURCHASE') ? (
              <div className="flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-950/60 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
                <button
                  type="button"
                  onClick={() => setEntryMode('ITEM_INVOICE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    entryMode === 'ITEM_INVOICE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 inline mr-1" />
                  <span>Item Invoice Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('ACCOUNTING_VOUCHER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    entryMode === 'ACCOUNTING_VOUCHER'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
                  <span>As Voucher (Dr/Cr)</span>
                </button>
              </div>
            ) : (voucherType === 'RECEIPT' || voucherType === 'PAYMENT' || voucherType === 'CONTRA') ? (
              <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/60 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <button
                  type="button"
                  onClick={() => setIsSingleEntryMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSingleEntryMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1" />
                  <span>Single-Entry (Account)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSingleEntryMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isSingleEntryMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
                  <span>Double-Entry (Dr/Cr)</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Main Form Body */}
          <div className="p-6 space-y-4 max-w-7xl mx-auto w-full">
            {/* ═══ ITEM INVOICE MODE — Enhanced Header ═══ */}
            {entryMode === 'ITEM_INVOICE' && (voucherType === 'SALES' || voucherType === 'PURCHASE') ? (
              <div className="space-y-3">
                {/* Row 1 — Invoice Meta + Supply Type Indicator */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  {/* Supply Type Badge */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Supply Type:</span>
                      {supplyType === 'INTRASTATE' && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-black border border-emerald-300 dark:border-emerald-700">
                          <Check className="w-3 h-3" />
                          <span>INTRASTATE — CGST + SGST applies ({companyStateName} → {customerStateName || companyStateName})</span>
                        </span>
                      )}
                      {supplyType === 'INTERSTATE' && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-black border border-amber-300 dark:border-amber-700">
                          <Globe className="w-3 h-3" />
                          <span>INTERSTATE — IGST applies ({companyStateName} → {customerStateName})</span>
                        </span>
                      )}
                      {supplyType === 'EXPORT' && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] font-black border border-blue-300 dark:border-blue-700">
                          <ArrowRight className="w-3 h-3" />
                          <span>EXPORT — Zero-rated / LUT applies</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <span>Company GSTIN: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{COMPANY_GSTIN}</span></span>
                    </div>
                  </div>

                  {/* Section A: Party + GSTIN + Invoice Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Party / Customer Name */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        <User className="w-3 h-3 inline mr-1 text-emerald-600" />
                        {voucherType === 'SALES' ? 'Customer / Debtor' : 'Vendor / Creditor'} *
                      </label>
                      <select
                        value={partyLedgerId}
                        onChange={(e) => setPartyLedgerId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      >
                        {ledgers
                          .filter(l => l.groupName.includes('Debtor') || l.groupName.includes('Creditor') || l.nature === 'ASSET' || l.nature === 'LIABILITY')
                          .map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                      </select>
                    </div>

                    {/* Party GSTIN */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        {voucherType === 'SALES' ? 'Customer GSTIN' : 'Vendor GSTIN'} *
                      </label>
                      <input
                        type="text"
                        value={customerGstin}
                        onChange={(e) => {
                          setCustomerGstin(e.target.value.toUpperCase());
                          // Auto-set place of supply from GSTIN
                          const sc = e.target.value.substring(0, 2);
                          if (GSTIN_STATE_CODES[sc]) setPlaceOfSupply(sc);
                          // Re-compute taxes when state changes
                          const newIsInterstate = sc !== COMPANY_STATE_CODE && !!GSTIN_STATE_CODES[sc];
                          recomputeAllLineTaxes(newIsInterstate);
                        }}
                        placeholder="e.g. 27AAACW1234F1Z1"
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-xs uppercase font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                      {customerStateName && (
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                          <MapPin className="w-2.5 h-2.5 mr-1 text-emerald-600" />{customerStateName}
                        </p>
                      )}
                    </div>

                    {/* Place of Supply */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Place of Supply *
                      </label>
                      <select
                        value={placeOfSupply}
                        onChange={(e) => setPlaceOfSupply(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      >
                        {Object.entries(GSTIN_STATE_CODES).map(([code, name]) => (
                          <option key={code} value={code}>{code} - {name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sales/Purchase Ledger */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        {voucherType === 'SALES' ? 'Sales Ledger' : 'Purchase Ledger'} *
                      </label>
                      <select
                        value={salesLedgerId}
                        onChange={(e) => setSalesLedgerId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      >
                        {ledgers
                          .filter(l => l.groupName.includes('Sales') || l.groupName.includes('Purchase') || l.nature === 'INCOME' || l.nature === 'EXPENSE')
                          .map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Section B: Invoice Numbers + Dates */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Voucher No.</label>
                      <input type="text" value={voucherNumber} onChange={(e) => setVoucherNumber(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Invoice Date *</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Buyer's PO / Ref No.</label>
                      <input type="text" value={buyerPoNo} onChange={(e) => setBuyerPoNo(e.target.value)} placeholder="PO-2026-XXXX"
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Payment Terms</label>
                      <select value={paymentTermsDays} onChange={(e) => {
                        const days = Number(e.target.value);
                        setPaymentTermsDays(days);
                        const d = new Date(date || Date.now());
                        d.setDate(d.getDate() + days);
                        setDueDate(d.toISOString().split('T')[0]);
                      }} className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                        {PAYMENT_TERMS_OPTIONS.map(o => <option key={o.days} value={o.days}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-amber-500" />Due Date
                      </label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Our Ref No.</label>
                      <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="INV-2026-089"
                        className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>

                  {/* Section C: Dispatch Details (collapsible) */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setShowDispatchSection(!showDispatchSection)}
                      className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch / Delivery Details (for E-Way Bill)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDispatchSection ? 'rotate-180' : ''}`} />
                    </button>
                    {showDispatchSection && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Dispatch Through</label>
                          <input type="text" value={dispatchThrough} onChange={(e) => setDispatchThrough(e.target.value)} placeholder="Transport co. name"
                            className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Vehicle / LR No.</label>
                          <input type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="MH12AB1234"
                            className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">LR / GR No.</label>
                          <input type="text" value={lrNo} onChange={(e) => setLrNo(e.target.value)} placeholder="LR-2026-XXXX"
                            className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Destination</label>
                          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City, State"
                            className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Dispatch Date</label>
                          <input type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* E-Invoice / E-Way Bill Flags */}
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={eInvoiceEnabled} onChange={e => setEInvoiceEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-emerald-600" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Generate E-Invoice (IRP)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={eWayBillEnabled} onChange={e => setEWayBillEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-emerald-600" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Generate E-Way Bill</span>
                    </label>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      E-Invoice mandatory if turnover &gt; ₹5 Cr. E-Way Bill if goods value &gt; ₹50,000 for interstate.
                    </span>
                  </div>
                </div>


              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                      Itemized Inventory & Tax Invoice Lines ({invoiceItems.length} items)
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInvoiceItem}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Item Line (Alt+A)</span>
                  </button>
                </div>

                {/* Table Header — scrollable X */}
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    <div className="grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.6fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_0.5fr] gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      <div>Item / Product</div>
                      <div>HSN/SAC</div>
                      <div>Warehouse</div>
                      <div className="text-right">Qty</div>
                      <div className="text-center">UOM</div>
                      <div className="text-right">Rate (₹)</div>
                      <div className="text-right">Disc %</div>
                      <div className="text-right">Taxable (₹)</div>
                      <div className="text-right">GST %</div>
                      <div className="text-right">{isInterstate ? 'IGST' : 'CGST+SGST'} (₹)</div>
                      <div className="text-right">Total (₹)</div>
                      <div className="text-center">Del</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[160px] max-h-[400px] overflow-y-auto">
                      {invoiceItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.6fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_0.5fr] gap-2 px-4 py-2.5 items-start hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors"
                        >
                          {/* Item Selector + Description */}
                          <div className="space-y-1">
                            <select
                              value={item.itemId}
                              onChange={(e) => updateInvoiceLine(idx, { itemId: e.target.value })}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            >
                              {SAMPLE_INVENTORY_ITEMS.map((inv) => (
                                <option key={inv.id} value={inv.id}>
                                  {inv.sku} – {inv.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateInvoiceLine(idx, { description: e.target.value })}
                              placeholder="Item description (optional)"
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400/60 dark:border-emerald-500/60 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 italic focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          {/* HSN/SAC */}
                          <div>
                            <input
                              type="text"
                              value={item.hsnCode}
                              onChange={(e) => updateInvoiceLine(idx, { hsnCode: e.target.value })}
                              placeholder="HSN/SAC"
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          {/* Warehouse */}
                          <div>
                            <select
                              value={item.warehouseId}
                              onChange={(e) => updateInvoiceLine(idx, { warehouseId: e.target.value })}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                              {SAMPLE_WAREHOUSES.map((wh) => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div>
                            <input
                              type="number"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceLine(idx, { quantity: e.target.value })}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-right text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          {/* UOM */}
                          <div className="flex items-center justify-center pt-2">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">{item.uom}</span>
                          </div>

                          {/* Rate */}
                          <div>
                            <input
                              type="number"
                              step="any"
                              value={item.rate}
                              onChange={(e) => updateInvoiceLine(idx, { rate: e.target.value })}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-right text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          {/* Discount % */}
                          <div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => updateInvoiceLine(idx, { discountPercent: e.target.value })}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-right text-orange-700 dark:text-orange-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          {/* Taxable Amount (computed) */}
                          <div className="flex items-center justify-end pt-2">
                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
                              ₹{(Number(item.taxableAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* GST Rate */}
                          <div>
                            <select
                              value={item.taxRatePercent}
                              onChange={(e) => updateInvoiceLine(idx, { taxRatePercent: Number(e.target.value) })}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                              {[0, 0.25, 1, 3, 5, 6, 12, 18, 28].map(r => (
                                <option key={r} value={r}>{r}%</option>
                              ))}
                            </select>
                          </div>

                          {/* CGST+SGST or IGST (computed) */}
                          <div className="flex flex-col items-end justify-center pt-1.5">
                            {isInterstate ? (
                              <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 text-right">
                                IGST: ₹{(Number(item.igstAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <>
                                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 text-right">CGST: ₹{(Number(item.cgstAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 text-right">SGST: ₹{(Number(item.sgstAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </>
                            )}
                          </div>

                          {/* Total */}
                          <div className="flex items-center justify-end pt-2">
                            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white text-right">
                              ₹{(Number(item.totalAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Delete */}
                          <div className="flex justify-center items-center pt-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoiceItem(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Additional Charges Section */}
                <div className="bg-slate-50/80 dark:bg-slate-900/60 p-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Additional Charges, Freight & Packing (GST Applicable)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {additionalCharges.map((ac, acIdx) => (
                      <div key={ac.id} className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase truncate">{ac.label}</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[9px] text-slate-400 font-bold block">Amount (₹)</label>
                            <input
                              type="number"
                              step="any"
                              value={ac.amount}
                              onChange={(e) => updateAdditionalCharge(acIdx, 'amount', e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 font-bold block">GST %</label>
                            <select
                              value={ac.gstPercent}
                              onChange={(e) => updateAdditionalCharge(acIdx, 'gstPercent', Number(e.target.value))}
                              className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-500 rounded-lg px-1.5 py-1 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                              {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                            </select>
                          </div>
                        </div>
                        {Number(ac.amount) > 0 && (
                          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>{isInterstate ? 'IGST' : 'CGST+SGST'}: ₹{(isInterstate ? ac.igstAmount : (ac.cgstAmount + ac.sgstAmount)).toFixed(2)}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Total: ₹{ac.totalAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Tax Breakdown & Grand Totals */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Narration & Commercial Terms */}
                  <div className="lg:col-span-7 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Narration / Transaction Purpose (Mandatory for Audit Trail)
                      </label>
                      <textarea
                        rows={2}
                        value={narration}
                        onChange={(e) => setNarration(e.target.value)}
                        placeholder="Enter transaction narrative, dispatch details, or customer PO reference..."
                        className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-500 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-500">
                      <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Statutory & Compliance Summary</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                        <span>Place of Supply: <strong className="text-slate-700 dark:text-slate-200">{placeOfSupply} - {customerStateName || companyStateName}</strong></span>
                        <span>Supply Category: <strong className="text-slate-700 dark:text-slate-200">{supplyType}</strong></span>
                        <span>Due Date: <strong className="text-slate-700 dark:text-slate-200">{dueDate}</strong> ({paymentTermsDays} days terms)</span>
                        <span>Round-off Method: <strong className="text-slate-700 dark:text-slate-200">Standard Half-Up</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Calculations & Dynamic Tax Slab Table */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Gross Item Taxable Value:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{itemInvoiceTotals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {itemInvoiceTotals.discount > 0 && (
                      <div className="flex justify-between text-orange-600 dark:text-orange-400 text-[11px]">
                        <span>Trade Discounts Applied:</span>
                        <span className="font-mono font-bold">-₹{itemInvoiceTotals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {itemInvoiceTotals.addlTaxable > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                        <span>Additional Charges (Taxable):</span>
                        <span className="font-mono font-semibold">₹{itemInvoiceTotals.addlTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* Rate-Wise Tax Slabs Breakdown Table */}
                    {itemInvoiceTotals.taxSummaryRows.length > 0 && (
                      <div className="my-2 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                            <tr>
                              <th className="p-1.5">GST Rate</th>
                              <th className="p-1.5 text-right">Taxable</th>
                              {isInterstate ? (
                                <th className="p-1.5 text-right">IGST</th>
                              ) : (
                                <>
                                  <th className="p-1.5 text-right">CGST</th>
                                  <th className="p-1.5 text-right">SGST</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                            {itemInvoiceTotals.taxSummaryRows.map((row) => (
                              <tr key={row.ratePercent} className="hover:bg-slate-50/50">
                                <td className="p-1.5 font-bold text-blue-600">{row.ratePercent}%</td>
                                <td className="p-1.5 text-right">₹{row.taxableAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                {isInterstate ? (
                                  <td className="p-1.5 text-right text-amber-600 font-bold">₹{row.igstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                ) : (
                                  <>
                                    <td className="p-1.5 text-right text-emerald-600 font-bold">₹{row.cgstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                    <td className="p-1.5 text-right text-emerald-600 font-bold">₹{row.sgstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Total GST Amount ({isInterstate ? 'IGST' : 'CGST + SGST'}):</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{itemInvoiceTotals.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Round-Off Input */}
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <span>Round-off Adjustment (+/-):</span>
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={roundOff}
                        onChange={(e) => setRoundOff(Number(e.target.value) || 0)}
                        className="w-20 bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-lg px-1.5 py-0.5 text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    {/* Grand Net Total */}
                    <div className="pt-2 border-t-2 border-indigo-500 flex justify-between items-baseline">
                      <span className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Total Invoice Amount:
                      </span>
                      <span className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
                        ₹{itemInvoiceTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              /* NON-ITEM INVOICE MODES (RECEIPT, PAYMENT, CONTRA, JOURNAL, AS-VOUCHER) */
              <div className="space-y-4">
                {/* Standard Header Metadata Grid */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shadow-xs">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Voucher Type
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${voucherType} (${
                        voucherType === 'SALES' || voucherType === 'PURCHASE'
                          ? entryMode === 'ITEM_INVOICE' ? 'ITEM INVOICE' : 'AS VOUCHER'
                          : isSingleEntryMode ? 'SINGLE-ENTRY' : 'DOUBLE-ENTRY'
                      })`}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-emerald-400/60 dark:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-indigo-600 font-bold font-mono text-xs cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Voucher No.
                    </label>
                    <input
                      type="text"
                      value={voucherNumber}
                      onChange={(e) => setVoucherNumber(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Ref / Instrument No.
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g. UTR-98421045"
                      className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Party GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value)}
                      placeholder="e.g. 27AAACW1234F1Z1"
                      className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-xs uppercase font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Sub-mode: Single Entry vs Double Entry */}
                {isSingleEntryMode && (voucherType === 'RECEIPT' || voucherType === 'PAYMENT' || voucherType === 'CONTRA') ? (
                  /* SINGLE-ENTRY MODE */
                  <div className="space-y-4">
                {/* Top Primary Bank / Cash Account Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Account (Bank / Cash in Hand):</span>
                    </label>
                    {(() => {
                      const bankLedger = ledgers.find(l => l.id === bankingAccountLedgerId);
                      return (
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {bankLedger?.groupName || 'Primary Account'}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 text-right">
                            Cur Bal: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{formatBalance(bankLedger?.currentBalance, bankLedger?.nature)}</strong>
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <select
                    value={bankingAccountLedgerId}
                    onChange={(e) => setBankingAccountLedgerId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    {bankAndCashLedgers.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} [{l.groupName}] — Balance: {formatINR(l.currentBalance)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Particulars Table with Bill-wise & Bank Allocations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Particulars (Ledger Allocation & Settlements)
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsQuickCreateOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs cursor-pointer transition-colors flex items-center space-x-1.5"
                      >
                        <span>+ Quick Ledger (Alt+C)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSingleEntryParticular}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold cursor-pointer shadow-sm shadow-indigo-600/20 flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Particular (Alt+A)</span>
                      </button>
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <div className="col-span-5">Particulars (Customer / Vendor / Expense Ledger)</div>
                    <div className="col-span-2 text-right">Current Balance</div>
                    <div className="col-span-2 text-right">Amount (₹)</div>
                    <div className="col-span-2 text-center">Settlement / Allocations</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[140px]">
                    {singleEntryParticulars.map((part, idx) => {
                      const selLedger = ledgers.find(l => l.id === part.ledgerId);
                      return (
                        <div key={part.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors">
                          <div className="col-span-5">
                            <select
                              value={part.ledgerId}
                              onChange={(e) => handleSingleEntryParticularChange(idx, 'ledgerId', e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            >
                              {ledgers.map(l => (
                                <option key={l.id} value={l.id}>
                                  {l.name} [{l.groupName}]
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2 text-right font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">
                            {formatINR(selLedger?.currentBalance)}
                          </div>

                          <div className="col-span-2 text-right">
                            <input
                              type="number"
                              value={part.amount}
                              onChange={(e) => handleSingleEntryParticularChange(idx, 'amount', e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-right text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveBillModalIndex(idx)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs cursor-pointer flex items-center space-x-1 transition-colors"
                            >
                              <FileCheck className="w-3 h-3 text-indigo-500" />
                              <span>Bill-wise</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBankModalIndex(idx)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs cursor-pointer flex items-center space-x-1 transition-colors"
                            >
                              <CreditCard className="w-3 h-3 text-blue-500" />
                              <span>Bank/BRS</span>
                            </button>
                          </div>

                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSingleEntryParticular(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Narration Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Narration / Bank Instrument Reference
                    </label>
                    <textarea
                      rows={2}
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      placeholder="Enter narration, Cheque/DD details, or remittance advice reference..."
                      className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* ACCOUNTING VOUCHER (AS VOUCHER DR/CR) MODE */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                    Double-Entry Particulars ({drCrItems.length} lines)
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickCreateOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs cursor-pointer transition-colors flex items-center space-x-1.5"
                    >
                      <span>+ Quick Ledger (Alt+C)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDrCrRow}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold cursor-pointer shadow-sm shadow-indigo-600/20 flex items-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Row</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <div className="col-span-1 text-center">Dr/Cr</div>
                  <div className="col-span-4">Particulars (Ledger Name)</div>
                  <div className="col-span-2 text-right">Current Balance</div>
                  <div className="col-span-2 text-right">Debit (Dr) ₹</div>
                  <div className="col-span-2 text-right">Credit (Cr) ₹</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 min-h-[160px] max-h-[360px] overflow-y-auto">
                  {drCrItems.map((item, idx) => {
                    const ledger = ledgers.find((l) => l.id === item.ledgerId);
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors">
                        <div className="col-span-1 flex justify-center">
                          <select
                            value={item.type}
                            onChange={(e) => handleDrCrItemChange(idx, 'type', e.target.value as EntryType)}
                            className="font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                          >
                            <option value="Dr">Dr</option>
                            <option value="Cr">Cr</option>
                          </select>
                        </div>
                        <div className="col-span-4">
                          <select
                            value={item.ledgerId}
                            onChange={(e) => handleDrCrItemChange(idx, 'ledgerId', e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                          >
                            {ledgers.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name} [{l.groupName}]
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 text-right font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">
                          {formatINR(ledger?.currentBalance)}
                        </div>
                        <div className="col-span-2 text-right">
                          {item.type === 'Dr' ? (
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleDrCrItemChange(idx, 'amount', e.target.value)}
                              className="w-full border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-right font-mono font-bold text-xs text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          {item.type === 'Cr' ? (
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleDrCrItemChange(idx, 'amount', e.target.value)}
                              className="w-full border border-emerald-400 dark:border-emerald-500 rounded-xl px-3 py-2 text-right font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteDrCrRow(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Narration / Transaction Summary
                  </label>
                  <textarea
                    rows={2}
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="Enter transaction narrative..."
                    className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
            </div>
            )}

            {/* Bottom Action Strip */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Total Debit (Dr)</div>
                  <div className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">₹{totalDebit.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Total Credit (Cr)</div>
                  <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">₹{totalCredit.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Balance Status</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Balanced (Δ = ₹0.00)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSaveVoucher}
                  disabled={!isBalanced || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Accept Voucher (Ctrl+A)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGISTER / DAY BOOK TAB */
        <div className="p-6 max-w-7xl mx-auto w-full space-y-4">
          {/* Day Book Header & Advanced Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Day Book & Posted Voucher Register</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                      Live General Ledger
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Search and inspect previously posted vouchers, audit origin, and print statutory documents.
                  </p>
                </div>
              </div>

              {/* Quick Period Presets */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] font-bold">
                <span className="text-slate-400 mr-1 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  <Calendar className="w-3 h-3" /> Quick Filter:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setRegisterFromDate(today);
                    setRegisterToDate(today);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                    setRegisterFromDate(firstDay);
                    setRegisterToDate(lastDay);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterFromDate('2026-04-01');
                    setRegisterToDate('2027-03-31');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  FY 2026-27
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterFromDate('');
                    setRegisterToDate('');
                    setRegisterSearchQuery('');
                    setRegisterFilterType('ALL');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by voucher no, narration, ledger name, or amount..."
                  value={registerSearchQuery}
                  onChange={(e) => setRegisterSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
                {registerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRegisterSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="md:col-span-3">
                <select
                  value={registerFilterType}
                  onChange={(e) => setRegisterFilterType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="ALL">All Types (F4–F9)</option>
                  <option value="RECEIPT">F6 • Receipts</option>
                  <option value="PAYMENT">F5 • Payments</option>
                  <option value="CONTRA">F4 • Contra</option>
                  <option value="JOURNAL">F7 • Journal</option>
                  <option value="SALES">F8 • Sales</option>
                  <option value="PURCHASE">F9 • Purchase</option>
                </select>
              </div>

              {/* Date From */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">From:</span>
                  <input
                    type="date"
                    value={registerFromDate}
                    onChange={(e) => setRegisterFromDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">To:</span>
                  <input
                    type="date"
                    value={registerToDate}
                    onChange={(e) => setRegisterToDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-500">Matching Vouchers</span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                {filteredRegister.length} of {vouchersRegister.length}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-500">Total Debit Turnover</span>
              <span className="text-sm font-mono font-black text-blue-600">
                ₹{filteredRegister.reduce((sum, v) => sum + (v.totalDebit || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-500">Total Credit Turnover</span>
              <span className="text-sm font-mono font-black text-emerald-600">
                ₹{filteredRegister.reduce((sum, v) => sum + (v.totalCredit || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Day Book Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] font-mono border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher No.</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Particulars & Narration</th>
                    <th className="p-3 text-right">Debit (₹)</th>
                    <th className="p-3 text-right">Credit (₹)</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRegister.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-bold">No vouchers found matching your filter criteria.</p>
                        <p className="text-[11px] mt-1">Try clearing your search term or adjusting the date range.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegister.map((vch) => (
                      <tr key={vch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-medium">{vch.date}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <button
                            type="button"
                            onClick={() => setInspectingVoucher(vch)}
                            className="hover:underline cursor-pointer text-left"
                            title="Click to view details & audit trail"
                          >
                            {vch.voucherNumber}
                          </button>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            vch.type === 'RECEIPT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            vch.type === 'PAYMENT' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            vch.type === 'JOURNAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            vch.type === 'CONTRA' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            vch.type === 'SALES' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}>
                            {vch.type}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate text-slate-600 dark:text-slate-400" title={vch.narration}>
                          {vch.narration}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-blue-600">
                          {formatINR(vch.totalDebit)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">
                          {formatINR(vch.totalCredit)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectingVoucher(vch)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                              title="Inspect Details & Audit Trail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintRecordedVoucher(vch)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer"
                              title="Print Document"
                            >
                              <Printer className="w-4 h-4" />
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
        </div>
      )}

      {/* MODAL: VOUCHER DETAILS & AUDIT LOG INSPECTOR */}
      {inspectingVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Voucher #{inspectingVoucher.voucherNumber}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {inspectingVoucher.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Posted Date: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inspectingVoucher.date}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingVoucher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statutory Audit & Provenance Information Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Creation Timestamp</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {inspectingVoucher.createdAt ? new Date(inspectingVoucher.createdAt).toLocaleString('en-IN') : '2026-09-20 10:15:00'}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Source Module</span>
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {inspectingVoucher.sourceModule || (inspectingVoucher.isSystemGenerated ? 'SYSTEM_AUTOPOST' : 'MANUAL_ENTRY')}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Double-Entry Status</span>
                <div className="font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Balanced (Δ = ₹0)</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">MCA Rule 3 Log</span>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Immutable Verified</span>
                </div>
              </div>
            </div>

            {/* General Ledger Allocation Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                General Ledger Legs ({inspectingVoucher.items?.length || 2} Legs):
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-850 font-mono font-bold text-[11px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5 w-16">Dr / Cr</th>
                      <th className="p-2.5">Ledger Account Head</th>
                      <th className="p-2.5 text-right w-32">Debit Leg (₹)</th>
                      <th className="p-2.5 text-right w-32">Credit Leg (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {inspectingVoucher.items?.map((it, idx) => {
                      const legName = ledgers.find((l) => l.id === it.ledgerId)?.name || it.ledgerName || 'General Account';
                      const isDr = it.type === 'Dr';
                      const amt = Number(it.amount);

                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className={`p-2.5 font-bold ${isDr ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {it.type}
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                            {legName}
                          </td>
                          <td className="p-2.5 text-right font-bold text-blue-600">
                            {isDr ? formatINR(amt) : '-'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">
                            {!isDr ? formatINR(amt) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-850 font-mono font-bold text-xs border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td colSpan={2} className="p-2.5 font-sans uppercase text-slate-600 dark:text-slate-300">
                        Total Double-Entry Summary:
                      </td>
                      <td className="p-2.5 text-right text-blue-600 font-black">
                        {formatINR(inspectingVoucher.totalDebit)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-600 font-black">
                        {formatINR(inspectingVoucher.totalCredit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Narration Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Statutory Narration / Memo:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">
                {inspectingVoucher.narration || 'No narration provided.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const v = inspectingVoucher;
                  setInspectingVoucher(null);
                  setActiveTab('entry');
                  setVoucherType('JOURNAL');
                  setNarration(`Rectification journal adjustment for voucher #${v.voucherNumber}`);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Post Rectification JV (F7)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setInspectingVoucher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const v = inspectingVoucher;
                    setInspectingVoucher(null);
                    handlePrintRecordedVoucher(v);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TALLY BILL-WISE DETAILS ALLOCATION MODAL */}
      {activeBillModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Bill-wise Details for: {ledgers.find(l => l.id === singleEntryParticulars[activeBillModalIndex]?.ledgerId)?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Bill Settlement Engine (Agst Ref, Advance, New Ref, On Account)</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBillModalIndex(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-mono font-extrabold uppercase text-[11px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Type of Ref</th>
                    <th className="p-3">Invoice / Ref No.</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {(singleEntryParticulars[activeBillModalIndex]?.billAllocations || []).map((b, bIdx) => (
                    <tr key={bIdx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{b.type}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{b.refNo}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{b.dueDate}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatINR(b.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-indigo-100 dark:border-indigo-900/40">
              <div className="font-bold text-indigo-700 dark:text-indigo-300">Available Invoices against Party:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                <div className="flex justify-between bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span>INV-2026-089 (12-Sep-2026):</span>
                  <span className="font-bold text-emerald-600">₹43,070.00</span>
                </div>
                <div className="flex justify-between bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span>INV-2026-088 (10-Sep-2026):</span>
                  <span className="font-bold text-indigo-600">₹1,20,000.00</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveBillModalIndex(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/20 cursor-pointer transition-colors"
              >
                Accept Bill Allocations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TALLY BANK ALLOCATIONS MODAL */}
      {activeBankModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Bank Allocations for: {ledgers.find(l => l.id === bankingAccountLedgerId)?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">e-Banking, Instrument & BRS Verification</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBankModalIndex(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Transaction Type</label>
                <select className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                  <option>e-Fund Transfer / NEFT / RTGS</option>
                  <option>UPI / QR Instant Settlement</option>
                  <option>Cheque (Leaf from Book #100101)</option>
                  <option>Cash Deposit / Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Instrument / UTR / Reference No.</label>
                <input
                  type="text"
                  defaultValue="UTR-98421045"
                  className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Instrument Date</label>
                  <input
                    type="date"
                    defaultValue={date}
                    className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    defaultValue="HDFC Bank Limited"
                    className="w-full p-2.5 rounded-xl border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveBankModalIndex(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/20 cursor-pointer transition-colors"
              >
                Save Bank Allocations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Ledger Modal */}
      {isQuickCreateOpen && (
        <QuickCreateLedgerModal
          isOpen={isQuickCreateOpen}
          onClose={() => setIsQuickCreateOpen(false)}
          onCreated={(newL: LedgerOption) => {
            setLedgers((prev) => [...prev, newL]);
            setIsQuickCreateOpen(false);
          }}
          groups={groups}
        />
      )}

      {/* Universal Document Print Modal */}
      {printDoc && (
        <UniversalDocumentPrintModal
          isOpen={!!printDoc}
          onClose={() => setPrintDoc(null)}
          data={printDoc}
        />
      )}
    </div>
  );
};
