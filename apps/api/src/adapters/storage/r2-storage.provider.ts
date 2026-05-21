import type { AppConfig } from '@plaksha/shared-config';
import { Logger } from '@nestjs/common';

import type { SignedUploadUrl, StorageProvider } from './storage.provider';

/**
 * R2 storage adapter — uses the AWS S3 SDK over R2's S3-compatible API.
 * Stubbed signing until the @aws-sdk packages are wired; falls back to mock-style URLs.
 * Phase 6 wires real S3 client + presigned URL when Twilio recordings need persisting.
 */
export class R2StorageProvider implements StorageProvider {
  private readonly logger = new Logger('R2StorageProvider');
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(config: AppConfig) {
    if (!config.storage.r2AccountId || !config.storage.r2AccessKeyId || !config.storage.r2Bucket) {
      throw new Error('R2 storage provider requires R2_* env vars');
    }
    this.bucket = config.storage.r2Bucket;
    this.publicBase = `https://${config.storage.r2AccountId}.r2.cloudflarestorage.com/${this.bucket}`;
  }

  async putObject(opts: { key: string; contentType: string }): Promise<{ url: string }> {
    this.logger.warn(`R2 putObject not yet wired; key=${opts.key} would be uploaded.`);
    return { url: this.publicUrl(opts.key) };
  }

  async signUpload(opts: { key: string; expiresInSeconds?: number }): Promise<SignedUploadUrl> {
    this.logger.warn(`R2 signUpload not yet wired; returning placeholder for key=${opts.key}`);
    return {
      uploadUrl: `${this.publicBase}/${opts.key}`,
      publicUrl: this.publicUrl(opts.key),
      expiresInSeconds: opts.expiresInSeconds ?? 600,
    };
  }

  publicUrl(key: string): string {
    return `${this.publicBase}/${key}`;
  }
}
