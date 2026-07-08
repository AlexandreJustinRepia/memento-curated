import Link from "next/link";

export default function ProductsPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-zinc-950 px-4 py-4 text-zinc-100 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
        <section className="flex-1 space-y-6 pt-20 lg:pt-0">
          <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Products</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Manage your collection
                </h1>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  A placeholder page for products until the full product catalog is ready.
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Back to dashboard
              </Link>
            </div>
          </header>

          <section className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-zinc-950/80 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-400">Coming soon</p>
              <h2 className="mt-4 text-xl font-semibold text-white">Products management is on the way</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Use this page to launch new product collections, manage inventory, and configure pricing once ready.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
