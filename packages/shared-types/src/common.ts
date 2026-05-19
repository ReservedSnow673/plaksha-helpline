export type ISODateString = string;
export type UUID = string;

export type Language = 'en' | 'hi' | 'pa';
export const LANGUAGES: readonly Language[] = ['en', 'hi', 'pa'] as const;

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export const PRIORITIES: readonly Priority[] = ['P1', 'P2', 'P3', 'P4'] as const;

export interface Paginated<T> {
  items: T[];
  cursor: string | null;
  total?: number;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  version: string;
  commit?: string;
  checks: Record<string, 'ok' | 'fail' | 'skip'>;
}
