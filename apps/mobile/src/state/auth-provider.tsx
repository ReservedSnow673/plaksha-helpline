import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { ApiError, apiFetch } from '@/lib/api';
import { config } from '@/lib/config';
import { Storage, StorageKeys } from '@/lib/storage';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestMagicLink: (email: string) => Promise<void>;
  completeMagicLink: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await Storage.get(StorageKeys.user);
      if (stored) {
        try {
          setUser(JSON.parse(stored) as AuthUser);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const requestMagicLink = useCallback(async (email: string) => {
    const res = await fetch(`${config.apiBaseUrl}/v1/auth/magic-link/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      }),
    });
    if (!res.ok) {
      const message = await res.text();
      throw new ApiError(message || res.statusText, res.status);
    }
  }, []);

  const completeMagicLink = useCallback(async (_email: string, token: string) => {
    const res = await fetch(`${config.apiBaseUrl}/v1/auth/magic-link/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || res.statusText, res.status);
    }
    const body = (await res.json()) as {
      data: {
        tokens: { accessToken: string; refreshToken: string };
        user: AuthUser;
      };
    };
    await Storage.setSecure(StorageKeys.accessToken, body.data.tokens.accessToken);
    await Storage.setSecure(StorageKeys.refreshToken, body.data.tokens.refreshToken);
    await Storage.set(StorageKeys.user, JSON.stringify(body.data.user));
    setUser(body.data.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/v1/auth/logout', { method: 'POST', body: JSON.stringify({}) });
    } catch {
      // ignore; we still clear local state
    }
    await Storage.deleteSecure(StorageKeys.accessToken);
    await Storage.deleteSecure(StorageKeys.refreshToken);
    await Storage.delete(StorageKeys.user);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      requestMagicLink,
      completeMagicLink,
      signOut,
    }),
    [user, isLoading, requestMagicLink, completeMagicLink, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
