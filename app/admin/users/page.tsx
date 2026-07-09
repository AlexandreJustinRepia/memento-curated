"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

type ModalState =
  | { type: "create" }
  | { type: "edit"; user: User }
  | { type: "delete"; user: User }
  | { type: null };

type FormState = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  role: "customer",
  status: "active",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Shimmer() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-zinc-800" />
      ))}
    </div>
  );
}

const ROLE_STYLES: Record<string, string> = {
  admin:    "border-gold-400/20 bg-gold-400/10 text-gold-400",
  customer: "border-white/10 text-zinc-300",
};

const STATUS_STYLES: Record<string, string> = {
  active:   "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  pending:  "border-amber-400/20 bg-amber-400/10 text-amber-400",
  inactive: "border-red-400/20 bg-red-400/10 text-red-400",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const ITEMS_PER_PAGE = 8;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const visible = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Modals ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalState({ type: "create" });
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role, status: user.status });
    setModalState({ type: "edit", user });
  };

  const openDelete = (user: User) => setModalState({ type: "delete", user });
  const closeModal = () => setModalState({ type: null });

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchUsers();
      closeModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState.type !== "edit") return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, role: form.role, status: form.status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchUsers();
      closeModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (modalState.type !== "delete") return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${modalState.user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchUsers();
      closeModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Shared form fields
  // ---------------------------------------------------------------------------
  const FormFields = (isCreate: boolean) => (
    <>
      <div className="space-y-2">
        <label htmlFor="u-name" className="text-sm font-medium text-zinc-300">Full name</label>
        <input
          id="u-name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ava Laurent"
          className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="u-email" className="text-sm font-medium text-zinc-300">Email</label>
        <input
          id="u-email"
          type="email"
          required
          disabled={!isCreate}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="user@example.com"
          className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400 disabled:opacity-50"
        />
      </div>

      {isCreate && (
        <div className="space-y-2">
          <label htmlFor="u-pw" className="text-sm font-medium text-zinc-300">Password</label>
          <input
            id="u-pw"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Min. 6 characters"
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="u-role" className="text-sm font-medium text-zinc-300">Role</label>
          <select
            id="u-role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="u-status" className="text-sm font-medium text-zinc-300">Status</label>
          <select
            id="u-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </>
  );

  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Users</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Manage customer accounts
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Add, edit, and remove users from your curated storefront.
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
              onClick={openCreate}
              className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
            >
              Add user
            </button>
          </div>
        </div>
      </header>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <section className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Registered users</p>
            <p className="mt-1 text-sm text-zinc-400">Tap a row to edit or remove an account.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name or email"
              className="w-full rounded-full border border-white/10 bg-zinc-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-gold-400 sm:w-64"
            />
            <span className="shrink-0 rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {loading ? "…" : `${filtered.length} total`}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <Shimmer />
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}{" "}
              <button onClick={fetchUsers} className="underline">Retry</button>
            </div>
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">No users found.</p>
          ) : (
            visible.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Avatar + info */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-gold-400 uppercase">
                    {user.name?.[0] ?? user.email[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name || "—"}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>

                {/* Badges + actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] ${ROLE_STYLES[user.role] ?? ROLE_STYLES.customer}`}>
                    {user.role}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[user.status] ?? STATUS_STYLES.active}`}>
                    {user.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEdit(user)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDelete(user)}
                    className="rounded-full border border-rose-400/20 px-3 py-1.5 text-sm text-rose-300 transition hover:bg-rose-400/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {modalState.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  {modalState.type === "delete" ? "Remove user" : modalState.type === "edit" ? "Edit user" : "Add user"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {modalState.type === "delete"
                    ? "Delete this account?"
                    : modalState.type === "edit"
                    ? "Update account details"
                    : "Create a new account"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
              >
                Close
              </button>
            </div>

            {modalState.type === "delete" ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm leading-6 text-zinc-400">
                  This will permanently delete{" "}
                  <span className="font-semibold text-white">{modalState.user.name || modalState.user.email}</span>{" "}
                  and cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDelete} disabled={saving} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60">
                    {saving ? "Deleting…" : "Delete user"}
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={modalState.type === "edit" ? handleUpdate : handleCreate}
                className="mt-6 space-y-4"
              >
                {FormFields(modalState.type === "create")}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-60">
                    {saving ? "Saving…" : modalState.type === "edit" ? "Save changes" : "Create user"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
