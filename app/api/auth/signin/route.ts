import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Regular (publishable) client for user-facing sign in
const authClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Admin client to read profile role
const adminClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  // ── Rate limit: 5 sign-in attempts per 15 minutes per IP ────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(ip, { id: "signin", limit: 5, windowMs: 15 * 60 * 1000 });

  if (!rl.success) {
    const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please try again later." },
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
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Fetch the user's profile to get their role
  const { data: profile } = await adminClient
    .from("profiles")
    .select("name, role, status")
    .eq("id", data.user.id)
    .single();

  if (profile?.status === "inactive") {
    return NextResponse.json({ error: "Your account has been deactivated." }, { status: 403 });
  }

  // Set a lightweight session cookie (httpOnly)
  const sessionPayload = JSON.stringify({
    id:    data.user.id,
    email: data.user.email,
    name:  profile?.name ?? "",
    role:  profile?.role ?? "customer",
  });

  const response = NextResponse.json({
    role: profile?.role ?? "customer",
    name: profile?.name ?? "",
  });

  response.cookies.set("mc_session", sessionPayload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
