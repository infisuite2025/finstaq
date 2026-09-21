/**
 * Automated GST Tax Engine for Indian & Multi-Jurisdictional Tax Compliance
 * 
 * Rules:
 * 1. State Code Determination: First 2 digits of GSTIN represent the State Code (e.g. "27" = Maharashtra, "29" = Karnataka, "07" = Delhi).
 * 2. Intra-State Supply: Supplier State == Place of Supply (Customer State) -> CGST (Tax/2) + SGST/UTGST (Tax/2)
 * 3. Inter-State Supply: Supplier State != Place of Supply (Customer State) -> IGST (Full Tax Rate)
 */

export interface TaxCalculationItemInput {
  ledgerId: string;
  taxableAmount: number;
  hsnCode?: string;
  taxRatePercent: number; // e.g. 18 for 18%
}

export interface TaxBreakdownLine {
  taxType: 'CGST' | 'SGST' | 'IGST';
  ratePercent: number;
  amount: number;
}

export interface CalculatedTaxResult {
  isIntraState: boolean;
  supplierStateCode: string;
  placeOfSupplyStateCode: string;
  taxableAmount: number;
  totalTaxAmount: number;
  totalInvoiceAmount: number;
  taxBreakdown: TaxBreakdownLine[];
}

export class TaxEngine {
  /**
   * Extracts 2-digit state code from GSTIN
   */
  public static extractStateCode(gstin?: string | null): string | null {
    if (!gstin) return null;
    const cleanGstin = gstin.trim().toUpperCase();
    if (cleanGstin.length < 2) return null;
    const code = cleanGstin.substring(0, 2);
    return /^\d{2}$/.test(code) ? code : null;
  }

  /**
   * Calculates comprehensive GST breakdown for a transaction
   * @param supplierGstIn - Tenant's GSTIN
   * @param customerGstIn - Customer/Vendor's GSTIN (or state code directly)
   * @param placeOfSupplyState - Fallback place of supply state code if unregistered customer
   * @param items - Line items with taxable amount and tax rate
   */
  public static calculateTax(params: {
    supplierGstIn?: string | null;
    customerGstIn?: string | null;
    placeOfSupplyState?: string | null;
    items: TaxCalculationItemInput[];
  }): CalculatedTaxResult {
    const supplierStateCode = this.extractStateCode(params.supplierGstIn) || '27'; // default Maharashtra
    const customerStateCode =
      this.extractStateCode(params.customerGstIn) ||
      (params.placeOfSupplyState ? params.placeOfSupplyState.padStart(2, '0') : supplierStateCode);

    const isIntraState = supplierStateCode === customerStateCode;

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    for (const item of params.items) {
      const taxable = Number(item.taxableAmount) || 0;
      totalTaxable += taxable;
      const rate = Number(item.taxRatePercent) || 0;
      const taxAmount = (taxable * rate) / 100;

      if (isIntraState) {
        const halfRate = rate / 2;
        const halfTax = taxAmount / 2;
        totalCgst += halfTax;
        totalSgst += halfTax;
      } else {
        totalIgst += taxAmount;
      }
    }

    // Round amounts to 2 decimal places for financial accuracy
    const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    const roundedTaxable = round2(totalTaxable);
    const taxBreakdown: TaxBreakdownLine[] = [];

    if (isIntraState) {
      if (totalCgst > 0) {
        taxBreakdown.push({
          taxType: 'CGST',
          ratePercent: params.items[0]?.taxRatePercent ? params.items[0].taxRatePercent / 2 : 0,
          amount: round2(totalCgst),
        });
      }
      if (totalSgst > 0) {
        taxBreakdown.push({
          taxType: 'SGST',
          ratePercent: params.items[0]?.taxRatePercent ? params.items[0].taxRatePercent / 2 : 0,
          amount: round2(totalSgst),
        });
      }
    } else {
      if (totalIgst > 0) {
        taxBreakdown.push({
          taxType: 'IGST',
          ratePercent: params.items[0]?.taxRatePercent || 0,
          amount: round2(totalIgst),
        });
      }
    }

    const totalTaxAmount = round2(
      taxBreakdown.reduce((sum, item) => sum + item.amount, 0)
    );
    const totalInvoiceAmount = round2(roundedTaxable + totalTaxAmount);

    return {
      isIntraState,
      supplierStateCode,
      placeOfSupplyStateCode: customerStateCode,
      taxableAmount: roundedTaxable,
      totalTaxAmount,
      totalInvoiceAmount,
      taxBreakdown,
    };
  }
}
