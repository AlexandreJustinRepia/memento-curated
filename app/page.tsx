"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number;
};

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { ...springConfig } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
function ProductSkeleton() {
  return (
    <div className="rounded-3xl bg-zinc-900/40 border border-white/10 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-zinc-800" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-zinc-800 rounded-full w-3/4" />
        <div className="h-3 bg-zinc-800 rounded-full w-full" />
        <div className="h-3 bg-zinc-800 rounded-full w-5/6" />
        <div className="h-9 bg-zinc-800 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder image when no image_url is set
// ---------------------------------------------------------------------------
function NoImage({ name }: { name: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-zinc-900 text-zinc-600">
      <svg
        className="h-12 w-12 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs uppercase tracking-widest opacity-50 text-center px-4 leading-relaxed">
        {name}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLLIElement>(null);

  // Check auth status on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
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

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
    window.location.href = "/";
  };

  const userDisplayName = session?.name || session?.email || "User";

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Build category list dynamically from fetched products
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))).sort(),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center max-w-[1400px]">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-sans font-bold text-xl tracking-[0.25em] uppercase text-gold-400">
              Memento
            </span>
          </Link>
          <nav>
            <ul className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              <li>
                <Link
                  href="#collections"
                  className="hover:text-gold-400 transition-colors"
                >
                  Collections
                </Link>
              </li>

              {/* Auth — dropdown when logged in, buttons when logged out */}
              {!sessionLoading && (
                session ? (
                  <li className="relative" ref={userMenuRef}>
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
                          {session.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-gold-400/10 hover:text-gold-400"
                            >
                              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                              </svg>
                              Dashboard
                            </Link>
                          )}
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
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className="rounded-full border border-gold-400/40 px-4 py-2 text-gold-400 transition hover:bg-gold-400/10"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className="rounded-full bg-gold-400 px-4 py-2 text-zinc-950 transition hover:bg-gold-400/90"
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="bg-zinc-950 min-h-[100dvh]">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-radial from-gold-400/5 to-transparent rounded-full blur-[140px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-radial from-zinc-800/10 to-transparent rounded-full blur-[100px] -z-10" />

          <div className="container mx-auto px-6 max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

              {/* Left column */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="lg:col-span-7 flex flex-col items-start space-y-8"
              >
                <motion.span
                  variants={fadeInUp}
                  className="font-mono text-gold-400 uppercase tracking-[0.25em] text-xs font-semibold"
                >
                  Memento Curated
                </motion.span>

                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tighter leading-none text-zinc-100"
                >
                  Luxury within <br />
                  <span className="text-gold-400 relative inline-block">
                    your reach.
                    <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gold-400/30" />
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-[60ch]"
                >
                  Jewelry is more than just an accessory—it&apos;s a way to express
                  yourself and celebrate life&apos;s special moments. We handpick
                  stylish and timeless pieces offering the perfect balance of
                  quality, elegance, and affordability.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap gap-4 pt-2"
                >
                  <Link
                    href="#collections"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gold-400 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all hover:bg-gold-400/90 active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)]"
                  >
                    View Gallery
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right column — floating logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="lg:col-span-5 relative w-full aspect-square flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gold-400/5 blur-[120px] rounded-full -z-10" />
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-[80%] h-[80%] border border-gold-400/15 rounded-full -z-10"
                />
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[85%] max-w-[420px] flex justify-center"
                >
                  <Image
                    src="/logo.png"
                    alt="Memento Curated jewelry"
                    width={500}
                    height={500}
                    className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                  />
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Collections ───────────────────────────────────────────────── */}
        <section
          id="collections"
          className="py-24 border-t border-white/5 bg-zinc-950 relative"
        >
          <div className="container mx-auto px-6 max-w-[1400px]">

            {/* Section header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold block">
                  Curated Catalog
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100">
                  Timeless Treasures
                </h2>
                <div className="w-20 h-[1px] bg-gold-400" />
              </div>

              {/* Category filters — built from real data */}
              <div className="lg:col-span-5 flex flex-wrap gap-2 justify-start lg:justify-end">
                {loading
                  ? ["All", "Rings", "Necklaces"].map((c) => (
                      <div
                        key={c}
                        className="h-8 w-20 animate-pulse rounded-full bg-zinc-800"
                      />
                    ))
                  : categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                          selectedCategory === cat
                            ? "bg-gold-400 text-zinc-950 shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
                            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-zinc-500 text-sm">
                  {products.length === 0
                    ? "No products in the catalog yet."
                    : `No products in "${selectedCategory}".`}
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ ...springConfig }}
                      key={product.id}
                      className="group rounded-3xl bg-zinc-900/40 border border-white/10 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-gold-400/30 transition-colors duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <NoImage name={product.name} />
                        )}
                        <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-gold-400">
                          {product.category}
                        </div>
                        {product.stock === 0 && (
                          <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white">
                            Sold out
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-sans text-base font-bold text-zinc-100 group-hover:text-gold-400 transition-colors duration-300 line-clamp-1">
                            {product.name}
                          </h3>
                          <span className="font-mono text-sm font-semibold text-gold-400 shrink-0">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                        <button
                          disabled={product.stock === 0}
                          className="w-full mt-4 h-10 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-gold-400 hover:text-zinc-950 hover:border-transparent active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {product.stock === 0 ? "Out of stock" : "Request Details"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-zinc-950 py-16 border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-[1400px]">
          <span className="font-sans font-bold text-base tracking-[0.25em] uppercase text-gold-400 block mb-6">
            Memento Curated
          </span>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Memento Curated. Crafted with timeless
            sophistication. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
