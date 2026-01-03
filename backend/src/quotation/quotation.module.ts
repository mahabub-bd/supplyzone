import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { Branch } from 'src/branch/entities/branch.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { SaleItem } from 'src/sales/entities/sale-item.entity';
import { SalePayment } from 'src/sales/entities/sale-payment.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/user/entities/user.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Quotation } from './entities/quotation.entity';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      QuotationItem,
      Product,
      Customer,
      Branch,
      User,
      Role,
      Permission,
      Sale,
      SaleItem,
      SalePayment,
    ]),
    AuditModule,
  ],
  providers: [QuotationService, RbacService],
  controllers: [QuotationController],
  exports: [QuotationService],
})
export class QuotationModule {}
