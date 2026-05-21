import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'idempotent';
export const Idempotent = (ttlSeconds = 86_400): MethodDecorator =>
  SetMetadata(IDEMPOTENT_KEY, ttlSeconds);
