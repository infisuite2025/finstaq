import {
  AuditAction,
  BillReferenceType,
  DocumentDraftStatus,
  GroupNature,
  Prisma,
  PrismaClient,
  VoucherType,
} from '@prisma/client';
import { prisma as defaultPrisma } from '../../../core/database/prisma';
import { AppError, NotFoundError } from '../../../core/errors/app-error';
import { FuzzyMatcher } from './fuzzy-matcher';
import { AuditLoggerService } from '../../../core/audit/audit-logger';
import { AccountingService } from '../../accounting/services/accounting.service';

export interface ExtractedLineItem {
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  totalAmount: number;
  matchedInventoryItemId?: string;
  matchedInventoryItemName?: string;
  itemMatchConfidence?: number;
  confidenceScore: number;
}

export interface ExtractedDocumentData {
  vendorName: string;
  vendorGstin?: string;
  matchedVendorLedgerId?: string;
  matchedVendorLedgerName?: string;
  vendorMatchConfidence?: number;
  poNumber: string;
  invoiceDate: string;
  dueDate?: string;
  lineItems: ExtractedLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  overallConfidence: number;
  fieldConfidences: {
    vendorName: number;
    poNumber: number;
    invoiceDate: number;
    totalAmount: number;
    lineItems: number;
  };
}

export interface ApproveAndPostDraftDto {
  draftId: string;
  tenantId: string;
  userId: string;
  voucherNumber: string;
  date: string;
  vendorLedgerId: string;
  purchaseLedgerId: string;
  taxLedgerId?: string;
  narration?: string;
  items: {
    inventoryItemId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  totalAmount: number;
  taxAmount?: number;
  ipAddress?: string;
  userAgent?: string;
}

export class AiDocumentExtractorService {
  /**
   * Simulated / LLM-assisted vision extraction engine that parses PO/Invoice documents
   * and produces high-fidelity structured outputs with confidence scoring.
   */
  public static async parseDocumentVision(
    _fileBuffer: Buffer | string,
    filename: string
  ): Promise<ExtractedDocumentData> {
    // In production, this calls OpenAI / Gemini Vision API / AWS Textract
    // Structured mock parsing logic representing high-accuracy OCR model
    const isSpecialCase = filename.toLowerCase().includes('tata') || filename.toLowerCase().includes('po');

    return {
      vendorName: isSpecialCase ? 'Tata Steel BSL Limited' : 'Stark Logistics Corp',
      vendorGstin: isSpecialCase ? '27AAACT0001Z1Z2' : '27AAACS9988H1Z4',
      poNumber: 'PO-2026-9812',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'INR',
      lineItems: [
        {
          description: 'Industrial Steel Sheets Grade A (10mm)',
          sku: 'STL-SHT-10MM',
          quantity: 25,
          unitPrice: 1200,
          taxRatePercent: 18,
          totalAmount: 30000,
          confidenceScore: 0.96,
        },
        {
          description: 'High Tensile Structural Bolts M16',
          sku: 'BLT-M16-HT',
          quantity: 100,
          unitPrice: 50,
          taxRatePercent: 18,
          totalAmount: 5000,
          confidenceScore: 0.94,
        },
      ],
      subtotal: 35000,
      taxAmount: 6300,
      totalAmount: 41300,
      overallConfidence: 0.95,
      fieldConfidences: {
        vendorName: 0.98,
        poNumber: 0.97,
        invoiceDate: 0.96,
        totalAmount: 0.99,
        lineItems: 0.95,
      },
    };
  }

