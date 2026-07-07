"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function Home() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Rings");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");

  const categories = ["All", "Rings", "Necklaces", "Bracelets", "Earrings"];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const newProduct = {
      id: products.length + 1,
      name: newProductName,
      category: newProductCategory,
      price: newProductPrice.startsWith("$") ? newProductPrice : `$${newProductPrice}`,
      image: `https://picsum.photos/seed/${newProductName.replace(/\s+/g, "").toLowerCase()}/600/800`,
      description: newProductDesc || "Timeless custom piece carefully handpicked for your collection.",
    };

    setProducts([newProduct, ...products]);
    
    // Reset Form
    setNewProductName("");
    setNewProductPrice("");
    setNewProductDesc("");
    setShowAddForm(false);
  };

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
            <ul className="flex gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              <li>
                <Link href="#collections" className="hover:text-gold-400 transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="#add-piece" className="hover:text-gold-400 transition-colors">
                  Add Piece
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
              
              {/* Left Column (Content) */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-8">
                <span className="font-mono text-gold-400 uppercase tracking-[0.25em] text-xs font-semibold">
                  Memento Curated
                </span>
                
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tighter leading-none text-zinc-100">
                  Luxury within <br />
                  <span className="text-gold-400 relative inline-block">
                    your reach.
                    <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gold-400/30" />
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-[60ch]">
                  Jewelry is more than just an accessory—it's a way to express yourself and celebrate life's special moments. We handpick stylish and timeless pieces offering the perfect balance of quality, elegance, and affordability.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link 
                    href="#collections" 
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gold-400 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all hover:bg-gold-400/90 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)] active:translate-y-[1px] active:scale-[0.98]"
                  >
                    View Gallery
                  </Link>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-transparent border border-zinc-800 text-zinc-300 font-semibold uppercase tracking-wider text-xs transition-all hover:border-gold-400 hover:text-gold-400 active:translate-y-[1px] active:scale-[0.98]"
                  >
                    Add Custom Piece
                  </button>
                </div>
              </div>
              
              {/* Right Column (Transparent Logo Showcase) */}
              <div className="lg:col-span-5 relative w-full aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-gold-400/5 blur-[120px] rounded-full -z-10" />
                <div className="absolute w-[80%] h-[80%] border border-gold-400/10 rounded-full animate-pulse -z-10" />
                <Image
                  src="/logo.png"
                  alt="Memento Curated jewelry"
                  width={500}
                  height={500}
                  className="relative z-10 w-[85%] max-w-[420px] h-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />
              </div>
              
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

            {/* Showcase Grid with Liquid Glass Refraction Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="group rounded-3xl bg-zinc-900/40 border border-white/10 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-gold-400/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
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
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                <span className="text-zinc-500 text-sm">No custom pieces found in this category.</span>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Add Product Showcase Modal / Drawer for Client Preview */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
            <div className="w-full max-w-md p-8 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-[2xl] relative">
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-2xl font-bold text-zinc-100 mb-6">Add New Collection Piece</h3>
              
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Piece Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Athena Opal Necklace"
                    className="h-11 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Category</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="h-11 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      <option value="Rings">Rings</option>
                      <option value="Necklaces">Necklaces</option>
                      <option value="Bracelets">Bracelets</option>
                      <option value="Earrings">Earrings</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Price</label>
                    <input
                      type="text"
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="e.g. $195"
                      className="h-11 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Description</label>
                  <textarea
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    placeholder="Brief description of materials and design..."
                    rows={3}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-gold-400 text-zinc-950 font-bold uppercase tracking-wider text-xs transition-all hover:bg-gold-500 active:scale-[0.98]"
                >
                  Publish Piece
                </button>
              </form>
            </div>
          </div>
        )}
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
