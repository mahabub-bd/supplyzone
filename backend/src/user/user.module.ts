import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Attachment } from 'src/attachment/entities/attachment.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Attachment, Branch])],
  controllers: [UserController],
  providers: [UserService, RbacService],
  exports: [UserService, RbacService],
})
export class UserModule {}
