"use client";

import Link from "next/link";

const stats = [
  { label: "Visits", value: "12,840", change: "+12.4%", tone: "text-emerald-400" },
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
  { label: "Add collection", hint: "Launch a new capsule" },
  { label: "Review orders", hint: "Track pending requests" },
  { label: "View audience", hint: "Inspect recent visitors" },
];

export default function AdminPage() {
  return (
    <>
      <header className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Admin panel</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Curated performance at a glance
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              A refined overview of visits, orders, and customer activity for the Memento Curated experience.
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-zinc-900/70 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
              <span className={`text-sm font-medium ${stat.tone}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Traffic overview</p>
              <p className="mt-1 text-sm text-zinc-400">Placeholder chart for visits this week</p>
            </div>
            <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Live
            </span>
          </div>

          <div className="mt-6 flex h-48 items-end gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
            {[42, 68, 54, 81, 76, 95, 110].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-gold-500 to-gold-400" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <p className="text-sm font-semibold text-white">Quick actions</p>
            <div className="mt-4 space-y-3">
              {quickActions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/70 px-3 py-3 text-left transition hover:border-gold-400/20 hover:bg-gold-400/10"
                >
                  <span>
                    <span className="block text-sm font-medium text-white">{item.label}</span>
                    <span className="mt-1 block text-sm text-zinc-400">{item.hint}</span>
                  </span>
                  <span className="text-sm text-gold-400">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <p className="text-sm font-semibold text-white">Recent activity</p>
            <div className="mt-4 space-y-3">
              {recentActivity.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <span className="text-xs text-zinc-500">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
