import { randomUUID } from 'node:crypto';

import type { AppConfig } from '@plaksha/shared-config';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { APP_CONFIG } from '../../../config/config.module';
import { Session } from '../../../db/models/session.model';

import { TokenService } from './token.service';

interface CreateSessionInput {
  userId: string;
  deviceId?: string | null;
  platform?: 'IOS' | 'ANDROID' | 'WEB' | 'UNKNOWN';
  appVersion?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session) private readonly sessions: typeof Session,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly tokens: TokenService,
  ) {}

  async create(input: CreateSessionInput): Promise<{ session: Session; refreshToken: string }> {
    const refreshToken = this.tokens.generateRefreshToken();
    const refreshTokenHash = await this.tokens.hashRefreshToken(refreshToken);
    const session = await this.sessions.create({
      id: randomUUID(),
      userId: input.userId,
      refreshTokenHash,
      deviceId: input.deviceId ?? null,
      platform: input.platform ?? 'UNKNOWN',
      appVersion: input.appVersion ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt: new Date(Date.now() + this.config.tokens.refreshTtlSeconds * 1000),
      lastUsedAt: new Date(),
    } as Session);
    return { session, refreshToken };
  }

  async findActiveByRefreshToken(refreshToken: string): Promise<Session | null> {
    // We don't have a token hash index for lookup since we use argon2; instead,
    // we look up by recent sessions and verify each. For 500-700 users this is
    // acceptable; if it becomes a hot path we add a HMAC sidecar index.
    const candidates = await this.sessions.findAll({
      where: {
        revokedAt: { [Op.is]: null },
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['lastUsedAt', 'DESC']],
      limit: 200,
    });
    for (const candidate of candidates) {
      // eslint-disable-next-line no-await-in-loop
      if (await this.tokens.verifyRefreshToken(refreshToken, candidate.refreshTokenHash)) {
        return candidate;
      }
    }
    return null;
  }

  async rotate(session: Session): Promise<{ session: Session; refreshToken: string }> {
    await session.update({ revokedAt: new Date(), revokedReason: 'rotated' });
    return this.create({
      userId: session.userId,
      deviceId: session.deviceId,
      platform: session.platform,
      appVersion: session.appVersion,
      ip: session.ip,
      userAgent: session.userAgent,
    });
  }

  async revoke(sessionId: string, reason = 'logout'): Promise<void> {
    await this.sessions.update(
      { revokedAt: new Date(), revokedReason: reason },
      { where: { id: sessionId, revokedAt: { [Op.is]: null } } },
    );
  }

  async revokeAllForUser(userId: string, reason = 'theft_detected'): Promise<void> {
    await this.sessions.update(
      { revokedAt: new Date(), revokedReason: reason },
      { where: { userId, revokedAt: { [Op.is]: null } } },
    );
  }

  async touch(sessionId: string): Promise<void> {
    await this.sessions.update({ lastUsedAt: new Date() }, { where: { id: sessionId } });
  }
}
