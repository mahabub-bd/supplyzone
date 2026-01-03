import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './entities/customer.entity';
import { BillingAddress } from './entities/billing-address.entity';
import { ShippingAddress } from './entities/shipping-address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Account, Role, Permission, Sale, BillingAddress, ShippingAddress]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, RbacService],
  exports: [CustomerService],
})
export class CustomerModule {}
