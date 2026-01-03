import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { Customer } from 'src/customer/entities/customer.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { PurchaseItem } from 'src/purchase-order/entities/purchase-item.entity';
import { Purchase } from 'src/purchase-order/entities/purchase.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { SalePayment } from 'src/sales/entities/sale-payment.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchase,
      PurchaseItem,
      Inventory,
      Supplier,
      Customer,
      Sale,
      SalePayment,
      Permission,
      Role,
      Warehouse,
      Payment,
    ]),
    AccountModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, RbacService],
})
export class PaymentModule {}
