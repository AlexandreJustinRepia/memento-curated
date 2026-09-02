import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const authClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip, { id: "forgot-password", limit: 5, windowMs: 1 * 60 * 1000 });

  if (!rl.success) {
    const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const { email } = body ?? {};

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/admin/users?email=eq.${encodeURIComponent(normalizedEmail)}`,
      {
        headers: {
          apikey: process.env.SUPABASE_SECRET_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY!}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "No account found with that email address." },
        { status: 404 }
      );
    }

    const json = await res.json();
    const users = json?.users ?? [];
    const exists = users.some((u: { email?: string }) => u.email?.toLowerCase() === normalizedEmail);

    if (!exists) {
      return NextResponse.json(
        { error: "No account found with that email address." },
        { status: 404 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "No account found with that email address." },
      { status: 404 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectTo = `${baseUrl}/reset-password`;

  const { error } = await authClient.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (error) {
    const message = error.message ?? "Failed to send reset email";
    const isRateLimited =
      /rate limit/i.test(message) ||
      /too many requests/i.test(message) ||
      error.status === 429;

    if (isRateLimited) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((rl.resetAt - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
          },
        }
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Password reset email sent" });
}
