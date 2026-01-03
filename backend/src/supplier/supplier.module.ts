import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { AccountEntry } from 'src/account/entities/account-entry.entity';
import { AccountTransaction } from 'src/account/entities/account-transaction.entity';
import { Account } from 'src/account/entities/account.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Product } from 'src/product/entities/product.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Supplier } from './entities/supplier.entity';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      Permission,
      Role,
      Product,
      Account,
      Payment,
      AccountTransaction,
      AccountEntry,
      Customer,
    ]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService, RbacService, AccountService],
  exports: [SupplierService],
})
export class SupplierModule {}
