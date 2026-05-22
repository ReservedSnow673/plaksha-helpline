export function generateIdempotencyKey(): string {
  const a = Math.random().toString(36).slice(2, 10);
  const b = Date.now().toString(36);
  return `${a}-${b}`;
}
