import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/expense/entities/expense.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Employee } from '../hrm/entities/employee.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { StockMovement } from '../inventory/entities/stock-movement.entity';
import { Product } from '../product/entities/product.entity';
import { PurchaseItem } from '../purchase-order/entities/purchase-item.entity';
import { Purchase } from '../purchase-order/entities/purchase.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Sale } from '../sales/entities/sale.entity';
import { User } from '../user/entities/user.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      Purchase,
      PurchaseItem,
      Inventory,
      StockMovement,
      Product,
      User,
      Employee,
      Role,
      Permission,
      Expense,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, RbacService],
  exports: [ReportsService],
})
export class ReportModule {}
