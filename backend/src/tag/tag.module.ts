import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Tag } from './entities/tag.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Permission, Role])],
  controllers: [TagController],
  providers: [TagService, RbacService],
})
export class TagModule {}
