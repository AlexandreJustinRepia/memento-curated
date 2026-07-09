"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sign up failed");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100 flex items-center justify-center">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-gold-400/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex justify-center">
          <span className="font-sans font-bold text-xl tracking-[0.3em] uppercase text-gold-400">
            Memento
          </span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Create account
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Join Memento Curated
            </h1>
            <p className="text-sm leading-6 text-zinc-400">
              Sign up to browse our curated jewelry collections.
            </p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-emerald-400">Account created!</p>
              <p className="mt-1 text-sm text-zinc-400">Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm" className="text-sm font-medium text-zinc-300">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Repeat your password"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-gold-400/90 disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
            <p>Already have an account?</p>
            <Link href="/login" className="font-semibold text-gold-400 transition hover:text-gold-300">
              Sign in
            </Link>
          </div>

          <Link href="/" className="mt-4 inline-flex text-sm text-zinc-500 transition hover:text-gold-400">
            ← Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
