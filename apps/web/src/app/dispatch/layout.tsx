import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/dispatch', label: 'Live board' },
  { href: '/dispatch/incidents', label: 'Incidents' },
  { href: '/dispatch/responders', label: 'Responders' },
  { href: '/dispatch/departments', label: 'Departments' },
  { href: '/dispatch/users', label: 'Users' },
  { href: '/dispatch/analytics', label: 'Analytics' },
  { href: '/dispatch/audit', label: 'Audit log' },
];

export default function DispatchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white px-3 py-6 md:flex">
        <div className="px-3 pb-6 text-sm font-semibold tracking-tight text-zinc-900">
          Plaksha Helpline
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="flex-1 overflow-x-hidden">
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <div className="text-sm font-medium text-zinc-700">Operations console</div>
          <div className="text-xs text-zinc-500">Signed in</div>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
