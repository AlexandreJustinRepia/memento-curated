"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Drop this into the root layout once.
 * Fires a silent POST to /api/track on every client-side navigation.
 * Admin routes are intentionally excluded.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin pages — only track public storefront
    if (pathname?.startsWith("/admin")) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname ?? "/",
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      }),
      // fire-and-forget — don't await, don't show errors
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  // Renders nothing — purely a side-effect component
  return null;
}
