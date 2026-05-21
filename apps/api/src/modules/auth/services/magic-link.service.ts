import { createHash, randomBytes } from 'node:crypto';

import type { AppConfig } from '@plaksha/shared-config';
import { domainOf, isInstitutionalEmail, normalizeEmail } from '@plaksha/shared-utils';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { EMAIL_PROVIDER, type EmailProvider } from '../../../adapters/email/email.provider';
import { APP_CONFIG } from '../../../config/config.module';
import { MagicLinkToken } from '../../../db/models/magic-link-token.model';
import { ResourceNotFoundError } from '../../../common/exceptions';

@Injectable()
export class MagicLinkService {
  private readonly logger = new Logger(MagicLinkService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @InjectModel(MagicLinkToken) private readonly tokens: typeof MagicLinkToken,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
  ) {}

  hash(token: string): string {
    return createHash('sha256').update(`${this.config.crypto.magicLinkPepper}:${token}`).digest('hex');
  }

  async initiate(input: {
    email: string;
    ip?: string | null;
    platform?: 'IOS' | 'ANDROID' | 'WEB';
  }): Promise<void> {
    const email = normalizeEmail(input.email);
    if (!isInstitutionalEmail(email, this.config.allowedInstitutionalDomain)) {
      throw new BadRequestException({
        type: 'about:blank',
        title: 'Email domain not allowed',
        status: 400,
        detail: `Only ${this.config.allowedInstitutionalDomain} emails are permitted.`,
      });
    }

    // Throttle: at most one active token per email per 30 seconds.
    const recent = await this.tokens.findOne({
      where: { email, consumedAt: { [Op.is]: null }, createdAt: { [Op.gt]: new Date(Date.now() - 30_000) } },
    });
    if (recent) {
      this.logger.debug(`magic-link throttled email=${maskedEmail(email)}`);
      return;
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hash(token);
    const expiresAt = new Date(Date.now() + this.config.tokens.magicLinkTtlMinutes * 60_000);

    await this.tokens.create({
      email,
      tokenHash,
      expiresAt,
      ip: input.ip ?? null,
      attempts: 0,
    } as MagicLinkToken);

    const link = buildMagicLinkUrl(this.config, email, token, input.platform ?? 'WEB');
    await this.email.send({
      to: email,
      subject: 'Your Plaksha Helpline sign-in link',
      text: `Sign in to Plaksha Helpline:\n\n${link}\n\nThis link expires in ${this.config.tokens.magicLinkTtlMinutes} minutes. If you did not request this, you can safely ignore this email.`,
      html: renderMagicLinkHtml(link, this.config.tokens.magicLinkTtlMinutes),
      tags: { kind: 'magic_link' },
    });

    this.logger.log(`magic-link issued email=${maskedEmail(email)} domain=${domainOf(email)}`);
  }

  /** Verifies and consumes a magic-link token. Returns the verified email. */
  async consume(token: string): Promise<string> {
    const tokenHash = this.hash(token);
    const record = await this.tokens.findOne({ where: { tokenHash } });
    if (!record) throw new ResourceNotFoundError('Magic link');
    if (record.consumedAt) throw new BadRequestException('Link already used');
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Link expired');
    }
    await record.update({ consumedAt: new Date(), attempts: record.attempts + 1 });
    return record.email;
  }
}

function buildMagicLinkUrl(
  config: AppConfig,
  email: string,
  token: string,
  platform: 'IOS' | 'ANDROID' | 'WEB',
): string {
  const encodedToken = encodeURIComponent(token);
  const encodedEmail = encodeURIComponent(email);
  if (platform === 'WEB') {
    return `${config.webBaseUrl}/auth/magic?token=${encodedToken}`;
  }
  return `plakshahelpline://auth/complete?token=${encodedToken}&email=${encodedEmail}`;
}

function maskedEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local!.slice(0, 2)}***@${domain}`;
}

function renderMagicLinkHtml(link: string, ttlMinutes: number): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0a0a0a;color:#fafafa;padding:32px">
  <div style="max-width:480px;margin:auto;background:#171717;border:1px solid #262626;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 12px 0;font-size:20px">Sign in to Plaksha Helpline</h1>
    <p style="color:#a3a3a3;line-height:1.5">Click the button below to sign in. This link is valid for ${ttlMinutes} minutes and can only be used once.</p>
    <p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Sign in</a></p>
    <p style="color:#737373;font-size:13px">Or open this URL:<br/><span style="word-break:break-all">${link}</span></p>
    <hr style="border:0;border-top:1px solid #262626;margin:24px 0"/>
    <p style="color:#737373;font-size:12px">If you did not request this, ignore this email. Your account remains safe.</p>
  </div>
</body></html>`;
}
