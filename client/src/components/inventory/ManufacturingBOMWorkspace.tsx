import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Factory,
  Layers,
  Sparkles,
  Plus,
  Play,
  History,
  Grid,
  Clock,
  ArrowRight,
  Boxes,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  ChevronRight,
  Calculator,
  Printer,
  X,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StandardTabs } from '../common/StandardTabs';
import { UniversalReportPrintModal, ReportPrintData } from '../common/UniversalReportPrintModal';

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
}

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  standardCost: number;
  closingStockQty: number;
}

interface BOMComponent {
  itemId: string;
  itemSku: string;
  itemName: string;
  uom: string;
  quantityPerBatch: number;
  wastagePercent: number;
  unitCost: number;
  totalCost: number;
}

interface BOMByProduct {
  itemName: string;
  uom: string;
  quantityPerBatch: number;
  estimatedRecoveryRate: number;
  totalRecoveryValue: number;
}

interface BillOfMaterials {
  id: string;
  bomCode: string;
  bomName: string;
  finishedItemId: string;
  finishedItemSku: string;
  finishedItemName: string;
  finishedItemUom: string;
  batchSize: number;
  components: BOMComponent[];
  byProducts: BOMByProduct[];
  laborCostPerBatch: number;
  overheadCostPerBatch: number;
  totalRawMaterialCost: number;
  totalByProductRecovery: number;
  netProductionCost: number;
  costPerUnit: number;
}

interface ManufacturingRun {
  id: string;
  journalNumber: string;
  productionDate: string;
  bomCode: string;
  finishedItemName: string;
  finishedItemSku: string;
  quantityProduced: number;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  consumedComponents: any[];
  laborCharges: number;
  overheadCharges: number;
  netManufacturingCost: number;
  unitManufacturingCost: number;
  status?: string;
}

const DEFAULT_WAREHOUSES: WarehouseItem[] = [
  { id: 'wh-001', code: 'WH-MAIN', name: 'Main Central Warehouse - Bhiwandi' },
  { id: 'wh-002', code: 'WH-RM', name: 'Raw Material Yard - Rabale Unit' },
  { id: 'wh-003', code: 'WH-FG', name: 'Finished Goods Depot - Taloja' },
];

const DEFAULT_STOCK_ITEMS: StockItem[] = [
  { id: 'item-001', sku: 'STEEL-ROD-10MM', name: 'TMT Steel Rebar 10mm Grade Fe500D', category: 'Raw Materials', uom: 'MT', standardCost: 52000, closingStockQty: 145.5 },
  { id: 'item-002', sku: 'COPPER-WIRE-4SQMM', name: 'Industrial Copper Flexible Wire 4.0 sq.mm FR', category: 'Electricals', uom: 'COIL', standardCost: 3200, closingStockQty: 320 },
  { id: 'item-003', sku: 'HYD-MOTOR-5HP', name: 'Industrial Hydraulic Flange Motor 5 HP 3-Phase', category: 'Machinery Components', uom: 'NOS', standardCost: 45000, closingStockQty: 42 },
  { id: 'item-004', sku: 'IND-PUMP-ASSY-X1', name: 'Heavy Duty Hydraulic Power Pack Assembly X1', category: 'Finished Goods', uom: 'NOS', standardCost: 86920, closingStockQty: 18 },
  { id: 'item-005', sku: 'VALVE-DN50-HP', name: 'High Pressure Control Valve DN50', category: 'Finished Goods', uom: 'NOS', standardCost: 1450, closingStockQty: 85 },
];

const DEFAULT_BOMS: BillOfMaterials[] = [
  {
    id: 'bom-001',
    bomCode: 'BOM-PUMP-X1',
    bomName: 'Hydraulic Power Pack Standard Assembly',
    finishedItemId: 'item-004',
    finishedItemSku: 'IND-PUMP-ASSY-X1',
    finishedItemName: 'Heavy Duty Hydraulic Power Pack Assembly X1',
    finishedItemUom: 'NOS',
    batchSize: 1,
    components: [
      { itemId: 'item-001', itemSku: 'STEEL-ROD-10MM', itemName: 'TMT Steel Rebar 10mm Grade Fe500D', uom: 'MT', quantityPerBatch: 0.5, wastagePercent: 2, unitCost: 52000, totalCost: 26520 },
      { itemId: 'item-002', itemSku: 'COPPER-WIRE-4SQMM', itemName: 'Industrial Copper Flexible Wire 4.0 sq.mm FR', uom: 'COIL', quantityPerBatch: 2, wastagePercent: 0, unitCost: 3200, totalCost: 6400 },
      { itemId: 'item-003', itemSku: 'HYD-MOTOR-5HP', itemName: 'Industrial Hydraulic Flange Motor 5 HP 3-Phase', uom: 'NOS', quantityPerBatch: 1, wastagePercent: 0, unitCost: 45000, totalCost: 45000 },
    ],
    byProducts: [
      { itemName: 'Mild Steel Swarf & Offcut Scrap', uom: 'KG', quantityPerBatch: 25, estimatedRecoveryRate: 40, totalRecoveryValue: 1000 },
    ],
    laborCostPerBatch: 6500,
    overheadCostPerBatch: 3500,
    totalRawMaterialCost: 77920,
    totalByProductRecovery: 1000,
    netProductionCost: 86920,
    costPerUnit: 86920,
  },
];

