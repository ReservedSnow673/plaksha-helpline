export function nowIso(): string {
  return new Date().toISOString();
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export function diffSeconds(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / 1000);
}
