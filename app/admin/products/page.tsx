"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ImagePicker from "../components/ImagePicker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
};

type FormState = {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: "Rings",
  price: 0,
  stock: 0,
  image_url: "",
};

const CATEGORIES = ["Rings", "Necklaces", "Bracelets", "Earrings", "Uncategorized"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Shimmer() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 w-full animate-pulse rounded-[1.5rem] bg-zinc-800"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const ITEMS_PER_PAGE = 6;

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const visible = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchProducts();
      setForm(EMPTY_FORM);
      setCurrentPage(1);
      setIsCreateOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  // ── Update ───────────────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchProducts();
      setSelectedProduct(null);
      setIsEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedProduct) return;
    if (!confirm(`Delete "${selectedProduct.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchProducts();
      setSelectedProduct(null);
      setIsEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  // ── Open product detail ──────────────────────────────────────────────────
  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setForm({
      name:        p.name,
      description: p.description ?? "",
      category:    p.category,
      price:       p.price,
      stock:       p.stock,
      image_url:   p.image_url ?? "",
    });
    setIsEditing(false);
  };

  // ---------------------------------------------------------------------------
  // Shared form fields JSX (reused in both create and edit modals)
  // ---------------------------------------------------------------------------
  const FormFields = (
    <>
      {/* Image — picker: storage library, upload, or URL */}
      <ImagePicker
        value={form.image_url}
        onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
      />

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Aurelia Pearl Drop Earrings"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-zinc-300">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-300">Description</label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="A rich, crafted piece…"
          className="mt-2 w-full rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
        />
      </div>

      {/* Price + Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Price ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Stock</label>
          <input
            type="number"
            min={0}
            required
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
          />
        </div>
      </div>
    </>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Products</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Add and manage your catalog
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Add product details, stock, and pricing in one place for quick store updates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400"
            >
              Back to dashboard
            </Link>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FORM); setIsCreateOpen(true); }}
              className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
            >
              Add product
            </button>
          </div>
        </div>
      </header>

      {/* ── Product list ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Product catalog</p>
              <p className="mt-1 text-sm text-zinc-400">
                Preview the latest products added to your store.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search products"
                className="w-full min-w-[220px] rounded-full border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400 sm:w-72"
              />
              <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                {loading ? "…" : `${filtered.length} results`}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <Shimmer />
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}{" "}
                <button onClick={fetchProducts} className="underline hover:text-red-300">
                  Retry
                </button>
              </div>
            ) : visible.length === 0 ? (
              <p className="text-center py-12 text-sm text-zinc-500">No products found.</p>
            ) : (
              visible.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openProduct(product)}
                  className="grid w-full gap-4 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-4 text-left transition hover:border-gold-400/30 hover:bg-zinc-950 sm:grid-cols-[96px_1fr] sm:items-stretch"
                >
                  <div className="h-24 w-full overflow-hidden rounded-[1.5rem] bg-zinc-900/80">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-zinc-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex h-full flex-col justify-between space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{product.name}</p>
                        <p className="mt-1 max-h-10 overflow-hidden text-sm text-zinc-400">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
                          {product.category}
                        </span>
                        <span className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-zinc-400">
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gold-400">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
            <p>Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Create modal ────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Create a product</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Add a new catalog item</h2>
                <p className="mt-2 text-sm text-zinc-400">Fill in the details below to list a new product.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-6 grid gap-5">
              {FormFields}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Add product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── View / Edit / Delete modal ───────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  {isEditing ? "Edit product" : "Product detail"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{selectedProduct.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedProduct(null); setIsEditing(false); }}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-6 grid gap-5">
                {FormFields}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/20 hover:text-gold-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-5">
                {selectedProduct.image_url && (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="h-52 w-full rounded-2xl object-cover border border-white/10"
                  />
                )}
                <div className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 text-sm">
                  <Row label="Category" value={selectedProduct.category} />
                  <Row label="Price"    value={`$${Number(selectedProduct.price).toFixed(2)}`} />
                  <Row label="Stock"    value={`${selectedProduct.stock} units`} />
                  {selectedProduct.description && (
                    <div>
                      <p className="text-zinc-500">Description</p>
                      <p className="mt-1 text-zinc-200">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-full border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {saving ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Small helper for detail rows
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-200 font-medium">{value}</span>
    </div>
  );
}
