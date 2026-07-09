"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string | null;
  onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-6" role="status" aria-live="polite">
      <div className="rounded-2xl border border-emerald-400/20 bg-zinc-950/95 p-4 text-sm text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-zinc-950">
            OK
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">Success</p>
            <p className="mt-1 text-zinc-300">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 text-lg leading-none text-zinc-500 transition hover:text-white"
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}