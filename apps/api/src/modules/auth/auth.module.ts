import type { AppConfig } from '@plaksha/shared-config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { APP_CONFIG } from '../../config/config.module';
import { MagicLinkToken } from '../../db/models/magic-link-token.model';
import { Session } from '../../db/models/session.model';
import { User } from '../../db/models/user.model';
import { AuditModule } from '../audit/audit.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { MagicLinkService } from './services/magic-link.service';
import { OidcService } from './services/oidc.service';
import { SessionsService } from './services/sessions.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Session, MagicLinkToken]),
    JwtModule.registerAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.crypto.jwtAccessSecret,
        signOptions: { expiresIn: config.tokens.accessTtlSeconds },
      }),
    }),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    SessionsService,
    MagicLinkService,
    OidcService,
    RolesGuard,
    JwtAuthGuard,
    WsAuthGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    SessionsService,
    RolesGuard,
    JwtAuthGuard,
    WsAuthGuard,
  ],
})
export class AuthModule {}
