import { randomBytes } from 'node:crypto';

import type { AppConfig } from '@plaksha/shared-config';
import type { Role } from '@plaksha/shared-types';
import * as argon2 from 'argon2';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { APP_CONFIG } from '../../../config/config.module';

export interface AccessClaims {
  sub: string;
  email: string;
  role: Role;
  departmentId: string | null;
  sessionId: string;
  jti: string;
}

@Injectable()
export class TokenService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly jwt: JwtService,
  ) {}

  signAccessToken(claims: AccessClaims): string {
    return this.jwt.sign(claims);
  }

  async verifyAccessToken(token: string): Promise<AccessClaims> {
    return this.jwt.verifyAsync<AccessClaims>(token);
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  async hashRefreshToken(token: string): Promise<string> {
    return argon2.hash(`${this.config.crypto.jwtRefreshSecret}:${token}`, {
      type: argon2.argon2id,
      timeCost: 2,
      memoryCost: 19_456,
      parallelism: 1,
    });
  }

  async verifyRefreshToken(token: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, `${this.config.crypto.jwtRefreshSecret}:${token}`);
  }
}
