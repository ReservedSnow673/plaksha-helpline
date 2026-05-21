export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface SignedUploadUrl {
  uploadUrl: string;
  publicUrl: string;
  fields?: Record<string, string>;
  expiresInSeconds: number;
}

export interface StorageProvider {
  putObject(opts: {
    key: string;
    body: Buffer | Uint8Array | string;
    contentType: string;
  }): Promise<{ url: string }>;
  signUpload(opts: { key: string; contentType: string; expiresInSeconds?: number }): Promise<SignedUploadUrl>;
  publicUrl(key: string): string;
}
