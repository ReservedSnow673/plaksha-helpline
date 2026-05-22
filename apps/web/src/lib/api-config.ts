/**
 * Browser: use same-origin `/api` (Next.js rewrite → Nest on :4000) so sign-in works
 * when only port 3000 is forwarded or CORS would block cross-origin calls.
 * Server: call the API directly via API_BASE_URL.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    return configured && configured.length > 0 ? configured : '/api';
  }
  return configured || process.env.API_BASE_URL || 'http://localhost:4000';
}
