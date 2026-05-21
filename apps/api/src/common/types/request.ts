import type { Role } from '@plaksha/shared-types';
import type { Request } from 'express';

export interface RequestPrincipal {
  userId: string;
  email: string;
  role: Role;
  departmentId: string | null;
  sessionId: string;
  tokenJti: string;
}

export interface AuthenticatedRequest extends Request {
  principal?: RequestPrincipal;
  correlationId?: string;
}
