"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: number;
  image?: string;
  name: string;
  description: string;
  stock: number;
  price: number;
};

const initialProducts: Product[] = [
  {
    id: 1,
    image: "",
    name: "Golden Candle",
    description: "Warm amber fragrance with luxurious packaging.",
    stock: 24,
    price: 68,
  },
  {
    id: 2,
    image: "",
    name: "Silk Bracelet",
    description: "Elegant artisan piece for daily wear.",
    stock: 14,
    price: 42,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState({
    image: "",
    name: "",
    description: "",
    stock: 1,
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const visibleProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, filteredProducts],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setProducts((current) => [
      {
        id: Date.now(),
        image: form.image,
        name: form.name,
        description: form.description,
        stock: form.stock,
        price: form.price,
      },
      ...current,
    ]);

    setForm({ image: "", name: "", description: "", stock: 1, price: 0 });
    setImagePreview("");
    setCurrentPage(1);
    setIsCreateOpen(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setForm((current) => ({ ...current, image: objectUrl }));
      setImagePreview(objectUrl);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      image: product.image ?? "",
      name: product.name,
      description: product.description,
      stock: product.stock,
      price: product.price,
    });
    setImagePreview(product.image ?? "");
    setIsEditingProduct(false);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setIsEditingProduct(false);
    setImagePreview("");
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              image: form.image,
              name: form.name,
              description: form.description,
              stock: form.stock,
              price: form.price,
            }
          : product,
      ),
    );

    closeProduct();
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    setProducts((current) => current.filter((product) => product.id !== selectedProduct.id));
    closeProduct();
  };

  return (
    <>
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
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
            >
              Add product
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Product catalog</p>
              <p className="mt-1 text-sm text-zinc-400">Preview the latest products added to your store.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products"
                  className="w-full min-w-[220px] rounded-full border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400 sm:w-72"
                />
              </label>
              <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                {filteredProducts.length} results
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => openProduct(product)}
                className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-4 text-left sm:grid-cols-[96px_1fr] sm:items-stretch transition hover:border-gold-400/30 hover:bg-zinc-950"
              >
                <div className="h-24 w-full overflow-hidden rounded-[1.5rem] bg-zinc-900/80">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-zinc-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex flex-col justify-between h-full">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400 max-h-12 overflow-hidden">{product.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gold-400">${product.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
            <p>Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Create a product</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Add a new catalog item</h2>
                <p className="mt-2 text-sm text-zinc-400">Upload the product image, name, description, stock count and price.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Image</label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="cursor-pointer rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400">
                    Select image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Product preview" className="h-16 w-16 rounded-2xl object-cover" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  placeholder="Memento satin candle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  required
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  placeholder="A rich, crafted scent for luxurious evenings."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) }))}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Price</label>
                  <div className="mt-2 flex rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3">
                    <span className="mr-2 self-center text-zinc-400">$</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
                      required
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
              >
                Add product
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
