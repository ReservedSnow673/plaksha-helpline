import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export class ResourceNotFoundError extends NotFoundException {
  constructor(resource: string, id?: string) {
    super({
      type: 'about:blank',
      title: 'Resource not found',
      status: 404,
      detail: id ? `${resource} ${id} not found` : `${resource} not found`,
    });
  }
}

export class ForbiddenError extends ForbiddenException {
  constructor(detail = 'You do not have permission to perform this action.') {
    super({ type: 'about:blank', title: 'Forbidden', status: 403, detail });
  }
}

export class InvalidStateError extends HttpException {
  constructor(detail: string) {
    super(
      { type: 'about:blank', title: 'Invalid state transition', status: 409, detail },
      HttpStatus.CONFLICT,
    );
  }
}

export class RateLimitedError extends HttpException {
  constructor(detail = 'Rate limit exceeded') {
    super(
      { type: 'about:blank', title: 'Too Many Requests', status: 429, detail },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
