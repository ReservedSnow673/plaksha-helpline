import { randomUUID } from 'node:crypto';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';

import type { AuthenticatedRequest } from '../types/request';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    if (!http.getRequest) return next.handle();
    const req = http.getRequest<AuthenticatedRequest>();
    const res = http.getResponse<Response>();
    const incoming = req.headers['x-correlation-id'];
    const id =
      typeof incoming === 'string' && incoming.length <= 64 ? incoming : randomUUID();
    req.correlationId = id;
    res.setHeader('x-correlation-id', id);
    return next.handle();
  }
}
