import { Rooms, WsEvent } from '@plaksha/shared-events';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { TokenService } from '../auth/services/token.service';

@WebSocketGateway({ namespace: '/', cors: { origin: true, credentials: true } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly tokens: TokenService) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const token = extractToken(socket);
      if (!token) throw new Error('missing token');
      const claims = await this.tokens.verifyAccessToken(token);
      socket.principal = {
        userId: claims.sub,
        email: claims.email,
        role: claims.role,
        departmentId: claims.departmentId,
        sessionId: claims.sessionId,
      };
      const rooms: string[] = [Rooms.user(claims.sub)];
      if (claims.role === 'ADMIN' || claims.role === 'SUPER_ADMIN' || claims.role === 'DISPATCHER') {
        rooms.push(Rooms.adminOverview());
      }
      if (claims.departmentId) {
        if (claims.role === 'RESPONDER') rooms.push(Rooms.deptOnDuty(claims.departmentId));
        rooms.push(Rooms.deptDispatch(claims.departmentId));
      }
      socket.join(rooms);
      socket.emit(WsEvent.SessionReady, {
        userId: claims.sub,
        rooms,
        serverTime: new Date().toISOString(),
      });
      this.logger.debug(`ws connected user=${claims.sub} rooms=${rooms.join(',')}`);
    } catch (err) {
      this.logger.debug(`ws rejected: ${(err as Error).message}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket): void {
    if (socket.principal) {
      this.logger.debug(`ws disconnected user=${socket.principal.userId}`);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(WsEvent.ClientHeartbeat)
  heartbeat(@ConnectedSocket() socket: Socket): void {
    socket.emit(WsEvent.Heartbeat, { serverTime: new Date().toISOString() });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(WsEvent.ClientLocation)
  clientLocation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { lat: number; lng: number; accuracyM?: number | null },
  ): void {
    // The HTTP /me/responder/location endpoint is the canonical write path; this
    // socket message exists for low-latency intra-shift updates. For now we just
    // ack — Phase 3 wires this into RespondersService directly.
    socket.emit(WsEvent.Heartbeat, { received: body, at: new Date().toISOString() });
  }

  broadcast(rooms: string[], event: string, payload: unknown): void {
    if (rooms.length === 0) return;
    this.server.to(rooms).emit(event, payload);
  }
}

function extractToken(socket: Socket): string | null {
  const auth = socket.handshake.auth as { token?: string } | undefined;
  if (auth?.token) return auth.token;
  const headerAuth = socket.handshake.headers.authorization;
  if (typeof headerAuth === 'string' && headerAuth.startsWith('Bearer ')) {
    return headerAuth.slice('Bearer '.length).trim();
  }
  const url = new URL(`${socket.handshake.url}`, 'http://placeholder');
  return url.searchParams.get('token');
}
