import { Logger } from '@nestjs/common';

import type { SignedUploadUrl, StorageProvider } from './storage.provider';

export class MockStorageProvider implements StorageProvider {
  private readonly logger = new Logger('MockStorageProvider');

  async putObject(opts: { key: string; contentType: string }): Promise<{ url: string }> {
    this.logger.log(`MOCK PUT key=${opts.key} contentType=${opts.contentType}`);
    return { url: this.publicUrl(opts.key) };
  }

  async signUpload(opts: { key: string; expiresInSeconds?: number }): Promise<SignedUploadUrl> {
    const exp = opts.expiresInSeconds ?? 600;
    return {
      uploadUrl: `mock://upload/${opts.key}?expires=${exp}`,
      publicUrl: this.publicUrl(opts.key),
      expiresInSeconds: exp,
    };
  }

  publicUrl(key: string): string {
    return `mock://objects/${key}`;
  }
}
