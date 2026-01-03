import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { AccountEntry } from 'src/account/entities/account-entry.entity';
import { AccountTransaction } from 'src/account/entities/account-transaction.entity';
import { Account } from 'src/account/entities/account.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StockMovement } from 'src/inventory/entities/stock-movement.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Product } from 'src/product/entities/product.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseReturnItem } from './entities/purchase-return-item.entity';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseReturnController } from './purchase-return.controller';
import { PurchaseReturnService } from './purchase-return.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

export { PurchaseItem } from './entities/purchase-item.entity';
export { Purchase } from './entities/purchase.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchase,
      PurchaseItem,
      PurchaseReturn,
      PurchaseReturnItem,
      Supplier,
      Warehouse,
      Product,
      User,
      Permission,
      Role,
      Payment,
      Account,
      AccountTransaction,
      AccountEntry,
      Customer,
      Inventory,
      StockMovement,
    ]),
  ],
  controllers: [PurchaseController, PurchaseReturnController],
  providers: [
    PurchaseService,
    RbacService,
    AccountService,
    PurchaseReturnService,
  ],
  exports: [PurchaseService],
})
export class PurchaseOrderModule {}
