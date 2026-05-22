'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'plaksha.auth.tokens';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export function useAuth(): { token: string | null; clear: () => void } {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredTokens;
        setToken(parsed.accessToken);
      } catch {
        setToken(null);
      }
    }
  }, []);

  return {
    token,
    clear: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setToken(null);
    },
  };
}
