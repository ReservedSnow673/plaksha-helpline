import type { CreateOptions, Model } from 'sequelize';

/**
 * Typed wrapper around Sequelize `create()` — sequelize-typescript's `Optional<>` helper
 * does not match insert payloads under strict TypeScript.
 */
export function createRecord<M extends Model>(
  model: unknown,
  values: object,
  options?: CreateOptions,
): Promise<M> {
  const writer = model as { create(values: object, options?: CreateOptions): Promise<M> };
  return writer.create(values, options);
}
