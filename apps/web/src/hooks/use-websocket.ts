'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface IncomingWsEvent {
  type: string;
  payload: unknown;
  occurredAt: string;
}

interface Options {
  token: string | null;
  rooms?: string[];
}

export function useWebSocket({ token, rooms = [] }: Options) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<IncomingWsEvent[]>([]);

  useEffect(() => {
    if (!token) return;
    const url = process.env.NEXT_PUBLIC_WS_BASE_URL ?? '';
    if (!url) return;

    const socket: Socket = io(url, {
      path: '/ws',
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 15_000,
    });

    socket.on('connect', () => {
      setConnected(true);
      for (const room of rooms) socket.emit('subscribe', { room });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.onAny((type: string, payload: unknown) => {
      setEvents((current) => [
        { type, payload, occurredAt: new Date().toISOString() },
        ...current.slice(0, 199),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, rooms]);

  return { connected, events };
}
