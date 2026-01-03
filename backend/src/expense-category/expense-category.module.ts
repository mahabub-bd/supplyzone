import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseCategoryController } from './expense-category.controller';
import { ExpenseCategoryService } from './expense-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory, Role, Permission])],
  providers: [ExpenseCategoryService, RbacService],
  controllers: [ExpenseCategoryController],
  exports: [ExpenseCategoryService], // if needed for ExpenseModule
})
export class ExpenseCategoryModule {}
