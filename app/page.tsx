"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Mock initial products
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Aurelia Pearl Drop Earrings",
    category: "Earrings",
    price: "$189",
    image: "https://picsum.photos/seed/earring1/600/800",
    description: "18k gold plated drop earrings featuring freshwater cultured pearls.",
  },
  {
    id: 2,
    name: "Helios Chunky Ring",
    category: "Rings",
    price: "$145",
    image: "https://picsum.photos/seed/ring1/600/800",
    description: "Bold textured band in solid sterling silver plated with 24k gold.",
  },
  {
    id: 3,
    name: "Selene Link Choker",
    category: "Necklaces",
    price: "$270",
    image: "https://picsum.photos/seed/neck1/600/800",
    description: "Handcrafted interlocking gold links reflecting classic sophistication.",
  },
  {
    id: 4,
    name: "Solstice Cuff Bracelet",
    category: "Bracelets",
    price: "$310",
    image: "https://picsum.photos/seed/brace1/600/800",
    description: "Minimalist open-cuff bracelet with polished geometric finishes.",
  },
];

// Spring physics definitions for premium weight
const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { ...springConfig }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Rings", "Necklaces", "Bracelets", "Earrings"];

  const filteredProducts = selectedCategory === "All"
    ? INITIAL_PRODUCTS
    : INITIAL_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <>
      {/* Sticky Header with Liquid Glass style */}
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
                <Link href="#collections" className="hover:text-gold-400 transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/login" className="rounded-full border border-gold-400/40 px-4 py-2 text-gold-400 transition hover:bg-gold-400/10">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="rounded-full bg-gold-400 px-4 py-2 text-zinc-950 transition hover:bg-gold-400/90">
                  Sign Up
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="bg-zinc-950 min-h-[100dvh]">
        {/* Split Screen Hero Section */}
        <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
          {/* Subtle Shading Background Glows */}
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-radial from-gold-400/5 to-transparent rounded-full blur-[140px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-radial from-zinc-800/10 to-transparent rounded-full blur-[100px] -z-10" />

          <div className="container mx-auto px-6 max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Left Column (Content with stagger entrance) */}
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
                  Jewelry is more than just an accessory—it's a way to express yourself and celebrate life's special moments. We handpick stylish and timeless pieces offering the perfect balance of quality, elegance, and affordability.
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
              
              {/* Right Column (Pulsing / Floating Logo) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="lg:col-span-5 relative w-full aspect-square flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gold-400/5 blur-[120px] rounded-full -z-10" />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute w-[80%] h-[80%] border border-gold-400/15 rounded-full -z-10" 
                />
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
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

        {/* Product Showcase Section */}
        <section id="collections" className="py-24 border-t border-white/5 bg-zinc-950 relative">
          <div className="container mx-auto px-6 max-w-[1400px]">
            
            {/* Split Grid Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold block">Curated Catalog</span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100">Timeless Treasures</h2>
                <div className="w-20 h-[1px] bg-gold-400" />
              </div>
              <div className="lg:col-span-5 flex flex-wrap gap-2 justify-start lg:justify-end">
                {categories.map((cat) => (
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

            {/* Showcase Grid with AnimatePresence */}
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
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-gold-400">
                        {product.category}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-sans text-base font-bold text-zinc-100 group-hover:text-gold-400 transition-colors duration-300 line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="font-mono text-sm font-semibold text-gold-400 shrink-0">
                          {product.price}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      <button className="w-full mt-4 h-10 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-gold-400 hover:text-zinc-950 hover:border-transparent active:scale-[0.98]">
                        Request Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 py-16 border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-[1400px]">
          <span className="font-sans font-bold text-base tracking-[0.25em] uppercase text-gold-400 block mb-6">
            Memento Curated
          </span>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Memento Curated. Crafted with timeless sophistication. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
