export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function domainOf(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

export function isInstitutionalEmail(email: string, allowedDomain: string): boolean {
  const d = domainOf(email);
  if (!d) return false;
  return d === allowedDomain.toLowerCase();
}
