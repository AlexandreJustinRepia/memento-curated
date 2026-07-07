"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
            Create account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Join Memento Curated
          </h1>
          <p className="text-sm leading-6 text-zinc-400">
            Sign up for a customer account or start your admin journey with the same simple flow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-zinc-300">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-gold-400/90"
          >
            Create account
          </button>
        </form>

        {submitted && (
          <p className="mt-5 rounded-2xl border border-gold-400/20 bg-gold-400/10 px-4 py-3 text-sm text-gold-400">
            Your sign-up form is ready. Connect it to your auth provider when you are ready.
          </p>
        )}

        <Link
          href="/login"
          className="mt-6 inline-flex text-sm text-zinc-400 transition hover:text-gold-400"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </main>
  );
}
