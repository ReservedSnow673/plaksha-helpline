import { randomUUID } from 'node:crypto';

import {
  MagicLinkCompleteSchema,
  MagicLinkInitiateSchema,
  OidcCallbackSchema,
  RefreshTokenSchema,
} from '@plaksha/shared-schemas';
import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { AuthService } from './auth.service';
import { OidcService } from './services/oidc.service';

function pickIp(req: Request): string | null {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0]?.trim() ?? null;
  return req.ip ?? null;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly oidc: OidcService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('magic-link/initiate')
  @HttpCode(204)
  async initiate(
    @Req() req: Request,
    @Body(ZodBody(MagicLinkInitiateSchema))
    input: { email: string; platform?: 'IOS' | 'ANDROID' | 'WEB' },
  ): Promise<void> {
    await this.auth.initiateMagicLink(input.email, pickIp(req), input.platform);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('magic-link/complete')
  async complete(
    @Req() req: Request,
    @Body(ZodBody(MagicLinkCompleteSchema))
    input: { token: string; deviceId?: string; platform?: 'IOS' | 'ANDROID' | 'WEB'; appVersion?: string },
  ) {
    const { user, tokens } = await this.auth.completeMagicLink(input.token, {
      ip: pickIp(req),
      userAgent: req.headers['user-agent'] ?? null,
      deviceId: input.deviceId ?? null,
      platform: input.platform ?? 'WEB',
      appVersion: input.appVersion ?? null,
    });
    return { data: { user: presentUser(user), tokens } };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body(ZodBody(RefreshTokenSchema)) input: { refreshToken: string },
  ) {
    const { user, tokens } = await this.auth.refresh(input.refreshToken, {
      ip: pickIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: { user: presentUser(user), tokens } };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@CurrentUser() principal: RequestPrincipal): Promise<void> {
    await this.auth.logout(principal.sessionId, principal.userId);
  }

  @Get('me')
  me(@CurrentUser() principal: RequestPrincipal) {
    return { data: { principal } };
  }

  @Public()
  @Get('oidc/start')
  oidcStart() {
    const state = randomUUID();
    const url = this.oidc.buildAuthorizeUrl(state);
    return { data: { url, state } };
  }

  @Public()
  @Post('oidc/callback')
  async oidcCallback(@Body(ZodBody(OidcCallbackSchema)) input: { code: string; state: string }) {
    const user = await this.oidc.exchangeCode(input.code);
    return { data: { stub: true, user } };
  }
}

function presentUser(u: { id: string; email: string; firstName: string; lastName: string; role: string; departmentId: string | null; preferredLanguage: string }) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    departmentId: u.departmentId,
    preferredLanguage: u.preferredLanguage,
  };
}
