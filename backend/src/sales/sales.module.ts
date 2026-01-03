import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { AuditModule } from 'src/audit/audit.module';
import { Branch } from 'src/branch/entities/branch.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StockMovement } from 'src/inventory/entities/stock-movement.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SalePayment } from './entities/sale-payment.entity';
import { Sale } from './entities/sale.entity';
import { SaleReturn } from './entities/sale-return.entity';
import { SaleReturnItem } from './entities/sale-return-item.entity';

import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SaleReturnController } from './sale-return.controller';
import { SaleReturnService } from './sale-return.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      SalePayment,
      SaleReturn,
      SaleReturnItem,
      Product,
      Customer,
      Inventory,
      StockMovement,
      Branch,
      User,
      Warehouse,
      Permission,
      Role,
    ]),
    AccountModule,
    AuditModule,
  ],
  providers: [SalesService, SaleReturnService, RbacService],
  controllers: [SalesController, SaleReturnController],
  exports: [SalesService, SaleReturnService],
})
export class SalesModule {}
