import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { QuotationModule } from 'src/quotation/quotation.module';
import { SalesModule } from 'src/sales/sales.module';
import { RbacModule } from '../rbac/rbac.module';
import { SettingsModule } from '../settings/settings.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceDocument } from './entities/invoice-document.entity';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceDocument]),
    SettingsModule,
    RbacModule,
    SalesModule,
    PurchaseOrderModule,
    QuotationModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
