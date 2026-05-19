import type { ISODateString, Language, UUID } from './common';
import type { Role } from './rbac';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: UUID;
  email: string;
  emailVerifiedAt: ISODateString | null;
  microsoftOid: string | null;
  firstName: string;
  lastName: string;
  phoneE164: string | null;
  preferredLanguage: Language;
  role: Role;
  departmentId: UUID | null;
  status: UserStatus;
  lastActiveAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SessionInfo {
  id: UUID;
  userId: UUID;
  deviceId: string | null;
  platform: 'IOS' | 'ANDROID' | 'WEB' | 'UNKNOWN';
  appVersion: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: ISODateString;
  expiresAt: ISODateString;
  lastUsedAt: ISODateString;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSeconds: number;
  refreshExpiresInSeconds: number;
}

export interface AuthenticatedUser {
  user: User;
  tokens: AuthTokens;
}
