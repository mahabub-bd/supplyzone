import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { ExpenseCategory } from 'src/expense-category/entities/expense-category.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Expense } from './entities/expense.entity';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Role, Permission, ExpenseCategory]),
    AccountModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, RbacService],
})
export class ExpenseModule {}
