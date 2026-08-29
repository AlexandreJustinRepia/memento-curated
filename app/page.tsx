"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Truck, Headphones, User } from "lucide-react";

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
  avg_rating: number | null;
  rating_count: number;
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
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

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
// StarRating helper
// ---------------------------------------------------------------------------
export function StarRating({ value, count }: { value: number | null; count: number }) {
  if (!value || count === 0) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-gold-400 text-xs">★</span>
      <span className="text-xs font-semibold text-zinc-300">{value.toFixed(1)}</span>
      <span className="text-[10px] text-zinc-500">({count})</span>
    </div>
  );
}

function StarRatingInput({ name, value, onChange }: { name: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? "text-gold-400" : "text-zinc-700"
          } hover:text-gold-400`}
        >
          ★
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewQuality, setReviewQuality] = useState(0);
  const [reviewAppearance, setReviewAppearance] = useState(0);
  const [reviewValue, setReviewValue] = useState(0);
  const [reviewMatches, setReviewMatches] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreRef = useRef<HTMLDivElement>(null);
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

  // Infinite scroll loader for products
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 8);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading]);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 8);

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
    window.location.href = "/";
  };

  const userDisplayName = session?.name || session?.email || "User";

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const productId = formData.get("product_id");
    if (!productId) {
      alert("Please select a product");
      return;
    }

    const body = {
      product_id: Number(productId),
      user_id: session?.id || "guest",
      user_name: session?.name || session?.email || "Guest",
      rating: reviewRating,
      quality: reviewQuality,
      appearance: reviewAppearance,
      value_for_money: reviewValue,
      matches_description: reviewMatches,
      comment: formData.get("comment"),
      photos: [],
    };

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to submit review");
      }

      setIsReviewModalOpen(false);
      form.reset();
      setReviewRating(0);
      setReviewQuality(0);
      setReviewAppearance(0);
      setReviewValue(0);
      setReviewMatches(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = displayedProducts.length < filteredProducts.length;

  const scrollToCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("collections");
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

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

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-3 sm:gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              <li>
                <Link
                  href="#"
                  onClick={scrollToCollections}
                  className="hover:text-gold-400 transition-colors"
                >
                  Collections
                </Link>
              </li>

              {!sessionLoading && (
                session ? (
                  <li className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((open) => !open)}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-sm transition hover:border-gold-400/20 hover:bg-gold-400/10"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400/20 text-xs font-bold uppercase text-gold-400">
                        <User className="h-4 w-4" />
                      </span>
                      <span className={`text-xs text-zinc-400 transition ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-[1.5rem] border border-white/10 bg-zinc-900 p-2 shadow-xl backdrop-blur-xl">
                        <div className="border-b border-white/10 pb-2 mb-2 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gold-400" />
                            <p className="truncate text-sm font-medium text-white">{userDisplayName}</p>
                          </div>
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
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-gold-400/10 hover:text-gold-400"
                          >
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.25h15.004c.966 0 1.75-.784 1.75-1.75V19h-2.25a2.25 2.25 0 01-2.25-2.25v-1.5c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v1.5a2.25 2.25 0 01-2.25 2.25H2.751v1.25c0 .966.784 1.75 1.75 1.75z" />
                            </svg>
                            Profile
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
                    {/*
                    <li>
                      <Link
                        href="/signup"
                        className="rounded-full bg-gold-400 px-4 py-2 text-zinc-950 transition hover:bg-gold-400/90"
                      >
                        Sign Up
                      </Link>
                    </li>
                    */}
                  </>
                )
              )}
            </ul>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/30 bg-zinc-900/95 text-gold-400 transition hover:border-gold-400/60 hover:text-gold-400 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="flex flex-col gap-1">
              <span className={`h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-zinc-900/95 backdrop-blur-xl">
            <nav className="container mx-auto px-6 py-4">
              <ul className="space-y-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                <li>
                  <Link
                    href="#"
                    onClick={(e) => { scrollToCollections(e); setMobileMenuOpen(false); }}
                    className="block rounded-2xl px-3 py-3 transition hover:text-gold-400"
                  >
                    Collections
                  </Link>
                </li>

                {!sessionLoading && (
                  session ? (
                    <>
                      {session.role === "admin" && (
                        <li>
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-2xl px-3 py-3 transition hover:text-gold-400"
                          >
                            Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-2xl px-3 py-3 transition hover:text-gold-400"
                        >
                          Profile
                        </Link>
                      </li>
                      <li className="border-t border-white/10 pt-3">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/20 text-xs font-bold uppercase text-gold-400">
                            <User className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{userDisplayName}</p>
                            <p className="text-xs text-zinc-500">{session?.email ?? ""}</p>
                          </div>
                        </div>
                      </li>
                      <li>
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-red-400 transition hover:bg-red-400/10"
                        >
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Sign out
                        </button>
                      </li>
                    </>
                   ) : (
                     <>
                       <li>
                         <Link
                           href="/login"
                           onClick={() => setMobileMenuOpen(false)}
                           className="block rounded-2xl px-3 py-3 transition hover:text-gold-400"
                         >
                           Sign In
                         </Link>
                       </li>
                       {/*
                       <li>
                         <Link
                           href="/signup"
                           onClick={() => setMobileMenuOpen(false)}
                           className="block rounded-2xl px-3 py-3 transition hover:text-gold-400"
                         >
                           Sign Up
                         </Link>
                       </li>
                       */}
                     </>
                   )
                )}
              </ul>
            </nav>
          </div>
        )}
      </header>

      <main className="bg-zinc-950 min-h-[100dvh]">
        {(() => {
          const schemaReviews = products
            .filter((p) => p.avg_rating && p.rating_count > 0)
            .slice(0, 5)
            .map((p) => ({
              "@type": "Review",
              "itemReviewed": {
                "@type": "Product",
                "name": p.name,
                "description": p.description ?? undefined,
                "offers": {
                  "@type": "Offer",
                  "price": p.price,
                  "priceCurrency": "PHP",
                },
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": p.avg_rating,
                "bestRating": 5,
                "worstRating": 1,
              },
              "author": {
                "@type": "Person",
                "name": "Customer",
              },
            }));

          if (schemaReviews.length === 0) return null;

          return (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  "itemListElement": schemaReviews.map((review, idx) => ({
                    "@type": "ListItem",
                    "position": idx + 1,
                    "item": review,
                  })),
                }),
              }}
            />
          );
        })()}
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-[100dvh] flex items-center pt-28 sm:pt-20 overflow-hidden">
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
                    href="#"
                    onClick={scrollToCollections}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gold-400 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all hover:bg-gold-400/90 active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)]"
                  >
                    View Gallery
                  </Link>
                  <Link
                    href="#"
                    onClick={scrollToCollections}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/20 bg-zinc-900/40 text-zinc-200 font-bold uppercase tracking-wider text-xs transition-all hover:border-gold-400/40 hover:text-gold-400 active:scale-[0.98]"
                  >
                    View All Products
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
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                <AnimatePresence mode="popLayout">
                  {displayedProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ ...springConfig }}
                      key={product.id}
                      className="group rounded-3xl bg-zinc-900/40 border border-white/10 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-gold-400/30 transition-colors duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
                    >
                      <Link href={`/product/${product.id}`} className="block">
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
                            {formatCurrency(Number(product.price))}
                          </span>
                        </div>
                        <StarRating value={product.avg_rating} count={product.rating_count} />
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
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Load more sentinel + button */}
              {hasMore && (
                <div className="mt-16 flex flex-col items-center gap-6">
                  <div ref={loadMoreRef} className="h-1 w-full" />
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gold-400 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all hover:bg-gold-400/90 active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)]"
                  >
                    Load More
                  </button>
                  <p className="text-[10px] text-zinc-600">
                    Showing {displayedProducts.length} of {filteredProducts.length} products
                  </p>
                </div>
              )}
              </>
            )}
          </div>
        </section>

        {/* ── Store Services & Ratings Placeholder ────────────────────── */}
        <section className="py-24 border-t border-white/5 bg-zinc-950 relative">
          <div className="container mx-auto px-6 max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold block">
                  Our Services
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100">
                  The Memento Experience
                </h2>
                <div className="w-20 h-[1px] bg-gold-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 space-y-3">
                <div className="text-2xl text-gold-400">
                  <Gem className="w-8 h-8" />
                </div>
                <h3 className="font-sans text-base font-bold text-zinc-100">Handpicked Quality</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Every piece is carefully selected for craftsmanship, materials, and timeless design.</p>
              </div>
              <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 space-y-3">
                <div className="text-2xl text-gold-400">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="font-sans text-base font-bold text-zinc-100">Fast Shipping</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Your jewelry arrives in premium, tamper-proof packaging with full insurance coverage.</p>
              </div>
              <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 space-y-3">
                <div className="text-2xl text-gold-400">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="font-sans text-base font-bold text-zinc-100">Friendly Support</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Get styling advice, gift recommendations, and after-sales support from our team.</p>
              </div>
            </div>

            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="border-t border-b border-white/5 py-12 mb-24">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {[
                  { value: "500+", label: "Happy Customers" },
                  { value: "120+", label: "Curated Products" },
                  { value: "4.8 / 5", label: "Average Rating" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center space-y-2">
                    <p className="text-3xl md:text-4xl font-bold text-gold-400">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Fake Testimonials ──────────────────────────────────────── */}
            <div className="mt-24 mb-16">
              <div className="text-center mb-12 space-y-4">
                <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold block">
                  Testimonials
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100">
                  What Our Customers Say
                </h2>
                <div className="w-20 h-[1px] bg-gold-400 mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Sarah M.",
                    initials: "SM",
                    rating: 5,
                    text: "Absolutely stunning quality. The packaging was beautiful and made the perfect gift. I will definitely be ordering again!",
                    date: "2 weeks ago",
                  },
                  {
                    name: "James R.",
                    initials: "JR",
                    rating: 5,
                    text: "Fast shipping and the craftsmanship is unmatched. The customer service team was incredibly helpful when I needed sizing advice.",
                    date: "1 month ago",
                  },
                  {
                    name: "Elena K.",
                    initials: "EK",
                    rating: 5,
                    text: "I bought a necklace for my wife and she loves it. The attention to detail is remarkable. Highly recommend Memento!",
                    date: "1 month ago",
                  },
                ].map((review, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gold-400/20 flex items-center justify-center text-xs font-bold uppercase text-gold-400">
                        {review.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{review.name}</p>
                        <p className="text-[10px] text-zinc-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= review.rating ? "text-gold-400" : "text-zinc-700"}`}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Auth Modal ───────────────────────────────────────────────── */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Authentication Required</p>
              <h2 className="text-2xl font-semibold text-white">Sign in to write a review</h2>
              <p className="text-sm text-zinc-400">You need an account to share your experience and help other customers.</p>
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400"
                >
                  Create Account
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Review Submission Modal ─────────────────────────────────── */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Write a Review</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Share Your Experience</h2>
                  <p className="mt-2 text-sm text-zinc-400">Rate the product and help other customers make informed decisions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
                >
                  Close
                </button>
              </div>

               <form onSubmit={handleReviewSubmit} className="mt-6 grid gap-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Product</label>
                  <select
                    name="product_id"
                    required
                    defaultValue=""
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  >
                    <option value="" disabled>Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300">Overall Rating</label>
                  <div className="mt-2">
                    <StarRatingInput name="rating" value={reviewRating} onChange={setReviewRating} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Quality</label>
                    <div className="mt-2">
                      <StarRatingInput name="quality" value={reviewQuality} onChange={setReviewQuality} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Appearance</label>
                    <div className="mt-2">
                      <StarRatingInput name="appearance" value={reviewAppearance} onChange={setReviewAppearance} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Value for Money</label>
                    <div className="mt-2">
                      <StarRatingInput name="value_for_money" value={reviewValue} onChange={setReviewValue} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Matches Description</label>
                    <div className="mt-2">
                      <StarRatingInput name="matches_description" value={reviewMatches} onChange={setReviewMatches} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300">Comment</label>
                  <textarea
                    name="comment"
                    rows={3}
                    placeholder="Share your thoughts about the product..."
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300">Review Photos (URLs, comma-separated)</label>
                  <input
                    name="photos"
                    placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-60"
                >
                  {reviewSubmitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        )}
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
