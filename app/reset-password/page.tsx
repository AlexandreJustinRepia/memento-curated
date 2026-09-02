"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const processResetLink = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const at = params.get("access_token");
      const rt = params.get("refresh_token");

      if (at && rt) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: at,
            refresh_token: rt,
          });
          if (error) {
            setError("Invalid or expired reset link.");
          }
        } catch {
          setError("Invalid or expired reset link.");
        }
      } else {
        setError("Invalid or expired reset link.");
      }
      setVerifying(false);
    };

    processResetLink();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100 flex items-center justify-center">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-gold-400/5 blur-[120px]" />
        </div>
        <div className="w-full max-w-md text-center">
          <p className="text-sm text-zinc-400">Verifying reset link…</p>
        </div>
      </main>
    );
  }

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
              Set new password
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Reset your password
            </h1>
            <p className="text-sm leading-6 text-zinc-400">
              Enter your new password below.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-red-400">Invalid or expired reset link</p>
              <p className="mt-1 text-sm text-zinc-400">
                Please request a new password reset link.
              </p>
            </div>
          ) : success ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-emerald-400">Password updated!</p>
              <p className="mt-1 text-sm text-zinc-400">Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-x-1/2 p-1 text-zinc-500 transition hover:text-gold-400"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0-8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0-8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-gold-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-x-1/2 p-1 text-zinc-500 transition hover:text-gold-400"
                  >
                    {showConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0-8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0-8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                {loading ? "Updating…" : "Update password"}
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
