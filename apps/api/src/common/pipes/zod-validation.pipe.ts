import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_';
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      throw new BadRequestException({
        type: 'about:blank',
        title: 'Validation failed',
        status: 400,
        errors,
      });
    }
    return result.data;
  }
}

export function ZodBody<T>(schema: ZodSchema<T>): ZodValidationPipe<T> {
  return new ZodValidationPipe<T>(schema);
}
