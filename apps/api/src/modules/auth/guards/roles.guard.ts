import { hasPermission, type Permission, type Role } from '@plaksha/shared-types';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../../common/types/request';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const perms = this.reflector.getAllAndOverride<Permission[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length && !perms?.length) return true;
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.principal) throw new ForbiddenException('Authentication required');
    if (required?.length && !required.includes(req.principal.role)) {
      throw new ForbiddenException('Role not permitted');
    }
    if (perms?.length) {
      const missing = perms.filter((p) => !hasPermission(req.principal!.role, p));
      if (missing.length > 0) throw new ForbiddenException(`Missing permissions: ${missing.join(', ')}`);
    }
    return true;
  }
}
