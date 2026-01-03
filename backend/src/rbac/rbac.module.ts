import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from 'src/roles/roles.service';
import { Role } from '../roles/entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  providers: [RbacService, PermissionService, RoleService],
  controllers: [RbacController],
  exports: [RbacService, PermissionService, RoleService],
})
export class RbacModule {}
