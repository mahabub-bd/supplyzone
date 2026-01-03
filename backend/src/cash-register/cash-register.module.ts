import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/user/entities/user.entity';
import { CashRegisterController } from './cash-register.controller';
import { CashRegisterService } from './cash-register.service';
import { CashRegisterTransaction } from './entities/cash-register-transaction.entity';
import { CashRegister } from './entities/cash-register.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashRegister,
      CashRegisterTransaction,
      Sale,
      User,
      Branch,
      Role,
      Permission,
    ]),
  ],
  controllers: [CashRegisterController],
  providers: [CashRegisterService, RbacService],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
