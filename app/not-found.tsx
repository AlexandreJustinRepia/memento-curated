"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100 flex items-center justify-center">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-gold-400/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
          Error 404
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Page not found
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-400">
          This page doesn't exist or has been moved. Double-check the URL or head
          back to somewhere you know.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
          >
            Back to storefront
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}