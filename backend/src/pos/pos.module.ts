import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { SalesModule } from 'src/sales/sales.module';
import { CashRegisterModule } from 'src/cash-register/cash-register.module';
import { Sale } from 'src/sales/entities/sale.entity';
import { SaleItem } from 'src/sales/entities/sale-item.entity';
import { SalePayment } from 'src/sales/entities/sale-payment.entity';
import { Product } from 'src/product/entities/product.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StockMovement } from 'src/inventory/entities/stock-movement.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Permission } from 'src/rbac/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AccountTransaction } from 'src/account/entities/account-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      SalePayment,
      Product,
      Customer,
      Inventory,
      StockMovement,
      Permission,
      Role,
      AccountTransaction,
    ]),
    SalesModule,
    CashRegisterModule,
  ],
  controllers: [PosController],
  providers: [PosService, RbacService],
  exports: [PosService],
})
export class PosModule {}
