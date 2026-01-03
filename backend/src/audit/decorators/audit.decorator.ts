import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditModule } from '../entities/audit-trail.entity';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  module: AuditModule;
  action: AuditAction;
  entityType: string;
  description?: string;
  trackChanges?: boolean;
}

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);