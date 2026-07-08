"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Pagination from "../components/Pagination";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

type ModalState =
  | { type: "create" | "edit"; user?: User | null }
  | { type: "delete"; user: User }
  | { type: null };

const initialUsers: User[] = [
  { id: 1, name: "Ava Laurent", email: "ava@luxury.com", role: "Customer", status: "Active" },
  { id: 2, name: "Mina Sol", email: "mina@studio.com", role: "Admin", status: "Active" },
  { id: 3, name: "Noor Hale", email: "noor@atelier.com", role: "Customer", status: "Pending" },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("users");
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const manageOpen = isManageOpen || activeSection === "users" || activeSection === "products";
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Customer",
    status: "Active",
  });

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));

  const currentUsers = useMemo(
    () => users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, users],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openCreate = () => {
    setForm({ name: "", email: "", role: "Customer", status: "Active" });
    setModalState({ type: "create" });
  };

  const openEdit = (user: User) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setModalState({ type: "edit", user });
  };

  const openDelete = (user: User) => {
    setModalState({ type: "delete", user });
  };

  const closeModal = () => setModalState({ type: null });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (modalState.type === "edit" && modalState.user) {
      setUsers((current) =>
        current.map((user) =>
          user.id === modalState.user?.id
            ? { ...user, ...form }
            : user,
        ),
      );
    } else {
      setUsers((current) => [
        ...current,
        {
          id: Date.now(),
          ...form,
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (modalState.type === "delete") {
      setUsers((current) => current.filter((user) => user.id !== modalState.user.id));
    }

    closeModal();
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

        <aside className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-72 rounded-r-[2rem] border-r border-white/10 bg-zinc-900/95 p-4 pt-20 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-4 lg:w-72 lg:self-start lg:translate-x-0 lg:rounded-[2rem] lg:border lg:bg-zinc-900/80 lg:pt-4 ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
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
                  onClick={() => {
                    setActiveSection("dashboard");
                    setIsManageOpen(false);
                  }}
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
                    onClick={() => {
                      setActiveSection("users");
                      setIsMenuOpen(false);
                    }}
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
                    onClick={() => {
                      setActiveSection("products");
                      setIsMenuOpen(false);
                    }}
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
                    className={`flex items-center rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                      activeSection === "dashboard"
                        ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                        : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                    }`}
                    onClick={() => {
                      setActiveSection("dashboard");
                      setIsMenuOpen(false);
                      setIsManageOpen(false);
                    }}
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
                      className={`block rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        activeSection === "users"
                          ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                          : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                      }`}
                      onClick={() => {
                        setActiveSection("users");
                        setIsMenuOpen(false);
                      }}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/products"
                      className={`block rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        activeSection === "products"
                          ? "border-gold-400/30 bg-gold-400/10 text-gold-400"
                          : "border-white/10 text-zinc-300 hover:border-gold-400/20 hover:bg-gold-400/10 hover:text-gold-400"
                      }`}
                      onClick={() => {
                        setActiveSection("products");
                        setIsMenuOpen(false);
                      }}
                    >
                      Products
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-sm font-semibold text-white">User management</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Create, edit, and manage customer and admin accounts in one place.
            </p>
          </div>
        </aside>

        <section className="flex-1 space-y-6 pt-20 lg:pt-0">
          <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Users</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Manage accounts
                </h1>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Create new users instantly and update access details from a clean dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
              >
                Create user
              </button>
            </div>
          </header>

          <section className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Registered users</p>
                <p className="mt-1 text-sm text-zinc-400">Tap on an account to update or remove it.</p>
              </div>
              <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                {users.length} total
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {currentUsers.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
                      {user.role}
                    </span>
                    <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-medium text-gold-400">
                      {user.status}
                    </span>
                    <button type="button" onClick={() => openEdit(user)} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400">
                      Edit
                    </button>
                    <button type="button" onClick={() => openDelete(user)} className="rounded-full border border-rose-400/20 px-3 py-1.5 text-sm text-rose-300 transition hover:bg-rose-400/10">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </section>
        </section>
      </div>

      {modalState.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-zinc-900 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  {modalState.type === "delete" ? "Remove user" : modalState.type === "edit" ? "Edit user" : "Create user"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {modalState.type === "delete" ? "Delete this account?" : modalState.type === "edit" ? "Update account details" : "Add a new account"}
                </h2>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400">
                Close
              </button>
            </div>

            {modalState.type === "delete" ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm leading-6 text-zinc-400">
                  This will remove <span className="font-semibold text-white">{modalState.user.name}</span> from the visible user list.
                </p>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDelete} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400">
                    Delete user
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300" htmlFor="name">Full name</label>
                  <input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400" placeholder="Ava Laurent" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400" placeholder="user@example.com" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300" htmlFor="role">Role</label>
                    <select id="role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400">
                      <option>Customer</option>
                      <option>Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300" htmlFor="status">Status</label>
                    <select id="status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400">
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90">
                    {modalState.type === "edit" ? "Save changes" : "Create user"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
