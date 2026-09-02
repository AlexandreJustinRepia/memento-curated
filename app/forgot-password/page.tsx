"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return clearTimer;
  }, []);

  const startCooldown = (seconds: number) => {
    clearTimer();
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const seconds = retryAfter ? Number(retryAfter) : 60;
        startCooldown(seconds);
        setError(`Too many requests. Please wait ${formatTime(seconds)} before trying again.`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Failed to send reset email";
        if (/rate limit|too many requests/i.test(msg)) {
          const seconds = 60;
          startCooldown(seconds);
          setError(`Too many requests. Please wait ${formatTime(seconds)} before trying again.`);
          return;
        }
        throw new Error(msg);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isRateLimited = cooldown > 0;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100 flex items-center justify-center">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-gold-400/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <span className="font-sans font-bold text-xl tracking-[0.3em] uppercase text-gold-400">
            Memento
          </span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Account recovery
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Forgot password?
            </h1>
            <p className="text-sm leading-6 text-zinc-400">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-emerald-400">Check your email</p>
              <p className="mt-1 text-sm text-zinc-400">
                If an account exists with that email, we&apos;ve sent a password reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              {isRateLimited && (
                <p className="text-center text-xs text-zinc-500">
                  You can request another reset link in <span className="font-semibold text-gold-400">{formatTime(cooldown)}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={loading || isRateLimited}
                className="w-full rounded-full bg-gold-400 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-gold-400/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending…" : isRateLimited ? `Wait ${formatTime(cooldown)}` : "Send reset link"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-zinc-400">
            <p>
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-gold-400 transition hover:text-gold-300">
                Sign in
              </Link>
            </p>
          </div>

          <Link href="/" className="mt-4 inline-flex text-sm text-zinc-500 transition hover:text-gold-400">
            ← Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