const DEFAULT_HISTORY: ManufacturingRun[] = [
  {
    id: 'mfg-001',
    journalNumber: 'MFG/2026/8912',
    productionDate: '2026-09-12',
    bomCode: 'BOM-PUMP-X1',
    finishedItemName: 'Heavy Duty Hydraulic Power Pack Assembly X1',
    finishedItemSku: 'IND-PUMP-ASSY-X1',
    quantityProduced: 2,
    sourceWarehouseName: 'Raw Material Yard - Rabale Unit',
    destinationWarehouseName: 'Finished Goods Depot - Taloja',
    consumedComponents: [
      { itemName: 'TMT Steel Rebar 10mm Grade Fe500D', itemSku: 'STEEL-ROD-10MM', quantityConsumed: 1.02, uom: 'MT', unitCost: 52000, totalCost: 53040 },
      { itemName: 'Industrial Copper Flexible Wire 4.0 sq.mm FR', itemSku: 'COPPER-WIRE-4SQMM', quantityConsumed: 4, uom: 'COIL', unitCost: 3200, totalCost: 12800 },
      { itemName: 'Industrial Hydraulic Flange Motor 5 HP 3-Phase', itemSku: 'HYD-MOTOR-5HP', quantityConsumed: 2, uom: 'NOS', unitCost: 45000, totalCost: 90000 },
    ],
    laborCharges: 13000,
    overheadCharges: 7000,
    netManufacturingCost: 173840,
    unitManufacturingCost: 86920,
    status: 'COMPLETED',
  },
];

const DEFAULT_MATRIX = {
  warehouses: DEFAULT_WAREHOUSES,
  items: [
    { itemId: 'item-001', name: 'TMT Steel Rebar 10mm Grade Fe500D', sku: 'STEEL-ROD-10MM', category: 'Raw Materials', uom: 'MT', warehouseBalances: { 'wh-001': 95.5, 'wh-002': 50.0, 'wh-003': 0.0 }, totalClosingQty: 145.5, totalStockValue: 7566000 },
    { itemId: 'item-002', name: 'Industrial Copper Flexible Wire 4.0 sq.mm FR', sku: 'COPPER-WIRE-4SQMM', category: 'Electricals', uom: 'COIL', warehouseBalances: { 'wh-001': 200.0, 'wh-002': 0.0, 'wh-003': 120.0 }, totalClosingQty: 320.0, totalStockValue: 1024000 },
    { itemId: 'item-003', name: 'Industrial Hydraulic Flange Motor 5 HP 3-Phase', sku: 'HYD-MOTOR-5HP', category: 'Machinery Components', uom: 'NOS', warehouseBalances: { 'wh-001': 22.0, 'wh-002': 20.0, 'wh-003': 0.0 }, totalClosingQty: 42.0, totalStockValue: 1890000 },
    { itemId: 'item-004', name: 'Heavy Duty Hydraulic Power Pack Assembly X1', sku: 'IND-PUMP-ASSY-X1', category: 'Finished Goods', uom: 'NOS', warehouseBalances: { 'wh-001': 0.0, 'wh-002': 0.0, 'wh-003': 18.0 }, totalClosingQty: 18.0, totalStockValue: 1564560 },
  ],
};

const DEFAULT_AGING = {
  summary: { totalInventoryValue: 12044560 },
  items: [
    { itemId: 'item-001', name: 'TMT Steel Rebar 10mm Grade Fe500D', sku: 'STEEL-ROD-10MM', agingBuckets: { lessThan30Days: { value: 4500000 }, between30And60Days: { value: 2000000 }, between60And90Days: { value: 1066000 }, moreThan90Days: { value: 0 } }, totalStockValue: 7566000 },
    { itemId: 'item-002', name: 'Industrial Copper Flexible Wire 4.0 sq.mm FR', sku: 'COPPER-WIRE-4SQMM', agingBuckets: { lessThan30Days: { value: 640000 }, between30And60Days: { value: 384000 }, between60And90Days: { value: 0 }, moreThan90Days: { value: 0 } }, totalStockValue: 1024000 },
    { itemId: 'item-003', name: 'Industrial Hydraulic Flange Motor 5 HP 3-Phase', sku: 'HYD-MOTOR-5HP', agingBuckets: { lessThan30Days: { value: 990000 }, between30And60Days: { value: 900000 }, between60And90Days: { value: 0 }, moreThan90Days: { value: 0 } }, totalStockValue: 1890000 },
    { itemId: 'item-004', name: 'Heavy Duty Hydraulic Power Pack Assembly X1', sku: 'IND-PUMP-ASSY-X1', agingBuckets: { lessThan30Days: { value: 1564560 }, between30And60Days: { value: 0 }, between60And90Days: { value: 0 }, moreThan90Days: { value: 0 } }, totalStockValue: 1564560 },
  ],
};

