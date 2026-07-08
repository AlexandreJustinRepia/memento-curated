"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const activeSection = useMemo(() => {
    const path = pathname ?? "";

    if (path.startsWith("/admin/products")) return "products";
    if (path.startsWith("/admin/users")) return "users";
    return "dashboard";
  }, [pathname]);

  const manageOpen = isManageOpen || activeSection === "users" || activeSection === "products";

  const handleLinkClick = (section: string) => {
    setIsMenuOpen(false);
    if (section === "dashboard") {
      setIsManageOpen(false);
    }
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-zinc-950 px-4 py-4 text-zinc-100 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
        {isMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-zinc-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <button
          type="button"
          aria-label="Toggle navigation"
          className="fixed left-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/30 bg-zinc-900/95 text-gold-400 shadow-lg backdrop-blur-xl transition hover:border-gold-400/60 hover:text-gold-400 lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-72 rounded-r-[2rem] border-r border-white/10 bg-zinc-900/95 p-4 pt-20 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-4 lg:w-72 lg:self-start lg:translate-x-0 lg:rounded-[2rem] lg:border lg:bg-zinc-900/80 lg:pt-4 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Admin</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Memento Curated</h2>
            </div>
          </div>

          <nav className="mt-6 hidden lg:block">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin"
                  onClick={() => handleLinkClick("dashboard")}
                  className={`flex items-center rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                    activeSection === "dashboard"
                      ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                      : "border-transparent text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                  }`}
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => setIsManageOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-zinc-300 transition hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                >
                  <span>Manage</span>
                  <span className="text-xs">▾</span>
                </button>
              </li>

              {manageOpen && (
                <li className="space-y-2 px-2">
                  <Link
                    href="/admin/users"
                    onClick={() => handleLinkClick("users")}
                    className={`block rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                      activeSection === "users"
                        ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                        : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={() => handleLinkClick("products")}
                    className={`block rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                      activeSection === "products"
                        ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                        : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                    }`}
                  >
                    Products
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {isMenuOpen && (
            <nav className="mt-4 lg:hidden">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/admin"
                    onClick={() => handleLinkClick("dashboard")}
                    className={`flex items-center rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                      activeSection === "dashboard"
                        ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                        : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsManageOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-3 py-3 text-sm font-medium text-zinc-300 transition hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                  >
                    Manage
                    <span className="text-xs">▾</span>
                  </button>
                </li>

                {manageOpen && (
                  <li className="space-y-2 px-2">
                    <Link
                      href="/admin/users"
                      onClick={() => handleLinkClick("users")}
                      className={`block rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        activeSection === "users"
                          ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                          : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/products"
                      onClick={() => handleLinkClick("products")}
                      className={`block rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        activeSection === "products"
                          ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                          : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                      }`}
                    >
                      Products
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-sm font-semibold text-white">Store status</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Your storefront is ready for new launches, campaigns, and customer moments.
            </p>
          </div>
        </aside>

        <section className="flex-1 space-y-6 pt-20 lg:pt-0">{children}</section>
      </div>
    </main>
  );
}
