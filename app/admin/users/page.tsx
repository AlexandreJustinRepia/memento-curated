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
  const [modalState, setModalState] = useState<ModalState>({ type: null });
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
    <>
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

      <section className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>

      {modalState.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                  {modalState.type === "delete" ? "Remove user" : modalState.type === "edit" ? "Edit user" : "Add user"}
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
                  <label className="text-sm font-medium text-zinc-300" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="Ava Laurent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300" htmlFor="role">
                      Role
                    </label>
                    <select
                      id="role"
                      value={form.role}
                      onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    >
                      <option>Customer</option>
                      <option>Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300" htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    >
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
                  >
                    {modalState.type === "edit" ? "Save changes" : "Create user"}
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
