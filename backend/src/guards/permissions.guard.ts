import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from 'src/rbac/rbac.service';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();

    const userRoles = user.roles || [];

    const userPermissions =
      await this.rbacService.getPermissionsForRoles(userRoles);

    const allowed = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!allowed) {
      throw new ForbiddenException('Permission denied');
    }

    return true;
  }
}
