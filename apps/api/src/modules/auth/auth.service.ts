import { randomUUID } from 'node:crypto';

import type { AppConfig } from '@plaksha/shared-config';
import type { AuthTokens } from '@plaksha/shared-types';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { APP_CONFIG } from '../../config/config.module';
import { User } from '../../db/models/user.model';
import { AuditService } from '../audit/audit.service';

import { MagicLinkService } from './services/magic-link.service';
import { SessionsService } from './services/sessions.service';
import { TokenService } from './services/token.service';

interface CompleteContext {
  ip?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
  platform?: 'IOS' | 'ANDROID' | 'WEB' | 'UNKNOWN';
  appVersion?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @InjectModel(User) private readonly users: typeof User,
    private readonly magicLink: MagicLinkService,
    private readonly sessions: SessionsService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async initiateMagicLink(
    email: string,
    ip: string | null,
    platform?: 'IOS' | 'ANDROID' | 'WEB',
  ): Promise<void> {
    await this.magicLink.initiate({ email, ip, platform });
  }

  async completeMagicLink(
    token: string,
    ctx: CompleteContext,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const email = await this.magicLink.consume(token);
    const user = await this.upsertUserByEmail(email);
    return this.issueSession(user, ctx);
  }

  async refresh(
    refreshToken: string,
    ctx: CompleteContext,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const session = await this.sessions.findActiveByRefreshToken(refreshToken);
    if (!session) {
      // Possible token theft — revoke nothing here because we don't know whose token it is.
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findByPk(session.userId);
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('User inactive');
    const { session: newSession, refreshToken: newRefresh } = await this.sessions.rotate(session);
    const access = this.signAccessForSession(user, newSession.id);
    await this.audit.log({
      actorUserId: user.id,
      actorRole: user.role,
      action: 'auth.session.rotated',
      resourceType: 'session',
      resourceId: newSession.id,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return {
      user,
      tokens: {
        accessToken: access,
        refreshToken: newRefresh,
        accessExpiresInSeconds: this.config.tokens.accessTtlSeconds,
        refreshExpiresInSeconds: this.config.tokens.refreshTtlSeconds,
      },
    };
  }

  async logout(sessionId: string, actorUserId: string): Promise<void> {
    await this.sessions.revoke(sessionId, 'logout');
    await this.audit.log({
      actorUserId,
      actorRole: null,
      action: 'auth.logout',
      resourceType: 'session',
      resourceId: sessionId,
    });
  }

  private async upsertUserByEmail(email: string): Promise<User> {
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      if (existing.status === 'SUSPENDED') {
        throw new UnauthorizedException('Account suspended');
      }
      if (!existing.emailVerifiedAt) {
        await existing.update({ emailVerifiedAt: new Date() });
      }
      return existing;
    }
    const [local] = email.split('@');
    const created = await this.users.create({
      email,
      emailVerifiedAt: new Date(),
      firstName: local ? local.replace(/[._-]+/g, ' ').slice(0, 50) : 'New',
      lastName: 'User',
      role: 'STUDENT',
      status: 'ACTIVE',
      preferredLanguage: 'en',
    } as User);
    return created;
  }

  private async issueSession(
    user: User,
    ctx: CompleteContext,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const { session, refreshToken } = await this.sessions.create({
      userId: user.id,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
      deviceId: ctx.deviceId ?? null,
      platform: ctx.platform ?? 'UNKNOWN',
      appVersion: ctx.appVersion ?? null,
    });
    const accessToken = this.signAccessForSession(user, session.id);
    await this.audit.log({
      actorUserId: user.id,
      actorRole: user.role,
      action: 'auth.session.created',
      resourceType: 'session',
      resourceId: session.id,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        accessExpiresInSeconds: this.config.tokens.accessTtlSeconds,
        refreshExpiresInSeconds: this.config.tokens.refreshTtlSeconds,
      },
    };
  }

  private signAccessForSession(user: User, sessionId: string): string {
    return this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      sessionId,
      jti: randomUUID(),
    });
  }
}
