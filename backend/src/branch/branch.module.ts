import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { Branch } from './entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Permission, Role])],
  controllers: [BranchController],
  providers: [BranchService, RbacService],
  exports: [BranchService],
})
export class BranchModule {}
