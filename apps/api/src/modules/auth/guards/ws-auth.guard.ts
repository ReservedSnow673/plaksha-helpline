import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { TokenService } from '../services/token.service';

export interface WsPrincipal {
  userId: string;
  email: string;
  role: import('@plaksha/shared-types').Role;
  departmentId: string | null;
  sessionId: string;
}

declare module 'socket.io' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Socket {
    principal?: WsPrincipal;
  }
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient<Socket>();
    if (socket.principal) return true;
    const token = extractToken(socket);
    if (!token) {
      socket.disconnect(true);
      return false;
    }
    try {
      const claims = await this.tokens.verifyAccessToken(token);
      socket.principal = {
        userId: claims.sub,
        email: claims.email,
        role: claims.role,
        departmentId: claims.departmentId,
        sessionId: claims.sessionId,
      };
      return true;
    } catch {
      socket.disconnect(true);
      return false;
    }
  }
}

function extractToken(socket: Socket): string | null {
  const auth = socket.handshake.auth as { token?: string } | undefined;
  if (auth?.token) return auth.token;
  const headerAuth = socket.handshake.headers.authorization;
  if (typeof headerAuth === 'string' && headerAuth.startsWith('Bearer ')) {
    return headerAuth.slice('Bearer '.length).trim();
  }
  return null;
}
