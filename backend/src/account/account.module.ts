import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountEntry } from './entities/account-entry.entity';
import { AccountTransaction } from './entities/account-transaction.entity';
import { Account } from './entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountTransaction,
      AccountEntry,
      Supplier,
      Customer,
      Permission,
      Role,
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService, RbacService],
  exports: [AccountService],
})
export class AccountModule {}
