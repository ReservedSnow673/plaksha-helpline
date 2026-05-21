import type { AppConfig } from '@plaksha/shared-config';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { APP_CONFIG } from '../../../config/config.module';

export interface OidcUser {
  oid: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Microsoft Entra ID OIDC service.
 *
 * Phase 1: feature-flagged off (`MS_AUTH_ENABLED=false`). When enabled, this service
 * issues PKCE authorization URLs and exchanges codes for tokens against Plaksha's tenant.
 *
 * The full OIDC dance (state storage, PKCE verifier, jwks key rotation, token validation)
 * is intentionally deferred to Phase 2 when credentials are available — the surface
 * remains stable so the swap is a one-line config flip.
 */
@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  isEnabled(): boolean {
    return this.config.msAuth.enabled === true;
  }

  buildAuthorizeUrl(state: string): string {
    if (!this.isEnabled()) {
      throw new BadRequestException('Microsoft authentication is not enabled');
    }
    const { tenantId, clientId, redirectUri } = this.config.msAuth;
    if (!tenantId || !clientId || !redirectUri) {
      throw new BadRequestException('MS_* env vars incomplete');
    }
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: 'openid profile email offline_access',
      state,
    });
    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async exchangeCode(_code: string): Promise<OidcUser> {
    if (!this.isEnabled()) {
      throw new BadRequestException('Microsoft authentication is not enabled');
    }
    this.logger.warn('OIDC code exchange invoked before Phase 2 implementation; returning stub error.');
    throw new BadRequestException('Microsoft OIDC code exchange not yet implemented');
  }
}
