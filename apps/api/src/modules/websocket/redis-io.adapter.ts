import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;

  constructor(app: unknown, private readonly redisUrl: string) {
    super(app as never);
  }

  async connectToRedis(): Promise<void> {
    this.pubClient = new Redis(this.redisUrl);
    this.subClient = this.pubClient.duplicate();
    await Promise.all([
      new Promise<void>((res, rej) => {
        this.pubClient!.once('ready', res);
        this.pubClient!.once('error', rej);
      }),
      new Promise<void>((res, rej) => {
        this.subClient!.once('ready', res);
        this.subClient!.once('error', rej);
      }),
    ]);
  }

  override createIOServer(port: number, options?: ServerOptions): unknown {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: true, credentials: true },
      transports: ['websocket', 'polling'],
      pingInterval: 20_000,
      pingTimeout: 25_000,
      maxHttpBufferSize: 1_000_000,
    });
    if (this.pubClient && this.subClient) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (server as any).adapter(createAdapter(this.pubClient, this.subClient));
    }
    return server;
  }
}
