import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="space-y-6">
        <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
          Plaksha University · Internal Tool
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-5xl">
          Universal Campus Helpline Operations Console
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
          Real-time incident triage, responder dispatch, and audit for the unified
          Plaksha emergency response platform. Sign in with your institutional email
          to continue.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Sign in to console
          </Link>
          <Link
            href="/status"
            className="inline-flex h-11 items-center rounded-md border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-300"
          >
            System status
          </Link>
        </div>
        <p className="pt-12 text-sm text-zinc-500">
          For emergencies on campus, dial the unified helpline number printed on
          your ID card or use the mobile app SOS button.
        </p>
      </div>
    </main>
  );
}
