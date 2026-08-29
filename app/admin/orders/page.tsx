"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Toast from "../components/Toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  product_name: string;
  avg_rating: number | null;
  rating_count: number;
  total_sales: number;
  current_stock: number;
};

type Order = {
  id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
};

type ProductOption = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusTone(status: string) {
  switch (status) {
    case "completed":
      return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
    case "pending":
      return "text-amber-400 border-amber-400/20 bg-amber-400/10";
    case "cancelled":
      return "text-red-400 border-red-400/20 bg-red-400/10";
    default:
      return "text-zinc-300 border-white/10 bg-zinc-950/80";
  }
}

function Shimmer() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-28 w-full animate-pulse rounded-[1.5rem] bg-zinc-800"
        />
      ))}
    </div>
  );
}

function StarRating({ value, count }: { value: number | null; count: number }) {
  if (!value || count === 0) return null;
  return (
    <span className="text-xs font-medium text-gold-400">
      ★ {value.toFixed(1)} <span className="text-zinc-500">({count})</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Product Picker Modal
// ---------------------------------------------------------------------------
function ProductPickerModal({
  products,
  onClose,
  onSelect,
}: {
  products: ProductOption[];
  onClose: () => void;
  onSelect: (product: ProductOption) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[85dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Select a product
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Choose from catalog</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
          >
            Close
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="mt-6 w-full rounded-full border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => !isOutOfStock && onSelect(product)}
                className={`rounded-[1.5rem] border p-3 text-left transition ${
                  isOutOfStock
                    ? "border-white/5 bg-zinc-900/30 opacity-60 cursor-not-allowed"
                    : "border-white/10 bg-zinc-950/70 hover:border-gold-400/30 hover:bg-zinc-950"
                }`}
                disabled={isOutOfStock}
              >
                <div className="h-36 w-full overflow-hidden rounded-[1.25rem] bg-zinc-900/80">
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
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-white">{product.name}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {product.description ?? "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gold-400">
                      {formatCurrency(product.price)}
                    </p>
                    <span className={`text-xs font-medium ${isOutOfStock ? "text-red-400" : "text-emerald-400"}`}>
                      {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-zinc-500">No products found.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [requestingRatings, setRequestingRatings] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  // Create order state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<{ product_id: number; quantity: number; price: number; name: string; image_url: string | null; stock: number }[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const ITEMS_PER_PAGE = 8;

  const closeToast = useCallback(() => setToast(null), []);

  // ── Fetch orders ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Fetch products for picker ─────────────────────────────────────────────
  useEffect(() => {
    if (!isCreateOpen) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list.map((p: { id: number; name: string; price: number; image_url: string | null; description: string | null; stock: number }) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image_url: p.image_url,
          description: p.description,
          stock: Number(p.stock),
        })));
      })
      .catch(() => setProducts([]));
  }, [isCreateOpen]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter((o) =>
      o.user_name.toLowerCase().includes(q) ||
      o.user_email.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.items.some((item) => item.product_name.toLowerCase().includes(q))
    );
  }, [orders, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const visible = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ── Open order detail ────────────────────────────────────────────────────
  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(false);
    setStatusDraft(order.status);
    setEmailMessage("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || statusDraft === selectedOrder.status) {
      setEditingStatus(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusDraft }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to update status");
      setToast("Order status updated.");
      setSelectedOrder((prev) => (prev ? { ...prev, status: statusDraft } : null));
      setEditingStatus(false);
      fetchOrders();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const handleSendEmail = async () => {
    if (!selectedOrder) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: emailMessage }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to send email");
      setToast("Order confirmation email sent.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRequestRatings = async () => {
    if (!selectedOrder) return;
    setRequestingRatings(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestRatings: true, message: emailMessage }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to send rating request");
      setToast("Rating request email sent to customer.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to send rating request");
    } finally {
      setRequestingRatings(false);
    }
  };

  // ── Add product from picker ──────────────────────────────────────────────
  const handleSelectProduct = (product: ProductOption) => {
    if (product.stock <= 0) {
      setToast("This product is out of stock.");
      return;
    }
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setToast(`Maximum stock reached for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          quantity: 1,
          price: product.price,
          name: product.name,
          image_url: product.image_url,
          stock: product.stock,
        },
      ];
    });
    setIsPickerOpen(false);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, qty: number) => {
    if (qty < 1) return;
    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const product = products.find((p) => p.id === item.product_id);
        const maxStock = product?.stock ?? item.stock ?? 99;
        return { ...item, quantity: Math.min(qty, maxStock) };
      })
    );
  };

  const orderTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Submit order ─────────────────────────────────────────────────────────
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || orderItems.length === 0) {
      setToast("Please fill in customer details and add at least one product.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: customerName.trim(),
          user_email: customerEmail.trim(),
          status: orderStatus,
          items: orderItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create order");
      setToast("Order created successfully.");
      setIsCreateOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setOrderStatus("pending");
      setOrderItems([]);
      setQuantity(1);
      fetchOrders();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Toast message={toast} onClose={closeToast} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Orders
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Order management
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Track customer purchases, linked products, and sales performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {loading ? "…" : `${filtered.length} orders`}
            </span>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
            >
              Create Order
            </button>
          </div>
        </div>
      </header>

      {/* ── Orders list ─────────────────────────────────────────────────── */}
      <section className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">All orders</p>
            <p className="mt-1 text-sm text-zinc-400">
              Click an order to view product details, ratings, and sales.
            </p>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products, customers…"
            className="w-full min-w-[220px] rounded-full border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400 sm:w-80"
          />
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <Shimmer />
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}{" "}
              <button onClick={fetchOrders} className="underline hover:text-red-300">
                Retry
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="text-center py-12 text-sm text-zinc-500">No orders found.</p>
          ) : (
            visible.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrder(order)}
                className="grid w-full gap-4 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-4 text-left transition hover:border-gold-400/30 hover:bg-zinc-950 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      #{order.id} — {order.user_name}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${statusTone(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{order.user_email}</p>
                  <p className="text-xs text-zinc-500">{formatDate(order.created_at)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="rounded-full border border-white/10 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                      >
                        {item.product_name} ×{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="rounded-full border border-white/10 bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gold-400">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
            <p>
              Page {currentPage} of {totalPages}
            </p>
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
        )}
      </section>

      {/* ── Create order modal ───────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  Create order
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">New customer order</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Assign an order to a customer and add products.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-6 grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Customer name</label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jane Doe"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Customer email</label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                <p className="text-sm font-semibold text-white mb-3">Add products</p>

                {orderItems.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {orderItems.map((item, index) => {
                      const product = products.find((p) => p.id === item.product_id);
                      const maxStock = product?.stock ?? item.stock ?? 99;
                      const isMaxed = item.quantity >= maxStock;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-2"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900/80">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-zinc-500">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm text-zinc-200">{item.name}</p>
                            <p className="text-xs text-zinc-500">
                              {formatCurrency(item.price)} each
                            </p>
                            <p className={`text-xs ${isMaxed ? "text-red-400" : "text-zinc-500"}`}>
                              {isMaxed ? "Max stock reached" : `${maxStock - item.quantity} left`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-zinc-300 transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                              disabled={isMaxed}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-zinc-300 transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <p className="w-20 text-right text-sm font-semibold text-gold-400">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="ml-1 text-xs text-red-400 transition hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                    <p className="text-sm font-semibold text-gold-400 text-right">
                      Total: {formatCurrency(orderTotal)}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full rounded-2xl border border-dashed border-white/10 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/30 hover:text-gold-400"
                >
                  + Select product from catalog
                </button>
              </div>

              <button
                type="submit"
                disabled={saving || orderItems.length === 0}
                className="inline-flex w-full items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-60"
              >
                {saving ? "Creating…" : "Create order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Product picker modal ─────────────────────────────────────────── */}
      {isPickerOpen && (
        <ProductPickerModal
          products={products}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleSelectProduct}
        />
      )}

      {/* ── Order detail modal ───────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  Order detail
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  #{selectedOrder.id} — {selectedOrder.user_name}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">{selectedOrder.user_email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                <p className="text-xs text-zinc-500 mb-3">Status</p>
                {editingStatus ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {["pending", "completed", "cancelled"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatusDraft(status)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-semibold capitalize transition ${
                            statusDraft === status
                              ? "border-gold-400 bg-gold-400/10 text-gold-400"
                              : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-gold-400/20 hover:text-gold-400"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleStatusUpdate}
                        disabled={statusDraft === selectedOrder.status}
                        className="flex-1 rounded-full bg-gold-400 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingStatus(false); setStatusDraft(selectedOrder?.status ?? ""); }}
                        className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-gold-400/20 hover:text-gold-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingStatus(true)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${statusTone(selectedOrder.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize">{selectedOrder.status}</span>
                      <span className="text-xs opacity-70">Edit →</span>
                    </div>
                  </button>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 text-center">
                <p className="text-xs text-zinc-500">Total</p>
                <p className="mt-1 text-sm font-semibold text-gold-400">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 text-center">
                <p className="text-xs text-zinc-500">Date</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="w-full">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Custom message <span className="text-zinc-500">(optional)</span>
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a personal note to the customer…"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/10 px-4 py-2 text-sm font-semibold text-gold-400 transition hover:border-gold-400/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingEmail ? "Sending…" : "Send Confirmation Email"}
              </button>
              {selectedOrder.status === "completed" && (
                <button
                  type="button"
                  onClick={handleRequestRatings}
                  disabled={requestingRatings}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:border-emerald-400/40 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {requestingRatings ? "Sending…" : "Request Ratings"}
                </button>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-white">Order items</p>
              {selectedOrder.items.map((item) => {
                const isOutOfStock = item.current_stock <= 0;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.product_name}</p>
                        <p className="text-xs text-zinc-500">
                          Qty: {item.quantity} · Unit price: {formatCurrency(item.price)}
                        </p>
                        <p className={`text-xs ${isOutOfStock ? "text-red-400" : "text-zinc-500"}`}>
                          Stock left: {item.current_stock}
                          {isOutOfStock && " — Out of stock"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating value={item.avg_rating} count={item.rating_count} />
                        <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-2 py-0.5 text-[10px] font-semibold text-gold-400">
                          {item.total_sales} sold
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