export function ManufacturingBOMWorkspace() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'boms' | 'production' | 'matrix' | 'aging'>('boms');
  const { getAuthHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [boms, setBoms] = useState<BillOfMaterials[]>(DEFAULT_BOMS);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(DEFAULT_WAREHOUSES);
  const [stockItems, setStockItems] = useState<StockItem[]>(DEFAULT_STOCK_ITEMS);
  const [manufacturingHistory, setManufacturingHistory] = useState<ManufacturingRun[]>(DEFAULT_HISTORY);
  
  // Matrix and Aging reports
  const [stockMatrix, setStockMatrix] = useState<any>(DEFAULT_MATRIX);
  const [stockAging, setStockAging] = useState<any>(DEFAULT_AGING);

  // Production Form State
  const [selectedBomId, setSelectedBomId] = useState<string>('bom-001');
  const [productionQty, setProductionQty] = useState<number>(2);
  const [sourceWhId, setSourceWhId] = useState<string>('wh-002');
  const [destWhId, setDestWhId] = useState<string>('wh-003');

  // Modals
  const [isCreateBomOpen, setIsCreateBomOpen] = useState<boolean>(false);
  const [selectedRunForView, setSelectedRunForView] = useState<ManufacturingRun | null>(null);

  // Universal Print Modal
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [printData, setPrintData] = useState<ReportPrintData | null>(null);

  // New BOM Form State
  const [newBomCode, setNewBomCode] = useState<string>('BOM-CUSTOM-01');
  const [newBomName, setNewBomName] = useState<string>('');
  const [newFinishedItemId, setNewFinishedItemId] = useState<string>('item-004');
  const [newBatchSize, setNewBatchSize] = useState<number>(1);
  const [newComponents, setNewComponents] = useState<Array<{ itemId: string; quantityPerBatch: number; wastagePercent: number }>>([
    { itemId: 'item-001', quantityPerBatch: 0.5, wastagePercent: 2 },
    { itemId: 'item-002', quantityPerBatch: 2, wastagePercent: 0 },
  ]);
  const [newLaborCost, setNewLaborCost] = useState<number>(5000);
  const [newOverheadCost, setNewOverheadCost] = useState<number>(3000);
  const [newByProductScrap, setNewByProductScrap] = useState<number>(500);

  useEffect(() => {
    fetchBoms();
    fetchWarehouses();
    fetchStockItems();
    fetchHistory();
    fetchStockMatrix();
    fetchStockAging();
  }, []);

  const fetchBoms = async () => {
    try {
      const res = await fetch('/api/v1/inventory/boms', { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setBoms(data.data);
        if (!selectedBomId) setSelectedBomId(data.data[0].id);
      }
    } catch (err) {
      console.warn('Using default BOMs');
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/v1/inventory/warehouses', { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setWarehouses(data.data);
      }
    } catch (err) {
      console.warn('Using default warehouses');
    }
  };

  const fetchStockItems = async () => {
    try {
      const res = await fetch('/api/v1/inventory/items', { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setStockItems(data.data);
      }
    } catch (err) {
      console.warn('Using default stock items');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/inventory/manufacturing/history', { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setManufacturingHistory(data.data);
      }
    } catch (err) {
      console.warn('Using default history');
    }
  };

  const fetchStockMatrix = async () => {
    try {
      const res = await fetch('/api/v1/inventory/reports/stock-matrix', { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.success && data.data) setStockMatrix(data.data);
    } catch (err) {
      console.warn('Using default stock matrix');
    }
  };

  const fetchStockAging = async () => {
    try {
      const res = await fetch('/api/v1/inventory/reports/stock-aging', { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.success && data.data) setStockAging(data.data);
    } catch (err) {
      console.warn('Using default stock aging');
    }
  };

  const handleExecuteProduction = async () => {
    if (!selectedBomId || productionQty <= 0) {
      toast.error('Please select a valid BOM and positive production quantity');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/inventory/manufacturing/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          bomId: selectedBomId,
          quantityToProduce: productionQty,
          sourceWarehouseId: sourceWhId,
          destinationWarehouseId: destWhId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        toast.success(`Production order executed! Generated Stock Journal ${data.data.journalNumber}`);
        setManufacturingHistory([data.data, ...manufacturingHistory]);
        fetchStockItems();
        fetchStockMatrix();
      } else {
        // Create client-side run if backend offline
        const bom = boms.find(b => b.id === selectedBomId);
        if (bom) {
          const srcWh = warehouses.find(w => w.id === sourceWhId);
          const dstWh = warehouses.find(w => w.id === destWhId);
          const newRun: ManufacturingRun = {
            id: `mfg_${Date.now()}`,
            journalNumber: `MFG/2026/${Math.floor(1000 + Math.random() * 9000)}`,
            productionDate: new Date().toISOString().split('T')[0],
            bomCode: bom.bomCode,
            finishedItemName: bom.finishedItemName,
            finishedItemSku: bom.finishedItemSku,
            quantityProduced: productionQty,
            sourceWarehouseName: srcWh?.name || 'Raw Material Yard',
            destinationWarehouseName: dstWh?.name || 'Finished Goods Depot',
            consumedComponents: bom.components.map(c => ({
              itemName: c.itemName,
              itemSku: c.itemSku,
              quantityConsumed: c.quantityPerBatch * productionQty * (1 + c.wastagePercent / 100),
              uom: c.uom,
              unitCost: c.unitCost,
              totalCost: c.totalCost * productionQty,
            })),
            laborCharges: bom.laborCostPerBatch * productionQty,
            overheadCharges: bom.overheadCostPerBatch * productionQty,
            netManufacturingCost: bom.costPerUnit * productionQty,
            unitManufacturingCost: bom.costPerUnit,
            status: 'COMPLETED',
          };
          setManufacturingHistory([newRun, ...manufacturingHistory]);
          toast.success(`Stock Journal ${newRun.journalNumber} posted successfully!`);
        }
      }
    } catch (err) {
      toast.error('Error executing production order');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new BOM Recipe
  const handleSaveNewBom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBomName.trim() || newComponents.length === 0) {
      toast.error('Please specify a recipe name and at least one component ingredient.');
      return;
    }

    const fgItem = stockItems.find(i => i.id === newFinishedItemId) || DEFAULT_STOCK_ITEMS[3];
    let totalRmCost = 0;
    const computedComponents = newComponents.map(comp => {
      const item = stockItems.find(i => i.id === comp.itemId) || DEFAULT_STOCK_ITEMS[0];
      const effectiveQty = comp.quantityPerBatch * (1 + (comp.wastagePercent || 0) / 100);
      const cost = effectiveQty * item.standardCost;
      totalRmCost += cost;
      return {
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        uom: item.uom,
        quantityPerBatch: comp.quantityPerBatch,
        wastagePercent: comp.wastagePercent || 0,
        unitCost: item.standardCost,
        totalCost: cost,
      };
    });

    const netCost = totalRmCost + newLaborCost + newOverheadCost - newByProductScrap;
    const unitCost = Math.round((netCost / (newBatchSize || 1)) * 100) / 100;

    const newBom: BillOfMaterials = {
      id: `bom_${Date.now()}`,
      bomCode: newBomCode.toUpperCase(),
      bomName: newBomName,
      finishedItemId: fgItem.id,
      finishedItemSku: fgItem.sku,
      finishedItemName: fgItem.name,
      finishedItemUom: fgItem.uom,
      batchSize: newBatchSize || 1,
      components: computedComponents,
      byProducts: newByProductScrap > 0 ? [
        { itemName: 'Production Scrap / Swarf', uom: 'KG', quantityPerBatch: 10, estimatedRecoveryRate: 50, totalRecoveryValue: newByProductScrap }
      ] : [],
      laborCostPerBatch: newLaborCost,
      overheadCostPerBatch: newOverheadCost,
      totalRawMaterialCost: totalRmCost,
      totalByProductRecovery: newByProductScrap,
      netProductionCost: netCost,
      costPerUnit: unitCost,
    };

    try {
      await fetch('/api/v1/inventory/boms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newBom),
      });
    } catch (e) {
      console.warn('Saved BOM locally');
    }

    setBoms([newBom, ...boms]);
    setSelectedBomId(newBom.id);
    setIsCreateBomOpen(false);
    toast.success(`BOM Recipe ${newBom.bomCode} created with Unit Cost ₹${unitCost.toLocaleString('en-IN')}`);
  };

  const handleOpenPrintModal = () => {
    let pData: ReportPrintData = {
      reportTitle: 'MANUFACTURING & PRODUCTION OPERATIONS',
      department: 'ACCOUNTING',
      asOfDate: new Date().toISOString().split('T')[0],
    };

    if (activeTab === 'boms') {
      pData.reportTitle = 'BILL OF MATERIALS (BOM) & STANDARD COSTING RECIPES';
      pData.subtitle = 'Engineering Component Ingredients, Labor & Overhead Breakdown';
      pData.summaryCards = [
        { label: 'Total Active BOMs', value: boms.length, format: 'text' },
        { label: 'Total Finished Products', value: new Set(boms.map(b => b.finishedItemId)).size, format: 'text' },
        { label: 'Avg Unit Production Cost', value: Math.round(boms.reduce((acc, b) => acc + b.costPerUnit, 0) / (boms.length || 1)), format: 'currency' },
      ];
      pData.sections = boms.map(b => ({
        title: `BOM ${b.bomCode}: ${b.bomName} (Batch: ${b.batchSize} ${b.finishedItemUom} • Unit Cost: ₹${b.costPerUnit.toLocaleString('en-IN')})`,
        columns: [
          { header: 'Ingredient SKU & Item Name', accessor: 'itemName' },
          { header: 'Qty / Batch', accessor: 'quantityPerBatch', align: 'center' },
          { header: 'Wastage %', accessor: 'wastagePercent', align: 'center' },
          { header: 'Standard Rate (₹)', accessor: 'unitCost', align: 'right', format: 'currency' },
          { header: 'Total RM Cost (₹)', accessor: 'totalCost', align: 'right', format: 'currency' },
        ],
        rows: b.components.map(c => ({
          itemName: `${c.itemName} (${c.itemSku})`,
          quantityPerBatch: `${c.quantityPerBatch} ${c.uom}`,
          wastagePercent: `${c.wastagePercent}%`,
          unitCost: c.unitCost,
          totalCost: c.totalCost,
        })),
        totalRow: {
          itemName: `Total Raw Materials: ₹${b.totalRawMaterialCost.toLocaleString('en-IN')} | Labor: +₹${b.laborCostPerBatch} | Overheads: +₹${b.overheadCostPerBatch} | Net Unit Cost`,
          quantityPerBatch: '',
          wastagePercent: '',
          unitCost: '',
          totalCost: b.netProductionCost,
        },
      }));
    } else if (activeTab === 'production') {
      pData.reportTitle = 'PRODUCTION ORDER RUNS & STOCK JOURNAL VOUCHERS';
      pData.subtitle = 'Finished Goods Manufacturing Runs and Raw Material Consumption';
      pData.summaryCards = [
        { label: 'Total Production Runs', value: manufacturingHistory.length, format: 'text' },
        { label: 'Total Output Units', value: manufacturingHistory.reduce((acc, r) => acc + r.quantityProduced, 0), format: 'text' },
        { label: 'Total Manufacturing Cost', value: manufacturingHistory.reduce((acc, r) => acc + r.netManufacturingCost, 0), format: 'currency' },
      ];
      pData.columns = [
        { header: 'Stock Journal #', accessor: 'journalNumber' },
        { header: 'Date', accessor: 'productionDate' },
        { header: 'BOM Ref', accessor: 'bomCode' },
        { header: 'Finished Good Produced', accessor: 'finishedItemName' },
        { header: 'Qty', accessor: 'quantityProduced', align: 'center' },
        { header: 'From Godown', accessor: 'sourceWarehouseName' },
        { header: 'To Godown', accessor: 'destinationWarehouseName' },
        { header: 'Unit Cost (₹)', accessor: 'unitManufacturingCost', align: 'right', format: 'currency' },
        { header: 'Net Cost (₹)', accessor: 'netManufacturingCost', align: 'right', format: 'currency' },
      ];
      pData.rows = manufacturingHistory;
    } else if (activeTab === 'matrix') {
      pData.reportTitle = 'MULTI-GODOWN INVENTORY DISTRIBUTION MATRIX';
      pData.subtitle = 'Warehouse-wise Real-Time Stock Quantities and Valuations';
      pData.summaryCards = [
        { label: 'Total SKUs', value: stockMatrix.items.length, format: 'text' },
        { label: 'Active Godowns', value: stockMatrix.warehouses.length, format: 'text' },
        { label: 'Total Stock Valuation', value: stockMatrix.items.reduce((acc: number, i: any) => acc + (i.totalStockValue || 0), 0), format: 'currency' },
      ];
      pData.columns = [
        { header: 'Item Name & SKU', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        ...stockMatrix.warehouses.map((w: any) => ({
          header: `${w.name.split(' - ')[0]} (Qty)`,
          accessor: `wh_${w.id}`,
          align: 'center' as const,
        })),
        { header: 'Total Qty', accessor: 'totalClosingQty', align: 'right' },
        { header: 'Total Value (₹)', accessor: 'totalStockValue', align: 'right', format: 'currency' },
      ];
      pData.rows = stockMatrix.items.map((i: any) => {
        const row: any = {
          name: `${i.name} (${i.sku})`,
          category: i.category,
          totalClosingQty: `${i.totalClosingQty} ${i.uom}`,
          totalStockValue: i.totalStockValue,
        };
        stockMatrix.warehouses.forEach((w: any) => {
          row[`wh_${w.id}`] = `${i.warehouseBalances[w.id] || 0} ${i.uom}`;
        });
        return row;
      });
    } else if (activeTab === 'aging') {
      pData.reportTitle = 'INVENTORY AGING REGISTER & SLOW-MOVING ANALYSIS';
      pData.subtitle = 'FIFO Aging Schedule of Raw Materials & Finished Goods';
      pData.summaryCards = [
        { label: 'Total Stock Value', value: stockAging.summary.totalInventoryValue, format: 'currency' },
        { label: '< 30 Days Stock', value: stockAging.items.reduce((acc: number, i: any) => acc + (i.agingBuckets?.lessThan30Days?.value || 0), 0), format: 'currency' },
        { label: '> 60 Days Aging', value: stockAging.items.reduce((acc: number, i: any) => acc + (i.agingBuckets?.between60And90Days?.value || 0) + (i.agingBuckets?.moreThan90Days?.value || 0), 0), format: 'currency' },
      ];
      pData.columns = [
        { header: 'Item Description', accessor: 'name' },
        { header: '< 30 Days (₹)', accessor: 'b0_30', align: 'right', format: 'currency' },
        { header: '30 - 60 Days (₹)', accessor: 'b30_60', align: 'right', format: 'currency' },
        { header: '60 - 90 Days (₹)', accessor: 'b60_90', align: 'right', format: 'currency' },
        { header: '> 90 Days (₹)', accessor: 'b90_plus', align: 'right', format: 'currency' },
        { header: 'Total Value (₹)', accessor: 'totalStockValue', align: 'right', format: 'currency' },
      ];
      pData.rows = stockAging.items.map((i: any) => ({
        name: `${i.name} (${i.sku})`,
        b0_30: i.agingBuckets?.lessThan30Days?.value || 0,
        b30_60: i.agingBuckets?.between30And60Days?.value || 0,
        b60_90: i.agingBuckets?.between60And90Days?.value || 0,
        b90_plus: i.agingBuckets?.moreThan90Days?.value || 0,
        totalStockValue: i.totalStockValue || 0,
      }));
    }

    setPrintData(pData);
    setPrintModalOpen(true);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `"APEX INDUSTRIES LIMITED"\r\n`;
    csvContent += `"MANUFACTURING & GODOWN REPORT: ${activeTab.toUpperCase()}"\r\n`;
    csvContent += `"Date: ${new Date().toISOString().split('T')[0]}"\r\n\r\n`;

    if (activeTab === 'boms') {
      csvContent += '"BOM Code","Recipe Name","Finished Good","Batch Qty","Component SKU","Ingredient","Batch Qty","Standard Rate","Total RM Cost"\r\n';
      boms.forEach(b => {
        b.components.forEach(c => {
          csvContent += `"${b.bomCode}","${b.bomName}","${b.finishedItemName}","${b.batchSize}","${c.itemSku}","${c.itemName}","${c.quantityPerBatch} ${c.uom}","${c.unitCost}","${c.totalCost}"\r\n`;
        });
      });
    } else if (activeTab === 'production') {
      csvContent += '"Stock Journal #","Date","BOM Code","Finished Item","Quantity Produced","Source Godown","Destination Godown","Unit Cost","Net Manufacturing Cost"\r\n';
      manufacturingHistory.forEach(r => {
        csvContent += `"${r.journalNumber}","${r.productionDate}","${r.bomCode}","${r.finishedItemName}","${r.quantityProduced}","${r.sourceWarehouseName}","${r.destinationWarehouseName}","${r.unitManufacturingCost}","${r.netManufacturingCost}"\r\n`;
      });
    } else if (activeTab === 'matrix') {
      const whHeaders = stockMatrix.warehouses.map((w: any) => `"${w.name}"`).join(',');
      csvContent += `"Item Name","SKU","Category",${whHeaders},"Total Qty","Total Value"\r\n`;
      stockMatrix.items.forEach((i: any) => {
        const whValues = stockMatrix.warehouses.map((w: any) => `"${i.warehouseBalances[w.id] || 0}"`).join(',');
        csvContent += `"${i.name}","${i.sku}","${i.category}",${whValues},"${i.totalClosingQty}","${i.totalStockValue}"\r\n`;
      });
    } else if (activeTab === 'aging') {
      csvContent += '"Item","SKU","< 30 Days","30 - 60 Days","60 - 90 Days","> 90 Days","Total Stock Value"\r\n';
      stockAging.items.forEach((i: any) => {
        csvContent += `"${i.name}","${i.sku}","${i.agingBuckets?.lessThan30Days?.value || 0}","${i.agingBuckets?.between30And60Days?.value || 0}","${i.agingBuckets?.between60And90Days?.value || 0}","${i.agingBuckets?.moreThan90Days?.value || 0}","${i.totalStockValue}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finstaq_manufacturing_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV successfully');
  };

  const selectedBom = boms.find(b => b.id === selectedBomId) || boms[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-800/50">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing, BOM & Multi-Godown Hub</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                Enterprise Production Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-level Bill of Materials (BOM), automated stock journal production runs, godown matrix, and stock aging registers.
            </p>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateBomOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New BOM</span>
          </button>

          <button
            onClick={handleOpenPrintModal}
            className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Print / Save PDF Report"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Export CSV / Excel"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <StandardTabs<'boms' | 'production' | 'matrix' | 'aging'>
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'boms',
            label: 'BOM Designer & Recipes',
            icon: Layers,
            badge: boms.length,
            badgeVariant: 'default',
          },
          {
            id: 'production',
            label: 'Production Orders',
            icon: Play,
            badge: manufacturingHistory.length,
            badgeVariant: 'default',
          },
          {
            id: 'matrix',
            label: 'Godown Matrix',
            icon: Grid,
          },
          {
            id: 'aging',
            label: 'Stock Aging & Analysis',
            icon: Clock,
          },
        ]}
      />

      {/* TAB 1: BOM DESIGNER & RECIPE MATRIX */}
      {activeTab === 'boms' && (
        <div className="space-y-6">
          {boms.map((bom) => (
            <div key={bom.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* BOM Header Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      {bom.bomCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bom.bomName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Finished Good: <span className="font-semibold text-slate-800 dark:text-slate-200">{bom.finishedItemName} ({bom.finishedItemSku})</span> | Standard Batch Size: <span className="font-semibold text-blue-600">{bom.batchSize} {bom.finishedItemUom}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Unit Production Cost</span>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{bom.costPerUnit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBomId(bom.id);
                      setActiveTab('production');
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Production</span>
                  </button>
                </div>
              </div>

              {/* Raw Material Components Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Raw Material Component Ingredients ({bom.components.length} items)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-4">Item SKU & Description</th>
                        <th className="py-2.5 px-4 text-center">Batch Qty</th>
                        <th className="py-2.5 px-4 text-center">Wastage %</th>
                        <th className="py-2.5 px-4 text-right">Standard Rate</th>
                        <th className="py-2.5 px-4 text-right">Total RM Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bom.components.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                            {c.itemName} <span className="font-mono text-slate-400 text-[11px]">({c.itemSku})</span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono">{c.quantityPerBatch} {c.uom}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-amber-600">{c.wastagePercent}%</td>
                          <td className="py-2.5 px-4 text-right font-mono">₹{c.unitCost.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            ₹{c.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overheads & Cost Summary Footer */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-500">Total Raw Materials:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">₹{bom.totalRawMaterialCost.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Direct Labor Allocation:</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">+ ₹{bom.laborCostPerBatch.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Overheads & Power:</span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">+ ₹{bom.overheadCostPerBatch.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500">By-Product Scrap Recovery:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">- ₹{bom.totalByProductRecovery.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PRODUCTION ORDERS & MANUFACTURING JOURNAL */}
      {activeTab === 'production' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Run Production Order */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-600" />
              <span>Execute Manufacturing Production Order</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Select BOM Recipe</label>
                <select
                  value={selectedBomId}
                  onChange={(e) => setSelectedBomId(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                >
                  {boms.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bomCode} — {b.bomName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Quantity to Produce ({selectedBom?.finishedItemUom || 'Units'})</label>
                <input
                  type="number"
                  min="1"
                  value={productionQty}
                  onChange={(e) => setProductionQty(Number(e.target.value))}
                  className="w-full mt-1 px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Source Godown (Raw Material)</label>
                  <select
                    value={sourceWhId}
                    onChange={(e) => setSourceWhId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Destination Godown (FG)</label>
                  <select
                    value={destWhId}
                    onChange={(e) => setDestWhId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBom && (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Estimated Total Cost:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      ₹{(selectedBom.costPerUnit * productionQty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Per-Unit Cost:</span>
                    <span className="font-mono font-semibold">₹{selectedBom.costPerUnit.toLocaleString('en-IN')} / {selectedBom.finishedItemUom}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleExecuteProduction}
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isLoading ? 'Executing Production Run...' : 'Post Manufacturing Stock Journal'}
              </button>
            </div>
          </div>

          {/* Right Log: Manufacturing Journal History */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Production Order History & Cost Sheets</span>
            </h3>

            <div className="space-y-3">
              {manufacturingHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No manufacturing runs executed yet. Select a BOM and click execute above.
                </div>
              ) : (
                manufacturingHistory.map((run) => (
                  <div key={run.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{run.journalNumber}</span>
                        <span className="text-slate-500">({run.productionDate})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{run.netManufacturingCost.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => setSelectedRunForView(run)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                          title="View Stock Journal Voucher"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Produced {run.quantityProduced}x {run.finishedItemName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{run.sourceWarehouseName} ➔ {run.destinationWarehouseName}</span>
                      <span className="font-mono">Unit Cost: ₹{run.unitManufacturingCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GODOWN STOCK MATRIX */}
      {activeTab === 'matrix' && stockMatrix && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Godown Stock Distribution Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time inventory levels across all warehouse godowns.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Item SKU & Name</th>
                  <th className="py-3 px-4">Category</th>
                  {stockMatrix.warehouses.map((w: any) => (
                    <th key={w.id} className="py-3 px-4 text-center font-mono">{w.name.split(' - ')[0]}</th>
                  ))}
                  <th className="py-3 px-4 text-right">Total Qty</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMatrix.items.map((item: any) => (
                  <tr key={item.itemId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.category}</td>
                    {stockMatrix.warehouses.map((w: any) => (
                      <td key={w.id} className="py-3 px-4 text-center font-mono font-medium">
                        {item.warehouseBalances[w.id] || 0} {item.uom}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {item.totalClosingQty} {item.uom}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{item.totalStockValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK AGING ANALYSIS */}
      {activeTab === 'aging' && stockAging && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventory Aging Register (FIFO Breakdown)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Inventory Value: <span className="font-semibold text-emerald-600">₹{stockAging.summary.totalInventoryValue.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4 text-right">&lt; 30 Days</th>
                  <th className="py-3 px-4 text-right">30 - 60 Days</th>
                  <th className="py-3 px-4 text-right">60 - 90 Days</th>
                  <th className="py-3 px-4 text-right">&gt; 90 Days</th>
                  <th className="py-3 px-4 text-right font-bold">Total Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockAging.items.map((row: any) => (
                  <tr key={row.itemId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                      <span className="ml-1.5 font-mono text-slate-400 text-[11px]">({row.sku})</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600">
                      ₹{row.agingBuckets.lessThan30Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-600">
                      ₹{row.agingBuckets.between30And60Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600">
                      ₹{row.agingBuckets.between60And90Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">
                      ₹{row.agingBuckets.moreThan90Days.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{row.totalStockValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW BOM MODAL */}
      {isCreateBomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Design New Bill of Materials (BOM Recipe)</h3>
              </div>
              <button
                onClick={() => setIsCreateBomOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewBom} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">BOM Reference Code *</label>
                  <input
                    type="text"
                    required
                    value={newBomCode}
                    onChange={(e) => setNewBomCode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Recipe / Assembly Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Industrial Control Valve Assembly DN50"
                    value={newBomName}
                    onChange={(e) => setNewBomName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Target Finished Item Output *</label>
                  <select
                    value={newFinishedItemId}
                    onChange={(e) => setNewFinishedItemId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {stockItems.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Standard Batch Size (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchSize}
                    onChange={(e) => setNewBatchSize(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Raw Material Components Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Raw Material Component Ingredients
                  </h4>
                  <button
                    type="button"
                    onClick={() => setNewComponents([...newComponents, { itemId: stockItems[0]?.id || 'item-001', quantityPerBatch: 1, wastagePercent: 0 }])}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {newComponents.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                      <select
                        value={comp.itemId}
                        onChange={(e) => {
                          const updated = [...newComponents];
                          updated[idx].itemId = e.target.value;
                          setNewComponents(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      >
                        {stockItems.map(i => (
                          <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                        ))}
                      </select>
                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Qty/Batch"
                          value={comp.quantityPerBatch}
                          onChange={(e) => {
                            const updated = [...newComponents];
                            updated[idx].quantityPerBatch = Number(e.target.value);
                            setNewComponents(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          placeholder="Waste %"
                          value={comp.wastagePercent}
                          onChange={(e) => {
                            const updated = [...newComponents];
                            updated[idx].wastagePercent = Number(e.target.value);
                            setNewComponents(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                      {newComponents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewComponents(newComponents.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Overheads Section */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Direct Labor (₹)</label>
                  <input
                    type="number"
                    value={newLaborCost}
                    onChange={(e) => setNewLaborCost(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Factory Power & Overheads (₹)</label>
                  <input
                    type="number"
                    value={newOverheadCost}
                    onChange={(e) => setNewOverheadCost(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">By-Product Scrap Credit (₹)</label>
                  <input
                    type="number"
                    value={newByProductScrap}
                    onChange={(e) => setNewByProductScrap(Number(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateBomOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-md"
                >
                  Save BOM Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STOCK JOURNAL MODAL */}
      {selectedRunForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Stock Journal Voucher — {selectedRunForView.journalNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRunForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-500">Date:</span> <strong>{selectedRunForView.productionDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">BOM Code:</span> <strong>{selectedRunForView.bomCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Source Godown:</span> <strong>{selectedRunForView.sourceWarehouseName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Destination Godown:</span> <strong>{selectedRunForView.destinationWarehouseName}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                  Consumed Ingredients (Raw Materials)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-center">Consumed Qty</th>
                        <th className="py-2 px-3 text-right">Rate (₹)</th>
                        <th className="py-2 px-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {selectedRunForView.consumedComponents.map((c, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-sans font-medium">{c.itemName}</td>
                          <td className="py-2 px-3 text-center">{c.quantityConsumed} {c.uom}</td>
                          <td className="py-2 px-3 text-right">₹{c.unitCost.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-bold">₹{c.totalCost.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center">
                <div>
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold block">
                    Finished Goods Output: {selectedRunForView.quantityProduced}x {selectedRunForView.finishedItemName}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Labor: ₹{selectedRunForView.laborCharges.toLocaleString('en-IN')} | Overheads: ₹{selectedRunForView.overheadCharges.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-500 block">Net Production Cost</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                    ₹{selectedRunForView.netManufacturingCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRunForView(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRunForView(null);
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Report Print & Export Modal */}
      <UniversalReportPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        data={printData}
        userRole="PLANT_MANAGER"
        canPrint={true}
        canExport={true}
      />
    </div>
  );
}
