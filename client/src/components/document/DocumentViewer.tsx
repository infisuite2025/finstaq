import React, { useState } from 'react';
import { ZoomIn, ZoomOut, FileText, Eye } from 'lucide-react';

interface DocumentViewerProps {
  poNumber: string;
  vendorName: string;
  totalAmount: number;
  date: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  poNumber,
  vendorName,
  totalAmount,
  date,
}) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 70));

  return (
    <div className="flex flex-col h-full bg-slate-200 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 select-none transition-colors duration-150">
      {/* Viewer Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>PO_Invoice_Scan_9812.pdf</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
            Page 1 of 1
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 px-1">{zoom}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Document Canvas Render Area */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950/70">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="bg-white text-slate-900 w-[540px] min-h-[720px] rounded-sm shadow-xl p-8 transition-transform duration-100 relative font-sans text-xs border border-slate-300 flex flex-col justify-between"
        >
          {/* Top Document Header */}
          <div>
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {vendorName || 'Tata Steel BSL Limited'}
                </h2>
                <p className="text-[11px] text-slate-600 mt-1">
                  Plant No. 4, MIDC Industrial Area, Tarapur, Maharashtra - 401506
                </p>
                <p className="text-[11px] font-mono text-slate-700 font-semibold">
                  GSTIN: 27AAACT0001Z1Z2
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-bold px-2 py-0.5 text-xs uppercase tracking-wider rounded-xs">
                  TAX INVOICE
                </span>
                <p className="font-mono font-bold text-sm text-slate-900 mt-2">
                  #{poNumber || 'PO-2026-9812'}
                </p>
                <p className="text-slate-600 text-[11px]">Date: {date}</p>
              </div>
            </div>

            {/* Consignee */}
            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <p className="font-bold text-slate-500 uppercase text-[10px]">Buyer / Consignee:</p>
                <p className="font-bold text-slate-900">Apex Industries Ltd.</p>
                <p className="text-slate-600 text-[11px]">Plot 88, Electronic Zone, Pune 411057</p>
                <p className="font-mono text-slate-700 text-[10px] font-semibold">GSTIN: 27AABCF1234F1Z5</p>
              </div>
              <div>
                <p className="font-bold text-slate-500 uppercase text-[10px]">Place of Supply:</p>
                <p className="font-semibold text-slate-900">27 - Maharashtra (Intra-State)</p>
                <p className="font-bold text-slate-500 uppercase text-[10px] mt-1">Payment Terms:</p>
                <p className="text-slate-700">Net 30 Days</p>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left border-collapse mb-6">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-bold text-slate-600">
                  <th className="py-1.5">Description</th>
                  <th className="py-1.5 text-center">HSN</th>
                  <th className="py-1.5 text-right">Qty</th>
                  <th className="py-1.5 text-right">Rate (₹)</th>
                  <th className="py-1.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px] font-mono">
                <tr>
                  <td className="py-2 font-sans font-medium text-slate-900">
                    Industrial Steel Sheets Grade A (10mm)
                  </td>
                  <td className="py-2 text-center text-slate-600">7208</td>
                  <td className="py-2 text-right font-bold text-slate-900">25.00</td>
                  <td className="py-2 text-right">1,200.00</td>
                  <td className="py-2 text-right font-bold text-slate-900">30,000.00</td>
                </tr>
                <tr>
                  <td className="py-2 font-sans font-medium text-slate-900">
                    High Tensile Structural Bolts M16
                  </td>
                  <td className="py-2 text-center text-slate-600">7318</td>
                  <td className="py-2 text-right font-bold text-slate-900">100.00</td>
                  <td className="py-2 text-right">50.00</td>
                  <td className="py-2 text-right font-bold text-slate-900">5,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t-2 border-slate-300 pt-3">
            <div className="flex justify-end space-y-1">
              <div className="w-48 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹35,000.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST @ 9%:</span>
                  <span>₹3,150.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST @ 9%:</span>
                  <span>₹3,150.00</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-900 pt-1">
                  <span>Grand Total:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-end text-[10px] text-slate-500">
              <div className="flex items-center space-x-1.5 text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                <Eye className="w-3.5 h-3.5" />
                <span>AI Vision High Confidence (95%)</span>
              </div>
              <div className="text-right">
                <p>Authorized Signatory</p>
                <p className="font-semibold text-slate-800">Tata Steel BSL Ltd.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
