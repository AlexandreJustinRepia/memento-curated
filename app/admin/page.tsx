"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Toast from "./components/Toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DailyBucket = { date: string; count: number };

type VisitStats = {
  total: number;
  today: number;
  this_week: number;
  daily_7d: DailyBucket[];
  page_filter: string;
};

// ---------------------------------------------------------------------------
// Skeleton shimmer component
// ---------------------------------------------------------------------------
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-pulse rounded-md bg-zinc-800 ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Mini bar-chart driven by real daily_7d data
// ---------------------------------------------------------------------------
function VisitBarChart({ daily }: { daily: DailyBucket[] }) {
  // Sort oldest → newest, pad to 7 bars
  const sorted = [...daily].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const max = Math.max(...sorted.map((d) => d.count), 1);

  return (
    <div className="mt-6 flex h-48 items-end gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
      {sorted.length === 0
        ? // Placeholder bars while empty
          [42, 68, 54, 81, 76, 95, 110].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-xl bg-zinc-800 animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))
        : sorted.map((bucket) => {
            const pct = Math.max((bucket.count / max) * 100, 4);
            const label = new Date(bucket.date).toLocaleDateString("en-US", {
              weekday: "short",
            });
            return (
              <div
                key={bucket.date}
                className="group relative flex flex-1 flex-col items-center justify-end h-full"
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-xl border border-white/10 bg-zinc-900 px-2 py-1 text-center text-xs text-zinc-200 shadow-lg group-hover:block whitespace-nowrap">
                  <span className="block font-semibold text-gold-400">
                    {bucket.count.toLocaleString()}
                  </span>
                  <span className="text-zinc-500">{label}</span>
                </div>

                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-gold-500 to-gold-400 transition-all duration-500"
                  style={{ height: `${pct}%` }}
                />
              </div>
            );
          })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static mock stats (orders, customers, conversion)
// ---------------------------------------------------------------------------
const STATIC_STATS = [
  { label: "Orders", value: "86", change: "+8.1%", tone: "text-gold-400" },
  { label: "Customers", value: "324", change: "+5.2%", tone: "text-sky-400" },
  { label: "Conversion", value: "4.8%", change: "+0.6%", tone: "text-violet-400" },
];

const recentActivity = [
  { title: "New signup", detail: "A new customer joined from mobile", time: "2 min ago" },
  { title: "Inventory update", detail: "Bracelet collection refreshed", time: "18 min ago" },
  { title: "Peak traffic", detail: "Visits increased after launch", time: "1 hr ago" },
];

const quickActions = [
  { label: "Add collection", hint: "Launch a new capsule", href: "/admin/products" },
  { label: "Review orders", hint: "Track pending requests", action: "orders" },
  { label: "View audience", hint: "Inspect recent visitors", href: "/admin" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const [visits, setVisits] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/visits");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: VisitStats = await res.json();
        setVisits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derived change label for visit card (today vs yesterday not tracked yet — show this_week)
  const visitChange =
    visits && visits.this_week > 0
      ? `${visits.this_week.toLocaleString()} this week`
      : null;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              Admin panel
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Curated performance at a glance
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              A refined overview of visits, orders, and customer activity for
              the Memento Curated experience.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-gold-400/40 hover:text-gold-400"
          >
            View storefront
          </Link>
        </div>
      </header>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Visits — live from Supabase */}
        <div className="rounded-[1.5rem] border border-white/10 bg-zinc-900/70 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
          {/* Live indicator dot */}
          <span className="absolute right-4 top-4 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <p className="text-sm text-zinc-400">Visits</p>

          {error ? (
            <p className="mt-3 text-sm text-red-400">Failed to load</p>
          ) : loading ? (
            <>
              <Shimmer className="mt-3 h-8 w-24" />
              <Shimmer className="mt-2 h-4 w-16" />
            </>
          ) : (
            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-semibold tracking-tight text-white">
                {(visits?.total ?? 0).toLocaleString()}
              </p>
              <span className="text-sm font-medium text-emerald-400">
                {visits?.today != null
                  ? `+${visits.today.toLocaleString()} today`
                  : "—"}
              </span>
            </div>
          )}

          {!loading && !error && visitChange && (
            <p className="mt-1 text-xs text-zinc-500">{visitChange}</p>
          )}
        </div>

        {/* Static stats */}
        {STATIC_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.5rem] border border-white/10 bg-zinc-900/70 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
              <span className={`text-sm font-medium ${stat.tone}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Charts + Side Panel ─────────────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Traffic chart */}
        <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Traffic overview
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {loading
                  ? "Loading visit data…"
                  : error
                  ? "Could not load visit data"
                  : "Visits over the last 7 days"}
              </p>
            </div>
            <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Live
            </span>
          </div>

          {loading ? (
            <div className="mt-6 flex h-48 items-end gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
              {[42, 68, 54, 81, 76, 95, 110].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-xl bg-zinc-800 animate-pulse"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          ) : (
            <VisitBarChart daily={visits?.daily_7d ?? []} />
          )}

          {/* Today / This week summary row */}
          {!loading && !error && visits && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Today", value: visits.today },
                { label: "This Week", value: visits.this_week },
                { label: "All Time", value: visits.total },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 px-3 py-3 text-center"
                >
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <p className="text-sm font-semibold text-white">Quick actions</p>
            <div className="mt-4 space-y-3">
              {quickActions.map((item) => {
                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/70 px-3 py-3 text-left transition hover:border-gold-400/20 hover:bg-gold-400/10"
                    >
                      <span>
                        <span className="block text-sm font-medium text-white">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm text-zinc-400">
                          {item.hint}
                        </span>
                      </span>
                      <span className="text-sm text-gold-400">→</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setToast("Orders management coming soon")}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/70 px-3 py-3 text-left transition hover:border-gold-400/20 hover:bg-gold-400/10"
                  >
                    <span>
                      <span className="block text-sm font-medium text-white">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-sm text-zinc-400">
                        {item.hint}
                      </span>
                    </span>
                    <span className="text-sm text-gold-400">→</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <p className="text-sm font-semibold text-white">Recent activity</p>
            <div className="mt-4 space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-zinc-950/70 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <span className="text-xs text-zinc-500">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