  /**
   * Executes entity extraction and smart database matching against tenant master records
   */
  public static async processAndSaveDraft(
    tenantId: string,
    userId: string,
    fileUrl: string,
    fileBuffer: Buffer | string,
    filename: string,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    // 1. Run AI Vision Parsing
    const rawData = await this.parseDocumentVision(fileBuffer, filename);

    // 2. Fetch tenant Master Ledgers (Vendors/Suppliers)
    const ledgers = await prismaClient.ledger.findMany({
      where: { tenantId, isActive: true },
    });

    // Smart Match Vendor to Ledger
    const vendorMatch = FuzzyMatcher.findBestMatch(
      rawData.vendorName,
      ledgers,
      (ledger) => ledger.name,
      0.55
    );

    if (vendorMatch) {
      rawData.matchedVendorLedgerId = vendorMatch.match.id;
      rawData.matchedVendorLedgerName = vendorMatch.match.name;
      rawData.vendorMatchConfidence = vendorMatch.score;
    }

    // 3. Fetch tenant Inventory Items
    const inventoryItems = await prismaClient.inventoryItem.findMany({
      where: { tenantId },
    });

    // Smart Match Line Items to Inventory Items
    for (const item of rawData.lineItems) {
      const itemMatch = FuzzyMatcher.findBestMatch(
        item.description,
        inventoryItems,
        (inv) => `${inv.name} ${inv.sku || ''}`,
        0.5
      );

      if (itemMatch) {
        item.matchedInventoryItemId = itemMatch.match.id;
        item.matchedInventoryItemName = itemMatch.match.name;
        item.itemMatchConfidence = itemMatch.score;
      }
    }

    // 4. Save to DocumentDraft table
    const draft = await prismaClient.documentDraft.create({
      data: {
        tenantId,
        fileUrl,
        parsedDataJson: rawData as unknown as Prisma.InputJsonValue,
        status: DocumentDraftStatus.PENDING_REVIEW,
        createdBy: userId,
      },
    });

    return {
      draftId: draft.id,
      status: draft.status,
      parsedData: rawData,
      createdAt: draft.createdAt,
    };
  }

  /**
   * Converts an approved document draft into an official balanced PURCHASE voucher
   * and increments inventory quantities atomically.
   */
  public static async approveAndPostDraft(
    dto: ApproveAndPostDraftDto,
    prismaClient: PrismaClient = defaultPrisma
  ) {
    const draft = await prismaClient.documentDraft.findFirst({
      where: { id: dto.draftId, tenantId: dto.tenantId },
    });

    if (!draft) {
      throw new NotFoundError('Document Draft not found');
    }

    if (draft.status === DocumentDraftStatus.APPROVED) {
      throw new AppError('This document draft has already been verified and posted', 400);
    }

    // Prepare Double-Entry lines for Purchase Voucher
    // Dr. Purchase Account (Subtotal)
    // Dr. Input Tax / GST Account (TaxAmount if present)
    // Cr. Vendor Account (TotalAmount)
    const subtotal = dto.totalAmount - (dto.taxAmount || 0);
    const voucherItems: {
      ledgerId: string;
      debitAmount: number;
      creditAmount: number;
      billReferenceType?: BillReferenceType;
      referenceNumber?: string;
    }[] = [
      {
        ledgerId: dto.purchaseLedgerId,
        debitAmount: subtotal,
        creditAmount: 0,
      },
      {
        ledgerId: dto.vendorLedgerId,
        debitAmount: 0,
        creditAmount: dto.totalAmount,
        billReferenceType: BillReferenceType.NEW_REF,
        referenceNumber: dto.voucherNumber,
      },
    ];

    if (dto.taxAmount && dto.taxAmount > 0 && dto.taxLedgerId) {
      voucherItems.push({
        ledgerId: dto.taxLedgerId,
        debitAmount: dto.taxAmount,
        creditAmount: 0,
      });
    }

    return await prismaClient.$transaction(async (tx) => {
      // 1. Post Purchase Voucher using Accounting Engine
      const voucher = await AccountingService.createVoucher(
        {
          tenantId: dto.tenantId,
          userId: dto.userId,
          type: VoucherType.PURCHASE,
          voucherNumber: dto.voucherNumber,
          date: dto.date,
          narration: dto.narration || `Generated from AI Document Draft #${draft.id}`,
          items: voucherItems,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        },
        tx as unknown as PrismaClient
      );

      // 2. Increment inventory items stock quantity
      for (const line of dto.items) {
        if (line.inventoryItemId) {
          await tx.inventoryItem.update({
            where: { id: line.inventoryItemId },
            data: {
              closingStockQty: {
                increment: new Prisma.Decimal(line.quantity),
              },
            },
          });
        }
      }

      // 3. Mark DocumentDraft as APPROVED
      const updatedDraft = await tx.documentDraft.update({
        where: { id: draft.id },
        data: {
          status: DocumentDraftStatus.APPROVED,
        },
      });

      // 4. Log immutable audit trail
      await AuditLoggerService.log(
        {
          tenantId: dto.tenantId,
          userId: dto.userId,
          action: AuditAction.UPDATE,
          entityName: 'DocumentDraft',
          entityId: draft.id,
          after: {
            status: DocumentDraftStatus.APPROVED,
            postedVoucherId: voucher.id,
            voucherNumber: voucher.voucherNumber,
          },
        },
        tx as unknown as PrismaClient
      );

      return {
        success: true,
        voucher,
        draft: updatedDraft,
      };
    });
  }
}
