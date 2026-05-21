import type { Role } from '@plaksha/shared-types';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'requiredRoles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
