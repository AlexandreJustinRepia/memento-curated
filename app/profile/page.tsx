"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, Lock, Mail, ChevronRight, Loader2 } from "lucide-react";

type Session = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type ProfileState = {
  id: string;
  email: string;
  name: string;
};

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        if (data?.id) {
          fetchProfile(data.id);
        }
      })
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name ?? "");
        setEmail(data.email ?? "");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to update profile" });
        return;
      }

      setProfile(data);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setChangingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to change password" });
        return;
      }

      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <section className="py-24 border-t border-white/5 bg-zinc-950 relative min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading profile...</span>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="py-24 border-t border-white/5 bg-zinc-950 relative min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-sm">Please sign in to view your profile.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold-400/90"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 border-t border-white/5 bg-zinc-950 relative">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold block">
              Account
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100">
              My Profile
            </h1>
            <div className="w-20 h-[1px] bg-gold-400" />
          </div>

          {message && (
            <div
              className={`mb-8 rounded-2xl border px-6 py-4 text-sm ${
                message.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            <form onSubmit={handleUpdateProfile} className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <User className="h-5 w-5 text-gold-400" />
                  Profile Information
                </h2>

                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                    Username
                  </label>
                  <input
                    ref={nameRef}
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                    Email Address
                  </label>
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gold-400 text-zinc-950 text-sm font-bold uppercase tracking-wider transition-all hover:bg-gold-400/90 active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Changes
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <form onSubmit={handleChangePassword} className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gold-400" />
                  Change Password
                </h2>

                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-300">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400"
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gold-400 text-zinc-950 text-sm font-bold uppercase tracking-wider transition-all hover:bg-gold-400/90 active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Change Password
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/#collections"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/10 bg-zinc-900/40 text-zinc-300 text-sm font-semibold uppercase tracking-wider transition-all hover:border-gold-400/40 hover:text-gold-400 active:scale-[0.98]"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
