import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';
import { AuditTrail } from './entities/audit-trail-simple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrail, User, Permission, Role])],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor, RbacService],
  exports: [AuditService],
})
export class AuditModule {}

// Export for use in app module
export { AuditInterceptor } from './audit.interceptor';
