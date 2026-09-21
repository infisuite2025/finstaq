import React, { useState } from 'react';
import {
  Printer,
  X,
  Download,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export interface ReportPrintColumn {
  header: string;
  accessor: string;
  align?: 'left' | 'center' | 'right';
  format?: 'currency' | 'percent' | 'text' | 'date';
}

export interface ReportPrintData {
  reportTitle: string;
  department: 'ACCOUNTING' | 'PURCHASE' | 'SALES' | 'TAXATION';
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
  summaryCards?: Array<{
    label: string;
    value: string | number;
    format?: 'currency' | 'percent' | 'text';
  }>;
  sections?: Array<{
    title: string;
    columns: ReportPrintColumn[];
    rows: any[];
    totalRow?: Record<string, any>;
  }>;
  columns?: ReportPrintColumn[];
  rows?: any[];
  totalRow?: Record<string, any>;
  notes?: string;
}

interface UniversalReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportPrintData | null;
  userRole?: string;
  canPrint?: boolean;
  canExport?: boolean;
}

export function UniversalReportPrintModal({
  isOpen,
  onClose,
  data,
  userRole = 'ACCOUNTANT',
  canPrint = true,
  canExport = true,
}: UniversalReportPrintModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    if (!canPrint) return;
    window.print();
  };

  const handleExportCSV = () => {
    if (!canExport || !data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Corporate Header
    csvContent += '"APEX INDUSTRIES LIMITED"\r\n';
    csvContent += `"GSTIN: 27AABCF1234F1Z5 | CIN: U29100MH2020PLC123456"\r\n`;
    csvContent += `"${data.reportTitle.toUpperCase()}"\r\n`;
    if (data.startDate && data.endDate) {
      csvContent += `"Period: ${data.startDate} to ${data.endDate}"\r\n`;
    } else if (data.asOfDate) {
      csvContent += `"As of Date: ${data.asOfDate}"\r\n`;
    }
    csvContent += `"Generated On: ${new Date().toLocaleString('en-IN')}"\r\n\r\n`;

    // Flatten sections or direct rows
    if (data.sections && data.sections.length > 0) {
      data.sections.forEach((sec) => {
        csvContent += `"${sec.title.toUpperCase()}"\r\n`;
        const headers = sec.columns.map((c) => `"${c.header}"`).join(',');
        csvContent += headers + '\r\n';

        sec.rows.forEach((row) => {
          const line = sec.columns
            .map((c) => {
              const val = row[c.accessor] !== undefined && row[c.accessor] !== null ? String(row[c.accessor]).replace(/"/g, '""') : '';
              return `"${val}"`;
            })
            .join(',');
          csvContent += line + '\r\n';
        });

        if (sec.totalRow) {
          const totalLine = sec.columns
            .map((c) => {
              const val = sec.totalRow![c.accessor] !== undefined && sec.totalRow![c.accessor] !== null ? String(sec.totalRow![c.accessor]).replace(/"/g, '""') : '';
              return `"${val}"`;
            })
            .join(',');
          csvContent += totalLine + '\r\n';
        }
        csvContent += '\r\n';
      });
    } else if (data.columns && data.rows) {
      const headers = data.columns.map((c) => `"${c.header}"`).join(',');
      csvContent += headers + '\r\n';

      data.rows.forEach((row) => {
        const line = data.columns!
          .map((c) => {
            const val = row[c.accessor] !== undefined && row[c.accessor] !== null ? String(row[c.accessor]).replace(/"/g, '""') : '';
            return `"${val}"`;
          })
          .join(',');
        csvContent += line + '\r\n';
      });

      if (data.totalRow) {
        const totalLine = data.columns
          .map((c) => {
            const val = data.totalRow![c.accessor] !== undefined && data.totalRow![c.accessor] !== null ? String(data.totalRow![c.accessor]).replace(/"/g, '""') : '';
            return `"${val}"`;
          })
          .join(',');
        csvContent += totalLine + '\r\n';
      }
    }

    const safeName = data.reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finstaq_${safeName}_${data.endDate || data.asOfDate || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCellValue = (value: any, format?: 'currency' | 'percent' | 'text' | 'date') => {
    if (value === undefined || value === null) return '—';
    if (format === 'currency') {
      const num = Number(value) || 0;
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    if (format === 'percent') {
      const num = Number(value) || 0;
      return `${num.toFixed(2)}%`;
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:static print:bg-white print:z-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:rounded-none print:my-0 print:max-w-none print:w-full print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>{data.reportTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase">
                  {data.department}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Statutory Financial & Management Report Preview • Authorized Role: <strong className="font-mono">{userRole}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export Excel / CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!canExport}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                canExport
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              title={canExport ? 'Export formatted CSV/Excel' : 'Export rights restricted'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel/CSV</span>
            </button>

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!canPrint}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                canPrint
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              title={canPrint ? 'Print document or Save as PDF' : 'Print rights restricted'}
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Sheet (A4 Standard) */}
        <div className="p-8 bg-white text-slate-900 font-sans max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 select-text">
          <div className="border-2 border-slate-900 p-6 space-y-4 print:border-slate-900 text-[11px] leading-relaxed">
            {/* Header / Statutory Corporate Details */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-black text-sm print:bg-slate-900">
                    F
                  </div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    APEX INDUSTRIES LIMITED
                  </h1>
                </div>
                <p className="text-slate-600 text-[10.5px]">
                  Plot 42, MIDC Industrial Area, Chinchwad, Pune - 411019, Maharashtra, India
                </p>
                <div className="text-slate-600 text-[10px] space-x-3">
                  <span><strong>GSTIN:</strong> 27AABCF1234F1Z5</span>
                  <span><strong>CIN:</strong> U29100MH2020PLC123456</span>
                  <span><strong>PAN:</strong> AABCF1234F</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded">
                  {data.reportTitle}
                </div>
                {data.subtitle && (
                  <div className="text-[9.5px] text-slate-500 italic max-w-xs">{data.subtitle}</div>
                )}
                <div className="pt-1 text-[10px] font-mono text-slate-600">
                  {data.startDate && data.endDate ? (
                    <span>Period: <strong>{data.startDate}</strong> to <strong>{data.endDate}</strong></span>
                  ) : data.asOfDate ? (
                    <span>As of: <strong>{data.asOfDate}</strong></span>
                  ) : null}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  Generated: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* KPI Summary Cards if provided */}
            {data.summaryCards && data.summaryCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-slate-300 pb-3">
                {data.summaryCards.map((c, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                      {c.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block">
                      {formatCellValue(c.value, c.format)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sections Rendering (e.g. Balance Sheet Assets & Liabilities, P&L Revenue & Expenses) */}
            {data.sections && data.sections.length > 0 ? (
              <div className="space-y-4">
                {data.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="font-black text-xs text-slate-900 uppercase tracking-wider bg-slate-100 px-2 py-1 border-l-4 border-slate-900">
                      {sec.title}
                    </div>
                    <table className="w-full text-left border border-slate-900 border-collapse text-[10px]">
                      <thead className="bg-slate-50 border-b border-slate-900 text-slate-900 font-bold">
                        <tr>
                          {sec.columns.map((col, cIdx) => (
                            <th
                              key={cIdx}
                              className={`py-1 px-2 border-r border-slate-300 ${
                                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                              }`}
                            >
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sec.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {sec.columns.map((col, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-1 px-2 border-r border-slate-300 font-mono ${
                                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                }`}
                              >
                                {formatCellValue(row[col.accessor], col.format)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {sec.totalRow && (
                          <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                            {sec.columns.map((col, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-1 px-2 border-r border-slate-300 font-mono ${
                                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                }`}
                              >
                                {formatCellValue(sec.totalRow![col.accessor], col.format)}
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : data.columns && data.rows ? (
              /* Single Table Rendering (Registers, Aging, Breakdowns) */
              <div>
                <table className="w-full text-left border border-slate-900 border-collapse text-[10px]">
                  <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold">
                    <tr>
                      {data.columns.map((col, cIdx) => (
                        <th
                          key={cIdx}
                          className={`py-1 px-2 border-r border-slate-300 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {data.columns!.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-1 px-2 border-r border-slate-300 font-mono ${
                              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                            }`}
                          >
                            {formatCellValue(row[col.accessor], col.format)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {data.totalRow && (
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                        {data.columns.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-1 px-2 border-r border-slate-300 font-mono ${
                              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                            }`}
                          >
                            {formatCellValue(data.totalRow![col.accessor], col.format)}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Notes & Declarations */}
            {data.notes && (
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[9.5px] text-slate-600">
                <strong>Notes / Compliance Disclosures:</strong> {data.notes}
              </div>
            )}

            {/* Signatures & Corporate Authorization */}
            <div className="pt-6 grid grid-cols-3 gap-6 text-center text-[10px] border-t border-slate-900 mt-6">
              <div className="space-y-8">
                <div className="font-semibold text-slate-600">Prepared By</div>
                <div className="border-t border-slate-400 pt-1 font-mono text-slate-800">
                  Accounts Executive
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-semibold text-slate-600">Verified & Checked</div>
                <div className="border-t border-slate-400 pt-1 font-mono text-slate-800">
                  Head of Finance
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-semibold text-slate-600">Authorized Signatory</div>
                <div className="border-t border-slate-400 pt-1 font-mono text-slate-800">
                  Chief Financial Officer (CFO)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
