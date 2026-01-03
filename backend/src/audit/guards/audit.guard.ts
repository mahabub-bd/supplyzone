import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../audit.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditGuard implements CanActivate {
  private readonly logger = new Logger(AuditGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return true; // No audit configuration found
    }

    try {
      const { user } = request;
      const userId = user?.id || null;
      const username = user?.username || null;

      // Pre-action audit log
      const preActionLog = await this.auditService.logWithRequest(
        request,
        userId,
        username,
        {
          action: auditOptions.action,
          module: auditOptions.module,
          entityType: auditOptions.entityType,
          description: `${auditOptions.description || auditOptions.action} started`,
          metadata: {
            stage: 'pre_action',
            controller: context.getClass().name,
            handler: context.getHandler().name,
          },
        },
      );

      // Store pre-action log ID for post-action correlation
      request.auditLogId = preActionLog.id;

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to create pre-action audit log: ${error.message}`,
      );
      return true; // Don't block the operation if audit fails
    }
  }
}
