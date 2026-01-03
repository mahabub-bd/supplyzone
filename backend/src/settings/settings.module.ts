import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { Setting } from './entities/setting.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, Role, Permission]),
    AttachmentModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, RbacService],
  exports: [SettingsService],
})
export class SettingsModule {}
