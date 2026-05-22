import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Plaksha Helpline · Operations Console',
  description:
    'Unified incident response console for Plaksha University Universal Campus Helpline.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-zinc-50 text-zinc-900 antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
