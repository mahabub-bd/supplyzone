import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Permission, Role])],
  controllers: [WarehouseController],
  providers: [WarehouseService, RbacService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
