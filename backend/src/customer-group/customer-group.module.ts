import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerGroupController } from './customer-group.controller';
import { CustomerGroupService } from './customer-group.service';
import { CustomerGroup } from './entities/customer-group.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Permission } from 'src/rbac/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerGroup, Permission, Role])],
  controllers: [CustomerGroupController],
  providers: [CustomerGroupService, RbacService],
  exports: [CustomerGroupService],
})
export class CustomerGroupModule {}