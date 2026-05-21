import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import type { AuthenticatedRequest } from '../../../common/types/request';
import { SessionsService } from '../services/sessions.service';
import { TokenService } from '../services/token.service';

import { RolesGuard } from './roles.guard';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly sessions: SessionsService,
    private readonly rolesGuard: RolesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
    const token = auth.slice('Bearer '.length).trim();
    if (!token) throw new UnauthorizedException('Empty bearer token');

    try {
      const claims = await this.tokens.verifyAccessToken(token);
      req.principal = {
        userId: claims.sub,
        email: claims.email,
        role: claims.role,
        departmentId: claims.departmentId,
        sessionId: claims.sessionId,
        tokenJti: claims.jti,
      };
      // Best-effort session touch — never block requests on this.
      this.sessions.touch(claims.sessionId).catch(() => undefined);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return this.rolesGuard.canActivate(context);
  }
}
