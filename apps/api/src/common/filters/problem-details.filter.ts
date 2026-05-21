import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import type { AuthenticatedRequest } from '../types/request';

interface ProblemBody {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  correlationId?: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<AuthenticatedRequest>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let body: ProblemBody = {
      type: 'about:blank',
      title: 'Internal Server Error',
      status,
      instance: req.url,
      correlationId: req.correlationId,
    };

    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        body = { ...body, title: resp };
      } else if (typeof resp === 'object' && resp !== null) {
        body = { ...body, ...(resp as Partial<ProblemBody>) };
      }
    } else if (exception instanceof Error) {
      body.detail = exception.message;
      this.logger.error(exception.stack ?? exception.message);
    }

    if (status >= 500) this.logger.error({ status, body, path: req.url });

    res.setHeader('Content-Type', 'application/problem+json');
    res.status(status).send(body);
  }
}
