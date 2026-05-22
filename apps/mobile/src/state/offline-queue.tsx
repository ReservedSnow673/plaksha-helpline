import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { apiFetch, ApiError } from '@/lib/api';
import { Storage, StorageKeys } from '@/lib/storage';

interface QueuedCommand {
  idempotencyKey: string;
  path: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body: unknown;
  attempts: number;
  enqueuedAt: string;
}

interface OfflineQueueState {
  pendingCount: number;
  enqueue: (
    command: Omit<QueuedCommand, 'attempts' | 'enqueuedAt'>,
  ) => Promise<void>;
}

const OfflineQueueContext = createContext<OfflineQueueState | null>(null);

export function OfflineQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueuedCommand[]>([]);
  const draining = useRef(false);

  useEffect(() => {
    (async () => {
      const raw = await Storage.get(StorageKeys.offlineQueue);
      if (raw) {
        try {
          setQueue(JSON.parse(raw) as QueuedCommand[]);
        } catch {
          setQueue([]);
        }
      }
    })();
  }, []);

  useEffect(() => {
    void Storage.set(StorageKeys.offlineQueue, JSON.stringify(queue));
  }, [queue]);

  const drain = useCallback(async () => {
    if (draining.current) return;
    draining.current = true;
    try {
      for (const cmd of [...queue]) {
        try {
          await apiFetch(cmd.path, {
            method: cmd.method,
            body: JSON.stringify(cmd.body),
            headers: { 'Idempotency-Key': cmd.idempotencyKey },
          });
          setQueue((current) => current.filter((c) => c.idempotencyKey !== cmd.idempotencyKey));
        } catch (err) {
          if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 408) {
            // Permanent failure (validation, auth) — drop the command.
            setQueue((current) => current.filter((c) => c.idempotencyKey !== cmd.idempotencyKey));
            continue;
          }
          // Transient: leave in queue; retry on next attempt.
          setQueue((current) =>
            current.map((c) =>
              c.idempotencyKey === cmd.idempotencyKey ? { ...c, attempts: c.attempts + 1 } : c,
            ),
          );
          break;
        }
      }
    } finally {
      draining.current = false;
    }
  }, [queue]);

  useEffect(() => {
    if (queue.length === 0) return;
    const interval = setInterval(() => {
      void drain();
    }, 5_000);
    void drain();
    return () => clearInterval(interval);
  }, [queue, drain]);

  const enqueue = useCallback(
    async (command: Omit<QueuedCommand, 'attempts' | 'enqueuedAt'>) => {
      const next: QueuedCommand = { ...command, attempts: 0, enqueuedAt: new Date().toISOString() };
      try {
        await apiFetch(command.path, {
          method: command.method,
          body: JSON.stringify(command.body),
          headers: { 'Idempotency-Key': command.idempotencyKey },
        });
      } catch (err) {
        if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 408) {
          throw err;
        }
        setQueue((current) => [...current, next]);
      }
    },
    [],
  );

  const value = useMemo<OfflineQueueState>(
    () => ({ pendingCount: queue.length, enqueue }),
    [queue, enqueue],
  );

  return <OfflineQueueContext.Provider value={value}>{children}</OfflineQueueContext.Provider>;
}

export function useOfflineQueue(): OfflineQueueState {
  const ctx = useContext(OfflineQueueContext);
  if (!ctx) throw new Error('useOfflineQueue must be used inside OfflineQueueProvider');
  return ctx;
}
