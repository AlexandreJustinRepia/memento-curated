"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch session on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data))
      .catch(() => setSession(null));
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
    router.push("/");
  }, [router]);

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

  const userDisplayName = session?.name || session?.email || "Admin";

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* ── Top navbar ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle navigation"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/30 bg-zinc-900/95 text-gold-400 shadow-lg transition hover:border-gold-400/60 hover:text-gold-400 lg:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span className="flex flex-col gap-1">
                <span className={`h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <span className="font-sans font-bold text-lg tracking-[0.25em] uppercase text-gold-400">
                Memento
              </span>
            </Link>
          </div>

          {/* Right: user dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-sm transition hover:border-gold-400/20 hover:bg-gold-400/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400/20 text-xs font-bold uppercase text-gold-400">
                {userDisplayName.charAt(0)}
              </span>
              <span className="hidden sm:inline text-zinc-200">{userDisplayName}</span>
              <span className={`text-xs text-zinc-400 transition ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-[1.5rem] border border-white/10 bg-zinc-900 p-2 shadow-xl backdrop-blur-xl">
                <div className="border-b border-white/10 pb-2 mb-2 px-3 py-2">
                  <p className="truncate text-sm font-medium text-white">{userDisplayName}</p>
                  <p className="truncate text-xs text-zinc-500">{session?.email ?? ""}</p>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-gold-400/10 hover:text-gold-400"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    Storefront
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-red-400/10 hover:text-red-400"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-zinc-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Sidebar + Content ─────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pt-20 sm:px-6 lg:px-8 lg:py-6 lg:pt-24">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-72 rounded-r-[2rem] border-r border-white/10 bg-zinc-900/95 p-4 pt-24 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-24 lg:w-72 lg:self-start lg:translate-x-0 lg:rounded-[2rem] lg:border lg:bg-zinc-900/80 lg:pt-6 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="hidden lg:block">
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
                  <span className={`text-xs transition ${manageOpen ? "rotate-180" : ""}`}>▾</span>
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
                    <span className={`text-xs transition ${manageOpen ? "rotate-180" : ""}`}>▾</span>
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

        <section className="flex-1 space-y-6 pt-0">{children}</section>
      </div>
    </main>
  );
}
