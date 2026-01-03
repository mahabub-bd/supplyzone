import { Controller, Get, NotFoundException, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

import { SalesService } from '../sales/sales.service';
import { InvoiceService } from './invoice.service';

import { PurchaseService } from 'src/purchase-order/purchase.service';
import { QuotationService } from 'src/quotation/quotation.service';
import { mapPurchaseToInvoice } from './mappers/purchase.mapper';
import { mapQuotationToInvoice } from './mappers/quotation.mapper';
import { mapSaleToInvoice } from './mappers/sale.mapper';

@ApiTags('Invoice')
@ApiBearerAuth('token')
@Controller('invoice')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly salesService: SalesService,
    private readonly purchasesService: PurchaseService,
    private readonly quotationsService: QuotationService,
  ) {}

  /* ================= SALE ================= */
  @Permissions('invoice.view')
  @Get('sale/:id')
  async sale(@Param('id') id: number, @Res() res: Response) {
    const sale = await this.salesService.findOneWithRelations(+id);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const dto = mapSaleToInvoice(sale);
    const pdf = await this.invoiceService.generatePdf(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${sale.invoice_no}.pdf`,
    });
    res.end(pdf);
  }

  /* ================= PURCHASE ================= */
  @Permissions('invoice.view')
  @Get('purchase/:id')
  async purchase(@Param('id') id: number, @Res() res: Response) {
    const purchase = await this.purchasesService.findOne(+id);

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    const dto = mapPurchaseToInvoice(purchase);
    const pdf = await this.invoiceService.generatePdf(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${purchase.po_no}.pdf`,
    });
    res.end(pdf);
  }

  /* ================= QUOTATION ================= */
  @Permissions('invoice.view')
  @Get('quotation/:id')
  async quotation(@Param('id') id: number, @Res() res: Response) {
    const quotation = await this.quotationsService.findOne(+id);

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    const dto = mapQuotationToInvoice(quotation);
    const pdf = await this.invoiceService.generatePdf(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${quotation.quotation_no}.pdf`,
    });
    res.end(pdf);
  }
}
