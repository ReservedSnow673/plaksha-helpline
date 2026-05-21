import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequest, RequestPrincipal } from '../types/request';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestPrincipal => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.principal) {
      throw new Error('CurrentUser used on a route without an authenticated principal');
    }
    return req.principal;
  },
);
